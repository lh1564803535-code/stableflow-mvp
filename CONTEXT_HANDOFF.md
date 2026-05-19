# StableFlow — 项目上下文

> 新对话开头贴这段，让 Claude 30 秒内理解项目全貌。

---

## 这是什么

**StableFlow** — 稳定币自由职业服务市场。卖家上架服务，买家用 USDC 购买，资金锁在智能合约里按里程碑释放。平台只收 2% 手续费（可配置），对标 Fiverr 的 20%。

GitHub: `https://github.com/lh1564803535-code/stableflow-mvp`

## 两个目录，各管各的

| 目录 | 内容 | 技术栈 |
|------|------|--------|
| `D:\MyProjects\code\openclaw` | 合约 + 编译/测试/部署 | Solidity 0.8.20 + OpenZeppelin v5 + Hardhat 3 |
| `D:\MyProjects\code\v0-ui` | 前端 UI | Next.js 15 + React 19 + Tailwind 4 + wagmi + RainbowKit |

**不要搞混路径。** openclaw 只管合约，v0-ui 是主前端。

## 合约（V4，已通过 75 个测试）

关键函数：

| 函数 | 一句话 |
|------|--------|
| `createOrder` | 买家下单，USDC 锁进合约 |
| `deliverMilestone` | 卖家标记"我做完了" |
| `releaseMilestone` | 买家确认，释放对应里程碑的钱 |
| `autoReleaseMilestone` | 14 天没人管，自动放款给卖家 |
| `disputeMilestone` | 发起争议，冻结该里程碑 |
| `resolveDispute` | 仲裁员提议裁决方案 |
| `finalizeResolution` | 48h 异议期过了，执行裁决 |
| `appealResolution` | 48h 内不服，打回争议状态 |
| `claimTimeoutRefund` | 30 天超时退款；90 天紧急 50/50 分割 |
| `emergencyWithdraw` | 提取合约里多余的 USDC |
| `setPlatformFee` | 改费率（上限 10%） |
| `pause / unpause` | 紧急暂停所有操作 |

测试：`node --test test/StableFlowEscrow.test.mjs`（用 node:test + ethers，**不用** hardhat test）

部署：`npx hardhat run scripts/deploy-sepolia.js --network baseSepolia`

## 前端（v0-ui）

- 已接通合约的页面：`/create`、`/orders`、`/order/[id]`
- Landing Page：12 个区块的深色主题首页（hero 动画、features、pricing、security 等）
- 合约交互 hook：`hooks/useEscrow.ts`
- 合约 ABI + 配置：`lib/contracts.ts`
- 钱包连接：wagmi + RainbowKit

启动：`cd D:\MyProjects\code\v0-ui && npm run dev` → `http://localhost:3000`

## 已完成

1. 合约 V4 — S1-S4 安全修复 + 可配置费率 + 48h 异议期 + 90 天紧急退出
2. 75 个测试全部通过，Slither 静态分析完成
3. 前端 3 个核心页面接通合约
4. 12 区块 Landing Page
5. 竞品调研（8 个竞品对比）
6. CHANGELOG_V4.md — 完整改动记录
7. 路演报告 — PITCH_REPORT.md + HERMES_PITCH_REPORT_PROMPT.md
8. 公众号内容 — data/articles/

## 下一步

1. 部署到 Base Sepolia（需要 .env 里配私钥 + 测试 ETH）
2. Etherscan 验证合约源码
3. 声誉 SBT（Soulbound Token，链上卖家历史）
4. 争议可视化 Dashboard

## 可用 Skills

同一台电脑，新对话自动加载，不需要安装。直接用斜杠命令或自然语言触发：

| Skill | 触发方式 | 用途 |
|-------|---------|------|
| **task-observer** | 每个任务会话自动启动 | 监控任务执行，发现可改进的 workflow 模式 |
| **superpowers** | 自动生效 | 三条纪律：验证完才算完成、复杂任务先拆步骤、实现前先出方案 |
| **neat-freak** | `/neat` 或说"整理一下""收尾" | 会话结束时审查并同步文档和记忆，防止知识腐烂 |
| **persona-selector** | `/persona` 或"选角色" | 选择写作/工作人格（半佛仙人风格等） |
| **khazix-writer** | "写文章""写稿子""帮我写" | 公众号长文写作，数字生命卡兹克风格 |
| **humanize-writing** | "去AI味""太机器人了" | 去除 AI 写作痕迹，让文字更像人写的 |
| **code-review-skill** | "review 代码""检查一下" | 多语言代码审查，找 bug + 质量建议 |
| **deep-research** | "帮我研究一下""做个调研" | 自主研究任务，搜索+阅读+综合报告 |
| **ai-scout** | "有啥羊毛""免费AI资源" | AI 赚钱机会、免费资源聚合 |

其他已安装但和本项目关系不大的 skill：video-summary、playwright-skill、obsidian-markdown、writing-skills、prompt-engineer-toolkit、skill-creator、telegram-automation、discord-automation、instagram-automation、mailchimp-automation、shopify-development、stripe-integration、google-sheets-automation、youtube-automation、tmux、claude-speed-reader、simplify-code、self-improving-agent、content-production、flywheel-review、flywheel-weekly。

## 注意事项

- 密钥不进代码，私钥放 `.env`
- 测试用 `node --test`，不用 `npx hardhat test`
- 合约资金操作全部链上，无后端
- 用户是 UX 设计师出身，解释技术用类比，不要甩术语
