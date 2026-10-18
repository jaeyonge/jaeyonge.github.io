import { test, expect } from '@playwright/test';
import { chooseTheme } from './helpers.mjs';

for (const lang of ['ko', 'en'])
  for (const osTheme of ['light', 'dark'])
    test(`${lang} ${osTheme}: shared header menus align, select and close accessibly`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: osTheme });
      await page.goto(`/${lang}/`);
      await expect(page.locator('.section-heading > span')).toHaveCount(0);
      const sections = page.locator('.mobile-sections');
      const picker = page.locator('.theme-picker');
      await sections.locator('summary').click();
      await expect(sections).toHaveAttribute('open', '');
      await picker.locator('summary').click();
      await expect(sections).not.toHaveAttribute('open');
      await expect(picker).toHaveAttribute('open', '');
      await expect(picker.locator('button[aria-pressed="true"]')).toHaveAttribute(
        'data-theme-choice',
        'system',
      );
      const alignment = await page.locator('[data-header-menu] summary').evaluateAll((nodes) =>
        nodes.map((e) => {
          const arrow = e.querySelector('.chevron').getBoundingClientRect(),
            box = e.getBoundingClientRect();
          return Math.abs((arrow.top + arrow.bottom - box.top - box.bottom) / 2);
        }),
      );
      alignment.forEach((offset) => expect(offset).toBeLessThan(0.5));
      await picker.locator('summary').press('ArrowDown');
      await expect(picker.locator('[data-theme-choice="system"]')).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(picker.locator('[data-theme-choice="light"]')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await expect(picker).not.toHaveAttribute('open');
      await expect(picker.locator('summary')).toBeFocused();
      await chooseTheme(page, 'dark');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await picker.locator('summary').click();
      await page.keyboard.press('Escape');
      await expect(picker).not.toHaveAttribute('open');
      await picker.locator('summary').click();
      await page.locator('.hero-portrait').click();
      await expect(picker).not.toHaveAttribute('open');
      for (const width of [320, 390, 768, 820, 1180, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const right = await page
          .locator('.header-controls')
          .evaluate((e) => e.getBoundingClientRect().right);
        expect(right).toBeLessThanOrEqual(width - 23);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    });

test('without JS the native theme control and section anchors remain reachable', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/en/');
    await expect(page.locator('#theme')).toBeVisible();
    await expect(page.locator('.theme-picker')).toBeHidden();
    await page.locator('.mobile-sections summary').click();
    await expect(page.locator('.mobile-sections a')).toHaveCount(5);
  } finally {
    await context.close();
  }
});
