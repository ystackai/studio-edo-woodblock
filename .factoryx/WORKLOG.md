# Edo Inkblade: Road to Ganryu — WORKLOG

## Artifact
`drops/edo-inkblade-ots/index.html` — over-the-shoulder Edo art-and-duel game (~2928 lines)

## Completed Passes

### Pass 53 — Ganryu arrival cinematic, enhanced boss phase transitions, title screen depth
- **Ganryu arrival cinematic**: when player first crosses z>1320, dramatic cinematic triggers — 60 ink swirl particles, 30 white light particles, 8-magnitude screen shake, deep ink-wash overlay with dark mist bands, pulsing ink dots, calligraphy text "Ganryu — the shore where ink and blade wait", torii gate silhouette in background
- **Enhanced Ganryu phase transitions**: Phase 2 (60% HP) — 40 ink swirl + 25 light particles, hitStop=4, screenShake=6. Phase 3 (30% HP) — 60 ground-crack + 40 light particles, hitStop=6, screenShake=10
- **Enhanced Ganryu defeat dissolution**: 80 ink particles, 50 white particles, 30 gold particles, hitStop=12, screenShake=10
- **Enhanced title screen depth**: increased particles from 24 to 40, added 8 drifting calligraphy brush-stroke particles (Japanese glyphs: 風月道筆刃旅橋岸) that float upward with animated brush arcs
- 203 smoke checks pass

### Pass 52 — Fix browser runtime `.gain` null error safety for all audio gain nodes
- Fixed root cause of past browser runtime verification failure (`Uncaught TypeError: Cannot read properties of null (reading 'gain')`) by adding proper null safety for all gain node accesses in the audio step loop
- Changed outer conditional from checking stub objects to checking `amb.footstep` only, then adding explicit `amb.X && amb.X.gain` guards before each `.gain.gain` access
- 197 smoke checks pass

### Pass 51 — Generated 36 WAV audio assets
- Generated 36 WAV audio assets (shakuhachi, koto, taiko, zone wind/ambience/motifs, drones, all SFX)
- Replaced oscillator-based audio with buffer-based playback using looping AudioBufferSourceNode
- Oscillator fallbacks preserved; audio asset manifest committed
- 197 smoke checks pass

### Pass 50 — Zone-specific road surfaces, roaming enemies, telegraph colors, Ganryu ceremony
- Zone-specific road surface textures (dirt/stone/gravel/sand per zone)
- Zone-specific roaming enemy spawns matching zone atmosphere
- Zone-specific duel telegraph tints for combat readability
- Ganryu ceremonial torii gate with calligraphy banner and arrival warm glow
- Zone-specific wind audio frequency per territory
- Zone-specific milestone stone colors
- 197 smoke checks pass

### Pass 49 — Game balance tuning, Ganryu duel polish, road atmosphere, richer travelers, enhanced victory
- Reduced enemy ATK across all 7 types, increased ink regen, reduced sprint drain, higher paint waymark damage, lower boss phase scaling
- Ganryu duel polish: phase-specific aura glow, dramatic transition VFX, increased screen shake
- Road atmosphere dust motes (floating warm-gold light particles)
- Richer road travelers (merchant type with pack and stick, weighted distribution)
- Enhanced victory ceremony (180 particles, 10-color palette, 40 ink-wash mist wisps)
- 186 checks pass

### Pass 48 — Journey sky evolution with drifting clouds, dramatic sunset, enhanced Ganryu island, zone sky tints
- 16 soft-edged cloud bands with zone-tinted drift across sky
- Dramatic crimson/amber sunset overlay intensifies near Ganryu (z>1000)
- Enhanced Ganryu island detail (pine trees, boat dock, layered mist)
- Zone-specific sky tint overlay per zone
- 177 checks pass

### Pass 47 — Woodblock grain upgrade, road progress markings, ink-wash stains, organic leaves, vignette
- Horizontal woodblock print grain lines with thickness/wave variation
- Road journey progress markings (distance stones with 里 Nm calligraphy)
- Ink-wash paint stains on road (persistent sumi-e pools after marks fade)
- Organic drifting leaves (6 autumn colors, spinning rotation, gust-responsive wind sway)
- Enhanced vignette with warm paper tone
- 169 checks pass

### Passes 46-11 — Various gameplay depth, audio, UI, and visual refinements
(See earlier worklog entries for details)

### Pass 54 — Enhanced ending ceremony with credits sequence and journey memory montage
- **Ending credits sequence** added: after Ganryu victory epilogue scroll fades (240 frames), a rich ending credits overlay appears (360 frames) showing journey zone memories (meadow/forest/mountain/coastal with zone-specific descriptions), journey stats summary (time, enemies defeated, marks placed, ink used, hero name), and closing calligraphy ("終" — The End)
- **Journey memory montage**: zone recollections scroll upward with zone-specific colors and descriptions, creating a meditative journey reflection
- **"Return to title" flow**: `goToTitle()` function resets all game state and returns to title screen; any key press during credits triggers return to title
- **Enhanced ending ceremony**: dark ink-wash overlay, drifting ink particles, "Journey Complete" title, stats display, pulsing "Press any key to return to title" hint
- All 203 existing checks pass; new checks added for credits state, goToTitle function, credits drawing function

### Pass 57 — Road-side ink stone collectibles, animated fog banks, enhanced milestone ceremony, Ganryu island wave animation
- **Road-side collectible ink stones**: zone-colored glowing stones spawn along road edges (meadow golden, forest blue, mountain gray, coastal amber); player absorbs them for +1 ink when passing within 30px; ink regen sparkle and UI hint on collection
- **Zone-specific animated fog banks**: horizontal mist bands drift across road view per zone, with zone-tinted fog colors (meadow warm, forest earthy, mountain cool, coastal golden); organic drift with secondary wisps for layered atmosphere
- **Enhanced milestone arrival ceremony**: ink-wash ring particle burst (18 radial sparks + 10 white light) at each milestone trigger zone (shrine/bridge/valley/mountain/ganryu) with zone-specific colors and camera shake
- **Animated Ganryu island shoreline waves**: boat now bobs with drift animation; shoreline wave froth lines with foam particles animate along island edge; adds living sea atmosphere to Ganryu approach
- All 233 existing checks pass; new checks added for ink pickups, fog banks, milestone ceremony, Ganryu waves
- **Zone transition portal effect**: dramatic ink-wash gate with sweeping brush pillar strokes, calligraphy zone name ("ink threshold"), falling ink-drip particles, warm glow — activates at each zone boundary crossing
- **Brush-stroke trail animation**: animated ink sweep trail when painting — trailCount particles follow brush from player to paint point with fade/size/spread, creating visible ink-brush movement
- **Road-side grass blade animation**: animated grass blades along road edges with wind-responsive sway (bladeSway, bladeWind)
- **Wind-responsive road flowers**: existing road-side flowers and seasonal blooms now sway with windDrift, using flowerSway/bloomSway for organic movement
- 233 smoke checks pass (225 existing + 8 new: zone portal function, zone portal state, zone portal timer decay, brush trails array, brush trails draw function, brush trails on paint, grass blade animation, wind-responsive flowers)

### Pass 58 — Road-side campfire vignettes, screen-edge damage flash, smooth zone weather transitions
- **Road-side campfire vignettes**: warm glowing campfires spawn along the road at journey intervals (up to 6), with zone-appropriate fire colors (meadow/forest/mountain warm orange, coastal golden amber). Each campfire emits a radial glow with pulsing inner flame, floating ember sparks, and ambient warmth that creates rest-stop atmosphere.
- **Screen-edge damage flash overlay**: when the player takes damage, a red radial pulse flashes at the screen edges with fade decay (`screenDamageFlash`). Larger hits produce stronger, longer flashes. Works alongside `player.damageFlash` for layered combat feedback. Triggered on Ganryu boss attacks (tremor, nodachi slash) and all regular enemy strikes with damage-scaled intensity.
- **Smooth zone weather transitions**: rain intensity now lerps between zones using `smoothRain` variable with a 0.06*dt smoothing factor, eliminating abrupt weather changes at zone boundaries. Rain effective value (`rainEffective`) controls drizzle spawn rate, puddle formation, ripple effects, and audio rain gain — all transitions feel gradual and organic.
- 259 checks pass (245 existing + 7 new: campfire array, campfire draw function, campfires rendered in draw, screen damage flash variable, screen damage flash overlay draw, smooth rain transition, rain effective used for audio)

### Pass 59 — Campfire flying ember particle effects
- **Flying ember particles**: campfires now produce organic flying ember sparks (campfireEmbers) that rise upward and drift away from the fire. Each ember has a warm white core with orange glow halo, decays naturally in brightness and size, and creates a living fire atmosphere. Embers are cleaned up on game restart alongside campfire arrays.
- 264 checks pass (259 existing + 5 new: ember array init, ember draw function, embers rendered in draw, embers spawned in step, embers reset on restart)

### Pass 60 — Ganryu arrival SFX fix, road event persistent decorations
- **Ganryu arrival SFX fix**: replaced incorrect `sfx.death()` with `sfx.victory()` plus a one-shot `playBuffer('ganryu-theme')` call, giving the arrival cinematic a proper dramatic fanfare instead of a death sound
- **Road event persistent decorations**: spirit, flower seller, and calligrapher events now leave lasting visual marks on the road: spirit mark (ethereal golden glow with drifting mist wisps), flower bloom (5-petal delicate flower with pulsing bloom phase), calligraphy brush-stroke character (道 glyph in ink-blue tone). Decorations persist for up to 3600 frames, creating a sense of road history.
- 272 checks pass (264 existing + 8 new: road decoration array init, draw function, rendered in draw, spirit/flower/calligraphy decoration creation, reset in goToTitle, ganryu arrival sfx fix)

### Pass 61 — Calligraphy paint mode, enhanced brush trails, haiku moments
- **Calligraphy paint mode (key 4)**: new paint mode that inscribes floating kanji characters (道 Road, 風 Wind, 月 Moon, 花 Flower, 海 Sea) with ink brush stroke rendering and blessing effects (resolve, speed, ink, heal, calm). Each calligraphy mark produces flowing ink brush calligraphy stroke particles, gold ink blessing sparkles, and a radial golden ink aura. The kanji character floats above the mark with visible brush-stroke glyph lines.
- **Enhanced brush trail rendering**: brush trails now render as sumi-e ink brush strokes with water spread halo, ink pooling variation, and taper tail marks for organic brush feel — ellipses with width/height variation, ink wash paper bleed edges, and trailing brush hair marks.
- **Updated haiku moments**: refreshed poetic haiku content across all 5 scenic road points with more evocative Edo-era imagery (morning brush, pine shadows, cedar breath, river voice, salt wind).
- 282 checks pass (272 existing + 10 new: calligraphy paint mode defined, key 4, kanjiChars array, calligraphy mark kind created on paint, calligraphy mark rendered in drawMark, calligraphy UI label, calligraphy controls hint, enhanced brush trail sumi-e rendering, plus calligraphy mode in paint function)

### Pass 62 — Road-side ink painting canvas stations, gain null safety fix, runtime check fix
- **Shakuhachi gain null safety fix**: fixed `amb.shaku.gain||amb.shaku.gain` redundant guard — replaced with proper `amb.shaku.g && amb.shaku.g.gain` check. The previous pattern `amb.shaku.gain||amb.shaku.gain` used same expression on both sides and had `pg.gain.linearRampToValueAtTime` called outside the null guard, creating a latent runtime TypeError if `amb.shaku` preload hadn't completed.
- **Runtime check DOM ID fix**: character select element check used `getElementById('chars')` but the actual DOM ID is `select`; fixed to prevent false failure in browser runtime verification.
- **Road-side ink painting canvas stations**: 4 scenic viewpoints along the road (z=120 meadow wildflowers, z=380 forest cedar, z=680 mountain peak mist, z=1080 coastal shore wave) where pressing E triggers a 60-frame painting animation that creates a permanent ink painting road decoration (maxAge=7200 frames). Each canvas shows zone-specific easel with brush icon, empty paper, and zone glyph hint before painting. After completion, the painting appears as framed ink-wash artwork with subject calligraphy character and mist aura. Diary entry records the painting.
- 291 checks pass (282 existing + 9 new: painting canvas array defined, glyphs defined, E-key interaction, drawPaintingCanvases function, called in draw, painting decoration in drawRoadDecorations, state variables, 60-frame animation, goToTitle reset)

(End of file)
