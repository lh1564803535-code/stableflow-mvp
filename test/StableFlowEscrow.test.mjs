import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ethers } from "ethers";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const hre = await import("hardhat").then(m => m.default);
const conn = await hre.network.connect();
const hp = conn.provider;

const root = process.cwd();
const escrowJson = JSON.parse(readFileSync(join(root, "artifacts/contracts/StableFlowEscrow.sol/StableFlowEscrow.json"), "utf8"));
const usdcJson = JSON.parse(readFileSync(join(root, "artifacts/contracts/MockUSDC.sol/MockUSDC.json"), "utf8"));

const provider = new ethers.BrowserProvider(hp);
const signers = [];
const accounts = await hp.send("eth_accounts", []);
for (let i = 0; i < accounts.length; i++) {
  signers.push(await provider.getSigner(i));
}
const [owner, buyer, seller, arbitrator, platformWallet] = signers;

const MINT_AMOUNT = ethers.parseUnits("10000", 6);
const ORDER_AMOUNT = ethers.parseUnits("500", 6);
const TWO_DAYS = 2 * 24 * 60 * 60;
const FOURTEEN_DAYS = 14 * 24 * 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;
const NINETY_DAYS = 90 * 24 * 60 * 60;

async function deployFresh() {
  const USDCFactory = new ethers.ContractFactory(usdcJson.abi, usdcJson.bytecode, owner);
  const u = await USDCFactory.deploy();
  await u.waitForDeployment();
  await u.mint(buyer.address, MINT_AMOUNT);

  const EscrowFactory = new ethers.ContractFactory(escrowJson.abi, escrowJson.bytecode, owner);
  const e = await EscrowFactory.deploy(await u.getAddress(), platformWallet.address);
  await e.waitForDeployment();
  await e.setArbitrator(arbitrator.address);

  return { usdc: u, escrow: e };
}

async function createAndDeliver(u, e, msIndex = 0) {
  await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
  await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [5000, 5000]);
  await e.connect(seller).deliverMilestone(0, msIndex);
}

describe("StableFlowEscrow V4", () => {
  describe("Deployment", () => {
    it("sets correct USDC address", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      assert.equal(await e.usdc(), await u.getAddress());
    });

    it("sets correct platform wallet", async () => {
      const { escrow: e } = await deployFresh();
      assert.equal(await e.platformWallet(), platformWallet.address);
    });

    it("sets owner correctly", async () => {
      const { escrow: e } = await deployFresh();
      assert.equal(await e.owner(), owner.address);
    });

    it("starts with 0 orders", async () => {
      const { escrow: e } = await deployFresh();
      assert.equal(await e.getOrderCount(), 0n);
    });

    it("has default fee of 200 bps", async () => {
      const { escrow: e } = await deployFresh();
      assert.equal(await e.platformFeeBps(), 200n);
    });
  });

  describe("createOrder", () => {
    it("creates order with correct amounts", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [3000, 4000, 3000]);

      const order = await e.getOrder(0);
      assert.equal(order.buyer, buyer.address);
      assert.equal(order.seller, seller.address);
      assert.equal(order.totalAmount, ORDER_AMOUNT);
      assert.equal(order.milestoneCount, 3n);
    });

    it("creates milestones with correct amounts", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [3000, 4000, 3000]);

      assert.equal((await e.getMilestone(0, 0)).amount, ethers.parseUnits("150", 6));
      assert.equal((await e.getMilestone(0, 1)).amount, ethers.parseUnits("200", 6));
      assert.equal((await e.getMilestone(0, 2)).amount, ethers.parseUnits("150", 6));
    });

    it("rejects below minimum amount", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      const tiny = ethers.parseUnits("0.5", 6);
      await u.connect(buyer).approve(await e.getAddress(), tiny);
      await assert.rejects(
        () => e.connect(buyer).createOrder(seller.address, tiny, [10000]),
        /Below minimum order amount/
      );
    });

    it("rejects if percents don't sum to 10000", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await assert.rejects(
        () => e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [5000, 5000, 5000]),
        /Percents must sum to 10000/
      );
    });

    it("rejects if seller is buyer", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await assert.rejects(
        () => e.connect(buyer).createOrder(buyer.address, ORDER_AMOUNT, [10000]),
        /Invalid seller/
      );
    });
  });

  describe("deliverMilestone", () => {
    it("allows seller to deliver", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [5000, 5000]);
      await e.connect(seller).deliverMilestone(0, 0);
      assert.equal((await e.getMilestone(0, 0)).status, 2n); // Delivered
    });

    it("rejects non-seller", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [5000, 5000]);
      await assert.rejects(
        () => e.connect(buyer).deliverMilestone(0, 0),
        /Only seller can deliver/
      );
    });
  });

  describe("releaseMilestone", () => {
    it("releases funds minus fee", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);

      const before = await u.balanceOf(seller.address);
      await e.connect(buyer).releaseMilestone(0, 0);
      const after = await u.balanceOf(seller.address);
      assert.equal(after - before, ethers.parseUnits("245", 6));
    });

    it("completes order when all released", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).releaseMilestone(0, 0);
      await e.connect(seller).deliverMilestone(0, 1);
      await e.connect(buyer).releaseMilestone(0, 1);
      assert.equal((await e.getOrder(0)).completed, true);
    });
  });

  describe("autoReleaseMilestone", () => {
    it("rejects if timeout not reached", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await assert.rejects(
        () => e.connect(seller).autoReleaseMilestone(0, 0),
        /Confirmation timeout not reached/
      );
    });

    it("allows auto-release after 14 days", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);

      await hp.send("evm_increaseTime", [FOURTEEN_DAYS]);
      await hp.send("evm_mine");

      await e.connect(seller).autoReleaseMilestone(0, 0);
      assert.equal((await e.getMilestone(0, 0)).status, 3n); // Released
    });
  });

  describe("disputeMilestone", () => {
    it("allows buyer to dispute", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);
      const ms = await e.getMilestone(0, 0);
      assert.equal(ms.status, 4n); // Disputed
      assert.equal(ms.disputeInitiator, buyer.address);
    });

    it("allows seller to dispute", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(seller).disputeMilestone(0, 0);
      const ms = await e.getMilestone(0, 0);
      assert.equal(ms.status, 4n);
      assert.equal(ms.disputeInitiator, seller.address);
    });
  });

  describe("resolveDispute + objection period (S2)", () => {
    it("proposes resolution but doesn't transfer immediately", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);

      await e.connect(arbitrator).resolveDispute(0, 0, seller.address, 5000);

      const ms = await e.getMilestone(0, 0);
      assert.equal(ms.status, 5n); // PendingResolution
      assert.equal(ms.pendingRecipient, seller.address);
      assert.equal(ms.pendingPercent, 5000n);

      // Funds should still be in escrow
      const escrowBalance = await u.balanceOf(await e.getAddress());
      assert.equal(escrowBalance, ORDER_AMOUNT);
    });

    it("rejects finalization during objection period", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);
      await e.connect(arbitrator).resolveDispute(0, 0, seller.address, 5000);

      await assert.rejects(
        () => e.connect(buyer).finalizeResolution(0, 0),
        /Objection period not ended/
      );
    });

    it("allows appeal during objection period", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);
      await e.connect(arbitrator).resolveDispute(0, 0, seller.address, 5000);

      await e.connect(buyer).appealResolution(0, 0);

      const ms = await e.getMilestone(0, 0);
      assert.equal(ms.status, 4n); // Back to Disputed
    });

    it("finalizes after objection period", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);
      await e.connect(arbitrator).resolveDispute(0, 0, seller.address, 5000);

      await hp.send("evm_increaseTime", [TWO_DAYS]);
      await hp.send("evm_mine");

      const bBefore = await u.balanceOf(buyer.address);
      const sBefore = await u.balanceOf(seller.address);
      await e.connect(buyer).finalizeResolution(0, 0);
      const bAfter = await u.balanceOf(buyer.address);
      const sAfter = await u.balanceOf(seller.address);

      // 50/50 of 250 USDC: seller gets 125 - 2% fee, buyer gets 125
      assert.equal(sAfter - sBefore, ethers.parseUnits("122.5", 6));
      assert.equal(bAfter - bBefore, ethers.parseUnits("125", 6));
    });
  });

  describe("claimTimeoutRefund (S3: initiator-based)", () => {
    it("rejects if timeout not reached", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);
      await assert.rejects(
        () => e.connect(buyer).claimTimeoutRefund(0, 0),
        /Timeout not reached/
      );
    });

    it("S3: buyer-initiated dispute → seller gets refund after 30 days", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0); // buyer initiated

      await hp.send("evm_increaseTime", [THIRTY_DAYS]);
      await hp.send("evm_mine");

      const sBefore = await u.balanceOf(seller.address);
      await e.connect(buyer).claimTimeoutRefund(0, 0);
      const sAfter = await u.balanceOf(seller.address);

      // Seller gets refund minus 2% fee
      assert.equal(sAfter - sBefore, ethers.parseUnits("245", 6));
    });

    it("S3: seller-initiated dispute → buyer gets refund after 30 days", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(seller).disputeMilestone(0, 0); // seller initiated

      await hp.send("evm_increaseTime", [THIRTY_DAYS]);
      await hp.send("evm_mine");

      const bBefore = await u.balanceOf(buyer.address);
      await e.connect(buyer).claimTimeoutRefund(0, 0);
      const bAfter = await u.balanceOf(buyer.address);

      // Buyer gets full refund (no fee on buyer refund)
      assert.equal(bAfter - bBefore, ethers.parseUnits("250", 6));
    });

    it("S4: 90-day emergency split 50/50", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await createAndDeliver(u, e);
      await e.connect(buyer).disputeMilestone(0, 0);

      await hp.send("evm_increaseTime", [NINETY_DAYS]);
      await hp.send("evm_mine");

      const bBefore = await u.balanceOf(buyer.address);
      const sBefore = await u.balanceOf(seller.address);
      await e.connect(buyer).claimTimeoutRefund(0, 0);
      const bAfter = await u.balanceOf(buyer.address);
      const sAfter = await u.balanceOf(seller.address);

      // 50/50 split of 250 USDC
      assert.equal(bAfter - bBefore, ethers.parseUnits("125", 6));
      assert.equal(sAfter - sBefore, ethers.parseUnits("125", 6));
    });
  });

  describe("Admin", () => {
    it("pause/unpause works", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await e.pause();
      await u.connect(buyer).approve(await e.getAddress(), ORDER_AMOUNT);
      let reverted = false;
      try {
        await e.connect(buyer).createOrder.staticCall(seller.address, ORDER_AMOUNT, [10000]);
      } catch { reverted = true; }
      assert.ok(reverted, "createOrder should revert when paused");
      await e.unpause();
      await e.connect(buyer).createOrder(seller.address, ORDER_AMOUNT, [10000]);
      assert.equal(await e.getOrderCount(), 1n);
    });

    it("rejects non-owner pause", async () => {
      const { escrow: e } = await deployFresh();
      await assert.rejects(() => e.connect(buyer).pause());
    });

    it("allows owner to update platform fee", async () => {
      const { escrow: e } = await deployFresh();
      await e.setPlatformFee(300); // 3%
      assert.equal(await e.platformFeeBps(), 300n);
    });

    it("rejects fee above max", async () => {
      const { escrow: e } = await deployFresh();
      await assert.rejects(
        () => e.setPlatformFee(1001),
        /Fee exceeds maximum/
      );
    });

    it("uses configurable fee in release", async () => {
      const { usdc: u, escrow: e } = await deployFresh();
      await e.setPlatformFee(300); // 3%
      await createAndDeliver(u, e);

      const before = await u.balanceOf(seller.address);
      await e.connect(buyer).releaseMilestone(0, 0);
      const after = await u.balanceOf(seller.address);

      // 250 USDC - 3% = 242.5 USDC
      assert.equal(after - before, ethers.parseUnits("242.5", 6));
    });
  });
});
