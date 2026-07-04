/* Q3 Blocks Mini Live v7 — brick-catcher.
 * Creative intent: This should feel like a nimble brick-catcher — a paddle
 * slides beneath a steady rain of colored blocks, catching them for points.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var W, H;

  // Edo palette
  var BANDS = ['#2d1b3d','#1b3a4b','#3b2b4a','#1a3c3a','#2b2b3a','#1b2a3a'];
  var BLOCK_COLORS = ['#e8a87c','#d4726a','#85a89b','#c1a05d','#7eb8c7','#b5838f'];
  var PLAYER = '#f5d0a5';
  var PLAYER_W = 72, PLAYER_H = 16, BLOCK_S = 32;
  var PADDING = 40, COLS = 6;

  var player = { x: 0, y: 0, vx: 0 };
  var blocks = [];
  var score = 0;
  var tick = 0;
  var speed = 110; // px/s for blocks

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    player.y = H - 60;
    if (!player.x) player.x = W / 2;
  }

  // Spawn several blocks so the first paint is non-uniform
  function seedBlocks() {
    for (var i = 0; i < 7; i++) {
      blocks.push({
        x: 60 + Math.random() * (W - 120),
        y: -i * (H / 7) + Math.random() * 40,
        color: BLOCK_COLORS[i % BLOCK_COLORS.length],
        v: speed + Math.random() * 40 - 20
      });
    }
  }

  // Install input: left/right + pointer tracking
  FoundryInput.install(canvas, {
    actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] }
  });

  function update(dt) {
    tick += dt;

    // Player movement via foundry input
    player.vx = 0;
    if (FoundryInput.held('left')) player.vx = -340;
    if (FoundryInput.held('right')) player.vx = 340;

    // Pointer override when pressed
    if (FoundryInput.pointer.down) {
      player.x += (FoundryInput.pointer.x - player.x) * 0.25;
    } else {
      player.x += player.vx * dt;
    }
    player.x = Math.max(PADDING, Math.min(W - PADDING, player.x));

    // Spawn new blocks
    if (tick % 1.2 < dt) {
      blocks.push({
        x: 60 + Math.random() * (W - 120),
        y: -BLOCK_S,
        color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
        v: speed + Math.random() * 30 - 15
      });
    }

    // Update blocks
    for (var i = blocks.length - 1; i >= 0; i--) {
      blocks[i].y += blocks[i].v * dt;

      // Catch: block overlaps player
      if (blocks[i].y + BLOCK_S >= player.y && blocks[i].y <= player.y + PLAYER_H &&
          blocks[i].x + BLOCK_S > player.x - PLAYER_W / 2 && blocks[i].x < player.x + PLAYER_W / 2) {
        score += 10;
        blocks.splice(i, 1);
        continue;
      }
      // Miss: block fell off screen
      if (blocks[i].y > H + BLOCK_S) {
        blocks.splice(i, 1);
      }
    }

    // Keep max 20 blocks on screen
    while (blocks.length > 20) blocks.shift();

    // Age input buffers — call LAST per foundry contract
    FoundryInput.update(dt);
  }

  function render(alpha) {
    // Multi-color background bands
    var bandH = H / BANDS.length;
    for (var i = 0; i < BANDS.length; i++) {
      ctx.fillStyle = BANDS[i];
      ctx.fillRect(0, i * bandH, W, bandH + 1);
    }

    // Visible guide lines — vertical dashed
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    for (var i = 1; i < COLS; i++) {
      var gx = PADDING + i * (W - 2 * PADDING) / COLS;
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Falling blocks
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, BLOCK_S, BLOCK_S);
      // Subtle border
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, BLOCK_S, BLOCK_S);
    }

    // Player block — centered at player.x
    ctx.fillStyle = PLAYER;
    ctx.fillRect(player.x - PLAYER_W / 2, player.y, PLAYER_W, PLAYER_H);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x - PLAYER_W / 2, player.y, PLAYER_W, PLAYER_H);

    // Score text
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCORE  ' + score, W / 2, 36);

    // Instruction hint
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('← → or A/D to move  •  click/drag to aim', W / 2, H - 12);
  }

  // Boot
  resize();
  seedBlocks();
  window.addEventListener('resize', resize);

  FoundryLoop.start({ update: update, render: render });
})();
