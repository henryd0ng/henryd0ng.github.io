// 量公式宽度的「测量与登记」部分与浏览器、网络无关，单独放在这里，
// 既方便测试，也方便 scripts/measure-display-widths.mjs 专注在 CDP 连接上。

/** 把页面里量到的结果整理成 src/data/wide-display-tex.ts 的内容。 */
export function buildRegistry(measured, { column, describe }) {
  const wide = measured.filter((item) => item.width > column).sort((a, b) => b.width - a.width);
  const near = measured.filter((item) => item.width > column - 24 && item.width <= column);
  const entries = wide.map((item) => `  ${JSON.stringify(item.tex)}, // ${item.width}px`).join('\n');
  const urls = describe.urls.join('、');
  const source = `// 由 scripts/measure-display-widths.mjs 生成，请勿手工编辑。
// 手机上正文栏约 ${column}px，下列公式的实际宽度超过它，渲染时改为左对齐。
// 共 ${wide.length} 条（去重后 ${measured.length} 条独立公式）。
// 测量页面：${urls}
const WIDE_DISPLAY_TEX = new Set<string>([
${entries}
]);

export { WIDE_DISPLAY_TEX };
`;
  return { source, wide, near };
}

/** 从 Markdown 源码里数出独立公式块的数量，用来确认量到的确实是新页面。 */
export function countDisplayBlocks(markdown) {
  return (markdown.match(/^\$\$[\s\S]*?^\$\$/gm) ?? []).length;
}
