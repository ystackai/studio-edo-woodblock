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

### Current Artifact State (Pass 54 — Enhanced ending ceremony with credits sequence and journey memory montage)
- **~2690-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
- **Audio gain null safety fix**: all gain node accesses in the audio step loop now explicitly guard against null `.gain` properties when WAV buffers haven't finished preloading, preventing the past browser runtime `Uncaught TypeError: Cannot read properties of null (reading 'gain')` failure
- **Ending credits ceremony**: after Ganryu victory epilogue scroll fades, a rich ending credits sequence plays showing journey zone memories (Meadow Road, Forest Path, Mountain Pass, Coastal Shore with zone-specific descriptions), journey stats summary (time, enemies defeated, marks placed, ink used), and closing Edo calligraphy ("終" — The End). Any key press returns to title.
- **Ganryu arrival cinematic**: dramatic ink overlay with calligraphy reveal, mist bands, and particle burst when player first enters Ganryu's domain (z>1320)
- **Zone-specific road surface rendering**: each atmosphere zone now has a distinct road texture — meadow dirt (organic earth tones), forest stone (small paving stones), mountain gravel (scattered pebble arcs), coastal sand (small shell-like dots). Road surface varies visually across zones, making each territory feel physically different underfoot.
- **Zone-specific roaming enemy spawns**: each zone naturally spawns enemies that match its atmosphere — meadow (chaser, prowler), forest (prowler, chaser, monk), mountain (chaser, prowler, ascetic), coastal (duelist, prowler, sentinel). Spawn limit per zone (6-8) keeps encounters balanced.
- **Zone-specific duel telegraph tints**: drawDuelCue now uses zone-aware colors for telegraph ring, glow, and blade arc — meadow warm gold, forest amber, mountain cool blue-gray, coastal muted gold — making each zone's combat feel visually distinct.
- **Ganryu ceremonial torii gate**: a dramatic vermillion torii gate emerges from mist at Ganryu island entrance, with "Ganryu" calligraphy banner. Warm golden arrival glow at island center intensifies as player nears.
- **Zone-specific wind audio filtering**: zone ambient noise frequency controlled per zone — meadow (180Hz gentle breeze), forest (120Hz deeper hum), mountain (300Hz sharper wind), coastal (90Hz sea wash) — distinct ambient texture across territories.
- **Zone-specific milestone stone colors**: the 5 inscribed milestone pillars now use zone-appropriate stone colors (meadow brown, forest dark, mountain gray, coastal sandy) for deeper visual cohesion.
- **Richer road travelers**: merchant traveler type with pack and walking stick alongside wanderer/pilgrim, weighted distribution (.45/.35/.2)
- **Enhanced victory ceremony**: 180 particles with 10-color palette (added beige/white); 40 ink-wash mist wisps for deeper ceremony depth; screen shake=4 on victory
- Animated title screen: drifting mist bands and ink particles on dedicated canvas, driven by `requestAnimationFrame` loop while title is shown; clean cancel on dismiss; redraws on orientation change
- Character-select screen: ink-brush frame, woodblock grain, calligraphy accents, 3 heroes (Musashi, Koeda, Yoshino), card clicks/taps wired into game start, hero ability descriptions
- **Journey sky evolution with drifting clouds**: 16 soft-edged cloud bands with varied sizes, colors, and drift speeds animate across the sky. Cloud tint shifts by zone — warm cream (meadow), golden (forest), cool gray (mountain), deep beige (coastal). Creates a living Edo scroll sky overhead.
- **Dramatic sunset near Ganryu**: deepening crimson/amber glow overlay intensifies as player crosses z=1000, making the final zone feel climactic.
- **Enhanced Ganryu island detail**: island silhouette now includes layered pine trees, a small boat moored at the pier, and richer mist — grows more detailed as player approaches.
- **Zone-specific sky tint overlay**: each zone applies a subtle color wash over the sky (meadow warm, forest earthy, mountain cool, coastal golden) for deeper visual identity.
- **Woodblock grain upgrade**: horizontal woodblock print grain lines with varying thickness and grain wave for authentic Edo paper feel
- **Road journey progress markings**: inscribed distance stones on road every 200 units showing remaining journey with "里 Nm" calligraphy
- **Ink-wash paint stains**: dark sumi-e pools persist on road after marks fade, leaving traces of ink on the world
- **Organic drifting leaves**: 6 autumn colors, per-leaf spinning rotation, gust-responsive wind sway
- Road travel with WASD/arrow/mouse/touch (drag + long-press) controls; mouse drag look with sensitivity slider; **auto-forward drift when idle** for cinematic journey feel
- **4 journey atmosphere zones**: Meadow (z 0-300), Forest (z 300-600), Mountain (z 600-1000), Coastal (z 1000-1420) with zone-specific road colors, lantern palettes, particles, creatures, audio, and torii gate markers
- **5 journey milestone stone markers** along the road — inscribed stone pillars with Japanese calligraphy glyphs and haiku inscriptions at each route milestone position; glow when player approaches
- **Journey diary (J key)** with ink-wash scroll: journey entries, milestone haiku, shrine prayers, NPC encounters, Ganryu defeat, victory — now includes compact journey stats bar (enemies defeated, marks placed, ink used, elapsed time)
- **Death screen ink-wash ceremony**: character-specific death haiku, ink dissolving particle burst, brush divider
- **Victory ceremony**: expanded 8-color palette, ink-wash victory mist particles after defeating Ganryu
- **HUD ink-wash decoration**: Edo scroll-style gold-tinged borders, ink stone indicator
- **Zone-aware contextual hints**: hints mention current zone name
- **Ganryu approach audio drone**: deep sine bass 60→24Hz builds tension approaching boss
- Ink paint system: brush marks with chain-paint widening, paint modes (waymark/barrier/blossom), hold-duration brush sizing, **enhanced ink-wash ripple ring** and **paint audio accent** on ink placement
- **7 enemies over 5 types** plus Ganryu boss with multi-phase fight (nodachi slash/ink wave/ground pound), berserk duelist mode
- Enemy telegraph, duel focus cues, parry/block system, death ink-dissolve
- **5 quest milestones** with ink-wash vignettes and Edo haiku
- **Audio depth**: D-based Yo-scale pentatonic music — 36 pre-generated WAV audio assets (shakuhachi bamboo flute note samples, koto string instrument notes, taiko drum, zone-specific wind/ambience/motif layers, bass drone, tension drone, Ganryu drone/theme, all SFX). Oscillator fallbacks preserved for browsers where preload hasn't completed.
- **Audio assets**: `assets/audio/` directory with 36 WAV files (~10 MB total), manifest.json documenting all assets with descriptions and specs
- **Hero-specific abilities**: Musashi Resolve Strike (2x slash), Koeda Wind Step (invincible dash), Yoshino Ink Blessing (faster regen) with visual auras and cooldown UI
- **Road-side haiku moments**: ambient poetry at scenic positions
- **Road-side NPCs** (Teahouse Keeper, Traveling Merchant, Wandering Poet) — repeatable with 4 dialogue variants each
- **Road-side shrines**: 5 prayer nodes granting resolve+ink
- **Road-side fox spirits**: animated silhouettes dashing across road
- **Road travelers**: distant wanderer and pilgrim silhouettes walking along the road, creating lived-in atmosphere
- **Pause menu** with settings: Master/SFX/Music volume sliders, mouse sensitivity slider
- **Road-side events**: 3 atmospheric encounters (Spirit of the Old Road, Flower Seller, Calligrapher) with visual indicators and E-key interaction
- **Ganryu arrival epilogue**: poetic scroll overlay after victory — "Ink flows back into the tide. The brush rests. The blade sleeps."
- **Sprint with resolve economy**, **mouse drag camera look**
- **Zone-adaptive paint marks**, **rain puddle reflections**, **rain drop-ripple interaction**, **extended mark persistence**
- **Seasonal road blooms**, **zone-boundary particle burst (36 particles + wind swirl)**, **zone-name banner overlay**
- **Combat VFX**: slash trail arcs, block spark burst, parry flash
- **25 scenery kinds**: gate, pine, torii, shrine, pagoda, teaHouse, bamboo, stoneMarker, ricePaddy, bridgeArch, stall, cedar, monument, boatDock, well, lanternPost, waterfall, oldTree, stoneWall, lanternRow, crypt, willow, waterwheel, sakeStand
- Mobile touch zones auto-detect
- **Controls tutorial overlay**: visual controls grid shown on first hero selection

### Verification
- Browser runtime: Web Audio gain null safety fixed — all gain node accesses guard against null `.gain` when WAV buffers haven't finished preloading (previously caused `Uncaught TypeError: Cannot read properties of null (reading 'gain')`). Web Audio API uses valid linearRampToValueAtTime; invalid exponentialSmoothValueAtTime regression-checked. Public browser playthrough covers title -> hero select -> movement -> painting.
- Fixed `drawVignette` runtime `ReferenceError` — function was called from draw loop but was never defined. Added ink-wash paper vignette radial gradient.
- Fixed `horizon` variable ReferenceError — cherry blossom tree section used undefined `hor` instead of `horizon`.
- Audio pipeline: 36 pre-generated WAV assets loaded asynchronously via fetch+decodeAudioData; oscillator fallbacks preserved; ambient sounds use looping AudioBufferSourceNode
- `node drops/edo-inkblade-ots/test.js` — **215 checks**: all previous plus ending credits ceremony (credits state, draw function, zone memories, stats display, calligraphy end, return-to-title hint, goToTitle function, epilogue-to-credits transition)
- **All 215 checks pass**

### Screenshots
`drops/edo-inkblade-ots/screenshots/`:
- `01-character-select.jpg` — character select screen with ink-brush frame
- `02-mid-journey.jpg` — road travel with scenery, sky gradient, and milestone stone markers
- `03-paint-combat.jpg` — painting ink marks with enemy encounter
- `04-combat-duel.jpg` — duel telegraph and combat
- `05-ganryu-victory.jpg` — Ganryu arrival victory screen

### Passes
**Pass 20** — Title screen with ink-wash key art
**Pass 21** — Animated title screen with drifting mist and ink particles
**Pass 22** — Character sprite ink-wash outline and walking ink particles
**Pass 23** — Ink-wash procedural silhouettes retire vector blob fallbacks
**Pass 24** — Rain streaks replace simple dot drizzle; rain ambience
**Pass 25** — Rain puddle reflections; orientation change listener
**Pass 26** — Sprint resolve economy; extended road to 1400; 2 new enemies; dynamic melody tempo; mouse drag look
**Pass 27** — Detailed Playwright-rendered Edo ink-wash sprite sheets for all 9 characters
**Pass 28** — Dedicated sprite PNGs for mountain ascetic and ganryu sentinel
**Pass 29** — Rain drop-ripple interaction; milestone vignettes with Edo haiku
**Pass 30** — Journey atmosphere zones (4 zones with distinct visual/audio/particle identity)
**Pass 31** — Ink-wash brush character sprite art pass with sumi-e overlays
**Pass 32** — Character card click/start flow repaired
**Pass 33** — Painted waymark renderer restored
**Pass 34** — Combat depth (berserk duelist, 3 paint modes, road-side shrines, death ink-dissolve)
**Pass 35** — Zone-adaptive paint marks, fox spirits, duel tension audio, zone-entry shake, extended marks
**Pass 36** — Ganryu boss duel: multi-phase fight before victory
**Pass 37** — Zone-boundary particle burst, enhanced paint splatter, seasonal road blooms
**Pass 38** — Death/ceremony enhancement, HUD polish, zone-aware hints, Ganryu approach drone
**Pass 39** — Rich Edo audio identity (shakuhachi/koto/taiko), zone ambient creatures, atmosphere colors
**Pass 40** — Hero-specific abilities (resolveStrike/windStep/inkBlessing), road-side haiku moments
**Pass 41** — Road-side NPCs, combat VFX depth (slash trail/block spark/parry flash), pause menu
**Pass 42** — Repeatable NPCs with dialogue variants, pause volume/sensitivity settings, richer zone transition VFX (36 particles, 10 wind swirl lines, zone-name banner), master gain audio routing
**Pass 43** — Journey diary scroll (J key), road-side event encounters (Spirit/Flower Seller/Calligrapher), Ganryu arrival epilogue, enhanced journey tracking
**Pass 44** — Controls tutorial onboarding overlay displayed on first hero selection; 2 new road scenery types (waterwheel, sakeStand)
**Pass 45** — Auto-forward drift when idle for cinematic journey feel; enhanced paint ink-wash ripple rings and paint audio accent; road travelers (wanderer/pilgrim silhouettes) for road atmosphere
**Pass 46** — Journey milestone stone markers with Japanese calligraphy glyphs at each route position; diary journey stats summary bar; zone time tracking; fixed horizon variable ReferenceError; fresh screenshots
**Pass 47** — Woodblock grain texture upgrade (horizontal woodblock print grain lines), road journey progress markings (distance stones), ink-wash paint stains on road (persistent sumi-e pools), organic drifting leaves with 6 colors, spinning, and wind gust responsiveness; enhanced vignette with warm paper tone
**Pass 48** — Journey sky evolution with drifting clouds (16 cloud bands, zone-tinted, continuous drift), dramatic sunset near Ganryu (crimson/amber glow overlay), enhanced Ganryu island detail (pine trees, boat, layered mist), zone-specific sky tint overlay per zone (meadow/forest/mountain/coastal); 177 checks pass
**Pass 49** — Game balance tuning (reduced enemy ATK across all 7 types, increased ink regen, reduced sprint drain, higher paint waymark damage, lower boss phase scaling); Ganryu duel polish (phase-specific aura glow, dramatic transition VFX with 30 ground-crack/20 ink-swirl particles, increased screen shake); road atmosphere dust motes (floating warm-gold light particles); richer road travelers (merchant type with pack and stick, weighted distribution); enhanced victory ceremony (180 particles, 10-color palette, 40 ink-wash mist wisps); 186 checks pass; fresh screenshots
**Pass 50** — Zone-specific road surface textures (dirt/stone/gravel/sand per zone); zone-specific roaming enemy spawns matching zone atmosphere; zone-specific duel telegraph tints for combat readability; Ganryu ceremonial torii gate with calligraphy banner and arrival warm glow; zone-specific wind audio frequency per territory; zone-specific milestone stone colors; 197 checks pass; fresh screenshots
**Pass 51** — Generated 36 WAV audio assets (shakuhachi, koto, taiko, zone wind/ambience/motifs, drones, all SFX); replaced oscillator-based audio with buffer-based playback using looping AudioBufferSourceNode; oscillator fallbacks preserved; audio asset manifest committed
**Pass 52** — Fix browser runtime `.gain` null error safety: all gain node accesses in audio step loop now guard against null `.gain` when WAV buffers haven't finished preloading; prevents past `Cannot read properties of null (reading 'gain')` runtime failure; 197 checks pass

**Pass 53** — Ganryu arrival cinematic (dramatic ink overlay, calligraphy reveal, mist bands, particle burst when entering Ganryu's domain); enhanced Ganryu phase transition VFX (Phase 2: 40 ink + 25 light particles, Phase 3: 60 ground-crack + 40 light particles, both with hit-stop); enhanced Ganryu defeat dissolution (80 ink + 50 white + 30 gold particles); title screen depth (40 particles, 8 drifting calligraphy brush-glyphs: 風月道筆刃旅橋岸); 203 checks pass; fresh screenshots

**Pass 54** — Ending credits ceremony: after Ganryu victory epilogue scroll, a rich credits sequence plays showing journey zone memories (4 zones with descriptions), journey stats summary, and closing Edo calligraphy ("終"). `goToTitle()` function resets all state and returns to title screen on any key press during credits. Dark ink-wash overlay, drifting ink particles, "Journey Complete" title, pulsing "Press any key to return to title" hint. 215 checks pass

### Known Issues
- None current — audio gain null safety fixed; all checks pass

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.
