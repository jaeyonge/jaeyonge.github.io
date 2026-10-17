export function resolveLanguage({
  pathname = '/',
  saved = null,
  languages: preferred = [],
  language = null,
} = {}) {
  const supported = ['ko', 'en'];
  const explicit = pathname.match(/^\/(ko|en)(?:\/|$)/)?.[1];
  if (explicit) return explicit;
  if (supported.includes(saved)) return saved;
  const choices = preferred?.length ? preferred : [language].filter(Boolean);
  for (const locale of choices) {
    const lang = String(locale).toLowerCase().split('-')[0];
    if (supported.includes(lang)) return lang;
  }
  return 'en';
}

// Keep the parser-blocking head script independent of deferred JS/network requests.
// The resolver is self-contained, so the same language policy runs inline and in tests.
export const rootRedirectScript = `(() => {
  const resolve = ${resolveLanguage.toString()};
  let saved = null;
  try { saved = localStorage.getItem('resume-language'); } catch {}
  const lang = resolve({
    pathname: location.pathname, saved,
    languages: navigator.languages, language: navigator.language
  });
  location.replace('/' + lang + '/' + location.search + location.hash);
})();`;
