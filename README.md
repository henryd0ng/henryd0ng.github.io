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

## 更新个人资料

- `src/data/site.ts` 的 `profile`：姓名、院校、简短介绍及 GitHub 链接。
- `src/components/Home.astro`：详细简介、研究兴趣、教育背景和科研经历。目前使用明确的待补充提示，请同时填写中文和英文。
- `public/images/avatar.png`：头像，当前来自 [henryd0ng 的公开 GitHub 资料](https://github.com/henryd0ng)，可替换为个人照片。
- `src/layouts/Base.astro`：站点导航、侧栏及页脚；姓名如需更改，也应同步这里的标题和文字。

博客、项目和论文的数据数组目前为空。以下仅为字段填写示例，不代表已发布内容或真实经历；替换为真实资料后，将对象加入 `src/data/site.ts` 对应数组。

## 添加博客

```ts
export const posts: Post[] = [{
  slug: 'my-note', date: '2026-10-30', readTime: 3, demo: false,
  category: { zh: '学习笔记', en: 'Study Notes' },
  title: { zh: '笔记标题', en: 'Note title' },
  excerpt: { zh: '填写文章摘要。', en: 'Add an article summary.' },
  body: { zh: ['填写第一段正文。'], en: ['Add the first paragraph.'] },
}];
```

`date` 使用 `YYYY-MM-DD`，`readTime` 单位为分钟。文章地址为 `/zh/blog/my-note/` 和 `/en/blog/my-note/`。

## 添加项目

```ts
export const projects: Project[] = [{
  slug: 'my-project', demo: false, art: 'orbit',
  title: { zh: '项目标题', en: 'Project title' },
  category: { zh: '研究项目', en: 'Research Project' },
  description: { zh: '填写项目简介。', en: 'Add a project summary.' },
  tags: ['Python'],
  body: { zh: ['填写工作内容与成果。'], en: ['Describe the work and results.'] },
}];
```

项目地址为 `/zh/projects/my-project/` 和 `/en/projects/my-project/`。当前类型要求 `demo` 和 `art`；真实条目填写 `demo: false`，`art: 'orbit'` 保留即可，当前页面不展示该插画字段。

## 添加论文

```ts
export const publications: Publication[] = [{
  id: 'my-paper-2026', year: 2026,
  title: { zh: '论文标题', en: 'Paper title' },
  authors: '填写作者名单 / Add author names',
  venue: { zh: '填写会议或期刊', en: 'Add conference or journal' },
}];
```

`id` 保持唯一；可按需添加 `pdf`、`code`、`url` 链接，尚无链接时省略。文件放入 `public/`，例如 `public/files/paper.pdf` 在数据中写为 `pdf: '/files/paper.pdf'`。

所有双语文本采用 `{ zh: '中文', en: 'English' }`；正文是中英文段落数组。博客和项目的 `slug` 应唯一且稳定。修改后运行 `npm run build`，列表与详情页会一起生成。

## GitHub Pages 发布

公开仓库 `henryd0ng/henryd0ng.github.io` 已创建。发布配置使用 `main` 分支：

1. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 将源码及锁文件提交并推送到 `main`；也可在 **Actions → Deploy to GitHub Pages → Run workflow** 手动运行。
3. 等待构建和部署成功，再访问 <https://henryd0ng.github.io> 验证页面。

`.github/workflows/deploy.yml` 自动安装依赖、构建、上传 `dist/` 并部署；手动运行也只允许 `main` 发布。工作流使用 GitHub 自动提供的令牌，无需在项目中保存个人访问令牌。

`astro.config.mjs` 的 `site` 已配置为 `https://henryd0ng.github.io`，无需额外仓库路径。以后使用自定义域名时，同步修改此配置和 GitHub Pages 域名设置。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[发布来源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
