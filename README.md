# Jaeyong Lee · Bilingual resume workspace

A YAML-based Korean/English personal profile, printable resume and automatic PDF generator, prepared for `jaeyonge.github.io`. Shared authoring rules let Codex, Claude Code and future collaborators continue from the repository rather than the original chat.

Start with **[AGENTS.md](AGENTS.md)**. Claude Code loads the same rules through `CLAUDE.md`. Core editorial choices are in [docs/editorial-decisions.md](docs/editorial-decisions.md).

## Setup

Use Node.js 24 LTS (`.nvmrc`) and pnpm 10.8.0. Install dependencies and Chromium:

```sh
corepack enable
corepack prepare pnpm@10.8.0 --activate
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm task:start
pnpm dev
```

Open the printed local URL, then `/ko/` or `/en/`. Static pages remain readable without JS. Root routing uses stored language and ordered browser preferences, without geolocation. Theme follows the OS unless manually selected.

The root URL runs language routing in an inline head script before rendering. Its neutral name/language-choice fallback prevents an English resume flashing while a Korean destination loads and remains usable with JavaScript disabled. Sharing metadata at the root remains English and does not depend on the redirect.

## Author and verify

Edit **`content/resume.yaml`**. It contains bilingual copy, shared dates/facts, stable achievement IDs, and profiles selecting those IDs. Review both languages. `content/evidence.yaml` stores public-safe qualifications rather than private documents.

```sh
pnpm content:check
pnpm assets:check
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm check` runs the full sequence. The build creates static HTML, both language PDFs and a matching content/design metadata file. PDF failure stops the deployment bundle. Fonts are self-hosted. Output is in ignored `dist/`; do not manually edit it.

The build also generates Korean/English 1200×630 share cards from the portrait and YAML identity/tagline. Static Open Graph/Twitter metadata selects the matching card for each language route, with English at `/` for crawlers. Image URLs are versioned when rendering inputs change. See the [share-card asset contract](docs/assets-guide.md#share-card-assets).

Astro startup prepares compact Korean font subsets from all public YAML text; dev mode refreshes them after YAML changes. `.font-cache/` is ignored and requires no manual downloads. Early preloads plus optional font loading prevent a late typeface swap on slow first visits; readable system fonts remain the fallback. PDF/share-card exports explicitly wait for the intended fonts. See the [font-loading policy](docs/design-guide.md#font-loading).

- `/ko/`, `/en/`: profile pages
- `/ko/resume/`, `/en/resume/`: print resumes
- `/ko/compose/`, `/en/compose/`: select three achievements/company in click order, then open a custom print resume and use Print / Save as PDF. This is browser-local and is not automatically published.
- `/downloads/jaeyong-lee-resume-{ko,en}.pdf`: automatically generated general-profile PDFs

Local profile authoring/export:

```sh
pnpm resume:select --profile application-name
pnpm resume:export --profile application-name --lang ko
pnpm resume:export --profile application-name --lang en
RESUME_PROFILE=application-name pnpm build
```

A named local build writes `dist/` with that selected profile and both PDFs. Review before publishing. `public: false` is the default for new profiles. The main deployment permits only `general`; other profiles require an explicit deployment design change. Private job descriptions belong in ignored `sources/jobs/`, not public YAML. A profile in public YAML is public source code even if not deployed.

## Asset contract

Selected website logos live in **tracked `public/assets/logos/`**, with theme paths in `content/logos.json`. The browser never requests `sources/` or remote logos. Read [docs/assets-guide.md](docs/assets-guide.md) and [logo provenance](docs/logo-sources.md).

Original PDFs, raw logo downloads, extracted work notes, drafts, review records, job descriptions and exports are kept in ignored **`sources/`**. They are not included in clones. A clean clone must build without them. Restore local evidence from your own private storage only when needed for factual editing. Do not commit private backup addresses. `node scripts/prepare-logos.mjs` is a local-only derivative preparation command requiring original logo files; ordinary builds do not run it.

## Design references and improvement loop

Run `pnpm task:start` at each new task. It checks OpenDesign’s latest main; changed files are review candidates under ignored `.design-cache/`. Committed references and `design/upstream-state.json` define the applied revision. CI never silently fetches a newer design version. Site-specific tokens stay in `design/tokens.css`.

Read the [content](docs/content-guide.md), [translation](docs/translation-guide.md), [design](docs/design-guide.md), [update workflow](docs/update-workflow.md) and [evaluation](docs/evaluation-rubric.md) guides. Record concrete evaluation → feedback → revision → recheck in `sources/reviews/`. A self-review is not independent human review.

## GitHub Pages

Workflows validate PRs and deploy validated `dist/` after an authorized push to main or manual dispatch. Set Pages source to **GitHub Actions**. Deployment needs `pages: write` and `id-token: write`; workflow upload may require the GitHub CLI OAuth workflow scope. No secrets are embedded in the website. Public publication is separate from local development/review.

## Attribution

OpenDesign reference files retain their original Apache-2.0 and nested MIT licenses. Inter and Noto Sans KR are distributed by their pinned font packages under their included OFL licenses. Third-party institutional marks are not covered by the project’s code license; see provenance and explicit source-use conditions before publication.
