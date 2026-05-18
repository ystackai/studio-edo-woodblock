## Edo Inkblade: Road to Ganryu

FactoryX-WorkOrder: work-order-1779110113149-ots-polish
FactoryX-Factory: factory-edo-woodblock

### Scope
This replaces the wrong-scope Floating Score/top-down canvas path with a fresh first/over-the-shoulder Edo art-and-duel bootstrap at `drops/edo-inkblade-ots/index.html`.

Implemented in the bootstrap:
- Perspective road renderer with horizon/depth scaling, mountains, gates, houses, trees, and an over-the-shoulder player view
- Character selection: Miyamoto Musashi, Koeda, Yoshino
- WASD movement, arrow turning, run, slash, and block controls
- Ink/art mechanic that places permanent marks in the world and can pacify enemies
- Duel loop with enemies, HP, blocking, enemy attacks, and victory/objective progression toward Ganryu
- Preview entrypoint at `.factoryx/preview-entrypoint`
- Smoke test at `drops/edo-inkblade-ots/test.js`, wired into `verify.sh`

### Preview
`drops/edo-inkblade-ots/index.html`

Expected live preview after deploy:
https://www.ystackai.com/factoryx/edo-woodblock/previews/edo-woodblock/edo-inkblade-ots/

### Verification
- `node drops/edo-inkblade-ots/test.js` passes
- `scripts/verify.sh` passes
- Playwright visual smoke: nonblank 1366x768 canvas, movement/art/slash exercised, objective advanced to "Paint 2 more waymarks before Ganryu."

### Known Gaps / Next Polish
- This is a bootstrap, not the final 7-day-quality game
- Needs richer traversal, enemy behavior, animation, audio, stronger Edo material texture, and more authored progression
- FactoryX follow-up WorkOrder should polish this same branch/artifact rather than opening another tiny parallel demo
