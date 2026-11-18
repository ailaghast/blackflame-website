// Screenshots each mockup: desktop hero (1440x900), desktop full page, mobile full page.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../mockups');
const OUT = path.join(ROOT, 'shots');
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['a-descent', 'b-monolith', 'c-index'];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
  for (const name of pages) {
    for (const [tag, vp] of [['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }], ['mobile', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      const url = require('url').pathToFileURL(path.join(ROOT, name + '.html')).href + '#shot';
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; });
        await document.fonts.ready;
        await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
      });
      await new Promise(r => setTimeout(r, 600));
      if (tag === 'desktop') await page.screenshot({ path: path.join(OUT, `${name}-hero.jpg`), type: 'jpeg', quality: 85 });
      await page.screenshot({ path: path.join(OUT, `${name}-${tag}-full.jpg`), type: 'jpeg', quality: 80, fullPage: true });
      await page.close();
      console.log('shot', name, tag);
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
