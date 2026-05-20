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
  ["not falling object game", !/falling.obj|catch.drifting|score-display/.test(html)],
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

// Pass 37: Zone-boundary particle burst, enhanced paint splatter, seasonal road blooms
checks.push(["zone-transition particle burst", /burstCount=36/.test(html) && html.includes('color:burstColor')]);
checks.push(["wind swirl lines at zone entry", html.includes("color:'#ead9bb'") && html.includes("vx:(Math.random()-.5)*2")]);
checks.push(["brush-stroke arc trails on paint", /arcCount=4\+player\.paintChain\*2/.test(html) && html.includes('Brush-stroke')]);
checks.push(["ink drip trails after paint", html.includes('Ink drip') || html.includes('ink drip')]);
checks.push(["seasonal zone flower blooms", html.includes('bloomZone') && html.includes('seasonal blooms')]);

// Pass 39: Rich Edo Audio Identity + Atmosphere Depth
checks.push(["shakuhachi instrument emulation", html.includes("shakuhachi") && html.includes("bandpass") && html.includes("vibrato")]);
checks.push(["koto instrument emulation", html.includes("koto") && html.includes("triangle") && html.includes("pluck")]);
checks.push(["taiko drum emulation", html.includes("taiko") && html.includes("noise") && html.includes("pitch drop")]);
checks.push(["zone ambient creatures", html.includes("butterflies") && html.includes("crows") && html.includes("eagles") && html.includes("seabirds")]);
checks.push(["butterfly draw function", html.includes("function drawButterflies")]);
checks.push(["crow draw function", html.includes("function drawCrows")]);
checks.push(["eagle draw function", html.includes("function drawEagles")]);
checks.push(["seabird draw function", html.includes("function drawSeabirds")]);
checks.push(["extended melody motifs", html.includes("yoMotifMeadow") && html.includes("yoMotifForest") && html.includes("yoMotifMountain") && html.includes("yoMotifCoastal") && html.includes("yoKotoMotif")]);
checks.push(["shakuhachi melody voice", html.includes("amb.shaku") && html.includes("shakuPhrase")]);
checks.push(["koto harmony voice", html.includes("amb.koto") && html.includes("kotoPhrase")]);
checks.push(["zone ambient noise layer", html.includes("amb.zoneAmbient") && html.includes("zaGain")]);
checks.push(["zone-aware atmosphere colors", html.includes("atmColors") && html.includes("atmGlow")]);
checks.push(["death screen haiku", html.includes('death-haiku') && html.includes('deathHaikus')]);
checks.push(["death ink particles burst", html.includes('Ink-wash death particles') && html.includes('burst(player.x,player.z')]);
checks.push(["victory ink-wash mist", html.includes('Ink-wash victory mist') && html.includes('victoryParticles.push')]);
checks.push(["HUD decorative ink-wash border", html.includes('stats::before') && html.includes('stats::after')]);
checks.push(["zone-aware hints", html.includes("zoneName") && html.includes("zoneName+")]);
checks.push(["Ganryu approach audio drone", html.includes('ganryuDrone') && html.includes('ganryuProx')]);

// Pass 40: Hero-specific special abilities + road-side haiku moments
checks.push(["hero abilities defined per character", html.includes("resolveStrike") && html.includes("windStep") && html.includes("inkBlessing")]);
checks.push(["hero ability key binding M", html.includes('key==="m"') && html.includes("useHeroAbility()")]);
checks.push(["useHeroAbility function exists", html.includes("function useHeroAbility")]);
checks.push(["ability cooldown mechanic", html.includes("abilityCooldown") && html.includes("abilityEffectTimer")]);
checks.push(["ability visual effect aura", html.includes("abilityEffectTimer>0") && html.includes("abPulse")]);
checks.push(["ability status UI indicator", html.includes("ability-status") && html.includes("abReady")]);
checks.push(["road-side haiku moments", html.includes("haikuMoments") && html.includes("haikuMoment")]);
checks.push(["haiku moment drawing", html.includes("haikuMoment.active") && html.includes("haikuMoment.text")]);
checks.push(["haiku moment fade rendering", html.includes("haikuMoment.timer") && html.includes("haikuMoment.age")]);

// Pass 41: Road-side NPCs, combat VFX, pause menu
checks.push(["road-side NPCs defined", html.includes("roadNPCs") && html.includes("teahouse") && html.includes("merchant") && html.includes("poet")]);
checks.push(["NPC interaction key E", html.includes('key==="e"') && html.includes("npcEffect")]);
checks.push(["pause menu overlay", html.includes("pause") && html.includes("Journey paused") && html.includes("Escape")]);
checks.push(["pause toggle key", html.includes('key==="Escape"') && html.includes("paused=!paused")]);
checks.push(["block spark burst effect", html.includes("Block spark burst") && html.includes("bsAng")]);
checks.push(["parry flash burst effect", html.includes("Parry flash") && html.includes("pfAng")]);
checks.push(["slash trail arc effect", html.includes("Slash trail arc") && html.includes("sti<8")]);
checks.push(["enhanced enemy death dissolve", html.includes("Enhanced enemy death dissolve") && html.includes("edi<30")]);

// Pass 42: Repeatable NPCs, pause menu settings, richer zone transition VFX
checks.push(["repeatable NPCs with visitCount", html.includes("visitCount") && html.includes("visitCount++") && html.includes("texts[textIdx]")]);
checks.push(["NPC dialogue variants", html.includes("texts:[") && html.includes("4") && html.includes("The keeper refills your cup")]);
checks.push(["pause volume sliders", html.includes("vol-master") && html.includes("vol-sfx") && html.includes("vol-music") && html.includes("range")]);
checks.push(["mouse sensitivity slider", html.includes("sens-mouse") && html.includes("_mouseSensitivity")]);
checks.push(["zone banner overlay", html.includes("zoneBanner") && html.includes("zoneBanner.active") && html.includes("roundRect")]);
checks.push(["enhanced zone burst 36", html.includes("burstCount=36")]);

// Pass 43: Journey diary, road-side events, Ganryu epilogue
checks.push(["journey diary J key toggle", html.includes('diaryOpen=!diaryOpen') && html.includes('key.toLowerCase()==="j"')]);
checks.push(["journey diary draw function", html.includes("function drawDiary") && html.includes("Journey Diary")]);
checks.push(["road-side events defined", html.includes("roadEvents") && html.includes("spirit") && html.includes("flowerSeller") && html.includes("calligrapher")]);
checks.push(["road event proximity hint", html.includes("roadEventHintTimer") && html.includes("reLabel")]);
checks.push(["road event E interaction", html.includes('re.type==="spirit"') && html.includes('re.type==="flowerSeller"') && html.includes('re.type==="calligrapher"')]);
checks.push(["Ganryu epilogue after victory", html.includes("epilogueActive") && html.includes("epilogueTimer")]);
checks.push(["epilogue scroll rendering", html.includes("The journey ends at Ganryu shore") && html.includes("Ink flows back into the tide")]);

// Pass 44: Controls tutorial onboarding + 2 new scenery types
checks.push(["controls tutorial overlay exists", html.includes('id="tutorial"')]);
checks.push(["controls tutorial first-game trigger", html.includes("firstGameStarted") && html.includes("dismissTutorial")]);
checks.push(["waterwheel scenery type", html.includes('kind==="waterwheel"') && html.includes("wheelPhase")]);
checks.push(["sakeStand scenery type", html.includes('kind==="sakeStand"') && html.includes("sakeStand")]);
checks.push(["scenery kinds include waterwheel", html.includes('"waterwheel","sakeStand"')]);

// Pass 45: Auto-forward drift, enhanced paint ink-wash ripple, road travelers
checks.push(["auto-forward drift when idle", html.includes("f===0&&r===0&&player.z<1380") && html.includes("drift")]);
checks.push(["enhanced paint ink-wash ripple effect", html.includes("Ink wash ripple") && html.includes("rgba(215,182,111,0.4)")]);
checks.push(["paint audio accent on ink placement", html.includes("Paint audio accent") && html.includes("shaku")]);
checks.push(["road travelers update and draw", html.includes("roadTravelers") && html.includes("function drawTravelers")]);
checks.push(["travelers have wanderer and pilgrim types", html.includes("wanderer") && html.includes("pilgrim") && html.includes("walkPhase")]);

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
