# Edo Inkblade: Road to Ganryu — WORKLOG

## Artifact
`drops/edo-inkblade-ots/index.html` — over-the-shoulder Edo art-and-duel game (~1013 lines)

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
- Screenshots need fresh captures after Pass 27 sprite generation and Pass 26 balance changes
- Mountain ascetic and ganryu sentinel currently reuse monk/duelist sprite keys — dedicated sprite mappings desirable

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

## Pass 26 — Sprint resolve economy, extended road, dynamic melody, mouse look
- **Sprint mechanic with resolve drain**: Shift key drains resolve...
- **Balance tuning — extended road to 1400 units**...
- **2 new enemies**...
- **Dynamic melody tempo**...
- **Mouse drag camera look**...
- All 27 smoke checks pass
