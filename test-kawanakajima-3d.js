// Regression test: Kawanakajima 3D GLB preview actually renders reviewable models.
// It serves the checkout over HTTP so browser fetch() follows the deployed preview path.

const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = __dirname;
const GAME_PATH = '/games/94-kawanakajima/index.html';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function fail(message) {
  throw new Error(message);
}

function startStaticServer(root) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsed.pathname);
      if (pathname === '/') pathname = GAME_PATH;
      const abs = path.resolve(root, '.' + pathname);
      if (abs !== root && !abs.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }
      fs.readFile(abs, (err, body) => {
        if (err) {
          res.writeHead(404);
          res.end('not found');
          return;
        }
        res.writeHead(200, { 'content-type': MIME[path.extname(abs)] || 'application/octet-stream' });
        res.end(body);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}${GAME_PATH}` });
    });
  });
}

function isImportantConsoleProblem(type, text) {
  if (type === 'error') return true;
  return /seed model load|failed to fetch|invalid_operation|does not belong to this context|model 404|bad glb|missing glb/i.test(text);
}

async function main() {
  const { server, url } = await startStaticServer(ROOT);
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--no-sandbox',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
      ],
    });
    const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
    const browserProblems = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (isImportantConsoleProblem(type, text)) {
        browserProblems.push(`${type}: ${text}`);
      }
    });
    page.on('pageerror', err => browserProblems.push(`pageerror: ${err.message}`));
    page.on('requestfailed', req => {
      if (req.url().includes('/assets/models/')) {
        browserProblems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText || ''}`);
      }
    });
    page.on('response', res => {
      if (res.url().includes('/assets/models/') && !res.ok()) {
        browserProblems.push(`bad response: ${res.status()} ${res.url()}`);
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const state = window.__KAWANAKAJIMA_3D_STATE;
      return state && state.left === 't1' && state.right === 'u1' && state.modelsLoaded.includes('t1') && state.modelsLoaded.includes('u1');
    }, { timeout: 10000 });

    await page.evaluate(async () => {
      await window.__KAWANAKAJIMA_LOAD_MODEL('left', 't4');
      await window.__KAWANAKAJIMA_LOAD_MODEL('right', 'u4');
    });
    await page.waitForFunction(() => {
      const state = window.__KAWANAKAJIMA_3D_STATE;
      return state && state.left === 't4' && state.right === 'u4' && state.modelsLoaded.includes('t4') && state.modelsLoaded.includes('u4');
    }, { timeout: 5000 });

    await page.waitForTimeout(300);
    const result = await page.evaluate(() => {
      const wrapRect = document.getElementById('wrap').getBoundingClientRect();
      const viewportFit = {
        width: wrapRect.width,
        height: wrapRect.height,
        top: wrapRect.top,
        left: wrapRect.left,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      };
      const canvases = [...document.querySelectorAll('.view3d')];
      const samples = canvases.map(canvas => {
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        const ctx = tmp.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(canvas, 0, 0);
        const data = ctx.getImageData(0, 0, tmp.width, tmp.height).data;
        let visiblePixels = 0;
        let variedPixels = 0;
        let minLum = 255;
        let maxLum = 0;
        let minX = tmp.width;
        let minY = tmp.height;
        let maxX = -1;
        let maxY = -1;
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          const lum = (r + g + b) / 3;
          const sampleIndex = i / 4;
          const x = sampleIndex % tmp.width;
          const y = Math.floor(sampleIndex / tmp.width);
          if (a > 0 && (r > 30 || g > 30 || b > 30)) {
            visiblePixels += 1;
            minX = Math.min(minX, x); minY = Math.min(minY, y);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          }
          if (a > 0) {
            minLum = Math.min(minLum, lum);
            maxLum = Math.max(maxLum, lum);
            if (Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b) > 8) variedPixels += 1;
          }
        }
        return { width: canvas.width, height: canvas.height, visiblePixels, variedPixels, luminanceRange: maxLum - minLum, bounds: { minX, minY, maxX, maxY } };
      });
      return { state: window.__KAWANAKAJIMA_3D_STATE, viewportFit, canvasCount: canvases.length, samples };
    });

    if (browserProblems.length) {
      fail('browser console/load problems: ' + browserProblems.join(' | '));
    }
    if (result.viewportFit.width > result.viewportFit.innerWidth || result.viewportFit.height > result.viewportFit.innerHeight || result.viewportFit.top < -1 || result.viewportFit.left < -1) {
    fail(`stage does not fit viewport: ${JSON.stringify(result.viewportFit)}`);
  }
  if (result.canvasCount !== 2) fail(`expected 2 WebGL review canvases, got ${result.canvasCount}`);
    if (result.state.assets !== 20) fail(`expected 20 asset state, got ${result.state.assets}`);
    for (const [index, sample] of result.samples.entries()) {
      if (sample.visiblePixels < 500) fail(`3D canvas ${index} appears blank: ${JSON.stringify(sample)}`);
      if (sample.variedPixels < 80) fail(`3D canvas ${index} lacks visible colored model variation: ${JSON.stringify(sample)}`);
      if (sample.luminanceRange < 20) fail(`3D canvas ${index} lacks luminance range: ${JSON.stringify(sample)}`);
    if (sample.bounds.minY < 16 || sample.bounds.maxY > sample.height - 16) fail(`3D canvas ${index} model is vertically cropped: ${JSON.stringify(sample)}`);
    if (sample.bounds.minX < 6 || sample.bounds.maxX > sample.width - 6) fail(`3D canvas ${index} model is horizontally cropped: ${JSON.stringify(sample)}`);
    }

    console.log('PASS: Kawanakajima 3D GLB preview loads seeded models, swaps roster models, and renders nonblank canvases');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(err => {
  console.error('FAIL: ' + err.message);
  process.exit(1);
});
