const sharp = require('sharp');
const [,, src, y0, y1] = process.argv;
(async () => {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  // list x runs with alpha>40 within rows y0..y1
  const col = new Array(W).fill(0);
  for (let y = +y0; y < +y1; y++) for (let x = 0; x < W; x++) if (data[(y*W+x)*4+3] > 40) col[x]++;
  let runs = [], inRun = false, s = 0;
  for (let x = 0; x <= W; x++) { const on = x < W && col[x] > 0; if (on && !inRun) { s = x; inRun = true; } if (!on && inRun) { runs.push(`${s}-${x-1}`); inRun = false; } }
  console.log(runs.join(' '));
})();
