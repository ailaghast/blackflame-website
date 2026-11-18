// Composite a transparent logo onto a dark bg for viewing; also report row coverage profile
const sharp = require('sharp');
const [,, src, out, bg='#15131f'] = process.argv;
(async () => {
  const img = sharp(src);
  const m = await img.metadata();
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const rows = [];
  for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) if (data[(y*W+x)*4+3] > 40) c++; rows.push(c); }
  // print compressed profile every 10 rows
  let s = '';
  for (let y = 0; y < H; y += 10) s += `${y}:${rows[y]} `;
  console.log(W, H, s);
  await sharp({ create: { width: W, height: H, channels: 4, background: bg } })
    .composite([{ input: src }]).png().toFile(out);
})();
