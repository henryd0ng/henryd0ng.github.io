import { Marked, Renderer, type Token, type Tokens } from 'marked';
import katex from 'katex';
import markedKatex from 'marked-katex-extension';
import { WIDE_DISPLAY_TEX } from '../data/wide-display-tex.ts';

const katexOptions = {
  nonStandard: true, // 中文与公式之间不强制要求空格。
  throwOnError: true, // 不把有语法错误的公式发布为静默降级的文本。
  strict: 'ignore' as const, // 允许公式内的中文说明。
  trust: false,
  output: 'htmlAndMathml' as const,
};

const katexExtension = markedKatex(katexOptions);

const multiLineEnvironments = /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|cases|array|aligned|align)\}/;

/**
 * 判断公式在手机上是否需要左对齐：带 & 的矩阵、分段、多行对齐环境一定会换行；
 * 其余公式按脚本实测的宽度登记（见 scripts/measure-display-widths.mjs），
 * 宽度超过手机正文栏时左对齐，避免首项被横向滚动藏住。
 */
function isWide(tex: string): boolean {
  if (multiLineEnvironments.test(tex)) return true;
  return WIDE_DISPLAY_TEX.has(tex.trim());
}

/** 给独立公式套一层容器：宽公式在窄屏上左对齐，避免首项被横向滚动藏住。 */
function displayBlock(tex: string): string {
  const wide = isWide(tex) ? ' math-block-wide' : '';
  const html = katex.renderToString(tex, { ...katexOptions, displayMode: true });
  return `<div class="math-block${wide}" data-tex="${encodeURIComponent(tex)}">${html}</div>\n`;
}

const markdownRenderer = new Marked(
  { gfm: true, breaks: false },
  katexExtension,
  {
    extensions: [
      {
        // 独占一段的 $$…$$ 先用我们自己的渲染器接管，其余公式仍交给 marked-katex-extension。
        name: 'blockKatex',
        level: 'block',
        renderer(token: Token) {
          const math = token as Token & { text?: string; displayMode?: boolean };
          if (math.displayMode === false) return false;
          return displayBlock((math.text ?? '').trim());
        },
      },
    ],
    renderer: {
      heading(token) {
        // 为编号章节生成稳定锚点，例如「4.10」对应 #section-4-10。
        const number = token.text.match(/^(\d+(?:\.\d+)*)[.\s]/)?.[1];
        const id = number ? ` id="section-${number.replaceAll('.', '-')}"` : '';
        return `<h${token.depth}${id}>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
      },
      paragraph(token: Tokens.Paragraph) {
        // 段落里独占一行的 $$…$$ 也包进同一个容器，行内公式保持原样。
        const tex = token.tokens.length === 1 ? inlineDisplayTex(token.tokens[0]) : null;
        if (tex !== null) return displayBlock(tex);
        return `<p>${this.parser.parseInline(token.tokens)}</p>\n`;
      },
      code(token: Tokens.Code) {
        if (token.lang !== 'math' || token.escaped) return Renderer.prototype.code.call(this, token);
        // 围栏形式 ```math 与 $$…$$ 等价，仍由 KaTeX 渲染；语法错误会让构建失败。
        return displayBlock(token.text.trim());
      },
      table(token: Tokens.Table) {
        // 宽表格在自己的容器里横向滚动，不撑宽整页。
        return `<div class="table-scroll" tabindex="0">${Renderer.prototype.table.call(this, token)}</div>\n`;
      },
    },
  },
);

function inlineDisplayTex(token: Token): string | null {
  const math = token as Token & { text?: string; raw?: string };
  const raw = (math.raw ?? '').trim();
  if (token.type !== 'inlineKatex' || !raw.startsWith('$$') || !raw.endsWith('$$')) return null;
  return (math.text ?? '').trim();
}

/**
 * 构建时渲染 Markdown 与数学公式，不向浏览器发送公式解析脚本。
 * 内容由站点作者本人撰写，因此保留原生 HTML（例如 details）。
 */
export function renderMarkdown(markdown: string): string {
  return markdownRenderer.parse(markdown.trim(), { async: false }) as string;
}
