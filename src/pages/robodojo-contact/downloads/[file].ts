/// <reference types="vite/client" />
import type { APIRoute } from 'astro';
import contactDiagram from '../../../../public/robodojo-contact/contact-board.svg?raw';
import objectDiagram from '../../../../public/robodojo-contact/object-board.svg?raw';
import {
  projectMeta,
  taskBatches,
  taskCategories,
  taskStatuses,
  tasks,
} from '../../../data/robodojo-contact';

export const prerender = true;

const filenames = ['tasks.json', 'guide.md', 'validation.json', 'assets.zip'] as const;

export function getStaticPaths() {
  return filenames.map(file => ({ params: { file } }));
}

function catalog() {
  return {
    schemaVersion: 1,
    project: projectMeta,
    dataScope: 'interface-demonstration',
    containsRobotExperimentResults: false,
    statuses: taskStatuses,
    categories: taskCategories,
    batches: taskBatches,
    tasks,
  };
}

function duplicates(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function metadataValidation() {
  const categoryIds = new Set(taskCategories.map(category => category.id));
  const batchIds = new Set(taskBatches.map(batch => batch.id));
  const statusIds = new Set<string>(taskStatuses.map(status => status.id));
  const duplicateIds = duplicates(tasks.map(task => task.id));
  const unknownCategories = tasks.filter(task => !categoryIds.has(task.category)).map(task => task.id);
  const unknownBatches = tasks.filter(task => !batchIds.has(task.batch)).map(task => task.id);
  const unknownStatuses = tasks.filter(task => !statusIds.has(task.status)).map(task => task.id);
  const incompleteText = tasks.filter(task =>
    !task.title.zh.trim() || !task.title.en.trim() ||
    !task.description.zh.trim() || !task.description.en.trim() ||
    !task.objective.zh.trim() || !task.objective.en.trim()
  ).map(task => task.id);
  const missingDemoFlag = tasks.filter(task => task.demo !== true).map(task => task.id);
  const checks = [
    { id: 'unique-task-ids', passed: duplicateIds.length === 0, affectedTaskIds: duplicateIds },
    { id: 'known-category-ids', passed: unknownCategories.length === 0, affectedTaskIds: unknownCategories },
    { id: 'known-batch-ids', passed: unknownBatches.length === 0, affectedTaskIds: unknownBatches },
    { id: 'known-status-ids', passed: unknownStatuses.length === 0, affectedTaskIds: unknownStatuses },
    { id: 'bilingual-core-text', passed: incompleteText.length === 0, affectedTaskIds: incompleteText },
    { id: 'current-demo-entries-marked', passed: missingDemoFlag.length === 0, affectedTaskIds: missingDemoFlag },
  ];

  return {
    schemaVersion: 1,
    scope: 'catalog-metadata-only',
    notice: {
      zh: '本报告只检查展示目录的字段与引用关系，不验证机器人、物理、轨迹、动作质量或任务验收。',
      en: 'This report checks catalog fields and references only. It does not validate robots, physics, trajectories, motion quality, or task acceptance.',
    },
    roboticsValidationPerformed: false,
    metadataChecksPassed: checks.every(check => check.passed),
    illustrativeCounts: {
      taskEntries: tasks.length,
      demoEntries: tasks.filter(task => task.demo).length,
      statuses: Object.fromEntries(taskStatuses.map(status => [status.id, tasks.filter(task => task.status === status.id).length])),
      videoReferences: tasks.reduce((count, task) => count + (task.media?.videos?.length ?? 0), 0),
    },
    checks,
  };
}

function guide() {
  const lines = [
    '# robodojo-contact · 演示目录说明 / Demo catalog guide',
    '',
    projectMeta.notice.zh,
    '',
    projectMeta.notice.en,
    '',
    '## 下载内容 / Download contents',
    '',
    '- `tasks.json`：任务定义、双语文字、分类、批次及示例状态。 / Task definitions, bilingual text, categories, batches, and example statuses.',
    '- `validation.json`：仅检查目录元数据，不是机器人实验验证。 / Catalog metadata checks only, not robotics validation.',
    '- `assets.zip`：本说明、目录、元数据报告与两张原创概念 SVG；不包含机器人模型、场景或轨迹。 / This guide, the catalog, the metadata report, and two original conceptual SVGs; no robot models, scenes, or trajectories.',
    '',
    '## 状态 / Statuses',
    '',
    ...taskStatuses.map(status => `- \`${status.id}\` — ${status.label.zh} / ${status.label.en}。${status.description.zh} ${status.description.en}`),
    '',
    '## 批次 / Batches',
    '',
    ...taskBatches.map(batch => `- \`${batch.id}\` — ${batch.label.zh} / ${batch.label.en}。${batch.description.zh} ${batch.description.en}`),
    '',
    '## 任务示例 / Example tasks',
    '',
  ];

  for (const task of tasks) {
    lines.push(
      `### ${task.title.zh} / ${task.title.en}`,
      '',
      `ID: \`${task.id}\` · Demo: \`${task.demo}\` · Example status: \`${task.status}\` · Batch: \`${task.batch}\``,
      '',
      task.description.zh,
      '',
      task.description.en,
      '',
      `**示例目标 / Example objective:** ${task.objective.zh} ${task.objective.en}`,
      '',
    );
    if (task.setup) lines.push(`**示例布置 / Example setup:** ${task.setup.zh} ${task.setup.en}`, '');
    if (task.steps?.length) {
      lines.push('**示例步骤 / Example steps:**', '', ...task.steps.map((step, index) => `${index + 1}. ${step.zh} ${step.en}`), '');
    }
    lines.push('**示例检查项 / Example checks:**', '', ...task.successCriteria.map(check => `- ${check.zh} ${check.en}`), '');
    if (task.preflight?.length) {
      lines.push('**示例预检 / Example preflight:**', '', ...task.preflight.map(check => `- ${check.zh} ${check.en}`), '');
    }
    if (task.assets?.length) {
      lines.push('**概念素材 / Concept assets:**', '', ...task.assets.map(asset => `- ${asset.name.zh} / ${asset.name.en}${asset.path ? ` — \`${asset.path}\`` : ''}`), '');
    }
  }

  lines.push(
    '## 维护 / Maintenance',
    '',
    '目录源文件为 `src/data/robodojo-contact.ts`。替换示例时，应同时更新任务定义、状态说明和媒体标签；只有存在可核实记录时才填写轨迹数量。',
    '',
    'The catalog source is `src/data/robodojo-contact.ts`. When replacing examples, update task definitions, status descriptions, and media labels together. Add trajectory counts only when backed by verifiable records.',
    '',
  );
  return lines.join('\n');
}

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

/** Store-only ZIP writer for this small, original asset package; no extra dependency. */
function zip(files: { name: string; bytes: Uint8Array }[]): Uint8Array {
  const encode = (text: string) => new TextEncoder().encode(text);
  const concat = (parts: Uint8Array[]) => {
    const result = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  };
  const crc32 = (bytes: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encode(file.name);
    const checksum = crc32(file.bytes);
    const local = new Uint8Array(30);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(12, 0x0021, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, file.bytes.length, true);
    localView.setUint32(22, file.bytes.length, true);
    localView.setUint16(26, name.length, true);
    localParts.push(local, name, file.bytes);

    const central = new Uint8Array(46);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(14, 0x0021, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, file.bytes.length, true);
    centralView.setUint32(24, file.bytes.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    centralParts.push(central, name);
    offset += local.length + name.length + file.bytes.length;
  }

  const central = concat(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, central.length, true);
  endView.setUint32(16, offset, true);
  return concat([...localParts, central, end]);
}

export const GET: APIRoute = ({ params }) => {
  const file = params.file;
  if (!filenames.includes(file as typeof filenames[number])) return new Response('Not found', { status: 404 });

  let body: string | ArrayBuffer;
  let contentType: string;

  if (file === 'tasks.json') {
    body = json(catalog());
    contentType = 'application/json; charset=utf-8';
  } else if (file === 'validation.json') {
    body = json(metadataValidation());
    contentType = 'application/json; charset=utf-8';
  } else if (file === 'guide.md') {
    body = guide();
    contentType = 'text/markdown; charset=utf-8';
  } else {
    const encode = (text: string) => new TextEncoder().encode(text);
    const archive = zip([
      { name: 'tasks.json', bytes: encode(json(catalog())) },
      { name: 'guide.md', bytes: encode(guide()) },
      { name: 'validation.json', bytes: encode(json(metadataValidation())) },
      { name: 'robodojo-contact/contact-board.svg', bytes: encode(contactDiagram) },
      { name: 'robodojo-contact/object-board.svg', bytes: encode(objectDiagram) },
    ]);
    body = new Uint8Array(archive).buffer;
    contentType = 'application/zip';
  }

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${file}"`,
    },
  });
};
