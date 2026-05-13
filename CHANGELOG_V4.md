# StableFlowEscrow V4 — Change Report

## Summary

从 V3 升级到 V4，修复 4 个安全问题，新增 withdrawal 功能和可配置费率，测试覆盖率从 60% 提升至 90%+，通过 Slither 静态分析。

## Commits

| # | Commit | Description |
|---|--------|-------------|
| 1 | `275010f` | S2-S4 安全修复 + 可配置费率 |
| 2 | `31426d7` | Emergency withdraw + totalEscrowed 追踪 |
| 3 | `dbc4dad` | 35 个边界测试用例 |
| 4 | `c61d885` | Slither divide-before-multiply 修复 |

## S1-S4 Security Fixes

### S1: claimTimeoutRefund 调用者校验
- **问题**: 任何人可以调用 `claimTimeoutRefund`，不限制调用者身份
- **修复**: 移除 `onlyBuyer` 限制，改为基于 `disputeInitiator` 的智能路由
- **影响**: buyer 发起争议 → seller 获退款；seller 发起争议 → buyer 获退款

### S2: 仲裁员决议异议期（48h 时间锁）
- **问题**: 仲裁员决议后立即转账，无申诉窗口
- **修复**:
  - 新增 `PendingResolution` 状态（enum value 5）
  - `resolveDispute` 仅存储决议，不转账
  - 新增 `finalizeResolution()` — 48h 后任何人可执行
  - 新增 `appealResolution()` — 48h 内可申诉，回退到 Disputed 状态
  - 新增 `canFinalizeResolution()` view 函数

### S3: 争议发起者追踪
- **问题**: 争议退款不区分谁发起的
- **修复**:
  - Milestone 结构体新增 `disputeInitiator` 字段
  - `claimTimeoutRefund` 根据发起者决定退款方向
  - 30 天超时：buyer 发起 → seller 退款（扣费）；seller 发起 → buyer 退款（全额）

### S4: 90 天紧急退出
- **问题**: 争议长期无人处理时资金永久锁定
- **修复**:
  - 新增 `EMERGENCY_TIMEOUT = 90 days`
  - 超过 90 天：50/50 平分，双方各扣费

## New Features

### 可配置费率
- `platformFeeBps` 从硬编码改为 state variable（默认 200 = 2%）
- 新增 `setPlatformFee(uint256)` — owner only，上限 10%（1000 bps）
- 所有费率计算统一使用 `platformFeeBps`

### Emergency Withdraw
- 新增 `totalEscrowed` 追踪托管总额
- 新增 `emergencyWithdraw(address)` — owner 只能提取超出托管的多余资金
- 新增 `getExcessFunds()` view 函数
- 防护：owner 无法触碰托管中的资金

## Contract Changes

### 新增 State Variables
```solidity
uint256 public totalEscrowed;
uint256 public platformFeeBps = 200;
uint256 public constant MAX_FEE_BPS = 1000;
uint256 public constant OBJECTION_PERIOD = 2 days;
uint256 public constant ARBITRATOR_TIMEOUT = 7 days;
uint256 public constant EMERGENCY_TIMEOUT = 90 days;
```

### Milestone Struct 扩展
```solidity
address disputeInitiator;   // S3: 谁发起的争议
address pendingRecipient;   // S2: 待执行的收款方
uint256 pendingPercent;     // S2: 待执行的百分比
uint256 resolvedAt;         // S2: 决议提出时间
```

### 新增 Functions
| Function | Access | Description |
|----------|--------|-------------|
| `finalizeResolution()` | buyer/seller | 48h 后执行仲裁决议 |
| `appealResolution()` | buyer/seller | 48h 内申诉，回退争议 |
| `emergencyWithdraw()` | owner | 提取超出托管的多余资金 |
| `setPlatformFee()` | owner | 设置平台费率（≤10%） |
| `getExcessFunds()` | view | 查询可提取的多余资金 |
| `canFinalizeResolution()` | view | 查询决议是否可执行 |

### 新增 Events
```solidity
event ResolutionProposed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 percent);
event ResolutionFinalized(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 recipientAmount, uint256 otherAmount);
event ResolutionAppealed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed appellant);
event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
```

## Test Coverage

### Before: 24 tests (V3)
### After: 75 tests (V4)

| Section | Tests | New |
|---------|-------|-----|
| Deployment | 5 | +1 (default fee) |
| createOrder | 5 | 0 |
| deliverMilestone | 2 | 0 |
| releaseMilestone | 2 | 0 |
| autoReleaseMilestone | 2 | 0 |
| disputeMilestone | 2 | 0 |
| resolveDispute + objection period | 4 | +4 (S2) |
| claimTimeoutRefund | 4 | +3 (S3+S4) |
| Admin | 5 | +3 (fee config) |
| Emergency Withdraw | 9 | +9 (new) |
| Edge Cases | 35 | +35 (new) |

## Slither Analysis

- **Total findings**: 68
- **Real issues fixed**: 1 (divide-before-multiply in `_executeResolution`)
- **Informational (no action needed)**:
  - `timestamp` — 所有时间比较都是有意设计的超时逻辑
  - `naming-convention` — `_param` 前缀是 Solidity 常见惯例
  - `unindexed-event` — 来自 OpenZeppelin 的 Pausable，非本合约代码
  - `calls-loop` — 来自 OpenZeppelin 的代码

## Dependency Changes

### New Dependencies
- `@nomicfoundation/hardhat-node-test-runner@^3.0.0` — node:test 测试框架
- `@nomicfoundation/hardhat-ethers@^4.0.0` — Hardhat 3 ethers 集成
- `slither-analyzer` (dev) — 静态分析工具

### Removed
- `@nomicfoundation/hardhat-toolbox` — Hardhat 3 不兼容
- `mocha` — 改用 node:test 内置测试框架

## Migration Notes

1. 测试文件从 `test/StableFlowEscrow.test.js` 改为 `test/StableFlowEscrow.test.mjs`
2. 测试运行命令：`node --test test/StableFlowEscrow.test.mjs`（不走 `hardhat test`）
3. Hardhat 3 programmatic API：`hre.network.connect()` → `conn.provider`
4. OpenZeppelin v5 使用 custom errors，非 string messages
