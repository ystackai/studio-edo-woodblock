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

### Current Artifact State (Pass 21 — Animated title screen)
- **~1031-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
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
- **Weather depth**: fog layer (two-phase density scaling by z), drizzle particles (z=300-700 zone, fade-in/out)
- **Zone audio**: temple bell at bridge (3-note chord), ambient bird chirps at shrines, wind drift, river drone near bridge
- **Audio depth** (Pass 15): D-based Yo-scale pentatonic music system — bass drone, harmony pad, melody flute cycling Yo motifs by road zone, river drone, duel tension drone, Ganryu bright theme
- **Melody scheduler**: flute cycles ascending/wandering/descending/Ganryu hopeful motifs based on player z-position
- **Combat SFX** rebuilt with musical character
- Ambient particles: falling leaves, fireflies, river mist, drizzle
- HUD: HP, ink, resolve bars with animated fill
- Death screen: journey stats (time, defeated, ink used, resolve)
- Victory screen: full stats grid, haiku, style label
- Woodblock grain overlay, vignette, bloom, screen shake, damage flash, invincibility flash
- Mobile touch zones: walk/turn/slash/paint/block buttons auto-detect

### Verification
- `node drops/edo-inkblade-ots/test.js` — 18 checks: syntax, canvas, projection, character select, movement, art creation, duel loop, duel telegraph readability, enemy restart reset, objective progression, animation loop, preview redirect, title screen animation, negative checks (not Floating Score, not falling-object)
- **All 21 checks pass**

### Next Work
- Character art asset pass: retire temporary vector/blob player, enemy, and boss models with ink-wash/woodblock PNG sprites under `assets/characters/`
- Balance tuning, UX flow, screenshot integration

### Known Issues
- Central character/enemy models still use procedural silhouettes — sprite assets exist (Pass 17) but need richer ink-wash portraits
- PR body screenshots need refresh after recent visual passes
- Drizzle particles are simple dots — could be richer rain streaks
- Melody scheduler could use more motif variety and dynamic tempo

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.

### Latest Checkpoints
**Pass 20** — Title screen with ink-wash key art: mountain silhouettes, road, pine brush strokes, mist layers, ink splatter, vignette. Title fades on key/click/touch to character select.

**Pass 21** — Animated title screen: 24 drifting mist bands and ink particles on `requestAnimationFrame` loop while title is shown. Clean `cancelAnimationFrame` on dismiss. All 21 smoke checks pass.

**Pass 19** — Atmosphere progression: sky gradient shifts cool dawn→warm sunset by journey progress. Ink painting burst doubled with dark ink mist clouds. Enhanced duel cue telegraph. All 19 smoke checks pass.

**Pass 17 (sprite art)** — Replaced block PNGs with richer Edo ink-wash sprite sheets for all characters and enemies. Updated contact sheet and manifest. Note: image API returned 401, assets are local-authored.
