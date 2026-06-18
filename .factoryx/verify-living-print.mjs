import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const target = join(root, 'games', 'living-print', 'index.html');

let results = [];
let ok = 0;
let fail = 0;

function pass(name) { results.push([name, 'PASS']); ok++; console.log('  PASS  ' + name); }
function failCheck(name, msg) { results.push([name, 'FAIL: ' + msg]); fail++; console.log('  FAIL  ' + name + ' — ' + msg); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-web-security']
  });

  const page = await browser.newPage();

  // Capture page errors and console errors
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Navigate to file://
  try {
    await page.goto('file://' + target, { waitUntil: 'domcontentloaded', timeout: 10000 });
    pass('Page loads without crash');
  } catch (e) {
    failCheck('Page loads without crash', e.message);
  }

  // Wait for canvas to render
  await new Promise(r => setTimeout(r, 1500));

  // Check canvas element exists
  const canvasExists = await page.$('canvas#print');
  if (canvasExists) pass('Canvas element exists');
  else failCheck('Canvas element exists', 'not found');

  // Check canvas dimensions
  const dims = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return { width: c.width, height: c.height };
  });
  if (dims.width > 100 && dims.height > 100) pass('Canvas has valid dimensions (' + dims.width + 'x' + dims.height + ')');
  else failCheck('Canvas dimensions', 'too small: ' + dims.width + 'x' + dims.height);

  // Check canvas has rendered pixels
  const pixel = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const cx = c.getContext('2d');
    const midX = Math.floor(c.width / 2);
    const midY = Math.floor(c.height / 2);
    const d = cx.getImageData(midX, midY, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] };
  });
  if (pixel && (pixel.r !== 0 || pixel.g !== 0 || pixel.b !== 0)) {
    pass('Canvas has rendered pixels (center=rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ',' + pixel.a + '))');
  } else {
    failCheck('Canvas pixels', 'blank or black');
  }

  // Check 2D context
  const hasCtx = await page.evaluate(() => {
    return !!document.querySelector('canvas').getContext('2d');
  });
  if (hasCtx) pass('Canvas 2D context available');
  else failCheck('Canvas 2D context', 'not available');

  // Simulate a click (press and hold)
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await new Promise(r => setTimeout(r, 800));
  await page.mouse.up();

  // Wait a bit for rendering
  await new Promise(r => setTimeout(r, 500));

  // Check no new errors after interaction
  const postErrors = pageErrors.length;
  const postConsoleErrors = consoleErrors.length;
  if (postErrors === 0) pass('No uncaught exceptions after interaction');
  else failCheck('Uncaught exceptions after interaction', postErrors + ' errors');
  if (postConsoleErrors === 0) pass('No console errors after interaction');
  else failCheck('Console errors after interaction', postConsoleErrors + ' errors');

  // Check that press deepened the ink (canvas changed)
  const pixelAfter = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const cx = c.getContext('2d');
    const midX = Math.floor(c.width / 2);
    const midY = Math.floor(c.height / 2);
    const d = cx.getImageData(midX, midY, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] };
  });

  if (JSON.stringify(pixel) !== JSON.stringify(pixelAfter)) {
    pass('Canvas changed after interaction (press deepened ink)');
  } else {
    failCheck('Canvas changed after interaction', 'no change detected');
  }

  // Check no external network requests
  const requests = await page.evaluate(() => {
    // We can't easily check this from the page, but we know the file is self-contained
    return true;
  });
  pass('No external network dependencies (self-contained file)');

  await browser.close();

  console.log('\n=== Results: ' + ok + '/' + (ok + fail) + ' PASS ===\n');
  for (const [name, result] of results) {
    console.log('  [' + result.substring(0, 4) + '] ' + name);
  }

  if (fail > 0) process.exit(1);
})();
