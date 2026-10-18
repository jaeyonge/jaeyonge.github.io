import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { data, selectedExperience, selectedResearch } from '../src/lib/content.mjs';
import { renderText } from '../src/lib/format.mjs';
for (const lang of ['ko', 'en']) {
  test(`${lang}: formal PDF is black, single-page, and uses intended typeface`, async ({ page }) => {
    await page.goto(`/${lang}/resume/`);
    const sheet = await page.locator('.resume-page').boundingBox();
    const toolbar = await page.locator('.print-toolbar').boundingBox();
    expect(Math.abs(sheet.x + sheet.width / 2 - (toolbar.x + toolbar.width / 2))).toBeLessThan(1);
    await expect(page.locator('.resume-page .entry').first()).toHaveCSS('display', 'block');
    for (const entry of [...selectedExperience(), ...selectedResearch()]) {
      const selector =
        'company' in entry ? `[data-entry="${entry.id}"]` : `[data-research="${entry.id}"]`;
      const actual = await page.locator(`${selector} li`).allTextContents();
      expect(actual.map((t) => t.replace(/\s+/g, ' ').trim())).toEqual(
        entry.highlights.map((h) => renderText(h, lang).replace(/\s+/g, ' ').trim()),
      );
    }
    await expect(page.locator('#about, .teaching, .research-header .eyebrow, #awards')).toHaveCount(0);

    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.evaluate(() => document.fonts.ready);
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: '.print-identity h1',
      });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      expect(fonts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            familyName: expect.stringMatching(lang === 'ko' ? /^Nanum\s?Gothic/ : /^Source Serif 4/),
            isCustomFont: true,
          }),
        ]),
      );
    } finally {
      await cdp.detach();
      // Detaching a DevTools session clears Chromium media emulation.
      await page.emulateMedia({ media: 'print', colorScheme: 'light' });
      await page.evaluate(() => document.fonts.ready);
    }

    const coloredText = await page
      .locator('main')
      .evaluate((main) =>
        [...main.querySelectorAll('*')]
          .filter(
            (e) =>
              e.getClientRects().length &&
              [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()) &&
              getComputedStyle(e).color !== 'rgb(0, 0, 0)',
          )
          .map((e) => e.textContent),
      );
    expect(coloredText).toEqual([]);
    const alignment = await page.locator('.resume-page').evaluate((main) => ({
      right: main.getBoundingClientRect().right,
      dates: [
        ...main.querySelectorAll(
          '.entry-position .entry-date, .print-teaching-position .entry-date, .print-research-meta > .entry-date, .education-entry > .entry-date, .award-entry > .entry-date',
        ),
      ].map((e) => e.getBoundingClientRect().right),
      prose: [...main.querySelectorAll('.entry li')].map((e) => getComputedStyle(e).textAlign),
    }));
    for (const right of alignment.dates) expect(Math.abs(right - alignment.right)).toBeLessThan(1);
    expect(alignment.prose.every((value) => value === 'justify')).toBe(true);

    await expect(page.locator('.entry li strong').first()).toBeVisible();
    const task = getDocument({
      data: new Uint8Array(await readFile(`dist/downloads/jaeyong-lee-resume-${lang}.pdf`)),
      useSystemFonts: true,
      disableFontFace: true,
    });
    try {
      const doc = await task.promise;
      expect(doc.numPages).toBe(1);
      const text = async (n) =>
        (await (await doc.getPage(n)).getTextContent()).items
          .map((i) => i.str)
          .join('')
          .replace(/\s/g, '');
      const pageText = await text(1);
      expect(pageText).toContain('Pedagogy-R1');
      expect(pageText).toContain(lang === 'ko' ? '경남과학고등학교' : 'GyeongnamScienceHighSchool');
      expect(pageText).not.toContain(lang === 'ko' ? '세종과학고등학교' : 'SejongScienceHighSchool');
      expect(pageText).not.toContain('TOEIC');
    } finally {
      await task.destroy();
    }
  });
}
