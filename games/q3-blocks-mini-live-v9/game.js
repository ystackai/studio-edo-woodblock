/* Q3 Blocks Mini Live v9 — sake-cup catch game.
 * Creative intent: "This should feel like catching falling sake cups on a
 * wooden counter in an Edo-era tavern — each catch chimes, each miss thuds,
 * and the background looks like an uneven brushstroke on old paper."
 */
(function () { 'use strict';

  var canvas, ctx, W = 480, H = 640;
  var px = W / 2, pw = 80, ph = 30, SPD = 360;
  var cups = [], spawnT = 0, spawnI = 1.2;
  var score = 0, lives = 3, state = 'title', endT = 0;
  var PALETTE = ['#d4a574', '#c8925e', '#b87a4a', '#e8c09a', '#a06838', '#f0d5b0'];

  function paintBg() {
    ctx.fillStyle = '#f5e6d0'; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 18; i++) {
      ctx.fillStyle = PALETTE[i % 6]; ctx.globalAlpha = 0.08 + Math.random() * 0.15;
      ctx.beginPath(); ctx.ellipse(Math.random() * W, Math.random() * H,
        30 + Math.random() * 100, 4 + Math.random() * 12, Math.random() * 0.3, 0, Math.PI * 2); ctx.fill();
     }
    ctx.globalAlpha = 1;
    var g = ctx.createLinearGradient(0, H - 90, 0, H);
    g.addColorStop(0, '#5a3a22'); g.addColorStop(1, '#3a2210');
    ctx.fillStyle = g; ctx.fillRect(0, H - 90, W, 90);
    for (var j = 0; j < 10; j++) {
      ctx.strokeStyle = 'rgba(80,50,25,' + (0.15 + Math.random() * 0.2) + ')'; ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath(); ctx.moveTo(0, H - 85 + Math.random() * 80); ctx.lineTo(W, H - 85 + Math.random() * 80); ctx.stroke();
     }
   }

  function spawn() {
    var cols = ['#e8433e', '#2e7d32', '#1565c0', '#f9a825', '#7b1fa2'];
    cups.push({ x: 30 + Math.random() * (W - 60), y: -30, w: 28 + Math.random() * 16, h: 32 + Math.random() * 10,
      vy: 80 + Math.random() * 60 + score * 2, color: cols[Math.floor(Math.random() * 5)], bp: Math.random() * 6.28, ba: 0.3 + Math.random() * 0.5 });
   }

  function reset() { cups = []; score = 0; lives = 3; spawnT = 0; spawnI = 1.2; px = W / 2; }

  function update(dt) {
    if (state === 'title') return;
    if (state === 'end') return;
    var vx = 0;
    if (FoundryInput.held('left')) vx = -SPD;
    if (FoundryInput.held('right')) vx = SPD;
    if (FoundryInput.pointer.down) {
      var d = FoundryInput.pointer.x - px;
      if (Math.abs(d) > 4) vx = Math.sign(d) * Math.min(SPD, Math.abs(d) * 8);
     }
    px = Math.max(pw / 2, Math.min(W - pw / 2, px + vx * dt));
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = spawnI; spawnI = Math.max(0.4, spawnI - 0.02); }
    for (var i = cups.length - 1; i >= 0; i--) {
      var c = cups[i]; c.y += c.vy * dt; c.bp += dt * 3; c.x += Math.sin(c.bp) * c.ba;
      if (c.y + c.h / 2 > H - 90 - ph / 2 && c.y - c.h / 2 < H - 90 + ph / 2 && Math.abs(c.x - px) < (pw + c.w) / 2) {
        score++; cups.splice(i, 1); FoundryAudio && FoundryAudio.pickup(); continue;
       }
      if (c.y > H + 40) { lives--; cups.splice(i, 1); FoundryAudio && FoundryAudio.fail(); if (lives <= 0) { state = 'end'; endT = 3; } }
     }
    FoundryInput.update(dt);
   }

  function render(_a) {
    paintBg();
     /* Player basket. */
    ctx.fillStyle = '#f5deb3'; ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 2;
    var py = H - 90 - ph / 2; ctx.beginPath();
    ctx.moveTo(px - pw / 2, py - ph / 2); ctx.lineTo(px - pw / 2 + 6, py + ph / 2);
    ctx.lineTo(px + pw / 2 - 6, py + ph / 2); ctx.lineTo(px + pw / 2, py - ph / 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
     /* Falling cups. */
    for (var i = 0; i < cups.length; i++) {
      var c = cups[i]; ctx.fillStyle = c.color; ctx.beginPath();
      ctx.moveTo(c.x - c.w / 2, c.y - c.h / 2); ctx.lineTo(c.x + c.w / 2, c.y - c.h / 2);
      ctx.lineTo(c.x + c.w / 2 - 5, c.y + c.h / 2); ctx.lineTo(c.x - c.w / 2 + 5, c.y + c.h / 2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c.x - c.w / 2 + 3, c.y - c.h / 2 + 3);
      ctx.lineTo(c.x + c.w / 2 - 3, c.y - c.h / 2 + 3); ctx.stroke();
     }
     /* HUD. */
    ctx.fillStyle = '#2a1a0a'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Score: ' + score, 14, 32);
    ctx.textAlign = 'right'; ctx.fillText('Lives: ' + lives, W - 14, 32);
     /* Overlays. */
    if (state === 'title') {
      ctx.fillStyle = 'rgba(42,26,10,0.55)'; ctx.fillRect(0, H / 2 - 60, W, 120);
      ctx.fillStyle = '#f5e6d0'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Sake Cup Catch', W / 2, H / 2 - 18);
      ctx.font = '16px sans-serif'; ctx.fillText('Press Space or tap to start', W / 2, H / 2 + 18);
     }
    if (state === 'end') {
      ctx.fillStyle = 'rgba(42,26,10,0.7)'; ctx.fillRect(0, H / 2 - 70, W, 140);
      ctx.fillStyle = '#f5e6d0'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      var rank = score >= 20 ? 'Master Pourer' : score >= 10 ? 'Skilled Server' : 'Apprentice';
      ctx.fillText('Game Over — ' + rank, W / 2, H / 2 - 25);
      ctx.font = '20px sans-serif'; ctx.fillText('Score: ' + score, W / 2, H / 2 + 8);
      ctx.font = '15px sans-serif'; ctx.fillStyle = '#d4a574';
      ctx.fillText('Press Space or tap to retry', W / 2, H / 2 + 40);
     }
   }

  function boot() {
    canvas = document.getElementById('game'); ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    FoundryInput.install(canvas, { actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], start: ['Space'] } });
    FoundryAudio.install();
    var go = function () {
      if (state === 'title') { reset(); state = 'play'; FoundryAudio.click(); }
      else if (state === 'end') { reset(); state = 'play'; FoundryAudio.click(); }
     };
    window.addEventListener('keydown', go); canvas.addEventListener('pointerdown', go);
    render(0);
    FoundryLoop.start({ update: update, render: render });
   }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
