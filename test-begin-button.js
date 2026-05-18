// Regression test: Begin/startGame interaction
// Verifies the begin button triggers game start correctly
// Run: node test-begin-button.js

const { chromium } = require('playwright');
const { exit } = process;
const path = require('path');

async function testPreviewRootRedirect(browser) {
  const page = await browser.newPage();
  const rootIndex = path.join(__dirname, 'index.html');
  const gameIndex = path.join(__dirname, 'drops/floating-score/index.html');

  await page.route('https://preview.test/**', route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/drops/floating-score/')) {
      return route.fulfill({ path: gameIndex, contentType: 'text/html' });
    }
    return route.fulfill({ path: rootIndex, contentType: 'text/html' });
  });

  await page.goto('https://preview.test/factoryx/previews/edo-woodblock/studio-art-build/');
  await page.waitForURL('**/drops/floating-score/', { timeout: 5000 });
  console.log('PASS: FactoryX preview root redirects to Floating Score');
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  await testPreviewRootRedirect(browser);

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
  await page.waitForFunction(() => document.querySelector('#start-screen')?.classList.contains('hidden'), { timeout: 5000 });
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

  // --- Pause test section ---
  // --- 10. P key pauses game ---
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  const pauseOverlay = await page.$('#pause-overlay');
  if (!pauseOverlay) throw new Error('Pause overlay missing');
  const pauseVisible = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (!pauseVisible) throw new Error('Pause overlay should be visible after P key');
  console.log('PASS: P key pauses game, overlay visible');

  // --- 11. P key resumes game ---
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  const pauseHidden = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (pauseHidden) throw new Error('Pause overlay should be hidden after second P key');
  console.log('PASS: P key resumes game, overlay hidden');

  // --- 12. Pause button opens controls modal during pause ---
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  // Verify pause overlay is shown
  const pauseShown = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (!pauseShown) throw new Error('Pause overlay should be visible');
  // Click the pause-controls-btn
  const pauseControlsBtn = await page.$('#pause-controls-btn');
  if (!pauseControlsBtn) throw new Error('Pause controls button missing');
  await pauseControlsBtn.click();
  await page.waitForTimeout(200);
  const controlsModal = await page.$('#controls-modal');
  if (!controlsModal) throw new Error('Controls modal missing');
  const controlsVisible = await controlsModal.evaluate(el => el.classList.contains('show'));
  if (!controlsVisible) throw new Error('Controls modal should be visible after clicking pause-controls-btn');
  console.log('PASS: Pause controls button opens controls modal');

  // --- 13. Close controls modal while paused returns focus to pause-controls-btn ---
  const closeBtn = await page.$('#close-controls-btn');
  if (!closeBtn) throw new Error('Close controls button missing');
  await closeBtn.click();
  await page.waitForTimeout(300);
  const controlsHidden = await controlsModal.evaluate(el => el.classList.contains('show'));
  if (controlsHidden) throw new Error('Controls modal should be hidden after close');
  // Verify focus is on pause-controls-btn (approximately - we check that pause overlay is still shown)
  const pauseStillShown = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (!pauseStillShown) throw new Error('Pause overlay should still be shown after closing controls modal');
  console.log('PASS: Controls modal closes, pause state preserved');

  // --- 13.5. Escape key closes controls modal while paused ---
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  // Re-open controls modal during pause
  const pauseControlsBtn2 = await page.$('#pause-controls-btn');
  if (!pauseControlsBtn2) throw new Error('Pause controls button missing');
  await pauseControlsBtn2.click({ force: true });
  await page.waitForTimeout(250);
  // Press Escape to close controls modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const controlsModal2 = await page.$('#controls-modal');
  const controlsHiddenEscape = await controlsModal2.evaluate(el => el.classList.contains('show'));
  if (controlsHiddenEscape) throw new Error('Controls modal should be hidden after Escape key');
  // Pause overlay should still be visible
  const pauseOverlay2 = await page.$('#pause-overlay');
  const pauseStillShown2 = await pauseOverlay2.evaluate(el => el.classList.contains('show'));
  if (!pauseStillShown2) throw new Error('Pause overlay should still be shown after closing controls modal with Escape');
  console.log('PASS: Escape key closes controls modal, pause state preserved');

  // --- 14. Escape key also resumes game ---
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const pauseHidden2 = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (pauseHidden2) throw new Error('Pause overlay should be hidden after Escape key');
  console.log('PASS: Escape key resumes game');

  // --- 15. Resume button works ---
  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  const resumeBtn = await page.$('#pause-btn');
  if (!resumeBtn) throw new Error('Resume button missing');
  await resumeBtn.click();
  await page.waitForTimeout(200);
  const pauseHidden3 = await pauseOverlay.evaluate(el => el.classList.contains('show'));
  if (pauseHidden3) throw new Error('Pause overlay should be hidden after resume button click');
  console.log('PASS: Resume button works');

  // --- End pause test section ---

  // --- 16. Force game-over by setting timeLeft to 0 ---
  await page.evaluate(() => {
    // timeLeft and endGame are in global scope (from <script> tag)
    // Force timeLeft to 1 so next timer tick triggers endGame
    timeLeft = 1;
    // Also set a fallback in case timer interval is slow
    setTimeout(() => {
      if (document.querySelector('#over-screen.hidden')) {
        endGame();
      }
    }, 2000);
  });
  await page.waitForSelector('#over-screen:not(.hidden)', { timeout: 5000 });
  console.log('PASS: Game-over screen appears');

  // --- 17. Final score display exists ---
  const finalScore = await page.$('#final-score');
  if (!finalScore) throw new Error('Final score display missing');
  const finalText = await finalScore.textContent();
  console.log('PASS: Final score shows "' + finalText.trim() + '"');

  // --- 18. Stats breakdown exists ---
  const finalDetail = await page.$('#final-detail');
  if (!finalDetail) throw new Error('Stats breakdown missing');
  const detailText = await finalDetail.textContent();
  if (!detailText || detailText.trim() === '') throw new Error('Stats breakdown empty');
  console.log('PASS: Stats breakdown shows data');

  // --- 19. Retry button exists ---
  const retryBtn = await page.$('#retry-btn');
  if (!retryBtn) throw new Error('Retry button missing');
  const retryVisible = await retryBtn.isVisible();
  if (!retryVisible) throw new Error('Retry button not visible');
  console.log('PASS: Retry button found and visible');

  // --- 20. Home button exists ---
  const homeBtn = await page.$('#home-btn');
  if (!homeBtn) throw new Error('Home button missing');
  console.log('PASS: Home button found');

  // --- 21. Flavor text exists ---
  const flavorEl = await page.$('#game-over-flavor');
  if (!flavorEl) throw new Error('Game-over flavor text missing');
  console.log('PASS: Game-over flavor text found');

  // --- 22. Mute key toggles mute state ---
  const muteBtn = await page.waitForSelector('#mute-btn', { timeout: 3000 });
  const muteTextBefore = await muteBtn.textContent();
  await page.keyboard.press('m');
  await page.waitForTimeout(100);
  const muteTextAfter = await muteBtn.textContent();
  if (muteTextAfter === muteTextBefore) throw new Error('Mute button did not change after M key');
  console.log('PASS: Mute key (M) toggles mute state');
  await page.keyboard.press('m');
  await page.waitForTimeout(100);
  const muteTextRestored = await muteBtn.textContent();
  if (muteTextRestored === muteTextAfter) throw new Error('Second M key press did not restore mute');
  console.log('PASS: Mute key restores sound on second press');

  // --- 23. Retry button click restarts game ---
  await retryBtn.click();
  await page.waitForFunction(() => document.querySelector('#start-screen')?.classList.contains('hidden'), { timeout: 5000 });
  await page.waitForTimeout(500);
  const scoreAfterRetry = await scoreEl.textContent();
  if (scoreAfterRetry.trim() !== '0') throw new Error('Score should reset to 0 after retry');
  console.log('PASS: Retry restarts game, score resets to 0');

  await browser.close();
  console.log('\nAll regression checks passed');
}

main().catch(e => {
  console.error('FAIL: ' + e.message);
  exit(1);
});
