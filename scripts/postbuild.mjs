// Neocities serves /not_found.html for missing pages; other hosts use /404.html.
import { copyFile } from 'node:fs/promises';

await copyFile('dist/404.html', 'dist/not_found.html');
console.log('postbuild: dist/not_found.html written');
