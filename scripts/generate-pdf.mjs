import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { staticServer } from './static-server.mjs';
import { contentHash, profileId } from '../src/lib/content.mjs';
const server = await staticServer();
let browser;
try {
  await mkdir('dist/downloads', { recursive: true });
  browser = await chromium.launch();
  const files = [];
  for (const lang of ['ko', 'en']) {
    const page = await browser.newPage({
      locale: lang === 'ko' ? 'ko-KR' : 'en-US',
      colorScheme: 'light',
    });
    await page.goto(`${server.url}/${lang}/resume/`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' });
    await page.evaluate(async () => {
      // Exports always use the intended fonts, independent of the screen's
      // optional-loading policy or the timing of the first browser paint.
      await Promise.all(
        Array.from(document.fonts, (font) => {
          font.display = 'block';
          return font.load();
        }),
      );
      await document.fonts.ready;
    });
    await page.waitForFunction(() =>
      Array.from(document.images).every(
        (i) => !i.getClientRects().length || (i.complete && i.naturalWidth > 0),
      ),
    );
    const hash = await page.locator('meta[name="content-hash"]').getAttribute('content');
    if (hash !== contentHash) throw Error('HTML/content hash mismatch');
    const bytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
    const pdf = await PDFDocument.load(bytes);
    pdf.setTitle(`Jaeyong Lee Resume (${lang})`);
    pdf.setSubject(`content:${contentHash};profile:${profileId}`);
    const dest = `dist/downloads/jaeyong-lee-resume-${lang}.pdf`;
    await writeFile(dest + '.pending', await pdf.save());
    files.push({ dest, pages: pdf.getPageCount(), lang });
    await page.close();
  }
  // Commit the pair only after both languages have printed successfully.
  for (const f of files) {
    await rename(f.dest + '.pending', f.dest);
    console.log(`${f.dest}: ${f.pages} pages`);
  }
  await writeFile(
    'dist/build-meta.json',
    JSON.stringify(
      {
        contentHash,
        profile: profileId,
        pdfs: files.map((f) => ({ lang: f.lang, path: f.dest.replace('dist/', ''), pages: f.pages })),
        design: JSON.parse(await readFile('design/upstream-state.json', 'utf8')).appliedCommit,
      },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  await server.close();
}
