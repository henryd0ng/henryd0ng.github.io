import catalog from './robodojo-contact-catalog.json';

export type LocalizedText = { zh: string; en: string };

/** accepted denotes a reviewed demonstration, not benchmark qualification. */
export type TaskStatus = 'not_started' | 'in_progress' | 'accepted';
export type TaskStatusDefinition = { id: TaskStatus; label: LocalizedText; description: LocalizedText };
export type TaskCategory = { id: string; label: LocalizedText };
export type TaskBatch = { id: string; label: LocalizedText; description: LocalizedText };
export type EvidenceLevel = 'mechanical-demo' | 'contact-recording' | 'physical-probe' | 'runtime-ready' | 'preview-only' | 'awaiting-integration' | 'experimental';
export type ControlMode = 'teleoperation' | 'reference-policy' | 'experimental-policy';

export type TaskVideo = {
  label: LocalizedText;
  src: string;
  poster?: string;
  durationSeconds?: number;
  kind: 'accepted' | 'diagnostic' | 'development';
};

export type TaskMedia = {
  image?: string;
  detail?: string;
  imageKind?: 'layout-render' | 'simulation-frame';
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
  objects?: LocalizedText;
  statusNote: LocalizedText;
  evidenceLevel?: EvidenceLevel;
  sourcePaths: string[];
  sourceScene?: string;
  catalogOrigin?: 'base' | 'preview' | 'variant' | 'tabletop';
  controlModes?: ControlMode[];
  benchmarkScored?: boolean;
  setup?: LocalizedText;
  steps?: LocalizedText[];
  preflight?: LocalizedText[];
  assets?: { name: LocalizedText; path?: string }[];
  novelty?: 'base' | 'variant';
  variantOf?: string;
  /** Marks fabricated interface examples only; all current records are real entries. */
  demo: boolean;
  tags: string[];
  media?: TaskMedia;
  /** Omitted unless an independently identified set of trajectories is available. */
  trajectoryCount?: number;
};

export type ProjectMeta = {
  title: string;
  subtitle: LocalizedText;
  description: LocalizedText;
  notice: LocalizedText;
  snapshotDate: string;
  heroPoster?: string;
  heroTaskId?: string;
  heroVideo?: TaskVideo;
  codeUrl?: string;
};

export const evidenceLabels: Record<EvidenceLevel, LocalizedText> = {
  'mechanical-demo': { zh: '机械演示已复核', en: 'Mechanical demonstration reviewed' },
  'contact-recording': { zh: '接触记录', en: 'Contact recording' },
  'physical-probe': { zh: '局部动力学验证', en: 'Local dynamics checks' },
  'runtime-ready': { zh: '运行入口与初态', en: 'Runtime and initial state' },
  'preview-only': { zh: '场景预览', en: 'Scene preview' },
  'awaiting-integration': { zh: '初始场景待接入', en: 'Initial scene pending' },
  experimental: { zh: '实验开发', en: 'Experimental development' },
};

export const projectMeta = catalog.projectMeta as ProjectMeta;
export const taskStatuses = catalog.taskStatuses as TaskStatusDefinition[];
export const taskCategories: TaskCategory[] = catalog.taskCategories;
export const taskBatches: TaskBatch[] = catalog.taskBatches;
export const tasks = catalog.tasks as ContactTask[];
