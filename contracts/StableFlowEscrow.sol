// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StableFlowEscrow V4
 * @notice Escrow contract for milestone-based USDC payments.
 * @dev Per-milestone dispute resolution, objection period, seller protection, configurable fees.
 */
contract StableFlowEscrow is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public platformWallet;
    address public arbitrator;

    // ──── Configurable Parameters ────
    uint256 public platformFeeBps = 200; // 2% = 200 basis points
    uint256 public constant MAX_FEE_BPS = 1000; // 10% max

    uint256 public constant DISPUTE_TIMEOUT = 30 days;
    uint256 public constant DELIVERY_CONFIRM_TIMEOUT = 14 days;
    uint256 public constant OBJECTION_PERIOD = 2 days; // S2: 48h objection window
    uint256 public constant ARBITRATOR_TIMEOUT = 7 days; // S4: 7 days for arbitrator to act
    uint256 public constant EMERGENCY_TIMEOUT = 90 days; // S4: 90 days emergency exit
    uint256 public constant MIN_ORDER_AMOUNT = 1e6; // 1 USDC minimum

    // ──── Data Structures ────

    enum MilestoneStatus { None, Funded, Delivered, Released, Disputed, PendingResolution }

    struct Order {
        uint256 id;
        address buyer;
        address seller;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        uint256 createdAt;
        bool completed;
    }

    struct Milestone {
        uint256 amount;
        MilestoneStatus status;
        uint256 deliveredAt;
        uint256 releasedAt;
        uint256 disputedAt;
        address disputeInitiator;      // S3: who initiated dispute
        // S2: Pending resolution data
        address pendingRecipient;
        uint256 pendingPercent;
        uint256 resolvedAt;            // when resolution was proposed
    }

    // ──── State ────

    uint256 public nextOrderId;
    uint256 public totalEscrowed; // tracks total USDC held in escrow
    mapping(uint256 => Order) public orders;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    // ──── Events ────

    event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 totalAmount, uint256 milestoneCount);
    event MilestoneDelivered(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed seller, uint256 timestamp);
    event MilestoneReleased(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed buyer, uint256 amount, uint256 timestamp);
    event MilestoneDisputed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed party, uint256 timestamp);
    event OrderCompleted(uint256 indexed orderId, uint256 totalReleased);
    event ResolutionProposed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 percent);
    event ResolutionFinalized(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 recipientAmount, uint256 otherAmount);
    event ResolutionAppealed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed appellant);
    event MilestoneTimeoutRefund(uint256 indexed orderId, uint256 indexed milestoneIndex, uint256 refundAmount);
    event MilestoneAutoReleased(uint256 indexed orderId, uint256 indexed milestoneIndex, uint256 amount);
    event ArbitratorUpdated(address indexed oldArbitrator, address indexed newArbitrator);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    // ──── Modifiers ────

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Not arbitrator");
        _;
    }

    // ──── Constructor ────

    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        usdc = IERC20(_usdc);
        platformWallet = _platformWallet;
    }

    // ──── Admin Functions ────

    function setArbitrator(address _newArbitrator) external onlyOwner {
        require(_newArbitrator != address(0), "Invalid address");
        emit ArbitratorUpdated(arbitrator, _newArbitrator);
        arbitrator = _newArbitrator;
    }

    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        emit PlatformWalletUpdated(platformWallet, _newWallet);
        platformWallet = _newWallet;
    }

    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee exceeds maximum");
        emit PlatformFeeUpdated(platformFeeBps, _newFeeBps);
        platformFeeBps = _newFeeBps;
    }

    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    /**
     * @notice Emergency withdraw only the excess USDC not tracked by escrow.
     *         This handles cases where tokens are sent directly to the contract
     *         outside of createOrder (accidental transfers, airdrops, etc).
     *         Owner cannot touch funds actively held in escrow.
     */
    function emergencyWithdraw(address _to) external onlyOwner nonReentrant {
        require(_to != address(0), "Invalid recipient");
        uint256 balance = usdc.balanceOf(address(this));
        uint256 excess = balance - totalEscrowed;
        require(excess > 0, "No excess funds");

        usdc.safeTransfer(_to, excess);
        emit EmergencyWithdrawal(address(usdc), _to, excess);
    }

    // ──── Core Functions ────

    function createOrder(
        address _seller,
        uint256 _amount,
        uint256[] calldata _milestonePercents
    ) external nonReentrant whenNotPaused returns (uint256 orderId) {
        require(_seller != address(0) && _seller != msg.sender, "Invalid seller");
        require(_amount >= MIN_ORDER_AMOUNT, "Below minimum order amount");
        require(_milestonePercents.length > 0 && _milestonePercents.length <= 10, "Invalid milestone count");

        uint256 totalPercent = 0;
        for (uint256 i = 0; i < _milestonePercents.length; i++) {
            require(_milestonePercents[i] > 0, "Milestone percent must be > 0");
            totalPercent += _milestonePercents[i];
        }
        require(totalPercent == 10000, "Percents must sum to 10000 (100%)");

        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        totalEscrowed += _amount;

        orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            buyer: msg.sender,
            seller: _seller,
            totalAmount: _amount,
            releasedAmount: 0,
            milestoneCount: _milestonePercents.length,
            createdAt: block.timestamp,
            completed: false
        });

        uint256 allocated = 0;
        for (uint256 i = 0; i < _milestonePercents.length; i++) {
            uint256 msAmount;
            if (i == _milestonePercents.length - 1) {
                msAmount = _amount - allocated;
            } else {
                msAmount = (_amount * _milestonePercents[i]) / 10000;
                allocated += msAmount;
            }

            milestones[orderId][i] = Milestone({
                amount: msAmount,
                status: MilestoneStatus.Funded,
                deliveredAt: 0,
                releasedAt: 0,
                disputedAt: 0,
                disputeInitiator: address(0),
                pendingRecipient: address(0),
                pendingPercent: 0,
                resolvedAt: 0
            });
        }

        emit OrderCreated(orderId, msg.sender, _seller, _amount, _milestonePercents.length);
    }

    function deliverMilestone(uint256 _orderId, uint256 _index) external whenNotPaused {
        Order storage order = orders[_orderId];
        require(msg.sender == order.seller, "Only seller can deliver");
        require(!order.completed, "Order completed");
        require(_index < order.milestoneCount, "Invalid milestone index");
        require(milestones[_orderId][_index].status == MilestoneStatus.Funded, "Not in Funded status");

        milestones[_orderId][_index].status = MilestoneStatus.Delivered;
        milestones[_orderId][_index].deliveredAt = block.timestamp;

        emit MilestoneDelivered(_orderId, _index, msg.sender, block.timestamp);
    }

    function releaseMilestone(uint256 _orderId, uint256 _index) external nonReentrant whenNotPaused {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer, "Only buyer can release");
        require(!order.completed, "Order completed");
        require(_index < order.milestoneCount, "Invalid milestone index");
        require(milestones[_orderId][_index].status == MilestoneStatus.Delivered, "Not in Delivered status");

        _releaseFunds(_orderId, _index);
    }

    function autoReleaseMilestone(uint256 _orderId, uint256 _index) external nonReentrant whenNotPaused {
        Order storage order = orders[_orderId];
        require(msg.sender == order.seller, "Only seller can call");
        require(!order.completed, "Order completed");
        require(_index < order.milestoneCount, "Invalid milestone index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.Delivered, "Not in Delivered status");
        require(
            block.timestamp >= ms.deliveredAt + DELIVERY_CONFIRM_TIMEOUT,
            "Confirmation timeout not reached"
        );

        _releaseFunds(_orderId, _index);
        emit MilestoneAutoReleased(_orderId, _index, ms.amount);
    }

    // ──── Dispute Functions ────

    /**
     * @notice Either party disputes a delivered milestone. S3: tracks who initiated.
     */
    function disputeMilestone(uint256 _orderId, uint256 _index) external whenNotPaused {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer || msg.sender == order.seller, "Only buyer or seller");
        require(!order.completed, "Order completed");
        require(_index < order.milestoneCount, "Invalid milestone index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.Delivered, "Not in Delivered status");

        ms.status = MilestoneStatus.Disputed;
        ms.disputedAt = block.timestamp;
        ms.disputeInitiator = msg.sender; // S3: track who started it

        emit MilestoneDisputed(_orderId, _index, msg.sender, block.timestamp);
    }

    // ──── Dispute Resolution (S2: 48h objection period) ────

    /**
     * @notice Arbitrator proposes a resolution. Funds are NOT transferred immediately.
     *         After OBJECTION_PERIOD (48h), either party can finalize.
     */
    function resolveDispute(
        uint256 _orderId,
        uint256 _index,
        address _recipient,
        uint256 _percentToRecipient
    ) external onlyArbitrator {
        Order storage order = orders[_orderId];
        require(_index < order.milestoneCount, "Invalid index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.Disputed, "Not disputed");
        require(
            _recipient == order.buyer || _recipient == order.seller,
            "Recipient must be buyer or seller"
        );
        require(_percentToRecipient <= 10000, "Percent exceeds 100%");

        // S2: Store pending resolution, don't transfer yet
        ms.status = MilestoneStatus.PendingResolution;
        ms.pendingRecipient = _recipient;
        ms.pendingPercent = _percentToRecipient;
        ms.resolvedAt = block.timestamp;

        emit ResolutionProposed(_orderId, _index, _recipient, _percentToRecipient);
    }

    /**
     * @notice Finalize a resolution after the objection period. S2.
     *         Either party can call this after 48h.
     */
    function finalizeResolution(uint256 _orderId, uint256 _index) external nonReentrant {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer || msg.sender == order.seller, "Only buyer or seller");
        require(_index < order.milestoneCount, "Invalid index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.PendingResolution, "Not pending resolution");
        require(
            block.timestamp >= ms.resolvedAt + OBJECTION_PERIOD,
            "Objection period not ended"
        );

        _executeResolution(_orderId, _index);
    }

    /**
     * @notice Either party appeals during objection period. Reverts to Disputed.
     *         Arbitrator must re-adjudicate.
     */
    function appealResolution(uint256 _orderId, uint256 _index) external {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer || msg.sender == order.seller, "Only buyer or seller");
        require(_index < order.milestoneCount, "Invalid index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.PendingResolution, "Not pending resolution");
        require(
            block.timestamp < ms.resolvedAt + OBJECTION_PERIOD,
            "Objection period already ended"
        );

        // Revert to disputed state
        ms.status = MilestoneStatus.Disputed;
        ms.disputedAt = block.timestamp; // Reset dispute timer
        ms.pendingRecipient = address(0);
        ms.pendingPercent = 0;
        ms.resolvedAt = 0;

        emit ResolutionAppealed(_orderId, _index, msg.sender);
    }

    // ──── Timeout Functions (S3 + S4) ────

    /**
     * @notice Claim refund after dispute timeout. S3: behavior depends on who initiated dispute.
     *         - If buyer initiated: buyer gets refund after DISPUTE_TIMEOUT
     *         - If seller initiated: seller gets refund after DISPUTE_TIMEOUT
     *         S4: If no resolution after EMERGENCY_TIMEOUT, 50/50 split.
     */
    function claimTimeoutRefund(uint256 _orderId, uint256 _index) external nonReentrant {
        Order storage order = orders[_orderId];
        require(_index < order.milestoneCount, "Invalid index");
        Milestone storage ms = milestones[_orderId][_index];
        require(ms.status == MilestoneStatus.Disputed, "Not disputed");
        require(ms.disputedAt > 0, "No dispute timestamp");

        // S4: Emergency timeout — 90 days, 50/50 split
        if (block.timestamp >= ms.disputedAt + EMERGENCY_TIMEOUT) {
            _splitFiftyFifty(_orderId, _index);
            return;
        }

        // S3: Normal timeout — refund goes to the party that did NOT initiate dispute
        require(
            block.timestamp >= ms.disputedAt + DISPUTE_TIMEOUT,
            "Timeout not reached"
        );

        address refundRecipient;
        if (ms.disputeInitiator == order.buyer) {
            // Buyer initiated dispute → seller gets refund (seller did the work)
            refundRecipient = order.seller;
        } else {
            // Seller initiated dispute → buyer gets refund (buyer's money back)
            refundRecipient = order.buyer;
        }

        uint256 amount = ms.amount;
        if (refundRecipient == order.seller) {
            uint256 fee = (amount * platformFeeBps) / 10000;
            usdc.safeTransfer(order.seller, amount - fee);
            if (fee > 0) usdc.safeTransfer(platformWallet, fee);
        } else {
            usdc.safeTransfer(order.buyer, amount);
        }

        ms.status = MilestoneStatus.Released;
        ms.releasedAt = block.timestamp;
        order.releasedAmount += amount;
        totalEscrowed -= amount;

        emit MilestoneTimeoutRefund(_orderId, _index, amount);
        _checkOrderCompleted(_orderId);
    }

    // ──── Internal Functions ────

    function _releaseFunds(uint256 _orderId, uint256 _index) internal {
        Order storage order = orders[_orderId];
        Milestone storage ms = milestones[_orderId][_index];
        uint256 amount = ms.amount;
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 sellerAmount = amount - fee;

        ms.status = MilestoneStatus.Released;
        ms.releasedAt = block.timestamp;
        order.releasedAmount += amount;
        totalEscrowed -= amount;

        usdc.safeTransfer(order.seller, sellerAmount);
        if (fee > 0) {
            usdc.safeTransfer(platformWallet, fee);
        }

        emit MilestoneReleased(_orderId, _index, order.buyer, amount, block.timestamp);
        _checkOrderCompleted(_orderId);
    }

    function _executeResolution(uint256 _orderId, uint256 _index) internal {
        Order storage order = orders[_orderId];
        Milestone storage ms = milestones[_orderId][_index];

        uint256 msAmount = ms.amount;
        uint256 recipientAmount = (msAmount * ms.pendingPercent) / 10000;
        uint256 otherAmount = msAmount - recipientAmount;
        address recipient = ms.pendingRecipient;
        address otherParty = (recipient == order.seller) ? order.buyer : order.seller;

        // Transfer to recipient
        if (recipient == order.seller) {
            uint256 fee = (recipientAmount * platformFeeBps) / 10000;
            usdc.safeTransfer(recipient, recipientAmount - fee);
            if (fee > 0) usdc.safeTransfer(platformWallet, fee);
        } else {
            usdc.safeTransfer(recipient, recipientAmount);
        }

        // Transfer to other party
        if (otherAmount > 0) {
            usdc.safeTransfer(otherParty, otherAmount);
        }

        ms.status = MilestoneStatus.Released;
        ms.releasedAt = block.timestamp;
        order.releasedAmount += msAmount;
        totalEscrowed -= msAmount;

        emit ResolutionFinalized(_orderId, _index, recipient, recipientAmount, otherAmount);
        _checkOrderCompleted(_orderId);
    }

    function _splitFiftyFifty(uint256 _orderId, uint256 _index) internal {
        Order storage order = orders[_orderId];
        Milestone storage ms = milestones[_orderId][_index];
        uint256 amount = ms.amount;
        uint256 half = amount / 2;
        uint256 otherHalf = amount - half;

        usdc.safeTransfer(order.buyer, half);
        usdc.safeTransfer(order.seller, otherHalf);

        ms.status = MilestoneStatus.Released;
        ms.releasedAt = block.timestamp;
        order.releasedAmount += amount;
        totalEscrowed -= amount;

        emit MilestoneTimeoutRefund(_orderId, _index, amount);
        _checkOrderCompleted(_orderId);
    }

    function _checkOrderCompleted(uint256 _orderId) internal {
        Order storage order = orders[_orderId];
        bool allReleased = true;
        for (uint256 i = 0; i < order.milestoneCount; i++) {
            if (milestones[_orderId][i].status != MilestoneStatus.Released) {
                allReleased = false;
                break;
            }
        }
        if (allReleased) {
            order.completed = true;
            emit OrderCompleted(_orderId, order.releasedAmount);
        }
    }

    // ──── View Functions ────

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getMilestone(uint256 _orderId, uint256 _index) external view returns (Milestone memory) {
        return milestones[_orderId][_index];
    }

    function getMilestones(uint256 _orderId) external view returns (Milestone[] memory) {
        Order storage order = orders[_orderId];
        Milestone[] memory result = new Milestone[](order.milestoneCount);
        for (uint256 i = 0; i < order.milestoneCount; i++) {
            result[i] = milestones[_orderId][i];
        }
        return result;
    }

    function getOrderCount() external view returns (uint256) {
        return nextOrderId;
    }

    function canAutoRelease(uint256 _orderId, uint256 _index) external view returns (bool) {
        Milestone storage ms = milestones[_orderId][_index];
        return ms.status == MilestoneStatus.Delivered &&
               block.timestamp >= ms.deliveredAt + DELIVERY_CONFIRM_TIMEOUT;
    }

    function canClaimTimeoutRefund(uint256 _orderId, uint256 _index) external view returns (bool) {
        Milestone storage ms = milestones[_orderId][_index];
        return ms.status == MilestoneStatus.Disputed &&
               ms.disputedAt > 0 &&
               block.timestamp >= ms.disputedAt + DISPUTE_TIMEOUT;
    }

    function getExcessFunds() external view returns (uint256) {
        uint256 balance = usdc.balanceOf(address(this));
        return balance > totalEscrowed ? balance - totalEscrowed : 0;
    }

    function canFinalizeResolution(uint256 _orderId, uint256 _index) external view returns (bool) {
        Milestone storage ms = milestones[_orderId][_index];
        return ms.status == MilestoneStatus.PendingResolution &&
               ms.resolvedAt > 0 &&
               block.timestamp >= ms.resolvedAt + OBJECTION_PERIOD;
    }
}
