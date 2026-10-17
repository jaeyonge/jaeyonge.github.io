import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:4322', browserName: 'chromium' },
  webServer: {
    command: 'node scripts/static-server.mjs dist 4322',
    url: 'http://127.0.0.1:4322/ko/',
    reuseExistingServer: !process.env.CI,
  },
  reporter: 'list',
});
