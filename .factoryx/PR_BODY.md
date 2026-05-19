## Edo Inkblade: Road to Ganryu

FactoryX-WorkOrder: work-order-1779143195423-18
FactoryX-Factory: factory-edo-woodblock

### Scope
Week-long OTS build of Edo Inkblade: Road to Ganryu — a playable over-the-shoulder Edo-era art-and-duel game. Character selection, road travel, ink mark-making, evasion/duel combat, milestone progression, and arrival at Ganryu.

### Planning Gates (committed)

**Strategy** — `.factoryx/GOAL_EXECUTION_STRATEGY.md`
- Player fantasy, mood & references (UKyo-e prints, sumi-e ink wash), core interaction loop, art/audio direction, engine & verification plan, non-goals, process milestones.

**Technical Design** — `.factoryx/TECHNICAL_SYSTEM_DESIGN.md`
- Files/module layout, data flow, game-state layout, controls, rendering layer order & projection, audio plan, procedural asset plan, verification strategy, risks, rollout, implementation order.

### Preview
`drops/edo-inkblade-ots/index.html` — opens directly to the game canvas. Preview root: `drops/edo-inkblade-ots/preview.html`.

### Current Artifact State
- 518-line single HTML game with 2D canvas pseudo-3D rendering
- Hero roster: Miyamoto Musashi, Koeda, Yoshino
- Road travel with WASD/arrow/mouse/touch controls
- Ink paint system (right-click/hold → brush marks on world)
- 3 enemy types: chaser, prowler, duelist with telegraph attacks
- 3 quest milestones: paint waymarks → cross bridge → reach Ganryu
- Ambient particles (leaves, fireflies, river mist)
- Audio: current wind/river/footstep/combat SFX are scaffolding; final direction now requires a real musical identity and committed or deliberately composed audio assets
- HUD: HP, ink, resolve bars with animated fill
- Death & victory screens with journey stats
- Woodblock grain overlay, bloom, vignette, screen shake

### Verification
- `node drops/edo-inkblade-ots/test.js` — 15+ syntax, structure, and negative checks (passes)
- JS syntax validated via `new Function()`

### Known Gaps / Next Passes
1. Character-select screen with ink-brush frame and unique silhouettes
2. Deeper road scenery (temple gate, flooded rice, bamboo grove, etc.)
3. Paint mark persistence and terrain-responsive appearance
4. Combat depth (duelist second attack, tighter block timing)
5. Ganryu arrival zone with layered mist, island silhouette, closing ceremony
6. Real art asset pass: title/key art, character portraits/sprites, enemy designs, Ganryu backdrop, UI texture plates
7. Real music/audio pass: road motif, ambient layer, duel tension layer, Ganryu arrival cue, polished SFX
8. Mobile UX verification at small viewports
9. Final verification, screenshots, PR body update, review invitation

### FactoryX WorkOrder Context
Full prompt preserved. Delivery branch: `factoryx/factory-edo-woodblock/edo-inkblade-ots`.
Target repo: `ystackai/studio-edo-woodblock`. Canonical PR: #107.
Deadline: 2026-05-25T22:13:34Z. Finish policy: polish_until_deadline.

### Quality Bar Correction
The planning docs now explicitly reject placeholder-only primitive art and oscillator-only final audio. Procedural generation is still allowed when it adds richness, but the target is committed/generated visual assets plus a real musical identity.
