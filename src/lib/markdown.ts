import { marked } from 'marked';

marked.use({
  gfm: true,
  breaks: false,
});

/**
 * 把 Markdown 字符串渲染成 HTML。
 * 内容由站点作者本人撰写，因此不做 HTML 转义过滤。
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown.trim(), { async: false }) as string;
}
