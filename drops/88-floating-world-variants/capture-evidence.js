#!/usr/bin/env node
/**
 * Capture desktop A/B/C and mobile evidence screenshots for the variants drop.
 * Run: node drops/88-floating-world-variants/capture-evidence.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const ENTRY = 'file://' + path.join(ROOT, 'drops/88-floating-world-variants/index.html');
const OUT = path.join(__dirname, 'evidence');

async function capture() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(ENTRY, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const shots = [
    { name: 'desktop-variant-a', variant: 'a', viewport: { width: 1280, height: 800 } },
    { name: 'desktop-variant-b', variant: 'b', viewport: { width: 1280, height: 800 } },
    { name: 'desktop-variant-c', variant: 'c', viewport: { width: 1280, height: 800 } },
    { name: 'mobile-variant-b', variant: 'b', viewport: { width: 390, height: 844 } },
  ];

  for (const shot of shots) {
    await page.setViewportSize(shot.viewport);
    await page.goto(ENTRY, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    await page.click(`[data-variant="${shot.variant}"]`);
    await page.waitForTimeout(1000);
    const outPath = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log('Wrote', outPath);
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});