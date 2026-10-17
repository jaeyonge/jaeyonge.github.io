import { readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import registry from '../content/logos.json' with { type: 'json' };
for (const [id, logo] of Object.entries(registry)) {
  for (const asset of new Set([logo.light, logo.dark])) {
    assert(asset.startsWith('/assets/logos/') && !asset.includes('..'), `Unsafe path ${id}`);
    const file = 'public' + asset;
    assert((await stat(file)).size > 0);
    const meta = await sharp(file).metadata();
    assert(meta.width > 0 && meta.height > 0, `Unreadable logo ${id}`);
  }
}
for (const file of ['gyeongnam-science-high.svg', 'seoul-high.svg']) {
  const { data, info } = await sharp('public/assets/logos/' + file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (const [x, y] of [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ])
    assert.equal(data[(y * info.width + x) * 4 + 3], 0, `${file}: corner background is opaque`);
}
console.log('Public logos valid: 7 organizations, theme files exist, square corners transparent.');

const { data: resume } = await import('../src/lib/content.mjs');
const portrait = 'public' + resume.profile.portrait.src;
const portraitInfo = await sharp(portrait).metadata();
assert.equal(portraitInfo.width, resume.profile.portrait.width);
assert.equal(portraitInfo.height, resume.profile.portrait.height);
console.log('Public portrait valid and intrinsic dimensions match.');
