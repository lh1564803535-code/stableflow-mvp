# StableFlow

稳定币自由职业服务市场。用 USDC 买卖服务，智能合约托管，里程碑释放。

**本项目是合约开发和部署环境。主前端已迁移到 `D:\MyProjects\code\v0-ui`（Next.js + RainbowKit）。**

## 解决什么问题

传统自由职业平台（Fiverr 20%、Upwork 10-20%）手续费高、资金不透明、跨境支付慢、争议处理黑箱。StableFlow 用智能合约替代平台信任，手续费仅 2%（可配置，上限 10%），资金链上可查，USDC 即时结算。

## 核心流程

1. 卖家上架服务，设定里程碑和价格
2. 买家浏览服务，用 USDC 下单（资金锁入合约）
3. 卖家逐里程碑交付
4. 买家确认后释放对应资金（14 天超时自动释放）
5. 争议通过仲裁员裁决 → 48h 异议期 → 执行
6. 30 天超时退款；90 天紧急 50/50 分割

## 本地运行

```bash
# 编译合约
npx hardhat compile

# 运行测试（75 个用例）
node --test test/StableFlowEscrow.test.mjs

# 部署到 Base Sepolia
npx hardhat run scripts/deploy-sepolia.js --network baseSepolia
```

## 技术栈

- 合约: Solidity 0.8.20 + OpenZeppelin v5（ReentrancyGuard, Ownable, Pausable）
- 网络: Base Sepolia（chainId 84532）
- 代币: USDC（0x036CbD53842c5426634e7929541eC2318f3dCF7e）
- 测试: node:test + viem（不走 `npx hardhat test`）
- 部署: Hardhat 3 programmatic API

## 项目结构

```
contracts/
  ├── StableFlowEscrow.sol   — V4 主合约（S1-S4 安全修复 + 异议期 + 紧急退出）
  └── MockUSDC.sol           — 测试用 USDC
scripts/
  └── deploy-sepolia.js      — Base Sepolia 部署脚本
test/
  └── StableFlowEscrow.test.mjs — 合约测试（75 个用例）
hardhat.config.js             — Hardhat 配置（baseSepolia 网络）
.env                          — 私钥和平台钱包地址（不进 git）
```

## 合约关键函数（V4）

| 函数 | 说明 |
|------|------|
| createOrder | 创建托管订单，USDC 转入合约 |
| deliverMilestone | 卖家标记交付 |
| releaseMilestone | 买家确认释放资金 |
| autoReleaseMilestone | 14 天超时自动释放给卖家 |
| disputeMilestone | 发起争议（记录发起者身份） |
| resolveDispute | 仲裁员提议裁决（进入 48h 异议期） |
| finalizeResolution | 48h 后执行仲裁决议 |
| appealResolution | 48h 内申诉，回退到争议状态 |
| claimTimeoutRefund | 30 天超时退款（给非发起方）；90 天紧急 50/50 分割 |
| setPlatformFee | 设置费率（≤10%） |
| emergencyWithdraw | 提取超出托管的多余资金 |
| pause / unpause | 紧急暂停 |

## 文档

- [CHANGELOG_V4.md](./CHANGELOG_V4.md) — V3→V4 完整改动报告
- [README-说明报告.md](./README-说明报告.md) — 非技术人员完整说明
- [PITCH_REPORT.md](./PITCH_REPORT.md) — 路演报告

## 相关项目

- `D:\MyProjects\code\v0-ui\` — **主前端**，Next.js 15 + RainbowKit + wagmi + Tailwind CSS
