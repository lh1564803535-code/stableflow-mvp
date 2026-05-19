# StableFlow 第二轮任务（完整提示词）

> 复制全文发给 Kiro，它知道项目上下文，直接执行。

---

## 当前状态

- 合约已部署到 Base Sepolia：`0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C`
- v0-ui Landing Page 已改造完成（12 个区块，npm run build 通过）
- 三个核心业务页面已有基础功能（/create、/orders、/order/[id]）
- GitHub Pages 还在展示旧版 index.html

## 任务清单（按顺序执行）

---

### 任务 1：合约 Etherscan 验证

在 openclaw 目录下执行：

```bash
cd D:\MyProjects\code\openclaw
```

1. 检查 `.env` 里有没有 `BASESCAN_API_KEY`
2. 如果没有：打开 https://basescan.org → 注册/登录 → API Keys → 创建新 Key → 复制
3. 把 Key 填进 `.env`：`BASESCAN_API_KEY=你复制的key`
4. 跑验证命令：

```bash
npx hardhat verify --network baseSepolia 0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C "0x036CbD53842c5426634e7929541eC2318f3dCF7e" "0xbdb90a9B14B4FC92F855800e5fa02Bd4f395ecA7"
```

5. 验证成功后，合约在 Base Sepolia 上会显示 "Contract" 标签，源码可读

---

### 任务 2：部署新版到 GitHub Pages

把 v0-ui 的构建产物部署到 GitHub Pages，替换旧的 index.html。

步骤：

1. 在 v0-ui 目录跑 `npm run build`，确认 `out/` 目录生成
2. 把 `out/` 目录下的所有文件复制到 `D:\MyProjects\code\openclaw\` 根目录（覆盖旧的 index.html/app.js/styles.css）
3. 用 git 提交并推送：

```bash
cd D:\MyProjects\code\openclaw
git add -A
git commit -m "Deploy new landing page to GitHub Pages"
git push
```

GitHub Pages 地址：https://lh1564803535-code.github.io/stableflow-mvp/

验证：打开上面的链接，应该看到新的深色科技风首页。

---

### 任务 3：创建帮助文档页面 /docs

在 v0-ui 里创建一个新的帮助/文档页面，让用户知道怎么使用 StableFlow。

#### 文件结构

```
v0-ui/app/docs/page.tsx    — 文档主页
```

#### 页面内容

**标题：** StableFlow User Guide

**导航栏加链接：** Navigation 的 appLinks 里加一项 `{ name: "Docs", href: "/docs" }`

**内容结构（从上到下）：**

**Section 1: Quick Start（30 秒上手）**

```markdown
1. 连接钱包（MetaMask 或其他）— 点击右上角 "Connect Wallet"
2. 确保钱包切换到 Base Sepolia 网络
3. 确保钱包里有 USDC（测试网）
4. 点 "Browse" 浏览服务，或点 "Sell" 上架你的服务
```

**Section 2: For Buyers（买家指南）**

```markdown
## 如何购买服务

1. 点击 Browse 浏览可用服务
2. 选择一个服务，查看里程碑和价格
3. 点击 "Purchase"，MetaMask 会弹窗确认
4. 资金会锁进智能合约（Escrow）
5. 卖家交付每个里程碑后，你确认即可释放对应资金
6. 如果有问题，可以发起争议（Dispute）

## 关键规则
- 资金锁在合约里，平台无法动用
- 卖家 14 天不交付，你可以申请退款
- 争议由仲裁员裁决，48 小时异议期
- 30 天超时可申请退款
```

**Section 3: For Sellers（卖家指南）**

```markdown
## 如何上架服务

1. 点击 Sell 或访问 /create
2. 填写：买家钱包地址、服务总价格（USDC）、里程碑名称和百分比
3. 里程碑百分比之和必须等于 100%
4. 确认后，买家的 USDC 会锁进合约

## 如何收款

1. 完成一个里程碑后，在订单详情页点击 "Mark as Delivered"
2. 买家确认后，对应百分比的资金自动释放到你的钱包
3. 如果买家 14 天不确认，资金自动释放（Auto-Release）

## 关键规则
- 你交付，买家确认，钱到账
- 争议时，仲裁员会裁决
- 90 天超时可以申请紧急退出（50/50 分割）
```

**Section 4: Smart Contract（合约信息）**

```markdown
## 合约详情

- 网络：Base Sepolia（Chain ID: 84532）
- 合约地址：0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C
- USDC 地址：0x036CbD53842c5426634e7929541eC2318f3dCF7e
- 平台手续费：2%（可配置，上限 10%）
- 状态：已通过 75 个测试 + Slither 静态分析

## 在区块浏览器查看
- Base Sepolia: https://sepolia.basescan.org/address/0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C
```

**Section 5: FAQ**

```markdown
## 常见问题

Q: 我需要多少 Gas？
A: 部署订单大约需要 0.001-0.005 ETH（Base Sepolia 费用很低）

Q: 资金安全吗？
A: 资金锁在经过测试的智能合约里，平台无法动用。只有买家确认或超时才会释放。

Q: 争议怎么处理？
A: 任一方可以发起争议，仲裁员提议方案，48 小时异议期后执行。

Q: 支持哪些币？
A: 目前支持 USDC（Base Sepolia）。未来计划支持更多稳定币。

Q: 主网上线了吗？
A: 目前在测试网（Base Sepolia），主网计划中。
```

#### 设计要求

- 用和 Landing Page 一致的深色主题（#0A0E1A 背景）
- 用 Markdown 渲染风格（标题大、段落清晰、代码块高亮）
- 左侧可以放目录导航（锚点跳转）
- 移动端适配（目录折叠为汉堡菜单）
- 不需要引入新的依赖，用 Tailwind 实现排版

---

### 任务 4：打磨三个核心页面（交互优化）

三个页面已有基础功能，现在需要提升到"作品集级别"。

#### /create 页面优化

1. **表单验证增强**
   - 卖家地址：实时校验是否为有效的以太坊地址（0x + 40 位 hex）
   - 价格：最小 1 USDC，最大 10000 USDC
   - 里程碑：每个至少 1%，总和必须 100%
   - 校验不通过时显示红色提示文字，不要只禁用按钮

2. **进度步骤指示器**
   - 顶部显示：连接钱包 → 填写信息 → 授权 USDC → 创建订单 → 完成
   - 当前步骤高亮，已完成步骤打勾

3. **BigInt 精度处理**
   - 金额输入用字符串存储，不要用 Number
   - 计算总金额时用 BigInt
   - 转换为 USDC 最小单位（6 位小数）时用 BigInt 乘 10^6

#### /orders 页面优化

1. **空状态**
   - 没有订单时显示：还没有订单，去 Browse 浏览服务 或 创建你的第一个服务

2. **状态筛选**
   - 顶部加筛选标签：全部 / 进行中 / 已完成 / 有争议
   - 用 URL query params 管理筛选状态

3. **订单卡片增强**
   - 显示：订单 ID、对方地址（缩写）、总金额、已释放金额、进度条
   - 进度条：已释放金额 / 总金额，绿色填充
   - 状态标签颜色：进行中（蓝色）、已完成（绿色）、有争议（红色）

#### /order/[id] 页面优化

1. **里程碑列表**
   - 每个里程碑卡片：名称、金额、百分比、状态标签
   - 状态颜色：待交付（灰色）、已交付（黄色）、已释放（绿色）、争议中（红色）
   - 操作按钮根据当前用户角色显示：
     - 如果是卖家 + 状态是 Funded → 显示 "Mark as Delivered"
     - 如果是买家 + 状态是 Delivered → 显示 "Release Funds"
     - 两者都不是 → 不显示操作按钮

2. **操作反馈**
   - 点击按钮后显示 loading 状态（spinner + 文字）
   - 成功后显示成功提示（绿色 toast，3 秒后消失）
   - 失败后显示错误信息（红色 toast，包含具体原因）

3. **资金信息卡片**
   - 显示：总金额、已释放、剩余、平台手续费（2%）
   - 用 BigInt 精度计算，显示时格式化为 USDC（6 位小数）

#### 通用要求

- 所有页面用和 Landing Page 一致的设计语言（sf-card 样式、渐变按钮）
- 不要引入新的 npm 依赖
- 每改完一个页面跑 `npm run build` 验证
- 错误处理要完善：钱包未连接、网络错误、交易失败都要有提示

---

## 项目文件路径

```
v0-ui/
├── app/
│   ├── page.tsx              — Landing Page（已改好）
│   ├── create/page.tsx       — 创建订单
│   ├── orders/page.tsx       — 订单列表
│   ├── order/[id]/page.tsx   — 订单详情
│   ├── docs/page.tsx         — 新建：帮助文档
│   └── globals.css           — 全局样式
├── components/landing/       — Landing Page 组件（已改好）
├── hooks/useEscrow.ts        — 合约交互 hooks
├── lib/contracts.ts          — 合约 ABI 和配置
└── .env.local                — 合约地址配置

openclaw/
├── .env                      — 私钥 + BASESCAN_API_KEY
└── scripts/deploy-sepolia.js — 部署脚本（已用过）
```

## 执行顺序

1. 先做任务 1（Etherscan 验证）— 最快，5 分钟
2. 再做任务 2（GitHub Pages 部署）— 让别人能看到新首页
3. 然后做任务 3（帮助文档页面）— 新增功能
4. 最后做任务 4（核心页面打磨）— 工作量最大

每完成一个任务，跑一次 `npm run build` 确认没有编译错误。
