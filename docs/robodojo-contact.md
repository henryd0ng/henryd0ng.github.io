# robodojo-contact 维护说明 / Maintenance

本目录当前全部是页面演示内容。任务与状态是示例，图片和视频是原创概念示意，不代表真实机器人实验、轨迹或验收结果。

This catalog currently contains interface demonstrations only. Tasks and statuses are examples; images and videos are original conceptual illustrations, not real robot experiments, trajectories, or acceptance results.

## 编辑目录 / Edit the catalog

编辑 `src/data/robodojo-contact.ts`：

- `projectMeta`：项目标题、说明与演示声明。
- `taskStatuses`、`taskCategories`、`taskBatches`：状态、分类与批次的稳定 ID 和双语文字。
- `tasks`：任务条目。每项使用唯一 `id`，并引用已经定义的分类、批次与状态。

Edit `src/data/robodojo-contact.ts`. `projectMeta` contains the project text and demo notice; status, category, and batch arrays define stable IDs; `tasks` contains entries that reference those IDs. Every task needs a unique `id`.

任务的标题、描述、目标与检查项均采用 `{ zh, en }`。可按需填写 `setup`、`steps`、`preflight`、`assets` 和 `novelty`，但不要将示例提案写成已完成的工作。当前 `demo: true` 需要保留；只有完成真实内容替换与核实后，才能调整对应的标记与说明。

Titles, descriptions, objectives, and checks use `{ zh, en }`. Optional fields include `setup`, `steps`, `preflight`, `assets`, and `novelty`. Do not describe a proposal as completed work. Keep `demo: true` until a record has been replaced with verified real content, then update its labels and notices together.

## 媒体 / Media

媒体放在 `public/robodojo-contact/`，数据中使用 `/robodojo-contact/文件名`。`media.image` 是图片；`media.videos` 支持多段视频，每段填写双语 `label`、`src`、可选 `poster` 和 `kind`。当前概念视频的 `kind` 只用于演示不同展示状态，不是验收结论。

Store media in `public/robodojo-contact/` and reference it with `/robodojo-contact/filename`. `media.image` is an image; `media.videos` supports several clips with bilingual labels, source URLs, optional posters, and a kind. Kinds on the current conceptual videos demonstrate interface states, not acceptance outcomes.

`trajectoryCount` 当前省略。只有存在可核实的轨迹记录时才填写，不要将视频数量当作轨迹数量。

`trajectoryCount` is intentionally absent. Add it only when verifiable trajectory records exist; video counts are not trajectory counts.

## 下载与验证 / Downloads and validation

静态下载端点位于 `src/pages/robodojo-contact/downloads/[file].ts`：

- `/robodojo-contact/downloads/tasks.json`：完整目录。
- `/robodojo-contact/downloads/guide.md`：由当前目录生成的中英文说明。
- `/robodojo-contact/downloads/validation.json`：字段、ID 与引用关系检查。
- `/robodojo-contact/downloads/assets.zip`：以上三份文件与两张原创 SVG 示意图。

These static downloads are generated from the current catalog. The metadata report checks IDs, references, bilingual core fields, and explicit demo flags. It does not validate robot behavior, physical correctness, trajectories, or task success. The ZIP contains the catalog, guide, report, and two original SVG diagrams; it contains no executable robot environment.

更新后运行 `npm run build`，检查下载内容及页面中英文显示。若今后加入真实任务，需要同步调整演示声明和元数据报告中针对演示条目的检查；真实实验的验证应由独立、可复现的流程提供。

After updates, run `npm run build` and check the downloads and both page languages. If real tasks are added later, update demo notices and demo-specific metadata checks together. Real experiment validation requires a separate, reproducible process.
