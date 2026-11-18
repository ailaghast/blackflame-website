// Side-by-side contact sheet of mobile full-page shots, slice [y0,y1) in CSS px
const sharp = require('sharp');
const [,, y0, y1, out, ...files] = process.argv;
(async () => {
  const W = 390, gap = 24, H = +y1 - +y0;
  const tiles = [];
  for (const f of files) {
    const m = await sharp(f).metadata();
    const top = Math.min(+y0 * 2, m.height - 2), hh = Math.min(H * 2, m.height - top);
    tiles.push(await sharp(f).extract({ left: 0, top, width: m.width, height: hh }).resize(W).toBuffer());
  }
  await sharp({ create: { width: files.length * (W + gap) - gap, height: H, channels: 3, background: '#333' } })
    .composite(tiles.map((t, i) => ({ input: t, left: i * (W + gap), top: 0 }))).jpeg({ quality: 82 }).toFile(out);
})();
