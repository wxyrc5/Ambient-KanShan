# 桌边看山 · Ambient KanShan

> **知乎黑客松 S3 · 湾区共创季｜赛道 02：AI × 陪伴与交互**
> **参赛队伍**：独坐敬亭山（单人参赛）
> **项目仓库**：https://github.com/wxyrc5/Ambient-KanShan
> **在线零安装 Demo（开启 GitHub Pages 后生效）**：https://wxyrc5.github.io/Ambient-KanShan/

## 一句话定位
不做桌面上的知乎信息流，只做你**浏览知乎与阅读英文论文**旁边的知乎大脑：划词即出 L1 形象化理解（含英文长难句逐词拆解）、L2 破茧多维看法（附知乎证据构成条）、L3 高赞经典 × 潜力黑马回答，支持 7 天/20 词本地跨页记忆串联与一键生成「知乎想法」反哺社区。

## 目录结构
- `index.html`：零依赖单文件交互式 Web 沙盒（离线双击浏览器打开即玩，推送后可一键部署 GitHub Pages / CloudBase）
- `chrome-extension/`：可直接在 Chrome「加载已解压的扩展程序」运行的 Manifest V3 扩展（Shadow DOM 隔离）
- `proxy-server/`：统一 API 代理层示例（接入 `zhihu-cli`，含双路检索、72h LRU 缓存与直答 Agent 100 次/天配额保护）
- `.github/workflows/pages.yml`：推送 `main` 分支自动发布 GitHub Pages 在线 Demo

## 30 秒上传并上线线上 Demo
```bash
git init
git add .
git commit -m "feat: initial release of Ambient KanShan for Zhihu Hackathon S3"
git branch -M main
git remote add origin https://github.com/wxyrc5/Ambient-KanShan.git
git push -u origin main
```
随后在 GitHub 仓库 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**，1 分钟内即可获得永久可访问的在线 Demo 链接：`https://wxyrc5.github.io/Ambient-KanShan/`。

## 开源组件披露
- Tailwind CSS (MIT)、Lucide Icons (ISC)、Express (MIT)
- 本项目为 2026 知乎黑客松 S3 全新原创作品，核心交互状态机、证据构成条与跨页记忆串联均为独立编写。
