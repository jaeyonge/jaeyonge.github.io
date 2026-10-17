import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import YAML from 'yaml';
const id = process.argv[process.argv.indexOf('--profile') + 1];
if (!process.argv.includes('--profile') || !id || id.startsWith('-'))
  throw Error('Usage: pnpm resume:select --profile <id>');
const file = 'content/resume.yaml';
const data = YAML.parse(await readFile(file, 'utf8'));
const rl = createInterface({ input: process.stdin, output: process.stdout });
const selections = {};
try {
  for (const e of data.experience) {
    console.log(`\n${e.company.ko}`);
    e.highlights.forEach((h, i) => console.log(`${i + 1}. ${h.text.ko}`));
    const answer = await rl.question('Choose 3 in display order (e.g. 1,2,3): ');
    const indexes = answer.split(',').map((v) => Number(v.trim()) - 1);
    if (indexes.length !== 3 || new Set(indexes).size !== 3 || indexes.some((i) => !e.highlights[i]))
      throw Error('Exactly 3 valid choices required; YAML unchanged');
    selections[e.id] = indexes.map((i) => e.highlights[i].id);
  }
  data.profiles[id] = {
    label: data.profiles[id]?.label || { ko: id, en: id },
    public: data.profiles[id]?.public || false,
    experience: selections,
    research: data.profiles[id]?.research || data.research.map((r) => r.id),
  };
  await writeFile(file, YAML.stringify(data, { lineWidth: 105 }));
  console.log(`Saved ${id}. Run content:check and review both languages.`);
} finally {
  rl.close();
}
