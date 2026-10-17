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
- School rows reserve the same logo column; school names line up even when assets have different shapes. Dates may move below names on phones, keeping the same alignment.
- Full research titles and Korean compound words must wrap cleanly. Primary title is the paper title; topic is secondary text.
- Controls have accessible labels and usable touch targets. Header links, language/theme choices and PDF downloads must remain reachable by touch and keyboard. Test compose selections separately in local development; authoring tools must never enter the public build.
- All real content remains readable without JavaScript. Reduced-motion settings remove nonessential animation. Test OS themes and manual overrides.
- Images must load from committed public assets and be checked after decoding before taking screenshots; a loaded URL alone does not prove an image has painted.

## Verify and record

Run `pnpm test:e2e`. The responsive tests check overflow, photo loading, layout and stable school-name alignment at the representative sizes. Capture and inspect a phone and portrait/landscape tablet view, plus any problematic width. Record concrete defects and their fixes under ignored `sources/reviews/`.

Avoid building a second copy of the content for mobile. Use shared components, layout tokens and CSS breakpoints. PDF/print uses its own layout from the same YAML and is verified separately.
