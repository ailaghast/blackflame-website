// Minimal static server for previewing ../docs the way GitHub Pages serves it (404.html for misses).
// Usage: node serve.js [port]   then open http://localhost:8787
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../docs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
function start(port = 8787) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    const status = fs.existsSync(f) ? 200 : 404;
    if (status === 404) f = path.join(ROOT, '404.html');
    const stat = fs.statSync(f), type = TYPES[path.extname(f)] || 'application/octet-stream';
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (range && status === 200) { // video seeking
      const s = +range[1] || 0, e = range[2] ? +range[2] : stat.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${s}-${e}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 });
      return fs.createReadStream(f, { start: s, end: e }).pipe(res);
    }
    res.writeHead(status, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(f).pipe(res);
  }).listen(port);
}
if (require.main === module) { const port = +process.argv[2] || 8787; start(port); console.log(`Serving docs/ at http://localhost:${port}`); }
module.exports = start;
