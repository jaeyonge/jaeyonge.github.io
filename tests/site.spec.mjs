import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { data } from '../src/lib/content.mjs';

for (const [path, lang] of [
  ['/', 'en'],
  ['/ko/', 'ko'],
  ['/en/', 'en'],
])
  test(`${path}: crawler receives localized share metadata and a real social card without JS`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.goto(path);
      const image = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(image).toMatch(
        new RegExp(`^https://jaeyonge\\.github\\.io/assets/social/profile-${lang}-[a-f0-9]{12}\\.png$`),
      );
      expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(
        `https://jaeyonge.github.io${path}`,
      );
      expect(await page.locator('meta[property="og:locale"]').getAttribute('content')).toBe(
        lang === 'ko' ? 'ko_KR' : 'en_US',
      );
      expect(await page.locator('meta[property="og:image:alt"]').getAttribute('content')).toContain(
        lang === 'ko' ? '이재용' : 'Jaeyong Lee',
      );
      expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe(
        'summary_large_image',
      );
      expect(await page.locator('meta[name="twitter:image"]').getAttribute('content')).toBe(image);
      const response = await page.request.get(new URL(image).pathname);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
      const metadata = await sharp(await response.body()).metadata();
      expect([metadata.width, metadata.height]).toEqual([1200, 630]);
    } finally {
      await context.close();
    }
  });
for (const lang of ['ko', 'en'])
  for (const theme of ['light', 'dark'])
    test(`${lang} ${theme}: sections, real logo requests, no overflow`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(`/${lang}/`);
      await page.selectOption('#theme', theme);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.locator('section').evaluateAll((nodes) => nodes.map((n) => n.id))).toEqual([
        'about',
        'experience',
        'research',
        'education',
        'awards',
      ]);
      await expect(page.locator('[data-entry]')).toHaveCount(3);
      for (const block of await page.locator('[data-entry]').all())
        await expect(block.locator('li')).toHaveCount(3);
      for (const block of await page.locator('[data-research]').all())
        await expect(block.locator('li')).toHaveCount(3);
      await page.locator('#education').scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        Array.from(document.images).every(
          (i) => !i.getClientRects().length || (i.complete && i.naturalWidth > 0),
        ),
      );
      expect(
        await page
          .locator('[data-logo="snu"]')
          .first()
          .evaluate((e) => getComputedStyle(e).backgroundColor),
      ).toBe('rgb(255, 255, 255)');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
      for (const src of await page
        .locator('img')
        .evaluateAll((imgs) => [...new Set(imgs.map((i) => i.getAttribute('src')))])) {
        const r = await page.request.get(src);
        expect(r.ok(), src).toBeTruthy();
      }
      const pdf = await page.request.get(`/downloads/jaeyong-lee-resume-${lang}.pdf`);
      expect(pdf.ok()).toBeTruthy();
      expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
    });
test('mobile Korean dark mode has no overflow and manual theme wins', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/ko/');
  await page.selectOption('#theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: '언어 선택' }).click();
  await expect(page).toHaveURL(/\/en\//);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
for (const scenario of [
  { name: 'Korean browser', locale: 'ko-KR', saved: null, target: 'ko' },
  { name: 'saved English', locale: 'ko-KR', saved: 'en', target: 'en' },
  { name: 'saved Korean', locale: 'en-US', saved: 'ko', target: 'ko' },
  { name: 'blocked storage', locale: 'ko-KR', saved: null, target: 'ko', blocked: true },
])
  test(`root has no English-resume flash with deferred JS blocked: ${scenario.name}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: scenario.locale });
    let release;
    const hold = new Promise((resolve) => {
      release = resolve;
    });
    let reached;
    const destinationRequested = new Promise((resolve) => {
      reached = resolve;
    });
    try {
      await context.addInitScript(({ saved, blocked }) => {
        if (blocked)
          Object.defineProperty(window, 'localStorage', {
            get() {
              throw new DOMException('Blocked', 'SecurityError');
            },
          });
        else if (saved) localStorage.setItem('resume-language', saved);
      }, scenario);
      const page = await context.newPage();
      await page.route('**/*', (route) =>
        route.request().resourceType() === 'script' ? route.abort() : route.fallback(),
      );
      await page.route(
        (url) => url.pathname === `/${scenario.target}/`,
        async (route) => {
          reached();
          await hold;
          await route.continue();
        },
      );
      await page.goto('/?from=share#experience', { waitUntil: 'commit' });
      await destinationRequested;
      // Inspect the served root while the destination is held. Playwright's DOM APIs
      // wait for pending navigation; the source itself must contain no English resume.
      const rootResponse = await context.request.get('/');
      const rootHtml = await rootResponse.text();
      expect(rootHtml).not.toContain('id="about-title"');
      expect(rootHtml).not.toContain('class="site-header"');
      expect(rootHtml).not.toContain('class="site-footer"');
      expect(rootHtml.indexOf('location.replace')).toBeGreaterThan(0);
      expect(rootHtml.indexOf('location.replace')).toBeLessThan(rootHtml.indexOf('</head>'));
      release();
      await expect(page).toHaveURL(new RegExp(`/${scenario.target}/\\?from=share#experience$`));
      await expect(page.locator('html')).toHaveAttribute('lang', scenario.target);
      await expect(page.locator('#about-title')).toBeVisible();
    } finally {
      release();
      await context.close();
    }
  });

test('root respects browser language; explicit URL survives opposite preference', async ({
  browser,
}) => {
  const c = await browser.newContext({ locale: 'ko-KR' });
  const p = await c.newPage();
  await p.goto('/');
  await expect(p).toHaveURL(/\/ko\//);
  await p.goto('/en/');
  await expect(p).toHaveURL(/\/en\//);
  await c.close();
});
test('storage failure does not break explicit-page language navigation', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/ko/');
  await page.getByRole('link', { name: '언어 선택' }).click();
  await expect(page).toHaveURL(/\/en\//);
});
test('no-JS pages retain content and paper links', async ({ browser }) => {
  const c = await browser.newContext({ javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto('/ko/');
  await expect(p.locator('[data-entry]')).toHaveCount(3);
  await expect(p.locator('a[href="https://doi.org/10.1145/3746252.3761133"]')).toBeVisible();
  await p.goto('/');
  await expect(p.locator('a[lang="ko"]').first()).toBeVisible();
  await c.close();
});
for (const lang of ['ko', 'en'])
  test(`${lang}: public pages exclude authoring links, routes and URL selection`, async ({ page }) => {
    await page.goto(`/${lang}/`);
    await expect(page.locator('a[href*="/compose/"]')).toHaveCount(0);
    expect((await page.request.get(`/${lang}/compose/`)).status()).toBe(404);
    const selection = {
      ...data.profiles.general.experience,
      'toss-place': ['merchant-classification', 'session-integrity', 'log-workflow'],
    };
    const encoded = Buffer.from(JSON.stringify(selection)).toString('base64');
    await page.goto(`/${lang}/resume/?selection=${encodeURIComponent(encoded)}`);
    await expect(page.locator('script[data-author-selection]')).toHaveCount(0);
    await expect(page.locator('[data-entry="toss-place"] li').first()).toContainText(
      lang === 'ko' ? '결제 지표의 중복 이슈' : 'Initiated the company’s first workflow',
    );
    await expect(page.locator('[data-download]')).toHaveCount(1);
  });
const devices = [
  { name: 'small-phone', width: 320, height: 568 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'large-tablet-portrait', width: 820, height: 1180 },
  { name: 'large-tablet-landscape', width: 1180, height: 820 },
  { name: 'desktop', width: 1440, height: 1000 },
];
for (const device of devices)
  for (const lang of ['ko', 'en'])
    test(`${device.name} ${lang}: portrait, complete papers and aligned school names`, async ({
      page,
    }) => {
      await page.setViewportSize(device);
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await page.goto(`/${lang}/`);
      const portrait = page.locator('.hero-portrait img');
      await expect(portrait).toBeVisible();
      await portrait.evaluate((i) => i.decode());
      expect(await portrait.evaluate((i) => i.naturalWidth > 0)).toBe(true);
      await expect(page.locator('.hero-profile-links a')).toHaveCount(3);
      await expect(page.locator('[data-research="pedagogy-r1"] h3')).toHaveText(
        'Pedagogy-R1: Pedagogical Large Reasoning Model and Well-balanced Educational Benchmark',
      );
      await expect(page.locator('[data-research="drawing-assessment"] h3')).toHaveText(
        'Automated Assessment of Student Hand Drawings in Free-Response Items on the Particulate Nature of Matter',
      );
      const schools = await page
        .locator('.teaching-entry h3')
        .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().left));
      expect(Math.abs(schools[0] - schools[1])).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const careerGrid = await page.locator('.case-study').evaluateAll((entries) =>
        entries.map((entry) => {
          const x = (selector) => entry.querySelector(selector).getBoundingClientRect().left;
          return {
            company: x('h3'),
            evidence: x('li > span'),
            list: x('ul'),
            metadata: [...entry.querySelectorAll('.entry-role')].map(
              (e) => e.getBoundingClientRect().left,
            ),
            logoLeft: x('.logo'),
            logoRight: entry.querySelector('.logo').getBoundingClientRect().right,
            right: entry.getBoundingClientRect().right,
          };
        }),
      );
      for (const grid of careerGrid) {
        for (const x of [grid.list, grid.evidence, ...grid.metadata])
          expect(Math.abs(x - grid.company)).toBeLessThan(1);
        expect(Math.abs(grid.company - careerGrid[0].company)).toBeLessThan(1);
        expect(Math.abs(grid.right - grid.logoRight)).toBeLessThan(1);
        expect(grid.logoLeft).toBeGreaterThan(grid.company);
      }
      await expect(page.locator('[data-entry="doeat"] .entry-context p')).toHaveCount(4);
      for (const entry of await page.locator('.case-study').all()) {
        const rows = await entry.evaluate((e) => ({
          rolesTop: e.querySelector('.entry-context').getBoundingClientRect().top,
          companyBottom: e.querySelector('.entry-organization').getBoundingClientRect().bottom,
        }));
        expect(rows.rolesTop).toBeGreaterThan(rows.companyBottom);
      }

      for (const row of await page.locator('.teaching-entry').all()) {
        const layout = await row.evaluate((e) => {
          const name = e.querySelector('h3').getBoundingClientRect();
          const role = e.querySelector('div > p').getBoundingClientRect();
          const date = e.querySelector('.entry-date').getBoundingClientRect();
          return {
            nameX: name.left,
            roleX: role.left,
            dateX: date.left,
            roleBottom: role.bottom,
            dateTop: date.top,
          };
        });
        expect(Math.abs(layout.nameX - layout.dateX)).toBeLessThan(1);
        expect(Math.abs(layout.nameX - layout.roleX)).toBeLessThan(1);
        expect(layout.dateTop - layout.roleBottom).toBeGreaterThanOrEqual(0);
        expect(layout.dateTop - layout.roleBottom).toBeLessThanOrEqual(6);
      }
      await page.locator('#awards').scrollIntoViewIfNeeded();
      const gap = await page
        .locator('.award-entry')
        .evaluateAll(
          (nodes) => nodes[2].getBoundingClientRect().top - nodes[1].getBoundingClientRect().bottom,
        );
      expect(gap).toBeLessThanOrEqual(26);
    });
test('i-Scream Arts keeps a transparent presentation in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/ko/');
    await page.selectOption('#theme', theme);
    const logo = page.locator('[data-logo="iscream-arts"]');
    await logo.scrollIntoViewIfNeeded();
    expect(await logo.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    await expect(logo).not.toHaveClass(/light-mat/);
  }
});

for (const lang of ['ko', 'en'])
  test(`${lang}: reading layout and mobile section navigation work without JavaScript`, async ({
    browser,
  }) => {
    const c = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    try {
      const p = await c.newPage();
      await p.goto(`/${lang}/`);
      await expect(p.locator('#about-title')).toHaveText(data.profile.name[lang]);
      await expect(p.locator('.featured-work, .achievement-label, .chapter-lead')).toHaveCount(0);
      for (const item of await p.locator('[data-entry] li, [data-research] li').all()) {
        expect(await item.locator('strong').count()).toBeGreaterThan(0);
        await expect(item.locator('.achievement-copy')).toHaveCount(1);
      }
      const menu = p.locator('.mobile-sections');
      await menu.locator('summary').click();
      await menu.locator(`a[href="/${lang}/#research"]`).click();
      await expect(p).toHaveURL(/#research$/);
      await expect(p.locator('#research-title')).toBeInViewport();
      await p.goto(`/${lang}/resume/`);
      await expect(p.locator('.achievement-copy')).toHaveCount(15);
    } finally {
      await c.close();
    }
  });

for (const theme of ['light', 'dark'])
  test(`${theme}: PDF action text meets normal-text contrast`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/');
    await page.selectOption('#theme', theme);
    const ratio = await page.locator('.hero .button.primary').evaluate((e) => {
      const c = getComputedStyle(e);
      const rgb = (s) =>
        s
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number);
      const lum = (a) => {
        const v = a.map((x) => {
          x /= 255;
          return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
      };
      const a = lum(rgb(c.color)),
        b = lum(rgb(c.backgroundColor));
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
