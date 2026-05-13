# StableFlow — 合约开发环境

稳定币自由职业服务市场。**主前端已迁移到 v0-ui**（Next.js + RainbowKit）。本项目保留为合约源码、编译、测试和部署环境。

## 技术栈

- 合约: Solidity 0.8.20 + OpenZeppelin（ReentrancyGuard, Ownable, Pausable）
- 网络: Base Sepolia（chainId 84532）
- 代币: USDC（0x036CbD53842c5426634e7929541eC2318f3dCF7e）
- 部署: Hardhat 3 programmatic API

## 项目结构

```
contracts/          — Solidity 智能合约
  ├── StableFlowEscrow.sol   — V4 主合约
  └── MockUSDC.sol           — 测试用 USDC
scripts/            — 部署脚本
  └── deploy-sepolia.js      — Base Sepolia 部署
test/               — 合约测试
hardhat.config.js   — Hardhat 配置（baseSepolia 网络）
.env                — 私钥和平台钱包地址（不进 git）
```

## 合约编译和测试

```bash
npx hardhat compile
node --test test/StableFlowEscrow.test.mjs
```

## 部署到 Base Sepolia

```bash
# 1. 确保 .env 有 PRIVATE_KEY（0x 开头的 hex）和 PLATFORM_WALLET
# 2. 编译
npx hardhat compile
# 3. 部署
npx hardhat run scripts/deploy-sepolia.js --network baseSepolia
# 4. 部署后把输出的合约地址写入 v0-ui/.env.local
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

## 注意事项

- 主前端在 `d:\MyProjects\code\v0-ui`，合约地址通过 `NEXT_PUBLIC_ESCROW_ADDRESS` 环境变量传入
- 密钥不进代码，部署私钥放 .env
- Hardhat config 的 baseSepolia.accounts 从 `PRIVATE_KEY` 环境变量读取
