# Findings & Decisions

## Requirements
- 在项目中沉淀 UI/UX 技能入口和设计规范。
- 将界面优化为天蓝色主题。
- 应用启动时测试 PostgreSQL 连接；失败时调用 `console.error`。

## Research Findings
- 项目为 Next.js 16、React 19、Tailwind CSS 4 和 Drizzle/Postgres.js。
- 首页、登录、注册、游戏和管理后台都复用旧的深色/金色视觉；游戏页使用浏览器 `alert` 显示下注错误。
- 数据库客户端在 `db/client.ts` 创建，连接字符串来自环境变量；目前没有启动检查。
- 工作区已有用户未提交的 `next.config.mjs` 改动，必须保留。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 使用项目级 `docs/frontend` 与简短 `AGENTS.md` 指针 | 将 UI/UX 流程固化到仓库，而不把长规则复制到代理指令。 |
| 使用 CSS 自定义属性和 Tailwind 工具类 | 可在不引入组件库的前提下统一全站颜色、阴影与状态样式。 |
| 用 `client` 的轻量 SQL 查询检查连接 | 可真实验证连接，而不仅检查环境变量。 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 现有 `next.config.mjs` 有用户改动 | 不修改该文件。 |
