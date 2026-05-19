// Edo Inkblade Character Sprite Sheet Generator — ink-wash brush edition
// Uses Playwright to render detailed sumi-e brush character sprites and export as PNG

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets', 'characters');

const CHARACTERS = {
  musashi: { w: 80, h: 120, frames: 4, palette: { body: '#3b2d1f', trim: '#d7b66f', sash: '#caa45f', skin: '#2a1f18' } },
  koeda: { w: 80, h: 120, frames: 4, palette: { body: '#263840', trim: '#8fc7d6', sash: '#4a7a8a', skin: '#2a1f18' } },
  yoshino: { w: 80, h: 120, frames: 4, palette: { body: '#3d2732', trim: '#d98986', sash: '#b86a6a', skin: '#2a1f18' } },
  chaser: { w: 60, h: 100, frames: 4, palette: { body: '#4a2d28', trim: '#8f5a3f', belt: '#6a3a2a', skin: '#1a1512' } },
  prowler: { w: 60, h: 100, frames: 4, palette: { body: '#25392f', trim: '#9dbb7d', belt: '#4a7a38', skin: '#1a1512' } },
  duelist: { w: 60, h: 100, frames: 4, palette: { body: '#273048', trim: '#b2bad8', belt: '#6a7a9a', skin: '#1a1512' } },
  vagrant: { w: 60, h: 100, frames: 4, palette: { body: '#514233', trim: '#b89358', belt: '#8a6a48', skin: '#1a1512' } },
  monk: { w: 60, h: 100, frames: 4, palette: { body: '#3e4542', trim: '#a6b7a7', belt: '#6a7a6a', skin: '#1a1512' } },
  'mountain-ascetic': { w: 60, h: 100, frames: 4, palette: { body: '#4a3a28', trim: '#9a7a58', belt: '#6a5a3a', skin: '#2a1f18' } },
  'ganryu-sentinel': { w: 60, h: 100, frames: 4, palette: { body: '#2a2038', trim: '#b2bad8', belt: '#6a7a9a', skin: '#2a1f18' } },
  ganryu: { w: 80, h: 120, frames: 4, palette: { body: '#161616', trim: '#efe1c0', belt: '#caa45f', skin: '#1a1512' } }
};

const SPRITE_JS = `
// --- ink-wash brush utilities ---
function brushFill(ctx, pathFn, color, alpha, layers) {
  layers = layers || 3;
  ctx.save();
  for (var i = 0; i < layers; i++) {
    ctx.globalAlpha = alpha * (0.55 + Math.random() * 0.45);
    ctx.fillStyle = color;
    ctx.beginPath();
    pathFn(ctx, i);
    ctx.fill();
  }
  ctx.restore();
}

function brushStroke(ctx, x1, y1, x2, y2, color, width, alpha, scatter) {
  scatter = scatter || 0.4;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  var sx = (Math.random() - 0.5) * scatter;
  var sy = (Math.random() - 0.5) * scatter;
  ctx.moveTo(x1 + sx, y1 + sy);
  var cx = (x1 + x2) / 2 + (Math.random() - 0.5) * scatter * 2;
  var cy = (y1 + y2) / 2 + (Math.random() - 0.5) * scatter * 2;
  ctx.quadraticCurveTo(cx, cy, x2 + (Math.random() - 0.5) * scatter, y2 + (Math.random() - 0.5) * scatter);
  ctx.stroke();
  ctx.restore();
}

function sumiEdge(ctx, cx, cy, w, h, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - w/2 - 2, cy - h);
  ctx.lineTo(cx - w/2 - 2, cy);
  ctx.lineTo(cx + w/2 + 2, cy);
  ctx.lineTo(cx + w/2 + 2, cy - h);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function woodGrain(ctx, w, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha || 0.04;
  ctx.fillStyle = '#4a3a2a';
  for (var i = 0; i < 16; i++) {
    var gx = Math.random() * w;
    var gy = Math.random() * h;
    ctx.fillRect(gx, gy, 1 + Math.random() * 4, 1);
  }
  ctx.restore();
}

// --- Character drawing functions ---

function drawMusashi(ctx, frame, w, h, pal) {
  var cx = w / 2, ground = h;
  // Base shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, ground - 4, 22, 6, 0, 0, 7); ctx.fill();

  if (frame === 0) { // Idle — hand on katana
    // Feet — hakama-shoes
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    // Legs — hakama
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    // Haori body
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-54); c.quadraticCurveTo(cx+off, ground-62, cx+20+off, ground-54); c.quadraticCurveTo(cx+18+off, ground-20, cx-18+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    // Shoulders
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-22+off, ground-54); c.quadraticCurveTo(cx-26+off, ground-44, cx-20+off, ground-42); c.lineTo(cx-18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+22+off, ground-54); c.quadraticCurveTo(cx+26+off, ground-44, cx+20+off, ground-42); c.lineTo(cx+18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    // Neck
    ctx.fillStyle = pal.trim; ctx.globalAlpha = 0.15;
    ctx.fillRect(cx-5, ground-58, 10, 6);
    ctx.globalAlpha = 1;
    // Kasa hat — wide conical
    brushFill(ctx, function(c) { c.moveTo(cx-30, ground-58); c.quadraticCurveTo(cx-34, ground-64, cx-30, ground-72); c.quadraticCurveTo(cx, ground-86, cx+30, ground-72); c.quadraticCurveTo(cx+34, ground-64, cx+30, ground-58); c.closePath(); }, '#2a1a10', 0.95, 3);
    brushFill(ctx, function(c) { c.moveTo(cx-26, ground-72); c.quadraticCurveTo(cx, ground-86, cx+26, ground-72); c.lineTo(cx+22, ground-78); c.quadraticCurveTo(cx, ground-92, cx-22, ground-78); c.closePath(); }, '#1a1008', 0.9, 2);
    // Face
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-58); c.quadraticCurveTo(cx, ground-64, cx+7, ground-58); c.quadraticCurveTo(cx+5, ground-50, cx-5, ground-50); c.closePath(); }, pal.skin, 0.95, 2);
    // Topknot
    brushFill(ctx, function(c) { c.moveTo(cx-4, ground-64); c.lineTo(cx+4, ground-64); c.lineTo(cx, ground-76); c.closePath(); }, '#1a1512', 0.9, 2);
    // Katana at hip — saya (scabbard)
    brushStroke(ctx, cx-18, ground-34, cx-26, ground-18, '#3a2a1a', 3, 0.9, 0.6);
    brushStroke(ctx, cx-26, ground-18, cx-30, ground-6, '#5a4a3a', 1.5, 0.7, 0.4);
    // Sash
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-20, ground-22, 40, 4);
    ctx.globalAlpha = 1;
    // Haori open front line
    ctx.strokeStyle = pal.trim; ctx.lineWidth = 1; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.moveTo(cx-3, ground-54); ctx.lineTo(cx+3, ground-54); ctx.lineTo(cx-2, ground-22); ctx.lineTo(cx+2, ground-22); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (frame === 1) { // Slash — katana drawn, diagonal sweep
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-54); c.quadraticCurveTo(cx+off, ground-62, cx+20+off, ground-54); c.quadraticCurveTo(cx+18+off, ground-20, cx-18+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-22+off, ground-54); c.quadraticCurveTo(cx-26+off, ground-44, cx-20+off, ground-42); c.lineTo(cx-18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+22+off, ground-54); c.quadraticCurveTo(cx+26+off, ground-44, cx+20+off, ground-42); c.lineTo(cx+18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-30, ground-58); c.quadraticCurveTo(cx-34, ground-64, cx-30, ground-72); c.quadraticCurveTo(cx, ground-86, cx+30, ground-72); c.quadraticCurveTo(cx+34, ground-64, cx+30, ground-58); c.closePath(); }, '#2a1a10', 0.95, 3);
    brushFill(ctx, function(c) { c.moveTo(cx-26, ground-72); c.quadraticCurveTo(cx, ground-86, cx+26, ground-72); c.lineTo(cx+22, ground-78); c.quadraticCurveTo(cx, ground-92, cx-22, ground-78); c.closePath(); }, '#1a1008', 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-58); c.quadraticCurveTo(cx, ground-64, cx+7, ground-58); c.quadraticCurveTo(cx+5, ground-50, cx-5, ground-50); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-4, ground-64); c.lineTo(cx+4, ground-64); c.lineTo(cx, ground-76); c.closePath(); }, '#1a1512', 0.9, 2);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-20, ground-22, 40, 4);
    ctx.globalAlpha = 1;
    // Katana slash — diagonal sweep
    brushStroke(ctx, cx+16, ground-44, cx+48, ground-70, '#3a2a1a', 3, 0.9, 0.6);
    brushStroke(ctx, cx+48, ground-70, cx+58, ground-86, '#5a4a3a', 1.5, 0.7, 0.4);
    // Slash arc — ink-brush trail
    ctx.strokeStyle = '#efe1c0'; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(cx+10, ground-48);
    ctx.quadraticCurveTo(cx+36, ground-52, cx+60, ground-64);
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (frame === 2) { // Block — katana raised vertical
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+8, ground-2); c.lineTo(cx+4, ground-6); c.lineTo(cx+12, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-54); c.quadraticCurveTo(cx+off, ground-62, cx+20+off, ground-54); c.quadraticCurveTo(cx+18+off, ground-20, cx-18+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-22+off, ground-54); c.quadraticCurveTo(cx-26+off, ground-44, cx-20+off, ground-42); c.lineTo(cx-18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+22+off, ground-54); c.quadraticCurveTo(cx+26+off, ground-44, cx+20+off, ground-42); c.lineTo(cx+18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-30, ground-58); c.quadraticCurveTo(cx-34, ground-64, cx-30, ground-72); c.quadraticCurveTo(cx, ground-86, cx+30, ground-72); c.quadraticCurveTo(cx+34, ground-64, cx+30, ground-58); c.closePath(); }, '#2a1a10', 0.95, 3);
    brushFill(ctx, function(c) { c.moveTo(cx-26, ground-72); c.quadraticCurveTo(cx, ground-86, cx+26, ground-72); c.lineTo(cx+22, ground-78); c.quadraticCurveTo(cx, ground-92, cx-22, ground-78); c.closePath(); }, '#1a1008', 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-58); c.quadraticCurveTo(cx, ground-64, cx+7, ground-58); c.quadraticCurveTo(cx+5, ground-50, cx-5, ground-50); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-4, ground-64); c.lineTo(cx+4, ground-64); c.lineTo(cx, ground-76); c.closePath(); }, '#1a1512', 0.9, 2);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-20, ground-22, 40, 4);
    ctx.globalAlpha = 1;
    // Katana raised vertical to block
    brushStroke(ctx, cx+18, ground-38, cx+16, ground-62, '#3a2a1a', 3, 0.9, 0.4);
    brushStroke(ctx, cx+16, ground-62, cx+12, ground-76, '#5a4a3a', 1.5, 0.7, 0.4);
    // Block flash
    ctx.fillStyle = '#d7b66f'; ctx.globalAlpha = 0.18;
    ctx.beginPath(); ctx.arc(cx+20, ground-56, 14, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (frame === 3) { // Damage — staggered back
    brushFill(ctx, function(c) { c.moveTo(cx-18, ground-2); c.lineTo(cx-22, ground-6); c.lineTo(cx-14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+4, ground-2); c.lineTo(cx, ground-6); c.lineTo(cx+8, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-20); c.quadraticCurveTo(cx-22+off, ground-6, cx-14+off, ground); c.lineTo(cx-16+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+6+off, ground-20); c.quadraticCurveTo(cx+10+off, ground-6, cx+4+off, ground); c.lineTo(cx+6+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-54); c.quadraticCurveTo(cx-4+off, ground-60, cx+14+off, ground-54); c.quadraticCurveTo(cx+12+off, ground-20, cx-22+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-22+off, ground-54); c.quadraticCurveTo(cx-28+off, ground-44, cx-22+off, ground-42); c.lineTo(cx-20+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+14+off, ground-54); c.quadraticCurveTo(cx+18+off, ground-44, cx+14+off, ground-42); c.lineTo(cx+12+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-30, ground-58); c.quadraticCurveTo(cx-34, ground-64, cx-30, ground-72); c.quadraticCurveTo(cx-4, ground-86, cx+26, ground-72); c.quadraticCurveTo(cx+30, ground-64, cx+26, ground-58); c.closePath(); }, '#2a1a10', 0.95, 3);
    brushFill(ctx, function(c) { c.moveTo(cx-26, ground-72); c.quadraticCurveTo(cx-4, ground-86, cx+22, ground-72); c.lineTo(cx+18, ground-78); c.quadraticCurveTo(cx-4, ground-92, cx-26, ground-78); c.closePath(); }, '#1a1008', 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-8, ground-58); c.quadraticCurveTo(cx-4, ground-62, cx+4, ground-58); c.quadraticCurveTo(cx+2, ground-50, cx-10, ground-50); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-4, ground-64); c.lineTo(cx+4, ground-64); c.lineTo(cx, ground-76); c.closePath(); }, '#1a1512', 0.9, 2);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-20, ground-22, 40, 4);
    ctx.globalAlpha = 1;
    // Damage particles
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx+22, ground-52, 6, 0, 7); ctx.fill();
    ctx.fillStyle = '#efe1c0'; ctx.globalAlpha = 0.15;
    ctx.beginPath(); ctx.arc(cx+18, ground-60, 4, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Sumi-e ink-brush outline
  sumiEdge(ctx, cx, ground, w * 0.75, h * 0.7, '#0a0806', 0.4);
}

function drawKoeda(ctx, frame, w, h, pal) {
  var cx = w / 2, ground = h;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, ground - 4, 20, 5, 0, 0, 7); ctx.fill();

  if (frame === 0) { // Idle — runner stance, brush at side
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    // Lean body
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-16+off, ground-50); c.quadraticCurveTo(cx+off, ground-56, cx+16+off, ground-50); c.quadraticCurveTo(cx+14+off, ground-20, cx-14+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-18+off, ground-50); c.quadraticCurveTo(cx-22+off, ground-42, cx-16+off, ground-40); c.lineTo(cx-14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+18+off, ground-50); c.quadraticCurveTo(cx+22+off, ground-42, cx+16+off, ground-40); c.lineTo(cx+14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    // Head
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-50); c.quadraticCurveTo(cx, ground-56, cx+7, ground-50); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, pal.skin, 0.95, 2);
    // Short runner hair
    brushFill(ctx, function(c) { c.moveTo(cx-6, ground-54); c.quadraticCurveTo(cx, ground-58, cx+6, ground-54); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 0.9, 2);
    // Long trailing scarf
    brushStroke(ctx, cx-16, ground-44, cx-28, ground-36, pal.trim, 3.5, 0.5, 1.0);
    brushStroke(ctx, cx-28, ground-36, cx-36, ground-20, pal.trim, 2.5, 0.35, 1.5);
    brushStroke(ctx, cx-36, ground-20, cx-40, ground-10, pal.trim, 1.5, 0.2, 2.0);
    // Ink brush at hip
    brushStroke(ctx, cx+14, ground-32, cx+20, ground-18, '#3a2a1a', 2.5, 0.8, 0.3);
    brushStroke(ctx, cx+20, ground-18, cx+24, ground-8, '#5a4a3a', 1.2, 0.6, 0.3);
    // Sash
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
  } else if (frame === 1) { // Slash — brush sweep
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-16+off, ground-50); c.quadraticCurveTo(cx+off, ground-56, cx+16+off, ground-50); c.quadraticCurveTo(cx+14+off, ground-20, cx-14+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-18+off, ground-50); c.quadraticCurveTo(cx-22+off, ground-42, cx-16+off, ground-40); c.lineTo(cx-14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+18+off, ground-50); c.quadraticCurveTo(cx+22+off, ground-42, cx+16+off, ground-40); c.lineTo(cx+14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-50); c.quadraticCurveTo(cx, ground-56, cx+7, ground-50); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-6, ground-54); c.quadraticCurveTo(cx, ground-58, cx+6, ground-54); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 0.9, 2);
    brushStroke(ctx, cx-16, ground-44, cx-28, ground-36, pal.trim, 3.5, 0.5, 1.0);
    brushStroke(ctx, cx-28, ground-36, cx-36, ground-20, pal.trim, 2.5, 0.35, 1.5);
    brushStroke(ctx, cx-36, ground-20, cx-40, ground-10, pal.trim, 1.5, 0.2, 2.0);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    // Brush ink sweep
    brushStroke(ctx, cx+16, ground-38, cx+44, ground-46, '#8fc7d6', 3.5, 0.5, 1.5);
    brushStroke(ctx, cx+44, ground-46, cx+64, ground-56, '#8fc7d6', 2, 0.35, 2.0);
    // Arm sweep
    brushStroke(ctx, cx+14, ground-38, cx+40, ground-44, '#3a2a1a', 2, 0.7, 0.5);
  } else if (frame === 2) { // Block — arms crossed
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-20); c.quadraticCurveTo(cx-14+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-16+off, ground-50); c.quadraticCurveTo(cx+off, ground-56, cx+16+off, ground-50); c.quadraticCurveTo(cx+14+off, ground-20, cx-14+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-18+off, ground-50); c.quadraticCurveTo(cx-22+off, ground-42, cx-16+off, ground-40); c.lineTo(cx-14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+18+off, ground-50); c.quadraticCurveTo(cx+22+off, ground-42, cx+16+off, ground-40); c.lineTo(cx+14+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-50); c.quadraticCurveTo(cx, ground-56, cx+7, ground-50); c.quadraticCurveTo(cx+5, ground-42, cx-5, ground-42); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-6, ground-54); c.quadraticCurveTo(cx, ground-58, cx+6, ground-54); c.quadraticCurveTo(cx+4, ground-48, cx-4, ground-48); c.closePath(); }, '#1a1512', 0.9, 2);
    brushStroke(ctx, cx-16, ground-44, cx-28, ground-36, pal.trim, 3.5, 0.5, 1.0);
    brushStroke(ctx, cx-28, ground-36, cx-36, ground-20, pal.trim, 2.5, 0.35, 1.5);
    brushStroke(ctx, cx-36, ground-20, cx-40, ground-10, pal.trim, 1.5, 0.2, 2.0);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    // Arms crossed
    brushStroke(ctx, cx+6, ground-44, cx-14, ground-52, '#3a2a1a', 2.5, 0.7, 0.4);
    brushStroke(ctx, cx-6, ground-44, cx+14, ground-52, '#3a2a1a', 2.5, 0.7, 0.4);
    ctx.fillStyle = '#8fc7d6'; ctx.globalAlpha = 0.18;
    ctx.beginPath(); ctx.arc(cx, ground-48, 16, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (frame === 3) { // Damage — knocked back
    brushFill(ctx, function(c) { c.moveTo(cx-18, ground-2); c.lineTo(cx-22, ground-6); c.lineTo(cx-14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c) { c.moveTo(cx+4, ground-2); c.lineTo(cx, ground-6); c.lineTo(cx+8, ground-6); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-20); c.quadraticCurveTo(cx-22+off, ground-6, cx-14+off, ground); c.lineTo(cx-16+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+6+off, ground-20); c.quadraticCurveTo(cx+10+off, ground-6, cx+4+off, ground); c.lineTo(cx+6+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-16+off, ground-50); c.quadraticCurveTo(cx-4+off, ground-54, cx+12+off, ground-50); c.quadraticCurveTo(cx+10+off, ground-20, cx-18+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-18+off, ground-50); c.quadraticCurveTo(cx-24+off, ground-42, cx-18+off, ground-40); c.lineTo(cx-16+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+12+off, ground-50); c.quadraticCurveTo(cx+16+off, ground-42, cx+12+off, ground-40); c.lineTo(cx+10+off, ground-48); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-7, ground-50); c.quadraticCurveTo(cx-4, ground-54, cx+4, ground-50); c.quadraticCurveTo(cx+2, ground-42, cx-8, ground-42); c.closePath(); }, pal.skin, 0.95, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-6, ground-54); c.quadraticCurveTo(cx-4, ground-56, cx+4, ground-54); c.quadraticCurveTo(cx+2, ground-48, cx-6, ground-48); c.closePath(); }, '#1a1512', 0.9, 2);
    brushStroke(ctx, cx-16, ground-44, cx-28, ground-36, pal.trim, 3.5, 0.5, 1.0);
    brushStroke(ctx, cx-28, ground-36, cx-36, ground-20, pal.trim, 2.5, 0.35, 1.5);
    ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-20, 28, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx+14, ground-44, 5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  sumiEdge(ctx, cx, ground, w * 0.7, h * 0.65, '#0a0806', 0.35);
}

function drawGenericHero(ctx, frame, w, h, pal, type) {
  var cx = w / 2, ground = h;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, ground - 4, 20, 5, 0, 0, 7); ctx.fill();
  // Yoshino — hooded sage with staff
  brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c) { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-14+off, ground-20); c.quadraticCurveTo(cx-16+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+10+off, ground-20); c.quadraticCurveTo(cx+14+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-20); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-54); c.quadraticCurveTo(cx+off, ground-62, cx+20+off, ground-54); c.quadraticCurveTo(cx+18+off, ground-20, cx-18+off, ground-20); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-22+off, ground-54); c.quadraticCurveTo(cx-26+off, ground-44, cx-20+off, ground-42); c.lineTo(cx-18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+22+off, ground-54); c.quadraticCurveTo(cx+26+off, ground-44, cx+20+off, ground-42); c.lineTo(cx+18+off, ground-50); c.closePath(); }, pal.body, 0.85, 2);
  // Hood
  brushFill(ctx, function(c) { c.moveTo(cx-20, ground-54); c.quadraticCurveTo(cx, ground-62, cx+20, ground-54); c.lineTo(cx+18, ground-60); c.quadraticCurveTo(cx, ground-66, cx-18, ground-60); c.closePath(); }, '#2a1f14', 0.95, 3);
  brushFill(ctx, function(c) { c.moveTo(cx-16, ground-60); c.quadraticCurveTo(cx, ground-66, cx+16, ground-60); c.lineTo(cx+14, ground-64); c.quadraticCurveTo(cx, ground-70, cx-14, ground-64); c.closePath(); }, '#1a1512', 0.9, 2);
  // Face
  brushFill(ctx, function(c) { c.moveTo(cx-6, ground-54); c.quadraticCurveTo(cx, ground-60, cx+6, ground-54); c.quadraticCurveTo(cx+4, ground-46, cx-4, ground-46); c.closePath(); }, pal.skin, 0.95, 2);
  // Staff
  brushStroke(ctx, cx-18, ground-22, cx-26, ground-4, '#3a2a1a', 3, 0.9, 0.5);
  brushStroke(ctx, cx-26, ground-4, cx-28, ground-2, '#5a4a3a', 1.5, 0.6, 0.3);
  if (frame === 1) {
    brushStroke(ctx, cx+6, ground-46, cx+40, ground-42, pal.trim, 2.5, 0.5, 1.5);
    brushStroke(ctx, cx+40, ground-42, cx+60, ground-48, pal.trim, 1.5, 0.35, 2.0);
  }
  ctx.fillStyle = pal.sash; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-18, ground-20, 36, 3);
  ctx.globalAlpha = 1;
  sumiEdge(ctx, cx, ground, w * 0.75, h * 0.7, '#0a0806', 0.35);
}

function drawBoss(ctx, frame, w, h, pal) {
  var cx = w / 2, ground = h;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(cx, ground - 4, 26, 7, 0, 0, 7); ctx.fill();
  // Ganryu — imposing samurai, wider build, dark armor
  brushFill(ctx, function(c) { c.moveTo(cx-18, ground-2); c.lineTo(cx-24, ground-6); c.lineTo(cx-12, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c) { c.moveTo(cx+18, ground-2); c.lineTo(cx+12, ground-6); c.lineTo(cx+24, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-20+off, ground-22); c.quadraticCurveTo(cx-24+off, ground-6, cx-12+off, ground); c.lineTo(cx-16+off, ground-22); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+20+off, ground-22); c.quadraticCurveTo(cx+24+off, ground-6, cx+12+off, ground); c.lineTo(cx+16+off, ground-22); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-22+off, ground-58); c.quadraticCurveTo(cx+off, ground-66, cx+22+off, ground-58); c.quadraticCurveTo(cx+20+off, ground-22, cx-20+off, ground-22); c.closePath(); }, '#1a1512', 0.95, 3);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-24+off, ground-58); c.quadraticCurveTo(cx-30+off, ground-48, cx-22+off, ground-46); c.lineTo(cx-20+off, ground-56); c.closePath(); }, '#1a1512', 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+24+off, ground-58); c.quadraticCurveTo(cx+30+off, ground-48, cx+22+off, ground-46); c.lineTo(cx+20+off, ground-56); c.closePath(); }, '#1a1512', 0.9, 2);
  // Wide dark hat
  brushFill(ctx, function(c) { c.moveTo(cx-38, ground-62); c.quadraticCurveTo(cx-42, ground-70, cx-38, ground-80); c.quadraticCurveTo(cx, ground-92, cx+38, ground-80); c.quadraticCurveTo(cx+42, ground-70, cx+38, ground-62); c.closePath(); }, '#0a0806', 0.95, 3);
  brushFill(ctx, function(c) { c.moveTo(cx-34, ground-80); c.quadraticCurveTo(cx, ground-92, cx+34, ground-80); c.lineTo(cx+30, ground-86); c.quadraticCurveTo(cx, ground-98, cx-30, ground-86); c.closePath(); }, '#1a1008', 0.9, 2);
  // Face
  brushFill(ctx, function(c) { c.moveTo(cx-10, ground-62); c.quadraticCurveTo(cx, ground-68, cx+10, ground-62); c.quadraticCurveTo(cx+8, ground-54, cx-8, ground-54); c.closePath(); }, pal.skin, 0.95, 2);
  // Topknot
  brushFill(ctx, function(c) { c.moveTo(cx-4, ground-70); c.lineTo(cx+4, ground-70); c.lineTo(cx, ground-84); c.closePath(); }, '#0a0806', 0.9, 2);
  // Yoroi shoulder armor
  ctx.fillStyle = '#2a1f14'; ctx.globalAlpha = 0.2;
  ctx.fillRect(cx-26, ground-58, 12, 8);
  ctx.fillRect(cx+14, ground-58, 12, 8);
  ctx.globalAlpha = 1;
  // Chest armor plate
  ctx.fillStyle = '#2a1f14'; ctx.globalAlpha = 0.15;
  ctx.fillRect(cx-18, ground-50, 36, 16);
  ctx.globalAlpha = 1;
  // Large nodachi
  brushStroke(ctx, cx-26, ground-36, cx-40, ground-18, '#3a2a1a', 3.5, 0.9, 0.6);
  brushStroke(ctx, cx-40, ground-18, cx-48, ground-4, '#5a4a3a', 1.5, 0.7, 0.4);
  ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-20, ground-22, 40, 4);
  ctx.globalAlpha = 1;
  if (frame === 3) {
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(cx+20, ground-52, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#efe1c0'; ctx.globalAlpha = 0.1;
    ctx.beginPath(); ctx.arc(cx+16, ground-60, 5, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  sumiEdge(ctx, cx, ground, w * 0.85, h * 0.75, '#0a0806', 0.5);
}

function drawGenericEnemy(ctx, frame, w, h, pal, type) {
  var cx = w / 2, ground = h;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx, ground - 4, 16, 4, 0, 0, 7); ctx.fill();
  // Base body
  brushFill(ctx, function(c) { c.moveTo(cx-10, ground-2); c.lineTo(cx-14, ground-6); c.lineTo(cx-6, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c) { c.moveTo(cx+10, ground-2); c.lineTo(cx+6, ground-6); c.lineTo(cx+14, ground-6); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-12+off, ground-18); c.quadraticCurveTo(cx-14+off, ground-6, cx-6+off, ground); c.lineTo(cx-8+off, ground-18); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+12+off, ground-18); c.quadraticCurveTo(cx+14+off, ground-6, cx+6+off, ground); c.lineTo(cx+8+off, ground-18); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-16+off, ground-46); c.quadraticCurveTo(cx+off, ground-52, cx+16+off, ground-46); c.quadraticCurveTo(cx+14+off, ground-18, cx-14+off, ground-18); c.closePath(); }, pal.body, 0.9, 2);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx-18+off, ground-46); c.quadraticCurveTo(cx-22+off, ground-40, cx-16+off, ground-38); c.lineTo(cx-14+off, ground-44); c.closePath(); }, pal.body, 0.85, 2);
  brushFill(ctx, function(c, i) { var off = i * 2; c.moveTo(cx+18+off, ground-46); c.quadraticCurveTo(cx+22+off, ground-40, cx+16+off, ground-38); c.lineTo(cx+14+off, ground-44); c.closePath(); }, pal.body, 0.85, 2);
  // Head
  brushFill(ctx, function(c) { c.moveTo(cx-6, ground-46); c.quadraticCurveTo(cx, ground-52, cx+6, ground-46); c.quadraticCurveTo(cx+4, ground-38, cx-4, ground-38); c.closePath(); }, pal.skin, 0.95, 2);

  if (type === 'chaser') {
    brushFill(ctx, function(c) { c.moveTo(cx-10, ground-50); c.quadraticCurveTo(cx, ground-56, cx+10, ground-50); c.lineTo(cx+8, ground-46); c.lineTo(cx-8, ground-46); c.closePath(); }, '#2a1f14', 0.95, 3);
    brushStroke(ctx, cx-12, ground-30, cx-18, ground-4, '#3a2a1a', 2.5, 0.8, 0.4);
  } else if (type === 'prowler') {
    brushFill(ctx, function(c) { c.moveTo(cx-12, ground-50); c.quadraticCurveTo(cx, ground-58, cx+12, ground-50); c.lineTo(cx+10, ground-46); c.lineTo(cx-10, ground-46); c.closePath(); }, '#1a1512', 0.95, 3);
    brushStroke(ctx, cx+12, ground-32, cx+22, ground-18, '#3a2a1a', 2.5, 0.8, 0.5);
    brushStroke(ctx, cx+22, ground-18, cx+26, ground-12, '#5a4a3a', 2.5, 0.6, 0.4);
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 2; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(cx+26, ground-12); ctx.lineTo(cx+24, ground-10); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (type === 'duelist') {
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.25;
    ctx.fillRect(cx-4, ground-46, 8, 3);
    ctx.globalAlpha = 1;
    brushStroke(ctx, cx+10, ground-32, cx+22, ground-16, '#3a2a1a', 2.5, 0.8, 0.5);
    brushStroke(ctx, cx+22, ground-16, cx+28, ground-6, '#5a4a3a', 1.2, 0.6, 0.3);
  } else if (type === 'vagrant') {
    brushFill(ctx, function(c) { c.moveTo(cx-16, ground-50); c.quadraticCurveTo(cx, ground-58, cx+16, ground-50); c.lineTo(cx+14, ground-46); c.lineTo(cx-14, ground-46); c.closePath(); }, '#8a7a58', 0.55, 3);
    brushStroke(ctx, cx-10, ground-30, cx-18, ground-12, '#3a2a1a', 2.5, 0.8, 0.4);
  } else if (type === 'monk') {
    brushFill(ctx, function(c) { c.moveTo(cx-8, ground-46); c.quadraticCurveTo(cx, ground-54, cx+8, ground-46); c.lineTo(cx+6, ground-50); c.quadraticCurveTo(cx, ground-58, cx-6, ground-50); c.closePath(); }, '#2a1f14', 0.95, 3);
    brushStroke(ctx, cx-16, ground-30, cx-26, ground-8, '#3a2a1a', 2.5, 0.8, 0.5);
    brushStroke(ctx, cx-26, ground-8, cx-30, ground-4, '#5a4a3a', 1.2, 0.6, 0.3);
  } else if (type === 'mountain-ascetic') {
    brushFill(ctx, function(c) { c.moveTo(cx-20, ground-52); c.quadraticCurveTo(cx, ground-62, cx+20, ground-52); c.lineTo(cx+18, ground-46); c.lineTo(cx-18, ground-46); c.closePath(); }, '#7a6a48', 0.55, 3);
    brushFill(ctx, function(c) { c.moveTo(cx-18, ground-52); c.quadraticCurveTo(cx, ground-58, cx+18, ground-52); c.lineTo(cx+16, ground-50); c.lineTo(cx-16, ground-50); c.closePath(); }, '#8a7a58', 0.35, 2);
    brushFill(ctx, function(c) { c.moveTo(cx-5, ground-46); c.quadraticCurveTo(cx, ground-50, cx+5, ground-46); c.quadraticCurveTo(cx+3, ground-38, cx-3, ground-38); c.closePath(); }, '#4a3828', 0.95, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx-14+off, ground-18); c.quadraticCurveTo(cx-16+off, ground-6, cx-8+off, ground); c.lineTo(cx-10+off, ground-18); c.closePath(); }, pal.body, 0.85, 2);
    brushFill(ctx, function(c, i) { var off = i * 2 - 2; c.moveTo(cx+14+off, ground-18); c.quadraticCurveTo(cx+16+off, ground-6, cx+8+off, ground); c.lineTo(cx+10+off, ground-18); c.closePath(); }, pal.body, 0.85, 2);
    brushStroke(ctx, cx-14, ground-30, cx-22, ground-4, '#3a2a1a', 2.5, 0.8, 0.5);
    brushStroke(ctx, cx-22, ground-4, cx-26, ground-2, '#5a4a3a', 1.2, 0.6, 0.3);
    ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-18, 28, 3);
    ctx.globalAlpha = 1;
  } else if (type === 'ganryu-sentinel') {
    brushFill(ctx, function(c) { c.moveTo(cx-12, ground-50); c.quadraticCurveTo(cx, ground-56, cx+12, ground-50); c.lineTo(cx+10, ground-46); c.lineTo(cx-10, ground-46); c.closePath(); }, '#1a1512', 0.95, 3);
    ctx.strokeStyle = '#b2bad8'; ctx.lineWidth = 1; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.moveTo(cx-6, ground-48); ctx.lineTo(cx+6, ground-48); ctx.stroke();
    ctx.globalAlpha = 1;
    brushFill(ctx, function(c) { c.moveTo(cx-5, ground-46); c.quadraticCurveTo(cx, ground-50, cx+5, ground-46); c.quadraticCurveTo(cx+3, ground-38, cx-3, ground-38); c.closePath(); }, pal.skin, 0.95, 2);
    ctx.fillStyle = '#2a1f14'; ctx.globalAlpha = 0.2;
    ctx.fillRect(cx-18, ground-46, 8, 6);
    ctx.fillRect(cx+10, ground-46, 8, 6);
    ctx.globalAlpha = 1;
    brushStroke(ctx, cx+10, ground-32, cx+18, ground-14, '#3a2a1a', 2.5, 0.8, 0.4);
    brushStroke(ctx, cx+18, ground-14, cx+22, ground-6, '#5a4a3a', 1, 0.6, 0.3);
    ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
    ctx.fillRect(cx-14, ground-18, 28, 3);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = pal.belt; ctx.globalAlpha = 0.35;
  ctx.fillRect(cx-14, ground-18, 28, 3);
  ctx.globalAlpha = 1;
  if (frame === 3) {
    ctx.fillStyle = '#c85d43'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(cx+12, ground-40, 4, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
  sumiEdge(ctx, cx, ground, w * 0.7, h * 0.65, '#0a0806', 0.35);
}

function drawCharacter(ctx, key, frame, w, h, pal) {
  if (key === 'musashi') drawMusashi(ctx, frame, w, h, pal);
  else if (key === 'koeda') drawKoeda(ctx, frame, w, h, pal);
  else if (key === 'yoshino') drawGenericHero(ctx, frame, w, h, pal, 'sage');
  else if (key === 'ganryu') drawBoss(ctx, frame, w, h, pal);
  else if (key === 'chaser') drawGenericEnemy(ctx, frame, w, h, pal, 'chaser');
  else if (key === 'prowler') drawGenericEnemy(ctx, frame, w, h, pal, 'prowler');
  else if (key === 'duelist') drawGenericEnemy(ctx, frame, w, h, pal, 'duelist');
  else if (key === 'vagrant') drawGenericEnemy(ctx, frame, w, h, pal, 'vagrant');
  else if (key === 'monk') drawGenericEnemy(ctx, frame, w, h, pal, 'monk');
  else if (key === 'mountain-ascetic') drawGenericEnemy(ctx, frame, w, h, pal, 'mountain-ascetic');
  else if (key === 'ganryu-sentinel') drawGenericEnemy(ctx, frame, w, h, pal, 'ganryu-sentinel');
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

    const genFn = new Function('args', `
      ${SPRITE_JS}
      const c = document.createElement('canvas');
      c.width = args.sheetW;
      c.height = args.sheetH;
      const ctx = c.getContext('2d');
      // Paper background — warm aged washi tone
      ctx.fillStyle = '#f4ead8';
      ctx.fillRect(0, 0, args.sheetW, args.sheetH);
      // Subtle woodblock grain
      for (var g = 0; g < 24; g++) {
        ctx.fillStyle = 'rgba(160,130,90,' + (0.015 + Math.random() * 0.04) + ')';
        ctx.fillRect(Math.random() * args.sheetW, Math.random() * args.sheetH, 1 + Math.random() * 5, 1);
      }
      // Ink splash backdrop per frame
      for (var f = 0; f < args.def.frames; f++) {
        var ox = f * args.def.w;
        ctx.save(); ctx.translate(ox, 0);
        var bg = ctx.createRadialGradient(args.def.w/2, args.def.h-10, 5, args.def.w/2, args.def.h-10, args.def.h * 0.55);
        bg.addColorStop(0, args.def.palette.trim + '25');
        bg.addColorStop(0.6, args.def.palette.body + '15');
        bg.addColorStop(1, 'rgba(20,15,10,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, args.def.w, args.def.h);
        drawCharacter(ctx, args.key, f, args.def.w, args.def.h, args.def.palette);
        // Final woodblock grain overlay per-frame
        woodGrain(ctx, args.def.w, args.def.h, 0.03);
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

  // Generate enhanced contact sheet
  const contactFn = new Function('', `
    ${SPRITE_JS}
    const heroKeys = ['musashi', 'koeda', 'yoshino'];
    const c = document.createElement('canvas');
    c.width = 420;
    c.height = 160;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f4ead8';
    ctx.fillRect(0, 0, c.width, c.height);
    // Woodblock grain on contact sheet
    for (var g = 0; g < 40; g++) {
      ctx.fillStyle = 'rgba(160,130,90,' + (0.015 + Math.random() * 0.04) + ')';
      ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 5, 1);
    }
    heroKeys.forEach(function(key, i) {
      var ox = i * 130;
      ctx.save(); ctx.translate(ox, 0);
      var bg = ctx.createRadialGradient(40, 60, 5, 40, 60, 70);
      bg.addColorStop(0, '#d7b66f25');
      bg.addColorStop(1, 'rgba(20,15,10,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 80, 120);
      var pal = {body:'#3b2d1f',trim:'#d7b66f',sash:'#caa45f',skin:'#2a1f18'};
      if (key === 'koeda') pal = {body:'#263840',trim:'#8fc7d6',sash:'#4a7a8a',skin:'#2a1f18'};
      if (key === 'yoshino') pal = {body:'#3d2732',trim:'#d98986',sash:'#b86a6a',skin:'#2a1f18'};
      drawCharacter(ctx, key, 0, 80, 120, pal);
      woodGrain(ctx, 80, 120, 0.03);
      ctx.restore();
      ctx.fillStyle = '#3a2a1a';
      ctx.font = 'bold 11px serif';
      ctx.textAlign = 'center';
      ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), ox + 40, 148);
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
