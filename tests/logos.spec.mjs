import { chooseTheme } from './helpers.mjs';
import { test, expect } from '@playwright/test';
import registry from '../content/logos.json' with { type: 'json' };

for (const lang of ['ko', 'en'])
  for (const osTheme of ['light', 'dark'])
    test(`${lang}, OS ${osTheme}: every logo is ready before theme switches`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: osTheme });
      const requests = [];
      page.on('request', (r) => {
        if (r.url().includes('/assets/logos/')) requests.push(r.url());
      });
      await page.goto(`/${lang}/`, { waitUntil: 'load' });
      // Decode even the hidden variant: it must not wait for a theme change or scroll.
      await page.locator('.logo img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));
      const initialRequests = [...requests];
      expect(registry.doeat.light).toBe(registry.doeat.dark);
      expect(registry.doeat.light).toContain('doeat-color-web.png');
      const doeat = page.locator('[data-logo="doeat"]');
      expect(await doeat.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
      expect(await doeat.evaluate((e) => getComputedStyle(e).padding)).toBe('0px');
      for (const theme of ['system', 'dark', 'light', 'system']) {
        await chooseTheme(page, theme);
        const effective = theme === 'system' ? osTheme : theme;
        const logos = await page.locator('.logo').evaluateAll((nodes) =>
          nodes.map((e) => ({
            id: e.dataset.logo,
            count: e.querySelectorAll('img').length,
            visible: [...e.querySelectorAll('img')]
              .filter((i) => i.getClientRects().length)
              .map((i) => ({
                path: new URL(i.currentSrc).pathname,
                loaded: i.complete && i.naturalWidth > 0,
              })),
          })),
        );
        for (const logo of logos) {
          const entry = registry[logo.id];
          expect(logo.count).toBe(entry.light === entry.dark ? 1 : 2);
          expect(logo.visible).toEqual([{ path: entry[effective], loaded: true }]);
        }
        expect(requests).toEqual(initialRequests);
      }
      await page.locator('.teaching').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-logo="seoul-high"] img')).toHaveAttribute(
        'src',
        registry['seoul-high'].light,
      );
      expect(
        await page
          .locator('.language-entry')
          .evaluate(
            (e) =>
              document.querySelector('.site-footer').getBoundingClientRect().top -
              e.getBoundingClientRect().bottom,
          ),
      ).toBeLessThanOrEqual(25);
      expect(
        await page
          .locator('.site-footer > div')
          .first()
          .evaluate((e) => getComputedStyle(e).marginTop),
      ).toBe('0px');
    });

test('OS theme changes without JavaScript keep exactly one appropriate logo visible', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light' });
  try {
    const page = await context.newPage();
    await page.goto('/en/');
    for (const theme of ['light', 'dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme });
      const logo = page.locator('[data-logo="toss-place"] img:visible');
      await expect(logo).toHaveCount(1);
      await expect(logo).toHaveAttribute('src', registry['toss-place'][theme]);
    }
  } finally {
    await context.close();
  }
});
