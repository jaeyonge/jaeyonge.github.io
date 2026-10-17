import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { join } from 'node:path';
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
for (const p of await files('dist')) {
  assert(!/(?:^|\/)(sources|tmp)(?:\/|$)/.test(p));
  assert(!p.endsWith('resume-source.md'));
  assert(!/(?:^|\/)compose(?:\/|$)/.test(p), `Authoring page in public output: ${p}`);
  if (/\.(html|css|js)$/.test(p)) {
    const s = await readFile(p, 'utf8');
    assert(!s.includes('/Users/'), `Local path in ${p}`);
    assert(!/src=["'](?:[^"']*sources\/|https?:)/.test(s), `Private/remote image dependency in ${p}`);
    assert(!/href=["'][^"']*\/compose\//.test(s), `Authoring link in public output: ${p}`);
    assert(!s.includes('data-author-selection'), `Authoring selection script in public output: ${p}`);
  }
}
console.log('Dist valid: no source documents, local filesystem paths or remote logo dependencies.');
