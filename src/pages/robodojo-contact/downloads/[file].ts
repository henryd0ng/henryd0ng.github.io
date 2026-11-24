import type { APIRoute } from 'astro';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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
    schemaVersion: 2,
    project: projectMeta,
    dataScope: 'Dual-arm ARX5 tabletop manipulation scenes and recorded simulation demonstrations',
    benchmarkScoresReported: false,
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
    !task.objective.zh.trim() || !task.objective.en.trim() ||
    !task.statusNote.zh.trim() || !task.statusNote.en.trim()
  ).map(task => task.id);
  const missingMedia = tasks.filter(task => {
    const files = [task.media?.image, task.media?.detail, ...(task.media?.videos ?? []).flatMap(clip => [clip.src, clip.poster])];
    return !task.media?.image || files.some(file => file && !existsSync(publicFile(file)));
  }).map(task => task.id);
  const wrongVideoState = tasks.filter(task =>
    (task.status === 'accepted') !== Boolean(task.media?.videos?.length)
  ).map(task => task.id);
  const heroUrls = [projectMeta.heroPoster, projectMeta.heroVideo?.src, projectMeta.heroVideo?.poster];
  const heroValid = !projectMeta.heroVideo || (
    tasks.some(task => task.id === projectMeta.heroTaskId && task.status === 'accepted') &&
    heroUrls.every(url => !url || existsSync(publicFile(url)))
  );
  const checks = [
    { id: 'unique-task-ids', passed: duplicateIds.length === 0, affectedTaskIds: duplicateIds },
    { id: 'known-category-ids', passed: unknownCategories.length === 0, affectedTaskIds: unknownCategories },
    { id: 'known-batch-ids', passed: unknownBatches.length === 0, affectedTaskIds: unknownBatches },
    { id: 'known-status-ids', passed: unknownStatuses.length === 0, affectedTaskIds: unknownStatuses },
    { id: 'bilingual-core-text', passed: incompleteText.length === 0, affectedTaskIds: incompleteText },
    { id: 'featured-demonstration', passed: heroValid, affectedTaskIds: heroValid ? [] : [projectMeta.heroTaskId] },
    { id: 'media-files-present', passed: !missingMedia.length, affectedTaskIds: missingMedia },
    { id: 'completed-demonstrations-have-video', passed: !wrongVideoState.length, affectedTaskIds: wrongVideoState },
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
    counts: {
      taskEntries: tasks.length,
      sceneImages: tasks.filter(task => task.media?.image).length,
      statuses: Object.fromEntries(taskStatuses.map(status => [status.id, tasks.filter(task => task.status === status.id).length])),
      videoReferences: tasks.reduce((count, task) => count + (task.media?.videos?.length ?? 0), 0),
    },
    checks,
  };
}

function publicFile(url: string) {
  if (!/^\/robodojo-contact\/tasks\/[A-Za-z0-9_.-]+$/.test(url))
    throw new Error('Unexpected catalog media path: ' + url);
  return join(process.cwd(), 'public', url);
}

function guide() {
  const lines = [
    '# robodojo-contact',
    '',
    projectMeta.description.zh, '', projectMeta.description.en, '',
    projectMeta.notice.zh, '', projectMeta.notice.en, '',
    '## 场景目录 / Scene catalog',
    '',
    ...taskStatuses.map(status => `- ${status.label.zh} / ${status.label.en} — ${status.description.zh} ${status.description.en}`),
    '',
  ];
  for (const batch of taskBatches) {
    lines.push(`## ${batch.label.zh} / ${batch.label.en}`, '');
    for (const task of tasks.filter(task => task.batch === batch.id)) {
      const url = 'https://henryd0ng.github.io/robodojo-contact/#task=' + task.id;
      lines.push(`### [${task.title.zh} / ${task.title.en}](${url})`, '',
        `\`${task.id}\` · ${taskStatuses.find(status => status.id === task.status)?.label.zh}`, '',
        task.objective.zh, '', task.objective.en, '', task.statusNote.zh, '', task.statusNote.en, '');
      for (const observation of task.successCriteria) lines.push('- ' + observation.zh + ' ' + observation.en);
      if (task.successCriteria.length) lines.push('');
    }
  }
  lines.push(
    '## 媒体来源 / Media credits', '',
    '场景图与视频取自 RoboDojo 的任务资产、初始布局与仿真记录。图集中含适配后的 NVIDIA SimReady 资产视图。', '',
    'Scene images and videos are derived from RoboDojo assets, initial layouts and simulation recordings. Selected scenes include adapted NVIDIA SimReady assets.', '',
    '[NVIDIA SimReady Assets](https://huggingface.co/datasets/nvidia/simready-assets/tree/7879e0e50423290300ac20ecd6e727325f680b60) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)', '',
    'assets.zip 内含本指南、tasks.json、validation.json 和公开场景图。任务视频可从目录中的媒体地址单独下载。', '',
    'The archive contains this guide, tasks.json, validation.json and the published scene images. Video URLs are listed in the catalog.', '',
  );
  return lines.join('\n');
}

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

/** Store WebP images without recompressing them. */
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
    const report = metadataValidation();
    if (!report.metadataChecksPassed) throw new Error('Catalog validation failed: ' + json(report.checks.filter(check => !check.passed)));
    body = json(report);
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
      ...['ATTRIBUTION.txt', 'native-captures-provenance.json', 'layout-renders-provenance.json', 'video-provenance.json'].map(name => ({
        name: 'sources/' + name, bytes: readFileSync(publicFile('/robodojo-contact/tasks/' + name)),
      })),
      ...[...new Set(tasks.flatMap(task => [task.media?.image, task.media?.detail]).filter((url): url is string => Boolean(url)))].map(url => ({
        name: url.slice(1), bytes: readFileSync(publicFile(url)),
      })),
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
