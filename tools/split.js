const sharp = require('sharp');
const [,, src, seg = 1400] = process.argv;
(async () => {
  const m = await sharp(src).metadata();
  for (let y = 0, i = 0; y < m.height; y += +seg, i++) {
    const h = Math.min(+seg, m.height - y);
    await sharp(src).extract({ left: 0, top: y, width: m.width, height: h }).jpeg({ quality: 80 }).toFile(src.replace('.jpg', `.part${i}.jpg`));
  }
  console.log(Math.ceil(m.height / seg), 'parts');
})();
