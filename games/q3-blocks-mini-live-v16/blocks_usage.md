# Blocks Usage — Q3 v16 Crane Bell Relay

## Modules Copied (as-is, no adaptation)

| Module | Source | Target | Changes |
|---|---|---|---|
| `game-loop.js` | `.factoryx/foundry/blocks-2d/game-loop.js` | `games/q3-blocks-mini-live-v16/game-loop.js` | none — copied verbatim |
| `input.js` | `.factoryx/foundry/blocks-2d/input.js` | `games/q3-blocks-mini-live-v16/input.js` | none — copied verbatim |
| `webaudio-kit.js` | `.factoryx/foundry/sound/webaudio-kit.js` | `games/q3-blocks-mini-live-v16/webaudio-kit.js` | none — copied verbatim |

## Call Sites in `game.js`

### FoundryLoop (game-loop.js)
- **Line ~164**: `FoundryLoop.start({update:update, render:render})` — bootstraps the fixed-timestep loop.

### FoundryInput (input.js)
- **Line ~12**: `FoundryInput.install(C, {actions:{left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD']}})` — installs keyboard + canvas pointer bindings.
- **Line ~30**: `if(FoundryInput.held('left')) px-=320*dt` — paddle left in update().
- **Line ~31**: `if(FoundryInput.held('right')) px+=320*dt` — paddle right in update().
- **Line ~56**: `FoundryInput.update(dt)` — ages press buffers at end of update().

### FoundryAudio (webaudio-kit.js)
- **Line ~10**: `FoundryAudio.install()` — called once at boot; arms one-time gesture listener to unlock AudioContext.
- **Line ~19 (first gesture)**: `FoundryAudio.click()` — triangle blip on first interaction.
- **Line ~19 (first gesture)**: `FoundryAudio.droneStart(48)` — low pad at 48 Hz starts on first interaction.
- **Line ~43 (bell catch)**: `FoundryAudio.pickup()` — ascending tone on bell collection.
- **Line ~51 (stone hit)**: `FoundryAudio.fail()` — descending tones on stone collision.
- **Line ~52 (debrief)**: `FoundryAudio.droneStop()` — fades drone when lives hit 0.

## PROBE-FIRST Input Contract

Two direct `window`-level listeners in **capture phase** (`{capture:true}`), separate from `FoundryInput.install()`:

1. **`pointerdown` capture listener** (line ~16): fires `go()` on first click/tap anywhere.
2. **`keydown` capture listener** (line ~18-20): fires `go()` on first press of Space, Enter, ArrowLeft, ArrowRight, KeyA, or KeyD.

The `go()` function synchronously sets:
- `phase='playing'` (phase machine transition: waiting → playing)
- `pulse=1` (paddle glow)
- `flashT=1.5` (vermilion flash lasts 1.5 seconds, well above the 0.7s minimum)
- `px=100` (paddle snaps from center 240 to 100 — shift of 140px, well above 80px minimum)
- `FoundryAudio.click()` and `FoundryAudio.droneStart(48)` for audio proof

No early return guards the first-interaction logic; the phase machine handles all states.
