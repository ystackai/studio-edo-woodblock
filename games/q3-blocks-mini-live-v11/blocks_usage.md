# blocks_usage.md — q3-blocks-mini-live-v11

## Modules used

| Module | Source | Status |
|---|---|---|
| `game-loop.js` | `.factoryx/foundry/blocks-2d/game-loop.js` | Reused (unchanged) |
| `input.js` | `.factoryx/foundry/blocks-2d/input.js` | Reused (unchanged) |

## Call sites

- **game-loop.js** — `FoundryLoop.start({ update, render })` at bottom of game.js.
  Provides fixed-timestep (1/60 s) update loop with visibility-change pause.
- **input.js** — `FoundryInput.install(C, { actions: { up, down } })` near top of game.js.
  Provides action-mapped keyboard (ArrowUp/W = up, ArrowDown/S = down) plus pointer `justDown` for click/tap steering.
  `FoundryInput.held()`, `FoundryInput.consume()`, `FoundryInput.update(dt)`, and `FoundryInput.pointer.justDown` used throughout `update()`.

## Key changes

- **game.js v2** — Fixed critical interaction bug: previous version had `if (!started) return;` before the `pointer.justDown` check, so the first click/key was never detected. Replaced boolean flag with a `phase` state machine (`'waiting'` → `'playing'` → `'hit'`/`'shore'`) that always processes the first interaction before any early return. This ensures the frame changes immediately on the first click/key press.
- Both foundry blocks remain verbatim; no load-bearing shapes modified.

## Game: River Lantern

Guide a lantern-lit boat downstream at dusk. Dodge floating debris (brown logs with reed accents) for 35 seconds to reach shore. Click/tap to steer toward that point, or use arrow keys / W/S for vertical movement. Score increases with time; reaching shore grants +500 bonus.
