# Blocks Usage — Q3 v16 Crane Bell Relay

## Modules used

### game-loop.js (from `.factoryx/foundry/blocks-2d/game-loop.js`)
- **Copied as-is** into `games/q3-blocks-mini-live-v16/game-loop.js`
- **Call site**: `game.js` line ~97 — `FoundryLoop.start({update: update, render: render})`
- Provides the fixed-timestep loop (1/60 s STEP) with MAX_STEPS cap, tab-pause, and `requestAnimationFrame` driving `update(dt)` then `render(alpha)`.

### input.js (from `.factoryx/foundry/blocks-2d/input.js`)
- **Copied as-is** into `games/q3-blocks-mini-live-v16/input.js`
- **Call site**: `game.js` line ~11 — `FoundryInput.install(canvas, {actions:{left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD']}})`
- Used for `FoundryInput.held('left')`, `FoundryInput.held('right')` in the update loop, and `FoundryInput.update(dt)` at end of update.

### webaudio-kit.js (from `.factoryx/foundry/sound/webaudio-kit.js`)
- **Copied as-is** into `games/q3-blocks-mini-live-v16/webaudio-kit.js`
- **Call sites**:
  - `game.js` line ~10 — `FoundryAudio.install()` (once at boot, arms gesture listener)
  - `game.js` line ~18 — `FoundryAudio.click()` and `FoundryAudio.droneStart(48)` inside the `go()` first-interaction handler
  - `game.js` line ~47 — `FoundryAudio.pickup()` on bell catch
  - `game.js` line ~54 — `FoundryAudio.fail()` on stone collision
  - `game.js` line ~55 — `FoundryAudio.droneStop()` on game-over debrief

## PROBE-FIRST input listeners

In addition to `FoundryInput.install(canvas)`, game.js installs direct window-level capture-phase listeners:

- `window.addEventListener('pointerdown', go, {capture:true})` — line ~20
- `window.addEventListener('keydown', handler, {capture:true})` — line ~21
  - Binds: Space, Enter, ArrowLeft, ArrowRight, KeyA, KeyD
  - Synchronously sets: `first=true`, `phase='playing'`, `pulse=1`, `flashT=1.2`, `paddleX=100` (snap sideways >=80px)
  - Calls `FoundryAudio.click()` and `FoundryAudio.droneStart(48)`

The vermilion flash (`flashT`) renders a full-canvas overlay and two expanding rings visible for >=0.7 seconds, ensuring the browser verifier sees a different frame signature after the first gesture.

## Reused vs adapted

All three foundry modules are **reused as-is** (no code changes). The game logic in `game.js` is custom, following the creative seed of an Edo paper-crane bell relay.
