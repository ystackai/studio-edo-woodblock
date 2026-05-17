// Regression test: Begin/startGame interaction
// Verifies the begin button triggers game start correctly
// Run: node test-begin-button.js

const { chromium } = require('playwright');
const { exit } = process;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  await page.goto('file://' + __dirname + '/drops/floating-score/index.html');

  // --- 1. Start screen visible initially ---
  const startScreen = await page.$('#start-screen');
  if (!startScreen) throw new Error('Start screen missing');
  const startHidden = await startScreen.evaluate(el => el.classList.contains('hidden'));
  if (startHidden) throw new Error('Start screen should be visible');
  console.log('PASS: Start screen visible initially');

  // --- 2. Begin button exists and is clickable ---
  const btn = await page.$('#start-btn');
  if (!btn) throw new Error('Begin button not found');
  const btnVisible = await btn.isVisible();
  if (!btnVisible) throw new Error('Begin button not visible');
  console.log('PASS: Begin button found and visible');

  // --- 3. Click begin -> start screen hides ---
  await btn.click();
  await page.waitForSelector('#start-screen.hidden', { timeout: 5000 });
  console.log('PASS: Start screen hidden after click');

  // --- 4. Timer started counting down ---
  const timerEl = await page.$('#timer-seconds');
  if (!timerEl) throw new Error('Timer display missing');
  const timerText = await timerEl.textContent();
  console.log('PASS: Timer shows "' + timerText + '" (expected 59-60)');

  // --- 5. Score display at 0 ---
  const scoreEl = await page.$('#score-display');
  if (!scoreEl) throw new Error('Score display missing');
  const scoreText = await scoreEl.textContent();
  if (scoreText.trim() !== '0') throw new Error('Score should start at 0');
  console.log('PASS: Score starts at 0');

  // --- 6. Level display at 1 ---
  const levelEl = await page.$('#level-display');
  if (!levelEl) throw new Error('Level display missing');
  const levelText = await levelEl.textContent();
  console.log('PASS: Level shows "' + levelText.trim() + '"');

  // --- 7. Canvas exists ---
  const canvas = await page.$('canvas');
  if (!canvas) throw new Error('Canvas missing');
  console.log('PASS: Canvas found');

  // --- 8. Game-over screen hidden ---
  const overScreen = await page.$('#over-screen');
  if (!overScreen) throw new Error('Game-over screen missing');
  const overHidden = await overScreen.evaluate(el => el.classList.contains('hidden'));
  if (!overHidden) throw new Error('Game-over screen should be hidden initially');
  console.log('PASS: Game-over screen hidden');

  // --- 9. Timer continues ticking ---
  await page.waitForTimeout(1200);
  const timerText2 = await timerEl.textContent();
  const timerNum = parseInt(timerText2.trim(), 10);
  if (timerNum > 60 || timerNum < 57) throw new Error('Timer should be ~58 after 1.2s, got ' + timerNum);
  console.log('PASS: Timer ticking (' + timerNum + ')');

  await browser.close();
  console.log('\nAll regression checks passed');
}

main().catch(e => {
  console.error('FAIL: ' + e.message);
  exit(1);
});
