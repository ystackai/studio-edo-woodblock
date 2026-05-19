// Edo Inkblade Character Sprite Sheet Generator
// Uses Playwright to render detailed ink-wash character sprites and export as PNG

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets', 'characters');

// Character definitions with palette and drawing function names
const CHARACTERS = {
  musashi: { w: 80, h: 120, frames: 4, palette: { body: '#3b2d1f', trim: '#d7b66f', sash: '#caa45f' } },
  koeda: { w: 80, h: 120, frames: 4, palette: { body: '#263840', trim: '#8fc7d6', sash: '#4a7a8a' } },
  yoshino: { w: 80, h: 120, frames: 4, palette: { body: '#3d2732', trim: '#d98986', sash: '#b86a6a' } },
  chaser: { w: 60, h: 100, frames: 4, palette: { body: '#4a2d28', trim: '#8f5a3f', belt: '#6a3a2a' } },
  prowler: { w: 60, h: 100, frames: 4, palette: { body: '#25392f', trim: '#9dbb7d', belt: '#4a7a38' } },
  duelist: { w: 60, h: 100, frames: 4, palette: { body: '#273048', trim: '#b2bad8', belt: '#6a7a9a' } },
  vagrant: { w: 60, h: 100, frames: 4, palette: { body: '#514233', trim: '#b89358', belt: '#8a6a48' } },
  monk: { w: 60, h: 100, frames: 4, palette: { body: '#3e4542', trim: '#a6b7a7', belt: '#6a7a6a' } },
  'mountain-ascetic': { w: 60, h: 100, frames: 4, palette: { body: '#4a3a28', trim: '#9a7a58', belt: '#6a5a3a' } },
  'ganryu-sentinel': { w: 60, h: 100, frames: 4, palette: { body: '#2a2038', trim: '#b2bad8', belt: '#6a7a9a' } },
  ganryu: { w: 80, h: 120, frames: 4, palette: { body: '#161616', trim: '#efe1c0', belt: '#caa45f' } }
};

const SPRITE_JS = `
function drawCharacter(ctx, key, frame, w, h, pal) {
  const cx = w / 2, cy = h;

  // Ink-wash shadow at feet
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(cx, cy - 4, 22, 6, 0, 0, 7); ctx.fill();

  if (key === 'musashi') drawMusashi(ctx, frame, w, h, pal);
  else if (key === 'koeda') drawKoeda(ctx, frame, w, h, pal);
  else if (key === 'yoshino') drawYoshino(ctx, frame, w, h, pal);
  else if (key === 'ganryu') drawGanryu(ctx, frame, w, h, pal);
  else if (key === 'chaser') drawChaser(ctx, frame, w, h, pal);
  else if (key === 'prowler') drawProwler(ctx, frame, w, h, pal);
  else if (key === 'duelist') drawDuelist(ctx, frame, w, h, pal);
  else if (key === 'vagrant') drawVagrant(ctx, frame, w, h, pal);
  else if (key === 'monk') drawMonk(ctx, frame, w, h, pal);
  else if (key === 'mountain-ascetic') drawMountainAscetic(ctx, frame, w, h, pal);
  else if (key === 'ganryu-sentinel') drawGanryuSentinel(ctx, frame, w, h, pal);
}

function inkBrush(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + Math.random() * 4 - 2, y + Math.random() * 4 - 2, x + size, y + size);
  ctx.stroke();
  ctx.restore();
}

function inkFill(ctx, pathFn, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  pathFn(ctx);
  ctx.fill();
  ctx.restore();
}

function drawMusashi(ctx, frame, w, h, pal) {
  const cx = w/2, ground = h;

  // Idle pose (frame 0) - standing, hand on katana
  if (frame === 0) {
    // Feet
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-2); c.lineTo(cx-16, ground-6); c.lineTo(cx-8, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 1);
    // Legs - hakama
    inkFill(ctx, (c) => { c.moveTo(cx-14, ground-18); c.quadraticCurveTo(cx-16, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    // Haori (short coat) body
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-52); c.quadraticCurveTo(cx, ground-60, cx+18, ground-52); c.quadraticCurveTo(cx+16, ground-18, cx-16, ground-18); c.closePath(); }, pal.body, 1);
    // Haori opening - white inner
    inkFill(ctx, (c) => { c.moveTo(cx-3, ground-50); c.lineTo(cx+3, ground-50); c.lineTo(cx-2, ground-18); c.lineTo(cx+2, ground-18); c.closePath(); }, pal.trim, 0.3);
    // Shoulders
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx-24, ground-44, cx-18, ground-42); c.lineTo(cx-16, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+20, ground-52); c.quadraticCurveTo(cx+24, ground-44, cx+18, ground-42); c.lineTo(cx+16, ground-50); c.closePath(); }, pal.body, 1);
    // Neck/head
    ctx.fillStyle = pal.trim; ctx.globalAlpha = 0.15;
    ctx.fillRect(cx-5, ground-56, 10, 6);
    ctx.globalAlpha = 1;
    // Kasa hat (wide conical hat)
    inkFill(ctx, (c) => { c.moveTo(cx-28, ground-56); c.quadraticCurveTo(cx-32, ground-62, cx-28, ground-68); c.quadraticCurveTo(cx, ground-80, cx+28, ground-68); c.quadraticCurveTo(cx+32, ground-62, cx+28, ground-56); c.closePath(); }, '#2a1a10', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-24, ground-68); c.quadraticCurveTo(cx, ground-80, cx+24, ground-68); c.lineTo(cx+20, ground-74); c.quadraticCurveTo(cx, ground-86, cx-20, ground-74); c.closePath(); }, '#1a1008', 1);
    // Face
    inkFill(ctx, (c) => { c.moveTo(cx-8, ground-56); c.quadraticCurveTo(cx, ground-62, cx+8, ground-56); c.quadraticCurveTo(cx+6, ground-50, cx-6, ground-50); c.closePath(); }, '#2a1f18', 1);
    // Topknot
    inkFill(ctx, (c) => { c.moveTo(cx-3, ground-62); c.lineTo(cx+3, ground-62); c.lineTo(cx, ground-72); c.closePath(); }, '#1a1512', 1);
    // Katana at left hip (vertical)
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-32); ctx.lineTo(cx-22, ground-18); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-22, ground-18); ctx.lineTo(cx-26, ground-6); ctx.stroke();
    // Sash
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-18, ground-20, 36, 4);
    ctx.globalAlpha = 1;
  }

  // Slash frame (frame 1) - sword drawn, sweeping
  else if (frame === 1) {
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-2); c.lineTo(cx-16, ground-6); c.lineTo(cx-8, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-14, ground-18); c.quadraticCurveTo(cx-16, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-52); c.quadraticCurveTo(cx, ground-60, cx+18, ground-52); c.quadraticCurveTo(cx+16, ground-18, cx-16, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx-24, ground-44, cx-18, ground-42); c.lineTo(cx-16, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+20, ground-52); c.quadraticCurveTo(cx+24, ground-44, cx+18, ground-42); c.lineTo(cx+16, ground-50); c.closePath(); }, pal.body, 1);
    // Hat
    inkFill(ctx, (c) => { c.moveTo(cx-28, ground-56); c.quadraticCurveTo(cx-32, ground-62, cx-28, ground-68); c.quadraticCurveTo(cx, ground-80, cx+28, ground-68); c.quadraticCurveTo(cx+32, ground-62, cx+28, ground-56); c.closePath(); }, '#2a1a10', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-24, ground-68); c.quadraticCurveTo(cx, ground-80, cx+24, ground-68); c.lineTo(cx+20, ground-74); c.quadraticCurveTo(cx, ground-86, cx-20, ground-74); c.closePath(); }, '#1a1008', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-8, ground-56); c.quadraticCurveTo(cx, ground-62, cx+8, ground-56); c.quadraticCurveTo(cx+6, ground-50, cx-6, ground-50); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-3, ground-62); c.lineTo(cx+3, ground-62); c.lineTo(cx, ground-72); c.closePath(); }, '#1a1512', 1);
    // Sash
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-18, ground-20, 36, 4);
    ctx.globalAlpha = 1;
    // Sword slash - diagonal sweep
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx+16, ground-40); ctx.lineTo(cx+50, ground-70); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx+50, ground-70); ctx.lineTo(cx+60, ground-85); ctx.stroke();
    // Slash arc effect
    ctx.strokeStyle = '#efe1c0'; ctx.lineWidth = 2; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(cx+10, ground-44); ctx.quadraticCurveTo(cx+40, ground-50, cx+58, ground-60); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Block frame (frame 2) - sword raised to block
  else if (frame === 2) {
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-2); c.lineTo(cx-16, ground-6); c.lineTo(cx-8, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-14, ground-18); c.quadraticCurveTo(cx-16, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-52); c.quadraticCurveTo(cx, ground-60, cx+18, ground-52); c.quadraticCurveTo(cx+16, ground-18, cx-16, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx-24, ground-44, cx-18, ground-42); c.lineTo(cx-16, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+20, ground-52); c.quadraticCurveTo(cx+24, ground-44, cx+18, ground-42); c.lineTo(cx+16, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-28, ground-56); c.quadraticCurveTo(cx-32, ground-62, cx-28, ground-68); c.quadraticCurveTo(cx, ground-80, cx+28, ground-68); c.quadraticCurveTo(cx+32, ground-62, cx+28, ground-56); c.closePath(); }, '#2a1a10', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-24, ground-68); c.quadraticCurveTo(cx, ground-80, cx+24, ground-68); c.lineTo(cx+20, ground-74); c.quadraticCurveTo(cx, ground-86, cx-20, ground-74); c.closePath(); }, '#1a1008', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-8, ground-56); c.quadraticCurveTo(cx, ground-62, cx+8, ground-56); c.quadraticCurveTo(cx+6, ground-50, cx-6, ground-50); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-3, ground-62); c.lineTo(cx+3, ground-62); c.lineTo(cx, ground-72); c.closePath(); }, '#1a1512', 1);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-18, ground-20, 36, 4);
    ctx.globalAlpha = 1;
    // Sword raised vertically to block
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx+16, ground-36); ctx.lineTo(cx+14, ground-62); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx+14, ground-62); ctx.lineTo(cx+10, ground-74); ctx.stroke();
    // Block flash
    ctx.fillStyle = '#d7b66f'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(cx+18, ground-54, 14, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Damage frame (frame 3) - staggered back
  else if (frame === 3) {
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-2); c.lineTo(cx-22, ground-6); c.lineTo(cx-14, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+4, ground-2); c.lineTo(cx, ground-6); c.lineTo(cx+8, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-18); c.quadraticCurveTo(cx-22, ground-6, cx-14, ground); c.lineTo(cx-16, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+6, ground-18); c.quadraticCurveTo(cx+10, ground-6, cx+4, ground); c.lineTo(cx+6, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-52); c.quadraticCurveTo(cx-4, ground-60, cx+14, ground-52); c.quadraticCurveTo(cx+12, ground-18, cx-20, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx-26, ground-44, cx-20, ground-42); c.lineTo(cx-18, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+14, ground-52); c.quadraticCurveTo(cx+18, ground-44, cx+14, ground-42); c.lineTo(cx+12, ground-50); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-28, ground-56); c.quadraticCurveTo(cx-32, ground-62, cx-28, ground-68); c.quadraticCurveTo(cx-4, ground-80, cx+24, ground-68); c.quadraticCurveTo(cx+28, ground-62, cx+24, ground-56); c.closePath(); }, '#2a1a10', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-24, ground-68); c.quadraticCurveTo(cx-4, ground-80, cx+20, ground-68); c.lineTo(cx+16, ground-74); c.quadraticCurveTo(cx-4, ground-86, cx-24, ground-74); c.closePath(); }, '#1a1008', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-8, ground-56); c.quadraticCurveTo(cx-4, ground-60, cx+4, ground-56); c.quadraticCurveTo(cx+2, ground-50, cx-10, ground-50); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-3, ground-62); c.lineTo(cx+3, ground-62); c.lineTo(cx, ground-72); c.closePath(); }, '#1a1512', 1);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-18, ground-20, 36, 4);
    ctx.globalAlpha = 1;
    // Stagger particle
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(cx+20, ground-50, 6, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawKoeda(ctx, frame, w, h, pal) {
  const cx = w/2, ground = h;
  
  if (frame === 0) {
    // Lean runner stance
    inkFill(ctx, (c) => { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-18); c.quadraticCurveTo(cx-14, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-16, ground-48); c.quadraticCurveTo(cx, ground-54, cx+16, ground-48); c.quadraticCurveTo(cx+14, ground-18, cx-14, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-48); c.quadraticCurveTo(cx-22, ground-42, cx-16, ground-40); c.lineTo(cx-14, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+18, ground-48); c.quadraticCurveTo(cx+22, ground-42, cx+16, ground-40); c.lineTo(cx+14, ground-46); c.closePath(); }, pal.body, 1);
    // Head
    inkFill(ctx, (c) => { c.moveTo(cx-7, ground-48); c.quadraticCurveTo(cx, ground-54, cx+7, ground-48); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, '#2a1f18', 1);
    // Hair (short, runner cut)
    inkFill(ctx, (c) => { c.moveTo(cx-6, ground-52); c.quadraticCurveTo(cx, ground-56, cx+6, ground-52); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 1);
    // Long scarf trailing
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-44); ctx.quadraticCurveTo(cx-28, ground-34, cx-34, ground-20);
    ctx.lineTo(cx-36, ground-14); ctx.stroke();
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 2; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(cx-18, ground-44); ctx.quadraticCurveTo(cx-30, ground-32, cx-36, ground-18);
    ctx.lineTo(cx-38, ground-12); ctx.stroke();
    ctx.globalAlpha = 1;
    // Ink brush at side
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+12, ground-30); ctx.lineTo(cx+18, ground-16); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx+18, ground-16); ctx.lineTo(cx+22, ground-8); ctx.stroke();
    // Sash
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
  }
  else if (frame === 1) { // Slash - arm sweep with brush
    inkFill(ctx, (c) => { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-18); c.quadraticCurveTo(cx-14, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-16, ground-48); c.quadraticCurveTo(cx, ground-54, cx+16, ground-48); c.quadraticCurveTo(cx+14, ground-18, cx-14, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-48); c.quadraticCurveTo(cx-22, ground-42, cx-16, ground-40); c.lineTo(cx-14, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+18, ground-48); c.quadraticCurveTo(cx+22, ground-42, cx+16, ground-40); c.lineTo(cx+14, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-7, ground-48); c.quadraticCurveTo(cx, ground-54, cx+7, ground-48); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-6, ground-52); c.quadraticCurveTo(cx, ground-56, cx+6, ground-52); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 1);
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-44); ctx.quadraticCurveTo(cx-28, ground-34, cx-34, ground-20); ctx.lineTo(cx-36, ground-14); ctx.stroke();
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 2; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(cx-18, ground-44); ctx.quadraticCurveTo(cx-30, ground-32, cx-36, ground-18); ctx.lineTo(cx-38, ground-12); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    // Brush slash sweep
    ctx.strokeStyle = '#8fc7d6'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(cx+16, ground-36); ctx.quadraticCurveTo(cx+40, ground-44, cx+60, ground-60); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+14, ground-36); ctx.lineTo(cx+40, ground-50); ctx.stroke();
  }
  else if (frame === 2) { // Block - arms crossed
    inkFill(ctx, (c) => { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-18); c.quadraticCurveTo(cx-14, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-16, ground-48); c.quadraticCurveTo(cx, ground-54, cx+16, ground-48); c.quadraticCurveTo(cx+14, ground-18, cx-14, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-48); c.quadraticCurveTo(cx-22, ground-42, cx-16, ground-40); c.lineTo(cx-14, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+18, ground-48); c.quadraticCurveTo(cx+22, ground-42, cx+16, ground-40); c.lineTo(cx+14, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-7, ground-48); c.quadraticCurveTo(cx, ground-54, cx+7, ground-48); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-6, ground-52); c.quadraticCurveTo(cx, ground-56, cx+6, ground-52); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 1);
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-44); ctx.quadraticCurveTo(cx-28, ground-34, cx-34, ground-20); ctx.lineTo(cx-36, ground-14); ctx.stroke();
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 2; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(cx-18, ground-44); ctx.quadraticCurveTo(cx-30, ground-32, cx-36, ground-18); ctx.lineTo(cx-38, ground-12); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    // Arms crossed block
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+6, ground-44); ctx.lineTo(cx-14, ground-52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-6, ground-44); ctx.lineTo(cx+14, ground-52); ctx.stroke();
    // Block flash
    ctx.fillStyle = '#8fc7d6'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(cx, ground-48, 16, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  else if (frame === 3) { // Damage - knocked back
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-2); c.lineTo(cx-22, ground-6); c.lineTo(cx-14, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+4, ground-2); c.lineTo(cx, ground-6); c.lineTo(cx+8, ground-6); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-18); c.quadraticCurveTo(cx-22, ground-6, cx-14, ground); c.lineTo(cx-16, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+6, ground-18); c.quadraticCurveTo(cx+10, ground-6, cx+4, ground); c.lineTo(cx+6, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-16, ground-48); c.quadraticCurveTo(cx-4, ground-54, cx+12, ground-48); c.quadraticCurveTo(cx+10, ground-18, cx-18, ground-18); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-48); c.quadraticCurveTo(cx-24, ground-42, cx-18, ground-40); c.lineTo(cx-16, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+12, ground-48); c.quadraticCurveTo(cx+16, ground-42, cx+12, ground-40); c.lineTo(cx+10, ground-46); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx-7, ground-48); c.quadraticCurveTo(cx-4, ground-52, cx+4, ground-48); c.quadraticCurveTo(cx+2, ground-42, cx-8, ground-42); c.closePath(); }, '#2a1f18', 1);
    inkFill(ctx, (c) => { c.moveTo(cx-6, ground-52); c.quadraticCurveTo(cx-4, ground-54, cx+4, ground-52); c.quadraticCurveTo(cx+2, ground-48, cx-6, ground-48); c.closePath(); }, '#1a1512', 1);
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-44); ctx.quadraticCurveTo(cx-28, ground-34, cx-34, ground-20); ctx.lineTo(cx-36, ground-14); ctx.stroke();
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(cx+14, ground-44, 5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Simplified versions for remaining characters to keep code manageable
function drawYoshino(ctx, frame, w, h, pal) { drawGenericHero(ctx, frame, w, h, pal, 'sage'); }
function drawGanryu(ctx, frame, w, h, pal) { drawBoss(ctx, frame, w, h, pal); }
function drawChaser(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'chaser'); }
function drawProwler(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'prowler'); }
function drawDuelist(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'duelist'); }
function drawVagrant(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'vagrant'); }
function drawMonk(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'monk'); }
function drawMountainAscetic(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'mountain-ascetic'); }
function drawGanryuSentinel(ctx, frame, w, h, pal) { drawGenericEnemy(ctx, frame, w, h, pal, 'ganryu-sentinel'); }

function drawGenericHero(ctx, frame, w, h, pal, type) {
  const cx = w/2, ground = h;
  // Yoshino - hooded sage with staff
  inkFill(ctx, (c) => { c.moveTo(cx-12, ground-2); c.lineTo(cx-16, ground-6); c.lineTo(cx-8, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-14, ground-18); c.quadraticCurveTo(cx-16, ground-6, cx-8, ground); c.lineTo(cx-10, ground-18); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+10, ground-18); c.quadraticCurveTo(cx+14, ground-6, cx+8, ground); c.lineTo(cx+10, ground-18); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx, ground-60, cx+20, ground-52); c.quadraticCurveTo(cx+18, ground-18, cx-18, ground-18); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-22, ground-52); c.quadraticCurveTo(cx-26, ground-44, cx-20, ground-42); c.lineTo(cx-18, ground-50); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+22, ground-52); c.quadraticCurveTo(cx+26, ground-44, cx+20, ground-42); c.lineTo(cx+18, ground-50); c.closePath(); }, pal.body, 1);
  // Hood
  inkFill(ctx, (c) => { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx, ground-60, cx+20, ground-52); c.lineTo(cx+18, ground-58); c.quadraticCurveTo(cx, ground-64, cx-18, ground-58); c.closePath(); }, '#2a1f14', 1);
  inkFill(ctx, (c) => { c.moveTo(cx-16, ground-58); c.quadraticCurveTo(cx, ground-64, cx+16, ground-58); c.lineTo(cx+14, ground-62); c.quadraticCurveTo(cx, ground-68, cx-14, ground-62); c.closePath(); }, '#1a1512', 1);
  // Face
  inkFill(ctx, (c) => { c.moveTo(cx-6, ground-52); c.quadraticCurveTo(cx, ground-58, cx+6, ground-52); c.quadraticCurveTo(cx+4, ground-46, cx-4, ground-46); c.closePath(); }, '#2a1f18', 1);
  // Staff
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx-18, ground-20); ctx.lineTo(cx-24, ground-2); ctx.stroke();
  if (frame === 1) { // slash
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(cx+6, ground-44); ctx.quadraticCurveTo(cx+40, ground-40, cx+60, ground-50); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Sash
  ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-18, ground-20, 36, 3);
  ctx.globalAlpha = 1;
}

function drawBoss(ctx, frame, w, h, pal) {
  const cx = w/2, ground = h;
  // Ganryu - imposing samurai, wider build, larger weapon
  inkFill(ctx, (c) => { c.moveTo(cx-18, ground-2); c.lineTo(cx-24, ground-6); c.lineTo(cx-12, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+18, ground-2); c.lineTo(cx+12, ground-6); c.lineTo(cx+24, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-20, ground-20); c.quadraticCurveTo(cx-24, ground-6, cx-12, ground); c.lineTo(cx-16, ground-20); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+20, ground-20); c.quadraticCurveTo(cx+24, ground-6, cx+12, ground); c.lineTo(cx+16, ground-20); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-22, ground-56); c.quadraticCurveTo(cx, ground-64, cx+22, ground-56); c.quadraticCurveTo(cx+20, ground-20, cx-20, ground-20); c.closePath(); }, '#1a1512', 1);
  inkFill(ctx, (c) => { c.moveTo(cx-24, ground-56); c.quadraticCurveTo(cx-30, ground-46, cx-22, ground-44); c.lineTo(cx-20, ground-54); c.closePath(); }, '#1a1512', 1);
  inkFill(ctx, (c) => { c.moveTo(cx+24, ground-56); c.quadraticCurveTo(cx+30, ground-46, cx+22, ground-44); c.lineTo(cx+20, ground-54); c.closePath(); }, '#1a1512', 1);
  // Wide hat
  inkFill(ctx, (c) => { c.moveTo(cx-36, ground-60); c.quadraticCurveTo(cx-40, ground-68, cx-36, ground-76); c.quadraticCurveTo(cx, ground-88, cx+36, ground-76); c.quadraticCurveTo(cx+40, ground-68, cx+36, ground-60); c.closePath(); }, '#0a0806', 1);
  inkFill(ctx, (c) => { c.moveTo(cx-32, ground-76); c.quadraticCurveTo(cx, ground-88, cx+32, ground-76); c.lineTo(cx+28, ground-82); c.quadraticCurveTo(cx, ground-94, cx-28, ground-82); c.closePath(); }, '#1a1008', 1);
  // Face
  inkFill(ctx, (c) => { c.moveTo(cx-10, ground-60); c.quadraticCurveTo(cx, ground-66, cx+10, ground-60); c.quadraticCurveTo(cx+8, ground-54, cx-8, ground-54); c.closePath(); }, '#1a1512', 1);
  // Topknot
  inkFill(ctx, (c) => { c.moveTo(cx-4, ground-68); c.lineTo(cx+4, ground-68); c.lineTo(cx, ground-80); c.closePath(); }, '#0a0806', 1);
  // Yoroi (armor) shoulder plates
  ctx.fillStyle = '#2a1f14'; ctx.globalAlpha = 0.15;
  ctx.fillRect(cx-24, ground-56, 10, 8);
  ctx.fillRect(cx+14, ground-56, 10, 8);
  ctx.globalAlpha = 1;
  // Large sword (nodachi)
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx-24, ground-34); ctx.lineTo(cx-36, ground-16); ctx.stroke();
  ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx-36, ground-16); ctx.lineTo(cx-44, ground-2); ctx.stroke();
  // Sash/belt
  ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-20, ground-20, 40, 4);
  ctx.globalAlpha = 1;
  
  if (frame === 3) {
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx+18, ground-50, 7, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawGenericEnemy(ctx, frame, w, h, pal, type) {
  const cx = w/2, ground = h;
  inkFill(ctx, (c) => { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-12, ground-16); c.quadraticCurveTo(cx-14, ground-6, cx-6, ground); c.lineTo(cx-8, ground-16); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+12, ground-16); c.quadraticCurveTo(cx+14, ground-6, cx+6, ground); c.lineTo(cx+8, ground-16); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-16, ground-44); c.quadraticCurveTo(cx, ground-50, cx+16, ground-44); c.quadraticCurveTo(cx+14, ground-16, cx-14, ground-16); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx-18, ground-44); c.quadraticCurveTo(cx-22, ground-38, cx-16, ground-36); c.lineTo(cx-14, ground-42); c.closePath(); }, pal.body, 1);
  inkFill(ctx, (c) => { c.moveTo(cx+18, ground-44); c.quadraticCurveTo(cx+22, ground-38, cx+16, ground-36); c.lineTo(cx+14, ground-42); c.closePath(); }, pal.body, 1);
  // Head
  inkFill(ctx, (c) => { c.moveTo(cx-6, ground-44); c.quadraticCurveTo(cx, ground-50, cx+6, ground-44); c.quadraticCurveTo(cx+4, ground-38, cx-4, ground-38); c.closePath(); }, '#1a1512', 1);
  
  if (type === 'chaser') {
    // Monk-like hat
    inkFill(ctx, (c) => { c.moveTo(cx-10, ground-48); c.quadraticCurveTo(cx, ground-54, cx+10, ground-48); c.lineTo(cx+8, ground-44); c.lineTo(cx-8, ground-44); c.closePath(); }, '#2a1f14', 1);
    // Staff
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-12, ground-28); ctx.lineTo(cx-16, ground-4); ctx.stroke();
  } else if (type === 'prowler') {
    // Bandit hat
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-48); c.quadraticCurveTo(cx, ground-56, cx+12, ground-48); c.lineTo(cx+10, ground-44); c.lineTo(cx-10, ground-44); c.closePath(); }, '#1a1512', 1);
    // Hatchet blade
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+12, ground-30); ctx.lineTo(cx+22, ground-16); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx+22, ground-16); ctx.lineTo(cx+26, ground-10); ctx.lineTo(cx+24, ground-8); ctx.stroke();
  } else if (type === 'duelist') {
    // Duelist headband
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.3;
    ctx.fillRect(cx-4, ground-44, 8, 3);
    ctx.globalAlpha = 1;
    // Long sword
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+10, ground-30); ctx.lineTo(cx+22, ground-14); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx+22, ground-14); ctx.lineTo(cx+28, ground-4); ctx.stroke();
  } else if (type === 'vagrant') {
    // Straw hat
    inkFill(ctx, (c) => { c.moveTo(cx-16, ground-48); c.quadraticCurveTo(cx, ground-56, cx+16, ground-48); c.lineTo(cx+14, ground-44); c.lineTo(cx-14, ground-44); c.closePath(); }, '#8a7a58', 0.6);
    // Simple sword
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-10, ground-28); ctx.lineTo(cx-18, ground-10); ctx.stroke();
  } else if (type === 'monk') {
    // Monk cowl
    inkFill(ctx, (c) => { c.moveTo(cx-8, ground-44); c.quadraticCurveTo(cx, ground-52, cx+8, ground-44); c.lineTo(cx+6, ground-48); c.quadraticCurveTo(cx, ground-56, cx-6, ground-48); c.closePath(); }, '#2a1f14', 1);
    // Naginata
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-16, ground-28); ctx.lineTo(cx-24, ground-6); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-24, ground-6); ctx.lineTo(cx-28, ground-2); ctx.stroke();
  } else if (type === 'mountain-ascetic') {
    // Wide mountain straw hat — larger than vagrant straw hat
    inkFill(ctx, (c) => { c.moveTo(cx-20, ground-50); c.quadraticCurveTo(cx, ground-60, cx+20, ground-50); c.lineTo(cx+18, ground-44); c.lineTo(cx-18, ground-44); c.closePath(); }, '#7a6a48', 0.6);
    inkFill(ctx, (c) => { c.moveTo(cx-18, ground-50); c.quadraticCurveTo(cx, ground-56, cx+18, ground-50); c.lineTo(cx+16, ground-48); c.lineTo(cx-16, ground-48); c.closePath(); }, '#8a7a58', 0.4);
    // Face — weathered mountain hermit
    inkFill(ctx, (c) => { c.moveTo(cx-5, ground-44); c.quadraticCurveTo(cx, ground-48, cx+5, ground-44); c.quadraticCurveTo(cx+3, ground-38, cx-3, ground-38); c.closePath(); }, '#4a3828', 1);
    // Rough robe body
    inkFill(ctx, (c) => { c.moveTo(cx-14, ground-16); c.quadraticCurveTo(cx-16, ground-4, cx-8, ground); c.lineTo(cx-10, ground-16); c.closePath(); }, pal.body, 1);
    inkFill(ctx, (c) => { c.moveTo(cx+14, ground-16); c.quadraticCurveTo(cx+16, ground-4, cx+8, ground); c.lineTo(cx+10, ground-16); c.closePath(); }, pal.body, 1);
    // Walking staff
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx-14, ground-28); ctx.lineTo(cx-20, ground-4); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-20, ground-4); ctx.lineTo(cx-24, ground-2); ctx.stroke();
    // Belt/sash
    ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-18, 28, 3);
    ctx.globalAlpha = 1;
  } else if (type === 'ganryu-sentinel') {
    // Samurai helmet (jingasa) — small formal hat
    inkFill(ctx, (c) => { c.moveTo(cx-12, ground-48); c.quadraticCurveTo(cx, ground-54, cx+12, ground-48); c.lineTo(cx+10, ground-44); c.lineTo(cx-10, ground-44); c.closePath(); }, '#1a1512', 1);
    // Crest/ridge on helmet
    ctx.strokeStyle = '#b2bad8'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(cx-6, ground-46); ctx.lineTo(cx+6, ground-46); ctx.stroke();
    ctx.globalAlpha = 1;
    // Face
    inkFill(ctx, (c) => { c.moveTo(cx-5, ground-44); c.quadraticCurveTo(cx, ground-48, cx+5, ground-44); c.quadraticCurveTo(cx+3, ground-38, cx-3, ground-38); c.closePath(); }, '#2a1f18', 1);
    // Armor shoulder plates (simple yoroi)
    ctx.fillStyle = '#2a1f14'; ctx.globalAlpha = 0.2;
    ctx.fillRect(cx-18, ground-44, 8, 6);
    ctx.fillRect(cx+10, ground-44, 8, 6);
    ctx.globalAlpha = 1;
    // Straight sword (wakizashi)
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx+10, ground-30); ctx.lineTo(cx+18, ground-12); ctx.stroke();
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx+18, ground-12); ctx.lineTo(cx+22, ground-4); ctx.stroke();
    // Belt
    ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-18, 28, 3);
    ctx.globalAlpha = 1;
  }
  // Belt
  ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-14, ground-18, 28, 3);
  ctx.globalAlpha = 1;
  if (frame === 3) {
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx+12, ground-40, 4, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
`;

async function generate() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(`<html><body><script>${SPRITE_JS}</script></body></html>`);

  for (const [key, def] of Object.entries(CHARACTERS)) {
    const sheetW = def.w * def.frames;
    const sheetH = def.h;
    const palJson = JSON.stringify(def.palette);

    // Build a function body by inlining the sprite JS code directly
    const genFn = new Function('args', `
      ${SPRITE_JS}
      const c = document.createElement('canvas');
      c.width = args.sheetW;
      c.height = args.sheetH;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f4ead8';
      ctx.fillRect(0, 0, args.sheetW, args.sheetH);
      
      for (let f = 0; f < args.def.frames; f++) {
        const cx = f * args.def.w;
        ctx.save();
        ctx.translate(cx, 0);
        for (let g = 0; g < 6; g++) {
          ctx.fillStyle = 'rgba(180,150,100,' + (0.02 + Math.random() * 0.04) + ')';
          ctx.fillRect(Math.random() * args.def.w, Math.random() * args.def.h, 2 + Math.random() * 4, 1);
        }
        const bg = ctx.createRadialGradient(args.def.w/2, args.def.h-10, 10, args.def.w/2, args.def.h-10, args.def.h * 0.6);
        bg.addColorStop(0, args.def.palette.trim + '30');
        bg.addColorStop(1, 'rgba(20,15,10,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, args.def.w, args.def.h);
        drawCharacter(ctx, args.key, f, args.def.w, args.def.h, args.def.palette);
        ctx.restore();
      }
      return c.toDataURL('image/png');
    `);
    const dataUrl = await page.evaluate(genFn, {key, def, sheetW, sheetH});
    
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(path.join(ASSETS_DIR, `${key}.png`), buffer);
    console.log(`Generated ${key}.png (${buffer.length} bytes)`);
  }

  // Generate contact sheet
  const contactFn = new Function('', `
    ${SPRITE_JS}
    const heroKeys = ['musashi', 'koeda', 'yoshino'];
    const c = document.createElement('canvas');
    c.width = 320 * 3 + 60;
    c.height = 120;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f4ead8';
    ctx.fillRect(0, 0, c.width, c.height);
    
    heroKeys.forEach((key, i) => {
      const ox = i * 96;
      ctx.save();
      ctx.translate(ox, 0);
      for (let g = 0; g < 6; g++) {
        ctx.fillStyle = 'rgba(180,150,100,' + (0.02 + Math.random() * 0.04) + ')';
        ctx.fillRect(Math.random() * 80, Math.random() * 120, 2 + Math.random() * 4, 1);
      }
      const bg = ctx.createRadialGradient(40, 60, 10, 40, 60, 70);
      bg.addColorStop(0, '#d7b66f30');
      bg.addColorStop(1, 'rgba(20,15,10,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 80, 120);
      drawCharacter(ctx, key, 0, 80, 120, {body:'#3b2d1f',trim:'#d7b66f',sash:'#caa45f'});
      ctx.restore();
      ctx.fillStyle = '#3a2a1a';
      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.fillText(key, ox + 40, 118);
    });
    return c.toDataURL('image/png');
  `);
  const contactUrl = await page.evaluate(contactFn);
  const contactBuf = Buffer.from(contactUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.join(ASSETS_DIR, '_contact_sheet.png'), contactBuf);
  console.log('Generated _contact_sheet.png (' + contactBuf.length + ' bytes)');

  await browser.close();
  console.log('All sprites generated successfully');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
