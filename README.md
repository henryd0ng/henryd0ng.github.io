# Haoyu Dong 的个人主页

基于 Astro 的中英文学术个人主页，包含个人简介、教育背景、科研经历、博客、项目和论文，适配电脑与手机。

源码仓库：[henryd0ng/henryd0ng.github.io](https://github.com/henryd0ng/henryd0ng.github.io)。GitHub Pages 目标地址：<https://henryd0ng.github.io>；部署状态以仓库 Actions 和实际访问结果为准。

默认使用深色主题，可通过右上角按钮切换浅色并记住选择。中英文切换保留当前栏目或文章；两种语言的对应内容使用同一个 `slug`。首次访问根路径默认进入中文，之后使用已保存的语言选择。

## 本地运行

使用 Node.js 22，在项目根目录运行：

```bash
npm ci
npm run dev
```

默认开发地址为 `http://localhost:4321`。检查正式构建：

```bash
npm run build
npm run preview
```

构建结果位于 `dist/`，无需提交；`package-lock.json` 应随源码提交。

## 内容文件与个人资料

个人资料、栏目配置与文章元数据存放在 `src/data/site.json`，可视化编辑器读写该文件。博客正文推荐单独写在项目根目录下的 `content/blog/`；`src/data/site.ts` 负责类型与内容加载，不在其中填写文章。

- `profile`：姓名、院校、简介及 GitHub 链接。
- `home`：首页引导语、额外链接、研究兴趣、教育背景、科研与实习经历。
- `blogCategories`、`posts`、`projects`、`publications`：博客分类及各栏目的内容。
- `public/images/avatar.png`：头像；可替换为个人照片。

双语文本使用 `{ "zh": "中文", "en": "English" }`。博客与项目的 `body.zh`、`body.en` 仍支持 **Markdown 字符串**，不是段落数组；在 JSON 中用 `\n\n` 分隔段落。博客也可通过 `bodyFiles` 引用独立 Markdown 文件，具体方式如下。

## 博客分类与草稿

博客使用以下两类内容，默认显示“研究随想”，可切换到“知识输出”：

| 稳定 ID | 中文名 | 英文名 |
| --- | --- | --- |
| `reflections` | 研究随想 | Research Reflections |
| `knowledge` | 知识输出 | Knowledge Sharing |

分类名称与介绍在 `blogCategories` 中以双语填写。文章的 `category` 填分类 **ID 字符串**，例如 `"knowledge"`。以后调整名称时，只需修改分类的 `name` 和 `description`，保留 `id`，既有文章的归属不变。

## 编辑强化学习笔记

按主题命名为 **RL-xxx**，例如 `RL-probability`、`RL-sampling`，URL 使用小写 `rl-xxx`。当前只完成第一讲 **RL-probability：概率、集中与马尔可夫动力学**，中文正文在 [RL-probability.zh.md](content/blog/RL-probability.zh.md)。按原讲章节覆盖定义、定理假设、核心公式、计算例子和知识联系；不以概览替代正文。集中不等式可以省略证明，但必须保留条件与结论，并明确哪些只是证明思路。

[英文页](content/blog/RL-probability.en.md) 是明确标注的阅读导览，链接中文各章，不是完整译文。第二讲另行整理，不继续把旧版两讲概览当成完成稿。旧 `/zh/blog/reinforcement-learning/` 与 `/en/blog/reinforcement-learning/` 入口通过 [Astro 配置](astro.config.mjs) 跳转至新主题文章。

开头保留简短 **TL;DR** 与可点击目录；八个正文章节各有两道 Recall，文末另有五组综合练习。题目始终可见，答案使用原生 `<details>` 默认收起，不加 `open`。在 HTML 容器、`summary` 和其中的 Markdown 之间留空行，确保公式与列表被解析。内容样式在 [global.css](src/styles/global.css) 中维护，无需客户端公式解析脚本。

**资料分享边界：**原始课件与手写笔记仅作为阅读依据，不得复制进仓库、`public/` 或部署产物，也不提供下载链接或页面截图。阅读过程的临时提取文本与核查图片仅放在已忽略的 `.astro/lecture-notes/` 本地目录，不属于博客内容。源材料中的笔误应核实并在正文相应位置说明，不机械照抄。

正文按普通 Markdown 编写，支持标题、列表、表格、链接、图片、代码和数学公式。**不要重复写 `# 文章标题`**，页面会显示元数据中的标题。编号标题自动生成稳定锚点，例如 `## 4. 集中` 对应 `#section-4`，`### 4.10 Hoeffding` 对应 `#section-4-10`。

### 数学公式

[Markdown 渲染器](src/lib/markdown.ts) 在构建时使用 KaTeX 生成 HTML 与无障碍 MathML，样式和字体随站点本地部署，不依赖 CDN。

- 行内公式：`$V^\pi(s)$`，中文与美元符号之间不强制要求空格。
- 展示公式：将开始与结束的 `$$` 分别放在独立一行；长式子可用 `aligned` 主动分行。
- Markdown 表格中的条件符号使用 `\mid` 或 `\vert`，避免未转义的 `|` 被识别为列分隔符。
- 真正的美元金额用 `\$` 转义；代码块与行内代码里的美元符号不会被当作数学。
- 不支持的公式语法会使构建失败，而不是静默发布坏公式。宽表格与展示公式在自己的容器内横向滚动，不应撑宽整页。

发布前执行 `npm test` 和 `npm run build`，并检查桌面、手机与两种主题下的公式、表格、目录和折叠答案。

### 元数据与发布状态

文章在 [site.json](src/data/site.json) 的 `posts` 中注册，分类为 `knowledge`。标题、摘要、日期、阅读时长与草稿状态都在此修改，正文通过以下字段关联：

```json
"bodyFiles": {
  "zh": "RL-probability.zh.md",
  "en": "RL-probability.en.md"
}
```

`bodyFiles` 的文件名相对于 `content/blog/`，可分别填写 `zh`、`en`。配置的文件覆盖对应语言的 `body`；未配置时使用原有 `body.zh` 或 `body.en`，不会自动复制另一种语言。

可以先完成中文，再补英文正文或明确标注的英文导读；发布前应补齐两种语言的标题、摘要与页面内容。`draft: true` 的文章不出现在公开列表中，也不生成详情页；设为 `false` 或省略表示发布。第一讲地址为 `/zh/blog/rl-probability/` 与 `/en/blog/rl-probability/`。

草稿状态只控制网站生成；本仓库公开，提交到 GitHub 的草稿原文仍可在源码中查看。

## 添加另一篇博客

在 `content/blog/` 新建 Markdown 文件，再将元数据对象加入 `src/data/site.json` 的 `posts` 数组。例如，下例需要先创建 `content/blog/my-note.zh.md`：

```json
{
  "slug": "my-note",
  "date": "",
  "category": "knowledge",
  "title": { "zh": "笔记标题", "en": "Note title" },
  "excerpt": { "zh": "", "en": "" },
  "readTime": 0,
  "demo": false,
  "draft": true,
  "bodyFiles": { "zh": "my-note.zh.md" },
  "body": { "zh": "", "en": "" }
}
```

`slug` 应唯一且稳定，两种语言共用同一个 `slug`。研究随想类文章填写 `"category": "reflections"`；其余写作、翻译和发布步骤与强化学习草稿相同。

## 添加项目

将以下对象加入 `projects` 数组，并将占位文字替换为真实内容：

```json
{
  "slug": "my-project",
  "demo": false,
  "art": "orbit",
  "title": { "zh": "项目标题", "en": "Project title" },
  "category": { "zh": "研究项目", "en": "Research Project" },
  "description": { "zh": "填写项目简介。", "en": "Add a project summary." },
  "tags": ["Python"],
  "body": { "zh": "填写工作内容与成果。", "en": "Describe the work and results." }
}
```

项目地址为 `/zh/projects/my-project/` 和 `/en/projects/my-project/`。项目的 `category` 仍是双语文本；`demo` 和 `art` 是当前类型要求的字段，真实项目填写 `demo: false`，`art: "orbit"` 保留即可，页面不展示该插画字段。

## 添加论文

保留 `publications` 中已有条目，按需追加对象：

```json
{
  "id": "my-paper-2026",
  "year": 2026,
  "title": { "zh": "论文标题", "en": "Paper title" },
  "authors": "填写作者名单 / Add author names",
  "venue": { "zh": "填写会议或期刊", "en": "Add conference or journal" }
}
```

`id` 保持唯一。`title`、`authors` 可暂时省略；可按需添加双语 `status`、`note`，以及 `pdf`、`code`、`url` 链接。作者字符串支持用 `**姓名**` 加粗。文件放入 `public/`，例如 `public/files/paper.pdf` 对应 `"pdf": "/files/paper.pdf"`。

修改后运行 `npm run build` 并预览，确认中英文页面和链接；发布后的博客与项目会自动生成对应详情页。

## GitHub Pages 发布

公开仓库 `henryd0ng/henryd0ng.github.io` 已创建。发布配置使用 `main` 分支：

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 将源码及锁文件提交并推送到 `main`；也可在 **Actions → Deploy to GitHub Pages → Run workflow** 手动运行。
3. 等待构建和部署成功，再访问 <https://henryd0ng.github.io> 验证页面。

`.github/workflows/deploy.yml` 自动安装依赖、构建、上传 `dist/` 并部署；手动运行也只允许 `main` 发布。工作流使用 GitHub 自动提供的令牌，无需在项目中保存个人访问令牌。

`astro.config.mjs` 的 `site` 已配置为 `https://henryd0ng.github.io`，无需额外仓库路径。以后使用自定义域名时，同步修改此配置和 GitHub Pages 域名设置。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[发布来源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
