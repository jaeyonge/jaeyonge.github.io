import test from 'node:test';
import assert from 'node:assert/strict';
import { safePageUrl, safeReferrer, clickTarget } from '../src/lib/analytics.mjs';

test('analytics keeps campaign channels but strips arbitrary queries and fragments', () => {
  assert.equal(
    safePageUrl(
      'https://jaeyonge.github.io/ko/?email=person@example.com&utm_source=linkedin&utm_medium=profile#research',
    ),
    'https://jaeyonge.github.io/ko/?utm_source=linkedin&utm_medium=profile',
  );
  assert.equal(
    safePageUrl('https://jaeyonge.github.io/en/?utm_campaign=person@example.com'),
    'https://jaeyonge.github.io/en/',
  );
  assert.equal(safeReferrer('https://example.com/private?token=secret#x'), 'https://example.com/');
  assert.equal(safeReferrer(''), '');
});
test('analytics contact events never include contact addresses or numbers', () => {
  for (const [href, kind] of [
    ['mailto:private@example.com', 'email'],
    ['tel:+821012345678', 'phone'],
  ]) {
    assert.deepEqual(clickTarget({ getAttribute: () => href }), {
      name: 'contact_click',
      target_kind: kind,
    });
  }
});
test('analytics only classifies the known resume download paths', () => {
  const node = (href) => ({ getAttribute: () => href, closest: () => null });
  assert.deepEqual(clickTarget(node('/downloads/jaeyong-lee-resume-ko.pdf')), {
    name: 'resume_download_click',
    target_kind: 'pdf_ko',
  });
  assert.equal(clickTarget(node('/unknown/private.pdf')), null);
  assert.equal(clickTarget(node('https://unknown.example/private')), null);
});
