/* Timber Drop — catch falling blocks on the dock.
 * Creative intent: "This should feel like a dockyard worker
 * sliding a wooden crate to catch colorful timber drops."
 */
(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var W, H, dockY;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dockY = H * 0.85;
  }

  var player = { x: 0, y: 0, w: 90, h: 30, speed: 420 };
  var drops = [];
  var score = 0;
  var tick = 0;

  function spawnDrop() {
    var colors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d4ac0d', '#e67e22'];
    drops.push({
      x: Math.random() * (W - 50) + 25,
      y: -40, w: 40, h: 40,
      vy: 140 + Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  // Initial drops so the first paint shows action
  for (var i = 0; i < 4; i++) {
    var d = {
      x: (W / 5) * (i + 1),
      y: 40 + Math.random() * (dockY - 140),
      w: 36, h: 36,
      vy: 120 + Math.random() * 80,
      color: ['#c0392b', '#2980b9', '#27ae60', '#8e44ad'][i]
    };
    drops.push(d);
  }

  FoundryInput.install(canvas, {
    actions: {
      left: ['ArrowLeft', 'KeyA'],
      right: ['ArrowRight', 'KeyD'],
      jump: ['Space']
    }
  });

  function update(dt) {
    tick += dt;
    var px = player.x;
    if (FoundryInput.held('left'))  px -= player.speed * dt;
    if (FoundryInput.held('right')) px += player.speed * dt;
    if (FoundryInput.consume('jump') || FoundryInput.pointer.justDown) {
      // Clear all drops for a bonus
      score += drops.length * 5;
      drops.length = 0;
    }
    player.x = Math.max(0, Math.min(W - player.w, px));
    player.y = dockY - player.h - 4;

    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.y += d.vy * dt;
      // catch check
      if (d.y + d.h >= player.y && d.y <= player.y + player.h &&
          d.x + d.w > player.x && d.x < player.x + player.w) {
        score += 10;
        drops.splice(i, 1);
        continue;
      }
      // missed
      if (d.y > H + 60) drops.splice(i, 1);
    }

    if (tick > 1.2) { tick = 0; spawnDrop(); }
    FoundryInput.update(dt);
  }

  function render(alpha) {
    // Background bands — sky, water, dock
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(0, 0, W, H * 0.4);
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(0, H * 0.4, W, H * 0.25);
    ctx.fillStyle = '#7d6608';
    ctx.fillRect(0, H * 0.65, W, H * 0.15);
    ctx.fillStyle = '#6e4b0a';
    ctx.fillRect(0, dockY, W, H - dockY);

    // Dock planks detail
    ctx.strokeStyle = '#5d3e08';
    ctx.lineWidth = 1.5;
    for (var x = 0; x < W; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, dockY);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Guide lines from each drop
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 1.5;
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.strokeStyle = d.color + '88';
      ctx.beginPath();
      ctx.moveTo(d.x + d.w / 2, d.y + d.h);
      ctx.lineTo(d.x + d.w / 2, dockY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw drops
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);
      // inner wood-grain line
      ctx.strokeStyle = d.color + 'cc';
      ctx.beginPath();
      ctx.moveTo(d.x + 8, d.y + 5);
      ctx.lineTo(d.x + d.w - 8, d.y + 5);
      ctx.stroke();
    }

    // Player block (wooden crate on dock)
    ctx.fillStyle = '#d4a437';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(player.x, player.y, player.w, player.h);
    // crate cross
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x + 6, player.y + 4);
    ctx.lineTo(player.x + player.w - 6, player.y + player.h - 4);
    ctx.moveTo(player.x + player.w - 6, player.y + 4);
    ctx.lineTo(player.x + 6, player.y + player.h - 4);
    ctx.stroke();

    // Score + title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TIMBER DROP  —  Score: ' + score, 16, 36);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#aab';
    ctx.fillText('Arrows / A-D to move  |  Space / Tap to clear', 16, 60);

    // Title bar when no drops on screen
    if (drops.length === 0) {
      ctx.fillStyle = '#ffeaa7';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Catch the falling timber!', W / 2, H * 0.3);
      ctx.font = '16px monospace';
      ctx.fillText('Waiting for next drop…', W / 2, H * 0.3 + 32);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  FoundryLoop.start({ update: update, render: render });
})();
