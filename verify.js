// Verification script for Ukiyo-e Printer drop
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

// Core drop check
check('drops/ukiyo-e-printer/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains block buttons', test: c => c.includes('block-btn') },
  { name: 'contains all 4 color blocks', test: c => (c.match(/block-btn/g) || []).length >= 4 },
  { name: 'contains key block label', test: c => c.includes('key') },
  { name: 'contains red block label', test: c => c.includes('red') },
  { name: 'contains blue block label', test: c => c.includes('blue') },
  { name: 'contains yellow block label', test: c => c.includes('yellow') },
  { name: 'has touch event handling', test: c => c.includes('touchstart') },
  { name: 'has keyboard support', test: c => c.includes('keydown') },
  { name: 'has reset functionality', test: c => c.includes('reset') },
  { name: 'has completion state', test: c => c.includes('complete') || c.includes('Completion') },
  { name: 'has ukiyo-e drawing code', test: c => c.includes('drawScene') },
  { name: 'has stamp animation', test: c => c.includes('stampAnimating') || c.includes('animateStamp') },
  { name: 'viewport meta set', test: c => c.includes('viewport') && c.includes('user-scalable=no') },
  { name: 'status/progress UI present', test: c => c.includes('status-text') && c.includes('progress-fill') },
  { name: 'has hint area', test: c => c.includes('hint-area') },
);

// Floating World drop check (existing, should still work)
check('drops/floating-world/index.html',
  { name: 'Floating World still exists', test: () => true },
  { name: 'contains canvas', test: c => c.includes('<canvas') },
  { name: 'has seasonal interaction', test: c => c.includes('season') || c.includes('Season') },
  { name: 'has drag interaction', test: c => c.includes('drag') || c.includes('mousedown') || c.includes('mousemove') },
);

// Studio config check
check('studio.json',
  { name: 'studio.json is valid JSON', test: c => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'studio contains ukiyo-e-printer entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'ukiyo-e-printer') },
  { name: 'studio contains floating-world entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'floating-world') },
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
