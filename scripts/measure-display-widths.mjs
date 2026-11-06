// 用无头 Chrome 量出每一条独立公式在手机宽度下的真实排版宽度，
// 生成 src/data/wide-display-tex.ts 供构建期判断是否需要左对齐。
//
// 用法：先 `npm run dev`，再 `node scripts/measure-display-widths.mjs`。
// 公式本身发生变化（改写、增删）时需要重新运行；脚本会对宽度接近阈值的公式给出提醒。
// 默认同时量中英文两页：中文是完整文章，英文是它的独立长文版本。

import { writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { buildRegistry, countDisplayBlocks } from './registry.mjs';

const CHROME = '/home/rimlab/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const BASE = process.env.SITE_URL ?? 'http://127.0.0.1:4321';
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ['/zh/blog/rl-probability/', '/en/blog/rl-probability/'];
const PORT = Number(process.env.CDP_PORT ?? 9333);
/** 手机正文栏宽度：375 视口减去两侧内边距（343px），再留 1px 取整余量。 */
const COLUMN = Number(process.env.COLUMN ?? 344);
const OUT = 'src/data/wide-display-tex.ts';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect() {
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
  return {
    send,
    close: () => socket.close(),
  };
}

const MEASURE = `(async () => {
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
})()`;

const cdp = await connect();
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 383, height: 800, deviceScaleFactor: 1, mobile: true });

const measured = [];
for (const path of PAGES) {
  await cdp.send('Page.navigate', { url: `${BASE}${path}` });
  await sleep(2500);
  const response = await cdp.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true, awaitPromise: true });
  const page = response.result?.result?.value;
  if (!Array.isArray(page) || page.length === 0) throw new Error(`${path} 没有量到公式：确认开发服务器已启动，且页面使用了 .math-block 容器`);
  console.log(`${path}：${page.length} 条独立公式`);
  measured.push(...page);
}
cdp.close();

// 与文章源文件对齐做一次计数校验，防止量到的是旧页面。
const sources = globSync('content/blog/RL-probability*.md').flatMap((file) => countDisplayBlocks(readFileSync(file, 'utf8')));
const expected = sources.reduce((sum, count) => sum + count, 0);
if (expected !== measured.length) {
  console.warn(`注意：源文件里有 ${expected} 条独立公式，页面量到 ${measured.length} 条，确认页面已是最新。`);
}

const unique = new Map();
for (const item of measured) {
  const previous = unique.get(item.tex);
  if (!previous || item.width > previous.width) unique.set(item.tex, item);
}

const { source, wide, near } = buildRegistry([...unique.values()], {
  column: COLUMN,
  describe: { urls: PAGES.map((path) => `${BASE}${path}`) },
});

writeFileSync(OUT, source);
console.log(`写入 ${OUT}：${wide.length} / ${unique.size} 条需要左对齐`);
if (near.length > 0) {
  console.log('接近阈值的公式（改稿时留意）：');
  for (const item of near) console.log(`  ${item.width}px  ${item.tex.replace(/\n/g, ' ⏎ ').slice(0, 70)}`);
}
