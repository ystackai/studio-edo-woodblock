/* Spirit Lantern Collector — Q3 blocks-2d evidence v13
 * Creative intent: This should feel like an Edo artisan gliding along a
 * wooden gallery, collecting warm spirit-lanterns while dodging storm debris.
 */
(function () {
  'use strict';
  var C = document.getElementById('gc'), X = C.getContext('2d'), W = 960, H = 540;
  var phase = 'waiting', px = W / 2, score = 0, t = 0, spawnT = 0, dT = 0, dI = 2.0;
  var lanterns = [], debris = [], sparks = [];

  FoundryInput.install(C, { actions: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'] }});
  FoundryAudio.install();

  function go() {
    if (phase !== 'waiting') return;
    phase = 'playing'; FoundryAudio.droneStart(52); FoundryAudio.click();
    document.getElementById('prompt').style.display = 'none';
    document.getElementById('ph').textContent = 'playing';
  }
  C.addEventListener('pointerdown', go);
  window.addEventListener('keydown', function(e) { if (e.code === 'Space') go(); });

  function burst(x, y, col, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.28, s = 40 + Math.random() * 120;
      sparks.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: .4 + Math.random()*.3, col });
    }
  }

  function update(dt) {
    if (phase !== 'playing') return;
    t += dt; spawnT += dt; dT += dt;
    if (FoundryInput.held('left')) px -= 340*dt;
    if (FoundryInput.held('right')) px += 340*dt;
    if (FoundryInput.pointer.down) px += (FoundryInput.pointer.x - px)*8*dt;
    px = Math.max(24, Math.min(W - 24, px));

    if (spawnT >= .55) { spawnT = 0;
      lanterns.push({ x: 60+Math.random()*(W-120), y:-20, r:12+Math.random()*8,
        vx:(Math.random()-.5)*30, vy:35+Math.random()*25, hue:30+Math.random()*20 });
    }
    dI = Math.max(.8, 2.0 - t*.03);
    if (dT >= dI) { dT = 0;
      debris.push({ x:40+Math.random()*(W-80), y:-25, w:18+Math.random()*18,
        vy:90+Math.random()*60, rot:Math.random()*6.28, vr:(Math.random()-.5)*4 });
    }

    for (var i = lanterns.length-1; i >= 0; i--) {
      var l = lanterns[i]; l.y += l.vy*dt; l.x += l.vx*Math.sin(t*2+i)*dt;
      if (Math.abs(l.x-px)<32 && Math.abs(l.y-(H-55))<32) {
        score++; burst(l.x,l.y,'hsl('+l.hue+',90%,65%)',8);
        if (score%3===0) FoundryAudio.pickup(); lanterns.splice(i,1); continue;
      }
      if (l.y > H+40) lanterns.splice(i,1);
    }
    for (var j = debris.length-1; j >= 0; j--) {
      var d = debris[j]; d.y += d.vy*dt; d.rot += d.vr*dt;
      if (Math.abs(d.x-px)<(d.w/2+22) && d.y>H-90 && d.y<H-20) {
        phase='hit'; FoundryAudio.droneStop(); FoundryAudio.fail();
        burst(px,H-50,'#c2410f',20); showDebrief(); return;
      }
      if (d.y > H+60) debris.splice(j,1);
    }
    for (var k = sparks.length-1; k >= 0; k--) {
      var s = sparks[k]; s.x+=s.vx*dt; s.y+=s.vy*dt; s.life-=dt;
      if (s.life<=0) sparks.splice(k,1);
    }
    document.getElementById('sc').textContent = score;
    document.getElementById('lc').textContent = score;
    FoundryInput.update(dt);
  }

  function render(alpha) {
    var bg = X.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#2c1e14'); bg.addColorStop(.5,'#3d2b1a'); bg.addColorStop(1,'#4a3725');
    X.fillStyle=bg; X.fillRect(0,0,W,H);
    X.fillStyle='#5c3d2e'; X.fillRect(0,H-30,W,30);
    X.fillStyle='#6b4e3b'; X.fillRect(0,H-28,W,2);
    for (var i=0;i<5;i++) {
      var gx=100+i*200, gy=60+Math.sin(t*.5+i*2)*15;
      var g=X.createRadialGradient(gx,gy,0,gx,gy,35);
      g.addColorStop(0,'rgba(232,168,76,.12)'); g.addColorStop(1,'rgba(232,168,76,0)');
      X.fillStyle=g; X.fillRect(gx-35,gy-35,70,70);
    }
    X.fillStyle='#8b6914'; X.fillRect(px-22,H-74,44,24);
    X.fillStyle='#a67c00'; X.fillRect(px-20,H-72,40,20);
    X.strokeStyle='#6b4e3b'; X.lineWidth=1.5;
    X.beginPath(); X.moveTo(px-14,H-62); X.lineTo(px+14,H-62);
    X.moveTo(px-10,H-56); X.lineTo(px+10,H-56); X.stroke();
    for (var i=0;i<lanterns.length;i++) {
      var l=lanterns[i], hue=l.hue||35;
      var gl=X.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r*2.5);
      gl.addColorStop(0,'hsla('+hue+',90%,70%,.3)'); gl.addColorStop(1,'hsla('+hue+',90%,70%,0)');
      X.fillStyle=gl; X.beginPath(); X.arc(l.x,l.y,l.r*2.5,0,6.28); X.fill();
      X.fillStyle='hsl('+hue+',85%,62%)'; X.beginPath(); X.arc(l.x,l.y,l.r,0,6.28); X.fill();
      X.fillStyle='hsla('+hue+',90%,82%,.8)'; X.beginPath(); X.arc(l.x,l.y,l.r*.4,0,6.28); X.fill();
    }
    for (var j=0;j<debris.length;j++) {
      var d=debris[j]; X.save(); X.translate(d.x,d.y); X.rotate(d.rot);
      X.fillStyle='#2a1f15'; X.beginPath();
      X.moveTo(-d.w/2,-d.w/3); X.lineTo(0,-d.w/2); X.lineTo(d.w/2,-d.w/4);
      X.lineTo(d.w/3,d.w/3); X.lineTo(-d.w/4,d.w/2); X.closePath(); X.fill();
      X.restore();
    }
    for (var k=0;k<sparks.length;k++) {
      var s=sparks[k]; X.globalAlpha=Math.max(0,s.life*2.5);
      X.fillStyle=s.col; X.beginPath(); X.arc(s.x,s.y,2.5,0,6.28); X.fill();
    }
    X.globalAlpha=1;
    if (phase==='waiting') {
      var v=X.createRadialGradient(W/2,H/2,100,W/2,H/2,500);
      v.addColorStop(0,'rgba(26,21,16,0)'); v.addColorStop(1,'rgba(26,21,16,.45)');
      X.fillStyle=v; X.fillRect(0,0,W,H);
    }
  }

  function showDebrief() {
    document.getElementById('ph').textContent='debrief';
    var ov=document.getElementById('crash'); ov.style.display='flex';
    document.getElementById('cscore').textContent=score;
    document.getElementById('ctime').textContent=t.toFixed(1);
    var g=document.getElementById('cgrade');
    if(score>=20){g.textContent='MASTER ARTISAN';g.style.color='#e8a84c';}
    else if(score>=10){g.textContent='SKILLED COLLECTOR';g.style.color='#d4a855';}
    else if(score>=5){g.textContent='APPRENTICE';g.style.color='#c4956a';}
    else{g.textContent='BEGINNER';g.style.color='#a08060';}
  }

  function resetGame() {
    px=W/2; score=0; t=0; spawnT=0; dT=0; dI=2.0;
    lanterns=[]; debris=[]; sparks=[]; phase='playing';
    FoundryAudio.droneStart(52);
    document.getElementById('crash').style.display='none';
    document.getElementById('sc').textContent='0'; document.getElementById('lc').textContent='0';
    document.getElementById('ph').textContent='playing';
  }
  document.getElementById('rebtn').addEventListener('click', resetGame);
  window.addEventListener('keydown', function(e) { if(e.code==='KeyR' && phase==='hit') resetGame(); });

  // Seed lanterns for first paint
  for (var i=0;i<4;i++) {
    lanterns.push({ x:60+Math.random()*(W-120), y:40+Math.random()*200, r:12+Math.random()*8,
      vx:(Math.random()-.5)*30, vy:0, hue:30+Math.random()*20 });
  }
  FoundryLoop.start({ update: update, render: render });
})();
