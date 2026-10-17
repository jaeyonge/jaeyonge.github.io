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
