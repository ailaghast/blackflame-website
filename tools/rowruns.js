const sharp = require('sharp');
const [,, src, y0, y1, step, xa, xb] = process.argv;
(async () => {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  for (let y = +y0; y < +y1; y += +step) {
    let runs = [], inRun = false, s = 0;
    for (let x = +xa; x <= +xb; x++) { const on = x < +xb && data[(y*W+x)*4+3] > 20; if (on && !inRun) { s = x; inRun = true; } if (!on && inRun) { runs.push(`${s}-${x-1}`); inRun = false; } }
    console.log(y, runs.join(' '));
  }
})();
