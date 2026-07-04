// River Lantern — guide a lantern boat downstream, dodge floating debris.
(function () {
  'use strict';
  var C = document.getElementById('canvas'), X = C.getContext('2d');
  var W = 800, H = 500;
  var boat = { x: 100, y: H / 2, vy: 0, bob: 0 };
  var debris = [], score = 0, t = 0, lastSpawn = 0;
  var phase = 'waiting'; // waiting -> playing -> hit|shore

  for (var i = 0; i < 4; i++)
    debris.push({ x: 350 + i * 130, y: 70 + Math.random() * 360,
      w: 38 + Math.random() * 30, h: 9 + Math.random() * 6, spd: 60 + Math.random() * 30 });

  FoundryInput.install(C, { actions: { up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'] } });

  function collide(b, d) {
    var m = 10;
    return b.x + m > d.x && b.x - 24 + m < d.x + d.w &&
      b.y - 8 + m < d.y + d.h && b.y + 8 - m > d.y;
   }

  function update(dt) {
    // End-state: consume input to restart
    if (phase === 'hit' || phase === 'shore') {
      if (FoundryInput.consume('up') || FoundryInput.consume('down')) restart();
      FoundryInput.update(dt);
      return;
    }
    // Waiting: first interaction starts the game immediately
    if (phase === 'waiting') {
      var started = FoundryInput.pointer.justDown ||
        FoundryInput.held('up') || FoundryInput.held('down');
      if (started) {
        phase = 'playing';
        if (FoundryInput.pointer.justDown) boat.vy = (FoundryInput.pointer.y - boat.y) * 2;
      }
      FoundryInput.update(dt);
      return;
    }
    // Playing: movement + collision
    var spd = 240;
    if (FoundryInput.held('up'))   boat.vy -= spd * dt;
    if (FoundryInput.held('down')) boat.vy += spd * dt;
    if (FoundryInput.pointer.justDown) boat.vy += (FoundryInput.pointer.y - boat.y) * 1.5;
    boat.vy *= 0.91;
    boat.y += boat.vy * dt;
    boat.y = Math.max(22, Math.min(H - 22, boat.y));
    boat.bob += dt * 3.5;
    t += dt; score = Math.floor(t * 10);
    lastSpawn += dt;
    if (lastSpawn > 0.75) { spawn(); lastSpawn = 0; }
    for (var i = debris.length - 1; i >= 0; i--) {
      debris[i].x -= debris[i].spd * dt;
      if (debris[i].x < -60) { debris.splice(i, 1); continue; }
      if (collide(boat, debris[i])) { phase = 'hit'; }
    }
    if (t >= 35) { phase = 'shore'; score += 500; }
    FoundryInput.update(dt);
   }

  function spawn() {
    debris.push({ x: W + 20, y: 40 + Math.random() * (H - 80),
      w: 32 + Math.random() * 36, h: 8 + Math.random() * 8, spd: 55 + Math.random() * 40 });
   }

  function restart() {
    phase = 'waiting'; t = 0; score = 0; boat.y = H / 2; boat.vy = 0; boat.bob = 0;
    debris = []; lastSpawn = 0;
    for (var i = 0; i < 4; i++)
      debris.push({ x: 350 + i * 130, y: 70 + Math.random() * 360,
        w: 38 + Math.random() * 30, h: 9 + Math.random() * 6, spd: 60 + Math.random() * 30 });
   }

  function render() {
    X.clearRect(0, 0, W, H);
    // sky
    var sky = X.createLinearGradient(0, 0, 0, H * 0.52);
    sky.addColorStop(0, '#1a1035'); sky.addColorStop(0.6, '#3d2060');
    sky.addColorStop(1, '#d4825a');
    X.fillStyle = sky; X.fillRect(0, 0, W, H * 0.52);
    // mountains
    X.fillStyle = '#2a1845'; X.beginPath(); X.moveTo(0, H * 0.52);
    for (var x = 0; x <= W; x += 40)
      X.lineTo(x, H * 0.4 + Math.sin(x * 0.015 + t * 0.3) * 22);
    X.lineTo(W, H * 0.52); X.fill();
    // river
    var riv = X.createLinearGradient(0, H * 0.52, 0, H);
    riv.addColorStop(0, '#1e5a6e'); riv.addColorStop(1, '#0c2e3a');
    X.fillStyle = riv; X.fillRect(0, H * 0.52, W, H * 0.48);
    // wave lines
    X.strokeStyle = 'rgba(100,180,200,0.16)'; X.lineWidth = 1.2;
    for (var r = 0; r < 5; r++) {
      var wy = H * 0.52 + 22 + r * 26;
      X.beginPath();
      for (var wx = 0; wx < W; wx += 4)
        X.lineTo(wx, wy + Math.sin(wx * 0.025 + t * 1.8 + r) * 3);
      X.stroke();
    }
    // debris
    for (var i = 0; i < debris.length; i++) {
      var d = debris[i];
      X.fillStyle = '#4a3525';
      X.beginPath(); X.roundRect(d.x, d.y, d.w, d.h, 3); X.fill();
      X.strokeStyle = '#6b5040'; X.lineWidth = 1.2;
      X.beginPath(); X.moveTo(d.x + 4, d.y - 1);
      X.lineTo(d.x + 4, d.y - d.h * 0.7); X.stroke();
    }
    // boat
    var by = boat.y + Math.sin(boat.bob) * 3;
    X.save();
    X.fillStyle = '#3a2218'; X.beginPath();
    X.moveTo(boat.x - 26, by + 4);
    X.quadraticCurveTo(boat.x, by + 15, boat.x + 26, by + 4);
    X.lineTo(boat.x + 20, by - 2);
    X.quadraticCurveTo(boat.x, by + 6, boat.x - 20, by - 2);
    X.fill();
    X.strokeStyle = '#5a3a28'; X.lineWidth = 2.5;
    X.beginPath(); X.moveTo(boat.x, by - 2); X.lineTo(boat.x, by - 30); X.stroke();
    var glow = X.createRadialGradient(boat.x, by - 25, 2, boat.x, by - 25, 32);
    glow.addColorStop(0, 'rgba(255,170,60,0.8)');
    glow.addColorStop(1, 'rgba(255,170,60,0)');
    X.fillStyle = glow; X.fillRect(boat.x - 35, by - 58, 70, 70);
    X.fillStyle = '#ffaa3c'; X.beginPath();
    X.arc(boat.x, by - 25, 5, 0, Math.PI * 2); X.fill();
    X.restore();
    // HUD
    X.fillStyle = 'rgba(255,230,190,0.8)'; X.font = '14px system-ui,sans-serif';
    X.textAlign = 'left'; X.fillText('score ' + score, 14, 24);
    var pct = Math.min(1, t / 35);
    X.fillStyle = 'rgba(255,230,190,0.25)'; X.fillRect(14, 32, 200, 4);
    X.fillStyle = '#ffaa3c'; X.fillRect(14, 32, 200 * pct, 4);
    if (phase === 'waiting') {
      X.fillStyle = 'rgba(255,230,190,0.55)'; X.font = 'bold 18px system-ui';
      X.textAlign = 'center'; X.fillText('click or press to sail', W / 2, H / 2 - 40);
    } else if (phase === 'hit') {
      X.fillStyle = '#cc5544'; X.font = 'bold 26px system-ui'; X.textAlign = 'center';
      X.fillText('Struck debris!', W / 2, H / 2 - 10);
      X.font = '14px system-ui'; X.fillStyle = 'rgba(255,230,190,0.65)';
      X.fillText('score ' + score + ' — click or press to retry', W / 2, H / 2 + 18);
    } else if (phase === 'shore') {
      X.fillStyle = '#ffcc66'; X.font = 'bold 26px system-ui'; X.textAlign = 'center';
      X.fillText('Shore reached!', W / 2, H / 2 - 10);
      X.font = '14px system-ui'; X.fillStyle = 'rgba(255,230,190,0.65)';
      X.fillText('final score ' + score + ' — click or press to sail again', W / 2, H / 2 + 18);
    }
   }

  render();
  FoundryLoop.start({ update: update, render: function () { render(); } });
})();
