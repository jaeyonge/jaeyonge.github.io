import { mkdir, readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';
import YAML from 'yaml';

export async function prepareFonts() {
  // Include the entire public catalog, not just the default selected profile.
  const text =
    JSON.stringify(YAML.parse(await readFile('content/resume.yaml', 'utf8'))) + ' ←↑→↓↗•…0123456789';
  await mkdir('.font-cache', { recursive: true });
  for (const family of ['noto-sans-kr', 'source-han-serif-kr']) {
    for (const weight of [400, 600]) {
      const source = await readFile(
        family === 'source-han-serif-kr'
          ? `vendor/fonts/source-han-serif-kr/SourceHanSerifKR-${weight === 400 ? 'Regular' : 'SemiBold'}.otf`
          : `node_modules/@fontsource/${family}/files/${family}-korean-${weight}-normal.woff2`,
      );
      const bytes = await subsetFont(source, text, {
        targetFormat: 'woff2',
        preserveNameIds: [0, 13, 14],
      });
      const path = `.font-cache/${family}-${weight}.woff2`;
      const previous = await readFile(path).catch(() => null);
      if (!previous?.equals(bytes)) await writeFile(path, bytes);
      console.log(`${family} ${weight}: ${Math.round(bytes.length / 1024)} KB (public YAML subset)`);
    }
  }
}
