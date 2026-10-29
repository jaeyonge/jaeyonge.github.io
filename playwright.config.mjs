import { defineConfig } from '@playwright/test';
const port = Number(process.env.PLAYWRIGHT_PORT || 4340);
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  use: { baseURL, browserName: 'chromium' },
  projects: [
    { name: 'chromium' },
    {
      name: 'webkit',
      testMatch: ['theme.spec.mjs', 'menus.spec.mjs', 'analytics.spec.mjs'],
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: `node scripts/static-server.mjs dist ${port}`,
    url: `${baseURL}/ko/`,
    reuseExistingServer: false,
  },
  reporter: 'list',
});
