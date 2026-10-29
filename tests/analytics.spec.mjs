import { test, expect } from '@playwright/test';
import config from '../content/analytics.json' with { type: 'json' };

async function production(page, baseURL, { automated = false, storageBlocked = false } = {}) {
  const requests = [];
  await page.addInitScript(
    ({ automated, storageBlocked }) => {
      Object.defineProperty(navigator, 'webdriver', { get: () => automated });
      if (storageBlocked)
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new DOMException('Blocked', 'SecurityError');
          },
        });
    },
    { automated, storageBlocked },
  );
  await page.route('https://jaeyonge.github.io/**', async (route) => {
    const source = new URL(route.request().url());
    const response = await page.request.get(new URL(source.pathname + source.search, baseURL).href);
    await route.fulfill({ response });
  });
  await page.route(
    /https:\/\/(?:[^/]+\.)?(?:googletagmanager\.com|google-analytics\.com)\//,
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: 'application/javascript',
        body: '/* analytics test transport: no requests leave the test */',
      });
    },
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  return requests;
}
async function commands(page) {
  return page.evaluate(() => (window.dataLayer || []).map((args) => Array.from(args)));
}
async function events(page, name) {
  return (await commands(page))
    .filter((args) => args[0] === 'event' && args[1] === name)
    .map((args) => args[2]);
}
for (const lang of ['ko', 'en']) {
  test(`${lang}: analytics waits for consent then loads exactly one tag and sanitized page view`, async ({
    page,
    baseURL,
  }) => {
    const requests = await production(page, baseURL);
    await page.goto(
      `https://jaeyonge.github.io/${lang}/?utm_source=linkedin&email=private@example.com#about`,
    );
    await expect(page.locator('[data-analytics-panel]')).toBeVisible();
    expect(requests).toEqual([]);
    await page.locator('[data-analytics-choice="granted"]').click();
    await expect(page.locator('script[data-resume-google-tag]')).toHaveCount(1);
    await expect.poll(() => events(page, 'page_view')).toHaveLength(1);
    const view = (await events(page, 'page_view'))[0];
    expect(view.page_language).toBe(lang);
    expect(view.page_location).toBe(`https://jaeyonge.github.io/${lang}/?utm_source=linkedin`);
    const settings = (await commands(page)).find((args) => args[0] === 'config');
    expect(settings[1]).toBe(config.measurementId);
    expect(settings[2]).toMatchObject({
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    await page.locator('[data-analytics-settings]').click();
    await page.locator('[data-analytics-choice="granted"]').click();
    expect(await events(page, 'page_view')).toHaveLength(1);
    expect(requests).toHaveLength(1);
  });
}
test('section reach is deduplicated, direct jumps are not backfilled, hidden tabs stop time', async ({
  page,
  baseURL,
}) => {
  await production(page, baseURL);
  await page.goto('https://jaeyonge.github.io/ko/');
  await page.locator('[data-analytics-choice="granted"]').click();
  await page.evaluate(() =>
    window.scrollTo({ top: document.getElementById('research').offsetTop - 80, behavior: 'instant' }),
  );
  await expect
    .poll(
      async () => (await events(page, 'section_view')).filter((e) => e.section_id === 'research').length,
    )
    .toBe(1);
  expect((await events(page, 'section_view')).some((e) => e.section_id === 'experience')).toBe(false);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const duration = (await events(page, 'section_engagement')).reduce(
    (sum, e) => sum + e.visible_seconds,
    0,
  );
  expect(duration).toBeGreaterThan(0);
  await page.waitForTimeout(1200);
  expect((await events(page, 'section_engagement')).reduce((sum, e) => sum + e.visible_seconds, 0)).toBe(
    duration,
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(1200);
  expect((await events(page, 'section_view')).filter((e) => e.section_id === 'research')).toHaveLength(
    1,
  );
  expect((await events(page, 'scroll_depth')).map((e) => e.scroll_percent)).toContain(50);
});
test('click events preserve native actions and never expose contact values', async ({
  page,
  baseURL,
}) => {
  await production(page, baseURL);
  await page.goto('https://jaeyonge.github.io/en/');
  await page.locator('[data-analytics-choice="granted"]').click();
  const download = page.waitForEvent('download');
  await page.locator('.hero-actions a[download]').click();
  expect((await download).suggestedFilename()).toBe('jaeyong-lee-resume-en.pdf');
  expect(await events(page, 'resume_download_click')).toHaveLength(1);
  await page
    .locator('.hero-actions a[href^="mailto:"]')
    .evaluate((a) => a.addEventListener('click', (e) => e.preventDefault(), { once: true }));
  await page.locator('.hero-actions a[href^="mailto:"]').click();
  const contacts = await events(page, 'contact_click');
  expect(contacts).toHaveLength(1);
  expect(JSON.stringify(contacts)).not.toContain('@');
  expect(contacts[0].target_kind).toBe('email');
});
test('denial and revocation prevent further tag loading and clear analytics cookies', async ({
  page,
  baseURL,
}) => {
  const requests = await production(page, baseURL);
  await page.goto('https://jaeyonge.github.io/ko/');
  await page.locator('[data-analytics-choice="denied"]').click();
  await page.reload();
  await expect(page.locator('[data-analytics-panel]')).toBeHidden();
  expect(requests).toEqual([]);
  await page.locator('[data-analytics-settings]').click();
  await page.locator('[data-analytics-choice="granted"]').click();
  await expect.poll(() => requests.length).toBe(1);
  await page.evaluate(() => {
    document.cookie = '_ga=test;path=/;Secure';
  });
  await page.locator('[data-analytics-settings]').click();
  await Promise.all([
    page.waitForEvent('load'),
    page.locator('[data-analytics-choice="denied"]').click(),
  ]);
  await expect(page.locator('script[data-resume-google-tag]')).toHaveCount(0);
  expect(await page.evaluate(() => document.cookie)).not.toContain('_ga=');
  expect(requests).toHaveLength(1);
});
test('local previews and automated production browsers never send analytics', async ({
  page,
  baseURL,
}) => {
  const requests = await production(page, baseURL, { automated: true });
  await page.goto('https://jaeyonge.github.io/en/');
  await expect(page.locator('[data-analytics-panel]')).toBeHidden();
  await page.goto(`${baseURL}/ko/`);
  await expect(page.locator('[data-analytics-settings]')).toBeHidden();
  expect(requests).toEqual([]);
});
test('blocked storage still permits an in-page choice without breaking the site', async ({
  page,
  baseURL,
}) => {
  const requests = await production(page, baseURL, { storageBlocked: true });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('https://jaeyonge.github.io/en/');
  await page.locator('[data-analytics-choice="granted"]').click();
  await expect.poll(() => requests.length).toBe(1);
  await expect(page.locator('#about-title')).toBeVisible();
  expect(errors).toEqual([]);
});

test('blocked Google tag does not break content, menus or local consent controls', async ({
  page,
  baseURL,
}) => {
  await production(page, baseURL);
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('https://jaeyonge.github.io/ko/');
  await page.locator('[data-analytics-choice="granted"]').click();
  await expect(page.locator('#about-title')).toBeVisible();
  await page.locator('.theme-picker summary').click();
  await page.locator('[data-theme-choice="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-analytics-settings]').click();
  await expect(page.locator('[data-analytics-panel]')).toBeVisible();
  expect(errors).toEqual([]);
});
