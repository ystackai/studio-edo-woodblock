'use strict';

/* Q3 Blocks — Edo Woodblock Stacker
 * This should feel like carefully placing carved woodblocks one at a time
 * onto a precarious stack in a quiet workshop — each block swings into
 * place with weight, the tower groans as it grows taller, and one wrong
 * placement sends everything tumbling with a satisfying crash.
 */

var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');

// --- Constants ---
var W = 480, H = 720;
canvas.width = W;
canvas.height = H;

// Scale canvas to fit the window while keeping aspect ratio
function resizeCanvas() {
  var sw = window.innerWidth;
  var sh = window.innerHeight;
  var scale = Math.min(sw / W, sh / H);
  canvas.style.width = (W * scale) + 'px';
  canvas.style.height = (H * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Colors (warm woodblock palette) ---
var PALETTE = {
  bg: '#1a1410',
  bgLight: '#2a2018',
  wood1: '#8b5e3c',
  wood2: '#a6724a',
  wood3: '#6d4528',
  woodDark: '#4a2e18',
  accent: '#c8944a',
  text: '#f0e6d3',
  textDim: '#9a8a72',
  danger: '#b33a2a',
  success: '#4a8b3c',
  grain: '#5a381c',
  paper: '#f5edd8'
};

// --- Game State ---
var BLOCK_H = 40;
var BLOCK_W = 120;
var SWING_SPEED = 180; // pixels per second
var SWING_RANGE = 160; // half-width of swing
var TOLERANCE = 35; // px of overhang before block slides off
var GRAVITY = 600; // pixels/s^2 for falling blocks
var CENTER_X = W / 2;
var GROUND_Y = H - 40;

var state = 'title'; // title | playing | ended
var score = 0;
var bestScore = 0;
var placedBlocks = []; // stable blocks on the stack
var fallingBlocks = []; // blocks that fell off
var activeBlock = null; // the swinging block
var swingT = 0; // swing time 0..2pi
var shakeAmount = 0;
var fallTimer = 0; // countdown after collapse before showing debrief
var collapseStarted = false;

// --- Input Setup ---
FoundryInput.install(canvas, {
  actions: { drop: ['Space', 'KeyS'], restart: ['KeyR'] }
});

// --- Block helpers ---
function spawnBlock() {
  var baseX = CENTER_X;
  if (placedBlocks.length > 0) {
    baseX = placedBlocks[placedBlocks.length - 1].x + placedBlocks[placedBlocks.length - 1].w / 2;
  }
  activeBlock = {
    x: CENTER_X,
    y: placedBlocks.length === 0 ? GROUND_Y - BLOCK_H : placedBlocks[placedBlocks.length - 1].y - BLOCK_H,
    w: Math.max(60, BLOCK_W - placedBlocks.length * 3),
    h: BLOCK_H,
    vx: 0,
    vy: 0,
    stable: false,
    hue: placedBlocks.length % 6,
    landed: false
  };
  swingT = 0;
}

function dropBlock() {
  if (!activeBlock || activeBlock.stable) return;
  activeBlock.stable = true;
  activeBlock.vx = 0;
  activeBlock.vy = 0;
  placedBlocks.push(activeBlock);
  score = placedBlocks.length;
  if (score > bestScore) bestScore = score;

  // Check stability: compare to block below
  if (placedBlocks.length >= 2) {
    var top = placedBlocks[placedBlocks.length - 1];
    var below = placedBlocks[placedBlocks.length - 2];
    var overhang = Math.abs((top.x + top.w / 2) - (below.x + below.w / 2));
    if (overhang > TOLERANCE + below.w * 0.3) {
      // Block is too far off — it slides!
      top.stable = false;
      top.vy = 0;
      top.vx = (top.x + top.w / 2 > below.x + below.w / 2) ? 100 : -100;
      fallingBlocks.push(top);
      placedBlocks.pop();

      // Cascade: check if remaining blocks are stable
      startCollapse();
      return;
    }
  }

  // Small shake for placement feel
  shakeAmount = 2;

  // Spawn next block
  spawnBlock();
}

function startCollapse() {
  collapseStarted = true;
  fallTimer = 2.5;

  // Make all remaining placed blocks fall
  for (var i = 0; i < placedBlocks.length; i++) {
    var b = placedBlocks[i];
    b.stable = false;
    b.vy = -50 - Math.random() * 100;
    b.vx = (Math.random() - 0.5) * 200;
    fallingBlocks.push(b);
  }
  placedBlocks = [];

  // Bigger shake
  shakeAmount = 8;
}

// --- Physics Update ---
function update(dt) {
  if (state === 'title') {
    if (FoundryInput.consume('drop')) {
      startGame();
    }
    return;
  }

  if (state === 'ended') {
    // Update falling blocks
    updateFallingBlocks(dt);
    fallTimer -= dt;
    if (fallTimer <= 0) {
      state = 'debrief';
    }
    if (FoundryInput.consume('restart')) {
      startGame();
    }
    return;
  }

  // Playing state
  // Swing the active block
  if (activeBlock && !activeBlock.stable) {
    swingT += dt * (2 + score * 0.08); // gets faster with more blocks
    activeBlock.x = CENTER_X + Math.sin(swingT) * SWING_RANGE - activeBlock.w / 2;
  }

  // Drop on input
  if (FoundryInput.consume('drop') && activeBlock && !activeBlock.stable) {
    dropBlock();
  }

  // Update falling blocks
  updateFallingBlocks(dt);

  // Shake decay
  if (shakeAmount > 0) shakeAmount = Math.max(0, shakeAmount - dt * 12);

  FoundryInput.update(dt);
}

function updateFallingBlocks(dt) {
  for (var i = 0; i < fallingBlocks.length; i++) {
    var b = fallingBlocks[i];
    b.vy += GRAVITY * dt;
    b.y += b.vy * dt;
    b.x += b.vx * dt;
  }
  // Remove blocks that fell off screen
  fallingBlocks = fallingBlocks.filter(function(b) { return b.y < H + 200; });
}

function startGame() {
  state = 'playing';
  score = 0;
  placedBlocks = [];
  fallingBlocks = [];
  shakeAmount = 0;
  collapseStarted = false;
  fallTimer = 0;
  spawnBlock();
}

// --- Rendering ---
function drawBlock(b, alpha) {
  var woodColors = [PALETTE.wood1, PALETTE.wood2, PALETTE.wood3, PALETTE.accent, PALETTE.woodDark, '#7a5530'];
  var col = woodColors[b.hue % woodColors.length];

  var x = b.x;
  var y = b.y;
  if (alpha !== undefined) {
    // No interpolation needed for this game — blocks are discrete
  }

  // Block body
  ctx.fillStyle = col;
  ctx.fillRect(x, y, b.w, b.h);

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(x, y, b.w, 3);

  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y + b.h - 3, b.w, 3);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  for (var gy = y + 8; gy < y + b.h - 4; gy += 6) {
    ctx.beginPath();
    ctx.moveTo(x + 4, gy);
    ctx.lineTo(x + b.w - 4, gy + (Math.sin(gy * 0.3 + b.hue) * 2));
    ctx.stroke();
  }

  // Carved edge detail
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2, y + 2, b.w - 4, b.h - 4);

  // Small carved mark in center
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(x + b.w / 2 - 4, y + b.h / 2 - 3, 8, 6);
}

function render(alpha) {
  var sx = 0, sy = 0;
  if (shakeAmount > 0) {
    sx = (Math.random() - 0.5) * shakeAmount * 2;
    sy = (Math.random() - 0.5) * shakeAmount * 2;
  }

  ctx.save();
  ctx.translate(sx, sy);

  // Background
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle wood texture background
  ctx.fillStyle = PALETTE.bgLight;
  ctx.fillRect(20, 20, W - 40, H - 40);

  // Ground line
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, GROUND_Y);
  ctx.lineTo(W - 30, GROUND_Y);
  ctx.stroke();

  // Ground texture
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(30, GROUND_Y, W - 60, 4);

  if (state === 'title') {
    renderTitle();
  } else if (state === 'playing') {
    renderPlay();
  } else if (state === 'ended' || state === 'debrief') {
    renderPlay();
    renderDebrief();
  }

  ctx.restore();
}

function renderTitle() {
  // Title
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 36px "Hiragino Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Q3 BLOCKS', W / 2, H / 2 - 100);

  // Subtitle
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '16px "Hiragino Sans", sans-serif';
  ctx.fillText('Edo Woodblock Stacker', W / 2, H / 2 - 65);

  // Decorative block
  var demoBlock = { x: W / 2 - 60, y: H / 2 - 30, w: 120, h: 40, hue: 0 };
  drawBlock(demoBlock);

  // Instructions
  ctx.fillStyle = PALETTE.accent;
  ctx.font = '18px "Hiragino Sans", sans-serif';
  ctx.fillText('Press SPACE or TAP to start', W / 2, H / 2 + 50);

  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '14px "Hiragino Sans", sans-serif';
  ctx.fillText('Stack the woodblocks. One wrong move and —', W / 2, H / 2 + 90);
  ctx.fillText('the tower comes tumbling down.', W / 2, H / 2 + 110);

  if (bestScore > 0) {
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = '13px "Hiragino Sans", sans-serif';
    ctx.fillText('Best: ' + bestScore + ' blocks', W / 2, H / 2 + 150);
  }
}

function renderPlay() {
  // Camera offset: scroll up as tower grows
  var cameraY = 0;
  if (placedBlocks.length > 4) {
    cameraY = (placedBlocks.length - 4) * BLOCK_H;
  }

  ctx.save();
  ctx.translate(0, cameraY);

  // Draw placed blocks
  for (var i = 0; i < placedBlocks.length; i++) {
    drawBlock(placedBlocks[i]);
  }

  // Draw active (swinging) block
  if (activeBlock && !activeBlock.stable) {
    // Shadow below
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    var shadowY = activeBlock.y + activeBlock.h + 5;
    if (placedBlocks.length > 0) {
      shadowY = placedBlocks[placedBlocks.length - 1].y - 5;
    } else {
      shadowY = GROUND_Y - 5;
    }
    ctx.fillRect(activeBlock.x + 5, shadowY, activeBlock.w - 10, 3);

    drawBlock(activeBlock);

    // Dashed guide line showing drop position
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(200,148,74,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(activeBlock.x + activeBlock.w / 2, activeBlock.y + activeBlock.h);
    if (placedBlocks.length > 0) {
      ctx.lineTo(activeBlock.x + activeBlock.w / 2, placedBlocks[placedBlocks.length - 1].y);
    } else {
      ctx.lineTo(activeBlock.x + activeBlock.w / 2, GROUND_Y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw falling blocks
  for (var i = 0; i < fallingBlocks.length; i++) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.3, 1 - fallTimer * 0.3);
    drawBlock(fallingBlocks[i]);
    ctx.restore();
  }

  // Score display
  ctx.restore(); // undo camera offset

  // HUD
  ctx.fillStyle = 'rgba(26,20,16,0.8)';
  ctx.fillRect(0, 0, W, 44);

  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px "Hiragino Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(score, 15, 30);

  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px "Hiragino Sans", sans-serif';
  ctx.fillText('blocks', 50, 30);

  // Instructions at bottom
  ctx.textAlign = 'center';
  if (activeBlock && !activeBlock.stable) {
    ctx.fillStyle = PALETTE.accent;
    ctx.font = '13px "Hiragino Sans", sans-serif';
    ctx.fillText('SPACE / TAP to drop', W / 2, H - 12);
  }
}

function renderDebrief() {
  // Overlay
  ctx.fillStyle = 'rgba(26,20,16,0.85)';
  ctx.fillRect(0, 0, W, H);

  // Determine result classification
  var title, subtitle, color;
  if (score <= 0) {
    title = 'TOWER CRASHED';
    subtitle = 'Not a single block held.';
    color = PALETTE.danger;
  } else if (score <= 3) {
    title = 'UNSTABLE';
    subtitle = 'The stack could not hold. Try again.';
    color = '#b37a2a';
  } else if (score <= 7) {
    title = 'STEADY HAND';
    subtitle = 'A respectable tower. Keep building.';
    color = PALETTE.accent;
  } else if (score <= 12) {
    title = 'MASTER CARVER';
    subtitle = 'Remarkable precision. The workshop is impressed.';
    color = PALETTE.success;
  } else {
    title = 'WOODBLOCK SENSEI';
    subtitle = 'An extraordinary tower. The craft lives on.';
    color = '#5cb85c';
  }

  // Title
  ctx.fillStyle = color;
  ctx.font = 'bold 32px "Hiragino Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, H / 2 - 80);

  // Score
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 56px "Hiragino Sans", sans-serif';
  ctx.fillText(score, W / 2, H / 2 - 20);

  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '16px "Hiragino Sans", sans-serif';
  ctx.fillText('blocks placed', W / 2, H / 2 + 10);

  // Subtitle
  ctx.fillStyle = PALETTE.accent;
  ctx.font = '14px "Hiragino Sans", sans-serif';
  ctx.fillText(subtitle, W / 2, H / 2 + 50);

  // Best score
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px "Hiragino Sans", sans-serif';
  ctx.fillText('Best: ' + bestScore + ' blocks', W / 2, H / 2 + 85);

  // Replay prompt
  ctx.fillStyle = PALETTE.accent;
  ctx.font = '18px "Hiragino Sans", sans-serif';
  ctx.fillText('Press SPACE or TAP to build again', W / 2, H / 2 + 135);
}

// --- Audio (tiny WebAudio SFX, no external files) ---
var audioCtx = null;
var audioStarted = false;

function ensureAudio() {
  if (audioStarted) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioStarted = true;
  } catch(e) { /* audio not available */ }
}

function playDrop() {
  if (!audioCtx) return;
  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  } catch(e) {}
}

function playCollapse() {
  if (!audioCtx) return;
  try {
    // Noise burst for collapse
    var bufSize = audioCtx.sampleRate * 0.5;
    var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
    }
    var src = audioCtx.createBufferSource();
    var gain = audioCtx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    src.connect(gain).connect(audioCtx.destination);
    src.start();
  } catch(e) {}
}

function playScore() {
  if (!audioCtx) return;
  try {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.08);
    osc.frequency.setValueAtTime(780, audioCtx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
}

// --- Hook audio to input ---
var origDropBlock = dropBlock;
// Override dropBlock to add sound
var _dropBlock = dropBlock;
dropBlock = function() {
  ensureAudio();
  var prevLen = placedBlocks.length;
  _dropBlock();
  if (collapseStarted) {
    playCollapse();
  } else if (placedBlocks.length > prevLen) {
    playDrop();
    if (placedBlocks.length % 5 === 0) playScore();
  }
};

// Also hook start to ensure audio
var _startGame = startGame;
startGame = function() {
  ensureAudio();
  _startGame();
};

// --- Start the loop ---
FoundryLoop.start({
  update: function(dt) {
    update(dt);
  },
  render: function(alpha) {
    render(alpha);
  }
});
