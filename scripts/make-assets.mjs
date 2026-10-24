// Generates favicons and Open Graph images into public/.
//   npm run assets
// Run again after changing a unit's name, label or accent. Outputs are committed.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import * as yaml from 'js-yaml';

const fontDir = 'node_modules/@fontsource/hanken-grotesk/files';
const fonts = [
  { name: 'Hanken', weight: 500, data: readFileSync(join(fontDir, 'hanken-grotesk-latin-500-normal.woff')) },
  { name: 'Hanken', weight: 800, data: readFileSync(join(fontDir, 'hanken-grotesk-latin-800-normal.woff')) },
];

// Colours come from tokens.css so there is one source of truth.
// var(--x) references are resolved, e.g. --digital: var(--metsa).
const css = readFileSync('src/styles/tokens.css', 'utf8');
const raw = Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]));
const token = (name) => {
  let value = raw[name];
  while (value?.startsWith('var(--')) value = raw[value.slice(6, -1)];
  return value;
};
const color = { bg: token('kallio'), ink: token('graniitti'), steel: token('teras'), forest: token('metsa'), moss: token('sammal') };

// The L-with-a-leaf monogram (same path as src/components/Monogram.astro)
const L_PATH = 'M5.5 7.2 11.8 3v22.4h0.2C14.6 21.4 19.4 18.6 27.5 18.2 26.8 25.2 22 29 14.2 29H5.5Z';
const monogram = (bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${bg ? `<rect width="32" height="32" fill="${bg}"/>` : ''}<path d="${L_PATH}" fill="${color.forest}"/></svg>`;

// --- Favicons
mkdirSync('public', { recursive: true });
writeFileSync('public/favicon.svg', monogram());
await sharp(Buffer.from(monogram(color.bg))).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const png32 = await sharp(Buffer.from(monogram())).resize(32, 32).png().toBuffer();
// Minimal ICO container holding one 32×32 PNG
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));

// --- Open Graph images (1200×630)
const h = (type, style, children) => ({ type, props: { style, children } });
const monoSrc = `data:image/svg+xml;base64,${Buffer.from(monogram()).toString('base64')}`;

function card({ title, subtitle, accent, path, logo }) {
  return h('div', { width: 1200, height: 630, display: 'flex', background: color.bg, fontFamily: 'Hanken', position: 'relative' }, [
    h('div', { position: 'absolute', left: 96, top: 96, display: 'flex', alignItems: 'center' }, [
      h('div', { width: 56, height: 4, background: color.moss, marginRight: 22 }),
      h('div', { fontSize: 26, fontWeight: 500, color: color.steel, letterSpacing: 6 }, path.toUpperCase()),
    ]),
    h('div', { position: 'absolute', left: 96, top: 236, width: 900, display: 'flex', flexDirection: 'column' }, [
      h('div', { fontSize: title.length > 24 ? 72 : 112, fontWeight: 800, color: color.ink, letterSpacing: -3, lineHeight: 1.05 }, title),
      h('div', { display: 'flex', alignItems: 'center', marginTop: 32 }, [
        h('div', { width: 18, height: 18, borderRadius: 9, background: accent, marginRight: 16 }),
        h('div', { fontSize: 40, fontWeight: 500, color: color.steel }, subtitle),
      ]),
    ]),
    { type: 'img', props: { src: logo ?? monoSrc, width: 120, height: 120, style: { position: 'absolute', right: 96, bottom: 84 } } },
    h('div', { position: 'absolute', left: 0, bottom: 0, width: 1200, height: 18, background: color.forest }),
  ]);
}

const units = readdirSync('src/content/units/fi').map((f) => ({
  id: f.replace('.yaml', ''),
  ...yaml.load(readFileSync(`src/content/units/fi/${f}`, 'utf8')),
}));
const cards = [
  { id: 'lujamo', title: yaml.load(readFileSync('src/content/pages/fi/home.yaml', 'utf8')).hero.heading, subtitle: 'Sovelluskehitys ja digitaaliset palvelut', accent: color.moss, path: 'Lujamo' },
  ...units.map((u) => ({
    id: u.id,
    title: u.name,
    subtitle: u.label,
    accent: token(u.accent),
    logo: u.logo ? `data:image/png;base64,${readFileSync(`public${u.logo}`).toString('base64')}` : undefined,
    path: u.kind === 'project' ? 'Lujamo  /  Projektit' : 'Lujamo',
  })),
];

mkdirSync('public/og', { recursive: true });
for (const c of cards) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`public/og/${c.id}.png`);
  console.log(`public/og/${c.id}.png`);
}
console.log('favicons written');
