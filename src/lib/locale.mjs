export const languages = ['ko', 'en'];
export function resolveLanguage({
  pathname = '/',
  saved = null,
  languages: preferred = [],
  language = null,
} = {}) {
  const explicit = pathname.match(/^\/(ko|en)(?:\/|$)/)?.[1];
  if (explicit) return explicit;
  if (languages.includes(saved)) return saved;
  const choices = preferred?.length ? preferred : [language].filter(Boolean);
  for (const locale of choices) {
    const lang = String(locale).toLowerCase().split('-')[0];
    if (languages.includes(lang)) return lang;
  }
  return 'en';
}
