import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repoRoot = resolve('.');
const jsRoot = join(repoRoot, 'js');
const localeFiles = [
  join(repoRoot, 'locales', 'en.json'),
  join(repoRoot, 'locales', 'nl.json'),
  join(repoRoot, 'locales', 'pt.json')
];
const keyPattern = /\bt\(\s*['"`]([^'"`]+)['"`]/g;

function walkJsFiles(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkJsFiles(full, out);
      continue;
    }
    if (full.endsWith('.js')) out.push(full);
  }
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

const jsFiles = [];
walkJsFiles(jsRoot, jsFiles);

const usedKeys = new Set();
for (const file of jsFiles) {
  const content = readFileSync(file, 'utf8');
  keyPattern.lastIndex = 0;
  let match = keyPattern.exec(content);
  while (match) {
    usedKeys.add(match[1]);
    match = keyPattern.exec(content);
  }
}

const localeSets = localeFiles.map((file) => {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  return flattenObject(json);
});

const missingByLocale = localeSets.map((set) => {
  const missing = [];
  for (const key of usedKeys) {
    if (!set.has(key)) missing.push(key);
  }
  return missing.sort();
});

const localeNames = ['en', 'nl', 'pt'];
let hasMissing = false;
for (let i = 0; i < localeNames.length; i += 1) {
  if (missingByLocale[i].length === 0) continue;
  hasMissing = true;
  console.error('Missing keys in ' + localeNames[i] + '.json:');
  for (const key of missingByLocale[i]) {
    console.error('  - ' + key);
  }
}

if (hasMissing) {
  process.exit(1);
}

console.log('i18n key check passed (' + usedKeys.size + ' keys in use).');
