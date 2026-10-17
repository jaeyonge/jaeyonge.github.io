import { mkdir, readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';
import YAML from 'yaml';

export async function prepareFonts() {
  // Include the entire public catalog, not just the default selected profile.
  const text =
    JSON.stringify(YAML.parse(await readFile('content/resume.yaml', 'utf8'))) + ' ←↑→↓↗•…0123456789';
  await mkdir('.font-cache', { recursive: true });
  for (const weight of [400, 600]) {
    const source = await readFile(
      `node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-${weight}-normal.woff2`,
    );
    const bytes = await subsetFont(source, text, {
      targetFormat: 'woff2',
      preserveNameIds: [0, 13, 14],
    });
    const path = `.font-cache/noto-sans-kr-${weight}.woff2`;
    const previous = await readFile(path).catch(() => null);
    if (!previous?.equals(bytes)) await writeFile(path, bytes);
    console.log(`Korean font ${weight}: ${Math.round(bytes.length / 1024)} KB (public YAML subset)`);
  }
}
