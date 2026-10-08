## Zone 后端（z2-blog-api）

[![AUR](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](https://github.com/z2devil/z2-blog-web/blob/main/LICENSE)

个人内容站点 Zone 的后端服务，提供邮箱验证码登录、笔记（含私密笔记）、标签、统计、OSS 上传、AI 辅助生成等接口。前端仓库见 [z2-blog-web](https://github.com/z2devil/z2-blog-web/)。

## 示例

[我的个人网站](https://z2devil.cn?_blank)

## 技术栈

- 运行时：Node.js 22、TypeScript、Express 4
- 数据存储：MongoDB（Mongoose 6）
- 缓存与验证码：Redis（node-redis 4）
- 认证：JWT（jsonwebtoken 9），token 同时存于 Redis 以支持续期与失效
- 校验：Zod
- 日志与可观测性：pino，`X-Request-ID` 请求关联，`/health/live`、`/health/ready` 健康检查
- 其他：阿里云 OSS（ali-oss）、邮件（nodemailer）、OpenAI 兼容接口（openai）、定时任务（node-cron）
- 包管理：pnpm 10

## 本地启动

前置依赖：Node.js 22、pnpm 10、可访问的 MongoDB 与 Redis 实例（本地可用 Docker 启动）。

```bash
pnpm install

# 配置环境变量：以 .env.example 为模板，按其中说明填写 MongoDB、Redis、OSS、邮件、JWT、AI 等配置
cp .env.example .env

pnpm dev        # 开发模式（ts-node-dev 热重载）
```

服务默认监听 `2333` 端口，接口统一挂载在 `/api` 下。启动后可访问 `/health/ready` 确认 MongoDB 与 Redis 均已连通。

## 环境变量

所有可配置项及说明见仓库根目录的 [`.env.example`](./.env.example)。请勿将真实密钥、token 或 `.env` 文件提交到仓库。

## 常用命令

```bash
pnpm dev      # 本地开发
pnpm build    # 编译到 build/
pnpm start    # 运行编译产物
pnpm lint     # ESLint 检查 src 与 test
pnpm test     # 编译并运行 test/ 下全部 *.test.ts
```

## 功能

- 安全：权限过滤与拦截、私密笔记读取范围由服务端查询条件保证
- 用户：邮箱验证码登录/注册（Redis 控制验证码过期与冷却）、随机昵称、token 校验与自动续期
- 内容：笔记、标签、分类聚合与统计、浏览量
- 异常处理：统一异常处理与统一返回结构

## 部署

推送到 `master` 后由 GitHub Actions（`.github/workflows/main.yml`）执行 lint、测试与构建，再构建 Docker 镜像（同时打 `latest` 与提交 SHA 标签）并部署，部署后通过 `/health/ready` 校验版本与依赖就绪状态。
