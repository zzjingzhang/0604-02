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
- 预约时间冲突检测
- 用户角色区分（顾客/商家）
- 登录注册功能
- JWT 身份认证

## 技术栈

**前端：**
- Vue 3
- TypeScript
- Tailwind CSS
- Vue Router
- Pinia
- Axios
- Vite

**后端：**
- Node.js
- Koa
- TypeScript
- SQLite
- JWT
- bcryptjs

## 项目结构

```
.
├── README.md                    # 项目说明文档
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── app.ts              # 应用入口
│   │   ├── routes/             # 路由
│   │   ├── controllers/        # 控制器
│   │   ├── models/             # 数据模型
│   │   ├── middleware/         # 中间件
│   │   ├── utils/              # 工具函数
│   │   └── config/             # 配置文件
│   ├── database/               # 数据库文件
│   ├── package.json
│   └── tsconfig.json
└── frontend/                    # 前端项目
    ├── src/
    │   ├── main.ts             # 应用入口
    │   ├── App.vue             # 根组件
    │   ├── router/             # 路由
    │   ├── store/              # 状态管理
    │   ├── views/              # 页面组件
    │   ├── components/         # 公共组件
    │   ├── api/                # API 请求
    │   └── utils/              # 工具函数
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 后端启动

1. 进入后端目录并安装依赖：

```bash
cd backend
npm install
```

2. 初始化数据库：

```bash
npm run init-db
```

3. 启动开发服务器：

```bash
npm run dev
```

后端服务将运行在 `http://localhost:8002`

### 前端启动

1. 进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

前端服务将运行在 `http://localhost:5102`

## 数据库初始化说明

首次运行项目需要初始化数据库：

```bash
cd backend
npm run init-db
```

初始化脚本会自动创建以下数据表：
- users - 用户表
- services - 服务项目表
- technicians - 技师表
- appointments - 预约表
- work_orders - 工单表

默认测试账号：
- 顾客账号：customer@example.com / 123456
- 商家账号：admin@example.com / 123456

## API 接口

### 认证接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录

### 顾客接口
- GET /api/services - 获取服务项目列表
- POST /api/appointments - 创建预约
- GET /api/appointments/my - 获取我的预约列表
- GET /api/appointments/:id - 获取预约详情

### 商家接口
- GET /api/admin/appointments - 获取所有预约
- PUT /api/admin/appointments/:id/status - 更新预约状态
- GET /api/admin/technicians - 获取技师列表
- POST /api/admin/technicians - 创建技师
- GET /api/admin/services - 管理服务项目
- POST /api/admin/services - 创建服务项目

## 预约时间冲突检测

系统会在创建预约时自动检测时间冲突：
- 检查同一技师在同一时间段是否已有预约
- 预约时间间隔至少为30分钟
- 工作时间：09:00 - 18:00

## 开发说明

### 端口配置
- 后端端口：8002
- 前端端口：5102

### 开发模式

```bash
# 后端热重载
cd backend && npm run dev

# 前端热重载
cd frontend && npm run dev
```

### 构建生产版本

```bash
# 后端构建
cd backend && npm run build

# 前端构建
cd frontend && npm run build
```

## 许可证

MIT
