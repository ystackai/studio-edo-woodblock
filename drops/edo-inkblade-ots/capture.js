const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

async function safeEvaluate(page, fn, label) {
  try {
    await page.evaluate(fn);
  } catch (err) {
    console.warn(`  Warning during ${label}: ${err.message}`);
  }
}

async function capture(step, phase, delayMs = 500) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const htmlPath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Step 1: Character select screenshot
  if (step >= 1) {
    await page.waitForTimeout(200);
    await safeEvaluate(page, () => {
      if (typeof resize === 'function') resize();
      if (typeof loop === 'function') {
        last = 16;
        loop(16);
      } else if (typeof draw === 'function') {
        draw();
      }
    }, 'step-1 render');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `01-character-select.jpg`), fullPage: false });
    console.log('Captured: 01-character-select');
  }

  // Step 2: Select hero and capture mid-journey
  if (step >= 2) {
    await safeEvaluate(page, () => {
      const cards = document.querySelectorAll('.card');
      if (cards.length > 0) cards[0].click();
    }, 'step-2 hero click');
    await page.waitForTimeout(300);
    await safeEvaluate(page, () => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined') {
        player.z = 150;
        player.heading = 0;
        player.x = 0;
        player.mx = 0;
        player.mz = 1.8;
      }
      for (let i = 0; i < 60; i++) {
        if (typeof step === 'function' && typeof draw === 'function') {
          step(1);
          draw();
        } else if (typeof loop === 'function') {
          last = 16 + i * 16;
          loop(16 + i * 16);
        }
      }
    }, 'step-2 journey render');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `02-mid-journey.jpg`), fullPage: false });
    console.log('Captured: 02-mid-journey');
  }

  // Step 3: Paint + combat scene
  if (step >= 3) {
    await safeEvaluate(page, () => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined') {
        player.z = 450;
        if (typeof paint === 'function') {
          for (let i = 0; i < 3; i++) {
            player.x = -30 + i * 30;
            player.z = 450 + i * 20;
            paint();
          }
        }
      }
      for (let i = 0; i < 60; i++) {
        if (typeof step === 'function' && typeof draw === 'function') {
          step(1);
          draw();
        } else if (typeof loop === 'function') {
          last = 16 + i * 16;
          loop(16 + i * 16);
        }
      }
    }, 'step-3 paint render');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `03-paint-combat.jpg`), fullPage: false });
    console.log('Captured: 03-paint-combat');
  }

  // Step 4: Combat with enemy
  if (step >= 4) {
    await safeEvaluate(page, () => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined' && typeof enemies !== 'undefined') {
        player.z = 700;
        player.x = 0;
        if (enemies[0]) {
          enemies[0].x = -20;
          enemies[0].z = 750;
        }
        if (typeof slash === 'function') slash();
      }
      for (let i = 0; i < 60; i++) {
        if (typeof step === 'function' && typeof draw === 'function') {
          step(1);
          draw();
        } else if (typeof loop === 'function') {
          last = 16 + i * 16;
          loop(16 + i * 16);
        }
      }
    }, 'step-4 combat render');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `04-combat-duel.jpg`), fullPage: false });
    console.log('Captured: 04-combat-duel');
  }

  // Step 5: Ganryu / victory
  if (step >= 5) {
    await safeEvaluate(page, () => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined') {
        player.z = 1000;
        if (typeof paint === 'function') {
          for (let i = 0; i < 5; i++) paint();
        }
        if (typeof updateQuest === 'function') updateQuest();
      }
      for (let i = 0; i < 90; i++) {
        if (typeof step === 'function' && typeof draw === 'function') {
          step(1);
          draw();
        } else if (typeof loop === 'function') {
          last = 16 + i * 16;
          loop(16 + i * 16);
        }
      }
    }, 'step-5 victory render');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, `05-ganryu-victory.jpg`), fullPage: false });
    console.log('Captured: 05-ganryu-victory');
  }

  await browser.close();
}

const step = parseInt(process.argv[2]) || 5;
capture(step).then(() => {
  console.log('Capture complete');
  process.exit(0);
}).catch(err => {
  console.error('Capture failed:', err.message);
  process.exit(1);
});
