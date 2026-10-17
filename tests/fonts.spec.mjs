import { test, expect } from '@playwright/test';

async function renderedHeadingFonts(page) {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '#about-title',
    });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    return fonts
      .map(({ familyName, isCustomFont, glyphCount }) => ({ familyName, isCustomFont, glyphCount }))
      .sort((a, b) => a.familyName.localeCompare(b.familyName));
  } finally {
    await cdp.detach();
  }
}

for (const lang of ['ko', 'en']) {
  test(`${lang}: compact local fonts are preloaded and render with their original families`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    await page.evaluate(() => document.fonts.ready);
    const resources = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .filter((entry) => /\.woff2(?:\?|$)/.test(entry.name))
        .map((entry) => ({ name: entry.name, bytes: entry.encodedBodySize })),
    );
    expect(resources.length).toBeLessThanOrEqual(4);
    expect(resources.reduce((sum, entry) => sum + entry.bytes, 0)).toBeLessThan(125000);
    expect(await page.evaluate(() => Array.from(document.fonts, (font) => font.display))).toEqual([
      'optional',
      'optional',
      'optional',
      'optional',
    ]);
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((nodes) => nodes.map((node) => node.href));
    expect(preloads.length).toBe(lang === 'ko' ? 4 : 3);
    for (const url of preloads) expect(resources.some((resource) => resource.name === url)).toBe(true);
    // Cached navigation must use the intended typefaces, not a permanently forced system font.
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    expect(await renderedHeadingFonts(page)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          familyName: expect.stringMatching(lang === 'ko' ? /^Noto Sans KR/ : /^Inter/),
          isCustomFont: true,
        }),
      ]),
    );
  });

  test(`${lang}: delayed fonts never replace already-painted fallback text`, async ({ page }) => {
    let release;
    const hold = new Promise((resolve) => {
      release = resolve;
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route(/\.woff2(?:\?|$)/, async (route) => {
      await hold;
      await route.continue();
    });
    try {
      await page.goto(`/${lang}/`, { waitUntil: 'domcontentloaded' });
      // Wait for a real text paint while every font response is still held.
      await page.waitForFunction(() =>
        performance.getEntriesByType('paint').some((entry) => entry.name === 'first-contentful-paint'),
      );
      // Keep fonts pending beyond the optional font's brief block period.
      await page.waitForFunction(() => performance.now() >= 500);
      const before = await renderedHeadingFonts(page);
      expect(before.length).toBeGreaterThan(0);
      expect(before.every((font) => !font.isCustomFont)).toBe(true);
      const box = await page.locator('#about-title').boundingBox();
      release();
      await page.waitForLoadState('networkidle');
      expect(await renderedHeadingFonts(page)).toEqual(before);
      expect(await page.locator('#about-title').boundingBox()).toEqual(box);
    } finally {
      release();
    }
  });

  test(`${lang}: failed font downloads keep the page readable without JavaScript`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    try {
      const page = await context.newPage();
      await page.route(/\.woff2(?:\?|$)/, (route) => route.abort());
      await page.goto(`/${lang}/`);
      await expect(page.locator('#about-title')).toBeVisible();
      await expect(page.locator('.intro-copy')).not.toBeEmpty();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally {
      await context.close();
    }
  });
}
