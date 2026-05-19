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

### Current Artifact State (Pass 24 — Rain streaks + rain ambience + ink-wash silhouettes)
- **~1105-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
- Animated title screen: drifting mist bands and ink particles on dedicated canvas, driven by `requestAnimationFrame` loop while title is shown; clean cancel on dismiss
- Character-select screen: ink-brush frame, woodblock grain, calligraphy accents, 3 heroes (Musashi, Koeda, Yoshino)
- Road travel with WASD/arrow/mouse/touch (drag + long-press) controls
- **22 scenery kinds**: gate, pine, torii, shrine, pagoda, teaHouse, bamboo, stoneMarker, ricePaddy, bridgeArch, stall, cedar, monument, boatDock, well, lanternPost, waterfall, oldTree, stoneWall, lanternRow, crypt, willow
- Ink paint system: brush marks with chain-paint widening, stamp seal, milestone glow, ink resource with slow regen
- **Paint depth**: brush size varies by hold duration (Space/right-click/touch long-press); holdBonus and ink check
- **3 enemy types**: chaser (aggressive), prowler (circles + retreats), duelist (retreat + combo follow-up with thrust)
- Enemy telegraph wind glow, patrol patterns, HP bars, low-HP danger glow
- Duel readability checkpoint: `duelFocus` hints, blade-breath arcs, ground rings, and slash curves make enemy windups easier to understand
- Restart flow restores all enemies from patrol anchors
- **Parry/block system**: blocking reduces damage; sustained block decay; parry window gives resolve+3 and parryBonus
- **3 quest milestones**: paint waymarks -> cross bridge -> reach Ganryu shore
- Milestone popup with ink-brush frame and cherry blossoms
- Ganryu arrival ceremony: layered ocean waves, mist-shrouded island, pier, 120 victory particles, character haiku
- **Weather depth**: fog layer (two-phase density scaling by z), **rain streaks** (angled falling lines with ground splash, replacing simple dots), drizzle particles active z=300-700 zone, fade-in/out
- **Zone audio**: temple bell at bridge (3-note chord), ambient bird chirps at shrines, wind drift, river drone near bridge, **rain ambience** (filtered noise driven by drizzle zone gain)
- **Audio depth** (Pass 15): D-based Yo-scale pentatonic music system — bass drone, harmony pad, melody flute cycling Yo motifs by road zone, river drone, duel tension drone, Ganryu bright theme
- **Melody scheduler**: flute cycles ascending/wandering/descending/Ganryu hopeful motifs based on player z-position
- **Combat SFX** rebuilt with musical character
- Ambient particles: falling leaves, fireflies, river mist, drizzle
- HUD: HP, ink, resolve bars with animated fill
- Death screen: journey stats (time, defeated, ink used, resolve)
- Victory screen: full stats grid, haiku, style label
- Woodblock grain overlay, vignette, bloom, screen shake, damage flash, invincibility flash
- Mobile touch zones: walk/turn/slash/paint/block buttons auto-detect
- **Ink-wash procedural silhouettes** (Pass 23): character-specific Edo silhouettes for Musashi (kasa hat, topknot, katana), Koeda (scarf, lean build), Yoshino (hooded robe, staff) — used as fallback before sprite PNGs load. Enemy silhouettes per type. Ganryu imposing samurai silhouette.

### Verification
- `node drops/edo-inkblade-ots/test.js` — 20 checks: syntax, canvas, projection, character select, movement, art creation, duel loop, duel telegraph readability, enemy restart reset, objective progression, animation loop, preview redirect, title screen animation, negative checks (not Floating Score, not falling-object)
- **All 20 checks pass**

### Screenshots
`drops/edo-inkblade-ots/screenshots/`:
- `01-character-select.jpg` — character select screen with ink-brush frame
- `02-mid-journey.jpg` — road travel with scenery and sky gradient
- `03-paint-combat.jpg` — painting ink marks with enemy encounter
- `04-combat-duel.jpg` — duel telegraph and combat
- `05-ganryu-victory.jpg` — Ganryu arrival victory screen

### Recent Passes
**Pass 20** — Title screen with ink-wash key art
**Pass 21** — Animated title screen with drifting mist and ink particles
**Pass 22** — Character sprite ink-wash outline and walking ink particles
**Pass 23** — Ink-wash procedural silhouettes retire vector blob fallbacks per character
**Pass 24** — Rain streaks (angled falling lines with ground splash) replace simple dot drizzle; rain ambience (filtered noise) in drizzle zone

### Known Issues
- Sprite asset quality: PNGs are local-authored placeholder quality — richer ink-wash sprite sheets desirable
- Balance tuning: enemy damage values, ink economy, travel pacing
- Drizzle particles upgraded to streaks; could further add rain puddle reflections
- Melody scheduler could use more motif variety and dynamic tempo
- Screenshots are from current game state

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.
