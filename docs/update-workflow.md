# Update workflow

1. Read AGENTS, editorial decisions, [guide ownership](guide-map.md), and applicable content/translation/design/assets guides. Run `pnpm task:start`; note latest vs. applied design commit.
2. State the request, affected facts/profile and observable completion criteria. Read local sources if present. Preserve source originals and append owner corrections.
3. Change the bilingual YAML and/or shared code. Review the counterpart translation. Select IDs rather than copy full bullets into a new version. Do not edit generated PDFs to fix content.
4. Run scoped automated checks and inspect actual outputs. A complete website change requires `pnpm check`; representative mobile, light/dark screens, no-JS content and both PDFs must be inspected.
5. Record feedback in `sources/reviews/<task-id>.md`: observed problem, exact evidence/location, reader impact and proposed fix.
6. Fix observed issues, then repeat the affected checks and relevant regressions. A passing test before the last change is not final evidence. Do not keep changing good text just to manufacture iteration.
7. Record results and remaining uncertainty. Update the owning guide/current decision when feedback establishes a recurring rule. Replace stale examples/diagrams and reconcile affected evaluation criteria; do not append a contradictory correction beneath an active old rule. Ensure no private source files are tracked or in `dist/`.

For new public assets, copy only reviewed derivatives into `public/`, update the logo registry/provenance, check transparent backgrounds and both theme paths, then build without source access. See the assets guide.

Website/PDF share the YAML content hash and selected profile. PDF generation writes both language candidates before promoting the pair. Any failed generation/check blocks deployment. GitHub Actions uploads only validated `dist/` on authorized main updates.

## Scope the verification honestly

For documentation-only work, validate changed relative links, wording/authority consistency, current implementation references and `git diff --check`. Content checks can confirm that authoritative YAML still validates. Do not run a full site/PDF rebuild solely to make a documentation task look more thorough, and do not claim visual or browser rechecks that did not run. If the documents expose a real implementation regression, record it and fix it within authorized scope with the relevant checks.

Website changes still require the full sequence above. Browser acceptance uses the isolated production static server in [Playwright config](../playwright.config.mjs), not a convenient already-running dev server: development-only routes/toolbars can invalidate public-build assertions. Preserve user-owned local servers.

Review both bold-only scanning and full prose for all selected bilingual bullets when writing/emphasis changes. For UI/assets, examine relationships, accumulated spacing, menu interaction and actual decoded/painted images across initial/manual/system theme states; HTTP success or no overflow is not sufficient evidence. Reuse the [evaluation rubric](evaluation-rubric.md) instead of inventing a second per-task rule set.

Keep examples and public guides free of private measurements/screenshots. Public code/tests may encode approved invariants; observed screenshots, comparison exports and detailed task notes stay in ignored reviews. Commit/push or publish only within the owner's authorized scope, and distinguish push completion from deployment completion.
