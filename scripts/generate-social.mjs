import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { data } from '../src/lib/content.mjs';
import { socialImagePath, socialSize } from '../src/lib/social.mjs';
import { staticServer } from './static-server.mjs';

// Render from the built site's committed portrait, self-hosted fonts and shared tokens.
// No private sources, remote images or machine-specific fonts are required.
const server = await staticServer();
let browser;
try {
  await mkdir('dist/assets/social', { recursive: true });
  browser = await chromium.launch();
  for (const lang of ['ko', 'en']) {
    const page = await browser.newPage({ viewport: socialSize, deviceScaleFactor: 1 });
    await page.goto(`${server.url}/${lang}/`, { waitUntil: 'networkidle' });
    const name =
      lang === 'ko' ? `${data.profile.name.ko} · ${data.profile.name.en}` : data.profile.name.en;
    const tagline =
      lang === 'ko'
        ? data.hero.eyebrow.ko.replace(', ', ',\n')
        : data.hero.eyebrow.en
            .toLowerCase()
            .replace(/(^|\.\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
            .replace('. ', '.\n');
    await page.evaluate(
      ({ name, role, tagline, portrait }) => {
        document.documentElement.dataset.theme = 'dark';
        document.body.replaceChildren();
        const card = document.createElement('main');
        card.className = 'social-card';
        const copy = document.createElement('div');
        copy.className = 'social-copy';
        for (const [tag, cls, text] of [
          ['h1', 'social-name', name],
          ['p', 'social-role', role],
          ['p', 'social-tagline', tagline],
          [
            'p',
            'social-domain',
            new URL(document.querySelector('meta[property="og:url"]').content).host,
          ],
        ]) {
          const el = document.createElement(tag);
          el.className = cls;
          el.textContent = text;
          copy.append(el);
        }
        const image = document.createElement('img');
        Object.assign(image, {
          src: portrait.src,
          width: portrait.width,
          height: portrait.height,
          alt: portrait.alt,
        });
        card.append(copy, image);
        document.body.append(card);
      },
      {
        name,
        role: data.profile.role[lang],
        tagline,
        portrait: { ...data.profile.portrait, alt: data.profile.portrait.alt[lang] },
      },
    );
    await page.addStyleTag({
      content: `
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
      .social-card { width: 1200px; height: 630px; padding: 64px; display: grid;
        grid-template-columns: minmax(0, 1fr) 336px; gap: 56px; background: var(--bg); color: var(--fg); }
      .social-copy { min-width: 0; display: flex; flex-direction: column; justify-content: center; }
      .social-name { font: 600 56px/1.25 var(--font-text); letter-spacing: -0.04em; white-space: nowrap; text-wrap: nowrap; }
      .social-role { margin-top: 18px; color: var(--muted); font-size: 23px; }
      .social-tagline { margin-top: 64px; font-size: 46px; font-weight: 600; line-height: 1.45;
        letter-spacing: -0.035em; white-space: pre-line; word-break: keep-all; }
      .social-domain { margin-top: 44px; font-size: 21px; color: var(--muted); }
      .social-card > img { width: 336px; height: 502px; object-fit: cover; object-position: 50% 18%; border-radius: var(--portrait-radius); }
    `,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await document.querySelector('.social-card img').decode();
    });
    const overflow = await page
      .locator('.social-copy > *')
      .evaluateAll((nodes) => nodes.some((n) => n.scrollWidth > n.clientWidth));
    if (overflow) throw new Error(`Social card text overflows (${lang})`);
    const path = `dist${socialImagePath(lang)}`;
    await page.screenshot({ path });
    console.log(`Social card (${lang}): ${path}, ${socialSize.width}×${socialSize.height}`);
    await page.close();
  }
} finally {
  await browser?.close();
  await server.close();
}
