// Draws the hero illustration: a small pine on archipelago granite at sunset.
// It stands in for a photo. To use a photo instead, see README ("Hero image").
//   node scripts/make-hero-art.mjs  →  public/images/lujamo-hero.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 800;
const H = 600;
const HORIZON = 352;

// Small seeded random so the drawing is identical on every run
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const pineTier = (cx, top, bottom, w) => {
  const j = (n) => (rnd() - 0.5) * n;
  return `M${cx + j(3)} ${top}L${cx + w} ${bottom + j(4)}L${cx + w * 0.55} ${bottom - 7 + j(4)}L${cx + w * 0.2} ${bottom + 3}L${cx - w * 0.25} ${bottom - 6 + j(4)}L${cx - w * 0.6} ${bottom + 2}L${cx - w} ${bottom - 3 + j(4)}Z`;
};

function pine(cx, base, height, scale = 1) {
  const tiers = 7;
  let lit = '';
  let dark = '';
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const top = base - height + t * height * 0.72;
    const bottom = top + height * 0.26;
    const w = (10 + t * 46) * scale;
    const d = pineTier(cx, top, bottom, w);
    dark += `<path d="${d}"/>`;
    // sun from the right: a lit sliver on the right side of each tier
    lit += `<path d="M${cx + 2} ${top + 4}L${cx + w * 0.95} ${bottom - 1}L${cx + w * 0.5} ${bottom - 7}Z"/>`;
  }
  return `
    <rect x="${cx - 2.5}" y="${base - height * 0.2}" width="5" height="${height * 0.2 + 4}" fill="#3b2f25"/>
    <g fill="#23392a">${dark}</g>
    <g fill="#8a8a3f" opacity="0.55">${lit}</g>`;
}

const lichen = () => {
  let out = '';
  const spots = [
    [120, 470], [190, 452], [255, 440], [330, 438], [410, 458], [470, 484], [90, 520], [160, 505], [520, 520], [60, 560],
  ];
  for (const [x, y] of spots) {
    for (let i = 0; i < 7; i++) {
      const dx = (rnd() - 0.5) * 36;
      const dy = (rnd() - 0.5) * 16;
      const r = 0.8 + rnd() * 2;
      const c = rnd() > 0.5 ? '#cdbb7e' : '#e3d6ad';
      out += `<ellipse cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" rx="${(r * 2.2).toFixed(1)}" ry="${r.toFixed(1)}" fill="${c}" opacity="${(0.2 + rnd() * 0.3).toFixed(2)}"/>`;
    }
  }
  return out;
};

const reflections = () => {
  let out = '';
  for (let i = 0; i < 26; i++) {
    const y = HORIZON + 6 + i * i * 0.42 + i * 2;
    if (y > 470) break;
    const w = 70 - i * 2.2 + rnd() * 20;
    const x = 500 - w / 2 + (rnd() - 0.5) * 30;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(1.6 + i * 0.12).toFixed(1)}" rx="1" fill="#ffe7b3" opacity="${(0.85 - i * 0.028).toFixed(2)}"/>`;
  }
  return out;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9fb2b8"/>
      <stop offset="0.3" stop-color="#d9c7ae"/>
      <stop offset="0.52" stop-color="#f2c287"/>
      <stop offset="0.6" stop-color="#f7cf91"/>
    </linearGradient>
    <radialGradient id="glow" cx="500" cy="${HORIZON - 6}" r="230" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff2c8" stop-opacity="0.95"/>
      <stop offset="0.25" stop-color="#ffd98f" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffd98f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d7b58b"/>
      <stop offset="0.25" stop-color="#9ea39a"/>
      <stop offset="1" stop-color="#4f6566"/>
    </linearGradient>
    <linearGradient id="rock" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b9977a"/>
      <stop offset="0.35" stop-color="#8d8176"/>
      <stop offset="1" stop-color="#4c4845"/>
    </linearGradient>
    <linearGradient id="rock2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8f7c6c"/>
      <stop offset="1" stop-color="#3d3b39"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.55" cy="0.45" r="0.8">
      <stop offset="0.6" stop-color="#1b1a18" stop-opacity="0"/>
      <stop offset="1" stop-color="#1b1a18" stop-opacity="0.28"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${HORIZON + 2}" fill="url(#sky)"/>
  <rect width="${W}" height="${HORIZON + 2}" fill="url(#glow)"/>

  <!-- clouds -->
  <g fill="#f6dcc0" opacity="0.55">
    <ellipse cx="210" cy="118" rx="170" ry="9"/>
    <ellipse cx="330" cy="140" rx="120" ry="6"/>
    <ellipse cx="640" cy="96" rx="150" ry="8"/>
    <ellipse cx="700" cy="210" rx="110" ry="5"/>
  </g>
  <g fill="#b79686" opacity="0.35">
    <ellipse cx="160" cy="232" rx="140" ry="5"/>
    <ellipse cx="610" cy="262" rx="160" ry="6"/>
    <ellipse cx="420" cy="292" rx="90" ry="3.5"/>
  </g>

  <!-- sun -->
  <circle cx="500" cy="${HORIZON - 12}" r="24" fill="#fff4d2"/>

  <!-- far islands -->
  <path d="M0 ${HORIZON}V338C40 334 70 330 110 333S170 340 200 344 250 346 262 ${HORIZON}Z" fill="#6f7471" opacity="0.8"/>
  <path d="M600 ${HORIZON}C620 344 650 338 690 339S760 344 800 340V${HORIZON}Z" fill="#6a716f" opacity="0.75"/>
  <path d="M340 ${HORIZON}C352 347 372 346 392 348S412 ${HORIZON} 416 ${HORIZON}Z" fill="#7b7d78" opacity="0.7"/>

  <!-- sea -->
  <rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#sea)"/>
  ${reflections()}
  <g stroke="#f1d9ae" stroke-opacity="0.25" stroke-width="1.5">
    <path d="M40 380h90M180 392h120M600 386h110M660 404h90M80 420h70M560 430h140"/>
  </g>

  <!-- granite -->
  <path d="M0 470C60 440 130 420 210 410 290 400 350 404 420 428 480 448 540 480 600 520 650 552 700 580 740 ${H}H0Z" fill="url(#rock)"/>
  <path d="M0 470C60 440 130 420 210 410 290 400 350 404 420 428 480 448 540 480 600 520" fill="none" stroke="#f0c592" stroke-width="3" stroke-opacity="0.6"/>
  <g fill="none" stroke="#403b37" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round">
    <path d="M120 440c20 30 18 60 40 100"/>
    <path d="M300 410c-10 40 10 70 0 120"/>
    <path d="M430 440c12 22 30 40 60 60"/>
    <path d="M40 500c50 10 90 30 120 60"/>
  </g>
  ${lichen()}
  <path d="M560 ${H}C600 560 660 540 720 536 760 534 790 546 800 552V${H}Z" fill="url(#rock2)"/>
  <path d="M560 ${H}C600 560 660 540 720 536 760 534 790 546 800 552" fill="none" stroke="#e3b784" stroke-width="2.5" stroke-opacity="0.5"/>

  <!-- long evening shadow, away from the sun -->
  <path d="M290 409C240 414 170 426 110 446 150 440 230 424 296 412Z" fill="#2e2b28" opacity="0.35"/>

  <!-- the small pine that holds on -->
  <g>${pine(292, 408, 176)}</g>
  <g fill="none" stroke="#6f7a3a" stroke-width="2" stroke-linecap="round" opacity="0.8">
    <path d="M270 410l-6-12M276 409l-2-14M312 407l4-12M318 408l8-10M250 414l-8-8"/>
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>
`;

mkdirSync('public/images', { recursive: true });
writeFileSync('public/images/lujamo-hero.svg', svg.replace(/\n\s*/g, '\n'));
console.log(`public/images/lujamo-hero.svg (${(svg.length / 1024).toFixed(1)} KB)`);
