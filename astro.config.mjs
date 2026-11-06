import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://henryd0ng.github.io',
  output: 'static',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  redirects: {
    '/zh/blog/reinforcement-learning/': '/zh/blog/rl-probability/',
    '/en/blog/reinforcement-learning/': '/en/blog/rl-probability/',
  },
});
