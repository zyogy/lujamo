// Checks that every file in dist/ has a file type the Neocities free plan accepts.
//   npm run check:neocities
// The list is conservative. Current list: https://neocities.org/site_files/allowed_types
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ALLOWED = new Set([
  'html', 'htm', 'txt', 'text', 'css', 'js', 'mjs', 'json', 'xml', 'svg', 'ico',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'md', 'pdf', 'csv',
]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk('dist');
const bad = files.filter((f) => !ALLOWED.has(extname(f).slice(1).toLowerCase()));
const bytes = files.reduce((sum, f) => sum + statSync(f).size, 0);

console.log(`dist/: ${files.length} files, ${(bytes / 1024).toFixed(0)} KB`);
if (bad.length) {
  console.log('Not allowed on Neocities (free plan):');
  for (const f of bad) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('neocities: all file types allowed.');
