# Translation guide

`content/resume.yaml` stores `ko` and `en` together. Shared dates, URLs and facts have one value. Use placeholders for quantities whose language formatting differs, and `src/lib/format.mjs` for rendering. Never convert KRW to another currency without a verified source and explicit request.

| Korean                                 | English                                                              | Meaning                                                         |
| -------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 거래액 중복 집계 수정                  | correction to reported transaction volume                            | Not cash recovered or duplicate customer billing                |
| 주문·결제·카드 리딩·VAN 통신·적립 세션 | order, payment, card-reading, VAN communication and loyalty sessions | Different session types, not eight payment stages               |
| 전환율 50%p 상승                       | conversion increased by 50 percentage points                         | Not 50% relative growth                                         |
| 석사과정 수료                          | master’s coursework completed                                        | Not a master’s degree awarded or expected                       |
| 음식 메뉴 분류                         | food-item classification                                             | Restaurant, café and bakery offerings; not app navigation menus |
| 경남과학고등학교                       | Gyeongnam Science High School                                        | Early graduation, Mar 2011 - Feb 2013                           |

Dates are `YYYY-MM` in data and rendered for each locale. Keep URLs identical. Preserve model names, institutions, role scope, measured vs. planned status and classifier-dependent accuracy ranges. Do not translate inline with browser APIs.

When editing a pair, set `translationReviewed: false` while the counterpart is stale, then review and restore `true`. Validation rejects stale achievement translations. This is an editorial declaration, not proof that machine translation is accurate.

Official publication titles and venue names keep their verified full original form, even when a Korean topic explanation is provided separately. Shared official metadata/URLs should not drift between output languages. Do not replace a full venue name with its acronym in one language to save space. Domain abbreviations such as POS/VAN may remain where natural; avoid unnecessary parenthetical definitions. Naming and vocabulary principles are owned by the [content guide](content-guide.md#official-names-and-domain-vocabulary).
