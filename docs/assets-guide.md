# Logo and public-asset guide

This guide owns preparation, delivery and verification rules. Current brand preferences live in [editorial decisions](editorial-decisions.md), actual theme paths/presentation in [logos.json](../content/logos.json), and acquisition/transformation evidence in [logo sources](logo-sources.md). Do not infer one global treatment for every institution.

## Directory contract

| Location                      | Purpose                                                   | Shipped?     |
| ----------------------------- | --------------------------------------------------------- | ------------ |
| `sources/logos/originals/`    | Original downloads and source-page references             | No; ignored  |
| `sources/logos/manifest.json` | Private acquisition/review record                         | No           |
| `public/assets/logos/`        | Reviewed, self-contained website derivatives              | Yes; tracked |
| `content/logos.json`          | Organization → light/dark paths, dimensions, presentation | Yes          |
| `docs/logo-sources.md`        | Public-safe provenance and actual transformations         | Yes          |

Browser paths must be `/assets/logos/...`, never `sources/`, `/Users/...`, `file://` or remote hotlinks/runtime fetches. A local preview finding a private file does not establish deployability. `pnpm build` must work without `sources/` and must not prepare derivatives or copy the source folder. `node scripts/prepare-logos.mjs` is a local-only command requiring originals; commit only reviewed derivatives/registry changes.

## Preserve originals; optimize publishable derivatives

- Prefer official transparent artwork or official theme variants. Preserve colors, lettering, shapes, proportions and the original download. AI redrawing is not a substitute for an institutional mark.
- Remove accidental canvas/background artifacts only when justified for that asset. Distinguish exterior canvas, intentional brand backing and enclosed artwork/negative space. Do not blanket-remove white pixels or invert all logos because a different asset needed that treatment. SNU's intentional backing and Doeat's background-free color preference are distinct owner decisions.
- Use deterministic crops, clips or alpha preparation, with transformation notes and inspection at actual display size. Adjacent raster-sized SVG mask rows can introduce antialiasing seams; bake an appropriate raster alpha mask when needed. A wrapper SVG does not increase raster detail. Do not upscale low-resolution originals to manufacture sharpness.
- Keep oversized originals private. Resize the reviewed web derivative for its actual display/density needs. Enforce total unique-logo byte and dimension budgets in [validate-assets.mjs](../scripts/validate-assets.mjs), not independently copied limits in multiple guides. A smaller byte total is evidence of asset savings, not a guaranteed real-network latency improvement.
- Supply intrinsic dimensions and `object-fit: contain`. Keep real institution names next to decorative marks, so logos are not the only identifiers. Never enlarge/crop a wordmark merely to fill an arbitrary slot.

## Theme and loading contract

A shared light/dark asset renders once. Different official variants render only the required pair; avoid a third duplicate image for automatic theme mode. OS theme is the fallback and explicit manual choice wins, per the [control contract](design-guide.md#controls-are-behavior-as-well-as-appearance). Returning to system must restore OS-driven behavior.

The current small institution-logo set loads eagerly, including a hidden theme variant when present. Do not expose an unloaded lazy image on a ready page when the theme changes or the reader scrolls. This exception for a small optimized set is not a blanket rule to eagerly load every future image. Consider total request/decode cost before extending it.

Test these states separately: cold initial light/dark OS preference, manual choice opposite the OS, return to system, OS changes while using system, cached reload and failed requests. After initial logo readiness, toggling must not need another logo download. Check actual visible variant, exactly one visible image per institution, successful decode, transparency/backing and paint—not just HTTP success, a `src` string or a file's existence.

## Required checks

- `pnpm assets:check`: public paths exist, decode and meet budgets; intended canvas corners are transparent.
- `pnpm test:e2e`: real image requests, ready visible variants after theme changes, no broken image/HTTP errors, bilingual/theme/device presentation and no-JS OS fallback. Current regression coverage is in [logo tests](../tests/logos.spec.mjs).
- `pnpm build`: public assets appear in `dist/`; dist validation rejects private paths and remote-logo dependencies. For new derivatives, inspect a clean build without private sources.
- Visually inspect actual display sizes in light/dark and print behavior. The current print layout omits decorative logos; do not restore them to fix a website asset problem.
- A missing asset is a release failure, not a reason to silently hide it. Institution names must remain readable if loading fails. Do not fabricate a substitute mark or claim failure-path coverage without testing it.

Official-source availability is not a grant of rights. Keep explicit use conditions in provenance. SNU's UI guide describes an alumni/external-user permission process; download or local preview does not establish permission.

## Share-card assets

The selected portrait is tracked in `public/assets/images/`. `scripts/generate-social.mjs` builds Korean/English 1200×630 PNGs into `dist/assets/social/` from that portrait, YAML identity/tagline, self-hosted fonts and shared tokens. These are generated outputs, not manually edited source images; no `sources/` dependency.

`src/lib/social.mjs` versions image URLs from content/rendering inputs. Open Graph/Twitter metadata uses absolute HTTPS URLs. `/ko/` and `/en/` expose their own localized card; `/` exposes English metadata without JS. Crawlers cannot depend on client-side routing. Check decoding, dimensions and full/small previews. Existing external shares may retain platform-cached images after deployment.
