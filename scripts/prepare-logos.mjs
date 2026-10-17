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
await copy(
  'toss-place',
  'toss-place-wordmark.png',
  'wordmark',
  4882,
  800,
  'toss-place-wordmark-white.png',
);
await copy('doeat', 'doeat-wordmark.svg', 'wordmark', 120, 34);
await copy('iscream-arts', 'iscream-arts-wordmark.png', 'wordmark', 412, 144);
await copy('snu', 'snu-emblem.png', 'mark light-mat', 2116, 2195);
await copy(
  'sejong-science-high',
  'sejong-science-high-wordmark-dark.png',
  'wordmark',
  220,
  42,
  'sejong-science-high-wordmark.png',
);
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
// SVG alpha mask: remove only the border-connected neutral white background.
// Preserve the original raster, colors, lettering and enclosed white crest details.
const seoul = await readFile(new URL('seoul-high-wordmark.png', raw));
const { data, info } = await sharp(seoul).removeAlpha().raw().toBuffer({ resolveWithObject: true });
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
let holes = '';
for (let y = 0; y < h; y++)
  for (let x = 0; x < w;) {
    if (!seen[y * w + x]) {
      x++;
      continue;
    }
    const start = x;
    while (x < w && seen[y * w + x]) x++;
    holes += `<rect x="${start}" y="${y}" width="${x - start}" height="1"/>`;
  }
const mask = `<defs><mask id="bg" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/><g fill="black">${holes}</g></mask></defs>`;
const img = `<image width="${w}" height="${h}" href="data:image/png;base64,${seoul.toString('base64')}" mask="url(#bg)"/>`;
await writeFile(
  new URL('seoul-high.svg', out),
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">${mask}${img}</svg>`,
);
await writeFile(
  new URL('seoul-high-wordmark.svg', out),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${mask}${img}</svg>`,
);
registry['seoul-high'] = {
  light: '/assets/logos/seoul-high.svg',
  dark: '/assets/logos/seoul-high.svg',
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
console.log('Prepared 7 organizations; public SVG masks preserve original official artwork.');
