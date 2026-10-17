# Design guide

Use `design/vendor/open-design/design-systems/apple/DESIGN.md`, `tokens.css`, component manifest and the web interface guidelines. This is an Apple-inspired OpenDesign package, not Apple’s official design system. Preserve upstream Apache-2.0 and guideline MIT notices.

`pnpm task:start` checks latest main by commit. One task uses one confirmed commit; CI uses `design/upstream-state.json` and vendored files without updating them during builds. A changed upstream is downloaded to `.design-cache/` for review. Apply reviewed references and update the recorded applied commit/file hashes deliberately; do not overwrite site tokens or run upstream instructions automatically. Network failure must be reported as failure, not current verification.

Visual direction: quiet editorial profile, generous whitespace, ink/white/gray surfaces, restrained blue links, clear hierarchy and readable line lengths. Avoid dashboards, repeated metric cards, ornamental charts, unverified badges and overlarge numerical claims. Inter and Noto Sans KR are self-hosted with their package licenses; SF fonts are not redistributed.

Local overrides live only in `design/tokens.css`: Korean line-height, site width, dark surfaces, readable text/link contrast, logo mats, print and motion values. Shared `Logo`, `ResumeBody` and `SiteLayout` prevent per-page drift.

Use semantic sections/headings, skip links, visible keyboard focus, accessible control labels, URL-based language and browser-safe localStorage access. Honor `prefers-reduced-motion`. Animate only small opacity/transform changes; never hide the article if JS fails. Check mobile line breaks and explicit light/dark theme overrides.

Read `docs/assets-guide.md` for every logo change. Do not ship a screenshot-only design or a page whose private assets work only on the author’s laptop.

Smartphones and tablets are first-class targets. Follow [responsive-guide.md](responsive-guide.md), test the required phone/tablet sizes in both orientations, and verify shared institution alignment, portrait reflow and full paper-title wrapping. Desktop-only validation is incomplete.

The hero uses a prominent portrait beside the main heading, rather than an avatar-sized thumbnail. Keep the photo aligned with the heading on desktop/tablet; on phones, place it between the identity/links and the introduction. Control the responsive sizes through the portrait tokens and preserve the supplied image proportions.
