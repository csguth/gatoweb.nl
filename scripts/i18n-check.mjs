// Validates both halves of the site's i18n setup:
//
//   1. Compile-time strings — every `{{ i18n "key" }}` used in layouts/ must exist in
//      i18n/en.toml, i18n/nl.toml and i18n/pt.toml. Hugo renders a missing key as an
//      empty string, so without this check a typo silently blanks out page copy.
//   2. Runtime strings — every `t('key')` used in static/js/ must exist in
//      static/locales/{en,nl,pt}.json. i18next renders a missing key as the raw key
//      text, which is how the facturen column headers used to leak `static.facturen.k012`
//      into the UI.
//
// Run with: node scripts/i18n-check.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve('.');
const LANGS = ['en', 'nl', 'pt'];

function walk(dir, predicate, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, predicate, out);
      continue;
    }
    if (predicate(full)) out.push(full);
  }
  return out;
}

function collectKeys(files, pattern) {
  const used = new Map();
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    pattern.lastIndex = 0;
    let match = pattern.exec(content);
    while (match) {
      if (!used.has(match[1])) used.set(match[1], relative(repoRoot, file));
      match = pattern.exec(content);
    }
  }
  return used;
}

function flattenObject(obj, prefix = '', out = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, fullKey, out);
      continue;
    }
    out.add(fullKey);
  }
  return out;
}

function tomlKeys(file) {
  // Every key in i18n/*.toml is written as a quoted top-level key (they contain dots,
  // which TOML would otherwise read as nested tables) — see scripts that generated them.
  const keys = new Set();
  for (const match of readFileSync(file, 'utf8').matchAll(/^"([^"]+)"\s*=/gm)) keys.add(match[1]);
  return keys;
}

let failed = false;

function report(label, usedKeys, definedByLang) {
  for (const lang of LANGS) {
    const defined = definedByLang[lang];
    const missing = [...usedKeys].filter(([key]) => !defined.has(key)).sort();
    if (missing.length === 0) continue;
    failed = true;
    console.error(`Missing ${label} keys for "${lang}":`);
    for (const [key, file] of missing) console.error(`  - ${key}   (used in ${file})`);
  }
}

const layoutFiles = walk(join(repoRoot, 'layouts'), (f) => f.endsWith('.html'));
const compileTimeKeys = collectKeys(layoutFiles, /\{\{-?\s*i18n\s+"([^"]+)"/g);
const compileTimeDefined = Object.fromEntries(
  LANGS.map((lang) => [lang, tomlKeys(join(repoRoot, 'i18n', `${lang}.toml`))])
);
report('compile-time (i18n/*.toml)', compileTimeKeys, compileTimeDefined);

const jsFiles = walk(join(repoRoot, 'static', 'js'), (f) => f.endsWith('.js'));
// Only match a string literal that is the *complete* first argument (followed by `,`
// or `)`). Keys built by concatenation — t('invoice.line.service_' + item.service) —
// can't be checked statically, and matching their prefix would report false misses.
const runtimeKeys = collectKeys(jsFiles, /\bt\(\s*['"`]([^'"`]+)['"`]\s*[,)]/g);
const runtimeDefined = Object.fromEntries(
  LANGS.map((lang) => [
    lang,
    flattenObject(JSON.parse(readFileSync(join(repoRoot, 'static', 'locales', `${lang}.json`), 'utf8')))
  ])
);
report('runtime (static/locales/*.json)', runtimeKeys, runtimeDefined);

if (failed) process.exit(1);

console.log(
  `i18n key check passed (${compileTimeKeys.size} compile-time keys in layouts, ` +
    `${runtimeKeys.size} runtime keys in JS).`
);
