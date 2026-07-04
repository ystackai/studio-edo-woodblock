(function () {
 'use strict';
  var W = 480, H = 640, canvas, ctx;
  var phase = 'waiting', boat = { x: W / 2, y: 520, w: 36, h: 48, bob: 0 };
  var debris = [], ripples = [], score = 0, survival = 0;
  var debrisTimer = 0, flash = 0, shake = 0, debrief = {};

  function hitObstacle() {
    phase = 'hit'; shake = 7; flash = 0.55; FoundryAudio.fail();
    debrief = { msg: 'STRUCK', sub: score + ' dodged in ' + survival.toFixed(1) + 's',
      cls: score >= 12 ? 'Master Boatman' : score >= 6 ? 'Canal Hand' : score >= 3 ? 'River Runner' : 'Green Apprentice' };
    }

  function resetGame() {
    boat.x = W / 2; debris = []; score = 0; survival = 0;
    ripples = []; flash = 0; shake = 0; debrisTimer = 0;
    FoundryAudio.droneStart(55);
    }

  function update(dt) {
    var t = performance.now() / 1000;
    if (phase === 'waiting') {
      boat.bob = Math.sin(t * 1.5) * 3;
      if (FoundryInput.pointer.justDown) { phase = 'playing'; FoundryAudio.droneStart(55); FoundryAudio.click(); }
      FoundryInput.update(dt); return;
      }
    if (phase === 'hit') {
      shake = Math.max(0, shake - dt * 10); flash = Math.max(0, flash - dt * 2.5);
      if (shake <= 0) { phase = 'debrief'; FoundryAudio.droneStop(); }
      FoundryInput.update(dt); return;
      }
    if (phase === 'debrief') {
      if (FoundryInput.pointer.justDown) { phase = 'waiting'; resetGame(); }
      FoundryInput.update(dt); return;
      }
    var spd = 140;
    if (FoundryInput.held('left')) boat.x -= spd * dt;
    if (FoundryInput.held('right')) boat.x += spd * dt;
    if (FoundryInput.pointer.down) {
      boat.x += FoundryInput.pointer.x < W / 2 ? -spd * dt : spd * dt;
      }
    boat.x = Math.max(boat.w / 2, Math.min(W - boat.w / 2, boat.x));
    debrisTimer -= dt;
    if (debrisTimer <= 0) {
      debris.push({ x: 30 + Math.random() * (W - 60), y: -25,
        w: 20 + Math.random() * 28, h: 18 + Math.random() * 18,
        spd: 75 + Math.random() * 50, kind: Math.random() > 0.5 ? 'log' : 'crate' });
      debrisTimer = Math.max(0.35, 0.7 - survival * 0.004); FoundryAudio.whoosh();
      }
    for (var i = debris.length - 1; i >= 0; i--) {
      debris[i].y += debris[i].spd * dt;
      var d = debris[i];
      if (Math.abs(d.x - boat.x) < (d.w + boat.w) / 2.4 && Math.abs(d.y - boat.y) < (d.h + boat.h) / 2.4) { hitObstacle(); break; }
      if (d.y > H + 35) { debris.splice(i, 1); score++; if (score % 5 === 0) FoundryAudio.pickup(); }
      }
    survival += dt;
    if (Math.random() < dt * 2.5) ripples.push({ x: boat.x, y: boat.y + 22, r: 4, a: 0.5 });
    for (var i = ripples.length - 1; i >= 0; i--) {
      ripples[i].r += 35 * dt; ripples[i].a -= dt * 0.7;
      if (ripples[i].a <= 0) ripples.splice(i, 1);
      }
    FoundryInput.update(dt);
    }

  function render(alpha) {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 2, (Math.random() - 0.5) * shake * 2);
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a1628'); grad.addColorStop(0.5, '#0f2240'); grad.addColorStop(1, '#0a1628');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    var t = performance.now() / 1000;
    ctx.strokeStyle = 'rgba(40,80,120,0.25)'; ctx.lineWidth = 1;
    for (var y = 0; y < H; y += 35) { ctx.beginPath();
      for (var x = 0; x < W; x += 6) ctx.lineTo(x, y + Math.sin(x / 28 + t * 1.8 + y / 50) * 3.5);
      ctx.stroke(); }
    for (var i = 0; i < ripples.length; i++) {
      ctx.strokeStyle = 'rgba(100,160,200,' + ripples[i].a + ')'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(ripples[i].x, ripples[i].y, ripples[i].r, 0, Math.PI * 2); ctx.stroke(); }
    for (var i = 0; i < debris.length; i++) {
      var d = debris[i];
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(d.x - d.w / 2 + 3, d.y - d.h / 2 + 3, d.w, d.h);
      ctx.fillStyle = d.kind === 'log' ? '#4a3520' : '#6b4423';
      ctx.fillRect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h); }
    var by = boat.y + boat.bob;
    ctx.fillStyle = '#8b6b3a'; ctx.beginPath();
    ctx.moveTo(boat.x - boat.w / 2, by - boat.h / 3); ctx.lineTo(boat.x + boat.w / 2, by - boat.h / 3);
    ctx.lineTo(boat.x + boat.w / 2 - 8, by + boat.h / 3); ctx.lineTo(boat.x - boat.w / 2 + 8, by + boat.h / 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8d8b0'; ctx.beginPath();
    ctx.moveTo(boat.x, by - boat.h / 2 - 6); ctx.lineTo(boat.x + 14, by - boat.h / 4);
    ctx.lineTo(boat.x, by - boat.h / 3); ctx.closePath(); ctx.fill();
    if (flash > 0) { ctx.fillStyle = 'rgba(255,90,40,' + flash + ')'; ctx.fillRect(0, 0, W, H); }
    if (phase === 'waiting') {
      ctx.fillStyle = '#e8d8b0'; ctx.font = 'bold 22px serif'; ctx.textAlign = 'center';
      ctx.fillText('Midnight Canal', W / 2, 95);
      ctx.font = '14px sans-serif'; ctx.fillStyle = 'rgba(160,180,200,0.7)';
      ctx.fillText('Tap or press any key to set sail', W / 2, 130);
      ctx.fillText('Arrow keys / A-D to steer', W / 2, 155); }
    if (phase === 'playing') {
      ctx.fillStyle = 'rgba(232,216,176,0.85)'; ctx.font = '15px sans-serif';
      ctx.textAlign = 'right'; ctx.fillText(score + ' dodged', W - 12, 28);
      ctx.textAlign = 'left'; ctx.fillText(survival.toFixed(1) + 's', 12, 28); }
    if (phase === 'debrief') {
      ctx.fillStyle = 'rgba(10,22,40,0.88)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e8d8b0'; ctx.font = 'bold 30px serif'; ctx.textAlign = 'center';
      ctx.fillText(debrief.msg, W / 2, H / 2 - 45);
      ctx.font = '16px sans-serif'; ctx.fillStyle = 'rgba(200,210,220,0.9)';
      ctx.fillText(debrief.sub, W / 2, H / 2 + 5);
      ctx.font = '14px serif'; ctx.fillStyle = '#c4a050';
      ctx.fillText('\u2014 ' + debrief.cls + ' \u2014', W / 2, H / 2 + 40);
      ctx.font = '13px sans-serif'; ctx.fillStyle = 'rgba(160,180,200,0.6)';
      ctx.fillText('Tap to sail again', W / 2, H / 2 + 80); }
    ctx.restore();
    }

  FoundryInput.install(document.getElementById('game'), {
    actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] } });
  FoundryAudio.install();
  canvas = document.getElementById('game'); ctx = canvas.getContext('2d');
  FoundryLoop.start({ update: update, render: render });
})();
