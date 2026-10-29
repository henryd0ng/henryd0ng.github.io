export type Lang = 'zh' | 'en';

export type Localized = {
  zh: string;
  en: string;
};

export type Post = {
  slug: string;
  date: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  readTime: number;
  demo: boolean;
  body: { zh: string[]; en: string[] };
};

export type Project = {
  slug: string;
  title: Localized;
  category: Localized;
  description: Localized;
  tags: string[];
  demo: boolean;
  art: 'orbit' | 'grid';
  body: { zh: string[]; en: string[] };
};

export type Publication = {
  id: string;
  title: Localized;
  authors: string;
  venue: Localized;
  year: number;
  pdf?: string;
  code?: string;
  url?: string;
};

export const profile = {
  name: 'Haoyu Dong',
  handle: 'henryd0ng',
  github: 'https://github.com/henryd0ng',
  institution: {
    zh: '上海科技大学',
    en: 'ShanghaiTech University',
  },
  intro: {
    zh: '本网站用于整理我的学习笔记、项目与研究工作。相关内容将陆续补充。',
    en: 'This website collects my study notes, projects, and research work. Content will be added over time.',
  },
};

export const posts: Post[] = [];

export const projects: Project[] = [];

export const publications: Publication[] = [];
