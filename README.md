# StableFlow

稳定币自由职业服务市场。用 USDC 买卖服务，智能合约托管，里程碑释放。

## 解决什么问题

传统自由职业平台（Fiverr 20%、Upwork 10-20%）手续费高、资金不透明、跨境支付慢、争议处理黑箱。StableFlow 用智能合约替代平台信任，手续费仅 2%（可配置，上限 10%），资金链上可查，USDC 即时结算。

## 核心流程

1. 卖家上架服务，设定里程碑和价格
2. 买家浏览服务，用 USDC 下单（资金锁入合约）
3. 卖家逐里程碑交付
4. 买家确认后释放对应资金（14 天超时自动释放）
5. 争议通过仲裁员裁决 → 48h 异议期 → 执行
6. 30 天超时退款；90 天紧急 50/50 分割

## 项目结构（Monorepo）

```
stableflow-mvp/
├── contracts/                   — Solidity 智能合约
│   ├── StableFlowEscrow.sol     — V4 主合约（S1-S4 安全修复 + 异议期 + 紧急退出）
│   └── MockUSDC.sol             — 测试用 USDC
├── scripts/                     — 部署脚本
│   ├── deploy-sepolia.js        — Base Sepolia 部署
│   ├── deploy.js                — 通用部署
│   └── export-abi.js            — ABI 导出
├── test/                        — 合约测试（75 个用例）
├── config/                      — 配置文件
├── data/                        — 内容数据
├── src/                         — 合约配置
├── v0-ui/                       — Next.js 前端（RainbowKit + wagmi + Tailwind）
│   ├── app/                     — 页面路由
│   ├── components/              — UI 组件
│   ├── hooks/                   — 合约交互 hooks
│   └── lib/                     — 工具库 + ABI
├── app.js                       — 原始 SPA 前端
├── index.html                   — SPA 入口
├── styles.css                   — 全局样式
├── hardhat.config.js            — Hardhat 配置
└── .env                         — 私钥和平台钱包（不进 git）
```

## 快速开始

### 合约开发

```bash
# 编译合约
npx hardhat compile

# 运行测试
node --test test/StableFlowEscrow.test.mjs

# 部署到 Base Sepolia
npx hardhat run scripts/deploy-sepolia.js --network baseSepolia
```

### 前端开发（v0-ui）

```bash
cd v0-ui
npm install
npm run dev
# 打开 http://localhost:3000
```

## 技术栈

| 层 | 技术 |
|----|------|
| 合约 | Solidity 0.8.20 + OpenZeppelin v5 |
| 网络 | Base Sepolia（chainId 84532） |
| 代币 | USDC（0x036CbD53842c5426634e7929541eC2318f3dCF7e） |
| 前端 | Next.js 15 + React 19 + Tailwind CSS 4 |
| 钱包 | RainbowKit + wagmi v3 + viem |
| 测试 | node:test + viem |
| 部署 | Hardhat 3 programmatic API |

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
| claimTimeoutRefund | 30 天超时退款；90 天紧急 50/50 分割 |
| setPlatformFee | 设置费率（≤10%） |
| emergencyWithdraw | 提取超出托管的多余资金 |
| pause / unpause | 紧急暂停 |

## 文档

- [CHANGELOG_V4.md](./CHANGELOG_V4.md) — V3→V4 安全修复 + 新功能完整报告
- [CLAUDE.md](./CLAUDE.md) — 合约开发环境说明
- [v0-ui/CLAUDE.md](./v0-ui/CLAUDE.md) — 前端项目说明

## 安全特性

- **S1**: 争议发起者智能路由（谁发起争议，退款给对方）
- **S2**: 仲裁决议 48h 异议期（时间锁，防止仲裁员滥用）
- **S3**: 争议发起者追踪（Milestone 结构体扩展）
- **S4**: 90 天紧急退出（资金不会永久锁定）
- **可配置费率**: owner 可调，上限 10%
- **紧急提取**: owner 只能提取超出托管的多余资金
