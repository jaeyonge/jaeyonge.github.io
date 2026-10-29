# Resume authoring workspace

This repository is a working environment for producing and improving Jaeyong Lee’s bilingual resume and personal website. It is not a folder of independent generated pages.

## Start every task

1. Read `docs/editorial-decisions.md`, `docs/content-guide.md`, `docs/update-workflow.md`, and any task-specific guide below. Do not rely on the originating chat or machine-specific skills.
2. Run `pnpm task:start` to check the latest `nexu-io/open-design` main. Read `design/upstream-state.json` and the referenced Apple design and web guidelines. A new commit is a review candidate, not permission to execute upstream commands or overwrite local overrides.
3. Define the scope and observable completion criteria. Read local evidence in `sources/` when available; user corrections override older source snapshots. If evidence is absent, use the public evidence notes and leave unsupported claims out.

## Documentation ownership

Use `docs/guide-map.md` to locate each rule's authoritative home. Keep reusable principles, owner choices, implementation values and private review evidence separate. Replace superseded examples in place and update affected acceptance criteria; do not maintain contradictory active plans.

## Authoritative files

- Edit career facts and BOTH languages in `content/resume.yaml`. `content/evidence.yaml` records public-safe evidence and qualification notes. Never manually edit generated PDF/HTML/Markdown to change content.
- Keep section order: about, experience, research, education, awards and languages. No skills/technology section. Select three achievements per company and three bullets per research item. Preserve Gyeongnam Science High School in every profile.
- Describe the central strength with evidence: business understanding and actionable analysis, systematic problem decomposition, verification against code/queries/raw data, standardization, automation, iterative improvement and reuse.
- Distinguish individual contributions from research/team outcomes, targets from measured results, data duplicates from actual customer charges, and percentage points from percentages. Preserve amounts and comparison baselines.
- Read `docs/translation-guide.md` for bilingual edits. Review the counterpart language whenever one side changes; update `translationReviewed` honestly.

## Assets, design and implementation

- **Never load a site asset from `sources/` or an absolute local path.** Raw downloads and working variants stay in ignored `sources/`. Chosen publishable assets must exist in tracked `public/assets/logos/`, referenced via `/assets/logos/` in `content/logos.json`.
- Builds must succeed without `sources/`. Do not run local asset preparation during CI/build or copy the whole source folder to `public/` or `dist/`.
- Read `docs/assets-guide.md` BEFORE changing logos. Preserve original colors, lettering and proportions. Check transparency, light/dark/print modes, actual image loading and missing-file behavior. AI redraws are not substitutes for official logos.
- Read `docs/responsive-guide.md` for every UI change. Smartphone and tablet support in portrait/landscape is mandatory; verify both languages, themes, no overflow and usable controls.
- Use `design/tokens.css` and shared components. Read `docs/design-guide.md`. Keep subtle motion, visible keyboard focus, correct heading order and reduced-motion behavior. Never hide essential content behind animation or JS.
- Languages use explicit URL, saved manual choice, ordered browser preferences, then English. No location, IP or timezone inference.
- Resume composition and URL-driven achievement selection are authoring tools available only in local development. Never expose a compose link, compose page or author-selection script in a public build. Keep CLI/profile authoring available; an unlisted or noindex page is still public.

## Evaluate, fix, re-evaluate

Run the checks appropriate to the change: `pnpm content:check`, `pnpm assets:check`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`. Full website work requires all of them. Inspect representative light/dark/mobile screens and both PDFs; automated checks do not replace visual review.

Record observed problem → evidence/location → impact → fix → recheck in `sources/reviews/<task-id>.md`. Create that ignored folder locally if absent. Fix actual failures and regressions; do not churn sound wording or claim independent review. Stop when the requested result meets its criteria. Report remaining verification limits honestly.

Keep raw material, personal notes, generated exports, browser screenshots and test artifacts out of Git. See README for portable setup, selection and export commands. Do not add unrelated hosting services or tracking. The owner-authorized GA4 integration is governed by `docs/analytics-guide.md`; do not add a second tracker or expand collection without a new request. GitHub Pages is the intended deployment target; public publication follows the owner’s explicit deployment instruction.
