# blocks_usage.md — q3-blocks-mini-live-v18

## Modules copied

| Source | Destination | Status |
|---|---|---|
| `.factoryx/foundry/blocks-2d/game-loop.js` | `games/q3-blocks-mini-live-v18/game-loop.js` | Copied as-is |
| `.factoryx/foundry/blocks-2d/input.js` | `games/q3-blocks-mini-live-v18/input.js` | Copied as-is |
| `.factoryx/foundry/sound/webaudio-kit.js` | `games/q3-blocks-mini-live-v18/webaudio-kit.js` | Copied as-is |

## Call sites

### game-loop.js (FoundryLoop)
- `game.js` line ~148: `FoundryLoop.start({update:update, render:render})`
- Drives the fixed-timestep 60fps loop; `update(dt)` handles physics/collisions, `render(alpha)` draws the scene.

### input.js (FoundryInput)
- `game.js` line ~28: `FoundryInput.install(C, {actions:{hop:["Space","Enter"], left:["ArrowLeft","KeyA"], right:["ArrowRight","KeyD"]}})`
- Consumed in `update()`: `FoundryInput.held("left")`, `FoundryInput.held("right")`, `FoundryInput.consume("hop")`, `FoundryInput.update(dt)`
- Load-bearing shapes preserved: press buffer (0.12s), fixed-step consumption pattern.

### webaudio-kit.js (FoundryAudio)
- `game.js` line ~147: `FoundryAudio.install()` — called once at boot
- `game.js` line ~30 (doProbe): `FoundryAudio.click()` and `FoundryAudio.droneStart(48)` — called on first user interaction only
- `game.js` update: `FoundryAudio.pickup()` on moth catch, `FoundryAudio.success()` on win, `FoundryAudio.fail()` on carp hit
- No re-install on reset; audio context created once on first gesture.

## Probe-first direct listeners

In addition to `FoundryInput.install(canvas)`, the game registers **capture-phase** listeners on `window`:

1. `window.addEventListener("pointerdown", doProbe, true)` — catches first tap/click globally
2. `window.addEventListener("keydown", ..., true)` — catches Space, Enter, ArrowLeft, ArrowRight, KeyA, KeyD in capture phase

The `doProbe` handler (first interaction only):
- Moves fox 80px left synchronously (`fx.x -= 80`)
- Sets `state = "play"` (transitions from title screen)
- Triggers lantern flare lasting 1.0s (`flare = 1.0`, visible via radial gradient glow expansion)
- Calls `FoundryAudio.click()` and `FoundryAudio.droneStart(48)`

## Key changes

None — all three modules are verbatim copies from `.factoryx/foundry/`. No load-bearing shapes (fixed timestep, press buffer, trauma curve) were modified.
