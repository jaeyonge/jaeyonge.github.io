import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const repository = 'nexu-io/open-design';
const appliedPath = new URL('../design/upstream-state.json', import.meta.url);
const current = JSON.parse(await readFile(appliedPath, 'utf8'));
async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}
try {
  const commit = (await (await get(`https://api.github.com/repos/${repository}/commits/main`)).json())
    .sha;
  if (commit === current.appliedCommit) {
    console.log(`OpenDesign latest main verified: ${commit}; applied reference is current.`);
    process.exit(0);
  }
  const changed = [];
  for (const { path, sha256 } of current.files) {
    const bytes = Buffer.from(
      await (
        await get(`https://raw.githubusercontent.com/${repository}/${commit}/${path}`)
      ).arrayBuffer(),
    );
    const dest = new URL(`../.design-cache/${commit}/${path}`, import.meta.url);
    await mkdir(new URL('.', dest), { recursive: true });
    await writeFile(dest, bytes);
    if (createHash('sha256').update(bytes).digest('hex') !== sha256) changed.push(path);
  }
  await writeFile(
    new URL('../.design-cache/latest.json', import.meta.url),
    JSON.stringify(
      { latestCheckedCommit: commit, appliedCommit: current.appliedCommit, changed },
      null,
      2,
    ),
  );
  console.log(
    `New upstream ${commit}. Review .design-cache/latest.json and candidate files before applying. Current applied reference preserved.`,
  );
} catch (error) {
  console.error(
    `Latest design check FAILED: ${error.message}. Existing pinned reference remains reproducible; do not claim latest verification.`,
  );
  process.exitCode = 1;
}
