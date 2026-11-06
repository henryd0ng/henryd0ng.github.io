// 用无头 Chrome 量出每一条独立公式在手机宽度下的真实排版宽度，
// 生成 src/data/wide-display-tex.ts 供构建期判断是否需要左对齐。
//
// 用法：先 `npm run dev`，再 `node scripts/measure-display-widths.mjs`。
// 公式本身发生变化（改写、增删）时需要重新运行；脚本会对宽度接近阈值的公式给出提醒。

import { writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const CHROME = '/home/rimlab/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const DEV_URL = process.env.DEV_URL ?? 'http://127.0.0.1:4321/zh/blog/rl-probability/';
const PORT = Number(process.env.CDP_PORT ?? 9333);
/** 手机正文栏宽度：375 视口减去两侧内边距（343px），再留 1px 取整余量。 */
const COLUMN = Number(process.env.COLUMN ?? 344);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function evaluateAll(expression) {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((target) => target.type === 'page');
  if (!page) throw new Error(`没有找到可用的调试页面，请先启动：${CHROME} --remote-debugging-port=${PORT}`);
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve));
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      nextId += 1;
      pending.set(nextId, resolve);
      socket.send(JSON.stringify({ id: nextId, method, params }));
    });
  const run = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return response.result.result.value;
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: DEV_URL });
  await sleep(2500);
  const result = await run(expression);
  socket.close();
  return result;
}

const measured = await evaluateAll(`(async () => {
  const style = document.createElement('style');
  style.textContent = \`
    .prose .math-block,
    .prose .math-block .katex-display,
    .prose .math-block .katex-display > .katex {
      width: max-content !important;
      min-width: 0 !important;
      max-width: none !important;
      overflow: visible !important;
      text-align: left !important;
    }
  \`;
  document.head.append(style);
  await document.fonts.ready;
  return [...document.querySelectorAll('.prose .math-block')].map((block) => ({
    tex: decodeURIComponent(block.dataset.tex ?? ''),
    width: Math.ceil(block.querySelector('.katex-display').scrollWidth),
  }));
})()`);

if (!Array.isArray(measured) || measured.length === 0) {
  throw new Error('没有量到公式：确认开发服务器已启动，且页面里使用了 .math-block 容器');
}

// 与文章源文件对齐做一次计数校验，防止测到的是旧页面。
const sources = globSync('content/blog/*.md').flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/^\$\$[\s\S]*?^\$\$/gm)].map((match) => match[0]),
);
if (sources.length !== measured.length) {
  console.warn(`注意：源文件里有 ${sources.length} 条独立公式，页面量到 ${measured.length} 条，确认页面已是最新。`);
}

const wide = measured.filter((item) => item.width > COLUMN);
const near = measured.filter((item) => item.width > COLUMN - 24 && item.width <= COLUMN);

const entries = wide
  .sort((a, b) => b.width - a.width)
  .map((item) => `  ${JSON.stringify(item.tex)}, // ${item.width}px`)
  .join('\n');

const output = `// 由 scripts/measure-display-widths.mjs 生成，请勿手工编辑。
// 手机上正文栏约 ${COLUMN}px，下列公式的实际宽度超过它，渲染时改为左对齐。
// 共 ${wide.length} 条（全部 ${measured.length} 条独立公式）。
const WIDE_DISPLAY_TEX = new Set<string>([
${entries}
]);

export { WIDE_DISPLAY_TEX };
`;

writeFileSync('src/data/wide-display-tex.ts', output);
console.log(`写入 src/data/wide-display-tex.ts：${wide.length} / ${measured.length} 条需要左对齐`);
if (near.length > 0) {
  console.log('接近阈值的公式（改稿时留意）：');
  for (const item of near) console.log(`  ${item.width}px  ${item.tex.replace(/\n/g, ' ⏎ ').slice(0, 70)}`);
}
