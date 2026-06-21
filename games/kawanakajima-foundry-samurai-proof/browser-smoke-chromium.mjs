import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../..');
const GAME_PATH = '/games/kawanakajima-foundry-samurai-proof/index.html';
const OUT_DIR = resolve(process.env.BROWSER_SMOKE_OUTPUT_DIR || join(tmpdir(), `kawanakajima-browser-smoke-${Date.now()}`));
const TIMEOUT_MS = Number(process.env.BROWSER_SMOKE_TIMEOUT_MS || 25000);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.glb', 'model/gltf-binary'],
  ['.gltf', 'model/gltf+json'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.wav', 'audio/wav'],
  ['.css', 'text/css; charset=utf-8'],
]);

function findExecutable(names) {
  if (process.env.CHROMIUM_BIN && existsSync(process.env.CHROMIUM_BIN)) {
    return process.env.CHROMIUM_BIN;
  }

  for (const name of names) {
    const found = spawnSync('sh', ['-lc', `command -v ${name}`], { encoding: 'utf8' });
    if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
  }

  for (const candidate of [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ]) {
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

async function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

function startStaticServer(port) {
  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    let target = resolve(ROOT, `.${decodeURIComponent(url.pathname)}`);
    if (!target.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (existsSync(target) && statSync(target).isDirectory()) {
      target = join(target, 'index.html');
    }
    if (!existsSync(target)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': mimeTypes.get(extname(target)) || 'application/octet-stream' });
    createReadStream(target).pipe(res);
  });

  return new Promise((resolveServer, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolveServer(server));
  });
}

async function waitForJson(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {}
    await new Promise(resolveSleep => setTimeout(resolveSleep, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.consoleMessages = [];
    this.exceptions = [];
    this.failedRequests = [];

    this.ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolveMessage, rejectMessage } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) rejectMessage(new Error(JSON.stringify(message.error)));
        else resolveMessage(message.result);
        return;
      }

      this.events.push(message);
      if (message.method === 'Runtime.consoleAPICalled') {
        this.consoleMessages.push({
          type: message.params.type,
          text: message.params.args.map(arg => arg.value ?? arg.description ?? '').join(' '),
        });
      }
      if (message.method === 'Runtime.exceptionThrown') {
        this.exceptions.push(message.params.exceptionDetails?.text || message.params.exceptionDetails?.exception?.description || 'Runtime exception');
      }
      if (message.method === 'Network.loadingFailed') {
        this.failedRequests.push({
          url: message.params.requestId,
          errorText: message.params.errorText,
        });
      }
      if (message.method === 'Network.responseReceived' && message.params.response?.status >= 400) {
        const url = message.params.response.url || '';
        if (!url.endsWith('/favicon.ico')) {
          this.failedRequests.push({
            url,
            status: message.params.response.status,
          });
        }
      }
    });
  }

  async open(timeoutMs) {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolveOpen, rejectOpen) => {
      const timer = setTimeout(() => rejectOpen(new Error('Timed out opening DevTools websocket')), timeoutMs);
      this.ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolveOpen();
      }, { once: true });
      this.ws.addEventListener('error', error => {
        clearTimeout(timer);
        rejectOpen(error);
      }, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolveMessage, rejectMessage) => {
      this.pending.set(id, { resolveMessage, rejectMessage });
      this.ws.send(payload);
    });
  }

  close() {
    this.ws.close();
  }
}

async function waitForTarget(debugPort, pageUrl, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`, 2000);
    const target = targets.find(item => item.type === 'page' && item.url === pageUrl)
      || targets.find(item => item.type === 'page');
    if (target?.webSocketDebuggerUrl) return target;
    await new Promise(resolveSleep => setTimeout(resolveSleep, 150));
  }
  throw new Error('Timed out waiting for Chromium page target');
}

async function main() {
  if (typeof WebSocket !== 'function') {
    throw new Error('Node global WebSocket is unavailable; use Node 22+ or provide a browser smoke runner');
  }

  const chromium = findExecutable(['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']);
  if (!chromium) {
    throw new Error('Chromium/Chrome executable not found. Set CHROMIUM_BIN to run the browser smoke.');
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const httpPort = await getFreePort();
  const debugPort = await getFreePort();
  const userDataDir = mkdtempSync(join(tmpdir(), 'kawanakajima-chrome-'));
  const server = await startStaticServer(httpPort);
  const pageUrl = `http://127.0.0.1:${httpPort}${GAME_PATH}`;
  const screenshotPath = join(OUT_DIR, 'browser-smoke.png');
  const reportPath = join(OUT_DIR, 'browser-smoke.json');

  const chrome = spawn(chromium, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--use-gl=swiftshader',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--allow-file-access-from-files',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1280,800',
    `--remote-debugging-address=127.0.0.1`,
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    pageUrl,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let cdp;
  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`, TIMEOUT_MS);
    const target = await waitForTarget(debugPort, pageUrl, TIMEOUT_MS);
    cdp = new CdpClient(target.webSocketDebuggerUrl);
    await cdp.open(5000);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Network.enable');

    const readiness = await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `new Promise(resolve => {
        const started = Date.now();
        const finish = () => {
          const canvas = document.querySelector('canvas');
          const foundry = window.KAWANAKAJIMA_FOUNDRY || {};
          const actorCount = typeof foundry.getActorCount === 'function'
            ? foundry.getActorCount()
            : foundry.actorCount;
          let pixelStats = null;
          try {
            const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            if (gl) {
              const width = canvas.width;
              const height = canvas.height;
              const pixels = new Uint8Array(width * height * 4);
              gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
              let lit = 0;
              let total = 0;
              let sum = 0;
              const stride = Math.max(4, Math.floor(pixels.length / (10240 * 4)) * 4);
              for (let i = 0; i < pixels.length; i += stride) {
                const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
                if (a > 0 && (r + g + b) > 30) lit++;
                sum += r + g + b;
                total++;
              }
              pixelStats = { litPixels: lit, totalPixelsSampled: total, averageRgbSum: total ? sum / total : 0, width, height };
            }
          } catch (error) {
            pixelStats = { error: String(error && error.message || error) };
          }
          resolve({
            title: document.title,
            href: location.href,
            ready: window.__KAWANAKAJIMA_CAPTURE_READY || null,
            actorCount,
            bodyActorCount: Number(document.body.dataset.actors || 0),
            error: document.body.dataset.error || null,
            canvasPresent: !!canvas,
            canvasClient: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight } : null,
            pixelStats,
          });
        };
        const timer = setInterval(() => {
          const foundry = window.KAWANAKAJIMA_FOUNDRY || {};
          const actorCount = typeof foundry.getActorCount === 'function'
            ? foundry.getActorCount()
            : foundry.actorCount;
          const captureReady = document.title.startsWith('CAPTURE_READY:') || window.__KAWANAKAJIMA_CAPTURE_READY;
          if ((captureReady && actorCount === 20) || Date.now() - started > 16000) {
            clearInterval(timer);
            requestAnimationFrame(() => requestAnimationFrame(finish));
          }
        }, 250);
      })`,
    });

    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

    const result = readiness.result?.value || {};
    const report = {
      ok: true,
      pageUrl,
      chromium: basename(chromium),
      result,
      consoleErrors: cdp.consoleMessages.filter(item => item.type === 'error'),
      exceptions: cdp.exceptions,
      failedRequests: cdp.failedRequests,
      screenshotPath,
    };

    const pixelStats = result.pixelStats || {};
    const failures = [];
    if (!result.canvasPresent) failures.push('canvas missing');
    if (!String(result.title || '').startsWith('CAPTURE_READY:')) failures.push(`capture-ready title missing (${result.title || 'untitled'})`);
    if (result.actorCount !== 20) failures.push(`actor count is not 20 (${result.actorCount})`);
    if (result.bodyActorCount !== 20) failures.push(`body actor count is not 20 (${result.bodyActorCount})`);
    if (result.error) failures.push(`page error marker: ${result.error}`);
    if (!pixelStats.totalPixelsSampled || pixelStats.litPixels < Math.floor(pixelStats.totalPixelsSampled * 0.6)) {
      failures.push(`canvas appears blank or too dark (${pixelStats.litPixels || 0}/${pixelStats.totalPixelsSampled || 0} lit samples)`);
    }
    if (report.consoleErrors.length) failures.push(`console errors: ${report.consoleErrors.map(item => item.text).join('; ')}`);
    if (report.exceptions.length) failures.push(`runtime exceptions: ${report.exceptions.join('; ')}`);
    if (report.failedRequests.length) failures.push(`failed requests: ${JSON.stringify(report.failedRequests.slice(0, 5))}`);

    if (failures.length) {
      report.ok = false;
      report.failures = failures;
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.error(JSON.stringify(report, null, 2));
      process.exitCode = 1;
    } else {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(JSON.stringify(report, null, 2));
    }
  } finally {
    if (cdp) cdp.close();
    if (!chrome.killed) chrome.kill('SIGTERM');
    await new Promise(resolveExit => {
      const timer = setTimeout(resolveExit, 1000);
      chrome.once('exit', () => {
        clearTimeout(timer);
        resolveExit();
      });
    });
    server.close();
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

main().catch(error => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
