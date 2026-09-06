// Downloads the self-hosted brand webfonts (woff2, latin + latin-ext) from Google Fonts
// into static/fonts/, and writes a @font-face snippet to stdout.
//
//   node scripts/fetch-fonts.mjs
//
// Run this only when the brand fonts change; the resulting .woff2 files are committed.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(REPO_ROOT, 'static', 'fonts');

// A modern browser UA is required, otherwise the API serves legacy ttf/woff.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FAMILIES = [
  { css: 'Anton', file: 'anton' },
  { css: 'Nunito:wght@400..800', file: 'nunito' },
];

const WANTED_SUBSETS = new Set(['latin', 'latin-ext']);

async function fetchCss(family) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Failed to fetch CSS for ${family}: ${res.status}`);
  return res.text();
}

// The Google CSS is a series of `/* subset */ @font-face { ... }` blocks.
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  for (const [, subset, body] of css.matchAll(re)) {
    const url = body.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;
    faces.push({
      subset,
      url,
      weight: body.match(/font-weight:\s*([^;]+);/)?.[1].trim() ?? '400',
      style: body.match(/font-style:\s*([^;]+);/)?.[1].trim() ?? 'normal',
      unicodeRange: body.match(/unicode-range:\s*([^;]+);/)?.[1].trim() ?? '',
    });
  }
  return faces;
}

await fs.mkdir(OUT_DIR, { recursive: true });
const snippets = [];

for (const { css, file } of FAMILIES) {
  const faces = parseFaces(await fetchCss(css)).filter((f) => WANTED_SUBSETS.has(f.subset));
  if (!faces.length) throw new Error(`No latin/latin-ext faces found for ${css}`);

  for (const face of faces) {
    const name = `${file}-${face.subset}.woff2`;
    const res = await fetch(face.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Failed to download ${face.url}: ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(path.join(OUT_DIR, name), bytes);
    console.error(`Saved static/fonts/${name} (${(bytes.length / 1024).toFixed(1)} KB)`);

    snippets.push(
      [
        '@font-face {',
        `  font-family: '${css.split(':')[0]}';`,
        `  font-style: ${face.style};`,
        `  font-weight: ${face.weight};`,
        '  font-display: swap;',
        `  src: url('/fonts/${name}') format('woff2');`,
        `  unicode-range: ${face.unicodeRange};`,
        '}',
      ].join('\n'),
    );
  }
}

console.log(snippets.join('\n\n'));
