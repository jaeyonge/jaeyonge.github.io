# Formal download resume

The website and downloadable PDF share authoritative YAML, selected achievements and emphasis rules, but use separate layouts.

- PDF text and links use black only, on white. No portrait, logo artwork, decorative numbering or colored accents. Use font size, semibold weight, proximity, alignment and sparse black section rules for hierarchy.
- A4, compact line spacing; current Korean body9.5pt and English body9pt. Do not shrink further or hide selected achievements to force fit. Keep three company/research bullets and all mandatory education.
- Company heading first, then each role and its period on the same row, role left and period at the common right edge, latest first. Avoid duplicate overall employment dates/phase metadata. Service tagline is omitted from print to avoid a third metadata layer; source and career prose retain the context.
- Exact bilingual emphasis phrases use the same shared renderer as web. Implementation/background remains normal weight.
- Contact and profile links form a compact header; retain clickable paper/profile links in black. Hanging bullet markers and a small consistent inset align wrapped lines within each achievement.
- General profile: concise, single A4 page in both languages. Header, experience, research, and education form a unified hierarchy without arbitrarily rewriting or summarizing career prose. Introduction, teaching, research topics, and awards/languages are excluded from PDF per outputs configuration. Page count in footer supports reading/printing.
- Preserve print grouping, avoid orphaned headers and isolated fragments. Inspect the page in both languages after regeneration, verify selectable text, links, black computed text, content hash and no clipping.
- Keep before/after PDFs and raster previews in ignored sources/reviews or sources/previews, never in public source control. Comparison pages are local review tools, not site routes.

- Body achievement bullets use justified alignment with the final line left-aligned in both languages. Preserve normal word spacing on final lines.
- Every date/year, including research publication year, aligns to the same right edge. Research venue/role/paper link stay left.

- Print typefaces: Source Serif 4 for Latin text (regular 400 / semibold 600), Nanum Gothic for Korean (regular 400 / bold 700). Self-host pinned Fontsource packages with OFL notices. Build the Korean Nanum Gothic subset from public YAML alongside the web sans subset; preserve font licensing/name records. Print-only font faces must not change web rendering or add screen font requests. Verify actual rendered fonts and embedded/selectable PDF text after export.

- `/ko/resume/` and `/en/resume/` are screen previews of the same print stylesheet, on a centered white paper surface with an aligned toolbar. Profile pages retain their independent modern web typography and layout. Small-screen previews reflow; PDF output remains A4.
- One source, multiple outputs: never add print-only prose. Only section/item selection and layout may differ. See content-guide.md.
