(function () {
    'use strict';
  var C = document.getElementById('c'), X = C.getContext('2d'), W = C.width, H = C.height;
  var catcher = { x: W / 2, y: H - 50, w: 80, h: 20 };
  var objs = [], score = 0, misses = 0, phase = 'title', timer = 30, spawnCD = 0;
  var bgCells = [];
  for (var r = 0; r < 16; r++) for (var c = 0; c < 12; c++)
    bgCells.push({ x: c * 40 + 10, y: r * 40 + 10, s: 12 + Math.random() * 14, h: 25 + Math.random() * 20 });
  FoundryAudio.install();
  FoundryInput.install(C, { actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] } });
  var started = false;
  function doStart() { if (!started) { started = true; phase = 'play'; timer = 30; FoundryAudio.droneStart(55); } }
  C.addEventListener('click', doStart);
  document.addEventListener('keydown', function (e) { if (phase === 'title' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD')) doStart(); });
  function spawn() {
    var t = Math.random() < 0.45 ? 'petal' : Math.random() < 0.82 ? 'block' : 'ink';
    objs.push({ x: 30 + Math.random() * (W - 60), y: -20, vy: 100 + Math.random() * 150,
      w: t === 'petal' ? 16 : 28, h: t === 'petal' ? 16 : 24, t: t });
  }
  function update(dt) {
    if (phase === 'title') {
      if (FoundryInput.pointer.justDown) doStart();
      FoundryInput.update(dt);
      return;
    }
    if (phase === 'end') {
      if (FoundryInput.pointer.justDown) { phase = 'title'; objs = []; score = 0; misses = 0; started = false; }
      FoundryInput.update(dt);
      return;
    }
    var spd = 280;
    if (FoundryInput.held('left')) catcher.x -= spd * dt;
    if (FoundryInput.held('right')) catcher.x += spd * dt;
    if (FoundryInput.pointer.down) catcher.x += (FoundryInput.pointer.x - catcher.x) * 8 * dt;
    catcher.x = Math.max(catcher.w / 2, Math.min(W - catcher.w / 2, catcher.x));
    timer -= dt;
    if (timer <= 0 || misses >= 10) { phase = 'end'; FoundryAudio.droneStop(); FoundryAudio.success(); }
    spawnCD -= dt; if (spawnCD <= 0) { spawn(); spawnCD = 0.35 + Math.random() * 0.5; }
    for (var i = objs.length - 1; i >= 0; i--) {
      var o = objs[i]; o.y += o.vy * dt;
      if (o.y > H + 20) { if (o.t !== 'ink') { misses++; FoundryAudio.fail(); } objs.splice(i, 1); continue; }
      if (Math.abs(o.y - catcher.y) < (o.h / 2 + catcher.h / 2) && Math.abs(o.x - catcher.x) < (o.w / 2 + catcher.w / 2)) {
        if (o.t === 'ink') { misses++; FoundryAudio.fail(); } else { score += o.t === 'block' ? 15 : 10; FoundryAudio.pickup(); }
        objs.splice(i, 1);
      }
    }
    FoundryInput.update(dt);
  }
  var titlePulse = 0;
  function render(alpha) {
    if (phase === 'title') {
      X.fillStyle = '#1a1410'; X.fillRect(0, 0, W, H);
      for (var i = 0; i < bgCells.length; i++) { var b = bgCells[i]; X.fillStyle = 'rgba(139,105,20,0.08)'; X.fillRect(b.x, b.y, b.s, b.s * 0.6); }
      X.fillStyle = '#f5e6c8'; X.font = 'bold 32px serif'; X.textAlign = 'center';
      X.fillText('Woodblock Catcher', W / 2, H / 2 - 40);
      titlePulse += alpha * 0.02;
      var alpha_glow = 0.5 + 0.5 * Math.sin(titlePulse * 3);
      X.fillStyle = 'rgba(196,148,58,' + (0.5 + alpha_glow * 0.5).toFixed(2) + ')';
      X.font = '18px serif';
      X.fillText('Click or tap to start', W / 2, H / 2 + 10);
      X.fillStyle = '#8b6914'; X.font = '14px serif';
      X.fillText('Catch petals & blocks. Avoid ink drops.', W / 2, H / 2 + 40);
      X.textAlign = 'left';
      return;
    }
    X.fillStyle = '#f5e6c8'; X.fillRect(0, 0, W, H);
    for (var i = 0; i < bgCells.length; i++) { var c = bgCells[i]; X.fillStyle = 'hsl('+c.h+',35%,82%)'; X.fillRect(c.x, c.y, c.s, c.s * 0.6); }
    for (var i = 0; i < objs.length; i++) { (function (o) {
      if (o.t === 'petal') { X.fillStyle = '#e88fa0'; X.beginPath(); X.arc(o.x, o.y, 8, 0, 6.28); X.fill(); X.fillStyle = '#f4c0cb'; X.beginPath(); X.arc(o.x - 2, o.y - 2, 4, 0, 6.28); X.fill(); }
      else if (o.t === 'block') { X.fillStyle = '#8b5e3c'; X.fillRect(o.x - 14, o.y - 12, 28, 24); X.fillStyle = '#c4943a'; X.fillRect(o.x - 11, o.y - 9, 22, 4); X.fillRect(o.x - 11, o.y + 5, 22, 4); }
      else { X.fillStyle = '#1a1a2e'; X.beginPath(); X.arc(o.x, o.y, 10, 0, 6.28); X.fill(); X.fillStyle = '#4a4a6a'; X.beginPath(); X.arc(o.x - 2, o.y - 2, 3, 0, 6.28); X.fill(); }
    })(objs[i]); }
    X.fillStyle = '#c4943a'; X.fillRect(catcher.x - 40, catcher.y - 10, 80, 20);
    X.fillStyle = '#8b5e3c'; X.fillRect(catcher.x - 43, catcher.y - 13, 86, 4); X.fillRect(catcher.x - 43, catcher.y + 9, 86, 4);
    X.fillStyle = '#1a1410'; X.font = 'bold 18px serif';
    X.fillText('Score: ' + score, 14, 30); X.fillText('Misses: ' + misses + '/10', 14, 54);
    if (phase === 'play') X.fillText('Time: ' + Math.max(0, Math.ceil(timer)) + 's', W - 120, 30);
    if (phase === 'end') {
      var rank = score >= 300 ? 'Master Printer' : score >= 150 ? 'Skilled Artisan' : 'Apprentice';
      X.fillStyle = 'rgba(26,20,16,0.75)'; X.fillRect(0, H / 2 - 60, W, 120);
      X.fillStyle = '#f5e6c8'; X.font = 'bold 24px serif'; X.textAlign = 'center';
      X.fillText('Round Complete', W / 2, H / 2 - 22);
      X.font = '18px serif'; X.fillText('Score: ' + score + ' | Rank: ' + rank, W / 2, H / 2 + 6);
      X.font = '14px serif'; X.fillText('Click to play again', W / 2, H / 2 + 32);
      X.textAlign = 'left';
    }
  }
  FoundryLoop.start({ update: update, render: render });
})();
