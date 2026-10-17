import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { contentHash } from '../src/lib/content.mjs';
for (const lang of ['ko', 'en']) {
  const path = `dist/downloads/jaeyong-lee-resume-${lang}.pdf`;
  const bytes = new Uint8Array(await readFile(path));
  const pdf = await PDFDocument.load(bytes);
  assert(pdf.getSubject()?.includes(contentHash));
  assert(
    pdf.getPageCount() >= 1 && pdf.getPageCount() <= 3,
    `${path}: expected up to 3 readable pages; edit content/layout instead of shrinking fonts`,
  );
  const loadingTask = getDocument({ data: bytes.slice(), useSystemFonts: true, disableFontFace: true });
  const doc = await loadingTask.promise;
  let text = '';
  let links = 0;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const c = await page.getTextContent();
    const t = c.items.map((x) => x.str || '').join('');
    assert(t.replace(/\s/g, '').length > 30, `Blank page ${i}`);
    text += t;
    links += (await page.getAnnotations()).filter((x) => x.url).length;
  }
  const compact = text.replace(/\s/g, '');
  for (const key of lang === 'ko'
    ? ['이재용', '토스플레이스', '경남과학고등학교', '2026.05', 'Pedagogy-R1']
    : ['JaeyongLee', 'TossPlace', 'GyeongnamScienceHighSchool', 'May2026', 'Pedagogy-R1'])
    assert(compact.includes(key), `${path}: missing extracted text ${key}`);
  assert(links >= 5, `${path}: missing PDF links`);
  assert(bytes.length < 2 * 1024 * 1024, `${path}: PDF exceeds 2 MB`);
  console.log(
    `PDF valid (${lang}): ${doc.numPages} pages, ${Math.round(bytes.length / 1024)} KB, ${links} links, selectable text and matching content hash.`,
  );
  await loadingTask.destroy();
}
