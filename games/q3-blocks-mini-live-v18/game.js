(function(){
"use strict";
var C=document.getElementById("gc"),X=C.getContext("2d"),W=960,H=540;C.width=W;C.height=H;
var state="title",score=0,need=8,hits=0,maxH=3,t=0,first=false,flare=0;
var fx={x:W/2,y:H*.58,vx:0,vy:0,on:true};
var rafts=[];for(var i=0;i<7;i++)rafts.push({x:i*160+60,y:H*.68,w:90,h:18});
var moths=[];function addMoth(){moths.push({x:W+Math.random()*60,y:H*.2+Math.random()*H*.35,
vx:-40-Math.random()*40,ph:Math.random()*6.28,ok:true});}
for(var i=0;i<4;i++)moths.push({x:150+i*180,y:H*.2+Math.random()*H*.2,
vx:-30-Math.random()*20,ph:Math.random()*6.28,ok:true});
var carp=[];function addCarp(){var fl=Math.random()>.5;
carp.push({x:fl?-50:W+50,y:H*.55+Math.random()*H*.12,
vx:(fl?1:-1)*(80+Math.random()*60),w:70,h:28,ok:true,ph:0});}
for(var i=0;i<3;i++)addCarp();

// ── Input ──────────────────────────────────────────────────
FoundryInput.install(C,{actions:{hop:["Space","Enter"],left:["ArrowLeft","KeyA"],
right:["ArrowRight","KeyD"]}});
function doProbe(e){if(!first){first=true;state="play";fx.x-=80;flare=1.0;
FoundryAudio.click();FoundryAudio.droneStart(48);}}
window.addEventListener("pointerdown",doProbe,true);
window.addEventListener("keydown",function(e){
if(["Space","Enter","ArrowLeft","ArrowRight","KeyA","KeyD"].indexOf(e.code)>=0)doProbe(e);
},true);

// ── Update ─────────────────────────────────────────────────
function update(dt){
t+=dt;flare=Math.max(0,flare-dt);if(state!=="play")return;
fx.vx=0;if(FoundryInput.held("left"))fx.vx=-220;
if(FoundryInput.held("right"))fx.vx=220;
if(FoundryInput.consume("hop")&&fx.on){fx.vy=-340;fx.on=false;}
fx.vy+=900*dt;fx.x+=fx.vx*dt;fx.y+=fx.vy*dt;
fx.on=false;for(var i=0;i<rafts.length;i++){var r=rafts[i];
if(fx.x>r.x-10&&fx.x<r.x+r.w+10&&fx.y+18>=r.y&&fx.y+18<=r.y+r.h+8&&fx.vy>=0){
fx.y=r.y-18;fx.vy=0;fx.on=true;}}
fx.x=Math.max(20,Math.min(W-20,fx.x));
for(var i=0;i<moths.length;i++){var m=moths[i];if(!m.ok)continue;
m.ph+=dt*4;m.x+=m.vx*dt;m.y+=Math.sin(m.ph)*.5;
if(m.x<-40)m.ok=false;
if(Math.abs(m.x-fx.x)<35&&Math.abs(m.y-fx.y)<35){m.ok=false;score++;flare=.8;
if(score>=need){state="win";FoundryAudio.success();}else{FoundryAudio.pickup();addMoth();}}}
var lm=0;for(var i=0;i<moths.length;i++)if(moths[i].ok)lm++;if(lm<3)addMoth();
for(var i=0;i<carp.length;i++){var c=carp[i];if(!c.ok)continue;
c.ph+=dt*3;c.x+=c.vx*dt;c.y+=Math.sin(c.ph)*.4;
if((c.vx>0&&c.x>W+80)||(c.vx<0&&c.x<-80)){c.ok=false;addCarp();continue;}
if(Math.abs(c.x-fx.x)<45&&Math.abs(c.y-fx.y)<30){c.ok=false;hits++;flare=.8;
FoundryAudio.fail();if(hits>=maxH)state="lose";addCarp();}}
FoundryInput.update(dt);
}

// ── Render ─────────────────────────────────────────────────
function dFox(x,y){
// Tail
X.fillStyle="#d4731a";X.beginPath();X.ellipse(x-22,y+2,22,10,-.3,0,6.28);X.fill();
// Body
X.fillStyle="#e88a2a";X.beginPath();X.ellipse(x,y+8,28,18,0,0,6.28);X.fill();
// Head
X.fillStyle="#f0a040";X.beginPath();X.ellipse(x+22,y-4,15,13,0,0,6.28);X.fill();
// Ears
X.fillStyle="#d4731a";
X.beginPath();X.moveTo(x+28,y-15);X.lineTo(x+22,y-30);X.lineTo(x+18,y-14);X.fill();
X.beginPath();X.moveTo(x+34,y-12);X.lineTo(x+32,y-28);X.lineTo(x+26,y-13);X.fill();
// Eye + Snout
X.fillStyle="#111";X.beginPath();X.arc(x+29,y-6,2.5,0,6.28);X.fill();
X.fillStyle="#f0a040";X.beginPath();X.ellipse(x+36,y-2,6,4,0,0,6.28);X.fill();
// Legs
X.fillStyle="#c46a18";for(var i=-1;i<=0;i++){X.fillRect(x-12+i*8,y+22,5,10);X.fillRect(x+8+i*8,y+22,5,10);}
}
function dLantern(x,y){
X.strokeStyle="#8B6914";X.lineWidth=3;X.beginPath();X.moveTo(x+30,y-5);X.lineTo(x+30,y-55);X.stroke();
X.fillStyle="#fde68a";X.beginPath();X.ellipse(x+30,y-58,11,15,0,0,6.28);X.fill();
X.fillStyle="#b03030";X.fillRect(x+22,y-76,16,5);
var gr=30+Math.sin(t*3)*5+(flare>0?25:0);
var gd=X.createRadialGradient(x+30,y-58,2,x+30,y-58,gr);
gd.addColorStop(0,"rgba(255,220,100,0.45)");gd.addColorStop(1,"rgba(255,200,60,0)");
X.fillStyle=gd;X.beginPath();X.arc(x+30,y-58,gr,0,6.28);X.fill();
}
function dMoth(m){
X.save();X.translate(m.x,m.y);var w=Math.sin(m.ph*2)*3;
X.fillStyle="#fff";X.beginPath();X.ellipse(-4+w,-3,6,4,-.5,0,6.28);X.fill();
X.beginPath();X.ellipse(4-w,-3,6,4,.5,0,6.28);X.fill();
X.fillStyle="#d4c0a0";X.fillRect(-1,-4,2,8);X.restore();
}
function dCarp(c){
X.save();X.translate(c.x,c.y);var d=c.vx>0?1:-1;X.scale(d,1);
X.fillStyle="#1a1a2e";X.beginPath();X.ellipse(0,0,c.w*.45,c.h*.45,0,0,6.28);X.fill();
X.beginPath();X.moveTo(-c.w*.4,0);X.lineTo(-c.w*.55,-c.h*.35);X.lineTo(-c.w*.55,c.h*.35);X.closePath();X.fill();
X.fillStyle="#c0392b";X.beginPath();X.arc(c.w*.25,-c.h*.12,3,0,6.28);X.fill();
X.restore();
}
function render(a){
// Sky
var gd=X.createLinearGradient(0,0,0,H*.6);
gd.addColorStop(0,"#1a1a3a");gd.addColorStop(.6,"#2a3a5a");gd.addColorStop(1,"#1a3a3a");
X.fillStyle=gd;X.fillRect(0,0,W,H);
// Stars
X.fillStyle="#fff";for(var i=0;i<15;i++){
X.globalAlpha=.3+Math.sin(t+i)*.2;X.fillRect((i*137+50)%W,(i*89+10)%(H*.3),2,2);}
X.globalAlpha=1;
// Shore top
X.fillStyle="#2d4a1e";X.fillRect(0,0,W,H*.08);X.fillStyle="#1a3a12";X.fillRect(0,H*.06,W,H*.03);
// Bridge
X.fillStyle="#3d2b1f";X.fillRect(W*.2,H*.04,W*.6,H*.015);
X.fillRect(W*.22,H*.01,8,H*.05);X.fillRect(W*.78,H*.01,8,H*.05);
X.strokeStyle="#5a4a3a";X.lineWidth=2;X.beginPath();X.moveTo(W*.1,H*.06);X.lineTo(W*.9,H*.06);X.stroke();
// Water
var bY=H*.62;for(var r=0;r<5;r++){
X.strokeStyle=["#235a8a","#1e4a7a","#235a8a","#1e4a7a","#235a8a"][r];X.lineWidth=2;X.beginPath();
for(var wx=0;wx<W;wx+=4){var yy=bY+r*18+Math.sin((wx+t*60+r*40)*.02)*6;wx===0?X.moveTo(wx,yy):X.lineTo(wx,yy);}X.stroke();}
var wg=X.createLinearGradient(0,bY,0,H);wg.addColorStop(0,"rgba(15,40,70,0.7)");wg.addColorStop(1,"rgba(8,20,40,0.9)");
X.fillStyle=wg;X.fillRect(0,bY,W,H-bY);
// Rafts
for(var i=0;i<rafts.length;i++){var r=rafts[i];
X.fillStyle="#6b6b6b";X.beginPath();X.ellipse(r.x+r.w/2,r.y+r.h/2,r.w/2,r.h/2,0,0,6.28);X.fill();
X.fillStyle="#3a5a2a";X.fillRect(r.x+5,r.y-2,r.w-10,4);}
// Moths + carp
for(var i=0;i<moths.length;i++)if(moths[i].ok)dMoth(moths[i]);
for(var i=0;i<carp.length;i++)if(carp[i].ok)dCarp(carp[i]);
// Fox + lantern
dFox(fx.x,fx.y);dLantern(fx.x,fx.y);
// UI
X.fillStyle="#fde68a";X.font="bold 18px sans-serif";X.fillText("Moths: "+score+"/"+need,16,30);
X.fillStyle=hits>=2?"#e74c3c":"#ccc";X.fillText("Ink: "+hits+"/"+maxH,W-160,30);
if(state==="title"){
X.fillStyle="rgba(10,21,32,0.75)";X.fillRect(0,0,W,H);
X.fillStyle="#fde68a";X.font="bold 32px sans-serif";X.textAlign="center";
X.fillText("Edo Lantern Fox",W/2,H*.3);
X.font="18px sans-serif";X.fillStyle="#c0a87a";
X.fillText("Press Space or tap to cross the canal",W/2,H*.42);
X.font="14px sans-serif";X.fillStyle="#8a9a7a";
X.fillText("Arrows/A,D to move — catch moths, dodge carp!",W/2,H*.5);X.textAlign="left";
}else if(state==="win"){
X.fillStyle="rgba(10,21,32,0.7)";X.fillRect(0,0,W,H);X.textAlign="center";
X.fillStyle="#fde68a";X.font="bold 28px sans-serif";X.fillText("Lantern Crossed!",W/2,H*.35);
X.fillStyle="#a0c878";X.font="18px sans-serif";X.fillText("All moths gathered — the festival is saved.",W/2,H*.44);
X.fillStyle="#8a9a7a";X.font="14px sans-serif";X.fillText("Tap or Space to play again",W/2,H*.55);X.textAlign="left";
}else if(state==="lose"){
X.fillStyle="rgba(10,21,32,0.7)";X.fillRect(0,0,W,H);X.textAlign="center";
X.fillStyle="#e74c3c";X.font="bold 28px sans-serif";X.fillText("Ink Overwhelmed",W/2,H*.35);
X.fillStyle="#c0a87a";X.font="18px sans-serif";X.fillText("The carp drove you back. "+score+" moths gathered.",W/2,H*.44);
X.fillStyle="#8a9a7a";X.font="14px sans-serif";X.fillText("Tap or Space to try again",W/2,H*.55);X.textAlign="left";
}
}

// ── Reset ──────────────────────────────────────────────────
function reset(){score=0;hits=0;fx.x=W/2;fx.y=H*.58;fx.vx=0;fx.vy=0;fx.on=true;state="play";}
window.addEventListener("keydown",function(e){if((e.code==="Space"||e.code==="Enter")&&(state==="win"||state==="lose"))reset();});
C.addEventListener("pointerdown",function(){if(state==="win"||state==="lose")reset();});

// ── Boot ───────────────────────────────────────────────────
FoundryAudio.install();
FoundryLoop.start({update:update,render:render});
})();
