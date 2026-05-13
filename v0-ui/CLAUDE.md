# StableFlow — 主前端

稳定币自由职业服务市场的 Next.js 前端。合约源码和部署在 `d:\MyProjects\code\openclaw`。

## 技术栈

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- RainbowKit（钱包连接 UI）+ wagmi v3（合约 hooks）+ viem（工具库）
- 网络: Base Sepolia（chainId 84532）

## 项目结构

```
app/
  layout.tsx              — 根布局（WalletProvider + AppNavigation）
  page.tsx                — Landing page（13 个 section）
  browse/[id]/page.tsx    — 服务详情 + 下单
  create/page.tsx         — 创建服务（卖家）
  orders/page.tsx         — 订单列表（买家）
  order/[id]/page.tsx     — 订单详情 + 里程碑操作
  sales/page.tsx          — 销售列表（卖家）
components/
  wallet-provider.tsx     — RainbowKitProvider（dark theme, accentColor: #0052FF）
  app-navigation.tsx      — App 导航栏（Browse/Orders/Create + ConnectButton）
  landing/navigation.tsx  — Landing page 导航栏（独立，含 Sales 链接）
hooks/
  useEscrow.ts            — 合约交互 hooks（useOrderCount/useOrder/useMilestones/useEscrowWrite）
lib/
  wagmi.ts                — RainbowKit config（chains: [baseSepolia]）
  contracts.ts            — 合约地址、ABI、状态映射、种子数据
  i18n.ts                 — 中英文切换
  abi/StableFlowEscrow.json — V4 合约 ABI
```

## 本地运行

```bash
cd D:\MyProjects\code\v0-ui
npm run dev
# http://localhost:3000
```

## 环境变量

`.env.local`:
```
NEXT_PUBLIC_ESCROW_ADDRESS=<部署后的合约地址>
```

## 关键设计决策

- **两个导航组件**：`app-navigation.tsx` 在 `pathname === "/"` 时不渲染，避免与 landing page 的 `navigation.tsx` 重叠
- **钱包连接统一用 RainbowKit**：所有页面用 `@rainbow-me/rainbowkit` 的 `ConnectButton`，不要用旧的 `useWallet` hook（已删除）
- **颜色方案**：dark background `#0A0A0A` + Base blue `#0052FF`
- **BigInt 处理**：不用 `0n` 字面量（TS target < ES2020），用 `BigInt(0)`

## 合约交互

- 创建订单两步：先 `approve(escrow, amount)` → 再 `createOrder(seller, milestones)`
- 里程碑状态: 0=None, 1=Funded, 2=Delivered, 3=Released, 4=Disputed, 5=Pending
- 操作权限由合约控制，前端只做状态展示和按钮触发
