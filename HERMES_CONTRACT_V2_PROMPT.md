# Hermes 提示词：合约 V2 升级

## 项目位置
D:\MyProjects\openclaw

## 任务
升级 StableFlowEscrow 合约，修复资金安全问题，增加争议解决机制和紧急暂停功能。

## 背景
当前合约 `contracts/StableFlowEscrow.sol` 存在致命问题：dispute 后资金永久锁死，没有解决机制。需要增加完整的争议解决闭环，并加强安全防护。

## 需要修改的文件
- `contracts/StableFlowEscrow.sol` — 合约升级

## 具体改动

### 1. 新增 import

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
```

### 2. 继承 Ownable + Pausable

```solidity
contract StableFlowEscrow is ReentrancyGuard, Ownable, Pausable {
    constructor(address _usdc, address _platformWallet) Ownable(msg.sender) {
        // ... 原有逻辑
    }
```

### 3. 核心函数加 whenNotPaused

`createOrder`、`releaseMilestone`、`deliverMilestone`、`disputeMilestone` 全部加 `whenNotPaused` 修饰符。

### 4. 新增 arbitrator 角色

```solidity
address public arbitrator;

modifier onlyArbitrator() {
    require(msg.sender == arbitrator, "Not arbitrator");
    _;
}

function setArbitrator(address _newArbitrator) external onlyOwner {
    require(_newArbitrator != address(0), "Invalid address");
    arbitrator = _newArbitrator;
}
```

### 5. 新增 resolveDispute 函数（最关键）

```solidity
/**
 * @notice Arbitrator resolves a disputed milestone.
 * @param _orderId The order ID.
 * @param _index The milestone index.
 * @param _recipient Who gets the funds (buyer or seller).
 * @param _percentToRecipient How much _recipient gets, in basis points (10000 = 100%).
 *        The rest goes to the other party.
 */
function resolveDispute(
    uint256 _orderId,
    uint256 _index,
    address _recipient,
    uint256 _percentToRecipient
) external onlyArbitrator nonReentrant {
    Order storage order = orders[_orderId];
    require(_index < order.milestoneCount, "Invalid index");
    Milestone storage ms = milestones[_orderId][_index];
    require(ms.status == MilestoneStatus.Disputed, "Not disputed");
    require(
        _recipient == order.buyer || _recipient == order.seller,
        "Recipient must be buyer or seller"
    );
    require(_percentToRecipient <= 10000, "Percent exceeds 100%");

    uint256 msAmount = ms.amount;
    uint256 recipientAmount = (msAmount * _percentToRecipient) / 10000;
    uint256 otherAmount = msAmount - recipientAmount;

    address otherParty = (_recipient == order.seller) ? order.buyer : order.seller;

    // Calculate platform fee only on seller's portion
    if (_recipient == order.seller) {
        uint256 platformFee = (recipientAmount * 200) / 10000;
        usdc.safeTransfer(_recipient, recipientAmount - platformFee);
        usdc.safeTransfer(platformWallet, platformFee);
    } else {
        usdc.safeTransfer(_recipient, recipientAmount);
    }

    if (otherAmount > 0) {
        usdc.safeTransfer(otherParty, otherAmount);
    }

    ms.status = MilestoneStatus.Released;
    ms.releasedAt = block.timestamp;
    order.releasedAmount += msAmount;

    // Clear dispute flag if all milestones resolved
    bool stillDisputed = false;
    for (uint256 i = 0; i < order.milestoneCount; i++) {
        if (milestones[_orderId][i].status == MilestoneStatus.Disputed) {
            stillDisputed = true;
            break;
        }
    }
    if (!stillDisputed) {
        order.disputed = false;
    }

    emit MilestoneResolved(_orderId, _index, _recipient, recipientAmount, otherAmount);
}
```

### 6. 新增超时退款功能

```solidity
uint256 public constant DISPUTE_TIMEOUT = 30 days; // 争议超时

function claimTimeoutRefund(uint256 _orderId, uint256 _index) external nonReentrant {
    Order storage order = orders[_orderId];
    Milestone storage ms = milestones[_orderId][_index];
    require(ms.status == MilestoneStatus.Disputed, "Not disputed");
    require(
        block.timestamp >= ms.deliveredAt + DISPUTE_TIMEOUT,
        "Timeout not reached"
    );

    // Refund to buyer
    usdc.safeTransfer(order.buyer, ms.amount);
    ms.status = MilestoneStatus.Released; // Mark as resolved
    order.releasedAmount += ms.amount;

    emit MilestoneTimeoutRefund(_orderId, _index, ms.amount);
}
```

### 7. 新增 pause/unpause 函数

```solidity
function pause() external onlyOwner { _pause(); }
function unpause() external onlyOwner { _unpause(); }
```

### 8. 新增事件

```solidity
event MilestoneResolved(
    uint256 indexed orderId,
    uint256 indexed milestoneIndex,
    address indexed recipient,
    uint256 recipientAmount,
    uint256 otherAmount
);

event MilestoneTimeoutRefund(
    uint256 indexed orderId,
    uint256 indexed milestoneIndex,
    uint256 refundAmount
);

event ArbitratorUpdated(address indexed oldArbitrator, address indexed newArbitrator);
event ContractPaused(address indexed by);
event ContractUnpaused(address indexed by);
```

### 9. 更新 app.js 中的 ABI

在 `app.js` 的 `CONTRACT_ABI` 数组中加入新函数签名：

```javascript
"function resolveDispute(uint256 _orderId, uint256 _index, address _recipient, uint256 _percentToRecipient) external",
"function claimTimeoutRefund(uint256 _orderId, uint256 _index) external",
"function pause() external",
"function unpause() external",
"function setArbitrator(address _newArbitrator) external",
"function arbitrator() external view returns (address)",
"function DISPUTE_TIMEOUT() external view returns (uint256)",
"event MilestoneResolved(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 recipientAmount, uint256 otherAmount)",
"event MilestoneTimeoutRefund(uint256 indexed orderId, uint256 indexed milestoneIndex, uint256 refundAmount)",
```

## 验证

1. `npx hardhat compile` — 编译通过
2. 检查所有 `require` 语句覆盖边界情况
3. 确认 `resolveDispute` 正确分配资金（含平台费扣除）
4. 确认 `claimTimeoutRefund` 只在超时后可调用
5. 确认 `pause` 后所有核心函数被阻断

## 不要改动的部分

- `createOrder` 的 USDC 转账逻辑（之前已修复，不要动）
- `deliverMilestone` 的基本逻辑
- `releaseMilestone` 的基本逻辑
- 结构体字段命名
- 事件参数命名（保持向后兼容）
