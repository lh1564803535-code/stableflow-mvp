# StableFlow 项目上下文交接

> 复制到新对话开头，让 Claude 快速理解项目全貌。

---

## 项目位置

- **合约 + 编译/测试/部署**: `D:\MyProjects\code\openclaw`
- **主前端**: `D:\MyProjects\code\v0-ui`（Next.js 15 + React + Tailwind + wagmi + RainbowKit）

## 一句话

StableFlow 是稳定币自由职业服务市场。卖家上架服务，买家用 USDC 购买，资金通过智能合约按里程碑托管释放，平台收 2% 手续费（可配置）。对标 Fiverr（20%），核心差异是去中心化+低费率+完整链上争议解决。

## 技术栈

- 前端: Next.js 15 + React 19 + Tailwind 4 + TypeScript + wagmi + RainbowKit
- 合约: Solidity 0.8.20 + OpenZeppelin v5（ReentrancyGuard, Ownable, Pausable）
- 网络: Base Sepolia（chainId 84532）
- 代币: USDC（0x036CbD53842c5426634e7929541eC2318f3dCF7e）
- 测试: node:test + viem（不走 hardhat test）
- 部署: Hardhat 3 programmatic API

## 已完成的事（截至 2026-05-13）

1. **合约 V4** — S1-S4 安全修复 + 可配置费率 + emergency withdraw + 48h 异议期 + 90 天紧急退出。75 个测试通过，Slither 静态分析完成
2. **前端 v0-ui** — Next.js 15 + RainbowKit，3 个核心页面接通合约（/create、/orders、/order/[id]）
3. **Landing Page** — 12 个区块的专业级深色主题首页（hero 动画、features、pricing、security 等）
4. **竞品调研** — 8 个竞品对比，差异化定位："里程碑分段托管 + 完整争议解决"
5. **CHANGELOG_V4.md** — 完整的 V3→V4 改动报告
6. **路演报告** — PITCH_REPORT.md、HERMES_PITCH_REPORT_PROMPT.md
7. **内容创作** — data/articles/ 有公众号文章

## 待做（按优先级）

1. **部署到 Base Sepolia** — 需要测试 ETH（已领取）+ .env 配置
2. **Etherscan 验证** — 让评委能查看合约源码
3. **声誉 SBT** — Soulbound Token，链上可验证的卖家历史
4. **争议可视化 Dashboard** — 展示完整争议链路

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

## 本地运行

```bash
# 前端
cd D:\MyProjects\code\v0-ui
npm run dev
# http://localhost:3000

# 合约编译和测试
cd D:\MyProjects\code\openclaw
npx hardhat compile
node --test test/StableFlowEscrow.test.mjs

# 部署
npx hardhat run scripts/deploy-sepolia.js --network baseSepolia
```

## 关键文件速查

| 文件 | 说明 |
|------|------|
| contracts/StableFlowEscrow.sol | V4 主合约（S1-S4 修复 + 异议期 + 紧急退出） |
| contracts/MockUSDC.sol | 测试用 USDC |
| test/StableFlowEscrow.test.mjs | 合约测试（75 个用例） |
| scripts/deploy-sepolia.js | Base Sepolia 部署脚本 |
| CHANGELOG_V4.md | V3→V4 完整改动报告 |
| v0-ui/app/ | Next.js 前端页面 |
| v0-ui/hooks/useEscrow.ts | 合约交互 hook |
| v0-ui/lib/contracts.ts | 合约 ABI + 配置 |

## 注意事项

- 密钥不进代码，部署私钥放 .env
- 合约资金操作全部链上，不依赖后端
- 测试用 `node --test`，不用 `npx hardhat test`
- 用户是 UX 设计师出身，不是程序员，解释技术时用类比
