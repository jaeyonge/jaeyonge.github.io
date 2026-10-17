# Logo and public-asset guide

## Directory contract

| Location                      | Purpose                                                      | Shipped?     |
| ----------------------------- | ------------------------------------------------------------ | ------------ |
| `sources/logos/originals/`    | Original downloads and source-page references                | No; ignored  |
| `sources/logos/manifest.json` | Private acquisition and review record                        | No           |
| `public/assets/logos/`        | Selected self-contained public assets                        | Yes; tracked |
| `content/logos.json`          | Organization ID → light/dark paths, dimensions, presentation | Yes          |
| `docs/logo-sources.md`        | Public provenance and transformation notes                   | Yes          |

The app imports the registry and uses `/assets/logos/...` URLs. A file in `sources/` does not exist on GitHub Pages. A successful local preview is insufficient if the browser read a private file. **Never use a `/Users/...`, `file://`, `sources/...`, remote hotlink or runtime fetch as a logo path.**

`pnpm build` must work in a clean checkout with no `sources/`. Prepared derivatives are committed. `node scripts/prepare-logos.mjs` is an explicit local preparation task requiring the original downloads; it is never part of a build or deploy script.

## Preparation and visual rules

1. Prefer an official transparent asset or official light/dark variant. Keep its proportions and color. Preserve source links and actual transformation notes.
2. Logos are identities, not illustrations: reject generated edits that redraw letters, ring shapes or details. Current school assets preserve the official raster inside self-contained SVG masks/clips; the visible source artwork is unchanged.
3. Gyeongnam Science High School uses a circular/elliptical clip around the official round emblem, hiding rectangular canvas corners. Seoul High School uses its crest from the original header logo with a mask for border-connected white background; enclosed white crest details remain. The full transparent wordmark variant is also available.
4. SNU’s navy crest sits on a white circular backing in every theme. Do not invert it or rely on dark-on-dark contrast. The backing is intentional; square source-canvas corners are not.
5. Toss Place and Sejong Science High School have official light/dark variants. `Logo.astro` respects both OS preference and manually selected theme. Print uses light presentation.
6. Set intrinsic image dimensions, use `object-fit: contain`, avoid stretching and cropping words, and keep a meaningful text institution name next to the decorative logo. A logo is not the sole identifier. Below-fold images may load lazily.
7. Do not upscale low-resolution raster originals to manufacture detail. SVG wrappers do not make embedded rasters higher resolution. Check the logo at its actual display size.

## Required checks

- `pnpm assets:check`: each registered public path exists and decodes; relevant school-canvas corners are transparent.
- `pnpm test:e2e`: no broken images or image HTTP errors on both language routes; screenshots and actual dimensions in light/dark/mobile; SNU backing remains white.
- `pnpm build`: copies all public assets into `dist/`; `validate-dist` rejects private paths and remote image dependencies.
- Inspect a fresh checkout build without `sources/`. Check both default OS theme and manual overrides, and confirm the printed resume remains readable. The print layout currently omits decorative institution logos to keep the PDF text-focused.
- If a public asset is missing, treat it as a release failure. Do not hide the failure behind a silent blank image. Institution names remain readable even if image loading fails.

Official-source availability is not a grant of rights. Keep explicit source use conditions in provenance notes. The SNU UI guide asks alumni/external users to obtain permission for use; the current local preview does not establish such permission.
