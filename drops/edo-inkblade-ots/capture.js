const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

async function capture(step, phase, delayMs = 500) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const htmlPath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  // Step 1: Character select screenshot (before clicking a hero)
  if (step >= 1) {
    await page.waitForTimeout(200);
    // Force a render pass by calling resize + draw manually
    await page.evaluate(() => {
      if (typeof resize === 'function') resize();
      // Run one render frame with a fake timestamp
      if (typeof loop === 'function') {
        // loop needs last to be set - call with fake t
        last = 16;
        loop(16);
      } else if (typeof draw === 'function') {
        draw();
      }
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `01-character-select.jpg`), fullPage: false });
    console.log('Captured: 01-character-select');
  }
  
  // Step 2: Select Musashi and capture mid-journey
  if (step >= 2) {
    await page.evaluate(() => {
      // Click Musashi card to start game
      const cards = document.querySelectorAll('.card');
      if (cards.length > 0) cards[0].click();
    });
    await page.waitForTimeout(300);
    
    // Drive the game forward with fake timestamps to simulate movement
    await page.evaluate(() => {
      if (typeof resize === 'function') resize();
      // Simulate walking forward by setting player.z and forcing renders
      if (typeof player !== 'undefined') {
        player.z = 150;
        player.heading = 0;
        player.x = 0;
        player.mx = 0;
        player.mz = 1.8;
      }
      // Run multiple frames to get movement rendered
      for (let i = 0; i < 60; i++) {
        if (typeof step === 'function' && typeof draw === 'function') {
          step(1);
          draw();
        } else if (typeof loop === 'function') {
          last = 16 + i * 16;
          loop(16 + i * 16);
        }
      }
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `02-mid-journey.jpg`), fullPage: false });
    console.log('Captured: 02-mid-journey');
  }
  
  // Step 3: Paint some marks + combat scene
  if (step >= 3) {
    await page.evaluate(() => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined') {
        player.z = 450;
        // Paint a few marks
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
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `03-paint-combat.jpg`), fullPage: false });
    console.log('Captured: 03-paint-combat');
  }
  
  // Step 4: Combat with enemy
  if (step >= 4) {
    await page.evaluate(() => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined' && typeof enemies !== 'undefined') {
        player.z = 700;
        player.x = 0;
        // Position enemy close
        if (enemies[0]) {
          enemies[0].x = -20;
          enemies[0].z = 750;
        }
        // Simulate slash
        if (typeof slash === 'function') {
          slash();
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
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(screenshotDir, `04-combat-duel.jpg`), fullPage: false });
    console.log('Captured: 04-combat-duel');
  }
  
  // Step 5: Victory / Ganryu arrival
  if (step >= 5) {
    await page.evaluate(() => {
      if (typeof resize === 'function') resize();
      if (typeof player !== 'undefined') {
        // Trigger Ganryu arrival by setting player.z > 980 with painted marks
        player.z = 1000;
        // Add enough marks
        if (typeof paint === 'function') {
          for (let i = 0; i < 5; i++) {
            paint();
          }
        }
        // Trigger updateQuest to check for victory
        if (typeof updateQuest === 'function') {
          updateQuest();
        }
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
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotDir, `05-ganryu-victory.jpg`), fullPage: false });
    console.log('Captured: 05-ganryu-victory');
  }
  
  await browser.close();
}

// Parse command line: node capture.js [step] [phase]
const step = parseInt(process.argv[2]) || 5;
capture(step).then(() => {
  console.log('Capture complete');
  process.exit(0);
}).catch(err => {
  console.error('Capture failed:', err.message);
  process.exit(1);
});
