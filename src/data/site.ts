import data from './site.json';

export type Lang = 'zh' | 'en';

export type Localized = {
  zh: string;
  en: string;
};

export type BlogCategory = {
  id: string;
  name: Localized;
  description: Localized;
};

export type Post = {
  slug: string;
  /** 已发布内容填写 YYYY-MM-DD；草稿可留空。 */
  date: string;
  /** 对应 blogCategories 中的稳定 id。 */
  category: string;
  title: Localized;
  excerpt: Localized;
  /** 单位：分钟 */
  readTime: number;
  demo: boolean;
  /** true 表示草稿；false 或省略时发布。 */
  draft?: boolean;
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
  /** 可选：文章标题，定下来之前留空即可。 */
  title?: Localized;
  /** 可选：作者列表，支持 **姓名** 加粗标出自己。 */
  authors?: string;
  venue: Localized;
  year: number;
  /** 可选状态，如「已录用 / Accepted」；留空则不显示。 */
  status?: Localized;
  /** 可选的额外说明，如一句话概括论文主题。 */
  note?: Localized;
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

export type Link = {
  label: Localized;
  href: string;
};

export type Home = {
  /** 首页顶部的引导语，显示为引用块。 */
  lead: Localized;
  linksLabel: Localized;
  /** GitHub 链接取自 profile.github，这里只填额外的，如小红书等。 */
  links: Link[];
  interests: HomeSection;
  education: HomeSection;
  research: HomeSection;
  internship: HomeSection;
};

/**
 * 所有可编辑内容都在 site.json 中。此文件只做类型声明与转发，
 * 请勿在此写内容，否则可视化编辑器看不到。
 */
export const profile: Profile = data.profile;

export const home: Home = data.home;

export const blogCategories: BlogCategory[] = data.blogCategories;

export const posts: Post[] = data.posts;

export const projects: Project[] = data.projects;

export const publications: Publication[] = data.publications;
