# Blocks Usage — Q3 Blocks Mini Live v5

## Modules Used

### `game-loop.js` (FoundryLoop)
- **Source:** `.factoryx/foundry/blocks-2d/game-loop.js`
- **Copied to:** `games/q3-blocks-mini-live-v5/game-loop.js`
- **Status:** Reused as-is, no changes.
- **Call site:** `game.js` line ~540 — `FoundryLoop.start({ update, render })`
- **Usage:** Fixed-timestep game loop at 60Hz. All game physics (block swing, gravity, placement) run through the `update(STEP)` callback at a fixed 1/60s interval. Rendering interpolates via `render(alpha)`. The pause-on-blur behavior is kept intact for tab-switching.

### `input.js` (FoundryInput)
- **Source:** `.factoryx/foundry/blocks-2d/input.js`
- **Copied to:** `games/q3-blocks-mini-live-v5/input.js`
- **Status:** Reused as-is, no changes.
- **Call site:** `game.js` line ~66 — `FoundryInput.install(canvas, { actions })`
- **Usage:** Maps `Space` and `KeyS` to the `drop` action (place block), `KeyR` to `restart` action. Uses `FoundryInput.consume('drop')` for single-consume placement and `FoundryInput.consume('restart')` on debrief screen. `FoundryInput.update(dt)` called at end of each update frame to age the press buffer. Pointer (mouse/touch) input also works via `canvas` click/tap.

## Modules Not Used

| Module | Reason |
|---|---|
| `scenes.js` | Game uses a simple state string; the scene state machine would add overhead for a 3-state flow. |
| `tween.js` | Block motion is sine-based swing + gravity; no tweening needed. |
| `particles.js` | Kept the game minimal; visual feedback comes from screen shake and flash instead. |
| `screen-shake.js` | Hand-rolled inline shake in `render()` (simple `ctx.translate` with random offset). Simple enough to not need the module. |
| `rng.js` | No seeded randomness needed; `Math.random()` suffices for collapse direction. |

## Key Changes

None. Both copied modules are unmodified. The fixed timestep and press buffer remain load-bearing and unchanged.
