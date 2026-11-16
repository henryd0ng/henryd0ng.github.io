export type LocalizedText = {
  zh: string;
  en: string;
};

export type TaskStatus = 'not_started' | 'in_progress' | 'accepted';

export type TaskStatusDefinition = {
  id: TaskStatus;
  label: LocalizedText;
  description: LocalizedText;
};

export type TaskCategory = {
  id: string;
  label: LocalizedText;
};

export type TaskBatch = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
};

export type TaskVideo = {
  label: LocalizedText;
  src: string;
  poster?: string;
  kind: 'accepted' | 'diagnostic' | 'development';
};

export type TaskMedia = {
  image?: string;
  alt: LocalizedText;
  videos?: TaskVideo[];
};

export type ContactTask = {
  id: string;
  title: LocalizedText;
  category: string;
  batch: string;
  status: TaskStatus;
  description: LocalizedText;
  objective: LocalizedText;
  successCriteria: LocalizedText[];
  setup?: LocalizedText;
  steps?: LocalizedText[];
  preflight?: LocalizedText[];
  assets?: { name: LocalizedText; path?: string }[];
  novelty?: 'base' | 'variant';
  demo: boolean;
  tags: string[];
  media?: TaskMedia;
  /** Only add a verified count for real task data; demo entries intentionally omit it. */
  trajectoryCount?: number;
};

export const projectMeta: {
  title: string;
  subtitle: LocalizedText;
  description: LocalizedText;
  notice: LocalizedText;
  snapshotDate: string;
  heroPoster?: string;
  codeUrl?: string;
} = {
  title: 'robodojo-contact',
  snapshotDate: '2026-11-16',
  heroPoster: '/robodojo-contact/demo-poster.jpg',
  subtitle: {
    zh: '接触操作任务目录 · 页面原型',
    en: 'Contact manipulation task catalog · interface prototype',
  },
  description: {
    zh: '浏览任务定义、示例状态、任务批次与概念示意媒体。当前目录用于演示页面结构，后续可替换为实际任务与记录。',
    en: 'Browse task definitions, example statuses, task batches, and conceptual media. This catalog demonstrates the page structure and can later be populated with real tasks and records.',
  },
  notice: {
    zh: '以下全部为演示内容。任务、状态与检查项均为示例；图片和视频是概念示意，不代表真实机器人实验、轨迹或验收结果。',
    en: 'All entries are demonstrations. Tasks, statuses, and checks are examples. Images and videos are conceptual illustrations, not real robot experiments, trajectories, or acceptance results.',
  },
};

export const taskStatuses: TaskStatusDefinition[] = [
  {
    id: 'accepted',
    label: { zh: '已验收 · 示例', en: 'Accepted · demo' },
    description: {
      zh: '演示已验收状态的页面展示，不表示实际任务已通过验收。',
      en: 'Demonstrates the accepted-state interface; no actual task acceptance is claimed.',
    },
  },
  {
    id: 'in_progress',
    label: { zh: '开发中 · 示例', en: 'In progress · demo' },
    description: {
      zh: '演示开发中状态的页面展示，不表示实际任务的开发进度。',
      en: 'Demonstrates the in-progress interface; it does not report actual development progress.',
    },
  },
  {
    id: 'not_started',
    label: { zh: '未开始 · 示例', en: 'Not started · demo' },
    description: {
      zh: '演示尚未开始的任务条目，不表示环境或实验已经准备完成。',
      en: 'Demonstrates a task that has not started; no prepared environment or experiment is implied.',
    },
  },
];

export const taskCategories: TaskCategory[] = [
  { id: 'contact', label: { zh: '接触定位', en: 'Contact localization' } },
  { id: 'sliding', label: { zh: '推动与滑动', en: 'Pushing & sliding' } },
  { id: 'pressing', label: { zh: '按压', en: 'Pressing' } },
  { id: 'grasping', label: { zh: '抓取与放置', en: 'Grasping & placing' } },
  { id: 'insertion', label: { zh: '对齐与插入', en: 'Alignment & insertion' } },
  { id: 'rotation', label: { zh: '旋转操作', en: 'Rotation' } },
];

export const taskBatches: TaskBatch[] = [
  {
    id: 'contact-basics',
    label: { zh: '基础接触 · 示例批次', en: 'Contact basics · demo batch' },
    description: {
      zh: '接触定位、表面滑动与按压的概念条目，用于展示一组相关任务。',
      en: 'Conceptual entries for contact localization, surface sliding, and pressing, grouped to demonstrate related tasks.',
    },
  },
  {
    id: 'object-interaction',
    label: { zh: '物体交互 · 示例批次', en: 'Object interaction · demo batch' },
    description: {
      zh: '抓取、插入与旋转的概念条目，用于展示另一组任务及其检查项。',
      en: 'Conceptual entries for grasping, insertion, and rotation, grouped to demonstrate another set of tasks and checks.',
    },
  },
];

const contactDiagram: TaskMedia = {
  image: '/robodojo-contact/contact-board.svg',
  alt: {
    zh: '接触操作概念示意图，非机器人实验记录',
    en: 'Conceptual contact-operation diagram, not a robot experiment record',
  },
};

const objectDiagram: TaskMedia = {
  image: '/robodojo-contact/object-board.svg',
  alt: {
    zh: '物体交互概念示意图，非机器人实验记录',
    en: 'Conceptual object-interaction diagram, not a robot experiment record',
  },
};

/**
 * All six entries are mock data for the catalog interface. Their distribution
 * across statuses is illustrative and must not be reported as benchmark results.
 */
export const tasks: ContactTask[] = [
  {
    id: 'contact-point-alignment',
    title: { zh: '表面接触定位', en: 'Surface contact localization' },
    category: 'contact',
    batch: 'contact-basics',
    status: 'accepted',
    description: {
      zh: '示例任务定义：将接触位置与指定区域对应，演示任务目标、检查项及多段概念视频的展示方式。',
      en: 'Example task definition: relate a contact location to a marked region, demonstrating objectives, checks, and multiple conceptual video clips.',
    },
    objective: {
      zh: '示例目标：在示意表面上标识接触位置，并与目标区域进行比较。',
      en: 'Example objective: indicate a contact location on the illustrated surface and compare it with the target region.',
    },
    successCriteria: [
      { zh: '示例检查项：接触位置位于预先定义的目标区域。', en: 'Example check: the contact location is within a predefined target region.' },
      { zh: '示例检查项：记录中可区分接触前、接触时和接触后的状态。', en: 'Example check: the record distinguishes states before, during, and after contact.' },
    ],
    setup: { zh: '示例布置提案：在示意表面上标出目标区域与初始位置；机器人、传感器和尺寸尚未指定。', en: 'Example setup proposal: mark a target region and a start location on a schematic surface. Robot, sensor, and dimensions are unspecified.' },
    steps: [
      { zh: '示例步骤：明确目标区域和接触位置的表示方式。', en: 'Example step: define the target region and how the contact location is represented.' },
      { zh: '示例步骤：对比接触位置与目标区域并记录状态。', en: 'Example step: compare the contact location with the target region and record the state.' },
    ],
    preflight: [
      { zh: '示例预检：真实执行前需要补齐环境、单位与测量来源。', en: 'Example preflight: specify the environment, units, and measurement source before a real run.' },
      { zh: '示例预检：概念动画不得作为实验或验收证据。', en: 'Example preflight: conceptual animation must not serve as experiment or acceptance evidence.' },
    ],
    assets: [{ name: { zh: '原创建模示意图', en: 'Original conceptual diagram' }, path: '/robodojo-contact/contact-board.svg' }],
    novelty: 'base',
    demo: true,
    tags: ['contact', 'localization'],
    media: {
      ...contactDiagram,
      videos: [
        {
          label: { zh: '概念示意 · 主视图', en: 'Concept illustration · overview' },
          src: '/robodojo-contact/demo-loop.mp4',
          poster: '/robodojo-contact/contact-board.svg',
          kind: 'accepted',
        },
        {
          label: { zh: '概念示意 · 局部视图', en: 'Concept illustration · detail' },
          src: '/robodojo-contact/demo-detail.mp4',
          poster: '/robodojo-contact/contact-board.svg',
          kind: 'diagnostic',
        },
      ],
    },
  },
  {
    id: 'controlled-surface-slide',
    title: { zh: '沿表面滑动', en: 'Sliding along a surface' },
    category: 'sliding',
    batch: 'contact-basics',
    status: 'accepted',
    description: {
      zh: '示例任务定义：沿指定表面移动接触点，用于展示带目标路径的任务条目。当前只有概念示意图。',
      en: 'Example task definition: move a contact point along a specified surface, illustrating a task with a target path. Only a conceptual diagram is provided.',
    },
    objective: {
      zh: '示例目标：沿预设路径移动至终点区域。',
      en: 'Example objective: follow a specified path to an end region.',
    },
    successCriteria: [
      { zh: '示例检查项：移动路径符合任务中定义的范围。', en: 'Example check: the motion path stays within the task-defined region.' },
      { zh: '示例检查项：终止位置位于指定终点区域。', en: 'Example check: the final position is inside the specified end region.' },
    ],
    setup: { zh: '示例布置提案：在表面示意图中标注起点、路径与终点区域。', en: 'Example setup proposal: mark a start, a path, and an end region on the surface diagram.' },
    steps: [
      { zh: '示例步骤：确定路径与允许活动的范围。', en: 'Example step: specify a path and an allowed motion region.' },
      { zh: '示例步骤：记录路径与终止位置，随后对照检查项。', en: 'Example step: record the path and final location, then compare them with the checks.' },
    ],
    preflight: [{ zh: '示例预检：表面属性、路径单位与终止条件尚需根据真实任务补齐。', en: 'Example preflight: surface properties, path units, and stopping conditions must be specified for a real task.' }],
    assets: [{ name: { zh: '接触操作示意图', en: 'Contact-operation diagram' }, path: '/robodojo-contact/contact-board.svg' }],
    novelty: 'variant',
    demo: true,
    tags: ['contact', 'sliding'],
    media: contactDiagram,
  },
  {
    id: 'targeted-surface-press',
    title: { zh: '指定位置按压', en: 'Pressing a marked location' },
    category: 'pressing',
    batch: 'contact-basics',
    status: 'in_progress',
    description: {
      zh: '示例任务定义：在指定区域执行按压与释放，演示开发中条目的目标和待检查条件。',
      en: 'Example task definition: press and release within a specified region, demonstrating objectives and checks for an in-progress entry.',
    },
    objective: {
      zh: '示例目标：完成一次位置明确的按压与释放过程。',
      en: 'Example objective: perform a press-and-release sequence at a defined location.',
    },
    successCriteria: [
      { zh: '示例检查项：按压位置对应任务指定的区域。', en: 'Example check: the press location matches the task-defined region.' },
      { zh: '示例检查项：按压后恢复到任务定义的释放状态。', en: 'Example check: the sequence returns to the task-defined released state.' },
    ],
    setup: { zh: '示例布置提案：标出按压区域，并分别定义初始状态和释放状态。', en: 'Example setup proposal: mark a press region and define initial and released states.' },
    steps: [
      { zh: '示例步骤：核对按压区域与状态定义。', en: 'Example step: review the press region and state definitions.' },
      { zh: '示例步骤：按任务定义记录按压与释放过程。', en: 'Example step: record the press-and-release sequence according to the task definition.' },
    ],
    preflight: [{ zh: '示例预检：真实执行前需指定对象属性、测量方式与停止条件。', en: 'Example preflight: specify object properties, measurements, and stopping conditions before real execution.' }],
    assets: [{ name: { zh: '接触操作示意图', en: 'Contact-operation diagram' }, path: '/robodojo-contact/contact-board.svg' }],
    novelty: 'base',
    demo: true,
    tags: ['contact', 'pressing'],
    media: contactDiagram,
  },
  {
    id: 'grasp-and-place',
    title: { zh: '物体抓取与放置', en: 'Grasping and placing an object' },
    category: 'grasping',
    batch: 'object-interaction',
    status: 'in_progress',
    description: {
      zh: '示例任务定义：将物体从初始区域移动到目标区域，演示物体交互类任务的描述方式。',
      en: 'Example task definition: move an object from a start region to a target region, illustrating an object-interaction task description.',
    },
    objective: {
      zh: '示例目标：抓取指定物体，并在目标区域完成放置。',
      en: 'Example objective: grasp the specified object and place it in the target region.',
    },
    successCriteria: [
      { zh: '示例检查项：被操作物体与任务指定的物体一致。', en: 'Example check: the manipulated object matches the specified object.' },
      { zh: '示例检查项：释放后物体位于目标区域。', en: 'Example check: the object is inside the target region after release.' },
    ],
    setup: { zh: '示例布置提案：标明待操作物体、初始区域与放置区域；未指定真实机器人或道具。', en: 'Example setup proposal: identify an object, a start region, and a placement region. No real robot or prop is specified.' },
    steps: [
      { zh: '示例步骤：确认物体与目标区域的标识。', en: 'Example step: confirm the object and target-region identifiers.' },
      { zh: '示例步骤：记录物体从初始位置到释放后位置的变化。', en: 'Example step: record the object transition from its initial position to its position after release.' },
    ],
    preflight: [{ zh: '示例预检：物体几何、抓取条件与放置标准需要在实际任务中定义。', en: 'Example preflight: object geometry, grasp conditions, and placement criteria need real task definitions.' }],
    assets: [{ name: { zh: '物体交互示意图', en: 'Object-interaction diagram' }, path: '/robodojo-contact/object-board.svg' }],
    novelty: 'base',
    demo: true,
    tags: ['object', 'grasping', 'placement'],
    media: objectDiagram,
  },
  {
    id: 'alignment-and-insertion',
    title: { zh: '对齐与插入', en: 'Alignment and insertion' },
    category: 'insertion',
    batch: 'object-interaction',
    status: 'not_started',
    description: {
      zh: '示例任务定义：将物体与目标开口对齐后插入，演示尚未开始的任务条目，不表示已有可运行环境。',
      en: 'Example task definition: align an object with an opening before insertion, demonstrating a not-started entry without implying an executable environment.',
    },
    objective: {
      zh: '示例目标：按任务指定的方向与终止条件完成对齐和插入。',
      en: 'Example objective: align and insert according to the task-defined direction and stopping condition.',
    },
    successCriteria: [
      { zh: '示例检查项：插入前的相对位置与方向满足任务定义。', en: 'Example check: relative position and orientation meet the task definition before insertion.' },
      { zh: '示例检查项：最终状态满足预先规定的插入条件。', en: 'Example check: the final state meets the predefined insertion condition.' },
    ],
    setup: { zh: '示例布置提案：标明物体与目标开口的相对位置；几何、间隙与插入深度均待定义。', en: 'Example setup proposal: indicate the object position relative to an opening. Geometry, clearance, and insertion depth remain undefined.' },
    steps: [
      { zh: '示例步骤：定义对齐状态与允许的接近方向。', en: 'Example step: define an aligned state and an allowed approach direction.' },
      { zh: '示例步骤：按照预先定义的插入条件检查终止状态。', en: 'Example step: inspect the final state using predefined insertion conditions.' },
    ],
    preflight: [{ zh: '示例预检：在实现环境前补齐几何参数、容差与终止标准。', en: 'Example preflight: define geometry, tolerances, and stopping criteria before implementing an environment.' }],
    assets: [{ name: { zh: '物体交互示意图', en: 'Object-interaction diagram' }, path: '/robodojo-contact/object-board.svg' }],
    novelty: 'base',
    demo: true,
    tags: ['object', 'alignment', 'insertion'],
    media: objectDiagram,
  },
  {
    id: 'object-rotation',
    title: { zh: '物体定向旋转', en: 'Rotating an object to a target orientation' },
    category: 'rotation',
    batch: 'object-interaction',
    status: 'not_started',
    description: {
      zh: '示例任务定义：将物体从初始朝向旋转至目标朝向，用于预留旋转操作的任务展示。',
      en: 'Example task definition: rotate an object from an initial orientation to a target orientation, reserving a catalog entry for rotational interaction.',
    },
    objective: {
      zh: '示例目标：改变物体朝向，并在任务定义的目标状态停止。',
      en: 'Example objective: change the object orientation and stop at the task-defined target state.',
    },
    successCriteria: [
      { zh: '示例检查项：目标朝向在任务开始前被明确指定。', en: 'Example check: the target orientation is specified before the task begins.' },
      { zh: '示例检查项：最终朝向与目标条件相符。', en: 'Example check: the final orientation matches the target condition.' },
    ],
    setup: { zh: '示例布置提案：在物体示意图上分别标出初始朝向与目标朝向。', en: 'Example setup proposal: mark initial and target orientations on the object diagram.' },
    steps: [
      { zh: '示例步骤：确定朝向的表示方式与目标条件。', en: 'Example step: define the orientation representation and target condition.' },
      { zh: '示例步骤：记录朝向变化并检查最终状态。', en: 'Example step: record the orientation change and inspect the final state.' },
    ],
    preflight: [{ zh: '示例预检：旋转轴、约束与测量方式需要根据真实对象补齐。', en: 'Example preflight: specify an axis, constraints, and measurements for the real object.' }],
    assets: [{ name: { zh: '物体交互示意图', en: 'Object-interaction diagram' }, path: '/robodojo-contact/object-board.svg' }],
    novelty: 'variant',
    demo: true,
    tags: ['object', 'rotation'],
    media: objectDiagram,
  },
];
