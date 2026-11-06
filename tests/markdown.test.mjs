import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/lib/markdown.ts';
import { WIDE_DISPLAY_TEX } from '../src/data/wide-display-tex.ts';

test('typesets inline mathematics next to Chinese and preserves MathML', () => {
  const html = renderMarkdown('价值为$V^\\pi(s)$，不是某次回报。');
  assert.match(html, /class="katex"/);
  assert.match(html, /<math /);
  assert.match(html, /encoding="application\/x-tex">V\^\\pi\(s\)/);
  assert.doesNotMatch(html, /\$V/);
});

test('renders multiline display mathematics at build time', () => {
  const html = renderMarkdown('$$\n\\begin{pmatrix}0.8&0.2\\\\0.3&0.7\\end{pmatrix}\n$$');
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<mtable/);
  assert.doesNotMatch(html, /<script/);
});

test('tags matrix-like display blocks for left alignment', () => {
  const multi = renderMarkdown('$$\n\\begin{aligned}a&=b\\\\c&=d\\end{aligned}\n$$');
  const matrix = renderMarkdown('$$\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$$');
  const single = renderMarkdown('$$\\mathbb{P}(A\\mid B)=\\frac{\\mathbb{P}(B\\mid A)\\mathbb{P}(A)}{\\mathbb{P}(B)}$$');
  const short = renderMarkdown('$$a=b$$');
  assert.match(multi, /^<div class="math-block math-block-wide"/);
  assert.match(matrix, /^<div class="math-block math-block-wide"/);
  assert.match(single, /^<div class="math-block"/);
  assert.doesNotMatch(single, /math-block-wide/);
  assert.match(short, /^<div class="math-block"/);
  assert.doesNotMatch(short, /math-block-wide/);
  assert.doesNotMatch(renderMarkdown('普通段落 $x=1$ 保持原样。'), /math-block/);
});

test('left-aligns the formulas registered by the width measurement script', () => {
  const registered = [...WIDE_DISPLAY_TEX][0];
  assert.ok(registered, '登记表不应为空');
  const html = renderMarkdown(`$$\n${registered}\n$$`);
  assert.match(html, /^<div class="math-block math-block-wide"/);
  // 登记表里的公式必须能被 KaTeX 正常排版，否则文章构建会直接失败。
  assert.doesNotMatch(html, /katex-error/);
});

test('keeps currency, inline code, and code fences out of mathematics', () => {
  const html = renderMarkdown('价格 \\$5。`$not_math$`\n\n```text\n$x$\n```');
  assert.doesNotMatch(html, /class="katex/);
  assert.match(html, /价格 \$5/);
  assert.match(html, /<code>\$not_math\$<\/code>/);
  assert.match(html, /<pre><code class="language-text">\$x\$/);
});

test('gives numbered headings deterministic chapter anchors', () => {
  const input = '## 4. 集中\n\n### 4.10 **Hoeffding**\n\n## Summary';
  const html = renderMarkdown(input);
  assert.match(html, /<h2 id="section-4">4\. 集中<\/h2>/);
  assert.match(html, /<h3 id="section-4-10">4\.10 <strong>Hoeffding<\/strong><\/h3>/);
  assert.match(html, /<h2>Summary<\/h2>/);
  assert.equal(renderMarkdown(input), html);
});

test('contains wide tables while parsing mathematics in their cells', () => {
  const html = renderMarkdown('| Model | Update |\n| --- | --- |\n| Beta | $a+s$ |');
  assert.match(html, /<div class="table-scroll" tabindex="0"/);
  assert.match(html, /<table>/);
  assert.match(html, /class="katex"/);
  assert.match(html, /<\/table>\s*<\/div>/);
});

test('parses Markdown and mathematics inside initially closed native details', () => {
  const html = renderMarkdown('<details class="recall-answer">\n<summary>核对答案</summary>\n\n**答案**是 $2/3$。\n\n$$\n\\mathbb E[X]=2/3\n$$\n\n</details>');
  assert.match(html, /<details class="recall-answer">/);
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
  assert.match(html, /<strong>答案<\/strong>/);
  assert.equal((html.match(/class="katex"/g) || []).length, 2);
});

test('rejects invalid formula commands instead of publishing broken mathematics', () => {
  assert.throws(() => renderMarkdown('$\\thisCommandDoesNotExist{x}$'), /Undefined control sequence/);
});
