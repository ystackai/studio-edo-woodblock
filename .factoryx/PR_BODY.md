## Edo Inkblade: Road to Ganryu

FactoryX-WorkOrder: work-order-1779144395288-40
FactoryX-Factory: factory-edo-woodblock

### Scope
Week-long OTS build of Edo Inkblade: Road to Ganryu — a playable over-the-shoulder Edo-era art-and-duel game. Character selection, road travel, ink mark-making, evasion/duel combat, milestone progression, and arrival at Ganryu.

### Planning Gates (committed)
**Strategy** — `.factoryx/GOAL_EXECUTION_STRATEGY.md`
**Technical Design** — `.factoryx/TECHNICAL_SYSTEM_DESIGN.md`

### Preview
`drops/edo-inkblade-ots/index.html` — opens directly to the game canvas.

### Current Artifact State (Pass 33 — Runtime start flow and painted waymark repair)
- **~1200-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
- Animated title screen: drifting mist bands and ink particles on dedicated canvas, driven by `requestAnimationFrame` loop while title is shown; clean cancel on dismiss; redraws on orientation change
- Character-select screen: ink-brush frame, woodblock grain, calligraphy accents, 3 heroes (Musashi, Koeda, Yoshino), and card clicks/taps wired into game start
- Road travel with WASD/arrow/mouse/touch (drag + long-press) controls; mouse drag look (middle-click or left-click drag rotates camera heading)
- **22 scenery kinds**: gate, pine, torii, shrine, pagoda, teaHouse, bamboo, stoneMarker, ricePaddy, bridgeArch, stall, cedar, monument, boatDock, well, lanternPost, waterfall, oldTree, stoneWall, lanternRow, crypt, willow
- **4 journey atmosphere zones** (Pass 30): Meadow (z 0-300) green grass edges/warm amber lanterns/pollen particles; Forest (z 300-600) brown earth/golden lanterns/thicker leaf fall; Mountain (z 600-1000) gray stone/cool blue-white lanterns/drifting mist wisps; Coastal (z 1000-1420) white sand/gold lanterns/sea spray. Torii gate markers at each boundary with wind-shift audio cues.
- Ink paint system: brush marks with chain-paint widening, rendered waymark seals, stamp seal, milestone glow, ink resource with slow regen
- **Paint depth**: brush size varies by hold duration (Space/right-click/touch long-press); holdBonus and ink check
- **7 enemies over 5 types**: chaser (aggressive), prowler (circles + retreats), duelist (retreat + combo follow-up with thrust), plus mountain ascetic (chaser at z=1050) and ganryu sentinel (duelist at z=1180) for a richer journey
- Enemy telegraph wind glow, patrol patterns, HP bars, low-HP danger glow
- Duel readability checkpoint: `duelFocus` hints, blade-breath arcs, ground rings, and slash curves make enemy windups easier to understand
- Restart flow restores all enemies from patrol anchors
- **Parry/block system**: blocking reduces damage; sustained block decay; parry window gives resolve+3 and parryBonus
- **5 quest milestones**: paint waymarks -> cross bridge -> reach Ganryu shore -> mountain pass -> Ganryu pier (extended road for longer journey)
- Milestone popup with ink-brush frame and cherry blossoms
- Ganryu arrival ceremony: layered ocean waves, mist-shrouded island, pier, 120 victory particles, character haiku
- **Weather depth**: fog layer (two-phase density scaling by z), **rain streaks** (angled falling lines with ground splash, replacing simple dots), drizzle particles active z=300-900 zone (extended for longer road), fade-in/out, **rain puddle reflections** (elliptical pools mirroring sky gradient with shimmering ripple animation during drizzle)
- **Zone audio**: temple bell at bridge (3-note chord), ambient bird chirps at shrines, wind drift, river drone near bridge, **rain ambience** (filtered noise driven by drizzle zone gain)
- **Audio depth** (Pass 15): D-based Yo-scale pentatonic music system — bass drone, harmony pad, melody flute cycling Yo motifs by road zone, river drone, duel tension drone, Ganryu bright theme
- **Melody scheduler**: flute cycles ascending/wandering/descending/Ganryu hopeful motifs based on player z-position; **dynamic tempo** speeds up when enemies are close (tempoFactor 1.5-2.5x), creating tension-responsive audio
- **Sprint with resolve economy**: Shift key drains resolve (1 per 3 frames) for 1.55x speed; at low resolve sprint slows to 1.1x. Sprinting reduces ink regen when resolve is low. Ties sprint usage into blocking/parry/ink economy decisions
- **Combat SFX** rebuilt with musical character
- Ambient particles: falling leaves, fireflies, river mist, drizzle
- HUD: HP, ink, resolve bars with animated fill
- Death screen: journey stats (time, defeated, ink used, resolve)
- Victory screen: full stats grid, haiku, style label
- Woodblock grain overlay, vignette, bloom, screen shake, damage flash, invincibility flash
- Mobile touch zones: walk/turn/slash/paint/block buttons auto-detect
- **Ink-wash procedural silhouettes** (Pass 23): character-specific Edo silhouettes for Musashi (kasa hat, topknot, katana), Koeda (scarf, lean build), Yoshino (hooded robe, staff) — used as fallback before sprite PNGs load. Enemy silhouettes per type. Ganryu imposing samurai silhouette.
- **Character sprite ink-wash outline** (Pass 22): dark sumi-e edge around bitmap sprites, walking ink particle trail at player feet
- **Atmosphere progression** (Pass 19): sky gradient shifts from cool dawn to warm sunset as player travels toward Ganryu
- **Rain drop-ripple interaction** (Pass 29): when drizzle streaks land near active puddles, expanding ripple rings appear — visual interaction between rain and puddle systems (`drawRipples()`)
- **Milestone vignettes with haiku** (Pass 29): each of the 5 route milestones shows a rich ink-wash illustration (bridge arch, shrine bird silhouettes, valley mountains, mountain pass wind lines, Ganryu ocean waves) plus a seasonal Edo haiku — deepens journey narrative

### Verification
- Browser runtime: Web Audio API calls use valid linearRampToValueAtTime fallbacks; invalid exponentialSmoothValueAtTime and zero-target exponential ramps are regression-checked. Public/manual browser playthrough verifies title click, character card click, movement, painting, and no hard page errors.
- `node drops/edo-inkblade-ots/test.js` — 54 checks: syntax, canvas, projection, character select, character-card start wiring, movement, art creation, painted waymark rendering, duel loop, duel telegraph readability, enemy restart reset, objective progression, animation loop, preview redirect, title screen animation, rain puddle reflections, orientation change handler, sprint mechanic, mouse drag camera look, dynamic melody tempo, extended road length, 7 enemies defined, negative checks, 11 sprite PNGs >= 10KB, manifest validation, generator existence, rain ripple interaction, milestone vignette haiku, 5 route milestones with vignettes, journey atmosphere zones, zone transition markers, zone-specific road colors, zone-specific lantern colors, zone particle spawning, zone audio, invalid Web Audio method regression, zero-target exponential gain regression
- **All 54 checks pass**

### Screenshots
`drops/edo-inkblade-ots/screenshots/`:
- `01-character-select.jpg` — character select screen with ink-brush frame
- `02-mid-journey.jpg` — road travel with scenery and sky gradient
- `03-paint-combat.jpg` — painting ink marks with enemy encounter
- `04-combat-duel.jpg` — duel telegraph and combat
- `05-ganryu-victory.jpg` — Ganryu arrival victory screen

### Passes
**Pass 20** — Title screen with ink-wash key art
**Pass 21** — Animated title screen with drifting mist and ink particles
**Pass 22** — Character sprite ink-wash outline and walking ink particles
**Pass 23** — Ink-wash procedural silhouettes retire vector blob fallbacks per character
**Pass 24** — Rain streaks (angled falling lines with ground splash) replace simple dot drizzle; rain ambience (filtered noise) in drizzle zone
**Pass 25** — Rain puddle reflections on road surface during drizzle (sky-mirroring elliptical pools with ripple shimmer); orientation change listener for title canvas redraw
**Pass 26** — Sprint resolve economy (Shift drains resolve for 1.55x speed); extended road to 1400 units for longer journey; 2 new enemies (mountain ascetic, ganryu sentinel); 5 route milestones (was 3); ink regen rate improved; dynamic melody tempo based on enemy proximity; mouse drag camera look
**Pass 27** — Character art asset generation: detailed Playwright-rendered Edo ink-wash sprite sheets for all 9 characters (heroes, enemies, ganryu). New sheet art with kimono folds, weapons, hats, woodblock grain background, ink-splash backdrop per frame.
**Pass 28** — Dedicated sprite PNGs for mountain ascetic (weathered hermit, straw hat, staff) and ganryu sentinel (jingasa helmet, yoroi armor, wakizashi). Updated ENEMY_SPRITE_KEY mapping. Fresh screenshots captured.
**Pass 29** — Rain drop-ripple interaction: expanding ripple rings when drizzle hits active puddles. Milestone vignettes with ink-wash illustrations (bridge, shrine, valley, mountain pass, Ganryu shore) and Edo haiku at each route waypoint. 43 smoke checks pass (was 41).
**Pass 30** — Journey atmosphere zones: 4 distinct zones (meadow/forest/mountain/coastal) with zone-specific road edge colors, lantern color palettes, ambient particle spawning, and zone-boundary torii gate markers. Zone transition audio cues (wind-shift chords) and zone-entry narration. All 50 smoke checks pass.
**Pass 31** — Ink-wash brush character sprite art pass with sumi-e overlays, regenerated character sheets, and richer fallback silhouettes.
**Pass 32** — Character card clicks/taps now call the hero start flow so the title/select front page can enter gameplay.
**Pass 33** — Painted waymark renderer restored; Space/right-click paint no longer throws `drawMark is not defined`; local browser playthrough covers title -> hero select -> movement -> painting.

### Known Issues
- Screenshots need fresh captures after Pass 30 zone additions
- Zone transition particles could be more dramatic at boundary crossings
- Zone audio cues are oscillator-based — real zone ambience files would be richer

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.
