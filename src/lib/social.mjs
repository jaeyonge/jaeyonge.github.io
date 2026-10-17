import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { contentHash, data } from './content.mjs';

const version = createHash('sha256').update(contentHash);
for (const file of [
  `public${data.profile.portrait.src}`,
  'design/tokens.css',
  'src/styles/global.css',
  'scripts/generate-social.mjs',
])
  version.update(readFileSync(file));
const imageVersion = version.digest('hex').slice(0, 12);

export const socialSize = { width: 1200, height: 630 };
export function socialImagePath(lang) {
  if (!['ko', 'en'].includes(lang)) throw new Error(`Unsupported social locale: ${lang}`);
  return `/assets/social/profile-${lang}-${imageVersion}.png`;
}
