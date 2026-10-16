# 欢乐水果机

参考 [设计图](design/shuiguo.png) 制作的 24 灯水果跑灯游戏。项目使用 Next.js 16、React 19、TypeScript、Tailwind CSS 4、PostgreSQL 和 Drizzle ORM。游戏机面板按原图的黑色机框、蓝色中央舞台、左侧历史灯列、24 格外圈、数码计分条与八个下注键重建。

> 当前游戏积分和跑灯结果只保存在浏览器页面状态，刷新会回到初始 100 积分；注册赠送的数据库积分尚未与游戏局数同步。以下“当前可玩规则”描述现有代码，“扩展规则”描述需求与同类机型，不能视为已上线功能。

## 本地启动

### 环境要求

- Node.js 24（项目 `package.json` 的 Volta 配置为 24.14.0）
- pnpm（使用仓库的 `pnpm-lock.yaml`）
- PostgreSQL，且已创建一个可连接的数据库
- 使用数据库备份/恢复功能时，还需要 PostgreSQL 客户端工具 `pg_dump` 和 `pg_restore`

### 1. 配置环境变量

在项目根目录新建 `.env.local`。使用单个连接串：

```dotenv
DATABASE_URL=postgresql://fruit_user:your_password@localhost:5432/fruit_game
JWT_SECRET=replace-with-a-long-random-secret
```

或者使用分项配置（`DATABASE_URL` 存在时优先使用连接串）：

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fruit_game
DB_USER=fruit_user
DB_PASSWORD=your_password
JWT_SECRET=replace-with-a-long-random-secret
```

生产环境必须设置 `JWT_SECRET`。当前数据库客户端在 `NODE_ENV=production` 时要求 TLS；本地不支持 TLS 的 PostgreSQL 建议用开发模式启动。环境文件已被 `.gitignore` 忽略，不要提交真实密码。

`pnpm db:push` 是独立的 Drizzle 命令。运行前还需在当前 PowerShell 会话设置与 `.env.local` 相同的 `DATABASE_URL`，或设置上述 `DB_*` 变量，例如：

```powershell
$env:DATABASE_URL = 'postgresql://fruit_user:your_password@localhost:5432/fruit_game'
```

### 2. 安装、建表和启动

```powershell
pnpm install
pnpm db:push
pnpm dev
```

访问 `http://localhost:3000`。`pnpm db:push` 使用 `db/schema.ts` 将结构推送到已配置的数据库；请先备份任何已有数据，再对现有数据库执行结构变更。若要生成 Drizzle 迁移文件，使用 `pnpm db:generate`。

服务启动时，`instrumentation.ts` 会执行一次数据库 `select 1`。失败时服务器控制台输出 `Database connection check failed during startup.` 和原始错误，服务器仍可启动，依赖数据库的注册和登录功能可能无法使用。

### 生产构建

```powershell
pnpm build
pnpm start
```

注册成功后，用户表写入 100 积分。当前代码在第一次登录请求时，如果设置了 `DATABASE_URL` 且没有管理员，会尝试创建默认管理员账号 `admin`，初始密码为 `123456`；部署前必须修改这一默认凭据。仅使用 `DB_*` 分项变量时不会自动创建管理员。

## 数据库备份与恢复

以下命令以 PowerShell 为例，在已设置 `$env:DATABASE_URL` 的终端执行；`.env.local` 不会自动成为 PowerShell 环境变量。备份文件包含账户及密码哈希，应保存在受保护的位置；示例使用的 `backup/` 已加入 `.gitignore`。

### 备份

```powershell
New-Item -ItemType Directory -Force backup | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = "backup/fruit-game-$stamp.dump"
pg_dump --dbname="$env:DATABASE_URL" --format=custom --file="$backupFile"
```

`--format=custom` 生成可供 `pg_restore` 使用的压缩归档。执行结束后检查退出码和文件：

```powershell
$LASTEXITCODE
Get-Item $backupFile | Select-Object FullName,Length
pg_restore --list "$backupFile" | Select-Object -First 20
```

也可以用 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER` 分别传入 `--host`、`--port`、`--dbname`、`--username`；密码由 PostgreSQL 的交互提示、`PGPASSWORD` 环境变量或本机安全凭据文件提供，不要写进脚本仓库。

### 恢复到新数据库（推荐先演练）

先创建**空的目标数据库**，把它的连接串放在 `RESTORE_DATABASE_URL`，确认目标不是正在使用的生产库。下例假设连接用户有创建数据库的权限：

```powershell
createdb --host=localhost --port=5432 --username=fruit_user --template=template0 fruit_game_restore
$env:RESTORE_DATABASE_URL = 'postgresql://fruit_user:your_password@localhost:5432/fruit_game_restore'
pg_restore --dbname="$env:RESTORE_DATABASE_URL" --no-owner --exit-on-error --single-transaction "backup/fruit-game-YYYYMMDD-HHMMSS.dump"
psql --dbname="$env:RESTORE_DATABASE_URL" --command='SELECT count(*) FROM users;'
```

把文件名替换为实际备份文件。`--single-transaction` 在出错时回滚此次恢复；`--no-owner` 让目标连接用户拥有恢复后的对象。恢复完成后，检查 `users`、`game_rounds` 等表与关键数据，再把应用指向目标数据库。不要在已有数据的库上直接执行同一归档恢复，否则可能因对象已存在而失败。确需覆盖已有库时，应先单独备份目标库，再明确执行清理或重建步骤。

参考：[PostgreSQL `pg_dump`](https://www.postgresql.org/docs/current/app-pgdump.html)、[PostgreSQL `pg_restore`](https://www.postgresql.org/docs/current/app-pgrestore.html)。

## 当前可玩的游戏规则

### 盘面与下注

棋盘为 7×7 外框，中间 5×5 是蓝色显示区，四边合计 24 个结果格。灯从左上角开始，沿上边 → 右边 → 下边 → 左边顺时针移动。左侧最多显示最近 10 次停灯记录。

下方有八种下注项目：BAR、77、双星、西瓜、铃铛、木瓜、橙子、苹果。点击图案按钮一次增加 1 积分，点图案下方的“−”减少 1 积分；每项范围为 0–99。支持同时押多个项目，也可“清空下注”。图案下方显示本机该项目的基础倍率：

| 下注项目 | 基础倍率 |
|---|---:|
| BAR | ×50 |
| 77 | ×20 |
| 双星 | ×20 |
| 西瓜 | ×20 |
| 铃铛 | ×10 |
| 木瓜（参考图中为绿色果实造型） | ×10 |
| 橙子 | ×10 |
| 苹果 | ×5 |

格子上单独标注的倍率优先，例如 BAR ×25、BAR ×50、苹果 ×2、西瓜 ×2、77 ×2 等；押中这些格子时按**该格倍率**结算。上表只是下注键的常规倍率提示。

### 24 格位置与倍率

从左上角开始，按顺时针索引：

| 位置 | 结果 | 倍率 | 位置 | 结果 | 倍率 |
|---:|---|---:|---:|---|---:|
| 0 | 橙子 | ×10 | 12 | 橙子 | ×10 |
| 1 | 铃铛 | ×10 | 13 | 铃铛 | ×10 |
| 2 | BAR | ×25 | 14 | 77 | ×2 |
| 3 | BAR | ×50 | 15 | 77 | ×20 |
| 4 | 苹果 | ×5 | 16 | 苹果 | ×5 |
| 5 | 苹果 | ×2 | 17 | 木瓜 | ×2 |
| 6 | 木瓜 | ×10 | 18 | 木瓜 | ×10 |
| 7 | 西瓜 | ×20 | 19 | 双星 | ×20 |
| 8 | 西瓜 | ×2 | 20 | 双星 | ×2 |
| 9 | GOOD LUCK | 特殊 | 21 | GOOD LUCK | 特殊 |
| 10 | 苹果 | ×5 | 22 | 苹果 | ×5 |
| 11 | 橙子 | ×2 | 23 | 铃铛 | ×2 |

### 开始、中奖与收分

1. 下注总额至少为 1，且不得超过当前余额。按“开始”时一次扣除所有下注积分。
2. 跑灯经过 48–95 个位置后停下；普通格只对当前押注的同类项目派奖：`该项目下注积分 × 停灯格倍率`。未押中该项目时，该格奖金为 0。其余项目的下注已在开局时扣除。
3. 若第一次停在 `GOOD LUCK`，本局额外跑灯两次，两个结果分别计算并累加。额外跑灯再次遇到 `GOOD LUCK` 不会继续连锁加送。
4. 中奖积分先进入“待收取”状态。按“收分”将其加入余额；调整下注时也会自动收分。未中奖时可保留当前下注再次按“开始”。
5. 中奖后可选择“猜小 1–7”或“猜大 8–14”。系统等概率抽取 1–14：猜对时将参与积分加到待收取奖金，猜错时从待收取奖金扣除参与积分；仍有待收取积分就能继续猜或收分。“减半/加倍”调整参与积分，范围为 1 到当前待收取奖金。

中央“下注时间”显示 15 秒循环倒计时，目前只作为视觉提示，**不会自动开始游戏**。游戏结果采用浏览器端随机数，不具备服务端防作弊或真实交易保障；当前所有游戏积分、下注、结果与历史记录刷新后都会重置。

## 同类机型规则与待实现功能

网络资料中“水果机”“小玛莉”有多种机型，并不存在统一的倍率或特殊奖表。本项目以设计图及 [需求文档](game-requirements.md) 为主，以下玩法目前**尚未实现**：

- 红连中、蓝连中、开火车、多格同时中奖、大三元/小三元、大四喜、大满贯等组合奖。资料只确认这些奖型存在，触发概率及结算方式随机型变化。
- 需求文档中的长按连续下注、键盘 1–8 快捷下注、单双游戏、后台倍率配置。
- 游戏积分与数据库账户余额同步、游戏局和猜大小记录持久化，以及后台积分修改、重置密码。

本机按需求采用 **1–7 为小、8–14 为大**；有些发行商机型使用 **1–6 / 8–13** 且数字 7 是特殊结果，不能直接套用于本项目。`GOOD LUCK` 送灯数量也有版本差异，本项目固定为第一次停中时加送 2 次。

### 网络资料中的版本差异

| 发行商/机型 | 基础操作 | 特殊奖及比倍 | 与本项目的关系 |
|---|---|---|---|
| SunnyApp Tech《水果机 777》 | 八项下注，每项最高 99 分；停在已押图案按赔率计分 | 右 LUCK 直接开 5 灯，左 LUCK 启动总下注倍率转盘（最高 60 倍），大 BAR 送 2–3 灯；另有全灯、大/小三元和八仙过海 | 证明多个 LUCK 与组合奖会因机型而异；本项目未采用这套奖表 |
| SunnyApp Tech《水果小玛莉》 | 选择 1–8 种图案后按开始，停灯中奖 | 数字 7 可触发额外加倍跑灯；LUCK 送 2–3 灯 | 本项目只采用固定 2 次幸运加送，没有数字 7 额外奖励 |
| 一点鲜花《水果老虎機》 | 点击或长按水果下注，按开始跑灯，停灯按倍率得分 | 中奖可猜大小；宣传开火车、大/小三元、大/小四喜、九莲宝灯、大满贯 | 可作为扩展玩法名称参考，但发行说明未给出完整触发概率和公式 |
| 360 游戏《花果水果机》 | 苹果 5 倍，其余项目有多档动态倍率 | 猜小为 1–6、猜大为 8–13；不同机台可出现送灯等不同特别奖 | 与本项目 1–7 / 8–14 规则冲突，因此不能直接复制其数字区间或倍率 |

这些页面没有公布可统一适用的“红连中”“蓝连中”概率、组合奖结算公式或完整随机算法；在确定本项目的专属设计前，README 不会假设它们的数值。

资料参考（用于核对共通玩法和版本差异，非本项目规则的唯一依据）：[SunnyApp Tech《水果机 777》发行说明](https://play.google.com/store/apps/details?id=com.Sapp.MaLiElephant)、[SunnyApp Tech《水果小玛莉》发行说明](https://play.google.com/store/apps/details?id=com.Sapp.FruitMaLi)、[一点鲜花《水果老虎機》发行说明](https://play.google.com/store/apps/details?id=com.ydxh.slot)、[360 游戏《还记得小时候的水果机小玛莉吗？》](https://u.360.cn/hgsgj/article/116790)。
