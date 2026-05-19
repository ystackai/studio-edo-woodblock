const fs = require("fs");
const path = require("path");

const root = __dirname;
const htmlPath = path.join(root, "index.html");
const previewPath = path.join(root, "preview.html");
const html = fs.readFileSync(htmlPath, "utf8");
const preview = fs.readFileSync(previewPath, "utf8");
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

const checks = [
  ["index exists", fs.existsSync(htmlPath)],
  ["preview exists", fs.existsSync(previewPath)],
  ["javascript syntax", (() => {
    if (!scriptMatches.length) return false;
    let ok = true;
    scriptMatches.forEach((match, index) => {
      try {
        new Function(match[1]);
      } catch (error) {
        console.error(`JS syntax error in script ${index + 1}: ${error.message}`);
        ok = false;
      }
    });
    return ok;
  })()],
  ["canvas renderer", html.includes("<canvas") && html.includes("getContext(\"2d\")")],
  ["over the shoulder language", /over[- ]the[- ]shoulder|perspective|horizon|depth/i.test(html)],
  ["projection function for depth", html.includes("function project") && html.includes("horizon")],
  ["character selection", html.includes("Miyamoto Musashi") && html.includes("Koeda") && html.includes("Yoshino")],
  ["character cards start game", html.includes('document.querySelectorAll(".card")') && html.includes("chooseHero(card,e)") && html.includes("start(id)")],
  ["select cards use sprite assets", html.includes("function drawSelectArt") && html.includes("card-canvas") && html.includes("drawImage(img,0,0,fw,fh")],
  ["select redraws after hero sprites load", html.includes("img.onload") && html.includes("drawSelectArt()")],
  ["movement controls", html.includes("keys.w") && html.includes("arrowleft") && html.includes("arrowright")],
  ["art creation loop", html.includes("function paint") && html.includes("ink") && html.includes("marks")],
  ["paint marks render", html.includes("function drawMark") && html.includes('v.type==="mark"?drawMark')],
  ["duel loop", html.includes("function slash") && html.includes("blocking") && html.includes("enemies")],
  ["duel telegraph readability", html.includes("duelFocus") && html.includes("function drawDuelCue") && html.includes("Block the glow")],
  ["enemy restart reset", html.includes("e.x=e.patrolX") && html.includes("e.z=e.patrolZ")],
  ["objective progression", html.includes("function updateQuest") && html.includes("Ganryu")],
  ["animation loop", html.includes("requestAnimationFrame(loop)")],
  ["preview redirect", preview.includes("window.location.replace")],
  ["not Floating Score", !html.includes("Floating Score") && !html.includes("floating-score-hs")],
  ["not falling object game", !/falling|catch drifting|score-display/.test(html)],
  ["title screen animation", html.includes("requestAnimationFrame(titleAnimLoop)") && html.includes("titleMistDrift") && html.includes("cancelAnimationFrame")],
  ["rain puddle reflections", html.includes("function drawPuddles") && html.includes("ripplePhase") && html.includes("drawPuddles(){puddles.forEach")],
  ["orientation change handler", html.includes("screen.orientation") && html.includes("orientation") && html.includes("change")],
  ["sprint mechanic", html.includes("keys.shift") && html.includes("sprintDrainTimer") && html.includes("player.resolve")],
  ["mouse drag camera look", html.includes("mouseLook") && html.includes("mouseLook.active") && html.includes("mouseLook.lastX")],
  ["dynamic melody tempo", html.includes("tempoFactor") && html.includes("tensionCount") && html.includes("melodyInt")],
  ["extended road length", html.includes("Math.min(1420") && html.includes("player.z>1380")],
  ["7 enemies defined", html.includes("ganryu sentinel") && html.includes("mountain ascetic")],
  ["rain ripple puddle interaction", html.includes("function drawRipples") && html.includes("ripples.push") && html.includes("ripples.filter")],
  ["milestone vignette haiku", html.includes("vignette:") && html.includes("haiku:") && html.includes("milestonePopup.haiku") && html.includes("haikuLines.forEach")],
  ["5 route milestones with vignettes", (()=>{const routes= [...html.matchAll(/z:(\d+)/g)]; return routes.length>=5})()],
  ["journey atmosphere zones", html.includes("journeyZones") && html.includes("meadow") && html.includes("forest") && html.includes("mountain") && html.includes("coastal")],
  ["zone transition markers", html.includes("zoneMarkers") && html.includes("forest entrance") && html.includes("mountain gate") && html.includes("sea gate")],
  ["zone-specific road colors", html.includes("zoneEdge.roadEdge") && html.includes("zoneEdge.roadEdge2")],
  ["zone-specific lantern colors", html.includes("zoneL.lanternColor") && html.includes("zoneL.lanternGlow")],
  ["zone particle spawning", html.includes('currentZone.name==="meadow"') && html.includes('currentZone.name==="forest"') && html.includes('currentZone.name==="mountain"') && html.includes('currentZone.name==="coastal"')],
  ["zone transition audio", html.includes("zone-transition audio") && html.includes("sfx.tone(262") && html.includes("sfx.tone(196")],
  ["no invalid Web Audio smooth method", !html.includes("exponentialSmoothValueAtTime")],
  ["no zero-target exponential gain ramps", !html.includes("exponentialRampToValueAtTime(0,")],
  ["paint mode switching", html.includes("paintMode") && html.includes('"waymark"') && html.includes('"barrier"') && html.includes('"blossom"')],
  ["barrier mark kind", html.includes('kind:"barrier"') && html.includes("barrierRadius")],
  ["blossom mark kind", html.includes('kind:"blossom"') && html.includes("healRadius")],
  ["road-side shrine events", html.includes("shrines") && html.includes("Pray") && html.includes("shrineEvents.forEach")],
  ["duelist berserk mode", html.includes("berserk") && html.includes("e.berserk") && html.includes("berserk stance")],
  ["enemy death ink dissolve", html.includes("Ink dissolve") && html.includes("di=0;di<20") && html.includes("deathAge===undefined")],
  ["zone-adaptive paint marks", html.includes("zoneTint") && html.includes("zoneColors") && html.includes("markColor")],
  ["road-side fox spirits", html.includes("foxSpirits") && html.includes("drawFoxSpirits") && html.includes("fade*.7")],
  ["zone-entry screen shake", html.includes("screenShake=Math.max(screenShake,3)")],
  ["duel tension drone proximity gain", html.includes("tensionGain") && html.includes("amb.tension.gain.gain.setValueAtTime")],
  ["extended mark persistence", html.includes("maxAge=1200")],
];

// Sprite dimension validation
const spriteDir = path.join(root, 'assets', 'characters');
const expectedSprites = ['musashi.png','koeda.png','yoshino.png','chaser.png','prowler.png','duelist.png','vagrant.png','monk.png','ganryu.png','mountain-ascetic.png','ganryu-sentinel.png'];
expectedSprites.forEach(f => {
  const fpath = path.join(spriteDir, f);
  const ok = fs.existsSync(fpath) && fs.statSync(fpath).size > 10000;
  checks.push([`sprite ${f} >= 10KB`, ok]);
});

// Manifest exists with character descriptions
const manifestPath = path.join(spriteDir, 'manifest.json');
checks.push(["sprite manifest exists", fs.existsSync(manifestPath)]);
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    checks.push(["manifest has characters", typeof manifest.characters === 'object' && Object.keys(manifest.characters).length >= 11]);
  } catch(e) {
    checks.push(["manifest valid JSON", false]);
  }
}

// Generator script exists
const genPath = path.join(root, 'generate-sprites.js');
checks.push(["sprite generator exists", fs.existsSync(genPath)]);

// Pass 36: Ganryu boss fight checks
checks.push(["Ganryu boss enemy defined", html.includes("name:\"Ganryu\"") && html.includes("type:\"boss\"")]);
checks.push(["Ganryu boss stats", html.includes("hp:140") && html.includes("atk:28")]);
checks.push(["Ganryu multi-phase", html.includes("bossPhase") && html.includes("e.bossPhase!==3")]);
checks.push(["Ganryu ink wave attack", html.includes("\"Ganryu sweeps an ink wave")]);
checks.push(["Ganryu ground pound attack", html.includes("\"Ganryu slams the nodachi")]);
checks.push(["Ganryu nodachi slash", html.includes("\"Ganryu raises the nodachi")]);
checks.push(["ganryuDefeated flag", html.includes("ganryuDefeated")]);
checks.push(["victory requires Ganryu", /ganryuDefeated/.test(html)]);

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) console.log(`PASS: ${name}`);
  else {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}

if (failed) {
  console.error(`${failed} Edo Inkblade smoke checks failed`);
  process.exit(1);
}
console.log("All Edo Inkblade smoke checks passed");
