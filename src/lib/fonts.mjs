import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff2?url';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff2?url';
import korean400 from '../../.font-cache/noto-sans-kr-400.woff2?url';
import korean600 from '../../.font-cache/noto-sans-kr-600.woff2?url';

export const fontAssets = [
  { family: 'Inter', weight: 400, url: inter400 },
  { family: 'Inter', weight: 600, url: inter600 },
  { family: 'Noto Sans KR', weight: 400, url: korean400 },
  { family: 'Noto Sans KR', weight: 600, url: korean600 },
];

// Optional prevents a late font swap on a slow first visit. Early preloads make
// the intended faces available before first paint on ordinary connections.
export const fontCss = fontAssets
  .map(
    ({ family, weight, url }) =>
      `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:optional;src:url('${url}') format('woff2');}`,
  )
  .join('\n');
