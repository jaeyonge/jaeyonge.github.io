# Design guide

Use `design/vendor/open-design/design-systems/apple/DESIGN.md`, `tokens.css`, component manifest and the web interface guidelines. This is an Apple-inspired OpenDesign package, not Apple’s official design system. Preserve upstream Apache-2.0 and guideline MIT notices.

`pnpm task:start` checks latest main by commit. One task uses one confirmed commit; CI uses `design/upstream-state.json` and vendored files without updating them during builds. A changed upstream is downloaded to `.design-cache/` for review. Apply reviewed references and update the recorded applied commit/file hashes deliberately; do not overwrite site tokens or run upstream instructions automatically. Network failure must be reported as failure, not current verification.

Visual direction: quiet editorial profile, generous whitespace, ink/white/gray surfaces, restrained blue links, clear hierarchy and readable line lengths. Avoid dashboards, repeated metric cards, ornamental charts, unverified badges and overlarge numerical claims. Inter and Noto Sans KR are self-hosted with their package licenses; SF fonts are not redistributed.

Local overrides live only in `design/tokens.css`: Korean line-height, site width, dark surfaces, readable text/link contrast, logo mats, print and motion values. Shared `Logo`, `ResumeBody` and `SiteLayout` prevent per-page drift.

Use semantic sections/headings, skip links, visible keyboard focus, accessible control labels, URL-based language and browser-safe localStorage access. Honor `prefers-reduced-motion`. Animate only small opacity/transform changes; never hide the article if JS fails. Check mobile line breaks and explicit light/dark theme overrides.

Read `docs/assets-guide.md` for every logo change. Do not ship a screenshot-only design or a page whose private assets work only on the author’s laptop.

Smartphones and tablets are first-class targets. Follow [responsive-guide.md](responsive-guide.md), test the required phone/tablet sizes in both orientations, and verify shared institution alignment, portrait reflow and full paper-title wrapping. Desktop-only validation is incomplete.

The hero uses a prominent portrait beside the main heading, rather than an avatar-sized thumbnail. Keep the photo aligned with the heading on desktop/tablet; on phones, place it between the identity/links and the introduction. Control the responsive sizes through the portrait tokens and preserve the supplied image proportions.

The root URL is a language gateway, not an English resume rendered before redirecting. Run its shared language resolver in a synchronous inline head script, independent of external JavaScript. Keep only the name and accessible Korean/English links as the neutral no-JS fallback; never hide content using a JS-only visibility gate. Preserve static English share metadata for crawlers, saved-language precedence, and query/hash during navigation.

## Font loading

Keep Inter and Noto Sans KR, weights 400/600. Astro startup generates Korean WOFF2 subsets from the entire public YAML catalog and the pinned Fontsource Korean originals using `scripts/prepare-fonts.mjs`; `.font-cache/` is ignored and regenerated in a clean checkout. The dev watcher regenerates subsets when YAML changes. Preserve OFL notices and font copyright/license name records. Do not use private source material or download fonts during a build.

`src/lib/fonts.mjs` defines four compact font assets, inline face declarations with `font-display: optional`, and early font preloads in the shared layout. This prioritizes the intended fonts without a later swap if a slow first visit paints a system fallback. Do not hide the entire page behind `document.fonts.ready` or use an unbounded font-loading gate. PDF/share-image exporters explicitly load the four faces with blocking display before capturing, ensuring deterministic typography regardless of the screen loading policy.

Test cold/cached requests, delayed and failed font responses, no-JS readability, actual rendered heading fonts and stable layout after a delayed download. Keep requests to at most four WOFF2 files for the default pages; investigate size regressions instead of restoring hundreds of Unicode-slice declarations. Policy references: [Chrome's optional-font preload guidance](https://web.dev/articles/preload-optional-fonts), [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display), [subset-font](https://github.com/papandreou/subset-font).
