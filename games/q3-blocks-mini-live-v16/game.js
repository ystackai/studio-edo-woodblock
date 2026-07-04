/* Edo Crane Bell Relay — Q3 v16 probe-first used-arm sample
 * "This should feel like a rain-soaked Edo canal at dusk, where a keeper
 *  slides a vermilion seal paddle along a bridge rail, catching golden
 *  paper-crane bells and dodging black ink stones."
 */
'use strict';
(function(){
  var C=document.getElementById('c'),X=C.getContext('2d'),W=C.width,H=C.height;
  var phase='waiting',score=0,lives=3,px=W/2,bells=[],stones=[],drops=[];
  var spawnT=0,dropT=0,flashT=0,pulse=0,first=false;

  FoundryAudio.install();
  FoundryInput.install(C,{actions:{left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD']}});

  /* PROBE-FIRST: window-level capture listeners — synchronous visible state change */
  function go(){
    if(first)return;first=true;phase='playing';pulse=1;flashT=1.5;score=0;
    px=100;FoundryAudio.click();FoundryAudio.droneStart(48);
  }
  window.addEventListener('pointerdown',go,{capture:true});
  window.addEventListener('keydown',function(e){
    if(['Space','Enter','ArrowLeft','ArrowRight','KeyA','KeyD'].indexOf(e.code)>=0){
      e.preventDefault();go();}},
    {capture:true});

  function sB(){bells.push({x:30+Math.random()*(W-60),y:-15,vy:80+Math.random()*40});}
  function sS(){stones.push({x:30+Math.random()*(W-60),y:-15,vy:110+Math.random()*50});}
  function sD(){drops.push({x:Math.random()*W,y:-4,vy:250+Math.random()*150});}

  function update(dt){
    if(FoundryInput.held('left'))px-=320*dt;
    if(FoundryInput.held('right'))px+=320*dt;
    px=Math.max(35,Math.min(W-35,px));
    if(phase!=='playing'){FoundryInput.update(dt);return;}
    spawnT+=dt;dropT+=dt;
    if(spawnT>0.7){spawnT=0;sB();if(score>3)sS();}
    if(dropT>0.04){dropT=0;sD();}
    for(var i=bells.length-1;i>=0;i--){
      bells[i].y+=bells[i].vy*dt;
      if(Math.abs(bells[i].x-px)<45&&Math.abs(bells[i].y-(H-55))<18){
        score++;bells.splice(i,1);if(FoundryAudio.ready())FoundryAudio.pickup();continue;}
      if(bells[i].y>H+20)bells.splice(i,1);
    }
    for(var i=stones.length-1;i>=0;i--){
      stones[i].y+=stones[i].vy*dt;
      if(Math.abs(stones[i].x-px)<43&&Math.abs(stones[i].y-(H-55))<18){
        lives--;stones.splice(i,1);if(FoundryAudio.ready())FoundryAudio.fail();
        if(lives<=0){phase='debrief';flashT=0;FoundryAudio.droneStop();}
        continue;}
      if(stones[i].y>H+20)stones.splice(i,1);
    }
    for(var i=drops.length-1;i>=0;i--){drops[i].y+=drops[i].vy*dt;if(drops[i].y>H+10)drops.splice(i,1);}
    if(flashT>0)flashT-=dt;if(pulse>0)pulse-=dt*3;
    FoundryInput.update(dt);
  }

  function render(){
    /* background: dark canal water */
    X.fillStyle='#0c1420';X.fillRect(0,0,W,H);

    /* water ripples — always visible */
    X.strokeStyle='#152535';
    for(var i=0;i<8;i++){X.beginPath();X.moveTo(0,100+i*60);X.lineTo(W,100+i*60);X.stroke();}

    /* rain drops */
    X.strokeStyle='#2a3a4a';
    for(var i=0;i<drops.length;i++){
      X.beginPath();X.moveTo(drops[i].x,drops[i].y);X.lineTo(drops[i].x-2,drops[i].y+10);X.stroke();
    }

    /* bridge rail at bottom */
    X.fillStyle='#3a2518';X.fillRect(0,H-44,W,8);

    /* WAITING STATE: big dark overlay + title — visually distinct */
    if(phase==='waiting'){
      /* dark overlay */
      X.fillStyle='rgba(6,8,14,0.88)';X.fillRect(0,0,W,H);
      /* large vermilion seal character in center */
      X.fillStyle='#d43a2a';X.font='bold 90px sans-serif';X.textAlign='center';X.textBaseline='middle';
      X.fillText('封',W/2,H/2-40);
      /* instruction text */
      X.fillStyle='#f0d8a0';X.font='bold 20px sans-serif';
      X.fillText('PRESS TO BEGIN',W/2,H/2+40);
      X.fillStyle='#8a9ab0';X.font='13px sans-serif';
      X.fillText('Catch bells · Dodge stones · 3 lives',W/2,H/2+68);
      X.textBaseline='alphabetic';
      /* no paddle, no bells, no HUD — completely different from playing */
      return;
    }

    /* PADDOLE: red seal on rail */
    var pW=70,pH=16;
    X.fillStyle='#d43a2a';X.fillRect(px-pW/2,H-52,pW,pH);
    X.fillStyle='#ffe8c0';X.font='bold 12px sans-serif';X.textAlign='center';
    X.fillText('封',px,H-39);

    /* GOLDEN CRANE BELLS: bright yellow circles with crane wing accents */
    for(var i=0;i<bells.length;i++){
      var b=bells[i];
      X.fillStyle='#ffd700';X.beginPath();X.arc(b.x,b.y,13,0,Math.PI*2);X.fill();
      X.strokeStyle='#e8a800';X.lineWidth=2;X.stroke();
      /* crane wing */
      X.fillStyle='#ffe040';
      X.beginPath();X.moveTo(b.x,b.y-16);X.lineTo(b.x-10,b.y-8);X.lineTo(b.x+10,b.y-8);X.closePath();X.fill();
      /* inner glow */
      X.fillStyle='#fff8d0';X.beginPath();X.arc(b.x,b.y-2,5,0,Math.PI*2);X.fill();
    }

    /* BLACK INK STONES: dark circles with white edge highlight */
    for(var i=0;i<stones.length;i++){
      var s=stones[i];
      X.fillStyle='#080808';X.beginPath();X.arc(s.x,s.y,11,0,Math.PI*2);X.fill();
      X.strokeStyle='#3a3a3a';X.lineWidth=2;X.stroke();
      /* danger marker */
      X.fillStyle='#ff3030';X.font='bold 9px sans-serif';X.textAlign='center';
      X.fillText('!',s.x,s.y+4);
    }

    /* VERMILION FLASH: high-contrast first-input visual — lasts 1.5s */
    if(flashT>0){
      var a=Math.min(1,flashT/0.4);
      /* full-width bright red-orange flash */
      X.fillStyle='rgba(220,60,20,'+(a*0.55)+')';X.fillRect(0,0,W,H);
      /* large expanding ring */
      X.strokeStyle='rgba(255,140,40,'+a+')';X.lineWidth=5;
      var r=80+a*100;
      X.beginPath();X.arc(W/2,H/2-40,r,0,Math.PI*2);X.stroke();
      /* inner ring */
      X.strokeStyle='rgba(255,200,80,'+(a*0.8)+')';X.lineWidth=3;
      X.beginPath();X.arc(W/2,H/2-40,r-20,0,Math.PI*2);X.stroke();
      /* bright seal text */
      X.fillStyle='rgba(255,240,200,'+a+')';X.font='bold 48px sans-serif';X.textAlign='center';X.textBaseline='middle';
      X.fillText('封',W/2,H/2-40);
      X.textBaseline='alphabetic';
    }

    /* PULSE: subtle paddle glow on first input */
    if(pulse>0){
      X.strokeStyle='rgba(255,100,40,'+(pulse*0.6)+')';X.lineWidth=3;
      X.beginPath();X.arc(px,H-44,45,0,Math.PI*2);X.stroke();
    }

    /* HUD: always visible during play */
    X.fillStyle='#ffe8c0';X.font='bold 18px sans-serif';X.textAlign='left';
    X.fillText('Bells: '+score,14,28);
    X.textAlign='right';X.fillStyle='#e8a870';
    X.fillText('Lives: '+lives,W-14,28);

    /* DEBRIEF STATE */
    if(phase==='debrief'){
      X.fillStyle='rgba(6,8,14,0.82)';X.fillRect(0,0,W,H);
      X.fillStyle='#d43a2a';X.font='bold 30px sans-serif';X.textAlign='center';
      X.fillText('Relay Ended',W/2,H/2-40);
      X.fillStyle='#ffe0b0';X.font='bold 22px sans-serif';
      X.fillText('Bells caught: '+score,W/2,H/2+10);
      X.fillStyle='#8a9ab0';X.font='15px sans-serif';
      X.fillText('Tap or press to try again',W/2,H/2+50);
    }
  }

  /* Reset on replay */
  function reset(){phase='waiting';score=0;lives=3;px=W/2;
    bells=[];stones=[];drops=[];spawnT=0;dropT=0;flashT=0;pulse=0;first=false;}
  window.addEventListener('keydown',function(e){
    if(phase==='debrief'&&['Space','Enter'].indexOf(e.code)>=0){e.preventDefault();reset();}},{capture:true});
  window.addEventListener('pointerdown',function(){if(phase==='debrief')reset();},{capture:true});

  FoundryLoop.start({update:update,render:render});
})();
