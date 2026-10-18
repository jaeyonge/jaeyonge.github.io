// Explicit local preparation only. Builds consume the committed public files, never sources/.
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
const raw = new URL('../sources/logos/originals/', import.meta.url),
  out = new URL('../public/assets/logos/', import.meta.url);
await mkdir(out, { recursive: true });
const registry = {};
async function copy(id, file, presentation, width, height, darkFile = file) {
  await copyFile(new URL(file, raw), new URL(file, out));
  if (darkFile !== file) await copyFile(new URL(darkFile, raw), new URL(darkFile, out));
  registry[id] = {
    light: '/assets/logos/' + file,
    dark: '/assets/logos/' + darkFile,
    presentation,
    width,
    height,
  };
}
// Public derivatives are sized for the 80px wordmark / 36px crest UI, up to 4x density.
async function raster(id, source, file, presentation, width, darkSource = source, darkFile = file) {
  const write = async (input, output) =>
    sharp(new URL(input, raw).pathname)
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(new URL(output, out).pathname);
  const meta = await write(source, file);
  if (darkFile !== file) await write(darkSource, darkFile);
  registry[id] = {
    light: '/assets/logos/' + file,
    dark: '/assets/logos/' + darkFile,
    presentation,
    width: meta.width,
    height: meta.height,
  };
}
await raster(
  'toss-place',
  'toss-place-wordmark.png',
  'toss-place-web.png',
  'wordmark',
  400,
  'toss-place-wordmark-white.png',
  'toss-place-white-web.png',
);
// Official careers PNG supplies the color artwork. White is negative space,
// including the face/letter cutouts, rather than a theme-dependent backing.
const { data: doeatPixels, info: doeatInfo } = await sharp(new URL('doeat-wordmark.png', raw).pathname)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let p = 0; p < doeatPixels.length; p += 4) {
  const channels = [doeatPixels[p], doeatPixels[p + 1], doeatPixels[p + 2]];
  // Undo the white matte at antialiased edges using the two original dominant inks.
  // Preserve opaque artwork; make white negative space transparent without a pale fringe.
  const ink = channels[0] - channels[1] > 8 ? [238, 78, 52] : [43, 39, 35];
  const alpha = Math.min(1, Math.max(...channels.map((c, i) => (255 - c) / (255 - ink[i]))));
  for (let c = 0; c < 3; c++)
    doeatPixels[p + c] = alpha
      ? Math.max(0, Math.min(255, Math.round((channels[c] - 255 * (1 - alpha)) / alpha)))
      : 0;
  doeatPixels[p + 3] = Math.round(doeatPixels[p + 3] * alpha);
}
const doeatMeta = await sharp(doeatPixels, { raw: doeatInfo })
  .trim()
  .resize({ width: 400, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(new URL('doeat-color-web.png', out).pathname);
registry.doeat = {
  light: '/assets/logos/doeat-color-web.png',
  dark: '/assets/logos/doeat-color-web.png',
  presentation: 'wordmark',
  width: doeatMeta.width,
  height: doeatMeta.height,
};
await copy('iscream-arts', 'iscream-arts-wordmark.png', 'wordmark', 412, 144);
await raster('snu', 'snu-emblem.png', 'snu-emblem-web.png', 'mark light-mat', 160);
// A vector clip keeps every pixel within the official circular crest unchanged.
const g = await readFile(new URL('gyeongnam-science-high-emblem.jpg', raw));
await writeFile(
  new URL('gyeongnam-science-high.svg', out),
  `<svg xmlns="http://www.w3.org/2000/svg" width="142" height="145" viewBox="0 0 142 145"><defs><clipPath id="crest"><ellipse cx="71" cy="72.5" rx="69.5" ry="71"/></clipPath></defs><image width="142" height="145" href="data:image/jpeg;base64,${g.toString('base64')}" clip-path="url(#crest)"/></svg>`,
);
registry['gyeongnam-science-high'] = {
  light: '/assets/logos/gyeongnam-science-high.svg',
  dark: '/assets/logos/gyeongnam-science-high.svg',
  presentation: 'mark',
  width: 142,
  height: 145,
};
// Remove only the border-connected neutral white background in raster alpha.
// Preserve the original raster, colors, lettering and enclosed white crest details.
const seoul = await readFile(new URL('seoul-high-wordmark.png', raw));
const { data, info } = await sharp(seoul).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const seen = new Uint8Array(w * h);
const queue = [];
function add(x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const p = y * w + x;
  if (seen[p]) return;
  const c = p * info.channels;
  const r = data[c],
    g = data[c + 1],
    b = data[c + 2];
  if (Math.min(r, g, b) >= 242 && Math.max(r, g, b) - Math.min(r, g, b) <= 14) {
    seen[p] = 1;
    queue.push(p);
  }
}
for (let x = 0; x < w; x++) {
  add(x, 0);
  add(x, h - 1);
}
for (let y = 0; y < h; y++) {
  add(0, y);
  add(w - 1, y);
}
for (let k = 0; k < queue.length; k++) {
  const p = queue[k],
    x = p % w,
    y = Math.floor(p / w);
  add(x - 1, y);
  add(x + 1, y);
  add(x, y - 1);
  add(x, y + 1);
}
// Bake transparency once. Adjacent SVG mask rows produced antialiasing seams at UI sizes.
for (let p = 0; p < seen.length; p++) if (seen[p]) data[p * info.channels + 3] = 0;
await sharp(data, { raw: info })
  .extract({ left: 0, top: 0, width: 36, height: 42 })
  .png({ compressionLevel: 9 })
  .toFile(new URL('seoul-high-crest.png', out).pathname);
registry['seoul-high'] = {
  light: '/assets/logos/seoul-high-crest.png',
  dark: '/assets/logos/seoul-high-crest.png',
  presentation: 'mark',
  width: 36,
  height: 42,
};

const sj = await readFile(new URL('sejong-science-high-wordmark-dark.png', raw));
await writeFile(
  new URL('sejong-science-high.svg', out),
  `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42"><image width="220" height="42" href="data:image/png;base64,${sj.toString('base64')}"/></svg>`,
);
registry['sejong-science-high'] = {
  light: '/assets/logos/sejong-science-high.svg',
  dark: '/assets/logos/sejong-science-high.svg',
  presentation: 'mark',
  width: 42,
  height: 42,
};

await writeFile(
  new URL('../content/logos.json', import.meta.url),
  JSON.stringify(registry, null, 2) + '\n',
);
console.log('Prepared 7 organizations; small public derivatives preserve official artwork.');
