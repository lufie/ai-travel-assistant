# Vercel Dashboard 使用指南

## 部署状态

您的应用正在部署到 Vercel，通常需要 **3-5 分钟**完成。

部署完成后，您将获得两个访问地址：
- **主域名**：https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app
- **备用域名**：https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app

---

## 快速访问

**立即访问您的应用：**
- [🚀 主域名](https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app)
- [🔄 备用域名](https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app)

---

## Vercel Dashboard

登录到 Vercel Dashboard：[https://vercel.com/dashboard/lufies/projects/ai-travel-assistant/settings](https://vercel.com/dashboard/lufies/projects/ai-travel-assistant/settings)

### 查看部署日志

1. 进入 Dashboard 后
2. 点击 "AI Travel Assistant" 项目
3. 点击 "Deployments" 标签
4. 点击最近的部署查看详细日志

### 查看访问信息

在 Dashboard 中您可以：
- 查看实时访问数据
- 查看域名配置
- 查看错误日志
- 重新部署

---

## 页面空白问题

如果您访问页面显示空白，可能的原因：

### 1. 测试文件

访问测试页面确认文件是否正常：
```
https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app/test.html
```

**测试页面功能：**
- ✅ 自动检测 index.html、assets 文件是否存在
- ✅ 显示构建时间
- ✅ 检测文件大小和状态

### 2. 浏览器缓存

**强制刷新：**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- 移动端: 关闭后重新打开

### 3. 网络问题

**使用开发者工具：**
- 按 `F12` 打开开发者工具
- 查看 Console 标签页
- 查看是否有错误信息

---

## 配置环境变量

为了让应用的所有功能正常工作，需要在 Vercel Dashboard 配置以下环境变量：

### 必需的环境变量

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_DOUBAO_API_KEY=your-doubao-api-key
```

**配置步骤：**
1. 访问 [Vercel Dashboard → Settings → Environment Variables](https://vercel.com/dashboard/lufies/projects/ai-travel-assistant/settings/environment-variables)
2. 选择环境：**Production**
3. 点击 "Create New"
4. 添加上面的环境变量
5. 点击 "Save"

### 如何获取这些值？

#### Supabase

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 在左侧菜单点击 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public** API Key

#### Doubao AI

1. 访问 [豆包控制台](https://console.volcengine.com/ark)
2. 点击 **API Keys** → **创建 API Key**
3. 选择应用："AI Travel Assistant"
4. 生成 API Key（建议选择按量计费）

---

## 实时监控

### Vercel Analytics

Vercel 会自动启用分析，您可以在 Dashboard 中查看：
- 页面访问量
- 地理位置
- 设备类型
- 性能指标

### 应用监控

如果您的 Supabase 项目有应用监控，可以查看：
- 数据库使用情况
- API 调用次数
- 存储使用量

---

## 常见问题

### Q: 页面无法访问？

**A:**
1. 检查 [Vercel Dashboard](https://vercel.com/dashboard) 项目状态
2. 等待部署完成（通常 3-5 分钟）
3. 刷新浏览器缓存

### Q: 功能无法使用？

**A:**
1. 检查环境变量是否正确配置
2. 打开浏览器开发者工具查看错误
3. 测试文件：`https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app/test.html`

### Q: 如何更新应用？

**A:**
1. 推送代码到 Git
2. 在本地运行 `npm run build` 构建
3. 等待 Vercel 自动部署

### Q: 想要自定义域名？

**A:**
1. 在 [Vercel Dashboard](https://vercel.com/dashboard/lufies/projects/ai-travel-assistant/settings) 选择 **Domains**
2. 添加您的自定义域名
3. 在 DNS 提供商处配置 CNAME 记录

---

## 下一步

配置好环境变量后，应用的所有功能就能正常使用：
- ✅ 用户登录/认证
- ✅ 数据持久化（保存行程）
- ✅ AI 对话
- ✅ 地图交互
- ✅ 订阅系统
- ✅ 多语言支持

**需要我帮助配置吗？**
- 帮助配置环境变量（如上方的 API keys）
- 帮助检查部署状态
- 其他技术支持

---

**访问地址：**
- 主：https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app
- 测试：https://ai-travel-assistant-n4fwdlktz-lufies.projects.vercel.app/test.html

祝您的应用上线成功！🎊
