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

### Current Artifact State (Pass 14 — scenery depth complete)
- **864-line single HTML game** with 2D canvas pseudo-3D over-the-shoulder rendering
- Character-select screen: ink-brush frame, woodblock grain, calligraphy accents, 3 heroes (Musashi, Koeda, Yoshino)
- Road travel with WASD/arrow/mouse/touch (drag + long-press) controls
- **22 scenery kinds**: gate, pine, torii, shrine, pagoda, teaHouse, bamboo, stoneMarker, ricePaddy, bridgeArch, stall, cedar, monument, boatDock, well, lanternPost, waterfall, oldTree, stoneWall, lanternRow, crypt, willow
- Ink paint system: brush marks with chain-paint widening, stamp seal, milestone glow, ink resource with slow regen
- **Paint depth**: brush size varies by hold duration (Space/right-click/touch long-press); `holdBonus = min(3, paintHoldTime/15)`; ink check prevents zero-ink paint
- **3 enemy types**: chaser (aggressive), prowler (circles + retreats), duelist (retreat + combo follow-up with thrust)
- Enemy telegraph wind glow, patrol patterns, HP bars, low-HP danger glow
- **Parry/block system**: blocking reduces damage; sustained block decay; **parry window** (wind 45-65 while blocking) gives resolve+3 and parryBonus
- **3 quest milestones**: paint waymarks → cross bridge → reach Ganryu shore
- Milestone popup with ink-brush frame and cherry blossoms
- Ganryu arrival ceremony: layered ocean waves, mist-shrouded island, pier, 120 victory particles, character haiku
- **Weather depth**: fog layer (two-phase density scaling by z), drizzle particles (z=300-700 zone, fade-in/out)
- **Zone audio**: temple bell at bridge (3-note chord, bellRung flag), ambient bird chirps at shrines, wind drift, river drone near bridge
- Ambient particles: falling leaves, fireflies, river mist, drizzle
- Ambient audio: lowpass wind noise, river drone, footstep percussion
- Combat SFX: slash, paint, block, hit, death, ink regen, mark, victory jingle
- HUD: HP, ink, resolve bars with animated fill
- Death screen: journey stats (time, defeated, ink used, resolve)
- Victory screen: full stats grid, haiku, style label
- Woodblock grain overlay, vignette, bloom, screen shake, damage flash, invincibility flash
- Mobile touch zones: walk/turn/slash/paint/block buttons auto-detect `ontouchstart`

### Verification
- `node drops/edo-inkblade-ots/test.js` — 15 checks: syntax, canvas, projection, character select, movement, art creation, duel loop, objective progression, animation loop, preview redirect, negative checks (not Floating Score, not falling-object)
- **All 15 checks pass**

### Next Work
16. Polish until deadline (2026-05-25T22:13:34Z): balance tuning, audio richness, UX flow, generated assets (title/key art, character portraits, UI textures), screenshot integration, PR body screenshots

### Art/Audio Quality Direction
Procedural generation adds richness but is not a license for placeholder-only primitives. Future passes should commit generated image assets and compose real musical identity.

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.
