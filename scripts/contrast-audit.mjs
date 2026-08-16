// WCAG AA contrast audit over the built site. Run against a locally served ./site:
//
//   node scripts/contrast-audit.mjs http://127.0.0.1:8913
//
// Text drawn over a photo is reported separately rather than skipped: an earlier
// version excluded anything with a drop-shadow as "caption over an image", which
// hid a genuinely unreadable dark-on-dark paragraph in the About carousel.
import { chromium } from '@playwright/test';

const BASE = process.argv[2] || 'http://127.0.0.1:8913';
const PAGES = ['/en/', '/nl/', '/pt/', '/en/account/', '/en/facturen/'];

const collect = () => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const over = (fg, bg) => { const a = fg[3] === undefined ? 1 : fg[3]; return [0, 1, 2].map((i) => a * fg[i] + (1 - a) * bg[i]); };

  // Walk up for the nearest opaque background, noting whether an image or a
  // gradient sits behind the text — those can't be reduced to a single colour.
  // Overlay captions are absolutely positioned, so the photo and its gradient are
  // SIBLINGS rather than ancestors; check those too, or such text looks like it
  // sits on the page background.
  function backdrop(el) {
    let n = el, image = false;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') image = true;
      if (n.tagName === 'IMG') image = true;

      if (cs.position === 'absolute' || cs.position === 'fixed') {
        for (const sib of n.parentElement?.children ?? []) {
          if (sib === n) continue;
          if (sib.tagName === 'IMG') image = true;
          const sc = getComputedStyle(sib);
          if (sc.backgroundImage && sc.backgroundImage !== 'none') image = true;
        }
      }

      const c = parse(cs.backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return { colour: c.slice(0, 3), image };
      n = n.parentElement;
    }
    return { colour: [255, 255, 255], image };
  }

  const rows = [];
  for (const el of document.querySelectorAll('p,h1,h2,h3,h4,h5,span,a,li,label,button,div,td,th,strong,em,small')) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (text.length < 3 || !/[a-zA-Z0-9À-ÿ]/.test(text)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) continue;

    const { colour: bg, image } = backdrop(el);
    const fg = over(parse(cs.color), bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const min = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
    if (ratio >= min) continue;
    rows.push({ text: text.slice(0, 45), ratio: +ratio.toFixed(2), min, colour: cs.color, overImage: image, cls: el.className.toString().slice(0, 50) });
  }
  return rows;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let solid = 0, overImage = 0;

for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const rows = await page.evaluate(collect);
  const unique = [...new Map(rows.map((r) => [r.cls + r.colour + r.ratio, r])).values()];
  const flat = unique.filter((r) => !r.overImage);
  const photo = unique.filter((r) => r.overImage);
  solid += flat.length;
  overImage += photo.length;

  console.log(`\n=== ${path} ===`);
  if (!unique.length) console.log('  no contrast failures');
  for (const r of flat) console.log(`  FAIL  ${r.ratio}:1 (needs ${r.min}) ${r.colour}  "${r.text}"`);
  // Not automatically failures: the real backdrop is a photo/gradient, so the
  // computed ratio is only an approximation. Still worth eyeballing.
  for (const r of photo) console.log(`  over image  ~${r.ratio}:1 ${r.colour}  "${r.text}"  [${r.cls}]`);
}

await browser.close();
console.log(`\n${solid} failure(s) on solid backgrounds, ${overImage} to check by eye over images.`);
process.exit(solid ? 1 : 0);
