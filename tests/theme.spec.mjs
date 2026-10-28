import { test, expect } from '@playwright/test';
import { chooseTheme } from './helpers.mjs';

for (const lang of ['ko', 'en'])
  for (const width of [390, 1440])
    for (const osTheme of ['light', 'dark'])
      test(`${lang} ${width}px OS ${osTheme}: pointer selection paints and persists the theme`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
        await page.emulateMedia({ colorScheme: osTheme, reducedMotion: 'reduce' });
        await page.goto(`/${lang}/`);
        const picker = page.locator('.theme-picker');
        const html = page.locator('html');
        const background = (theme) => (theme === 'dark' ? 'rgb(16, 16, 18)' : 'rgb(255, 255, 255)');
        await expect(page.locator('body')).toHaveCSS('background-color', background(osTheme));
        // This real pointer click used to close the menu before selection in WebKit.
        const manual = osTheme === 'light' ? 'dark' : 'light';
        await chooseTheme(page, manual);
        await expect(html).toHaveAttribute('data-theme', manual);
        await expect(page.locator('body')).toHaveCSS('background-color', background(manual));
        await expect(picker).not.toHaveAttribute('open');
        await expect(picker.locator('summary')).toBeFocused();
        expect(await page.evaluate(() => localStorage.getItem('resume-theme'))).toBe(manual);
        await page.reload();
        await expect(html).toHaveAttribute('data-theme', manual);
        await expect(page.locator('body')).toHaveCSS('background-color', background(manual));
        await page.emulateMedia({ colorScheme: manual });
        await page.emulateMedia({ colorScheme: osTheme });
        await expect(page.locator('body')).toHaveCSS('background-color', background(manual));
        await chooseTheme(page, 'system');
        await expect(html).not.toHaveAttribute('data-theme');
        await expect(page.locator('body')).toHaveCSS('background-color', background(osTheme));
        await page.emulateMedia({ colorScheme: manual });
        await expect(page.locator('body')).toHaveCSS('background-color', background(manual));
        await chooseTheme(page, osTheme);
        await expect(html).toHaveAttribute('data-theme', osTheme);
        await expect(page.locator('body')).toHaveCSS('background-color', background(osTheme));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      });

test('touch theme selection remains actionable in the mobile header', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    await page.goto('/ko/');
    await page.locator('.theme-picker summary').tap();
    await page.locator('[data-theme-choice="dark"]').tap();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 16, 18)');
    await expect(page.locator('.theme-picker')).not.toHaveAttribute('open');
  } finally {
    await context.close();
  }
});
