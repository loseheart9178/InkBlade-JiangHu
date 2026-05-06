# Wave 36 Gameplay Teaching Design

## Goal

让第一次接触《云水江湖》的外部玩家，在不看文档的情况下也能更快读懂这款游戏真正特别的东西：角色专属机制、心境、墨痕、心法，以及路线/奖励决策的意义。

## Recommended Approach

采用“轻量提示带”方案，而不是教程弹窗墙或新手强制流程。

原因：

1. 当前项目已经有战斗 onboarding rail，说明提示式教学符合现有结构。
2. 这轮目标是 EA 展示面，不是完整新手引导；短提示更适合外部试玩节奏。
3. 地图、奖励、心法等面板已经是 DOM 表层，新增可关闭的提示带风险低、验证路径明确。

## Alternatives Considered

### A. 统一轻量提示带

在地图、战斗、奖励、心法等关键界面上显示 1 到 3 条短提示，支持关闭与持久化。

优点：

- 实现快，适合本轮波次
- 文案易迭代
- Playwright 好验收

缺点：

- 视觉冲击力不如强交互式教程

### B. UI 锚点式强提示

给真气、敌意、心境、墨痕等元素画引导箭头或浮层。

优点：

- 更强的首次理解效率

缺点：

- 布局风险大，桌面不同分辨率更容易相互遮挡
- 本轮不值得为此加复杂定位系统

### C. 术语抽屉 / 新手百科页

新增独立教程页或术语抽屉。

优点：

- 信息更全

缺点：

- 打断试玩节奏
- 更像说明书，不像展示版体验

## Final Design

### 1. Hint System Shape

保留现有 `dismissedOnboardingHintIds` 持久化路径，但把提示系统从“仅战斗”扩成“跨界面可复用”的 onboarding/hint 集合。

提示分两类：

- `combat`：战斗内提示，继续沿用现有 rail。
- `surface`：地图、奖励、心法等界面提示，使用统一横向提示带。

### 2. Surfaces To Teach

#### Combat

继续保留现有：

- 真气
- 手牌
- 敌意
- 护甲
- 收势

新增角色专属提示：

- 赵云：枪势与第三张攻击触发破阵
- 貂蝉：舞势与魅惑控制
- 蔡文姬：音律、净化、余韵
- 诸葛亮：筹策、观星、阵法

这些提示只在首次相关战斗出现，关闭后持久化。

#### Map

首次进入章节地图时展示短提示：

- 路线：精英/商店/休息/事件各自的构筑意义
- 心境：会影响事件、牌和结局，不只是战斗标签
- 墨痕：是整局长期风险，战后会吃生命代价

#### Reward

首次进入普通奖励时展示短提示：

- 三选一是在定构筑方向
- 跳过也是有效决策
- 已有的“主线强化 / 副线补强 / 通用补短”理由标签可以辅助判断

#### Method Reward

首次进入心法奖励界面时展示短提示：

- 心法是整局长期被动
- 后续精英可以继续让心法进境

### 3. Persistence Rules

- 全部提示都写入现有桌面设置存档。
- 关闭后跨刷新、跨继续游戏保持隐藏。
- 调试跳章不自动视为“玩家已经学会”，不会替玩家关闭教学提示。

### 4. Scope Boundaries

本轮不做：

- 强制教程流程
- 锚点箭头动画系统
- 新教程页面
- 术语弹窗重构
- 移动端适配

### 5. Testing Strategy

单测：

- 扩展设置/提示系统测试，覆盖新 hint id 正规化与角色专属 combat hint。

浏览器：

- 地图首次进入可见 map hints
- 赵云首次战斗可见角色专属 combat hint
- 奖励界面可见 reward hint
- 精英后心法界面可见 method hint
- 至少一条提示关闭后在 reload/continue 后保持关闭

## Files Expected

- `src/game/systems/tutorial/onboarding.ts`
- `src/app/inkbladeController.ts`
- `src/styles/theme.css`
- `tests/app-settings.test.ts`
- `tests/e2e/playable-flow.spec.ts`
- `Documentation.md`
