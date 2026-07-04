/* Edo Crane Bell Relay — Q3 v16 probe-first used-arm sample
 * "This should feel like a rain-soaked Edo canal at dusk, where a keeper
 *  slides a vermilion seal paddle along a bridge rail, catching golden
 *  paper-crane bells and dodging black ink stones."
 */
'use strict';
(function(){
  var C=document.getElementById('c'),X=C.getContext('2d'),W=C.width,H=C.height;
  var phase='waiting',score=0,lives=3,paddleX=W/2,bells=[],stones=[],drops=[];
  var spawnT=0,dropT=0,flashT=0,pulse=0,first=false;
  /* Foundry boot */
  FoundryAudio.install();
  FoundryInput.install(C,{actions:{left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD']}});
  /* PROBE-FIRST: window-level capture listeners — synchronous visible state change */
  function go(){
    if(first)return;first=true;phase='playing';pulse=1;flashT=1.2;score=0;
    paddleX=100;FoundryAudio.click();FoundryAudio.droneStart(48);
   }
  window.addEventListener('pointerdown',go,{capture:true});
  window.addEventListener('keydown',function(e){
    if(['Space','Enter','ArrowLeft','ArrowRight','KeyA','KeyD'].indexOf(e.code)>=0){
      e.preventDefault();go();}},
   {capture:true});
  /* Spawners */
  function sB(){bells.push({x:30+Math.random()*(W-60),y:-15,vy:80+Math.random()*40});}
  function sS(){stones.push({x:30+Math.random()*(W-60),y:-15,vy:110+Math.random()*50});}
  function sD(){drops.push({x:Math.random()*W,y:-4,vy:250+Math.random()*150});}
  /* Update (60 Hz) */
  function update(dt){
    if(FoundryInput.held('left'))paddleX-=320*dt;
    if(FoundryInput.held('right'))paddleX+=320*dt;
    paddleX=Math.max(35,Math.min(W-35,paddleX));
    if(phase!=='playing'){FoundryInput.update(dt);return;}
    spawnT+=dt;dropT+=dt;
    if(spawnT>0.7){spawnT=0;sB();if(score>3)sS();}
    if(dropT>0.04){dropT=0;sD();}
    /* bells: catch */
    for(var i=bells.length-1;i>=0;i--){
      bells[i].y+=bells[i].vy*dt;
      if(Math.abs(bells[i].x-paddleX)<45&&Math.abs(bells[i].y-(H-55))<18){
        score++;bells.splice(i,1);if(FoundryAudio.ready())FoundryAudio.pickup();continue;}
      if(bells[i].y>H+20)bells.splice(i,1);
     }
    /* stones: hit */
    for(var i=stones.length-1;i>=0;i--){
      stones[i].y+=stones[i].vy*dt;
      if(Math.abs(stones[i].x-paddleX)<43&&Math.abs(stones[i].y-(H-55))<18){
        lives--;stones.splice(i,1);if(FoundryAudio.ready())FoundryAudio.fail();
        if(lives<=0){phase='debrief';flashT=0.7;if(FoundryAudio.ready())FoundryAudio.droneStop();}
        continue;}
      if(stones[i].y>H+20)stones.splice(i,1);
     }
    /* rain */
    for(var i=drops.length-1;i>=0;i--){drops[i].y+=drops[i].vy*dt;if(drops[i].y>H+10)drops.splice(i,1);}
    if(flashT>0)flashT-=dt;if(pulse>0)pulse-=dt*3;
    FoundryInput.update(dt);
   }
  /* Render */
  function render(){
    X.fillStyle='#141c28';X.fillRect(0,0,W,H);
    X.strokeStyle='#1a2836';
    for(var i=0;i<6;i++){X.beginPath();X.moveTo(0,200+i*70);X.lineTo(W,200+i*70);X.stroke();}
    /* rain */
    X.strokeStyle='#3a4a5a';
    for(var i=0;i<drops.length;i++){X.beginPath();X.moveTo(drops[i].x,drops[i].y);X.lineTo(drops[i].x-2,drops[i].y+10);X.stroke();}
    /* bridge rail */
    X.fillStyle='#4a3020';X.fillRect(0,H-42,W,6);
    /* paddle (red seal) */
    X.fillStyle='#d43a2a';X.fillRect(paddleX-35,H-55,70,18);
    X.fillStyle='#fff';X.font='bold 10px sans-serif';X.textAlign='center';X.fillText('封',paddleX,H-42);
    /* golden crane bells */
    for(var i=0;i<bells.length;i++){
      var b=bells[i];X.fillStyle='#e8c840';X.beginPath();X.arc(b.x,b.y,12,0,Math.PI*2);X.fill();
      X.fillStyle='#f5e06a';X.beginPath();X.moveTo(b.x,b.y-14);X.lineTo(b.x-8,b.y-6);X.lineTo(b.x+8,b.y-6);X.closePath();X.fill();
     }
    /* black ink stones */
    for(var i=0;i<stones.length;i++){
      var s=stones[i];X.fillStyle='#0a0a0a';X.beginPath();X.arc(s.x,s.y,10,0,Math.PI*2);X.fill();
     }
    /* vermilion seal flash (first input) */
    if(flashT>0){
      var a=Math.min(1,flashT/0.5);
      X.fillStyle='rgba(212,58,42,'+(a*0.3)+')';X.fillRect(0,0,W,H);
      X.strokeStyle='rgba(255,100,50,'+a+')';X.lineWidth=4;
      var r=120-a*60;X.beginPath();X.arc(W/2,H/2,r,0,Math.PI*2);X.stroke();
      X.beginPath();X.arc(W/2,H/2,r+15,0,Math.PI*2);X.stroke();
     }
    /* HUD */
    X.fillStyle='#e8dcc8';X.font='bold 18px sans-serif';X.textAlign='left';
    X.fillText('Bells: '+score,14,30);X.textAlign='right';X.fillText('Lives: '+lives,W-14,30);
    /* overlays */
    if(phase==='waiting'){
      X.fillStyle='rgba(10,12,20,0.55)';X.fillRect(0,0,W,H);
      X.fillStyle='#f5e06a';X.font='bold 22px sans-serif';X.textAlign='center';
      X.fillText('Crane Bell Relay',W/2,H/2-30);
      X.fillStyle='#e8dcc8';X.font='15px sans-serif';
      X.fillText('Press any key or tap to begin',W/2,H/2+10);
      X.fillText('Catch golden bells · dodge black stones',W/2,H/2+36);
     }else if(phase==='debrief'){
      X.fillStyle='rgba(10,12,20,0.7)';X.fillRect(0,0,W,H);
      X.fillStyle='#d43a2a';X.font='bold 26px sans-serif';X.textAlign='center';
      X.fillText('Relay Ended',W/2,H/2-20);
      X.fillStyle='#e8dcc8';X.font='18px sans-serif';
      X.fillText('Bells caught: '+score,W/2,H/2+16);
      X.font='14px sans-serif';X.fillText('Tap or press to try again',W/2,H/2+48);
     }
   }
  /* Replay */
  function reset(){phase='waiting';score=0;lives=3;paddleX=W/2;
    bells=[];stones=[];drops=[];spawnT=0;dropT=0;flashT=0;pulse=0;first=false;}
  window.addEventListener('keydown',function(e){
    if(phase==='debrief'&&['Space','Enter'].indexOf(e.code)>=0){e.preventDefault();reset();}},{capture:true});
  window.addEventListener('pointerdown',function(){if(phase==='debrief')reset();},{capture:true});
  /* Boot */
  FoundryLoop.start({update:update,render:render});
})();
