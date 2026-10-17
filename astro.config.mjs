import { defineConfig } from 'astro/config';
import { prepareFonts } from './scripts/prepare-fonts.mjs';
await prepareFonts();
export default defineConfig({
  site: 'https://jaeyonge.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    {
      name: 'resume-font-subsets',
      hooks: {
        'astro:server:setup': ({ server }) => {
          server.watcher.on('change', (file) => {
            if (file.endsWith('/content/resume.yaml')) {
              prepareFonts().catch((error) => server.config.logger.error(String(error)));
            }
          });
        },
      },
    },
  ],
});
