// Builds optimized web assets for the mockups from the press kit + capsule sources.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const PK = 'D:/Trabalho/Jogos/HTBF/Black Flame Tactics - Press Kit';
const CAP = 'D:/Trabalho/Jogos/HTBF/Steam Capsules/BFT_v2';
const OUT = path.resolve(__dirname, '../mockups/assets');
fs.mkdirSync(OUT, { recursive: true });

async function wordmark() {
  // Franchise wordmark: BFT white logo with the "TACTICS" subtitle (rules, sparks, word) removed.
  const src = `${PK}/Logos/Black Flame Tactics - Logo White.png`;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  for (let y = 500; y < H; y++) {
    const xEnd = y < 512 ? 3370 : 3700;
    for (let x = 560; x < xEnd; x++) data[(y * W + x) * 4 + 3] = 0;
  }
  const buf = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(buf).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed).resize(2000).png({ compressionLevel: 9 }).toFile(`${OUT}/wordmark-black-flame.png`);
  await sharp(trimmed).resize(2000).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}/wordmark-black-flame.webp`);
}

async function main() {
  await wordmark();
  const bftLogo = await sharp(`${PK}/Logos/Black Flame Tactics - Logo White.png`).trim({ threshold: 1 }).png().toBuffer();
  await sharp(bftLogo).resize(1600).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-bft-white.png`);
  const ef = await sharp(`${PK}/Logos/Emberfish Games - Logo Off-White.png`).trim({ threshold: 1 }).png().toBuffer();
  await sharp(ef).resize(480).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-emberfish.png`);

  await sharp(`${PK}/Key Art/Black Flame Tactics - Key Art Wide (no logo).png`).resize(2560).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/keyart-wide.jpg`);
  await sharp(`${PK}/Key Art/Black Flame Tactics - Key Art (no logo).png`).resize(1920).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/keyart-169.jpg`);
  await sharp(`${PK}/Key Art/Black Flame Tactics - Key Art.png`).resize(1600).jpeg({ quality: 84, mozjpeg: true }).toFile(`${OUT}/keyart-169-logo.jpg`);
  await sharp(`${CAP}/vertical_capsule_748x896.png`).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/capsule-vertical.jpg`);
  await sharp(`${CAP}/library_capsule_600x900.png`).jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/capsule-library.jpg`);
  await sharp(`${CAP}/main_capsule_1232x706.png`).jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT}/capsule-main.jpg`);

  const shots = fs.readdirSync(`${CAP}/screenshots`).filter(f => f.endsWith('.png'));
  for (const f of shots) {
    await sharp(`${CAP}/screenshots/${f}`).resize(1280).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/shot-${f.replace('.png', '.jpg')}`);
  }
  // Two gameplay loops as animated WebP (much smaller than the GIFs)
  for (const [n, name] of [[1, 'Chain Reaction'], [3, 'Pyre Combo']]) {
    const src = `${PK}/GIFs/Black Flame Tactics - GIF ${n} - ${name}.gif`;
    await sharp(src, { animated: true }).resize(720).webp({ quality: 70, effort: 4 }).toFile(`${OUT}/loop-${name.toLowerCase().replace(/ /g, '-')}.webp`);
  }
  fs.copyFileSync('D:/Trabalho/Jogos/HTBF/Logo/sigil-shapes/svg/00-current-v2.svg', `${OUT}/sigil.svg`);
  for (const f of fs.readdirSync(OUT)) console.log(String(fs.statSync(`${OUT}/${f}`).size).padStart(9), f);
}
main().catch(e => { console.error(e); process.exit(1); });
