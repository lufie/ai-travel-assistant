# Claude Code 任务执行协议 (Standard Operating Procedure)

请你作为高级软件工程师，严格遵守以下流程来处理我的任务：

## 默认授权
对于非破坏性的脚本运行（如 npm run build、git push），无需询问我，请直接执行并在完成后汇报结果

## 深度诊断与 UI 精准度 (Analysis & Precision)

禁止盲目猜测：在修改任何代码前，必须先 ls 确认文件结构，并使用 cat 或 read 读取相关逻辑文件。

UI 约束：如果任务涉及 UI 修改，必须先读取项目中的 CSS 全局文件、tailwind.config.js 或相关的样式配置文件，确保修改符合现有设计系统。

方案确认：在正式改动前，简要列出你发现的问题根源和计划修改的代码点，等待我的 OK 指令。

## 最小化修改原则 (Minimal Impact)

仅针对问题点进行精准打击，严禁未经许可的大面积代码重构或格式化。

保持现有的命名习惯和代码风格。

## 预构建验证 (Pre-flight Check)

修改完成后，必须在终端执行 npm run build（或相应的构建命令）。

必须解决所有构建过程中的 Error 和影响生产环境的 Warning（如 chunkSizeWarningLimit 等）。

## Git 工作流与版本回溯 (Version Control)

原子化提交：每个独立 Bug 的修复必须对应一个单独的 Git Commit。

规范化信息：Commit Message 必须清晰，格式为：fix: [具体修复的内容描述]。

完成推送：构建成功并提交后，立即执行 git push。

## 生产环境同步 (Deployment)

确认推送成功后，请明确告知我：“代码已推送，Vercel 生产环境正在自动更新，请稍后访问线上地址验证。”

## 改动原则
路径校验：在引用样式、图片等资源时，优先使用相对路径。检查 vite.config.ts 中的 base 配置，确保其与 Vercel 部署环境一致（通常为 ./ 或 /）

