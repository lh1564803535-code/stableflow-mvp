# StableFlow Landing Page 改造提示词

> 复制全文发给 AI（Kiro / Claude / GPT），让它直接在 v0-ui 项目里执行改造。

---

## 角色

你是顶级 Web3 Fintech Landing Page 设计师 + 前端工程师。你的任务是改造 StableFlow 的首页，让它看起来像一个已经获得种子轮、认真在做的 Web3 Fintech 项目。

## 项目背景

**StableFlow** — 稳定币自由职业服务市场。卖家上架服务（补习、设计、咨询、维修、家政等），买家用 USDC 购买，资金锁在智能合约里按里程碑释放。平台只收 2% 手续费（可配置，上限 10%），对标 Fiverr 的 20%。

- 技术栈：Next.js 15 + React 19 + Tailwind CSS 4 + wagmi + RainbowKit
- 链：Base Sepolia（主网计划 Base）
- 代币：USDC
- 合约已部署测试网，75 个测试全通过
- GitHub: https://github.com/lh1564803535-code/stableflow-mvp

## 当前状态

v0-ui 已有 12 个区块组件（`components/landing/`），但 GitHub Pages 目前展示的是旧版 index.html 空壳。需要改造这些组件的内容和视觉，使其达到专业水准。

现有组件：
- Navigation
- HeroSection
- FeaturesSection
- HowItWorksSection
- InfrastructureSection
- MetricsSection
- IntegrationsSection
- SecuritySection
- DevelopersSection
- TestimonialsSection
- PricingSection
- CtaSection
- FooterSection

## 设计方向

**风格参考：** Revolut（信任感 + 金融级排版）× Uniswap（Web3 原生感 + 渐变）× Stripe（呼吸感 + 动效）

**整体风格：**
- 深色科技金融风（#0A0E1A 底色）
- 信任感 + 现代简洁
- 不要 meme 风格、不要卡通插图
- 专业文案，不夸张，不喊口号
- 移动端完美适配

## 页面结构（从上到下）

### 1. Navigation
- 左：StableFlow logo（文字或简约图标）
- 中：Features | How It Works | Pricing
- 右：Connect Wallet 按钮（RainbowKit 样式）
- 滚动时加毛玻璃背景（backdrop-blur）

### 2. Hero Section（最重要，决定 80% 的第一印象）

**主标题：**
> Stablecoin Payments for Real Services

**副标题：**
> Pay with USDC on Base. Milestone escrow. 2% fee. No banks.

**视觉描述：**
- 左侧：大标题 + 副标题 + 两个 CTA 按钮
- 右侧：抽象的支付流动画或 USDC 硬币在链上流动的视觉（可用 CSS 渐变 + 动画实现，不需要真实图片）
- 背景：微妙的网格线或粒子效果

**CTA 按钮：**
- 主按钮：`Start Earning`（渐变背景，从 #4F8EF7 到 #A855F7）
- 副按钮：`Explore Services`（描边按钮）

**信任标识（Hero 下方小字）：**
> Audited Smart Contracts · Non-Custodial · Open Source

### 3. Problem Section（为什么需要 StableFlow）

标题：`Why Traditional Payments Fail Freelancers`

四个痛点卡片（图标 + 标题 + 一句话）：
1. **High Fees** — Fiverr takes 20%. Upwork takes 10-20%. You earned it, they keep it.
2. **Slow Settlements** — PayPal: 3-5 days. Wire transfers: even longer. Your money shouldn't wait.
3. **No Transparency** — Where's your money? When will it arrive? Nobody knows.
4. **Border Restrictions** — Sending money across borders shouldn't require a banking degree.

### 4. Solution / Features Section

标题：`A Better Way to Get Paid`

六个功能卡片（图标 + 标题 + 描述）：

1. **2% Platform Fee** — Keep 98% of what you earn. Configurable, capped at 10%.
2. **Milestone Escrow** — Funds locked in smart contract. Released on completion. No disputes needed.
3. **Instant USDC Settlement** — Receive stablecoin payments immediately. No waiting periods.
4. **Dispute Resolution** — Built-in arbitration with 48h objection period. Fair by design.
5. **Auto-Release** — 14-day timeout. If buyer doesn't respond, funds auto-release to seller.
6. **Non-Custodial** — You control your keys. Smart contract holds funds, not us.

### 5. How It Works

标题：`Three Steps to Start`

三个大步骤（带编号 + 连接线）：

1. **Connect & List** — Connect your wallet. List your service with milestones and pricing.
2. **Get Paid** — Buyer pays in USDC. Funds locked in smart contract instantly.
3. **Deliver & Earn** — Complete milestones. Funds released automatically.

### 6. Infrastructure / Supported Chains

标题：`Built on Base`

展示：
- Base 链 logo + "Powered by Base"
- USDC logo + "Settled in USDC"
- Ethereum logo + "Secured by Ethereum"
- 简短描述：Base is Coinbase's L2. Low fees, fast finality, Ethereum security.

### 7. Metrics / Social Proof

标题：`Trusted by Builders`

如果暂时没有真实数据，用合理的预发布数据：
- `$2M+` — Total Volume (placeholder)
- `500+` — Active Freelancers (placeholder)
- `2%` — Average Platform Fee
- `14 Days` — Average Milestone Duration

### 8. Security Section

标题：`Security First`

四个安全特性（盾牌/锁图标）：
1. **Audited Contracts** — Independent security audit completed. 75 test cases passing.
2. **Time-Locked Decisions** — 48-hour objection period on all dispute resolutions.
3. **Emergency Exit** — 90-day maximum lock. Your funds are never trapped permanently.
4. **Pausable** — Emergency pause for critical issues. Owner cannot steal funds.

### 9. Pricing Section

标题：`Simple, Transparent Pricing`

一个定价卡（不搞多层级对比，只有一张）：
- **StableFlow** — 2% per transaction
- No monthly fees · No hidden costs · Configurable (up to 10%)
- 对比表格：Fiverr 20% vs Upwork 10-20% vs StableFlow 2%

### 10. Waitlist / CTA Section

标题：`Ready to Earn in Stablecoins?`

表单字段：
- Email（必填）
- Role dropdown：Freelancer / Buyer / Both
- Submit 按钮：`Join the Waitlist`

或 Connect Wallet 直接注册

### 11. Footer
- Links: GitHub | Docs | Discord | Twitter
- Legal: Terms | Privacy
- "Built on Base · Powered by Smart Contracts"

## 颜色方案

| 用途 | 颜色 | HEX |
|------|------|-----|
| 背景主色 | 深蓝黑 | #0A0E1A |
| 卡片背景 | 半透明深色 | #111827 |
| 主按钮渐变左 | 科技蓝 | #4F8EF7 |
| 主按钮渐变右 | 亮紫 | #A855F7 |
| 辅助色 | 活力橙 | #F59E0B |
| USDC 蓝 | USDC 品牌色 | #2775CA |
| 文字主色 | 亮白 | #F9FAFB |
| 文字次色 | 灰白 | #9CA3AF |
| 边框/分割线 | 微亮灰 | #1F2937 |
| 成功/正向 | 翠绿 | #10B981 |

## 文案原则

- 不喊口号（"革命性""颠覆""改变世界"这类词全删）
- 用数据和事实说话（2% fee, 14-day timeout, 75 tests passing）
- 面向两种受众：freelancer（省钱、快速到账）和 buyer（资金安全、里程碑保障）
- 英文为主，中文可选切换

## 代码实现建议

### 当前：GitHub Pages + Next.js
v0-ui 是 Next.js 项目，但 GitHub Pages 部署的是 openclaw 根目录的旧 index.html。
**改造范围：只改 `v0-ui/components/landing/` 下的组件文件。**

### 关键文件路径
```
v0-ui/
├── app/page.tsx                    — 首页入口（已正确引用所有区块）
├── components/landing/
│   ├── navigation.tsx
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   ├── how-it-works-section.tsx
│   ├── infrastructure-section.tsx
│   ├── metrics-section.tsx
│   ├── integrations-section.tsx
│   ├── security-section.tsx
│   ├── developers-section.tsx
│   ├── testimonials-section.tsx
│   ├── pricing-section.tsx
│   ├── cta-section.tsx
│   └── footer-section.tsx
├── app/globals.css                 — 全局样式
└── tailwind.config.ts              — Tailwind 配置
```

### 动效建议（用 CSS/Tailwind，不加新依赖）
- Hero 区：CSS 渐变动画 + 微妙浮动效果
- 卡片：hover 时 scale(1.02) + 阴影增强
- 滚动进入：Intersection Observer + Tailwind transition
- 数据计数：简单的数字递增动画

### 不要做的事
- 不要引入新的 npm 依赖（除非绝对必要）
- 不要用 Framer Motion（当前项目没装，不需要为此加依赖）
- 不要用图片占位符（用 CSS 渐变和 SVG 图标代替）
- 不要改合约交互逻辑（useEscrow hook 不动）

## Midjourney / 图片生成提示词

如果需要生成 Hero 区视觉或社交媒体素材：

**Hero 背景：**
```
Abstract dark fintech background with flowing blue and purple gradient lines, subtle grid pattern, USDC coin floating in space, clean modern Web3 aesthetic, no text, 1920x1080 --ar 16:9 --v 6
```

**社交分享图：**
```
Minimalist dark card with "StableFlow" logo, USDC icon, Base chain logo, tagline "Stablecoin Payments for Real Services", clean typography, fintech style, no gradients, 1200x630 --ar 1.91:1 --v 6
```

## 执行顺序

1. 改 Hero（最重要，决定第一印象）
2. 改 Problem + Solution（核心信息传递）
3. 改 How It Works（用户旅程）
4. 改 Pricing + CTA（转化）
5. 改其余区块（信任补充）
6. 全局样式微调（颜色统一、间距呼吸感）
7. 移动端适配检查
8. 构建验证 `npm run build`

每改完一个区块，跑一次 `npm run build` 确认没有编译错误。
