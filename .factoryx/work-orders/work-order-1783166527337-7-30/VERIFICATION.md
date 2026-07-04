# Verification — Q3 blocks mini-live v12

## Syntax checks
- `node --check game-loop.js` ✅
- `node --check input.js` ✅
- `node --check webaudio-kit.js` ✅
- `node --check game.js` ✅ (121 lines, under 175 limit)

## Phase machine
- waiting: renders non-uniform title screen (water gradient, wave lines, bobbing boat, title text)
- playing: triggered by first pointer/key gesture in same frame; audio starts simultaneously
- hit: triggered by debris collision; screen shake + flash + fail SFX
- debrief: classification based on score; tap to restart

## Foundry modules
- game-loop.js: copied verbatim, used for 60fps fixed-timestep loop
- input.js: copied verbatim, keyboard + pointer with 120ms press buffer
- webaudio-kit.js: copied verbatim, droneStart/click/whoosh/pickup/fail/droneStop

## Audio on first gesture
- FoundryAudio.install() arms gesture listeners at boot
- First pointerdown/keydown: AudioContext created, droneStart(55), click() — all same frame
- No autoplay; audio only after user gesture

## Generated assets
- Opted out of Asset Foundry; all visuals procedural, audio from WebAudio oscillators per foundry kit

## Smoke test evidence
- Pre-play screenshot: chromium headless captured `games/q3-blocks-mini-live-v12/screenshot.png` (23K)
  - Shows: dark water gradient, wave lines, bobbing boat, "Midnight Canal" title, instructions
  - Canvas is nonblank and non-uniform ✅
- Active-play render: verified with forced-play HTML — boat, debris (logs/crates), HUD visible ✅
  - Player subject (boat at bottom) visually separated from hazards (debris floating above) ✅
  - HUD readable: "0 dodged" and "0.0s" visible ✅
- No console errors, no missing assets, no blank canvas ✅

## Preview
- Preview entrypoint: `games/q3-blocks-mini-live-v12/index.html`
- .factoryx/preview-entrypoint updated
- PR #194: https://github.com/ystackai/studio-edo-woodblock/pull/194
