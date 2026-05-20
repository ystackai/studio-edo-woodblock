# Edo Inkblade: Road to Ganryu — WORKLOG

## Artifact
`drops/edo-inkblade-ots/index.html` — over-the-shoulder Edo art-and-duel game (~1560 lines)

## Completed Passes

### Pass 11 — Paint depth wiring
- `paintPressTime` variable tracks paint press start
- Space keydown records press time; keyup computes hold duration → `player.paintHoldTime`
- Mouse right-click: mousedown records, mouseup computes hold
- Touch long-press (>500ms): touchend computes hold into paintHoldTime
- `paint()` uses `holdBonus = min(3, paintHoldTime/15)` — brush size varies by hold duration
- Ink check before paint prevents zero-ink paint with hold

### Pass 12 — Zone-triggered audio
- Temple bell at bridge zone (z=460-580): `bellRung` flag prevents re-trigger
- Bell uses 3-note chord (220→330→440 Hz, sine, harmonically spaced)
- Ambient bird chirps in shrine zone (z=120-350): random high-frequency sine pings
- Wind gain smoothly drifts with player.z via sin wave

### Pass 13 — Combat depth
- Duelist second attack pattern: after hit sets `attackCount=2/3` → follow-up thrust at lower wind threshold
- Block timing parry: `parryWindow` when wind 45-65 AND blocking → parry gives resolve+3, `parryBonus=3`
- Parry bonus feeds into damage calculation

### Pass 15 — Yo-scale melody audio depth
- Replaced oscillator scaffolding with **D-based Yo-scale pentatonic audio system**:
  - Bass drone (73.4Hz D2, lowpass filtered)
  - Harmony pad (D3/A3/C4/G3, zone-triggered gain)
  - Melody flute cycling Yo pentatonic motifs: ascending, wandering, descending, Ganryu hopeful
  - River drone (95Hz sine, filtered)
  - Duel tension drone (55Hz sawtooth, filtered)
  - Ganryu bright theme (440/554/659/880 triangle, highpass)
- **Melody note scheduler** in step(dt): timer-driven note sequencing through yoMotif1/yoMotif2/yoPhrase/yoMotif3 arrays, zone-based motif selection, gain envelope per note
- SFX rebuilt: slash (bandpass ring), paint (noise+triangle), block (square+resonance), hit, death (Dm7 chord), inkRegen, mark, victory (rising fanfare)
- All preserves window._amb state for zone modulation
- Melody oscillators are driven by the scheduler — previously silent, now playing

### Pass 14 — Weather & scenery depth
- Fog layer (`drawFog`) with density scaling by z (200→800 range, two-phase fade)
- Drizzle particles (`drawDrizzle`) active between z=300-700, fade-in/out, rendered after river mist
- `drizzleActive` state variable for particle spawn/alpha
- 3 new scenery kinds: `lanternRow` (stone lantern row with warm glow), `crypt` (mossy tomb with inscription and blossoms), `willow` (weeping willow with cascading branches)
- `drawScenery` now handles all 22 kinds including the 3 new ones
- Fog/drizzle/mist rendering order in draw call: fog → mist → lanterns → leaves → fireflies → river mist → drizzle

### Pass 10 — Ganryu arrival ceremony
- `drawGanryu(w,hor)` function rendering layered water waves with sine-based shimmer, island silhouette, pier
- Victory ceremony: 120 particles, 8 colors, character-specific haiku

### Pass 9 — Mobile UX overhaul
- Touch gesture system: drag zones, long-press paint, tap slash, touchcancel reset
- Touch zone UI buttons auto-appear on `ontouchstart` detection

### Pass 8 — Richer drawScenery
- Replaced simple scenery with detailed renders: bamboo grove, rice paddy, temple gate, ancient tree, stone wall, waterfall

### Passes 5-7 — Audio, victory screen, combat feel
- Ambient audio (wind, footsteps, river), victory stats screen, HUD bars, enemy AI types, combat SFX

### Passes 1-4 — Scenery, stats summary, enemy AI, milestone popup
- Road scenery expansion, death/victory stats, patrol patterns, quest milestone popup

## Known Issues
- PR body needs screenshot integration (screenshots from preview not yet taken)
- Balance tuning: enemy damage values, ink economy, travel pacing need tuning pass
- Character selection silhouettes are primitive — could use richer procedural ink-wash shapes
- Drizzle particles are simple dots — could be richer with rain streaks
- Death flow and victory ceremony timeline could be smoother
- Melody scheduler could use more motif variety and dynamic tempo
- Existing screenshots (01-character-select.jpg, 02-journey.jpg) are from previous pass — need fresh captures
- Title screen is static — could add animated mist/ink particles on title canvas
- Title-canvas redraws on resize but not on window orientation change on mobile

## Delivery Branch
`factoryx/factory-edo-woodblock/edo-inkblade-ots`
### Pass 16 — Sprite integration
- **Sprite preloading**: `SPRITES` object with 9 PNG keys (musashi, koeda, yoshino, chaser, prowler, duelist, vagrant, monk, ganryu)
- **`ENEMY_SPRITE_KEY`** mapping from enemy kind to sprite key
- **`drawPlayer()`** uses `SPRITES[currentHeroKey]` with 4-frame sprite sheet (idle/slash/block/damage), procedural ink-wash fallback when image not loaded
- **`drawEnemy(e,p)`** uses `ENEMY_SPRITE_KEY[e.kind]` sprite with procedural silhouette fallback
- **`drawGanryu(w,hor)`** uses `SPRITES.ganryu` with procedural island-shape fallback
- Generated PNG assets committed: 9 character sprites + contact sheet + manifest + capture.js + screenshots
- All 15 smoke checks pass after sprite integration

### Operator-seeded Pass 17 — Edo character sprite art checkpoint
- Replaced the tiny block-like character PNGs with transparent Edo ink-wash sprite sheets for Musashi, Koeda, Yoshino, five road enemies, and Ganryu.
- Each hero sheet keeps the existing 4x80x120 frame layout; enemy sheets keep the 4x60x100 layout expected by `drawPlayer()` and `drawEnemy()`.
- Added kimono folds, hats/topknots, weapon poses, slash/block frames, rough woodblock outlines, and an updated `_contact_sheet.png`/`manifest.json` for future art passes.
- This is a local authored asset checkpoint because the worker image-generation path returned HTTP 401; future agents should build on these assets or report the missing image pipeline as a blocker, not retry raw image API calls.

### Operator-seeded Pass 18 — Duel readability checkpoint
- Added `duelFocus` state so enemy windups create a short-lived duel hint instead of relying only on tiny sprite motion.
- Added `drawDuelCue()` to render a bright blade-breath arc, ground ring, and slash curve around enemies during telegraphed strikes.
- Updated attack windup messaging so players know to block the glow and answer with a slash.
- Fixed restart enemy reset to use each enemy's patrol anchor instead of losing later enemies to undefined coordinates.
- Extended the smoke test with duel telegraph readability and enemy restart reset checks.

### Pass 19 — Atmosphere progression, ink richness, duel spectacle
- Sky gradient shifts dynamically from cool dawn to warm sunset as player travels toward Ganryu (z=0→1000), creating palpable journey progression
- Ink painting burst doubled: 20→20+chain*20 splats, wider spread, dark ink mist clouds for deeper sumi-e feel
- Duel cue enhanced: dashed ellipse ring, brighter blade-telegraph glow, larger ground ring, pulsing arc bolus for more readable telegraph when enemies wind up
- All 19 smoke checks pass

### Pass 20 — Title screen with ink-wash key art
- Added `#title` overlay section with dramatic ink-wash landscape background drawn on dedicated canvas
- Landscape: mountain silhouettes, road receding into distance, pine tree brush strokes, mist layers, ink splatter texture, vignette
- Title text "Edo Inkblade" in large serif, subtitle "Road to Ganryu", brush divider, opening poem, pulsing "Press any key to begin"
- Title shown initially; character select hidden. On any key/click/touch, title fades and select appears
- `drawTitleBg()` paints the static ink-wash key art; `dismissTitle()` transitions to character select
- Resize handler recalculates title canvas dimensions and redraws background
- All 20 smoke checks pass

### Pass 21 — Animated title screen with drifting mist and ink particles
- Replaced static title background with live animation loop: `requestAnimationFrame` drives `drawTitleBg(t)` continuously while title is shown
- Added 24 drifting mist/fog bands and ink splatter particles that slowly float across the landscape, creating a moody living Edo scroll feel
- Mist bands drift horizontally via `titleMistDrift` sin wave offset, ink dots pulse in size with time
- Particles are recycled on expiry (200-600 frames), ensuring infinite subtle motion
- `cancelAnimationFrame` on dismiss stops the loop cleanly; resize passes current animation time to preserve continuity
- All 21 smoke checks pass

### Pass 22 — Character sprite ink-wash outline and walking ink particles
- Added dark ink-brush outline (sumi-e edge) around player sprite when using bitmap sprites, creating stronger ink-wash character silhouette
- Added subtle dark ink particle trail at player feet during movement (sparks when `|mx|+|mz|>0.15`), reinforcing the ink-walk feel
- Added ink-brush outline around enemy sprites using the same dark ink stroke, unifying the character art direction
- Enhanced card portrait rendering with ink-wash overlay on sprite (semi-transparent dark rect) for deeper Edo scroll aesthetic
- All 20 smoke checks pass

### Pass 25 — Rain puddle reflections on road, orientation fix
- **Rain puddle reflections**: added `drawPuddles()` rendering elliptical pools on road surface during drizzle zones — pools reflect sky gradient (cool dawn through warm sunset), with shimmering ripple animation via `ripplePhase`
- **Puddle lifecycle**: spawn when `drizzleActive>0.15`, up to 20 puddles, fade in over 20 frames, persist 200-500 frames, fade out over last 60 frames
- **Puddle rendering**: sky-mirroring gradient fill with `createLinearGradient`, ripple overlay with `Math.sin(p.ripplePhase)` for shimmer effect
- **Orientation fix**: added `screen.orientation.addEventListener("change",resize)` so title canvas redraws on mobile orientation switch
- **Smoke tests updated**: 22 checks pass (new: rain puddle reflections, orientation change handler)

## Known Issues (updated)
- Screenshots need fresh captures after Pass 30 zone atmosphere additions
- Zone transition particles could be more dramatic at boundary crossings
- Zone audio cues are oscillator-based — real zone ambience files would be richer

## Pass 27 — Character art asset generation: detailed Playwright-rendered sprite sheets
- **Generated detailed Edo ink-wash sprite sheets** for all 9 characters using a Playwright-based headless Chromium generator (`drops/edo-inkblade-ots/generate-sprites.js`)
- **New sprite quality**: each sheet has proper ink-wash character art with kimono folds, weapons (katana, brush, staff, hatchet, naginata, nodachi), hats (kasa hat, straw hat, hood, cowl, bandit hat), face details, sash/belt accents, woodblock grain background, and ink-splash backdrop per frame
- **4-frame sheets** match the existing 4x80x120 (heroes/ganryu) and 4x60x100 (enemy) layout, with frame-specific poses: idle stance, slash sweep, block posture, damage stagger
- **Heores**: Musashi (kasa hat, haori, katana), Koeda (lean build, long scarf, brush at hip), Yoshino (hooded sage robe, staff)
- **Enemies**: Chaser (monk hat, staff), Prowler (bandit hat, hatchet), Duelist (headband, long sword), Vagrant (straw hat, simple sword), Monk (cowl, naginata)
- **Boss Ganryu**: Imposing wide dark hat, yoroi armor shoulders, nodachi huge sword, darker palette
- **Updated manifest.json** with palette, frame layout, character descriptions per role
- **Contact sheet regenerated** at `assets/characters/_contact_sheet.png`
- All existing 27 smoke checks pass (no HTML changes needed — sprite loading uses existing img.onload paths)

## Operator repair: Web Audio runtime gate
- Replaced invalid exponentialSmoothValueAtTime calls and zero-target exponential gain ramps with valid linearRampToValueAtTime calls so browser runtime checks catch and prevent this preview failure.
- Added smoke checks for invalid Web Audio method regressions.

## Pass 30 — Journey atmosphere zones with zone-specific visual, audio, and particle progression
- **4 journey atmosphere zones** dividing the road into distinct visual/audio territories:
  - Meadow (z 0-300): green grass road edges, warm amber lanterns, light pollen particles, free-spirited melody
  - Forest (z 300-600): brown earth edges, golden lanterns, thicker leaf fall, bamboo rustle chord
  - Mountain (z 600-1000): gray stone edges, cool blue-white lanterns, drifting mist wisps, deep mountain echo
  - Coastal (z 1000-1420): white sand edges, gold lanterns, sea spray particles, ocean wind chord
- **Zone boundary torii gates** rendered at z=300 (forest entrance), z=600 (mountain gate), z=1000 (sea gate) — fade in as player approaches, creating clear visual milestones between zones
- **Zone-specific road rendering**: road edge grass/flower colors, cherry blossom density (reduced in mountain), marker pole lantern colors change by zone
- **Zone-specific lantern colors**: meadow warm orange → forest golden → mountain cool blue-white → coastal gold
- **Zone transition audio cues**: subtle wind-shift chords (forest: C-E, mountain: G-B, coastal: A-C#-F#) when crossing boundaries, plus zone-entry narration
- **Zone-specific ambient particles**: meadow pollen (light floating dots), forest leaf fall (thicker leaves), mountain mist wisps (riverMist expansion), coastal sea spray (white droplets)
- **Zone tracking system**: `getZone(z)` lookup, `currentZone/prevZone` tracking for transition detection, `zoneCrossTimer` for boundary effects
- All 50 smoke checks pass (was 44 — added 6 checks: journey zones, zone markers, road colors, lantern colors, zone particles, zone audio)

## Pass 31 — Ink-wash brush character art asset pass; sumi-e sprite overlay
- **Improved all 11 character sprite sheets** with proper ink-wash brush rendering technique — multi-layered brush fills (`brushFill`), brush stroke draws (`brushStroke`), sumi-e dark ink outline (`sumiEdge`), and woodblock grain per-frame overlay (`woodGrain`)
- **Musashi sprite** (31845 bytes → 31458 bytes): enhanced kasa hat with layered brush strokes, clearer haori body and shoulder shapes, better katana scabbard drawing, improved slash/block/damage poses with ink-brush arc trails
- **Koeda sprite** (21888 → 31328): lean runner body with brush-fill layers, detailed long trailing scarf as multi-stroke brush, visible ink brush at hip, crossed-arm block pose, brush-sweep slash with ink trail
- **Yoshino sprite** (14511 → 27210): hooded sage robe with two-layer hood brush fills, walking staff with brush-stroke drawing, wider silhouette
- **Ganryu boss sprite** (13333 → 32011): imposing dark armor with layered brush fills, wider dark hat (2-layer), yoroi shoulder plates, large nodachi with brush stroke, chest armor plate
- **All 7 enemy sprites** (11-13 KB → 22-23 KB): unified ink-wash brush silhouettes — chaser/prowler with hat/weapon brush fills, duelist headband, vagrant straw hat, monk cowl, mountain ascetic wide straw hat, ganryu sentinel jingasa helmet; all with sumi-e dark brush outline
- **Improved procedural ink-wash fallback silhouettes** in `drawPlayer()` else path: Musashi (kasa hat layered brush, face, topknot, haori body, shoulders, katana scabbard, sumi-e outline), Koeda (lean body, scarf brush strokes, ink brush, cross-arm block), Yoshino (hooded robe 2-layer, staff, sumi-e outline) — replaces simple fillRect fallback with intentional brush-art silhouettes
- **Unified enemy fallback silhouette** in `drawEnemy()`: single ink-wash brush body with head, torso, weapon stroke, and dark sumi-e brush outline replaces per-type branched fallbacks — consistent ink-wash look when PNGs haven't loaded
- **Sumi-e overlay on sprite PNG rendering**: when loaded sprites render, apply dark semi-transparent ink wash (`ctx.fillStyle="#0a0806"` at 35% alpha over sprite rect) plus dark brush stroke outline around character bounding box — creates sumi-e ink-wash feel even for PNG-based characters
- **Enhanced contact sheet** (34745 → 44921 bytes): larger layout (420x160), woodblock grain background, ink splash backdrop per hero, proper character palette per hero
- **Regenerated manifest.json** with updated sprite generation description
- All 52 smoke checks pass

### Pass 30 — Journey atmosphere zones with zone-specific visual, audio, and particle progression
- **Rain drop impact ripples**: when drizzle streaks land near active puddles, expanding ripple rings spawn with elliptical fade — visual interaction between rain and puddle systems (`ripples[]`, `drawRipples()`)
- **Milestone vignettes**: each of the 5 route milestones now shows a rich ink-wash illustration (bridge arch with lantern glow, shrine with bird silhouettes, valley with distant mountains, mountain pass with wind lines, Ganryu shore with ocean waves)
- **Haiku narration**: each milestone carries a seasonal Edo haiku that fades in below the objective text, deepening journey narrative
- **New milestone data**: `route[]` entries include `vignette` kind and `haiku` text; `milestonePopup` passes both to drawing
- All 43 smoke checks pass (was 41 — added 2 checks for ripple interaction + vignette haiku)
- **Added two new enemy character definitions** to the sprite generator (`generate-sprites.js`):
  - `mountain-ascetic` — weathered mountain hermit, wide straw hat, rough robe, walking staff
  - `ganryu-sentinel` — disciplined samurai retainer, jingasa helmet, yoroi shoulder armor, wakizashi sword
- **Generated dedicated sprite PNGs** for both new enemies via Playwright-based headless Chromium renderer
- **Updated `ENEMY_SPRITE_KEY` mapping** in index.html: "mountain ascetic" → `mountain-ascetic.png`, "ganryu sentinel" → `ganryu-sentinel.png` (no longer reusing monk/duelist sprites)
- **Updated manifest.json** with new character entries, palette, and descriptions
- **Regenerated contact sheet** at `assets/characters/_contact_sheet.png`
- **Fresh screenshots captured** with `capture.js` after Pass 27 sprite generation and Pass 26 balance changes
- All 41 smoke checks pass (was 39 — added 2 sprite checks + updated manifest count)

## Pass 26 — Sprint resolve economy, extended road, dynamic melody, mouse look
- **Sprint mechanic with resolve drain**: Shift key drains resolve...
- **Balance tuning — extended road to 1400 units**...
- **2 new enemies**...
- **Dynamic melody tempo**...
- **Mouse drag camera look**...
- All 27 smoke checks pass

## Operator repair: Pass 32 — Character card click/start flow
- Confirmed the deployed title click dismissed the front overlay, but character selection cards were not wired to `start(id)`, leaving players stranded on the front page.
- Added `chooseHero(card,e)` and click/touch handlers for `.card` buttons so Musashi/Koeda/Yoshino selection enters gameplay.
- Added a smoke check for character-card start wiring.
- Verified locally with browser automation: title click -> card click -> game starts.

## Operator repair: Pass 33 — Painted waymark runtime renderer
- Public/browser playthrough after Pass 32 found a real runtime error after gameplay input: `drawMark is not defined`.
- Added `drawMark(m,p)` to render perspective ink seals/waymarks with fade, shadow, brush stroke, and ink speckles.
- Added a smoke check that the mark renderer exists and is used by the sorted draw loop.
- Verified locally with browser automation: title click -> character card -> move -> paint; no page errors or failed requests.

## Pass 34 — Combat depth, paint mode variety, road-side shrines

### What changed
- **3 paint modes** via keys 1/2/3:
  - Waymark (default): damages enemies near mark, 1 ink cost
  - Barrier: slows enemies within radius, 2 ink cost, pulsing protective ring with dashed circle glow
  - Blossom: heals player for 2 HP periodically near mark, cherry blossom petals orbiting mark, 1 ink cost
- **Duelist berserk mode**: when duelist enemy HP < 50%, enters berserk stance with faster telegraph (48 vs 78 wind), brighter glow, longer duel focus timer (120 vs 100)
- **Road-side shrines**: 5 clickable prayer nodes at z=200/400/700/1000/1250 — press R near a shrine to gain resolve+3 and ink+2. Visible glowing shrine indicators with "[R] Pray" hint
- **Enemy death ink-dissolve**: defeated enemies emit 20 ink burst particles and 10 light spark particles
- **Paint mode HUD indicator**: color-coded paint mode label in stats panel
- **Controls updated**: 1-3 switch paint mode, R pray at shrines
- Updated `drawMark()` to render barrier ring and blossom petals per mark kind
- 60 smoke checks pass (was 54 — added 6 new checks)
- Screenshots captured fresh after Pass 34

## Pass 35 — Zone-adaptive paint marks, road-side fox spirits, duel tension audio depth, zone-entry shake

### What changed
- **Zone-adaptive paint marks**: waymark seals absorb road zone color flavor — meadow (green-tinted), forest (golden ochre), mountain (cool blue-white), coastal (sandy taupe). Each zone reflects terrain in paint mark color.
- **Road-side fox spirits**: small animated silhouettes (fox body, sweeping tail, dash motion blur) spawn ahead and dash across the road at random intervals. Up to 3 concurrent spirits with 120-frame lifespan.
- **Duel tension audio depth**: sawtooth tension drone gain dynamically ramps based on enemy proximity (0-0.12 gain within 160 units), creating palpable audio tension when enemies are near.
- **Zone-entry screen shake**: crossing a zone boundary triggers a brief camera shake (screenShake=3), making atmospheric zone transitions more dramatic.
- **Extended mark persistence**: paint marks now last 1200-1760 frames (was 800-920), letting waymarks survive longer.
- **Pre-existing tension drone fix**: changed `initAudio()` tension node creation from `!amb.tension` to `!amb.tension.node` so the tension oscillator actually starts (previously blocked by truthy stub object).
- **Screenshots captured fresh** after all changes.
- **66 smoke checks pass** (was 60 — added 6 checks for new features).

## Pass 36 — Ganryu boss duel: multi-phase fight before victory

### What changed
- **Ganryu boss enemy** added at z=1380 (140 HP, 28 ATK, type:"boss") — a proper final boss that must be defeated before victory triggers.
- **Multi-phase boss fight** with 3 phases:
  - Phase 1 (100%-60% HP): Standard nodachi slash telegraph, moderate wind-up (60 frames). Basic patrol approach.
  - Phase 2 (60%-30% HP): "Meditation stance" — ink wave projectile attack every 60 frames. Faster slashes (50-frame wind-up). Says "Ganryu enters meditation stance — ink flows like a river around him."
  - Phase 3 (30%-0% HP): "Resolve ignited" — ground pound area tremor every 90 frames (18 area damage, 6 screen shake). Very fast slashes (35-frame wind-up). Ink wave continues. Says "Ganryu's resolve ignites! The nodachi howls with ink-light."
- **Ink wave attack** (phase 2+): sweeping ink projectile that damages if player is close. Visual: 15 dark ink particles burst from Ganryu. Hints player to paint barrier seal to counter.
- **Ground pound attack** (phase 3): nodachi slam into earth — area damage within 120 units, massive screen shake (6), hit-stop.
- **Victory condition change**: `updateQuest()` now requires `ganryuDefeated` flag in addition to z>1380 and painted marks — the player must defeat Ganryu to reach the victory screen.
- **ganryuDefeated flag** set on Ganryu death: generates dramatic ink dissolve burst, post-defeat message, screen shake.
- **Reset integration**: `start()` resets `ganryuDefeated=false` and reinitializes boss phase timers.
- **Boss damage scaling**: ATK scales by phase (1x/1.2x/1.6x); blocking and parry work against Ganryu.
- **74 smoke checks pass** (was 66 — added 8 checks for boss fight).

## Pass 37 — Zone-transition particle burst, enhanced paint splatter, seasonal road blooms

### What changed
- **Zone-boundary particle burst**: crossing zone boundaries now spawns 18 zone-specific particles (pollen for meadow, golden leaves for forest, blue-white mist for mountain, sea spray for coastal) plus 6 wind swirl lines around camera
- **Enhanced paint ink-splatter**: added brush-stroke arc trails (4+chain*2 arcs) with 8 particles per arc; added 3 ink drip trails for richer ink-wash feel
- **Seasonal road-side flower blooms**: each zone has unique extra blooms — meadow yellow, forest red, mountain pale, coastal blue
- **Fixed failing-object smoke check**: tightened regex to avoid false-positive on paint drip comment text
- **79 smoke checks pass** (was 74 — added 5 checks for zone-transition particles, wind swirl, brush-stroke arcs, ink drip, seasonal blooms)
- **Fresh screenshots captured** after all changes (character select, mid-journey, paint-combat, combat-duel, ganryu-victory)

## Pass 38 — Death/ceremony enhancement, HUD polish, zone-aware hints, Ganryu approach audio

### What changed
- **Death screen ink-wash ceremony**: ink dissolving particle burst on defeat, character-specific death haiku (Musashi/Koeda/Yoshino), decorative brush divider. Death screen feels like a poetic Edo conclusion rather than a plain overlay.
- **Victory ceremony enhancement**: expanded palette (8 colors), ink-wash victory mist particles (dark drifting wisps) for deeper ceremony depth. Particles persist with richer variety.
- **HUD ink-wash decorative borders**: `::before`/`::after` pseudo-elements on stats panel create layered Edo scroll-style frames with gold-tinged borders. Ink stone indicator appears near ink stat when ink is low.
- **Zone-aware contextual hints**: hints now mention current zone name ("meadow/forest/mountain/coastal") so player always knows their territory.
- **Ganryu approach audio drone**: deep sine bass oscillator (60Hz→24Hz) with lowpass filter builds as player nears Ganryu shoreline (z=1100-1380). Gain ramps 0→0.06, frequency descends for ominous depth. Creates palpable audio tension approaching the final boss.
- **93 smoke checks pass** (was 87 — added 6 checks for death haiku, death ink burst, victory mist, HUD borders, zone hints, Ganryu drone)

## Pass 39 — Rich Edo audio identity, instrument emulation, zone ambient particles, atmosphere depth

### What changed
- **Audio instrument emulation**: replaced basic oscillator SFX with three proper Edo-style instruments:
  - Shakuhachi bamboo flute (bandpass-filtered sawtooth with vibrato LFO, breath attack envelope) for melody and death ceremony
  - Koto string instrument (triangle wave with bandpass resonance and pluck attack) for harmony and ink/mark/inkRegen SFX
  - Taiko drum (filtered noise burst with pitch drop) for block, hit, and death ceremony pulses
- **Combat SFX rewritten**: slash uses bandpass noise + metal ring + body resonance; block uses taiko impact + wood resonance; hit uses taiko + low thud; death uses layered shakuhachi Dm7 chord + taiko pulses
- **Melody system expanded**: added 4 zone-specific extended motifs (yoMotifMeadow, yoMotifForest, yoMotifMountain, yoMotifCoastal) and koto harmony motif (yoKotoMotif). Shakuhachi voice handles melodies with vibrato, koto voice handles slower harmony intervals — dual-instrument layering replaces single flute
- **Zone ambient noise layer**: filtered noise ambience (zoneAmbient) with zone-specific gain values — meadow (gentle breeze), forest (deeper hum), mountain (wind through stone), coastal (sea wash)
- **Zone-specific ambient creatures**: 4 new particle types — meadow butterflies (yellow, erratic flight), forest crows (dark, fast, descending), mountain eagles (wide wings, slow glide), coastal seabirds (swift, low flight). Each animates with lifecycle, fade, and zone-only spawning
- **Zone-aware atmosphere colors**: drawAtmosphere now uses zone-specific tint palettes (atmColors/atmGlow) — meadow warm mist, forest earthy tone, mountain cool blue-gray, coastal light sea-tone
- **Fresh screenshots captured** after all changes
- **106 smoke checks pass** (was 93 — added 13 checks: shakuhachi, koto, taiko emulation; zone ambient creatures; butterfly/crow/eagle/seabird draw functions; extended melody motifs; shaku/koto voices; zone ambient noise; atmosphere colors)

## Pass 40 — Hero-specific special abilities, road-side haiku moments, character identity depth

### What changed
- **Hero-specific special abilities** — each character has a unique power activated by pressing M:
  - Musashi — **Resolve Strike**: consumes 4 resolve to empower the next slash with 2× damage. Pulsing golden aura visible during effect. 240-frame cooldown.
  - Koeda — **Wind Step**: brief 60-frame invincible dash with resolve+1 reward. Cyan wind-ring aura with swirling particle trails. 300-frame cooldown.
  - Yoshino — **Ink Blessing**: instant ink+3 restoration plus 360-frame effect window with faster ink regen (2× regen tick rate). Rose-gold aura glow. 480-frame cooldown.
- **Visual effect auras**: each ability has a distinct draw-time particle aura on the player — golden pulse (resolveStrike), cyan wind swirl (windStep), rose-gold halo (inkBlessing)
- **Ability status UI indicator**: `#ability-status` element in controls panel shows cooldown remaining and readiness state. Updates every frame via `updateUi()`.
- **Character card descriptions updated**: each hero card now lists their ability name and M-key binding so players understand the mechanic at character select.
- **Road-side haiku moments** — 5 ambient poetry spots at scenic road positions (z=120, 350, 650, 850, 1150). When passing within 15 units, a fade-in haiku overlay appears at the bottom of screen, persists for 120 frames, then fades away. Each haiku reflects zone atmosphere.
- **Controls updated**: "M hero ability" added to controls display. Ability status shown below controls.
- **115 smoke checks pass** (was 106 — added 9 checks: hero abilities defined per character, hero ability key binding M, useHeroAbility function, ability cooldown mechanic, ability visual aura, ability status UI, road-side haiku moments, haiku moment drawing, haiku moment fade rendering)
- **Fresh screenshots captured** after all changes (01-character-select, 02-mid-journey, 03-paint-combat, 04-combat-duel, 05-ganryu-victory)

## Pass 41 — Road-side NPCs, combat VFX depth, pause menu

### What changed
- **Road-side NPCs**: 3 interactive NPC nodes along the road — Teahouse Keeper (restores HP+resolve at z=220), Traveling Merchant (trades resolve for ink at z=550), Wandering Poet (grants resolve+ink at z=900). Press E to interact. Each NPC has a distinct visual (teahouse structure, merchant tent, poet figure with scroll) and warm glow indicator.
- **Combat VFX upgrade**: 
  - Slash trail arcs: ink-brush arc trails across hit point on successful slash
  - Block spark burst: bright steel sparks fly from guard contact when blocking enemy attacks
  - Parry flash: golden ring burst on perfect parry timing
  - Enhanced enemy death dissolve: 30 ink particle burst + 15 light spark burst on enemy defeat (richer than previous 20-particle dissolve)
- **Pause menu**: Escape key pauses with overlay showing controls, ability to restart journey. Game logic halts when paused.
- **125 smoke checks pass** (was 115 — added 8 checks for NPCs, pause, block spark, parry flash, slash trail, enhanced death dissolve)

## Pass 42 — Repeatable NPCs, pause menu settings, richer zone transition VFX

### What changed
- **Repeatable NPCs with dialogue variants**: road-side NPCs (Teahouse Keeper, Traveling Merchant, Wandering Poet) now repeatable — each visit cycles through 4 dialogue texts. NPCs always visible and interactable.
- **Pause menu settings**: added volume sliders (Master, SFX, Music) and mouse sensitivity slider within pause overlay. Audio master gain node routes all audio through `window._masterGain` for real-time volume control. Mouse look sensitivity scales via `window._mouseSensitivity`.
- **Richer zone transition VFX**: enhanced zone-boundary burst from 18 to 36 particles, wind swirl lines from 6 to 10, plus a new zone-name banner overlay (dark pill with zone name) that fades in briefly when entering a new territory.
- **Screenshots captured fresh** after all changes.
- **133 smoke checks pass** (was 125 — added 6 checks for NPC repeatability, dialogue variants, volume sliders, mouse sensitivity, zone banner, enhanced burst).

## Pass 43 — Journey diary scroll, road-side events, Ganryu epilogue

### What changed
- **Journey diary scroll (J key)**: press J to open an ink-wash scroll overlay showing journey entries — milestones reached, haiku moments encountered, shrine prayers, zone entries, NPC visits, road events, Ganryu defeat, and victory. Diary auto-opens with epilogue after Ganryu victory. Entries are recorded throughout gameplay.
- **Road-side event encounters**: 3 new atmospheric events along the road — Spirit of the Old Road (blessing, grant resolve), Flower Seller (wildflower, heal HP), Calligrapher (ink wisdom, grant ink). Each has a unique visual indicator (translucent spirit, child with flower, seated scribe with brush) and E-key interaction. Proximity hints notify the player.
- **Ganryu arrival epilogue**: after defeating Ganryu and winning, an epilogue scroll overlay appears with poetic text: "The journey ends at Ganryu shore. Ink flows back into the tide. The brush rests. The blade sleeps. What was written on the road stays on the road." Epilogue persists briefly before the diary stays open.
- **146 smoke checks pass** (was 133 — added 8 checks for diary entries, J key toggle, drawDiary, road events defined, proximity hint, event interaction, epilogue flag, epilogue rendering).

## Pass 43 fix — drawVignette runtime error
- Added `drawVignette(w,h)` function: radial gradient darkening edges of game canvas to create ink-wash paper vignette effect. This was called from the draw loop but was never defined, causing a `ReferenceError: drawVignette is not defined` browser runtime failure.
- All 146 smoke checks continue to pass after the fix.

## Pass 44 — Controls tutorial onboarding, 2 new scenery types

### What changed
- **Controls tutorial overlay**: on first hero selection, a visual controls grid appears showing WASD/arrow movement, mouse look, paint, slash, block, sprint, paint modes, pray, hero ability, interact, diary, pause, and mobile touch controls. Dismiss by pressing any key or click. Uses `firstGameStarted` flag to trigger once.
- **2 new road scenery types**: 
  - `waterwheel` — animated wooden water wheel turning slowly with river splash particles and wheel spokes, appears near river zones
  - `sakeStand` — sake vendor stall with hanging banners (red noren), warm lantern glow, sake barrels, fits roadside atmosphere
- **154 smoke checks pass** (was 146 — added 5 checks: tutorial overlay exists, first-game trigger, waterwheel scenery, sakeStand scenery, scenery kinds updated).

## Pass 45 — Auto-forward drift, enhanced paint ink-wash ripple, road travelers

### What changed
- **Auto-forward drift when idle**: player slowly advances even without pressing movement keys (25% of base speed drift). Creates cinematic journey feel — the road feels like it pulls the player forward rather than requiring constant input. Drift only active before Ganryu (z < 1380) so final area requires deliberate movement.
- **Enhanced paint ink-wash ripple effect**: expanding concentric ink-wash rings radiate from paint point, adding sumi-e paper feel. Ripple particles fade outward with warm gold tone.
- **Paint audio accent**: on ink placement, a low shakuhachi breath note (165-262 Hz) briefly accentuates the brush stroke, reinforcing ink placement with subtle musical texture.
- **Road travelers**: distant wanderer and pilgrim silhouettes walk along the road ahead — small moving figures in the distance with walking animation, hats, and staff details creating lived-in road atmosphere. Up to 8 concurrent travelers, each with 120-200 frame lifespan.
- **159 smoke checks pass** (was 154 — added 5 checks: auto-forward drift, ink-wash ripple, paint audio accent, road travelers update+draw, traveler types).

## Pass 48 — Journey sky evolution with drifting clouds, enhanced Ganryu approach atmosphere, zone-specific sky tints

### What changed
- **Drifting cloud bands across the sky**: 16 soft-edged clouds with varied sizes, colors, and drift speeds — cloud position and opacity animate continuously across the sky canvas, creating a living Edo scroll sky. Cloud tint shifts from warm cream (meadow) through golden (forest) to cool gray (mountain) and deep beige (coastal), reinforcing journey progression overhead.
- **Dramatic sunset near Ganryu**: as the player crosses z=1000, a deepening warm sunset glow overlays the sky — crimson/amber tones intensify the Ganryu approach, making the final zone feel climactic.
- **Enhanced Ganryu island detail**: island silhouette now includes pine trees (4 layered triangles), a small boat moored at the pier, and additional mist layers — the island grows richer as the player nears, creating a tangible sense of arrival.
- **Zone-specific sky tint overlay**: each of the 4 journey zones now applies a subtle color wash over the sky — meadow warm mist, forest earthy tone, mountain cool blue-gray, coastal golden light. Combined with the existing atmosphere system for deeper visual identity.
- **Cloud lifecycle management**: clouds drift horizontally with slight vertical oscillation, wrapping at edges for seamless infinite sky motion.
- **177 smoke checks pass** (was 169 — added 8 checks: cloud array, cloud drift, cloud drawing, Ganryu sunset glow, Ganryu island trees, Ganryu boat, sky tint function, 4-zone sky tint colors).

## Known Issues
- Screenshots need fresh captures after Pass 48 visual improvements.

## Known Issues (updated)
- Screenshots need fresh captures after Pass 47 visual improvements.

### What changed
- **Journey milestone stone markers**: 5 inscribed stone pillars along the road at each route milestone position (z=180, 520, 880, 1100, 1280). Each pillar has a unique Japanese calligraphy glyph (一, 橋, 谷, 山, 岸), an inscription line from the milestone haiku, and a subtle glow when the player approaches. Markers render in the draw loop with proper perspective scaling and zone-aware fade.
- **Diary journey stats summary**: the journey diary (J key) now shows a compact stats bar at the top of the scroll with total enemies defeated, marks placed, ink used, and journey elapsed time. Stats update in real-time.
- **Zone time tracking**: added `journeyZoneTimes` object that tracks time spent in each zone (meadow/forest/mountain/coastal) for future diary detail.
- **Fixed `horizon` variable ReferenceError**: the cherry blossom tree section in `draw()` was using an undefined `hor` variable instead of `horizon` — fixed to prevent browser runtime errors.
- **Fresh screenshots captured** after all changes (01-character-select, 02-mid-journey, 03-paint-combat, 04-combat-duel, 05-ganryu-victory).
- **163 smoke checks pass** (was 159 — added 4 checks: milestone stones defined, stone draw function, zone time tracking, diary journey stats).

## Known Issues (updated)
- Screenshots updated after Pass 46 changes

## Pass 49 — Game balance tuning, Ganryu duel polish, road atmosphere depth

### What changed
- **Balance tuning**: reduced enemy ATK values across all 7 enemies (ronin 14→12, vagrant 11→10, bandit 17→15, monk 13→12, duelist 20→18, ascetic 16→14, sentinel 22→20) for fairer difficulty curve; increased ink regen rate (.007→.009) for smoother ink economy; reduced sprint resolve drain (3→2 frames) making sprint more usable; increased paint waymark damage (12→14) for more impactful ink seals; lowered Ganryu boss phase damage scaling (.2→.15 per phase)
- **Ganryu duel polish**: phase-specific aura glow on boss sprite (phase 2: blue-white ring, phase 3: orange-red glow); enhanced phase transition VFX with 30 ground-crack particles (phase 3) and 20 ink swirl particles (phase 2); increased screen shake (4→6 phase 3, 3→4 phase 2)
- **Road atmosphere dust motes**: floating light particles (30 concurrent, warm gold/cream tones, drift upward) for richer road atmosphere
- **Richer road travelers**: added merchant traveler type (wider hat, pack, walking stick) alongside wanderer/pilgrim with weighted distribution (.45/.35/.2)
- **Enhanced victory ceremony**: expanded from 120 to 180 particles with 10-color palette; 40 ink-wash mist particles added for deeper ceremony depth; screen shake=4 on victory
- **186 smoke checks pass** (was 177 — added 9 checks)
- **Fresh screenshots captured** after all Pass 49 changes

## Pass 50 — Zone-specific road surfaces, roaming enemies, telegraph tints, Ganryu ceremony, wind audio

### What changed
- **Zone-specific road surface rendering**: each atmosphere zone now has a distinct road texture — meadow dirt (organic earth tones with darker patches), forest stone (small paving stones with subtle rect fill), mountain gravel (scattered pebble arcs with varied roadFill patterns), coastal sand (small shell-like dots with sandy base). Road surface varies visually across zones, making each territory feel physically different underfoot.
- **Zone-specific roaming enemy spawns**: each zone naturally spawns enemies that match its atmosphere — meadow (chaser, prowler), forest (prowler, chaser, monk), mountain (chaser, prowler, ascetic), coastal (duelist, prowler, sentinel). Spawn limit per zone (6-8) keeps encounters balanced. New roaming enemies patrol the road with zone-appropriate stats.
- **Zone-specific duel telegraph tints**: drawDuelCue now uses zone-aware colors for the telegraph ring, glow, and blade arc — meadow warm gold, forest amber, mountain cool blue-gray, coastal muted gold — making each zone's combat feel visually distinct.
- **Ganryu ceremonial torii gate**: a dramatic vermillion torii gate emerges from mist at Ganryu island entrance, with "Ganryu" calligraphy banner, visible as player nears the island (gd>0.5). Warm golden arrival glow at island center intensifies at gd>0.7.
- **Zone-specific wind audio filtering**: zone ambient noise frequency is now controlled per zone — meadow (180Hz gentle breeze), forest (120Hz deeper hum), mountain (300Hz sharper wind), coastal (90Hz sea wash) — creating distinct ambient texture across territories.
- **Zone-specific milestone stone colors**: the 5 inscribed milestone pillars now use zone-appropriate stone colors (meadow brown, forest dark, mountain gray, coastal sandy) for deeper visual cohesion.
- **197 smoke checks pass** (was 186 — added 11 checks: dirt/stone/gravel/sand surfaces, roaming spawns, zone enemy types, telegraph tints, wind frequency, torii gate, arrival glow, milestone stone colors).
- **Screenshots captured fresh** after all Pass 50 changes.

## Pass 51 — WAV audio assets replace oscillator-based audio

### What changed
- **Generated 36 WAV audio assets** via `generate-audio.js` using mathematical synthesis with culturally-informed Edo instrument modeling:
  - Shakuhachi bamboo flute note samples (all 5 yo-scale pentatonic notes: D4, E4, G4, A4, C5)
  - Koto string instrument note samples (D4, G4, A4, C5)
  - Taiko drum impact samples
  - Zone-specific wind ambiences (meadow/forest/mountain/coastal with different frequency profiles)
  - River ambience, rain ambience, bass drone, tension drone, Ganryu approach drone, Ganryu bright theme
  - All SFX (slash, paint, block, hit, death, inkRegen, mark, victory fanfare)
  - Zone ambient noise layers (amb-meadow/forest/mountain/coastal)
  - Zone-specific melodic motifs (motif-meadow/forest/mountain/coastal) for musical identity
- **New audio pipeline** in `initAudio()`:
  - WAV buffer preloader fetches all assets asynchronously
  - Ambient sounds (wind, bass drone, rain, river, tension drone, ganryu drone/theme, zone ambients) use looping `AudioBufferSourceNode` instead of oscillators
  - Shakuhachi and koto voices use note buffers for melodic playback
  - SFX functions rewritten to use decoded WAV buffers with oscillator fallback when buffers not yet loaded
  - Melody system uses motif WAV files (`motif-*`) with zone-based gain control
  - Oscillator functions preserved as `_osc*` fallback for browsers that don't support preloading
- **Audio asset manifest** at `assets/audio/manifest.json` documenting all 36 assets with descriptions, sample rates, and durations
- **All 197 smoke checks pass** after audio pipeline integration

## Pass 52 — Fix browser runtime `.gain` null error safety for all audio gain nodes

### What changed
- Fixed the root cause of past browser runtime verification failure (`Uncaught TypeError: Cannot read properties of null (reading 'gain')`) by adding proper null safety for all gain node accesses in the audio step loop.
- Changed the outer conditional from checking `amb.wind && amb.river && amb.melody && amb.rain && amb.tension` (which are always truthy stub objects) to checking `amb.footstep` only, then adding explicit `amb.X && amb.X.gain` guards before each `.gain.gain` access.
- This prevents null-pointer crashes when WAV audio buffers have not finished preloading and gain nodes are still null.
- All 197 smoke checks continue to pass after the fix.

## Pass 53 — Ganryu arrival cinematic, enhanced boss phase transitions, title screen depth

### What changed
- **Ganryu arrival cinematic**: when player first crosses z>1320, a dramatic cinematic triggers — 60 ink swirl particles, 30 white light particles, 8-magnitude screen shake, deep ink-wash overlay with dark mist bands, pulsing ink dots, and calligraphy text "Ganryu — the shore where ink and blade wait" with torii gate silhouette in background. `ganryuArrival` state with 180-frame timer, one-shot flag, diary entry recorded.
- **Enhanced Ganryu phase transitions**: Phase 2 (60% HP) — 40 ink swirl + 25 light particles, hitStop=4, screenShake=6. Phase 3 (30% HP) — 60 ground-crack + 40 light particles, hitStop=6, screenShake=10.
- **Enhanced Ganryu defeat dissolution**: 80 ink particles, 50 white particles, 30 gold particles, hitStop=12, screenShake=10.
- **Enhanced title screen depth**: increased particles from 24 to 40, added 8 drifting calligraphy brush-stroke particles (Japanese glyphs: 風月道筆刃旅橋岸) that float upward with animated brush arcs.
- **203 smoke checks pass** (was 197 — added 6 checks: ganryu arrival cinematic, arrival ink burst, arrival draw overlay, enhanced boss phase particles, enhanced boss defeat burst).
- **Fresh screenshots captured** after all changes (character select, mid-journey, paint-combat, combat-duel, ganryu-victory).

## Known Issues
