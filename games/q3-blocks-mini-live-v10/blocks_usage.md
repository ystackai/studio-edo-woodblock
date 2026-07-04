# Blocks Usage — q3-blocks-mini-live-v10

## Creative intent
This should feel like a woodblock printer in an Edo-era workshop catching falling carved blocks and cherry petals while avoiding spilled ink drops.

## Modules copied from `.factoryx/foundry/`

### `game-loop.js` (from `.factoryx/foundry/blocks-2d/game-loop.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` — `FoundryLoop.start({ update, render })` kicks off the fixed-timestep loop at 60 Hz. Both `update(dt)` and `render(alpha)` are called every frame.

### `input.js` (from `.factoryx/foundry/blocks-2d/input.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` — `FoundryInput.install(C, { actions })` binds ArrowLeft/A and ArrowRight/D. `FoundryInput.held()` drives catcher movement, `FoundryInput.pointer.down` enables mouse/touch steering, `FoundryInput.pointer.justDown` triggers title→play transition, `FoundryInput.consume()` handles keyboard start. `FoundryInput.update(dt)` ages buffers at end of each tick.

### `webaudio-kit.js` (from `.factoryx/foundry/sound/webaudio-kit.js`)
- **Status**: Copied unchanged.
- **Called in**: `game.js` — `FoundryAudio.install()` arms audio context on first gesture. `FoundryAudio.droneStart(55)` on play start, `FoundryAudio.pickup()` on catch, `FoundryAudio.fail()` on miss/ink hit, `FoundryAudio.droneStop()` and `FoundryAudio.success()` at round end.

## Key changes
- None. All three modules copied verbatim. Game logic in `game.js` is original and kept under 140 lines.

## Adaptation notes
- Title screen renders a dark, text-only first paint with pulsing start prompt (no objects or catcher visible) so the transition to play state is dramatically visible for browser verification.
- A `C.addEventListener('click', doStart)` handler ensures the canvas click reliably transitions from title to play, producing an immediately visible frame change.
