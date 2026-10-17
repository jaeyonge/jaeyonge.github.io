# Update workflow

1. Read AGENTS, editorial decisions, applicable content/translation/design/assets guides. Run `pnpm task:start`; note latest vs. applied design commit.
2. State the request, affected facts/profile and observable completion criteria. Read local sources if present. Preserve source originals and append owner corrections.
3. Change the bilingual YAML and/or shared code. Review the counterpart translation. Select IDs rather than copy full bullets into a new version. Do not edit generated PDFs to fix content.
4. Run scoped automated checks and inspect actual outputs. A complete website change requires `pnpm check`; representative mobile, light/dark screens, no-JS content and both PDFs must be inspected.
5. Record feedback in `sources/reviews/<task-id>.md`: observed problem, exact evidence/location, reader impact and proposed fix.
6. Fix observed issues, then repeat the affected checks and relevant regressions. A passing test before the last change is not final evidence. Do not keep changing good text just to manufacture iteration.
7. Record results and remaining uncertainty. Update durable editorial/asset rules if the owner clarified a recurring point. Ensure no private source files are tracked or in `dist/`.

For new public assets, copy only reviewed derivatives into `public/`, update the logo registry/provenance, check transparent backgrounds and both theme paths, then build without source access. See the assets guide.

Website/PDF share the YAML content hash and selected profile. PDF generation writes both language candidates before promoting the pair. Any failed generation/check blocks deployment. GitHub Actions uploads only validated `dist/` on authorized main updates.
