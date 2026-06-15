# 汽车维修预约系统

一个基于 Vue3 + TypeScript + Tailwind CSS + Node.js + Koa + SQLite 的汽车维修预约管理系统。

## 功能特性

### 顾客端
- 查看维修项目
- 在线预约维修服务
- 查看预约记录
- 查看维修进度

### 商家端
- 工单管理
- 技师管理
- 预约排期
- 服务项目管理

### 系统特性
- 预约时间冲突检测（创建预约+分配技师双重校验）
- 用户角色区分（顾客/商家）
- 登录注册功能
- JWT 身份认证（密钥从环境变量读取）
- 基于后端的越权访问校验（工单/预约接口）
- 公开注册仅允许创建顾客账号，禁止自注册为管理员

## 技术栈

**前端：**
- Vue 3.4
- TypeScript 5.3
- Tailwind CSS 3.4
- Vue Router 4.3
- Pinia 2.1
- Axios 1.6
- Vite 5.1
- vue-tsc 2.0

**后端：**
- Node.js
- Koa 2.14
- TypeScript 5.2
- better-sqlite3 11.5
- jsonwebtoken 9.0
- bcryptjs 2.4
- dotenv 16.3

## 项目结构

```
.
├── README.md                    # 项目说明文档
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── app.ts              # 应用入口
│   │   ├── routes/             # 路由
│   │   │   ├── auth.ts         # 认证路由（注册/登录/个人信息）
│   │   │   ├── services.ts     # 顾客端服务项目路由
│   │   │   ├── appointments.ts # 顾客端预约路由
│   │   │   ├── technicians.ts  # 顾客端技师路由
│   │   │   ├── workOrders.ts   # 顾客端工单路由
│   │   │   └── admin.ts        # 管理员路由（工单/技师/服务/排期）
│   │   ├── controllers/        # 控制器
│   │   ├── models/             # 数据模型（SQLite DAL）
│   │   ├── middleware/         # 中间件（JWT认证+角色校验）
│   │   ├── scripts/initDB.ts   # 数据库初始化脚本
│   │   └── config/
│   │       ├── database.ts     # 数据库连接
│   │       └── jwt.ts          # JWT+环境变量加载（强制校验JWT_SECRET）
│   ├── database/               # SQLite 数据库文件目录
│   ├── .env                    # 本地环境变量（已加入.gitignore）
│   ├── .env.example            # 环境变量模板
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
└── frontend/                    # 前端项目
    ├── src/
    │   ├── main.ts             # 应用入口
    │   ├── App.vue             # 根组件
    │   ├── router/             # 路由（带角色守卫）
    │   ├── store/user.ts       # Pinia 用户状态
    │   ├── views/
    │   │   ├── Login.vue
    │   │   ├── Register.vue
    │   │   ├── customer/       # 顾客端4个页面
    │   │   └── admin/          # 商家端6个页面
    │   ├── layouts/            # 顾客/商家两套独立布局
    │   ├── api/                # API 请求模块
    │   └── utils/request.ts    # axios 拦截器（自动附加JWT）
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── tsconfig.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0（推荐 20+）
- npm >= 9

---

### 后端启动

#### 1. 安装依赖

```bash
cd backend
npm install
```

#### 2. 配置环境变量

复制模板文件并按需修改：

```bash
cp .env.example .env
```

必须修改 `.env` 中的 `JWT_SECRET` 为随机密钥（至少16字符）。若缺少该配置或密钥强度不足，**后端服务将拒绝启动**。

示例 `.env` 内容（仅供开发参考，生产环境务必使用强随机密钥）：

```env
# 必须项：JWT 签名密钥（生产环境请使用至少 32 字符的强随机字符串）
JWT_SECRET=dev-local-car-repair-secret-key-please-change-in-production-2024

# 可选项：JWT 过期时间（默认 7d）
JWT_EXPIRES_IN=7d

# 可选项：HTTP 服务端口（默认 8002）
PORT=8002
```

#### 3. 初始化数据库（首次运行）

```bash
npm run init-db
```

初始化脚本会自动创建 5 张表（users / services / technicians / appointments / work_orders），并写入测试数据。

#### 3.1 数据一致性修复

如果历史数据中存在预约与工单状态不一致的问题，可运行修复脚本（**可重复执行，不会重复破坏数据**）：

```bash
npm run fix-data
```

**修复规则：**
1. 工单状态优先（更能反映实际维修结果）
2. 工单 `waiting` → 预约 `confirmed`
3. 工单 `in_progress` → 预约 `processing`
4. 工单 `completed` → 预约 `completed`
5. 工单 `cancelled` → 预约 `cancelled`
6. 预约存在但工单缺失时，自动创建对应工单
7. 执行后输出修复数量统计

**修复原理：**
脚本位于 [fixDataConsistency.ts](backend/src/scripts/fixDataConsistency.ts)，在同一数据库事务中逐条核对并修正。

**示例输出：**
```
⚠️  预约#1 状态不一致: 预约=pending, 工单=in_progress → 应修正为 processing
   ✅ 已修正
⚠️  预约#3 没有对应工单，正在创建...
   ✅ 已创建工单，状态: waiting
...
修复结果统计:
  总预约数: 10
  状态一致: 7
  状态已修正: 2
  新建缺失工单: 1
  跳过（无映射规则）: 0
  错误: 0
```

#### 4. 启动开发服务器

```bash
npm run dev
```

后端服务将运行在 `http://localhost:8002`

#### 5. 生产构建

```bash
npm run build        # 类型检查+编译 TypeScript
npm start            # 用 Node 运行编译后的 dist/app.js
```

---

### 前端启动

#### 1. 安装依赖

```bash
cd frontend
npm install
```

#### 2. 启动开发服务器

```bash
npm run dev
```

前端服务将运行在 `http://localhost:5102`（已通过 Vite 代理 `/api` → `http://localhost:8002`）。

#### 3. 生产构建

```bash
npm run build        # vue-tsc 做严格类型检查，再由 Vite 打包
npm run preview      # 本地预览构建产物
```

---

## 数据库初始化说明

首次运行项目需要初始化数据库：

```bash
cd backend
npm run init-db
```

初始化脚本会自动创建以下数据表：
- users - 用户表（含 username / email / password_hash / role / phone）
- services - 服务项目表（含 name / description / price / duration 分钟）
- technicians - 技师表（含 name / phone / specialty / status=active|inactive）
- appointments - 预约表（关联 user / service / technician，含日期时间+状态）
- work_orders - 工单表（关联 appointment，含进度+开始/结束时间）

默认测试账号（**仅限开发环境，生产环境请在 initDB 后立即修改或删除**）：
- 顾客账号：customer@example.com / 123456
- 商家账号：admin@example.com / 123456

> **安全提示**：公开注册接口（POST /api/auth/register）**只能创建顾客账号**。
> 无论客户端提交任何 `role` 值，后端都会强制设为 `customer`。
> 商家管理员账号必须由 DBA 直接操作数据库创建，或通过独立的受控脚本创建。

---

## 安全与权限设计

### 1. JWT 密钥管理

- JWT 签名密钥必须通过 `JWT_SECRET` 环境变量提供，源码中**不包含任何硬编码密钥**。
- 启动时若 `JWT_SECRET` 缺失或长度 < 16 字符，后端立即退出（exit code 1），防止以不安全配置运行。
- 模板密钥仅存放于 `.env.example`，真实 `.env` 已加入 `.gitignore`，不会被提交。

### 2. 越权访问防护（后端校验）

所有需要权限的接口均在**后端**做二次校验，前端路由守卫仅作为体验优化：

| 接口 | 权限策略 |
|------|---------|
| GET /api/appointments/:id | 管理员可查全部；顾客仅能查看 `user_id` 为自己的预约 |
| GET /api/work-orders/:id | 管理员可查全部；顾客仅能查看属于自己的工单 |
| **GET /api/work-orders/appointment/:appointmentId** | **管理员可查全部；顾客修改预约ID无法查看他人工单**（越权漏洞已修复） |
| /api/admin/* | 仅允许 `role=admin` 用户访问（401 / 403 分级拒绝） |

### 3. 注册接口安全

- POST `/api/auth/register` 强制忽略请求体中的 `role` 字段，**只创建顾客账号**。
- 需新增管理员时：通过 `INSERT INTO users(..., role='admin')` 直接操作数据库，或另外部署带访问控制的脚本。

---

## API 接口一览

### 认证接口（公开）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册（仅能创建顾客） |
| POST | /api/auth/login | 用户登录 |
| GET  | /api/auth/profile | 获取当前用户信息（需登录） |

### 顾客接口（JWT 要求 role=customer 或 admin）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /api/services | 获取服务项目列表 |
| GET  | /api/services/:id | 获取单个服务项目 |
| POST | /api/appointments | 创建预约（含冲突检测） |
| GET  | /api/appointments/my | 获取我的预约列表 |
| GET  | /api/appointments/:id | 获取预约详情（后端校验归属） |
| POST | /api/appointments/check-conflict | 预检时间冲突（前端校验） |
| GET  | /api/technicians/active | 获取在职技师列表 |
| GET  | /api/work-orders/my | 获取我的工单列表 |
| GET  | /api/work-orders/:id | 获取单个工单（后端校验归属） |
| GET  | /api/work-orders/appointment/:appointmentId | 根据预约查工单（后端校验归属） |

### 管理员接口（JWT 要求 role=admin）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | /api/admin/appointments | 获取全部预约 |
| GET    | /api/admin/appointments/schedule/:date | 获取某日排期 |
| PUT    | /api/admin/appointments/:id/status | 更新预约状态 |
| **PUT** | **/api/admin/appointments/:id/technician** | **分配技师（含技师存在性+在职状态+时间冲突校验）** |
| GET    | /api/admin/services | 管理端列出服务 |
| POST   | /api/admin/services | 创建服务项目 |
| PUT    | /api/admin/services/:id | 更新服务项目 |
| DELETE | /api/admin/services/:id | 删除服务项目 |
| GET    | /api/admin/technicians | 列出全部技师（含停用） |
| POST   | /api/admin/technicians | 创建技师 |
| PUT    | /api/admin/technicians/:id | 更新技师（含状态） |
| DELETE | /api/admin/technicians/:id | 删除技师 |
| GET    | /api/admin/work-orders | 列出全部工单 |
| PUT    | /api/admin/work-orders/:id/status | 更新工单状态/进度 |
| PUT    | /api/admin/work-orders/:id/start | 开始工单（写入开始时间） |
| PUT    | /api/admin/work-orders/:id/complete | 完成工单（写入完成时间） |

---

## 预约时间冲突检测

冲突检测在以下**两处**独立执行，任何一处失败都拒绝写入：

1. **创建预约时**（顾客 POST /api/appointments）
2. **管理员分配技师时**（PUT /api/admin/appointments/:id/technician）

检测算法位于 [Appointment.ts](backend/src/models/Appointment.ts) 的 `checkTimeConflict`：
- 按天+目标技师维度查询所有未取消的预约
- 将所有时段换算成分钟数区间（startMinute ~ startMinute + duration）
- 判断新区间和任意已有区间是否存在重叠 `newStart < oldEnd AND newEnd > oldStart`
- 分配技师时支持传入 `excludeId`，避免把预约自身误判为冲突
- 工作时间校验：09:00 ~ 18:00（含午休）
- 时间粒度：30 分钟

分配技师时的额外校验：
- 技师ID不能为空
- 技师记录必须存在
- 技师状态必须是 `active`
- 关联服务记录必须能取到 duration

---

## 构建与类型检查

### 后端（TypeScript 严格模式）

```bash
cd backend
npm run build     # 无警告通过 tsc，产物输出 dist/
```

已修复的类型问题：
- `TS4023`（BetterSqlite3.Database 不能命名）：通过 `InstanceType<typeof Database>` 显式声明后解决。
- `TS2769`（jsonwebtoken sign 重载匹配失败）：`JWT_SECRET` 断言为 `jwt.Secret`，`expiresIn` 按库要求用 `any` 绕过严格字面量校验。

### 前端（vue-tsc 严格类型检查）

```bash
cd frontend
npm run typecheck   # 仅类型检查，不打包
npm run build       # 先 vue-tsc --noEmit，通过后再 vite build
```

已修复的类型/版本问题：
- `vue-tsc 1.x` 在 Node 24 下崩溃 → 升级到 `vue-tsc@2.0.6` + `typescript@5.3.3` + `vite@5.1.4` + `@vitejs/plugin-vue@5`
- `$event.target` 可能为 null / 无 `value` 属性 → 断言为 `HTMLSelectElement`
- `from` 参数未使用 → 前缀 `_` 忽略

**依赖版本调整后必须重新安装并生成新的 lock 文件**，命令为：

```bash
rm -rf node_modules package-lock.json && npm install
```

---

## 开发说明

### 端口配置
- 后端端口：8002（可通过 `PORT` 环境变量覆盖）
- 前端端口：5102（Vite 配置，已写入 vite.config.ts）

### 开发模式命令

```bash
# 后端热重载（ts-node-dev）
cd backend && npm run dev

# 前端热重载（Vite HMR）
cd frontend && npm run dev
```

### 已修复问题清单（本次迭代）

1. ✅ **禁止通过公开注册接口创建管理员**：`authController.register` 强制 `userRole = 'customer'`，忽略任何客户端传入的 role。
2. ✅ **工单 byAppointmentId 越权访问**：`getWorkOrderByAppointment` 对非 admin 用户做当前用户工单白名单匹配，403 拒绝越权。
3. ✅ **分配技师递归调用**：前端 `assignTechnician` 与 API 导入重名导致栈溢出 → 导入时重命名为 `assignTechnicianApi`，成功后刷新失败时重置下拉并提示原因。
4. ✅ **分配技师后端校验**：追加了 4 层校验（ID 必填 / 技师存在 / 状态 active / 时间冲突），任何失败返回 400+ 中文提示。
5. ✅ **JWT 密钥环境化**：从 `process.env.JWT_SECRET` 读取，不足 16 字符立即 `process.exit(1)`；新增 `.env.example` + `.gitignore`；补充 README 配置说明。
6. ✅ **前后端构建**：后端 `tsc` / 前端 `vue-tsc --noEmit && vite build` 均通过；`package-lock.json` 已重新生成。

## 许可证

MIT
