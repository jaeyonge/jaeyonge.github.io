# Formal download resume

This guide owns the current general-profile print contract. Shared prose/facts/emphasis belong in YAML under the [one-source rule](content-guide.md#one-source-multiple-outputs). Web composition follows the [layout plan](layout-plan.md), not this print grid.

## Selection and page target

The general profile uses one A4 page in each language. `outputs.pdf` in [resume.yaml](../content/resume.yaml) selects experience, research and education, excluding introduction, teaching, research-topic descriptions, and awards/languages. Preserve three selected achievements per company/research and mandatory education, including Gyeongnam Science High School. The header retains contact/profile links.

Selection and presentation may differ from the website; selected sentences and emphasis may not. Never add print-only summaries, alternate prose fields or hardcoded shorter descriptions. If exact selected content does not fit readably, revise layout within approved bounds or obtain an owner decision on shared content/selection. Do not silently drop an achievement, change the accepted page limit, hide text or shrink type to claim one-page success. Future named profiles do not automatically inherit a guarantee that every selection fits one page.

## Formal visual hierarchy

- Black text and links on white only. No portrait, logos, decorative numbering or colored accents. Build hierarchy with type size/weight, proximity, alignment and sparse black section rules.
- Company first, then role/date units newest first. Role is left, period uses the common right edge. Do not repeat overall employment dates or phase metadata. Service tagline is omitted to avoid a third metadata layer; the authoritative data retains it.
- All dates/years, including publication years, align to that right edge. Research venue, role and paper link stay left. Short teaching records, when selected for a different profile, use the same compact grouping rather than a separate empty layout.
- Achievement bullets are justified, with the final line left-aligned and normal word spacing. Hanging markers and a consistent small inset align wrapped lines. Exact source emphasis uses the same renderer as web; background and implementation details generally stay normal weight.
- Avoid orphaned headings, split role/date pairs, clipping and blank pages. Keep actual paper/profile links clickable, selectable text intact, and page numbering consistent.

## Typography and preview

Print uses Source Serif 4 for Latin text (400/600) and Source Han Serif KR (본명조) for Korean (400/600). Current general-profile body sizes are Korean 10pt with 1.3 leading and English 9pt with 1.25 leading; do not reduce them further without an owner-approved change. These are current project choices, not universal resume typography rules. Executable page margins/type settings live in [print.css](../src/styles/print.css); update this guide and checks together if the accepted specification changes.

Self-host pinned Fontsource Latin fonts and the vendored official Adobe Source Han Serif KR fonts with OFL notices. Korean uses the same compact education-row arrangement as English. Generate the Korean subset from public YAML, preserve licensing/name records, load actual print faces before export and verify embedding/selection. Print faces must not change website typography or add profile-page screen font requests.

`/ko/resume/` and `/en/resume/` preview the same print stylesheet on a centered white paper surface with an aligned toolbar. Small-screen previews reflow; PDF output stays A4. A screen preview alone does not establish PDF pagination or final font rendering.

## Verification

Use [PDF validation](../scripts/validate-pdf.mjs), [print browser tests](../tests/print.spec.mjs) and visual review of both final PDFs. Compare each selected achievement's exact YAML prose/emphasis with print HTML and extracted PDF text; extraction normalization is not permission to rewrite source. Check actual rendered fonts, black computed text, justification, the right date edge, all selected IDs, content hash/profile, links, page count and clipping. Keep the final body-text baseline at least 3mm above the bottom page-margin boundary; the validator checks this pagination reserve. Local macOS success alone is insufficient: the Ubuntu deployment check must also pass, since font metrics and line breaking can differ across platforms. Preserve the source prose and approved font sizes when adjusting spacing for this reserve.

Store before/after PDFs, raster previews and local comparison pages under ignored `sources/reviews/` or `sources/previews/`, never in public source control or public site routes. Record final observations rather than treating a passing exporter as visual approval.
