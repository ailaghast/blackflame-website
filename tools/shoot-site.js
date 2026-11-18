// Screenshots the real site (served from ../docs) + renders docs/og-image.jpg. Output: _review/
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs'), url = require('url');
const serve = require('./serve');
const OUT = path.join(__dirname, '_review');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = serve(0); // any free port, so a running preview server doesn't clash
  await new Promise(r => server.on('listening', r));
  const BASE = `http://localhost:${server.address().port}`;
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
  const settle = async page => {
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    });
    await new Promise(r => setTimeout(r, 700));
  };
  const views = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
  for (const [tag, vp] of Object.entries(views)) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    page.on('requestfailed', r => errors.push('FAILED ' + r.url()));
    page.on('response', r => r.status() >= 400 && errors.push(r.status() + ' ' + r.url()));
    await page.setViewport(vp);
    await page.goto(BASE + '/#shot', { waitUntil: 'networkidle0' });
    await settle(page);
    await page.screenshot({ path: path.join(OUT, `site-${tag}-hero.jpg`), type: 'jpeg', quality: 85 });
    await page.screenshot({ path: path.join(OUT, `site-${tag}-full.jpg`), type: 'jpeg', quality: 80, fullPage: true });
    console.log(tag, errors.length ? errors : 'no errors');
    await page.close();
  }
  const p404 = await browser.newPage(); await p404.setViewport(views.desktop);
  await p404.goto(BASE + '/nope', { waitUntil: 'networkidle0' }); await settle(p404);
  await p404.screenshot({ path: path.join(OUT, 'site-404.jpg'), type: 'jpeg', quality: 80 });
  const og = await browser.newPage(); await og.setViewport({ width: 1200, height: 630 });
  await og.goto(url.pathToFileURL(path.join(__dirname, 'og-card.html')).href, { waitUntil: 'networkidle0' }); await settle(og);
  await og.screenshot({ path: path.resolve(__dirname, '../docs/og-image.jpg'), type: 'jpeg', quality: 86 });
  await browser.close(); server.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
