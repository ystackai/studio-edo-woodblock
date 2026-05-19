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

### Current Artifact State (Pass 19 — Atmosphere progression, ink richness, duel spectacle)
- **~956-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
- Character-select screen: ink-brush frame, woodblock grain, calligraphy accents, 3 heroes (Musashi, Koeda, Yoshino)
- Road travel with WASD/arrow/mouse/touch (drag + long-press) controls
- **22 scenery kinds**: gate, pine, torii, shrine, pagoda, teaHouse, bamboo, stoneMarker, ricePaddy, bridgeArch, stall, cedar, monument, boatDock, well, lanternPost, waterfall, oldTree, stoneWall, lanternRow, crypt, willow
- Ink paint system: brush marks with chain-paint widening, stamp seal, milestone glow, ink resource with slow regen
- **Paint depth**: brush size varies by hold duration (Space/right-click/touch long-press); holdBonus and ink check
- **3 enemy types**: chaser (aggressive), prowler (circles + retreats), duelist (retreat + combo follow-up with thrust)
- Enemy telegraph wind glow, patrol patterns, HP bars, low-HP danger glow
- Duel readability checkpoint: `duelFocus` hints, blade-breath arcs, ground rings, and slash curves make enemy windups easier to understand
- Restart flow now restores all enemies from their patrol anchors instead of dropping later encounters after death/victory retry
- **Parry/block system**: blocking reduces damage; sustained block decay; parry window gives resolve+3 and parryBonus
- **3 quest milestones**: paint waymarks -> cross bridge -> reach Ganryu shore
- Milestone popup with ink-brush frame and cherry blossoms
- Ganryu arrival ceremony: layered ocean waves, mist-shrouded island, pier, 120 victory particles, character haiku
- **Weather depth**: fog layer (two-phase density scaling by z), drizzle particles (z=300-700 zone, fade-in/out)
- **Zone audio**: temple bell at bridge (3-note chord), ambient bird chirps at shrines, wind drift, river drone near bridge
- **Audio depth** (Pass 15): D-based Yo-scale pentatonic music system — bass drone (73.4Hz D2), harmony pad (D3/A3/C4/G3 zone-triggered), melody flute cycling Yo motifs by road zone, river drone (95Hz), duel tension drone (55Hz sawtooth), Ganryu bright theme (440/554/659/880 triangle)
- **Melody scheduler**: flute cycles ascending (yoMotif1), wandering (yoPhrase), descending (yoMotif2), and Ganryu hopeful (yoMotif3) motifs based on player z-position
- **Combat SFX** rebuilt with musical character: slash (bandpass ring), paint (noise+triangle), block (square+resonance), hit, death (Dm7 chord), inkRegen, mark, victory (rising fanfare)
- Ambient particles: falling leaves, fireflies, river mist, drizzle
- HUD: HP, ink, resolve bars with animated fill
- Death screen: journey stats (time, defeated, ink used, resolve)
- Victory screen: full stats grid, haiku, style label
- Woodblock grain overlay, vignette, bloom, screen shake, damage flash, invincibility flash
- Mobile touch zones: walk/turn/slash/paint/block buttons auto-detect

### Verification
- `node drops/edo-inkblade-ots/test.js` — 17 checks: syntax, canvas, projection, character select, movement, art creation, duel loop, duel telegraph readability, enemy restart reset, objective progression, animation loop, preview redirect, negative checks (not Floating Score, not falling-object)
- **All 19 checks pass**
- Atmosphere progression: sky shifts from cool dawn to warm sunset as player travels toward Ganryu, creating palpable journey tension
- Ink painting burst enhanced: doubled splatter counts, wider spread, dark ink mist clouds for deeper sumi-e feel
- Duel cue now uses dashed ellipse, brighter blade-telegraph glow, larger ground ring, pulsing arc bolus for more readable windup telegraphy

### Next Work
18. Polish until deadline (2026-05-25T22:13:34Z): balance tuning, UX flow, generated assets (character portraits, title art), screenshot integration, PR body screenshots

### Art/Audio Quality Direction
Yo-scale pentatonic melody scheduler now drives zone-adaptive flute motifs. Bass drone, harmony pad, tension drone, and Ganryu bright theme provide musical depth. Procedural generation adds richness but future passes can commit generated image assets for character portraits and UI textures.

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.

### Latest Checkpoint (Pass 17 — Edo character sprite art)
- Replaced the tiny block-like PNG sprites with richer transparent Edo ink-wash character sheets for Musashi, Koeda, Yoshino, road enemies, and Ganryu.
- Updated `drops/edo-inkblade-ots/assets/characters/_contact_sheet.png` and `manifest.json` so future passes can see the sprite direction.
- Note: the worker's direct image API path returned HTTP 401, so this checkpoint uses local authored/generated sprite assets rather than raw API-generated images.

### Latest Checkpoint (Pass 19 — Atmosphere progression, ink richness, duel spectacle)
- Sky gradient now interpolates from cool dawn (#1c2839 / #6a5a4b) toward warm sunset (darker amber/brown) based on journey progress (player.z/1000)
- Ink painting burst: splat count increased (20 → 20+chain*20), spread widened, dark ink mist clouds added for richer sumi-e texture
- Duel cue: dashed elliptical telegraph ring, brighter blade-bolt glow, larger ground ring with pulsing arc bolus, making enemy windups more visible in both live play and screenshots
- All 19 smoke checks pass
