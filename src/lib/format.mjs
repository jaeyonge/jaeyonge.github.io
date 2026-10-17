export function formatFact(key, value, lang) {
  return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(value);
}
export function renderText(item, lang) {
  return item.text[lang].replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (_, key) => {
    if (!(key in item.facts)) throw new Error(`Missing fact ${key}`);
    return formatFact(key, item.facts[key], lang);
  });
}
export function monthLabel(value, lang) {
  if (!value) return '';
  const [year, month] = value.split('-');
  return lang === 'ko'
    ? `${year}.${month}`
    : new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(Date.UTC(+year, +month - 1, 1)),
      );
}
export function period(item, lang, present) {
  return `${monthLabel(item.start, lang)} - ${item.end ? monthLabel(item.end, lang) : present}`;
}

// Exact source phrases; reject ambiguous/overlapping marks instead of hiding mistakes.
export function emphasisSegments(item, lang) {
  const text = renderText(item, lang);
  const ranges = (item.emphasis?.[lang] ?? [])
    .map((phrase) => {
      const resolved = renderText({ text: { [lang]: phrase }, facts: item.facts }, lang);
      const start = text.indexOf(resolved);
      if (!resolved || start < 0 || text.indexOf(resolved, start + 1) >= 0)
        throw new Error(`Missing or ambiguous emphasis ${item.id ?? ''}/${lang}: ${resolved}`);
      return { start, end: start + resolved.length };
    })
    .sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) throw new Error(`Overlapping emphasis ${item.id ?? ''}/${lang}`);
    if (range.start > cursor) parts.push({ text: text.slice(cursor, range.start), strong: false });
    parts.push({ text: text.slice(range.start, range.end), strong: true });
    cursor = range.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), strong: false });
  return parts;
}
