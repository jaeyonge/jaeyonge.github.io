import { mkdir, writeFile } from 'node:fs/promises';
import { data, selectedExperience, selectedResearch } from '../src/lib/content.mjs';
import { renderText, period, monthLabel } from '../src/lib/format.mjs';
const get = (k) => {
  const i = process.argv.indexOf('--' + k);
  return i >= 0 ? process.argv[i + 1] : null;
};
const lang = get('lang') || 'ko';
if (!['ko', 'en'].includes(lang)) throw Error('Use --lang ko|en');
const profile = get('profile') || 'general';
const p = data.profiles[profile];
if (!p) throw Error('Unknown profile');
const u = Object.fromEntries(Object.entries(data.ui).map(([k, v]) => [k, v[lang]]));
const a = [
  `# ${data.profile.name[lang]}`,
  '',
  data.profile.role[lang],
  '',
  `${data.profile.email} | ${data.profile.phone}`,
  '',
  `## ${u.section[0]}`,
  '',
  data.hero.summary[lang],
  '',
  `## ${u.section[1]}`,
  '',
];
for (const e of selectedExperience(p)) {
  a.push(
    `### ${e.company[lang]} | ${e.role[lang]}`,
    '',
    period(e, lang, u.present),
    '',
    ...e.highlights.map((h) => '- ' + renderText(h, lang)),
    '',
  );
}
for (const e of data.teaching)
  a.push(`- ${e.company[lang]} | ${e.role[lang]} | ${period(e, lang, u.present)}`);
a.push('', `## ${u.section[2]}`, '');
for (const r of selectedResearch(p)) {
  a.push(
    `### ${r.paperTitle}`,
    '',
    `${r.venue}, ${r.year} | ${r.role[lang]} | [${u.paper}](${r.paper})`,
    '',
    ...r.highlights.map((h) => '- ' + renderText(h, lang)),
    '',
  );
}
a.push(`## ${u.section[3]}`, '');
for (const e of data.education)
  a.push(
    `### ${e.school[lang]} | ${e.program[lang]}${e.status[lang] ? ' · ' + e.status[lang] : ''}`,
    '',
    period(e, lang, u.present),
    '',
  );
a.push(`## ${u.section[4]}`, '');
for (const x of data.awards)
  a.push(
    `- ${x.title[lang]} | ${monthLabel(x.date, lang)}${x.description[lang] ? ': ' + x.description[lang] : ''}`,
  );
for (const x of data.languages) a.push(`- ${x.title[lang]} | ${x.description[lang]}`);
await mkdir('sources/exports', { recursive: true });
const dest = `sources/exports/resume-${profile}-${lang}.md`;
await writeFile(dest, a.join('\n') + '\n');
console.log(dest);
