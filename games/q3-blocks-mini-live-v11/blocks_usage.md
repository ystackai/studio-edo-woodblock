# blocks_usage.md — q3-blocks-mini-live-v11

## Modules used

| Module | Source | Status |
|---|---|---|
| `game-loop.js` | `.factoryx/foundry/blocks-2d/game-loop.js` | Reused (unchanged) |
| `input.js` | `.factoryx/foundry/blocks-2d/input.js` | Reused (unchanged) |

## Call sites

- `game-loop.js` — called as `FoundryLoop.start({ update, render })` in game.js line 143.
  Provides fixed-timestep (1/60 s) update loop with visibility-change pause handling.
- `input.js` — called as `FoundryInput.install(canvas, { actions: { up, down } })` in game.js line 13.
  Provides action-mapped keyboard (ArrowUp/W = up, ArrowDown/S = down) plus pointer `justDown` for click/tap steering.
  `FoundryInput.held()`, `FoundryInput.consume()`, `FoundryInput.update(dt)`, and `FoundryInput.pointer.justDown` are all used in the update function.

## Key changes

- None. Both blocks are used verbatim; no load-bearing shapes (fixed timestep, press buffer, trauma curve) were modified.
