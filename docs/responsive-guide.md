# Responsive layout: mandatory for every UI task

A page is not complete because its desktop screenshot looks good. The owner explicitly requires smartphone and tablet support.

## Required viewports

| Device class     | Representative viewport |
| ---------------- | ----------------------- |
| Small smartphone | 320×568                 |
| Smartphone       | 390×844                 |
| Tablet portrait  | 768×1024 and 820×1180   |
| Tablet landscape | 1024×768 and 1180×820   |
| Desktop          | 1440×1000               |

Test both languages and light/dark presentation where relevant. These are regression samples, not a claim that every device has been tested. Also inspect intermediate widths and text zoom when a change introduces long headings or controls.

## Layout contracts

- No horizontal page overflow, clipped headings, overlapping text, hidden actions or viewport-width-based font scaling that makes body copy unreadable.
- Hero portrait and text reflow rather than squeeze into two narrow mobile columns. Preserve face placement and intrinsic image ratio; do not stretch or redraw the supplied portrait.
- School names, role/program metadata and narrative share the left text edge. A consistent right-hand mark slot occupies only the name row; no reserved logo column continues through the metadata/prose. Keep long school names aligned and let dates wrap locally without creating empty filler rows.
- Full research titles and Korean compound words must wrap cleanly. Primary title is the paper title; topic is secondary text.
- Controls have accessible labels and usable touch targets. Header links, language/theme choices and PDF downloads must remain reachable by touch and keyboard. Test compose selections separately in local development; authoring tools must never enter the public build.
- All real content remains readable without JavaScript. Reduced-motion settings remove nonessential animation. Test initial OS themes, manual overrides, return to system and subsequent OS changes separately. The [design control contract](design-guide.md#controls-are-behavior-as-well-as-appearance) defines menu behavior; the [assets guide](assets-guide.md#theme-and-loading-contract) defines image readiness.
- Images must load from committed public assets and be checked after decoding before screenshots; a loaded URL alone does not prove paint. Check cold/cached states and visible theme variants. Capture controls after nonessential animation settles or with reduced motion, not halfway through chevron rotation.

## Verify and record

Run `pnpm test:e2e`. The responsive tests check overflow, photo loading, layout and stable school-name alignment at the representative sizes. Capture and inspect a phone and portrait/landscape tablet view, plus any problematic width. Check header controls against the content margins and open popovers against the viewport; do not accept a barely non-overflowing row whose controls have lost their intended spacing. At compact widths, an accessible icon may replace a visible control label. Verify keyboard navigation, selected state, Escape/outside-click dismissal and no-JS fallback as applicable. Record concrete defects and their fixes under ignored `sources/reviews/`.

Avoid building a second copy of the content for mobile. Use shared components, layout tokens and CSS breakpoints. PDF/print uses its own layout from the same YAML and is verified separately.
