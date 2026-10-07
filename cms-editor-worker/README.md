# X-Laboratory 可视化内容后台

本 Worker 为实验室网站提供可视化内容编辑、独立编辑账号、登录后预览、回收站和受检查保护的发布流程。正式站仍由 GitHub Pages 发布；Pages CMS 暂时保留为维护者回退入口。后台不提供代码、密钥、模板或服务器设置编辑。

## 编辑人员怎么用

打开部署后的 `https://<worker-host>/editor/`，使用管理员发放的个人账号登录。所有编辑账号权限相同。先在真实页面上点要改的文字或区块，或从左侧栏目打开内容；选中文/英文后修改，按“保存并预览”。编辑者共用一个草稿版本，草稿预览需要后台登录。确认页面后按“发布这个版本”；GitHub Actions 必须先通过 Hugo 构建、双语审计和站点检查，Worker 才会合并到 `main`，随后 GitHub Pages 部署正式网站。

删除先进入回收站。编辑者可以提交恢复；只有管理员能为已发布的回收站内容发起永久清理 PR。恢复或永久清理同样需要发布检查。

## 维护者部署

1. Cloudflare Pages 项目 `x-laboratory-preview` 已连接 `X-laboratory-678/X-laboratory`，生产分支为 `main`，构建输出目录为 `public`，`HUGO_VERSION=0.164.0`。构建会先运行 `scripts/audit-content-pairs.py`，再按分支执行 Hugo 构建，最后运行 `scripts/audit-site.py public`；非生产分支使用预览环境并包含草稿。项目域名是 `x-laboratory-preview.pages.dev`，该值已写入 `wrangler.toml` 的 `PAGES_PREVIEW_DOMAIN`。正式网站继续由 GitHub Pages 发布；`functions/_middleware.js` 保护 Pages 的全部预览静态资源。`PREVIEW_SITE_PATH` 必须与 GitHub Pages 子路径一致（当前为 `/X-laboratory/`）。
2. 生成一个独立的高熵随机预览密钥，在 Cloudflare Pages 项目的 Preview 环境和编辑 Worker 的加密 Secrets 中分别设为 `PREVIEW_SHARED_SECRET`。不要把密钥写入仓库或前端文件。非 `main` 分支缺少密钥或请求头不匹配时，Pages Function 会返回 404；编辑 Worker 只在确认编辑者已登录后才附加 `X-XLab-Preview-Secret` 请求头。确认保护已部署并通过验证后，再移除 Pages 预览域名上的 Cloudflare Access 层。
3. 配置 Worker 的 D1 数据库 `x-lab-cms-editor`，按顺序应用 `migrations/0001_initial.sql` 和 `migrations/0002_visual_cms.sql`。迁移会保留已有账号表和会话表，再增加共享草稿工作区、草稿索引和回收站表。
4. 配置 Worker secrets：`PASSWORD_PEPPER`、`GITHUB_APP_ID`、`GITHUB_APP_PRIVATE_KEY`、`GITHUB_WEBHOOK_SECRET`、管理员 GitHub OAuth 的 `ADMIN_GITHUB_CLIENT_ID` 和 `ADMIN_GITHUB_CLIENT_SECRET`，以及 Pages 预览代理用的 `PREVIEW_SHARED_SECRET`。GitHub App 只安装到目标仓库；安装权限至少要能读内容、写内容/创建 PR、读取检查，并接收 `check_suite`、`deployment_status` webhook。OAuth callback 为 `https://<worker-host>/auth/github/callback`。
5. 确认 `wrangler.toml` 中的 D1 ID、仓库、生产站点和预览路径正确，运行 `npm ci`、`npm run check`、`npm run db:migrate:remote`，然后 `npm run deploy`。执行完再用管理员 GitHub 登录后台创建第一个编辑账号，私下交付一次性设置链接。
6. 在测试分支验证分支预览、Pages Function 保护和 PR 合并前检查；确认新后台能编辑和恢复内容后，再把后台链接交给实验室成员。正式站的原 GitHub Pages 发布流程继续保留。

### 必需的 Worker 变量与 secrets

非秘密变量见 `wrangler.toml`。Secrets 必须使用 `wrangler secret put <NAME>` 输入到 Cloudflare，或在 Worker 设置中添加为 Secret：

- `PASSWORD_PEPPER`：新生成的随机密码学密钥。
- `GITHUB_APP_ID`、`GITHUB_APP_PRIVATE_KEY`、`GITHUB_WEBHOOK_SECRET`：目标仓库 GitHub App 的凭据。
- `ADMIN_GITHUB_CLIENT_ID`、`ADMIN_GITHUB_CLIENT_SECRET`：仅用于 GitHub 管理员登录的 OAuth App。
- `PREVIEW_SHARED_SECRET`：Pages 项目 Preview 环境与编辑 Worker 必须设置相同的高熵随机密钥，仅用于 Worker 到 Pages Function 的服务器间认证。

不要复用曾在聊天、截图或公开日志中出现的令牌。若上述 secrets 缺失，相关功能应报错关闭，而不是绕过保护。

## 本地检查

```powershell
npm ci
npm run check
npm run db:migrate:local
npm run dev
```

本地运行完整登录、GitHub PR 和预览代理仍需 Cloudflare 与 GitHub 配置。任何生产部署都应先在隔离分支验证；不要直接测试写入 `main`。
