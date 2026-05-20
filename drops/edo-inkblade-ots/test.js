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
  ["dynamic melody tempo", html.includes("motifZone") || (html.includes("tempoFactor") && html.includes("tensionCount") && html.includes("melodyInt"))],
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
  ["zone transition audio", html.includes("zone-transition audio") && (html.includes("sfx._tone(262") || html.includes("sfx.tone(262")) && (html.includes("sfx._tone(196") || html.includes("sfx.tone(196"))],
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
  checks.push(["shakuhachi instrument emulation", (html.includes("_oscShakuhachi") || (html.includes("shakuhachi") && html.includes("bandpass") && html.includes("vibrato")))]);
  checks.push(["koto instrument emulation", (html.includes("_oscKoto") || (html.includes("koto") && html.includes("triangle") && html.includes("pluck")))]);
  checks.push(["taiko drum emulation", (html.includes("_oscTaiko") || (html.includes("taiko") && html.includes("noise") && html.includes("pitch drop")))]);
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

// Pass 47: Woodblock grain texture, road progress markers, ink-wash paint stains, organic drifting leaves
checks.push(["horizontal woodblock grain lines", html.includes("Horizontal woodblock grain lines")]);
checks.push(["road journey progress markers", html.includes("function drawRoadProgress") && html.includes("Kurikara-style")]);
checks.push(["ink-wash paint stain on road", html.includes("Ink-wash paint stain") && html.includes("sumi-e pool")]);
checks.push(["organic leaf colors and spinning", html.includes("leafColors") && html.includes("spin") && html.includes("spinRate")]);
checks.push(["enhanced vignette warm paper tone", html.includes("rgba(40,30,22,.55)")]);
checks.push(["enhanced leaf draw with rotation", html.includes("ctx.rotate") && html.includes("leafSize")]);
checks.push(["milestone stone draw function", html.includes("function drawMilestoneStones") && html.includes("pillar") && html.includes("glyph")]);
checks.push(["zone time tracking", html.includes("journeyZoneTimes") && html.includes("zn]=(journeyZoneTimes[zn]||0)+dt")]);
checks.push(["diary journey stats summary", html.includes("Defeated: ") && html.includes("enemiesDefeated") && html.includes("marksPlacedTotal")]);

// Pass 48: Journey sky evolution, cloud dynamics, Ganryu approach atmosphere
checks.push(["cloud array initialized", html.includes("let clouds=[") && html.includes("clouds.push")]);
checks.push(["cloud drift update", html.includes("cloudDrift") && html.includes("clouds.forEach(function(c){c.x")]);
checks.push(["cloud drawing function", html.includes("function drawClouds") && html.includes("cloudTint")]);
checks.push(["dramatic sunset near Ganryu", html.includes("ganryuGlow") && html.includes("rgba(196,100,60,0.15)")]);
checks.push(["enhanced Ganryu island detail", html.includes("Pine trees") && html.includes("pt=0;pt<4")]);
checks.push(["Ganryu island boat rendered", html.includes("Small boat") && html.includes("gd*.3")]);
checks.push(["zone-specific sky tint function", html.includes("function drawSkyZoneTint") && html.includes("tintColors")]);
checks.push(["sky tints for all 4 zones", html.includes("skyTintColors") && html.includes("rgba(240,216,176,0.02)")]);

// Pass 49: Game balance tuning, Ganryu duel polish, road atmosphere depth
checks.push(["dust motes array initialized", html.includes("let dustMotes=[]") && html.includes("dustMotes.push")]);
checks.push(["dust motes spawning", html.includes("dustMotes.filter") && html.includes("dustMotes.forEach")]);
checks.push(["dust motes draw function", html.includes("function drawDustMotes") && html.includes("dustMotes.forEach(d")]);
checks.push(["traveler merchant type", html.includes("tKindR<.4?") && html.includes("\"merchant\"") && html.includes("tColors")]);
checks.push(["merchant traveler rendering", html.includes("t.kind===\"merchant\"") && html.includes("Pack on back")]);
checks.push(["boss phase aura glow", html.includes("Boss phase-specific aura glow") && html.includes("bpColors")]);
checks.push(["boss phase transition particles", html.includes("Phase 3 transition") && html.includes("Phase 2 transition")]);
checks.push(["enhanced victory ceremony", html.includes("ci<240") && html.includes("Math.random()*12")]);
checks.push(["ink-wash victory mist", html.includes("vi<60") && html.includes("Ink-wash mist victory")]);

// Pass 50: Zone-specific road surfaces, roaming enemies, telegraph colors, Ganryu ceremony
checks.push(["zone surface dirt texture", html.includes("surf===\"dirt\"") && html.includes("roadFill")]);
checks.push(["zone surface stone texture", html.includes("surf===\"stone\"") && html.includes("ctx.fillRect(w*.5+sx")]);
checks.push(["zone surface gravel texture", html.includes("surf===\"gravel\"") && html.includes("ctx.beginPath();ctx.arc(w*.5")]);
checks.push(["zone surface sand texture", html.includes("surf===\"sand\"") && html.includes("roadFill=\"#5a4a38")]);
checks.push(["zone-specific enemy roaming spawns", html.includes("zoneEnemyTypes") && html.includes("zoneEnemyMax")]);
checks.push(["zone enemy types per zone", html.includes("meadow:['chaser','prowler']") && html.includes("coastal:['duelist','prowler','sentinel']")]);
checks.push(["zone-specific duel telegraph tints", html.includes("zone.name==='meadow'?") && html.includes("drawDuelCue") && html.includes("zoneTint")]);
checks.push(["zone-specific wind frequency audio", html.includes("amb.zoneAmbient.frequency") && html.includes("zfVals")]);
checks.push(["Ganryu ceremonial torii gate", html.includes("Ceremonial torii") && html.includes("Ganryu") && html.includes("Gate banner") && html.includes('fillText("Ganryu"')]);
checks.push(["Ganryu arrival warm glow", html.includes("Arrival glow") && html.includes("d7b66f") && html.includes("arc(w*.46,hor-10")]);
checks.push(["zone-specific milestone stone colors", html.includes("stoneColor=zt.name") && html.includes("\"meadow\"?") && html.includes("stoneTop")]);
checks.push(["ganryu arrival cinematic", html.includes("ganryuArrival") && html.includes("drawGanryuArrival") && html.includes("Ganryu's domain")]);
checks.push(["ganryu arrival ink burst", html.includes("ganryuArrival.flag") && html.includes("sfx.death()") && html.includes('color:"#1a1512"')]);
checks.push(["ganryu arrival draw overlay", html.includes("function drawGanryuArrival") && html.includes('"Ganryu"') && html.includes("the shore where ink")]);
checks.push(["enhanced boss phase particles", html.includes("bpd=Math.random()*60") && html.includes('color:"#efe1c0"') && html.includes("hitStop=6")]);
checks.push(["enhanced boss defeat burst", html.includes("gbd=0;gbd<80") && html.includes('color:"#f4ead8"') && html.includes("hitStop=12")]);

// Pass 54 — Enhanced ending ceremony with credits sequence and journey memory montage
checks.push(["ending credits state", html.includes("endCreditsActive") && html.includes("endCreditsTimer")]);
checks.push(["ending credits draw function", html.includes("function drawEndCredits") && html.includes("Journey Complete") && html.includes("The road ends where")]);
checks.push(["ending credits zone memories", html.includes("memories") && html.includes("Meadow Road") && html.includes("Forest Path") && html.includes("Mountain Pass") && html.includes("Coastal Shore")]);
checks.push(["ending credits stats display", html.includes("Journey stats") && html.includes("enemiesDefeated") && html.includes("marksPlacedTotal")]);
checks.push(["ending credits calligraphy end", html.includes("fillText(\"終\"") && html.includes("The road ends where the ink")]);
checks.push(["ending credits return to title hint", html.includes("return to title") && html.includes("any key")]);
checks.push(["goToTitle function", html.includes("function goToTitle") && html.includes("endCreditsActive") && html.includes("ui.titleCanvas")]);
checks.push(["epilogue transitions to credits", html.includes("endCreditsActive=true") && html.includes("epilogueTimer") && html.includes("epilogueActive=false")]);

checks.push(["mobile touch hints improved", html.includes('color:#ead9bb') && html.includes('Tap to move') && html.includes('Drag to look') && html.includes('hold')]);
checks.push(["zone weather properties", html.includes('fogColor') && html.includes('fogDensity') && html.includes('rainIntensity')]);
checks.push(["zone weather on journey zones", html.includes('fogColor:[220,230,240],fogDensity:.08,rainIntensity:.002') && html.includes('fogColor:[200,220,225],fogDensity:.22,rainIntensity:.008')]);
checks.push(["runtime check file exists", fs.existsSync(path.join(root, '.factoryx-runtime-check-1.html'))]);

// New checks for Pass 56 — Enhanced zone portal, brush trails, grass animation
checks.push(["zone portal effect function", html.includes("function drawZonePortal") && html.includes("portalX") && html.includes("ink threshold")]);
checks.push(["zone portal state variable", html.includes("zonePortal={active:false") && html.includes("inkFlash")]);
checks.push(["zone portal timer decay", html.includes("zonePortal.timer=Math.max") && html.includes("zonePortal.active=false")]);
checks.push(["brush trails array", html.includes("let brushTrails") && html.includes("brushTrails=[]")]);
checks.push(["brush trails draw function", html.includes("function drawBrushTrails") && html.includes("brushTrails.forEach")]);
checks.push(["brush trails created on paint", html.includes("brushTrails.push") && html.includes("trailCount")]);
checks.push(["road grass blade animation", html.includes("Animated grass blades") && html.includes("bladeWind") && html.includes("bladeSway")]);
checks.push(["wind-responsive road flowers", html.includes("flowerSway") && html.includes("windDrift") && html.includes("Math.sin")]);

// Runtime check file content verification
const runtimeCheckPath = path.join(root, '.factoryx-runtime-check-1.html');
if (fs.existsSync(runtimeCheckPath)) {
  const rcContent = fs.readFileSync(runtimeCheckPath, 'utf8');
  checks.push(["runtime check contains player state test", rcContent.includes("player") && rcContent.includes("loop") && rcContent.includes("draw")]);
  checks.push(["runtime check contains canvas test", rcContent.includes("canvas") && (rcContent.includes("getContext") || rcContent.includes("querySelector('canvas')"))]);
}

// Pass 57 — Road-side ink stone collectibles, animated fog banks, milestone ceremony, Ganryu waves
checks.push(["ink pickup array initialized", html.includes("let inkPickups=[]") || html.includes("inkPickups=[]")]);
checks.push(["ink pickup draw function", html.includes("function drawInkPickups") && html.includes("ip.glowPhase")]);
checks.push(["ink pickup absorption logic", html.includes("ipDist<30") && html.includes("ip.collected") && html.includes("player.ink=Math.min")]);
checks.push(["fog bank array initialized", html.includes("let fogBanks=[]") || html.includes("fogBanks=[]")]);
checks.push(["fog bank draw function", html.includes("function drawFogBanks") && html.includes("fb.color")]);
checks.push(["fog bank zone-specific colors", html.includes("fbColors") && html.includes("meadow") && html.includes("forest") && html.includes("mountain") && html.includes("coastal")]);
checks.push(["milestone ceremony particles", html.includes("Enhanced milestone ceremony") && html.includes("ringColors") && html.includes("mr=0;mr<18")]);
checks.push(["Ganryu wave animation", html.includes("swPhase") && html.includes("shoreline") && html.includes("gentle froth")]);
checks.push(["Ganryu boat drift", html.includes("boatBob") && html.includes("boatDrift") && html.includes("bobbing")]);
checks.push(["Ganryu foam particles", html.includes("wpi=0;wpi<6") && html.includes("foam")]);
checks.push(["ink stone pickups reset in goToTitle", html.includes("inkPickups=[];fogBanks=[]")]);
checks.push(["ink stone colors per zone", html.includes("ipColors") && html.includes("meadow") && html.includes("forest") && html.includes("mountain") && html.includes("coastal")]);

// Pass 58 — Road-side campfire vignettes, screen-edge damage flash, smooth weather transitions
checks.push(["campfire array initialized", html.includes("let campfires=[]") || html.includes("campfires=[]")]);
checks.push(["campfire draw function", html.includes("function drawCampfires") && html.includes("flamePulse") && html.includes("cf.glowPhase")]);
checks.push(["campfires rendered in draw", html.includes("drawCampfires()")]);
checks.push(["screen damage flash variable", html.includes("screenDamageFlash") && html.includes("screenDamageFlash=Math.max")]);
checks.push(["screen damage flash overlay draw", html.includes("screenDamageFlash>0") && html.includes("dfFade") && html.includes("#c85d43")]);
checks.push(["smooth rain transition", html.includes("smoothRain") && html.includes("rainEffective") && html.includes("rainEffective>.12")]);
checks.push(["rain effective used for audio", html.includes("rainEffective*.035")]);

// Pass 59 — Campfire flying ember particle effects
checks.push(["campfire embers array initialized", html.includes("campfireEmbers=[]")]);
checks.push(["campfire embers draw function", html.includes("function drawCampfireEmbers") && html.includes("e.size") && html.includes("e.age")]);
checks.push(["campfire embers rendered in draw", html.includes("drawCampfireEmbers()")]);
checks.push(["campfire embers spawned in step", html.includes("campfireEmbers.push") && html.includes("campfireEmbers=campfireEmbers.filter")]);
checks.push(["campfire embers reset on restart", html.includes("campfireEmbers=[];won=false") || html.includes("campfireEmbers=[];won")]);

// Pass 60 — Road event persistent decorations, Ganryu arrival SFX fix
checks.push(["road decoration array initialized", html.includes("roadDecorations=[]")]);
checks.push(["road decoration draw function", html.includes("function drawRoadDecorations") && html.includes("rd.type===")]);
checks.push(["road decorations rendered in draw", html.includes("drawRoadDecorations()")]);
checks.push(["road decorations created on spirit event", html.includes("roadDecorations.push") && html.includes("spirit")]);
checks.push(["road decorations created on flower event", html.includes("roadDecorations.push") && html.includes("flower")]);
checks.push(["road decorations created on calligraphy event", html.includes("roadDecorations.push") && html.includes("calligraphy")]);
checks.push(["road decorations reset in goToTitle", html.includes("roadDecorations=[];")]);
checks.push(["ganryu arrival uses victory sfx", html.includes("sfx.victory()") && html.includes("ganryu-theme") && html.includes("playBuffer")]);
// Calligraphy paint mode
checks.push(["calligraphy paint mode defined", /\bpaintMode\s*=\s*"calligraphy"/.test(html)]);
checks.push(["calligraphy paint mode key 4", html.includes('e.key==="4"') && html.includes('calligraphy')]);
checks.push(["kanjiChars array defined", html.includes("kanjiChars") && html.includes("kanjiChars[")]);
checks.push(["calligraphy mark kind created on paint", html.includes('kind:"calligraphy"') && html.includes("kanji:")]);
checks.push(["calligraphy mark rendered in drawMark", html.includes('m.kind==="calligraphy"') && html.includes("m.kanji")]);
checks.push(["calligraphy UI label", html.includes("calligraphy:") && html.includes("Calligraphy")]);
checks.push(["calligraphy controls hint", html.includes("1-4 paint mode") || html.includes("1 / 2 / 3 / 4")]);
checks.push(["enhanced brush trail sumi-e rendering", html.includes("ctx.ellipse") && html.includes("brushWidth") && html.includes("drawBrushTrails")]);

// Pass 62 — Road-side ink painting canvas stations for permanent ink art creation
checks.push(["painting canvas stations array defined", html.includes("paintingCanvases=[") && html.includes("wildflowers")]);
checks.push(["painting canvas glyphs defined", html.includes("glyph:") && html.includes("花") && html.includes("峰")]);
checks.push(["painting canvas interaction key E", html.includes("canvasPaintActive") && html.includes("pc.used")]);
checks.push(["drawPaintingCanvases function defined", html.includes("function drawPaintingCanvases")]);
checks.push(["drawPaintingCanvases called in draw", html.includes("drawPaintingCanvases()")]);
checks.push(["painting decoration rendered in drawRoadDecorations", html.includes('rd.type==="painting"') && html.includes('rd.glyph')]);
checks.push(["canvas state variables defined", html.includes("canvasPaintTimer") && html.includes("canvasPaintResult")]);
checks.push(["canvas animation completes after 60 frames", html.includes("canvasPaintTimer>60")]);
checks.push(["canvas paintings reset in goToTitle", html.includes("canvasPaintActive=false") && html.includes("canvasPaintTimer=0")]);

// Pass 63 — Road-side inn sanctuaries for rest, blessing, and guidance
checks.push(["road inn array initialized", html.includes("roadInns=[") && html.includes("Tea House")]);
checks.push(["road inn zone-specific definitions", html.includes('z:200') && html.includes('z:450') && html.includes('z:800') && html.includes('z:1180')]);
checks.push(["road inn draw function", html.includes("function drawInns") && html.includes("ri.roofColor")]);
checks.push(["road inns rendered in draw", html.includes("drawInns()")]);
checks.push(["road inn E-key interaction", html.includes("innOverlayActive") && html.includes("innOverlayTimer")]);
checks.push(["road inn choice processing 1/2/3", html.includes('innChoice==="rest"') && html.includes('innChoice==="bless"') && html.includes('innChoice==="guide"')]);
checks.push(["road inn overlay drawing", html.includes("innName") && html.includes("innKeeper") && html.includes("innZoneName")]);
checks.push(["road inns reset in goToTitle", html.includes("roadInns.forEach") && html.includes("innOverlayActive=false")]);
checks.push(["inn hint timer defined", html.includes("innHintTimer")]);
checks.push(["inn proximity hint E label", html.includes('[E]') && html.includes('ri.name')]);

// Pass 64: Road-side koi fish ponds, meditation spots, balance tuning, enhanced ending ceremony
checks.push(["koi pond array initialized", html.includes("koiPonds=[]") || html.includes("koiPonds=[")]);
checks.push(["koi fish array initialized", html.includes("koiFish=[]")]);
checks.push(["koi pond draw function", html.includes("function drawKoiPonds") && html.includes("pondGrad")]);
checks.push(["koi fish draw function", html.includes("function drawKoiFish") && html.includes("swimPhase")]);
checks.push(["koi ponds rendered in draw", html.includes("drawKoiPonds()")]);
checks.push(["koi fish rendered in draw", html.includes("drawKoiFish()")]);
checks.push(["pond fish spawning in step", html.includes("koiPonds.push") && html.includes("fishCount")]);
checks.push(["meditation spots array initialized", html.includes("meditationSpots=[]")]);
checks.push(["meditation spot draw function", html.includes("function drawMeditationSpots") && html.includes("enso")]);
checks.push(["meditation spots rendered in draw", html.includes("drawMeditationSpots()")]);
checks.push(["meditation spots spawn in step", html.includes("meditationSpots.push") && html.includes("msColors")]);
checks.push(["meditation interaction key E", html.includes("meditationActive") && html.includes("meditationTimer")]);
checks.push(["meditation grants resolve on completion", html.includes("msGain") && html.includes("player.resolve=Math.min")]);
checks.push(["meditation reset in goToTitle", html.includes("meditationSpots=[];meditationActive=false")]);
checks.push(["balance ink regen rate increased", html.includes(".012*hero.art")]);
checks.push(["balance waymark damage increased", html.includes("Math.round(16*hero.art")]);
checks.push(["enhanced victory ceremony particles", html.includes("ci<240") && html.includes("12") && html.includes("Math.random()*12")]);
checks.push(["enhanced victory golden petals", html.includes("Golden petal") && html.includes("gp<30")]);
checks.push(["enhanced end credits richer memories", html.includes("mem.detail") && html.includes("zoneTimesText")]);
checks.push(["end credits ink stones display", html.includes("inkstonesCollected")]);
checks.push(["end credits paintings display", html.includes("paintingsMade")]);
checks.push(["koi ponds reset in goToTitle", html.includes("koiPonds=[];koiFish=[]")]);
checks.push(["meditation hint timer", html.includes("_msHintTimer")]);
checks.push(["storm system variables defined", html.includes("stormTimer") && html.includes("stormIntensity") && html.includes("lightningTimer") && html.includes("stormFlashes")]);
checks.push(["storm lightning flash rendering", html.includes("function drawStormFlashes") && html.includes("boltSegs")]);
checks.push(["storm flashed rendered in draw", html.includes("drawStormFlashes()")]);
checks.push(["storm thunder audio", html.includes("createOscillator") && html.includes("lowpass") && html.includes("sawtooth") && html.includes("Thunder")]);
checks.push(["storm rain bonus", html.includes("stormRainBonus") && html.includes("weatherTarget+stormRainBonus")]);
checks.push(["storm lightning bolt particles", html.includes("stormFlashes.filter") && html.includes("sf.age")]);
checks.push(["crane birds defined", html.includes("cranes=[]")]);
checks.push(["crane draw function", html.includes("function drawCranes") && html.includes("#d96a3a")]);
checks.push(["cranes rendered in draw", html.includes("drawCranes()")]);
checks.push(["cranes spawned in step", html.includes("cranes.push") && html.includes("cZones")]);
checks.push(["crane lifecycle management", html.includes("cranes=cranes.filter") && html.includes("cranes.forEach")]);
checks.push(["musician road event type", html.includes("musician") && html.includes("shakuhachi") && html.includes("mNotes")]);
checks.push(["musician traveler type defined", html.includes('musician') && html.includes("tColors") && html.includes("#8a6a5a")]);
checks.push(["musician traveler rendering", html.includes("shakuhachi") && html.includes(".kind===") && html.includes("musician")]);

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
