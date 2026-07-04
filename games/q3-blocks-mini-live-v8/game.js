/* Q3 Blocks Mini Live v8 — woodblock-printer catches falling ink blocks.
 * This should feel like a printer's hand deftly catching falling ink cakes
 * on a carved woodblock, each catch scoring a strike on the print.
 */
(function () {
   'use strict';

  var C = document.getElementById('game');
  var ctx = C.getContext('2d');
  var W = C.width, H = C.height;

   // --- Audio ---
  FoundryAudio.install();
  var sfx = function () { if (FoundryAudio.ready()) return FoundryAudio; };

   // --- State ---
  var score = 0;
  var misses = 0;
  var gameOver = false;
  var player = { x: W / 2, y: H - 60, w: 70, h: 28, color: '#e85d3a' };
  var falling = [];
  var bands = ['#1a0f2e', '#2d1b4e', '#1b3a4b', '#2a4a3a', '#1a1a3a'];
  var guideY = [H * 0.2, H * 0.4, H * 0.6];

   // --- Spawn initial falling blocks (visible immediately) ---
  function initBlocks() {
    var colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b'];
    for (var i = 0; i < 6; i++) {
      falling.push({
        x: 40 + Math.random() * (W - 80),
        y: -20 - Math.random() * (H * 0.6),
        w: 24 + Math.random() * 20,
        h: 24 + Math.random() * 20,
        vy: 60 + Math.random() * 80,
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2
       });
     }
   }

   // --- Init input with FoundryInput block ---
  FoundryInput.install(C, {
    actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] }
   });

   // --- Game loop via FoundryLoop block ---
  var SPEED = 320;

  FoundryLoop.start({
    update: function (dt) {
      if (gameOver) {
        if (FoundryInput.consume('left') || FoundryInput.consume('right')) {
          score = 0; misses = 0; gameOver = false; initBlocks();
          sfx() && sfx().pickup();
         }
        FoundryInput.update(dt);
        return;
       }
      if (FoundryInput.held('left'))  player.x -= SPEED * dt;
      if (FoundryInput.held('right')) player.x += SPEED * dt;
      player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));

      for (var i = falling.length - 1; i >= 0; i--) {
        var b = falling[i];
        b.y += b.vy * dt;
        b.rotation += dt * 1.5;
         // catch check
        var px = player.x - player.w / 2;
        if (b.y + b.h / 2 > player.y - player.h / 2 &&
            b.y - b.h / 2 < player.y + player.h / 2 &&
            b.x + b.w / 2 > px && b.x - b.w / 2 < px + player.w) {
          score++; falling.splice(i, 1);
          sfx() && sfx().pickup();
           // spawn replacement
          var colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];
          falling.push({ x: 40 + Math.random() * (W - 80), y: -20,
            w: 24 + Math.random() * 20, h: 24 + Math.random() * 20,
            vy: 60 + Math.random() * 100 + score * 3,
            color: colors[Math.floor(Math.random() * 4)],
            rotation: Math.random() * Math.PI * 2 });
          continue;
         }
         // miss
        if (b.y > H + 40) { misses++; falling.splice(i, 1);
          sfx() && sfx().fail();
          if (misses >= 8) { gameOver = true; sfx() && sfx().droneStart(44); }
         }
       }
       // spawn timer
      if (FoundryLoop.time() % 2 < dt && falling.length < 8) {
        var colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];
        falling.push({ x: 40 + Math.random() * (W - 80), y: -20,
          w: 24 + Math.random() * 20, h: 24 + Math.random() * 20,
          vy: 60 + Math.random() * 100 + score * 3,
          color: colors[Math.floor(Math.random() * 4)],
          rotation: Math.random() * Math.PI * 2 });
       }
      FoundryInput.update(dt);
     },

    render: function () {
       // multi-color background bands
      var bandH = H / bands.length;
      for (var i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(0, i * bandH, W, bandH + 1);
       }
       // guide lines
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      for (var i = 0; i < guideY.length; i++) {
        ctx.beginPath(); ctx.moveTo(0, guideY[i]); ctx.lineTo(W, guideY[i]); ctx.stroke();
       }
       // falling blocks
      for (var i = 0; i < falling.length; i++) {
        var b = falling[i];
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
       }
       // player block
      ctx.fillStyle = player.color;
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 12;
      ctx.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
      ctx.shadowBlur = 0;
       // score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('SCORE: ' + score, 16, 34);
      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('misses: ' + misses + ' / 8', 16, 56);
       // game over overlay
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffd93d';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('GAME OVER', W / 2 - 115, H / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText('Score: ' + score + '  —  Press A/D to retry', W / 2 - 170, H / 2 + 20);
       }
     }
   });

  initBlocks();
})();
