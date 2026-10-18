import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { contentHash, selectedExperience, selectedResearch } from '../src/lib/content.mjs';
import { renderText } from '../src/lib/format.mjs';
for (const lang of ['ko', 'en']) {
  const path = `dist/downloads/jaeyong-lee-resume-${lang}.pdf`;
  const bytes = new Uint8Array(await readFile(path));
  const pdf = await PDFDocument.load(bytes);
  assert(pdf.getSubject()?.includes(contentHash));
  assert.equal(
    pdf.getPageCount(),
    1,
    `${path}: expected exactly 1 readable page; edit content/layout instead of shrinking fonts`,
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
  const normalizeText = (value) => value.normalize('NFKC').replace(/[’ʼ]/g, "'").replace(/\s/g, '');
  const compact = normalizeText(text);
  for (const entry of [...selectedExperience(), ...selectedResearch()])
    for (const h of entry.highlights)
      assert(
        compact.includes(normalizeText(renderText(h, lang))),
        `${path}: source prose changed or missing ${h.id}`,
      );

  for (const key of lang === 'ko'
    ? ['이재용', '토스플레이스', '경남과학고등학교', 'Pedagogy-R1']
    : ['JaeyongLee', 'TossPlace', 'GyeongnamScienceHighSchool', 'Pedagogy-R1'])
    assert(compact.includes(key), `${path}: missing extracted text ${key}`);
  for (const excluded of lang === 'ko'
    ? ['서울고등학교', '세종과학고등학교', 'TOEIC']
    : ['SeoulHighSchool', 'SejongScienceHighSchool', 'TOEIC'])
    assert(!compact.includes(excluded), `${path}: found excluded text ${excluded}`);
  assert(links >= 5, `${path}: missing PDF links`);
  assert(bytes.length < 2 * 1024 * 1024, `${path}: PDF exceeds 2 MB`);
  console.log(
    `PDF valid (${lang}): ${doc.numPages} pages, ${Math.round(bytes.length / 1024)} KB, ${links} links, selectable text and matching content hash.`,
  );
  await loadingTask.destroy();
}
