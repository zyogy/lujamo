// Lists missing translations. Finnish is the reference language.
//   npm run check:i18n
// Exits with code 1 if anything is missing (pages still build: they fall back to Finnish).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import * as yaml from 'js-yaml';

const REF = 'fi';
const LANGS = ['en', 'sv'];
let problems = 0;

/** Flatten an object into dotted key paths. Arrays keep their index. */
function keys(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

function report(title, list) {
  if (!list.length) return;
  problems += list.length;
  console.log(`\n${title}`);
  for (const item of list) console.log(`  - ${item}`);
}

function readData(file) {
  const text = readFileSync(file, 'utf8');
  if (extname(file) === '.md') {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return match ? yaml.load(match[1]) : {};
  }
  return yaml.load(text);
}

// 1. UI strings
const refStrings = keys(JSON.parse(readFileSync(`src/i18n/${REF}.json`, 'utf8')));
for (const lang of LANGS) {
  const own = new Set(keys(JSON.parse(readFileSync(`src/i18n/${lang}.json`, 'utf8'))));
  report(`src/i18n/${lang}.json – missing keys`, refStrings.filter((k) => !own.has(k)));
}

// 2. Content files and their fields
for (const collection of ['units', 'pages']) {
  const refDir = join('src/content', collection, REF);
  for (const file of readdirSync(refDir)) {
    const refKeys = keys(readData(join(refDir, file)));
    for (const lang of LANGS) {
      const target = join('src/content', collection, lang, file);
      if (!existsSync(target)) {
        report(`${target} – file missing (Finnish is shown instead)`, [file]);
        continue;
      }
      const own = new Set(keys(readData(target)));
      report(`${target} – missing fields`, refKeys.filter((k) => !own.has(k)));
    }
  }
}

if (problems) {
  console.log(`\n${problems} missing translation(s).`);
  process.exit(1);
}
console.log('i18n: all languages complete.');
