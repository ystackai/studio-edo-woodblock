// Playwright regression test for Floating Score Begin/startGame interaction
//
// Verifies: clicking the 'Begin' button hides the start screen,
// sets timer to 60 and begins countdown (moves to 59).
//
// Run: node test-begin-button.js

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');

const PORT = 42871;

(async () => {
  const server = http.createServer((req, res) => {
    const filePath = req.url === '/' || req.url === '' 
      ? 'drops/floating-score/index.html'
      : req.url.replace(/^\//, '');
    try {
      const ext = filePath.split('.').pop().toLowerCase();
      const types = { 'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } catch (e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise(r => server.listen(PORT, r));
  const URL = `http://localhost:${PORT}/`;

  const browser = await chromium.launch({ 
    executablePath: '/usr/bin/chromium',
    headless: true 
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.getElementById('start-screen') !== null);

  // Verify start screen is visible
  const startScreenHidden = await page.evaluate(() => 
    document.getElementById('start-screen').classList.contains('hidden')
  );
  if (startScreenHidden) {
    throw new Error('Start screen should be visible initially');
  }
  console.log('PASS: Start screen is visible');

  // Verify timer shows 60
  const initialTimer = await page.evaluate(() => 
    document.getElementById('timer-seconds').textContent
  );
  if (initialTimer !== '60') {
    throw new Error(`Timer should show 60 initially, got "${initialTimer}"`);
  }
  console.log('PASS: Timer shows 60 initially');

  // Click Begin button
  console.log('Clicking #start-btn...');
  await page.click('#start-btn');
  
  // Wait for transition + timer start (400ms fade-out + 100ms buffer)
  await page.waitForTimeout(600);

  // Verify start screen is now hidden (class added after 400ms timeout)
  const hiddenAfter = await page.evaluate(() => 
    document.getElementById('start-screen').classList.contains('hidden')
  );
  if (!hiddenAfter) {
    throw new Error('Start screen should be hidden after clicking Begin');
  }
  console.log('PASS: Start screen hidden after clicking Begin');
  
  // Wait another second for timer to tick to 59
  await page.waitForTimeout(1100);

  // Verify timer is counting down (should be 59 or less)
  const timerVal = await page.evaluate(() => {
    const t = document.getElementById('timer-seconds').textContent;
    return parseInt(t, 10);
  });
  if (timerVal >= 60 || timerVal < 1) {
    throw new Error(`Timer should count down (59 or less), got ${timerVal}`);
  }
  console.log(`PASS: Timer counting down (${timerVal}s)`);

  // Verify gameRunning flag is set
  const gameRunning = await page.evaluate(() => typeof gameRunning !== 'undefined' ? gameRunning : 'undefined');
  if (gameRunning !== true) {
    throw new Error(`gameRunning should be true, got ${gameRunning}`);
  }
  console.log('PASS: gameRunning flag is set');

  console.log('\n✅ All regression tests passed.');
  await browser.close();
  server.close();
  process.exit(0);
})().catch(err => {
  console.error('\n❌ Test FAILED:', err.message || err);
  process.exit(1);
});
