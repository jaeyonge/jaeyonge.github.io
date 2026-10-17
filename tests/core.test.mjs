import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLanguage } from '../src/lib/locale.mjs';
import { formatFact, renderText } from '../src/lib/format.mjs';
import { data, selectedExperience } from '../src/lib/content.mjs';
test('explicit language URL wins over saved and browser preference', () => {
  assert.equal(resolveLanguage({ pathname: '/ko/resume/', saved: 'en', languages: ['en-US'] }), 'ko');
});
test('saved supported language wins on root', () => {
  assert.equal(resolveLanguage({ saved: 'en', languages: ['ko-KR'] }), 'en');
});
test('first supported browser language wins; no country inference', () => {
  assert.equal(resolveLanguage({ languages: ['fr-FR', 'ko-KR', 'en-US'] }), 'ko');
  assert.equal(resolveLanguage({ languages: ['en-US', 'ko-KR'] }), 'en');
  assert.equal(resolveLanguage({ languages: ['ja-JP'], language: 'ko-KR' }), 'en');
  assert.equal(resolveLanguage({ languages: [], language: 'ko-KR' }), 'ko');
});
test('public correction keeps only the approved relative metric', () => {
  const h = data.experience[0].highlights[0];
  assert.deepEqual(h.facts, { annualTransactionVolumePercent: 1 });
  assert(renderText(h, 'ko').includes('1%를 초과'));
  assert(renderText(h, 'en').includes('1% of annual transaction volume'));
});
test('selected profile resolves ordered IDs and same underlying facts', () => {
  const e = selectedExperience(data.profiles.product);
  assert.equal(e[0].highlights[0].id, 'product-log-analysis');
  const h = e[0].highlights.find((x) => x.id === 'payment-quality');
  assert(renderText(h, 'ko').includes('1%를 초과'));
  assert(renderText(h, 'en').includes('1% of annual transaction volume'));
});

test('emphasis preserves prose and fact formatting in source order', async () => {
  const { emphasisSegments } = await import('../src/lib/format.mjs');
  const item = {
    text: { en: 'Built checks; reduced manual work by {percent}%.' },
    facts: { percent: 70 },
    emphasis: { en: ['reduced manual work by {percent}%', 'Built checks'] },
  };
  const parts = emphasisSegments(item, 'en');
  assert.equal(parts.map((p) => p.text).join(''), renderText(item, 'en'));
  assert.deepEqual(
    parts.filter((p) => p.strong).map((p) => p.text),
    ['Built checks', 'reduced manual work by 70%'],
  );
  for (const phrases of [['missing'], ['Built', 'Built checks'], ['Built', 'Built']])
    assert.throws(() => emphasisSegments({ ...item, emphasis: { en: phrases } }, 'en'));
  assert.throws(() =>
    emphasisSegments({ text: { en: 'check check' }, facts: {}, emphasis: { en: ['check'] } }, 'en'),
  );
});
