(function () {
  'use strict';
  var C = document.getElementById('canvas'), X = C.getContext('2d');
  var W = 800, H = 500, T = 42; // 42s to reach shore
  var boat = { x: 100, y: H / 2, vy: 0 };
  var debris = [], score = 0, over = false, started = false;
  var t = 0, lastSpawn = 0;

  // Seed initial debris so first paint is non-uniform
  for (var i = 0; i < 4; i++) {
    debris.push({ x: 300 + i * 140, y: 60 + Math.floor(Math.random() * 380),
      w: 40 + Math.random() * 30, h: 10 + Math.random() * 6, spd: 60 + Math.random() * 30 });
  }

  FoundryInput.install(C, { actions: { up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'] } });

  function spawn() {
    debris.push({ x: W + 20, y: 40 + Math.random() * (H - 80),
      w: 35 + Math.random() * 35, h: 8 + Math.random() * 8, spd: 55 + Math.random() * 40 });
  }

  function collide(b, d) {
    var m = 10; return (b.x + m > d.x && b.x - 24 + m < d.x + d.w &&
      b.y - 8 + m < d.y + d.h && b.y + 8 - m > d.y);
  }

  function update(dt) {
    if (over) { if (FoundryInput.consume('up')) restart(); return; }
    if (!started) return;
    var spd = 220;
    if (FoundryInput.held('up')) boat.vy -= spd * dt;
    if (FoundryInput.held('down')) boat.vy += spd * dt;
    if (FoundryInput.pointer.justDown) {
      started = true;
      var ty = FoundryInput.pointer.y;
      boat.vy = (ty - boat.y) * 3;
    }
    boat.vy *= 0.92;
    boat.y += boat.vy * dt;
    boat.y = Math.max(20, Math.min(H - 20, boat.y));
    t += dt; score = Math.floor(t * 10);
    lastSpawn += dt;
    if (lastSpawn > 0.8) { spawn(); lastSpawn = 0; }
    for (var i = debris.length - 1; i >= 0; i--) {
      debris[i].x -= debris[i].spd * dt;
      if (debris[i].x < -60) { debris.splice(i, 1); continue; }
      if (collide(boat, debris[i])) { over = true; }
    }
    if (t >= T) { over = true; score += 500; }
    FoundryInput.update(dt);
  }

  function restart() {
    over = false; t = 0; score = 0; boat.y = H / 2; boat.vy = 0;
    debris = []; lastSpawn = 0;
    for (var i = 0; i < 4; i++)
      debris.push({ x: 300 + i * 140, y: 60 + Math.floor(Math.random() * 380),
        w: 40 + Math.random() * 30, h: 10 + Math.random() * 6, spd: 60 + Math.random() * 30 });
  }

  function drawSky() {
    var g = X.createLinearGradient(0, 0, 0, H * 0.55);
    g.addColorStop(0, '#1a1035'); g.addColorStop(0.5, '#3d2060'); g.addColorStop(1, '#d4825a');
    X.fillStyle = g; X.fillRect(0, 0, W, H * 0.55);
    // distant mountains
    X.fillStyle = '#2a1845';
    X.beginPath(); X.moveTo(0, H * 0.55);
    for (var i = 0; i <= W; i += 40) X.lineTo(i, H * 0.4 + Math.sin(i * 0.015) * 25);
    X.lineTo(W, H * 0.55); X.fill();
  }

  function drawRiver() {
    var y0 = H * 0.55;
    var g = X.createLinearGradient(0, y0, 0, H);
    g.addColorStop(0, '#1e5a6e'); g.addColorStop(1, '#0c2e3a');
    X.fillStyle = g; X.fillRect(0, y0, W, H - y0);
    // subtle wave lines
    X.strokeStyle = 'rgba(100,180,200,0.18)'; X.lineWidth = 1.2;
    for (var r = 0; r < 6; r++) {
      var wy = y0 + 25 + r * 28;
      X.beginPath();
      for (var wx = 0; wx < W; wx += 4) X.lineTo(wx, wy + Math.sin(wx * 0.025 + t * 1.8 + r) * 3.5);
      X.stroke();
    }
  }

  function drawBoat() {
    var bx = boat.x, by = boat.y;
    X.save();
    // hull
    X.fillStyle = '#3a2218';
    X.beginPath(); X.moveTo(bx - 26, by + 3); X.quadraticCurveTo(bx, by + 14, bx + 26, by + 3);
    X.lineTo(bx + 20, by - 2); X.quadraticCurveTo(bx, by + 5, bx - 20, by - 2); X.fill();
    // mast
    X.strokeStyle = '#5a3a28'; X.lineWidth = 2.5;
    X.beginPath(); X.moveTo(bx, by - 2); X.lineTo(bx, by - 28); X.stroke();
    // lantern glow
    var glow = X.createRadialGradient(bx, by - 22, 2, bx, by - 22, 30);
    glow.addColorStop(0, 'rgba(255,170,60,0.85)'); glow.addColorStop(1, 'rgba(255,170,60,0)');
    X.fillStyle = glow; X.fillRect(bx - 32, by - 54, 64, 64);
    // lantern body
    X.fillStyle = '#ffaa3c';
    X.beginPath(); X.arc(bx, by - 22, 5, 0, Math.PI * 2); X.fill();
    X.restore();
  }

  function drawDebris() {
    for (var i = 0; i < debris.length; i++) {
      var d = debris[i];
      X.fillStyle = '#4a3525';
      X.beginPath(); X.roundRect(d.x, d.y, d.w, d.h, 3); X.fill();
      // reed accent
      X.strokeStyle = '#6b5040'; X.lineWidth = 1;
      X.beginPath(); X.moveTo(d.x + 3, d.y); X.lineTo(d.x + 3, d.y - d.h * 0.6); X.stroke();
    }
  }

  function drawUI() {
    X.fillStyle = 'rgba(255,230,190,0.85)'; X.font = '14px system-ui, sans-serif';
    X.textAlign = 'left'; X.fillText('score ' + score, 14, 24);
    var pct = Math.min(1, t / T);
    X.fillStyle = 'rgba(255,230,190,0.35)'; X.fillRect(14, 32, 200, 5);
    X.fillStyle = '#ffaa3c'; X.fillRect(14, 32, 200 * pct, 5);
    if (t >= T) {
      X.fillStyle = '#ffcc66'; X.font = 'bold 28px system-ui'; X.textAlign = 'center';
      X.fillText('Shore reached!', W / 2, H / 2 - 10);
      X.font = '14px system-ui'; X.fillStyle = 'rgba(255,230,190,0.7)';
      X.fillText('final score ' + score + '  tap or press to go again', W / 2, H / 2 + 20);
    } else if (over) {
      X.fillStyle = '#cc5544'; X.font = 'bold 28px system-ui'; X.textAlign = 'center';
      X.fillText('Struck debris!', W / 2, H / 2 - 10);
      X.font = '14px system-ui'; X.fillStyle = 'rgba(255,230,190,0.7)';
      X.fillText('score ' + score + '  tap or press to try again', W / 2, H / 2 + 20);
    }
  }

  function render(alpha) {
    X.clearRect(0, 0, W, H);
    drawSky(); drawRiver(); drawDebris(); drawBoat(); drawUI();
  }

  // First paint: show scene immediately before interaction
  render(0);

  FoundryLoop.start({ update: update, render: render });
})();
