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
2. Logos are identities, not illustrations: reject generated edits that redraw letters, ring shapes or details. School assets preserve the official raster inside self-contained clips or a PNG alpha channel; the visible source artwork is unchanged.
3. Gyeongnam Science High School uses a circular/elliptical clip around the official round emblem, hiding rectangular canvas corners. Seoul High School uses a PNG crest cropped from the original header, with only border-connected white pixels made transparent. Enclosed white crest details remain. Bake transparency into the raster rather than adjacent SVG mask rows, which can leave visible seams at fractional display sizes.
4. SNU’s navy crest sits on a white circular backing in every theme. Do not invert it or rely on dark-on-dark contrast. The backing is intentional; square source-canvas corners are not.
5. Toss Place has distinct official light/dark wordmarks. The selected Sejong crest is identical in both themes; do not duplicate identical assets. `Logo.astro` uses one image for a shared asset, or two CSS-switched eager images for different variants. OS preference is the fallback; an explicit theme always wins, including system changes with JavaScript disabled. Both variants load before toggling so a hidden lazy image cannot leave a blank logo. Print omits decorative logos.
6. Set intrinsic image dimensions, use `object-fit: contain`, avoid stretching and cropping words, and keep a meaningful text institution name next to the decorative logo. A logo is not the sole identifier. These eight small institution marks load eagerly to avoid a blank on scroll or theme change. Keep the entire unique logo set under 140 KB, with raster derivatives no larger than 512px; larger originals remain in ignored sources. The current Toss/SNU derivatives are sized to at most 4× the web presentation.
7. Do not upscale low-resolution raster originals to manufacture detail. SVG wrappers do not make embedded rasters higher resolution. Check the logo at its actual display size.

## Required checks

- `pnpm assets:check`: each registered public path exists and decodes; relevant school-canvas corners are transparent.
- `pnpm test:e2e`: no broken images or image HTTP errors on both language routes; screenshots and actual dimensions in light/dark/mobile; SNU backing remains white.
- `pnpm build`: copies all public assets into `dist/`; `validate-dist` rejects private paths and remote image dependencies.
- Inspect a fresh checkout build without `sources/`. Check both default OS theme and manual overrides, and confirm the printed resume remains readable. The print layout currently omits decorative institution logos to keep the PDF text-focused.
- If a public asset is missing, treat it as a release failure. Do not hide the failure behind a silent blank image. Institution names remain readable even if image loading fails.

Official-source availability is not a grant of rights. Keep explicit source use conditions in provenance notes. The SNU UI guide asks alumni/external users to obtain permission for use; the current local preview does not establish such permission.

## Share-card assets

The selected portrait lives in tracked `public/assets/images/`. Share cards are generated build outputs, not new source images: `scripts/generate-social.mjs` renders Korean/English 1200×630 PNGs into `dist/assets/social/` using that portrait, YAML identity/tagline, self-hosted fonts and shared design tokens. It needs no `sources/` files. Do not manually edit generated cards or commit `dist/`.

`src/lib/social.mjs` versions image URLs using the content and rendering inputs so a changed portrait, copy or design gets a new image URL. Static Open Graph and Twitter metadata must use absolute HTTPS URLs. `/ko/` selects Korean, `/en/` selects English, and `/` exposes an English card without JavaScript. Share crawlers cannot rely on client-side language detection. Verify actual image decoding/dimensions and inspect both cards at full and small preview sizes. Existing shares may retain a platform-cached preview even after a successful deployment.

Owner choice: use the official Doeat color artwork from its careers-site PNG in both themes, without a backing, filter or inversion. The local preparation removes the white source canvas/negative space, unmattes antialiased edges and downsamples a transparent derivative. Preserve the original orange and dark lettering; do not restore the previous white SVG or theme-specific mats.
