import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://henryd0ng.github.io', output: 'static', devToolbar: { enabled: false }, build: { format: 'directory' } });
