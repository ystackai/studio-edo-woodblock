# Foundry Blocks Usage — q3-blocks-mini-live-v13

## game-loop.js

- **Source:** `.factoryx/foundry/blocks-2d/game-loop.js`
- **Copied to:** `games/q3-blocks-mini-live-v13/game-loop.js`
- **Call site:** `game.js` line 102 — `FoundryLoop.start({ update: update, render: render })`
- **Role:** Fixed-timestep game loop at 60Hz. Runs `update(dt)` and `render(alpha)` each frame. Provides `FoundryLoop.STEP` (1/60) and `FoundryLoop.time()` for elapsed simulated time.
- **Changes:** none — used as-is.

## input.js

- **Source:** `.factoryx/foundry/blocks-2d/input.js`
- **Copied to:** `games/q3-blocks-mini-live-v13/input.js`
- **Call site:** `game.js` line 10 — `FoundryInput.install(C, { actions: { left: ['ArrowLeft','KeyA'], right: ['ArrowRight','KeyD'] }})`
- **Usage in update:** `FoundryInput.held('left')` and `FoundryInput.held('right')` for lateral movement; `FoundryInput.pointer.down` and `FoundryInput.pointer.x` for pointer follow; `FoundryInput.update(dt)` at end of each tick.
- **Changes:** none — used as-is.

## webaudio-kit.js

- **Source:** `.factoryx/foundry/sound/webaudio-kit.js`
- **Copied to:** `games/q3-blocks-mini-live-v13/webaudio-kit.js`
- **Call sites in game.js:**
  - Line 8: `FoundryAudio.install()` — arms the gesture listener at boot
  - Line 15: `FoundryAudio.droneStart(52)` — starts low ambient drone on first gesture
  - Line 15: `FoundryAudio.click()` — click sound on first gesture
  - Line 47: `FoundryAudio.pickup()` — triggered every 3rd lantern collected (not every spawn, avoiding v12 timeout issue)
  - Line 55: `FoundryAudio.droneStop()` — stops drone on collision/fail
  - Line 55: `FoundryAudio.fail()` — fail sound on collision
- **Changes:** none — used as-is.

## Audio discipline

No `FoundryAudio.whoosh()` calls on spawn. Audio is limited to:
1. First gesture (click + drone start)
2. Every 3rd pickup (pickup sound)
3. Collision/fail (drone stop + fail tone)

This avoids the v12 timeout suspicion from over-firing audio on every spawn.
