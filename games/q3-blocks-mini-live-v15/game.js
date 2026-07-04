(function () {
   'use strict';
  var C = document.getElementById('c'), ctx = C.getContext('2d');
  var W = C.width = 800, H = C.height = 600;
  var phase = 'waiting', score = 0, hits = 0, MAX_HITS = 3;
  var lantern = { x: W / 2, y: H - 110, w: 56, h: 56 };
  var bells = [], tiles = [], rain = [];
  var spawnTimer = 0, debriefTimer = 0, hitFlash = 0;
  var firstInteraction = false;

  for (var i = 0; i < 60; i++) rain.push({ x: Math.random() * W, y: Math.random() * H, sp: 200 + Math.random() * 150, len: 8 + Math.random() * 12 });
  FoundryAudio.install();
  FoundryInput.install(C, { actions: { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'] } });

  function spawnBell() { bells.push({ x: 60 + Math.random() * (W - 120), y: -20, r: 14, sp: 70 + Math.random() * 40, c: ['#ffd700','#ffcc00','#ffe44d'][~~(Math.random()*3)] }); }
  function spawnTile() { tiles.push({ x: 40 + Math.random() * (W - 80), y: -30, w: 28 + Math.random() * 16, h: 18 + Math.random() * 10, sp: 100 + Math.random() * 60, rot: Math.random() * 0.3 }); }
  function near(a, b, br) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx*dx + dy*dy) < (a.w/2 + br); }

  function update(dt) {
    if (phase === 'waiting') {
      if (FoundryInput.pointer.justDown || FoundryInput.held('left') || FoundryInput.held('right')) {
        if (!firstInteraction) { firstInteraction = true; FoundryAudio.click(); FoundryAudio.droneStart(48); }
        phase = 'playing'; score = 0; hits = 0; bells = []; tiles = []; spawnTimer = 0;
       }
    } else if (phase === 'playing') {
      if (FoundryInput.held('left')) lantern.x -= 260 * dt;
      if (FoundryInput.held('right')) lantern.x += 260 * dt;
      if (FoundryInput.pointer.down) lantern.x += (FoundryInput.pointer.x - lantern.x) * 8 * dt;
      lantern.x = Math.max(30, Math.min(W - 30, lantern.x));
      spawnTimer += dt;
      if (spawnTimer > 0.8) { spawnTimer = 0; Math.random() < 0.6 ? spawnBell() : spawnTile(); }
      for (var i = bells.length - 1; i >= 0; i--) {
        bells[i].y += bells[i].sp * dt;
        if (near(lantern, bells[i], bells[i].r)) { score += 10; bells.splice(i,1); if (score % 30 === 0) FoundryAudio.pickup(); }
        else if (bells[i].y > H + 20) bells.splice(i, 1);
       }
      for (var j = tiles.length - 1; j >= 0; j--) {
        tiles[j].y += tiles[j].sp * dt;
        if (near(lantern, tiles[j], tiles[j].w/2)) { hits++; hitFlash = 0.4; FoundryAudio.fail(); tiles.splice(j,1); if (hits >= MAX_HITS) { phase = 'debrief'; debriefTimer = 0; FoundryAudio.droneStop(); } }
        else if (tiles[j].y > H + 40) tiles.splice(j, 1);
       }
      if (hitFlash > 0) hitFlash -= dt * 2;
    } else if (phase === 'debrief') {
      debriefTimer += dt;
      if (debriefTimer > 2 && (FoundryInput.pointer.justDown || FoundryInput.consume('left') || FoundryInput.consume('right'))) {
        phase = 'waiting'; firstInteraction = false;
       }
     }
    for (var r = 0; r < rain.length; r++) { rain[r].y += rain[r].sp * dt; if (rain[r].y > H) { rain[r].y = -rain[r].len; rain[r].x = Math.random() * W; } }
    FoundryInput.update(dt);
   }

  function render() {
    var t = Date.now() * 0.001;
    // Sky
    var sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0d1b2a'); sky.addColorStop(0.55,'#1b2838'); sky.addColorStop(1,'#0a1929');
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
    // Bridge
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,W,40); ctx.fillRect(0,35,W,8);
    for (var i = 0; i < 8; i++) ctx.fillRect(60 + i * 100, 10, 6, 35);
    // River
    var water = ctx.createLinearGradient(0, H-180, 0, H);
    water.addColorStop(0,'#0f1d30'); water.addColorStop(0.5,'#0a1628'); water.addColorStop(1,'#060e1a');
    ctx.fillStyle = water; ctx.fillRect(0, H-180, W, 180);
    // Ripples
    ctx.strokeStyle = 'rgba(120,160,200,0.08)';
    for (var i = 0; i < 6; i++) { var yy = H - 160 + i * 28; ctx.beginPath(); ctx.moveTo(0, yy); for (var x = 0; x < W; x += 4) ctx.lineTo(x, yy + Math.sin(x*0.02 + t + i)*2); ctx.stroke(); }
    // Rain
    ctx.strokeStyle = 'rgba(150,180,210,0.3)';
    for (var i = 0; i < rain.length; i++) { ctx.beginPath(); ctx.moveTo(rain[i].x, rain[i].y); ctx.lineTo(rain[i].x - 2, rain[i].y + rain[i].len); ctx.stroke(); }
    // Lantern glow
    var gl = ctx.createRadialGradient(lantern.x, lantern.y, 5, lantern.x, lantern.y, 80);
    gl.addColorStop(0,'rgba(255,180,50,0.35)'); gl.addColorStop(1,'rgba(255,180,50,0)');
    ctx.fillStyle = gl; ctx.fillRect(lantern.x - 80, lantern.y - 80, 160, 160);
    // Lantern body
    ctx.fillStyle = '#d4a030'; ctx.fillRect(lantern.x - 18, lantern.y - 22, 36, 44);
    ctx.fillStyle = '#ff9933'; ctx.fillRect(lantern.x - 14, lantern.y - 18, 28, 36);
    ctx.fillStyle = '#ffcc66'; ctx.fillRect(lantern.x - 10, lantern.y - 14, 20, 28);
    // Reflection
    ctx.save(); ctx.globalAlpha = 0.15; ctx.translate(lantern.x, H - 30); ctx.scale(1, -0.3);
    ctx.fillStyle = '#ff9933'; ctx.fillRect(-14, -18, 28, 36); ctx.restore();
    // Bells
    for (var i = 0; i < bells.length; i++) { var b = bells[i];
      var bg = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r + 8);
      bg.addColorStop(0,'rgba(255,215,0,0.5)'); bg.addColorStop(1,'rgba(255,215,0,0)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff8dc'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r*0.4, 0, Math.PI*2); ctx.fill();
     }
    // Tiles
    ctx.save();
    for (var i = 0; i < tiles.length; i++) { var tl = tiles[i];
      ctx.translate(tl.x, tl.y); ctx.rotate(tl.rot);
      ctx.fillStyle = '#2a2a2e'; ctx.fillRect(-tl.w/2, -tl.h/2, tl.w, tl.h);
      ctx.strokeStyle = '#4a4a4e'; ctx.beginPath(); ctx.moveTo(-tl.w/2+3,0); ctx.lineTo(tl.w/2-3,0); ctx.stroke();
      ctx.rotate(-tl.rot); ctx.translate(-tl.x, -tl.y);
     }
    ctx.restore();
    // Hit flash
    if (hitFlash > 0) { ctx.fillStyle = 'rgba(200,50,50,' + hitFlash * 0.4 + ')'; ctx.fillRect(0,0,W,H); }
    // HUD
    ctx.fillStyle = '#e8d5b7'; ctx.font = '16px serif'; ctx.fillText('Bells: ' + score, 16, 65);
    ctx.fillStyle = hits < 2 ? '#e8d5b7' : '#ff6655'; ctx.fillText('Shield: ' + (MAX_HITS - hits) + '/' + MAX_HITS, 16, 88);
    // Overlays
    if (phase === 'waiting') {
      ctx.fillStyle = 'rgba(10,14,20,0.6)'; ctx.fillRect(0,0,W,H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0c060'; ctx.font = 'bold 32px serif';
      ctx.fillText('Edo Bridge Bell Keeper', W/2, H/2 - 40);
      ctx.fillStyle = '#b09570'; ctx.font = '18px serif';
      ctx.fillText('Catch golden bells. Dodge the roof tiles.', W/2, H/2 + 10);
      ctx.fillStyle = '#8899aa'; ctx.font = '15px serif';
      ctx.fillText('Tap or press Space / Arrow keys to begin', W/2, H/2 + 50);
      ctx.textAlign = 'left';
    } else if (phase === 'debrief') {
      ctx.fillStyle = 'rgba(10,14,20,0.7)'; ctx.fillRect(0,0,W,H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0c060'; ctx.font = 'bold 30px serif';
      ctx.fillText('The Bell Falls Silent', W/2, H/2 - 40);
      ctx.fillStyle = '#e8d5b7'; ctx.font = '20px serif'; ctx.fillText('Bells caught: ' + score, W/2, H/2 + 10);
      var rank = score >= 80 ? 'Master Keeper' : score >= 40 ? 'Seasoned Bellman' : 'Apprentice';
      ctx.fillStyle = '#b09570'; ctx.font = '16px serif'; ctx.fillText('Rank: ' + rank, W/2, H/2 + 45);
      ctx.fillStyle = '#8899aa'; ctx.font = '14px serif';
      ctx.fillText('Tap to tend the bells again', W/2, H/2 + 80);
      ctx.textAlign = 'left';
     }
   }

  FoundryLoop.start({ update: update, render: render });
})();
