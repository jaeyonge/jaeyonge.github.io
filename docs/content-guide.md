# Content guide

Use concrete, active sentences. Explain the business or research problem, personal action and supported result. Preserve payments and delivery O2O vocabulary: log data, funnel, VAN, POS, data mart, unit delivery cost and session integrity. Do not add unnecessary definitions such as “app usage records (logs).” A cross-industry reader should understand why the work matters from the context.

Describe problem solving as a repeatable system: define scope, separate error types, inspect code/queries/raw records, verify, correct, establish standards, automate and extend. Avoid abstract praise such as “outstanding analytical literacy.” Business insight should lead to a decision or proposed action. Do not invent financial savings or causal evidence.

The general profile selects three achievements for each company, and three bullets per research item. Preserve the user’s section order. Longer source catalogs support role-specific selection without rewriting facts. Keep teaching experience concise. No skills section.

Write Korean naturally in professional resume form. Prefer verbs to strings of abstract nouns, remove translation-like phrasing, avoid inflated impact, preserve industry terms and factual details. A prose pass must not change numbers or claims. English bullets use action verbs and keep individual vs. team scope explicit.

Use confirmed figures with their denominator/baseline when available. The public duplicate-record correction is described as exceeding 1% of annual transaction volume, not actual duplicate customer charges. The exact currency amount is private. Omit session recalculation scope and execution-cost comparisons from the public resume at the owner’s request. The 25 checks include multiple error types and are not all automated. Preserve uncertainty in evidence notes; do not fill missing metrics with estimates.

Research bullets should cover the question/data, personal method or infrastructure, and validation/reproducibility/results. Do not attribute the entire paper’s model, benchmark or improvement to one contributor. Preserve DOI links. Do not convert coursework completion into an awarded master’s degree.

See `docs/research/resume-writing-guide.md` for the public English writing sources and `docs/editorial-decisions.md` for owner-specific choices.

Section introductions must identify actual subject matter or personal contributions. Avoid universal statements such as “turn questions into experiments” or “verify results,” which distinguish neither this person nor this work. A visual label must add a concrete scanning cue, not restate a section heading. Featured work links reuse achievement IDs and lead to the full evidence; qualify duplicate records and research contribution scope in summaries as carefully as in the main text.

Use [emphasis-guide.md](emphasis-guide.md) when selecting bold phrases. Emphasize concrete contributions, delivered systems/artifacts and qualified outcomes, with enough object/action context to communicate the main message. Do not stop at a preparatory action (e.g. session criteria) when automated daily checking is the central delivered result. Bold-only scanning must preserve attribution and qualification; bilingual emphasis must direct attention to equivalent contributions.

Employment role names, role-specific periods and multiple positions are structured facts in YAML. Preserve confirmed role wording such as `Data Analyst Intern` rather than inventing a variant. Their current web grouping is owned by the [layout plan](layout-plan.md#경력과-학교-근무); print grouping is owned by the [print guide](print-guide.md). Do not duplicate layout dimensions in the writing rules.

## Official names and domain vocabulary

Use the full original published paper title and the verified official full journal/conference name in research metadata. Keep a public source link in evidence/provenance for a naming correction; an acronym such as CIKM does not replace the full conference name. Do not shorten official names simply to fit a narrow header or one-page PDF. A secondary topic description may explain the research without replacing its title.

This rule does not require expanding every domain abbreviation. Preserve appropriate payments/delivery vocabulary such as POS, VAN, log data, funnel, data mart and unit delivery cost. Write for readers across backgrounds by explaining the problem, contribution and consequence, rather than appending obvious parenthetical definitions to familiar terms. Apply [translation rules](translation-guide.md) to preserve official names, role scope and equivalent meaning across languages.

## One source, multiple outputs

Every achievement has one bilingual `text` and one set of facts/emphasis in YAML. Website, HTML preview, PDF and exports must render those exact sentences. Do not create print-only summaries, alternate prose fields or hardcoded shorter descriptions to fit a page. Output differences are selection (`outputs.pdf`) and presentation only. If text cannot fit readably, revise layout or ask the owner to change selection/shared source; do not silently rewrite it. Regression checks compare rendered PDF-source bullets with authoritative YAML.

The one-source rule is a release criterion, not only an authoring preference. Review selected IDs, exact sentences and emphasis in each output; see [evaluation](evaluation-rubric.md). Examples in plans/guides illustrate a principle and never become a second source of resume prose.
