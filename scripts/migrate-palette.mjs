// One-shot migration for issue #149: rewrites the old sage/warm/pink identity classes
// to the `brand.*` design tokens (#137). Kept in the repo history for auditability;
// safe to delete once the migration has landed.
//
//   node scripts/migrate-palette.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

// Ordered: the `hover:` variants must run before their bare counterparts so a hover
// state keeps a distinct colour instead of collapsing onto the base one.
const RULES = [
  // Dark surfaces: hero, dark sections, primary buttons, selected toggles.
  ['hover:bg-sage-700', 'hover:bg-brand-wine'],
  ['bg-sage-700', 'bg-brand-ink'],
  ['bg-sage-600', 'bg-brand-ink'],
  ['border-sage-600', 'border-brand-ink'],

  // Light surfaces.
  ['bg-sage-50', 'bg-brand-sand'],
  ['bg-warm-50', 'bg-brand-cream'],
  ['bg-warm-100', 'bg-brand-sand'],
  ['bg-warm-200', 'bg-brand-sand'],

  // Accent / primary call to action.
  ['hover:bg-warm-600', 'hover:bg-brand-wine'],
  ['bg-warm-600', 'bg-brand-wine'],
  ['bg-warm-500', 'bg-brand-red'],
  ['text-warm-500', 'text-brand-red'],
  ['bg-pink-600', 'bg-brand-red'],

  // Text.
  ['text-sage-700', 'text-brand-ink'],
  ['text-sage-600', 'text-brand-ink'],
  ['text-sage-500', 'text-brand-red'], // the ✓ bullets in the pricing lists

  // Borders and focus rings.
  ['hover:border-sage-300', 'hover:border-brand-grey'],
  ['hover:border-sage-400', 'hover:border-brand-grey'],
  ['border-sage-200', 'border-brand-sand'],
  ['border-sage-300', 'border-brand-grey'],
  ['border-sage-400', 'border-brand-grey'],
  ['border-warm-100', 'border-brand-sand'],
  ['border-warm-200', 'border-brand-sand'],
  ['ring-sage-400', 'ring-brand-red'],

  // Base page colours (set as front matter in content/_index.*.md).
  ['bg-warm-50 text-gray-800', 'bg-brand-cream text-brand-ink'],
  // Runs after the rule above has already rewritten the background half of the pair.
  ['bg-brand-cream text-gray-800', 'bg-brand-cream text-brand-ink'],

  // Secondary/muted text. The cool greys clash with the warm brand palette, and
  // gray-400 only reached 2.5:1 against the cream background (WCAG AA wants 4.5:1).
  // Tinted brand ink keeps the hierarchy and measures ~6:1.
  ['text-gray-400', 'text-brand-ink/70'],
  ['text-gray-500', 'text-brand-ink/70'],

  // Muted text on the dark footer. Brand ink is a touch lighter than the near-black
  // it replaced, so these very transparent whites dropped below AA (the /20 link sat
  // at 1.8:1). Warm cream at a higher opacity keeps them subdued but readable.
  ['text-white/20 hover:text-white/40', 'text-brand-cream/60 hover:text-brand-cream/80'],
  ['text-white/40', 'text-brand-cream/70'],
  ['text-white/60', 'text-brand-cream/80'],
];

const FILES = [
  'layouts/index.html',
  'layouts/facturen/list.html',
  'layouts/account/list.html',
  'layouts/partials/lang-switcher.html',
  'content/_index.en.md',
  'content/_index.nl.md',
  'content/_index.pt.md',
];

let total = 0;
for (const rel of FILES) {
  const file = path.join(REPO, rel);
  let text = fs.readFileSync(file, 'utf8');
  let changed = 0;
  for (const [from, to] of RULES) {
    // Guard the left edge so `bg-sage-50` never matches inside `bg-sage-500`, and the
    // right edge so a rule can't rewrite a longer class that merely starts the same.
    const re = new RegExp(`(?<![\\w-])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g');
    const hits = text.match(re);
    if (!hits) continue;
    text = text.replace(re, to);
    changed += hits.length;
  }
  if (changed && !DRY) fs.writeFileSync(file, text, 'utf8');
  console.log(`${String(changed).padStart(4)}  ${rel}`);
  total += changed;
}
console.log(`\n${DRY ? '[dry run] ' : ''}${total} class replacements`);
