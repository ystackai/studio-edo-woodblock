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
check('games/ukiyo-e-printer/index.html',
   { name: 'contains canvas element', test: c => c.includes('<canvas') },
   { name: 'contains baren hold mechanic', test: c => c.includes('isHolding') },
   { name: 'contains ink stroke drawing', test: c => c.includes('strokePts') },
   { name: 'contains paper saturation mechanic', test: c => c.includes('saturationLevel') },
   { name: 'contains ambient audio init', test: c => c.includes('AudioContext') },
   { name: 'contains sound toggle', test: c => c.includes('soundBtn') },
   { name: 'contains finish with seal stamp', test: c => c.includes('印') },
    { name: 'contains mist layers', test: c => c.includes('mist') },
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


// New drop — Floating Score (catch game with progression)
check('drops/floating-score/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains score display', test: c => c.includes('score-display') },
  { name: 'contains level display', test: c => c.includes('level-display') },
  { name: 'contains streak mechanic', test: c => c.includes('streak') },
  { name: 'contains timer mechanic', test: c => c.includes('timer') && c.includes('timeLeft') },
  { name: 'contains start screen', test: c => c.includes('start-screen') },
  { name: 'contains game over screen', test: c => c.includes('over-screen') },
  { name: 'contains high score persistence', test: c => c.includes('localStorage') && c.includes('floating-score-hs') },
  { name: 'contains keyboard support', test: c => c.includes('keydown') },
  { name: 'contains touch handler', test: c => c.includes('touchstart') },
  { name: 'contains animation loop', test: c => c.includes('requestAnimationFrame') },
  { name: 'contains level progression', test: c => c.includes('level') && c.includes('score') },
  { name: 'contains ukiyo-e element drawing', test: c => c.includes('drawWave') || c.includes('drawBlossom') || c.includes('drawMountain') },
);

// Studio config check

// New drop — Floating Moment
check('drops/floating-moment/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains flower/ukiyo-e bloom drawing', test: c => c.includes('createBloom') },
  { name: 'contains keyboard palette switching', test: c => c.includes('keydown') && c.includes('flowerPalette') && c.includes('parseInt(key)') },
  { name: 'contains scatter functionality', test: c => c.includes('scatter') },
  { name: 'contains fade ability', test: c => c.includes('fade') },
  { name: 'contains touch event handler', test: c => c.includes('touchstart') },
  { name: 'contains animation loop', test: c => c.includes('requestAnimationFrame') },
);

check('studio.json',
  { name: 'studio.json is valid JSON', test: c => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'studio contains ukiyo-e-printer entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'ukiyo-e-printer') },
  { name: 'studio contains floating-world entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'floating-world') },
  { name: 'studio contains floating-moment entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'floating-moment') },
  { name: 'studio contains floating-score entry', test: c => JSON.parse(c).games.shipped.some(g => g.slug === 'floating-score') },
);

// Asset manifest check
check('.ystack/current/asset-manifest.json',
  { name: 'asset-manifest is valid JSON', test: c => { try { JSON.parse(c); return true; } catch { return false; } } },
  { name: 'contains wind-impressions', test: c => JSON.parse(c).assets.some(a => a.slug === 'wind-impressions') },
  { name: 'contains ukiyo-e-printer', test: c => JSON.parse(c).assets.some(a => a.slug === 'ukiyo-e-printer') },
  { name: 'contains floating-world', test: c => JSON.parse(c).assets.some(a => a.slug === 'floating-world') },
  { name: 'contains floating-moment', test: c => JSON.parse(c).assets.some(a => a.slug === 'floating-moment') },
  { name: 'contains floating-score', test: c => JSON.parse(c).assets.some(a => a.slug === 'floating-score') },

);

// Drops index check
check('drops/index.html',
  { name: 'drops index exists', test: () => true },
  { name: 'drops index has studio slug', test: c => c.includes('edo-woodblock') },
  { name: 'drops index lists floating-score', test: c => c.includes('floating-score') },
);

// Games index redirect check
check('games/index.html',
  { name: 'games/index.html redirects to floating-score', test: c => c.includes('floating-score') },
);

// --- Regression test: Begin/startGame interaction ---
var execSync = null;
try {
  execSync = require("child_process").execSync;
} catch (e) {}
if (execSync) {
  try {
    execSync("node test-begin-button.js", { timeout: 10000 });
    console.log("PASS: Begin/startGame regression test passes");
  } catch (e) {
    errors.push("FAIL: test-begin-button.js - " + (e.stderr || e.message));
  }
}

// --- Floating Score polish checks ---
check('drops/floating-score/index.html',
  { name: 'has Web Audio API (playTone)', test: c => c.includes('playTone') },
  { name: 'has audio feedback (playCatch)', test: c => c.includes('playCatch') },
  { name: 'has aria-label on canvas', test: c => c.includes('aria-label') },
  { name: 'has aria-label on buttons', test: c => c.includes('aria-label=') },
  { name: 'has controls hint', test: c => c.includes('controls-hint') },
  { name: 'has stat-row breakdown', test: c => c.includes('stat-row') },
  { name: 'has relative home URL', test: c => c.includes('../../drops/') },
  { name: 'has timer-seconds display', test: c => c.includes('timer-seconds') },
  { name: 'has playStreak audio', test: c => c.includes('playStreak') },
  { name: 'has level announcement element', test: c => c.includes('level-announce') },
  { name: 'has streak unlock element', test: c => c.includes('streak-unlock') },
);
// --- Floating Score UX polish (round 3) ---
check('drops/floating-score/index.html',
  { name: 'has mute toggle button', test: c => c.includes('mute-btn') },
  { name: 'has pause overlay', test: c => c.includes('pause-overlay') },
  { name: 'has togglePause function', test: c => c.includes('togglePause') },
  { name: 'has toggleMute function', test: c => c.includes('toggleMute') },
  { name: 'has audioMuted flag', test: c => c.includes('audioMuted') },
  { name: 'has element legend', test: c => c.includes('element-legend') },
  { name: 'has pause keyboard handler', test: c => c.includes("e.key === 'p'") || c.includes('Escape') },
);

// --- Kawanakajima 3D extension (this Work Order) ---
check('games/94-kawanakajima/index.html',
  { name: 'contains canvas element', test: c => c.includes('<canvas') },
  { name: 'contains 3D WebGL context', test: c => c.includes('getContext') && c.includes('webgl') },
  { name: 'references GLB models dir', test: c => c.includes('assets/models/') && c.includes('.glb') },
  { name: 'exposes 3D verification state', test: c => c.includes('__KAWANAKAJIMA_3D_STATE') },
  { name: 'has orbit / instant controls', test: c => c.includes('THE INSTANT') || c.includes('instantBtn') },
);
(() => {
  const fs = require('fs');
  const mdir = 'games/94-kawanakajima/assets/models';
  if (!fs.existsSync(mdir)) { errors.push('MISSING: ' + mdir); return; }
  const glbs = fs.readdirSync(mdir).filter(f => f.endsWith('.glb'));
  if (glbs.length < 20) errors.push('FAIL: kawanakajima models — expected at least 20 GLBs, got ' + glbs.length);
  else console.log('PASS: ' + glbs.length + ' GLB models present for kawanakajima (20 samurai + props)');
  glbs.forEach(f => {
    const b = fs.readFileSync(mdir + '/' + f);
    if (!b.slice(0,4).toString('ascii').startsWith('glTF')) errors.push('FAIL: not glTF: ' + f);
  });
})();

// Output
if (errors.length === 0) {
  console.log("All verifications passed.");
  process.exit(0);
} else {
  console.log(`${errors.length} verification(s) failed:
`);
  errors.forEach(e => console.log("  " + e));
  process.exit(1);
}
