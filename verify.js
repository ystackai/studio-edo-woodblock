// Verification script for studio-edo-woodblock drops
// Run: node verify.js

const fs = require('fs');
const path = require('path');

const errors = [];

function check(filePath, ...checks) {
  if (!fs.existsSync(filePath)) {
    errors.push(`MISSING: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  checks.forEach(({ name, test }) => {
    if (!test(content)) {
      errors.push(`FAIL: ${filePath} — ${name}`);
    }
  });
}

// Core drop — Ukiyo-e Printer
check('drops/ukiyo-e-printer/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains block buttons', test: c => c.includes('block-btn') },
  { name: 'contains all 4 color blocks', test: c => (c.match(/block-btn/g) || []).length >= 4 },
  { name: 'contains key block label', test: c => c.includes('key') },
  { name: 'contains red block label', test: c => c.includes('red') },
  { name: 'contains blue block label', test: c => c.includes('blue') },
);

// Core drop — Floating World
check('drops/floating-world/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains seasonal palette', test: c => c.includes('season') },
  { name: 'contains keyboard handler', test: c => c.includes('keydown') },
  { name: 'contains pointer position tracking', test: c => c.includes('pointerX') },
);

// New drop — Wind Impressions
check('drops/wind-impressions/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains palette-bar', test: c => c.includes('palette-bar') },
  { name: 'contains seasonal palettes', test: c => c.includes('seasons') },
  { name: 'contains keyboard support', test: c => c.includes('keydown') },
  { name: 'contains pointer drawing', test: c => c.includes('addStroke') },
  { name: 'contains fade/ephemeral effect', test: c => c.includes('maxLife') && c.includes('fade') },
  { name: 'contains clear button', test: c => c.includes('clear-btn') },
  { name: 'contains title-area', test: c => c.includes('Wind Impressions') },
);

// Studio config check
check('studio.json',
  { name: 'studio.json is valid JSON', test: c => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'studio contains ukiyo-e-printer entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'ukiyo-e-printer') },
  { name: 'studio contains floating-world entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'floating-world') },
);

// Asset manifest check
check('.ystack/current/asset-manifest.json',
  { name: 'asset-manifest is valid JSON', test: c => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'contains wind-impressions', test: c => JSON.parse(c).assets.some(a => a.slug === 'wind-impressions') },
  { name: 'contains ukiyo-e-printer', test: c => JSON.parse(c).assets.some(a => a.slug === 'ukiyo-e-printer') },
  { name: 'contains floating-world', test: c => JSON.parse(c).assets.some(a => a.slug === 'floating-world') },
);

// Drops index check
check('drops/index.html',
  { name: 'drops index exists', test: () => true },
  { name: 'drops index has studio slug', test: c => c.includes('edo-woodblock') },
);

// Games index redirect check
check('games/index.html',
  { name: 'games/index.html redirects to drops', test: c => c.includes('drops') },
);

// Output
if (errors.length === 0) {
  console.log('✅ All verifications passed.');
  process.exit(0);
} else {
  console.log(`❌ ${errors.length} verification(s) failed:\n`);
  errors.forEach(e => console.log('  ' + e));
  process.exit(1);
}
