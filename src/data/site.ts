import data from './site.json';

export type Lang = 'zh' | 'en';

export type Localized = {
  zh: string;
  en: string;
};

export type Post = {
  slug: string;
  /** 形如 2026-11-02 */
  date: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  /** 单位：分钟 */
  readTime: number;
  demo: boolean;
  /** 正文使用 Markdown：段落之间空一行，支持加粗、列表、图片。 */
  body: Localized;
};

export type Project = {
  slug: string;
  title: Localized;
  category: Localized;
  description: Localized;
  tags: string[];
  demo: boolean;
  art: 'orbit' | 'grid';
  /** 正文使用 Markdown：段落之间空一行，支持加粗、列表、图片。 */
  body: Localized;
};

export type Publication = {
  id: string;
  title: Localized;
  authors: string;
  venue: Localized;
  year: number;
  /** 可选链接，例如 /files/paper.pdf 或 https://… */
  pdf?: string;
  code?: string;
  url?: string;
};

export type Entry = Localized;

export type Profile = {
  name: string;
  handle: string;
  github: string;
  institution: Localized;
  intro: Localized;
};

export type HomeSection = {
  title: Localized;
  items: Entry[];
};

export type Home = {
  /** 首页顶部的引导语，显示为引用块。 */
  lead: Localized;
  linksLabel: Localized;
  education: HomeSection;
  experience: HomeSection;
};

/**
 * 所有可编辑内容都在 site.json 中。此文件只做类型声明与转发，
 * 请勿在此写内容，否则可视化编辑器看不到。
 */
export const profile: Profile = data.profile;

export const home: Home = data.home;

export const posts: Post[] = data.posts;

export const projects: Project[] = data.projects;

export const publications: Publication[] = data.publications;
