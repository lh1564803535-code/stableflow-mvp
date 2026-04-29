# StableFlow User Guide / 使用说明

## 1. Product Overview / 产品概览

### English

StableFlow is a frontend MVP for stablecoin invoicing and treasury operations.
It supports invoice creation, real wallet-based settlement on Base Sepolia with USDC, and post-payment collaborator routing records.

### 中文

StableFlow 是一个面向稳定币开票与资金运营的前端 MVP。
它支持发票创建、Base Sepolia 上基于钱包的真实 USDC 结算，以及收款后的协作方分账记录。

## 2. Local Run / 本地运行

### Fastest option / 最快方式

```powershell
Set-Location D:\MyProjects\openclaw
.\start-local.ps1
```

If the browser does not open automatically, visit:

`http://127.0.0.1:4173`

如果浏览器没有自动打开，请手动访问：

`http://127.0.0.1:4173`

### Alternative option / 备选方式

```powershell
Set-Location D:\MyProjects\openclaw
python -m http.server 4173
```

## 3. Main Screens / 主要页面

### Landing

English:
Shows the core product positioning, live treasury summary, and the three-part workflow: invoice, settlement, and routing.

中文：
展示产品定位、资金摘要，以及“开票 - 结算 - 分账”三段式流程。

### Create Invoice

English:
Use this screen to input client name, amount, due date, recipient wallet, and project note. The right side shows a live preview before sharing.

中文：
在这里填写客户名称、金额、到期日、收款钱包和项目说明。右侧会实时预览最终发票内容。

### Payment Rail

English:
This page is prepared for real wallet interaction. The user can connect an injected EVM wallet, switch to Base Sepolia, and submit a real USDC ERC-20 transfer.

中文：
这一页用于真实钱包交互。用户可以连接注入式 EVM 钱包、切换到 Base Sepolia，并发起真实的 USDC ERC-20 转账。

### Dashboard

English:
The dashboard shows treasury posture, recent collections, open receivables, AI ops summaries, routing coverage, activity logs, and payout records.

中文：
Dashboard 展示资金态势、最近收款、未结应收、AI 运营摘要、分账覆盖率、活动日志和 payout 记录。

## 4. Demo Steps / 演示步骤

1. Open `Create invoice` / 打开 `Create invoice`
2. Enter a valid recipient wallet / 输入有效收款钱包
3. Submit the invoice / 提交发票
4. Open the payment rail / 打开支付页
5. Connect wallet and switch network / 连接钱包并切换网络
6. Submit the payment / 发起支付
7. Return to dashboard / 回到 dashboard
8. Create a payout record / 创建一条 payout 记录

## 5. Demo Requirements / 演示前提

### English

- Injected wallet such as MetaMask
- Base Sepolia selected in the wallet
- Test ETH for gas
- Test USDC on Base Sepolia

### 中文

- 注入式钱包，例如 MetaMask
- 钱包已切到 Base Sepolia
- 用于 gas 的测试 ETH
- Base Sepolia 上的测试 USDC

## 6. What Is Real / 哪些部分是真实的

### English

- wallet connection
- network switching
- ERC-20 transaction submission
- transaction confirmation

### 中文

- 钱包连接
- 网络切换
- ERC-20 交易发送
- 交易确认

## 7. Current MVP Boundaries / 当前 MVP 边界

### English

- invoice data is stored in browser local storage
- payout routing is recorded in the application layer
- no team accounts or backend persistence yet

### 中文

- 发票数据保存在浏览器本地存储中
- payout 分账目前只是应用层记录
- 暂时没有团队账号体系和后端持久化

## 8. Recommended Talking Point / 推荐讲法

### English

`StableFlow is not just an invoice generator. It is a stablecoin receivables and routing workflow with real settlement credibility.`

### 中文

`StableFlow 不是一个单纯的开票工具，而是一套具备真实结算可信度的稳定币应收与分账工作流。`
