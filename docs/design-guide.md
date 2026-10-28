# Design guide

This guide owns reusable visual and interaction principles. Current content/asset choices belong in [editorial decisions](editorial-decisions.md), current web arrangement in [layout plan](layout-plan.md), and PDF presentation in [print guide](print-guide.md). See [guide ownership](guide-map.md) before adding another copy of a rule.

## Purpose and information relationships

Every element must help readers identify the person, understand the work, assess evidence or take an action. Present identity before the main proposition. Use the portrait for recognition, logos as secondary institutional identifiers, and restrained blue for real links/actions/focus. Avoid generic section leads, repeated achievement headings, ornamental cards, large isolated metrics and decorations that add no information. Inline emphasis follows the [emphasis guide](emphasis-guide.md).

Alignment expresses relationships; it is not a demand to force every kind of information into the same grid. Institution names, role metadata and narrative share the left text axis. Bullet markers hang outside that axis inside the page margin; wrapped prose returns to the text axis. Marks belong only to the institution-name row, never to a reserved column beside all subsequent prose. Long names must not shift the text start for neighboring entries.

Keep related role/date information close. Web role dates accompany their role without aligning different-length job titles into a distant shared date column. Print uses its own common right date edge; see the print guide. Multiple positions reuse the same role/date unit, newest first, without repeating the company or its overall dates. Do not add region/service/phase rows merely to fill a header; these facts remain in YAML when not selected for display.

Whitespace must explain grouping. Smaller gaps connect related metadata; larger gaps separate institutions or sections. Do not manufacture equal heights using empty descriptions, cards or minimum-height fillers. Inspect the total gap across adjacent layers: final-section padding + footer padding + first-child margin can create an unintended blank band even when each value looks reasonable alone. Use the shared end-spacing tokens, not independent patches on every child. Current dimensions live in [tokens](../design/tokens.css) and the shared styles; they are not universal acceptance thresholds.

Bound the reading width and center it at intermediate widths. Reflow the portrait and long headings instead of shrinking text into narrow columns. Required device/language/theme checks are owned by the [responsive guide](responsive-guide.md). Use real shared components (`Logo`, `ResumeBody`, `SiteLayout`, `Chevron`) and semantic H1 → H2 → H3 headings, not screenshot-specific pages.

## Controls are behavior as well as appearance

Related controls share surface, border, radius, typography, item spacing, hover/selected states and focus treatment. A custom dropdown is complete only when its interaction contract is preserved:

- Give the trigger and each action an accessible name. Show the current selection with text/check/state, not color alone. Use links for navigation and buttons for state changes; do not add menu roles without the matching keyboard behavior.
- Keep chevrons in explicit SVG boxes centered with the label. Do not depend on the vertical metrics of a font arrow glyph. Open/closed direction must be consistent.
- Support keyboard activation, visible focus, item navigation, Escape and appropriate focus return. Close on selection, outside click or focus leaving the control; only one related header popover should be open at a time.
- Keep the popup inside the viewport. A compact icon may replace a visible label on narrow screens only when its accessible name and usable touch target remain.
- Enhance progressively. Section anchors remain native `details/summary` navigation without JS. The native theme select remains available if the custom theme picker cannot initialize. A no-JS select does not imply that manual theme changes run without JS; OS-theme CSS and readable content still work.

Pointer activation must not close a menu before its action runs. WebKit can blur a summary without focusing the clicked button; preserve focus inside the menu through mouse activation while keeping keyboard focus-leave dismissal. Validate the painted theme after real pointer and touch selection in Chromium and WebKit, not only a changed data attribute.

Theme handling has three separate states to verify: initial OS preference, explicit manual choice, and return to system preference. Manual choice wins until the user selects system again; later OS changes then take effect. Logo policy and loading checks belong in the [assets guide](assets-guide.md).

Use subtle opacity/transform motion only where it helps feedback. Never hide essential content pending JS/animation. Honor reduced motion. For visual review, capture the settled state or disable nonessential motion; an intermediate rotating-chevron frame is not the final alignment. Verify actual light/dark text and action contrast, including button foregrounds.

## First paint and font loading

The root URL is a neutral language gateway, not an English resume rendered before a Korean redirect. Its shared resolver runs synchronously in the head; preserve explicit URL/saved-choice/browser-language precedence, query/hash, the neutral no-JS language links and static English share metadata. No location, IP or timezone inference.

Web uses self-hosted Inter and Noto Sans KR. Print fonts and current weights are specified in the [print guide](print-guide.md); they must not affect screen font requests. Astro startup uses `scripts/prepare-fonts.mjs` to generate compact Korean WOFF2 subsets from the complete public YAML catalog and pinned Fontsource or vendored official font originals. The dev watcher refreshes subsets after YAML changes. `.font-cache/` is ignored and regenerated in a clean checkout; no private sources or build-time font downloads. Preserve OFL notices and font name/license records.

`src/lib/fonts.mjs` owns the web assets, early preloads and `font-display: optional`. Favor the intended initial rendering without a late font swap; do not gate the entire page on `document.fonts.ready`. PDF/share exporters explicitly load their required faces before capture. Test cold/cached, delayed/failed font responses, no-JS readability, actual rendered font families and stable layout. Current request budgets are checked by [font tests](../tests/fonts.spec.mjs); investigate regressions rather than restoring hundreds of sliced font declarations. References: [optional-font preloading](https://web.dev/articles/preload-optional-fonts), [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display), [subset-font](https://github.com/papandreou/subset-font).

## Design reference updates

Use the vendored OpenDesign Apple-inspired `DESIGN.md`, tokens, component manifest and web guidelines. This package is not Apple's official design system. Keep Apache-2.0/MIT notices and do not redistribute SF fonts.

Run `pnpm task:start` once at task start to check latest main. The confirmed applied revision is recorded in `design/upstream-state.json`. Changed upstream files under ignored `.design-cache/` are review candidates, not commands to run or permission to replace local choices. Network failure is not successful verification. Apply a reviewed reference deliberately and update recorded hashes; CI uses committed references without silently updating them. Site overrides stay in `design/tokens.css`, with print-specific implementation in `src/styles/print.css`.
