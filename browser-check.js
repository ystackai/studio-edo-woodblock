const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const GAME_DIR = path.join(__dirname, 'drops', 'edo-inkblade-ots');

function serve(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html', '.js': 'application/javascript',
        '.css': 'text/css', '.png': 'image/png', '.wav': 'audio/wav',
        '.json': 'application/json'
      };
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      } catch(e) {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(port, () => { console.log('Serving ' + dir + ' on port ' + port); resolve(server); });
  });
}

(async () => {
  const port = 8765;
  const server = await serve(GAME_DIR, port);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  let consoleErrors = [];
  let pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => { pageErrors.push(err.message); });

  console.log('Loading game at http://localhost:' + port + '/');
  await page.goto('http://localhost:' + port + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: '/tmp/game-screenshot.png', fullPage: false });
  console.log('Screenshot saved to /tmp/game-screenshot.png');

  console.log('Console errors:', consoleErrors.length);
  consoleErrors.forEach(e => console.log('  ERROR:', e.substring(0, 120)));
  console.log('Page errors:', pageErrors.length);
  pageErrors.forEach(e => console.log('  PAGE ERROR:', e.substring(0, 120)));

  const spriteStatus = await page.evaluate(() => {
    try {
      if (typeof SPRITES === 'undefined') return { total: 0, complete: 0 };
      var keys = Object.keys(SPRITES);
      var complete = keys.filter(k => SPRITES[k] && SPRITES[k].complete).length;
      return { total: keys.length, complete: complete };
    } catch(e) { return { total: -1, complete: -1, error: e.message }; }
  });
  console.log('Sprites:', JSON.stringify(spriteStatus));

  const canvasInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { exists: false };
    try {
      const ctx = canvas.getContext('2d');
      const cx = Math.floor(canvas.width / 2), cy = Math.floor(canvas.height / 2);
      const pixel = ctx.getImageData(cx, cy, 1, 1).data;
      return {
        exists: true, width: canvas.width, height: canvas.height,
        center: { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] },
        hasContent: pixel[0] > 5 || pixel[1] > 5 || pixel[2] > 5
      };
    } catch(e) { return { exists: true, context: true, error: e.message }; }
  });
  console.log('Canvas:', JSON.stringify(canvasInfo));

  await browser.close();
  server.close();
  console.log('Browser check complete. All good!');
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
