# 启航科研智能体 · 写作模块

学术论文 AI 写作助手。从「课题 + 实验材料」生成符合 CVPR 投稿格式的完整论文，并一键编译成 PDF。

**当前支持**：CVPR 2026  
**技术栈**：React 19 + Vite 8 + Tailwind CSS 4 + TypeScript + Node.js (Express) + Qwen

---

## 目录

- [功能概览](#功能概览)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [核心文件详解](#核心文件详解)
  - [数据结构](#数据结构)
  - [前端核心](#前端核心)
  - [后端核心](#后端核心)
- [常见开发任务](#常见开发任务)
- [常见问题](#常见问题)
- [协作规范](#协作规范)

---

## 功能概览

### 10 步写作流程

| 步骤 | 文件 | 功能 |
|------|------|------|
| ① 上传素材 | `Step1Upload.tsx` | 课题 + 3 个文件（实验细节 / 实验结果 / 引用文献） |
| ② 标题与摘要 | `Step2TitleAbstract.tsx` | AI 生成 + 字数统计 + 翻译 |
| ③ 引言 | `Step3To8Text.tsx` | 同上（复用一个组件） |
| ④ 相关工作 | `Step3To8Text.tsx` | 同上 |
| ⑤ 算法介绍 | `Step5Algorithm.tsx` | AI 生成 + 2 张配图管理 |
| ⑥ 实验结果 | `Step6Experiment.tsx` | AI 生成正文 + 自动生成表格 |
| ⑦ 讨论和展望 | `Step3To8Text.tsx` | 同上 |
| ⑧ 引用文献 | `Step8References.tsx` | 解析 .bib 文件 |
| ⑨ 全文预览 | `Step9Preview.tsx` | 中英对照 + 全文翻译 |
| ⑩ 生成 LaTeX | `Step9Export.tsx` | 一键编译 PDF / 下载 zip |

### 核心能力

- ✨ AI 逐章生成（Qwen）
- 🌐 中英对照翻译（单章 + 全文）
- 📊 中英字数统计 + 推荐范围
- 🖼 图片上传/URL/生成/查看大图
- 💾 localStorage 自动持久化
- 📄 一键编译 CVPR PDF

---

## 快速开始

### 环境

| 工具 | 版本 |
|------|------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| TeX Live | 2024/2025（仅编译 PDF 用） |

### 启动

```bash
# 1. 克隆
git clone https://github.com/czt119740/writing.git
cd writing

# 2. 安装
npm install

# 3. 配置 server/.env（见下方）
# 4. 两个窗口分别启动
npm run dev      # 前端 http://localhost:5173
npm run server   # 后端 http://localhost:3001

#writing/
├── public/                      # 静态资源
├── server/
│   ├── templates/cvpr/          # CVPR 模板（后端编译时用）
│   │   ├── cvpr.sty
│   │   ├── preamble.tex
│   │   └── ieeenat_fullname.bst
│   ├── .env                     # 环境变量（不上传 git）
│   └── index.js                 # 后端主文件
├── src/
│   ├── components/
│   │   ├── editor/              # 左导航 + 步骤条
│   │   │   ├── WritingSidebar.tsx
│   │   │   └── StepBar.tsx
│   │   ├── ui/                  # shadcn 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── dropdown-menu.tsx
│   │   └── writing/             # 10 个步骤组件 + 2 个工具组件
│   ├── data/
│   │   ├── writing.ts           # 章节数据（旧）
│   │   └── writingSteps.ts      # ★ 步骤定义 + WritingData 类型
│   ├── lib/
│   │   ├── cvprTex.ts           # ★ CVPR LaTeX 生成
│   │   ├── qwen.ts              # Qwen API 封装
│   │   ├── storage.ts           # localStorage 持久化
│   │   ├── translate.ts         # 翻译 API 封装
│   │   ├── wordCount.ts         # 字数统计
│   │   └── utils.ts             # cn() 工具
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LearnPage.tsx
│   │   └── EditorPage.tsx       # ★ 主页面，串联 10 个步骤
│   ├── App.tsx                  # 路由
│   ├── index.css                # Tailwind 主题
│   └── main.tsx                 # 入口
├── package.json
└── vite.config.ts