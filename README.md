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

所有可编辑内容统一存放在 `src/data/site.json`，可视化编辑器也读写该文件。`src/data/site.ts` 只声明类型并转发数据，不在其中填写内容。

- `profile`：姓名、院校、简介及 GitHub 链接。
- `home`：首页引导语、额外链接、研究兴趣、教育背景、科研与实习经历。
- `blogCategories`、`posts`、`projects`、`publications`：博客分类及各栏目的内容。
- `public/images/avatar.png`：头像；可替换为个人照片。

双语文本使用 `{ "zh": "中文", "en": "English" }`。博客与项目的 `body.zh`、`body.en` 均为 **Markdown 字符串**，不是段落数组。JSON 中用 `\n\n` 分隔段落，支持加粗、列表和图片，例如 `"第一段。\n\n**第二段。**"`。

## 博客分类与草稿

博客使用以下两类内容：

| 稳定 ID | 中文名 | 英文名 |
| --- | --- | --- |
| `reflections` | 研究随想 | Research Reflections |
| `knowledge` | 知识输出 | Knowledge Sharing |

分类名称与介绍在 `blogCategories` 中以双语填写。文章的 `category` 填分类 **ID 字符串**，例如 `"knowledge"`。以后调整名称时，只需修改分类的 `name` 和 `description`，保留 `id`，既有文章的归属不变。

`posts` 已预留一篇“强化学习 / Reinforcement Learning”草稿，正文、摘要和日期尚未填写。`draft: true` 的文章不出现在公开列表中，也不生成详情页；`draft: false` 或省略该字段表示发布。

草稿状态只控制网站页面的生成；本仓库公开，提交到 GitHub 的草稿原文仍可在源码中查看。

添加文章时，将以下对象加入 `posts` 数组；这是字段示例，不是已发布文章：

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
  "body": { "zh": "", "en": "" }
}
```

发布前填写中英文标题、摘要与 Markdown 正文，填写 `YYYY-MM-DD` 格式的 `date` 和以分钟计的 `readTime`，然后将 `draft` 改为 `false`。`slug` 应唯一且稳定；上例发布后的地址为 `/zh/blog/my-note/` 和 `/en/blog/my-note/`。

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
