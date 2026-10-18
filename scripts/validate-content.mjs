import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import { data } from '../src/lib/content.mjs';
import { renderText, emphasisSegments } from '../src/lib/format.mjs';
const evidence = YAML.parse(readFileSync('content/evidence.yaml', 'utf8')).evidence;
const ids = new Set();
for (const entry of [...data.experience, ...data.research]) {
  for (const h of entry.highlights) {
    assert(!ids.has(h.id), `Duplicate highlight ${h.id}`);
    ids.add(h.id);
    assert(evidence[h.evidenceId], `Missing evidence ${h.id}`);
    const placeholders = (l) => [...h.text[l].matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(placeholders('ko'), placeholders('en'), `Fact placeholders ${h.id}`);
    for (const l of ['ko', 'en']) {
      assert(h.text[l].trim());
      renderText(h, l);
    }
  }
}
for (const [id, p] of Object.entries(data.profiles)) {
  assert.deepEqual(
    Object.keys(p.experience).sort(),
    data.experience.map((x) => x.id).sort(),
    `Companies ${id}`,
  );
  for (const e of data.experience) {
    const h = p.experience[e.id];
    assert.equal(new Set(h).size, 3);
    assert(h.every((id) => e.highlights.some((x) => x.id === id)));
  }
  assert(p.research.every((id) => data.research.some((x) => x.id === id)));
  assert.equal(new Set(p.research).size, p.research.length);
}
assert(
  data.education.some(
    (x) => x.id === 'gyeongnam-science-high' && x.start === '2011-03' && x.end === '2013-02',
  ),
);
assert.equal(data.awards.find((x) => x.id === 'openai-hackathon').date, '2026-05');
assert(!data.hero.summary.ko.includes('4년'));
console.log(
  `Content valid: ${data.experience.length} companies, ${ids.size} achievements, bilingual facts and profiles.`,
);

const correction = data.experience
  .find((e) => e.id === 'toss-place')
  .highlights.find((h) => h.id === 'payment-quality');
assert.deepEqual(correction.facts, { annualTransactionVolumePercent: 1 });
assert(correction.text.ko.includes('연간 거래액'));
assert(correction.text.en.includes('annual transaction volume'));
assert(!Object.keys(correction.facts).some((k) => /amount|currency/i.test(k)));

for (const feature of data.hero.featured) {
  assert(
    data.experience.some((e) => e.highlights.some((h) => h.id === feature.highlight)),
    `Unknown featured achievement ${feature.highlight}`,
  );
}

for (const feature of data.hero.featured) {
  const h = data.experience.flatMap((e) => e.highlights).find((h) => h.id === feature.highlight);
  for (const lang of ['ko', 'en']) renderText({ text: feature.takeaway, facts: h.facts }, lang);
}

for (const entry of [...data.experience, ...data.research])
  for (const h of entry.highlights)
    for (const lang of ['ko', 'en']) {
      emphasisSegments(h, lang);
    }
