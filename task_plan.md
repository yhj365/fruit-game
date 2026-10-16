# Task Plan: 天蓝色 UI/UX 与数据库启动检查

## Goal
为水果跑灯游戏建立可持续的 UI/UX 规范，落地天蓝色游戏厅界面，并在应用启动时验证数据库连接且在失败时输出 `console.error`。

## Current Phase
Phase 5

## Phases

### Phase 1: Requirements & Discovery
- [x] 理解界面、主题与数据库启动检查需求
- [x] 阅读现有页面、样式、数据库客户端和仓库状态
- [x] 记录产品与技术发现
- **Status:** complete

### Phase 2: Planning & Structure
- [x] 建立项目 UI/UX 治理文档并在 `AGENTS.md` 添加入口
- [x] 确定天蓝色视觉方向与启动连接检查方案
- [x] 记录页面设计简报
- **Status:** complete

### Phase 3: Implementation
- [x] 统一全局天蓝色设计令牌与各页面布局
- [x] 改善游戏页的状态、反馈与移动端操作
- [x] 实现服务端数据库连接检查
- **Status:** complete

### Phase 4: Testing & Verification
- [x] 运行静态检查和生产构建
- [x] 在浏览器中检查主要页面的视觉与响应式表现
- [x] 验证连接失败路径会输出 `console.error`
- **Status:** complete

### Phase 5: Delivery
- [x] 整理改动与验证结果
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 采用浅天蓝、白色与深海蓝的游戏厅方向 | 更符合指定主题，也能让水果图标和关键操作清晰突出。 |
| 使用 Next.js `instrumentation.ts` 做启动检查 | 仅在服务端注册阶段执行，不会把数据库凭据或检查逻辑带进浏览器。 |
| 失败仅记录 `console.error`，不阻断应用进程 | 符合“连接失败需要 console.error”的需求，同时仍可显示非数据库页面。 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `pnpm build` 因无交互环境拒绝清理 `node_modules` | 1 | 不自动删除依赖目录；改用非破坏性检查并明确记录。 |
| TypeScript 检查缺少 `jest` 类型声明 | 1 | 移除了未安装且项目未使用的类型引用，随后 TypeScript 和生产构建均通过。 |
