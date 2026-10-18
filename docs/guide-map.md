# Guide ownership and maintenance

This map tells future collaborators where to read and update a rule. It is not a second copy of every rule. Start with [AGENTS.md](../AGENTS.md), the current [owner decisions](editorial-decisions.md), and the [update workflow](update-workflow.md).

## One home per kind of information

| Kind                                                | Authoritative home                                                                                                       | What belongs there                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Career copy, facts and output selection             | [resume.yaml](../content/resume.yaml), [evidence.yaml](../content/evidence.yaml)                                         | Bilingual prose, shared facts, selected IDs, public-safe qualifications; no PDF-only prose                                   |
| Writing principles                                  | [content guide](content-guide.md)                                                                                        | Clarity, contribution scope, exact source reuse and official naming                                                          |
| Emphasis and translation                            | [emphasis guide](emphasis-guide.md), [translation guide](translation-guide.md)                                           | Complete meaning units, restrained bold, language equivalence and domain terms                                               |
| General design principles and interaction contracts | [design guide](design-guide.md), [responsive guide](responsive-guide.md)                                                 | Alignment, proximity, functional spacing, controls, reflow and loading states                                                |
| Current owner-approved choices and exceptions       | [editorial decisions](editorial-decisions.md)                                                                            | This profile's section order, sensitive facts, institutional identity and logo preferences                                   |
| Current web composition                             | [layout plan](layout-plan.md)                                                                                            | Current arrangement and reading order; not a record of competing obsolete wireframes                                         |
| Print composition                                   | [print guide](print-guide.md)                                                                                            | Current general-profile selection/pagination/typography and print-specific alignment                                         |
| Asset handling and provenance                       | [assets guide](assets-guide.md), [logo sources](logo-sources.md)                                                         | Preparation/loading rules vs. organization-specific source/transformation records                                            |
| Implementation values                               | [tokens](../design/tokens.css), [print CSS](../src/styles/print.css), [logo registry](../content/logos.json), validators | Actual dimensions/colors, print sizing, asset paths, enforceable budgets; change with their owning guide when policy changes |
| Acceptance criteria                                 | [evaluation rubric](evaluation-rubric.md), [tests](../tests/)                                                            | Observable evidence of compliance; link to the owning rule rather than restating its entire specification                    |
| Observations and task evidence                      | Ignored `sources/reviews/<task-id>.md`                                                                                   | Defect → location/evidence → reader impact → fix → recheck, screenshots and limits; never public raw notes                   |

## How to change a rule

1. Identify whether feedback changes a general principle, a current choice, an implementation value or only a defect. Do not promote every CSS tweak into a universal rule.
2. Update the owning document. Replace superseded guidance in place; do not leave an old diagram followed by a contradictory correction at the bottom.
3. Update affected examples, acceptance criteria, entry-point links and implementation/tests when those are in the authorized scope. Keep shared statements as links to their owner.
4. Check both outputs and languages affected by the rule. A web-only alignment rule is not automatically a PDF rule; a general-profile page limit is not a universal limit for every future profile.
5. Record why the change was made and what was actually verified under ignored reviews. Use Git history for superseded public guidance instead of retaining multiple active versions.

Current user instructions override older snapshots. Confirmed owner decisions constrain design references and historical plans. Code records current behavior, not proof of editorial approval: if it conflicts with the decision/guide, identify and reconcile the conflict within the authorized task rather than silently declaring either correct. Upstream design material is a reference, not permission to override local choices.

A numeric setting in a guide is a description of the current project, not a universal design law. Keep executable values in the relevant tokens/configuration/styles/validators. If a budget, page target or minimum type size changes, update its owning guide and acceptance check together.
