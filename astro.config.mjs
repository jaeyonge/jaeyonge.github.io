import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://jaeyonge.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
