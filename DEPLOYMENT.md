# AI Travel Assistant 部署指南

本文档提供三种主流部署平台的详细步骤，您可以选择最适合您的平台。

## 前置要求

1. **代码准备**
   - 确保所有代码已提交到 Git 仓库
   - 构建测试通过：`npm run build`

2. **环境变量配置**
   在部署平台配置以下环境变量：

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_DOUBAO_API_KEY=your_doubao_api_key
   ```

3. **外部依赖说明**
   - Supabase：数据存储和认证
   - 豆包 AI：AI 对话服务
   - Stripe：支付服务（可选，如需真实支付）

---

## 方案一：Vercel 部署（推荐）

Vercel 是最适合 React/Vite 应用的平台，提供：
- 全球 CDN 加速
- 自动 HTTPS
- 自动 CI/CD
- 免费额度充足

### 部署步骤

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /Users/liyijie/Desktop/1/ai-travel-assistant
   vercel
   ```

4. **配置环境变量**
   在 Vercel Dashboard 或 CLI 部署过程中配置环境变量。

5. **完成部署**
   Vercel 会提供部署 URL，通常是：
   ```
   https://your-project.vercel.app
   ```

### 优势
- ✅ 最快的部署平台
- ✅ 自动 HTTPS 和 CDN
- ✅ 零配置部署
- ✅ 预览环境
- ✅ 环境变量管理简单

### 注意事项
- 首次部署会自动创建 `vercel.json` 配置
- 后续部署只需推送代码即可自动部署
- 免费版每月 100GB 带宽

---

## 方案二：Netlify 部署

Netlify 是另一个优秀的部署平台，特别适合静态网站。

### 部署步骤

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **部署项目**
   ```bash
   cd /Users/liyijie/Desktop/1/ai-travel-assistant
   netlify deploy --prod
   ```

### 优势
- ✅ 简单的拖放部署（Dashboard）
- ✅ 持续部署
- ✅ 表单处理和函数支持
- ✅ 免费版 SSL 和 CDN

### 注意事项
- `netlify.toml` 配置文件已创建
- 推荐使用 CLI 而非拖放
- 免费版每月 100GB 带宽

---

## 方案三：Cloudflare Pages 部署

Cloudflare Pages 提供快速的全球 CDN 和 DDoS 保护。

### 部署步骤

#### 方法 A：使用 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署项目**
   ```bash
   cd /Users/liyijie/Desktop/1/ai-travel-assistant
   wrangler pages project create ai-travel-assistant
   wrangler pages deploy dist --project-name=ai-travel-assistant
   ```

#### 方法 B：使用 Git 集成

1. **连接 Git 仓库**
   在 Cloudflare Dashboard 中：
   - 选择 "Pages" → "创建项目" → "连接到 Git"

2. **配置构建设置**
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - Root 目录：`dist`

3. **自动部署**
   - 推送代码到 Git 仓库
   - Cloudflare 自动检测并部署

### 优势
- ✅ 全球最快 CDN（Cloudflare 网络）
- ✅ 免费 DDoS 保护
- ✅ 自动 HTTPS
- ✅ 免费无限带宽

### 注意事项
- `wrangler.toml` 配置文件已创建
- 需要安装 Wrangler 2.x 或更高版本

---

## 部署检查清单

部署前请确认：

- [ ] 所有代码已提交到 Git
- [ ] `npm run build` 构建成功
- [ ] 本地运行 `npm run dev` 测试正常
- [ ] `.env.local` 文件包含正确的 API keys
- [ ] Supabase 项目已创建并配置了 CORS
- [ ] 环境变量已在部署平台配置

---

## 部署后配置

### 域名配置（可选）

1. **购买域名**
   - 在 Namecheap、GoDaddy 等购买域名

2. **配置 DNS**
   - 在部署平台添加自定义域名
   - 更新 DNS 记录指向平台 URL

3. **等待 DNS 生效**
   - 通常需要 1-24 小时

### 环境变量设置

**Vercel Dashboard:**
```
Settings → Environment Variables
添加：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_DOUBAO_API_KEY
```

**Netlify Dashboard:**
```
Site settings → Environment variables
添加：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_DOUBAO_API_KEY
```

**Cloudflare Pages Dashboard:**
```
Settings → Environment and variables
添加：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_DOUBAO_API_KEY
```

---

## 性能优化建议

1. **代码分割**
   - Vite 已自动代码分割
   - 建议使用动态导入减少初始包大小

2. **图片优化**
   - 使用 WebP 格式
   - 压缩图片资源

3. **缓存策略**
   - 静态资源长期缓存（31536000秒）
   - HTML 文件短期缓存

4. **启用压缩**
   - Vite 自动启用 gzip/brotli 压缩
   - 已在配置文件中设置

---

## 常见问题

### 1. 构建失败

**问题：** `npm run build` 失败
**解决：**
   - 检查 Node.js 版本（需要 18+）
   - 删除 `node_modules` 重新安装
   - 清除缓存：`npm cache clean --force`

### 2. 环境变量未生效

**问题：** API 调用失败
**解决：**
   - 确认环境变量已设置
   - 检查拼写是否正确
   - 重新部署项目

### 3. Supabase 连接失败

**问题：** 数据库连接错误
**解决：**
   - 检查 Supabase URL 和 ANON_KEY 是否正确
   - 在 Supabase Dashboard 验证 CORS 设置
   - 确保项目未暂停

### 4. 支付功能

**问题：** Stripe 支付不工作
**原因：** 当前为模拟实现
**解决：**
   - 创建 Stripe 账号
   - 在 Stripe Dashboard 创建产品和价格
   - 实现后端 API 创建 Checkout Session
   - 或使用 Stripe Checkout 的 client-only 模式

---

## 监控和分析

### Vercel Analytics
- 自动启用
- 查看访问统计和性能指标

### Cloudflare Web Analytics
- 免费注册 Cloudflare Analytics
- 在网站中添加分析脚本

---

## 安全建议

1. **环境变量保护**
   - 永远不要提交 `.env.local` 到 Git
   - 使用部署平台的加密环境变量
   - 定期轮换 API keys

2. **HTTPS 强制**
   - 所有平台自动提供 HTTPS
   - 配置 HSTS 头部（可选）

3. **CORS 配置**
   - 在 Supabase 中配置正确的 CORS 源
   - 允许您的部署域名

---

## 技术支持

如遇到问题，请查看：

- **Vercel 文档**：https://vercel.com/docs
- **Netlify 文档**：https://docs.netlify.com
- **Cloudflare 文档**：https://developers.cloudflare.com/pages
- **React 文档**：https://react.dev
- **Vite 文档**：https://vitejs.dev

---

## 推荐部署流程

**快速开始（推荐 Vercel）：**

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 完成！访问提供的 URL
```

**完整流程（推荐 Vercel）：**

```bash
# 1. 推送代码到 Git
git add .
git commit -m "Prepare for deployment"
git push

# 2. 登录 Vercel 并部署
vercel login
vercel

# 3. 配置环境变量（在 Dashboard）
# 访问 https://vercel.com/dashboard 配置环境变量
```

---

## 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 推送更新
git add .
git commit -m "Update feature"
git push

# 3. Vercel 自动部署
# 代码推送后会自动触发部署
```

---

**部署成功后：**

- 访问您的应用 URL
- 测试所有功能（登录、订阅、AI对话）
- 配置自定义域名（可选）
- 设置监控和分析
- 通知用户访问新地址

祝您部署顺利！🚀
