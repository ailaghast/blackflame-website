// Builds the production images, video and icons for the site in ../docs/assets.
// Sources: the HTBF press kit / Steam capsules / logo folders, plus the Codex art in ../assets-src/codex.
// Usage: node build-site-assets.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const PK = 'D:/Trabalho/Jogos/HTBF/Black Flame Tactics - Press Kit';
const CAP = 'D:/Trabalho/Jogos/HTBF/Steam Capsules/BFT_v2';
// Media of the live Steam store page (screenshots, description clips). Set BF_STORE to build from a fresh
// extraction of a newer drop before it has been copied into the HTBF folder.
const STORE = process.env.BF_STORE || `${CAP}/steam store page v38`;
const SIGIL = 'D:/Trabalho/Jogos/HTBF/Logo/sigil-shapes/svg/00-current-v2.svg';
const CODEX = path.resolve(__dirname, '../assets-src/codex');
const OUT = path.resolve(__dirname, '../docs');
const IMG = path.join(OUT, 'assets/img');
const VID = path.join(OUT, 'assets/video');
[IMG, VID].forEach(d => fs.mkdirSync(d, { recursive: true }));

const webp = (src, name, widths, q = 80) => Promise.all(widths.map(w =>
  sharp(src).resize({ width: w, withoutEnlargement: false }).webp({ quality: q, effort: 6 }).toFile(path.join(IMG, `${name}-${w}.webp`))));

async function wordmark() {
  // Series wordmark: the BFT white logo with the "TACTICS" subtitle (rules, sparks, word) cleared.
  const src = `${PK}/Logos/Black Flame Tactics - Logo White.png`;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  for (let y = 500; y < H; y++) {
    const xEnd = y < 512 ? 3370 : 3700; // the E's swash reaches x>=3379 only above y=512
    for (let x = 560; x < xEnd; x++) data[(y * W + x) * 4 + 3] = 0;
  }
  const trimmed = await sharp(await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed).resize(1400).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(IMG, 'wordmark-black-flame.webp'));
  await sharp(trimmed).resize(1400).png({ compressionLevel: 9 }).toFile(path.join(IMG, 'wordmark-black-flame.png')); // for social cards / press
}

async function icons() {
  const svg = fs.readFileSync(SIGIL, 'utf8');
  const d = /d="([^"]+)"/.exec(svg)[1];
  // Favicon: cream sigil on a dark rounded tile, readable on light and dark tab bars.
  const tile = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
<rect width="64" height="64" rx="${radius}" fill="#0d0b12"/>
<g transform="translate(32 33) scale(0.66)"><path fill="#f5f0e9" d="${d}"/></g></svg>`;
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), tile(64, 12));
  const png = async (size, file, radius = 12) => sharp(Buffer.from(tile(size, radius)), { density: 72 * size / 64 }).resize(size, size).png().toFile(path.join(OUT, file));
  await png(180, 'apple-touch-icon.png', 0);
  await png(192, 'icon-192.png');
  await png(512, 'icon-512.png');
  // favicon.ico with embedded 16/32/48 PNGs
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(s => sharp(Buffer.from(tile(s, 12)), { density: 72 * s / 64 * 4 }).resize(s, s).png().toBuffer()));
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const dirs = pngs.map((p, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] % 256, 0); e.writeUInt8(sizes[i] % 256, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(p.length, 8); e.writeUInt32LE(offset, 12);
    offset += p.length; return e;
  });
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), Buffer.concat([header, ...dirs, ...pngs]));
}

async function video() {
  // Gameplay loop: the Abyss Pit clip from the Steam description (1170x658, 30 fps), also the source of the press-kit GIF
  const src = `${STORE}/description-media/bft-abyss-pit.mp4`;
  const out = path.join(VID, 'gameplay-abyss-pit.mp4');
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', src, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  // Poster: a frame with the arena already ringed in flames
  const png = path.join(VID, '_poster.png');
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '2', '-i', src, '-frames:v', '1', png]);
  await sharp(png).webp({ quality: 80 }).toFile(path.join(VID, 'gameplay-abyss-pit-poster.webp'));
  fs.unlinkSync(png);
}

async function main() {
  await wordmark();
  await sharp(`${PK}/Logos/Black Flame Tactics - Logo White.png`).trim({ threshold: 1 }).resize(1300).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(IMG, 'logo-black-flame-tactics.webp'));
  await sharp(`${PK}/Logos/Emberfish Games - Logo Off-White.png`).trim({ threshold: 1 }).resize(400).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(IMG, 'logo-emberfish.webp'));

  await webp(`${PK}/Key Art/Black Flame Tactics - Key Art (no logo).png`, 'keyart', [1280, 1920, 2260], 78);
  await webp(`${CAP}/main_capsule_1232x706.png`, 'capsule-main', [640, 1232], 84);
  await webp(`${CAP}/vertical_capsule_748x896.png`, 'capsule-vertical', [400, 748], 84);
  // The Steam store screenshots, in store order: 640/1280 for the carousel, 1920 for the click-to-enlarge viewer.
  // Old shot-* files are removed first so screenshots dropped from the store don't linger.
  for (const f of fs.readdirSync(IMG)) if (f.startsWith('shot-')) fs.unlinkSync(path.join(IMG, f));
  for (const f of fs.readdirSync(`${STORE}/screenshots`).filter(f => f.endsWith('.png'))) await webp(`${STORE}/screenshots/${f}`, `shot-${f.replace('.png', '')}`, [640, 1280, 1920], 80);

  // clear outputs from earlier versions of the page
  for (const d of [IMG, VID]) for (const f of fs.readdirSync(d)) if (/^(black-flame-\d|gameplay-chain-reaction)/.test(f)) fs.unlinkSync(path.join(d, f));
  await icons();
  await video();
  const list = (dir) => fs.readdirSync(dir).map(f => `${String(fs.statSync(path.join(dir, f)).size).padStart(8)}  ${path.relative(OUT, path.join(dir, f))}`);
  console.log([...list(IMG), ...list(VID)].join('\n'));
}
main().catch(e => { console.error(e); process.exit(1); });
