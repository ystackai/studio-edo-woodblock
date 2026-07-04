# Verification — Q3 Blocks Mini Live v9

## Syntax checks
- `node --check game-loop.js` — OK
- `node --check input.js` — OK
- `node --check webaudio-kit.js` — OK
- `node --check game.js` — OK

## Browser smoke test
- Served via Python HTTP server on port 8787
- Chromium headless loaded index.html + all 4 script files (HTTP 200)
- Screenshot captured: non-blank title screen with "Sake Cup Catch" overlay
- No runtime JS errors observed in browser output (only D-Bus warnings, unrelated)

## Blocks proof
- game-loop.js: copied verbatim from `.factoryx/foundry/blocks-2d/game-loop.js`, called via `FoundryLoop.start({update, render})`
- input.js: copied verbatim from `.factoryx/foundry/blocks-2d/input.js`, called via `FoundryInput.install()`, `FoundryInput.held()`, `FoundryInput.update()`
- webaudio-kit.js: copied verbatim from `.factoryx/foundry/sound/webaudio-kit.js`, called via `FoundryAudio.install()`, `.pickup()`, `.fail()`, `.click()`
- blocks_usage.md documents all copies and runtime calls

## Generated assets
- Opt-out: no Asset Foundry jobs created, no generated assets used. Game uses only procedural canvas drawing.

## game.js line count
- 115 lines (under 180 limit)

## Non-uniform first paint
- Background: 18 randomized brush-stroke ellipses in warm tones over #f5e6d0 paper
- Wood counter at bottom with 10 grain streak lines
- Clearly non-uniform; visible in screenshot

## Preview entrypoint
- `.factoryx/preview-entrypoint` contains: `games/q3-blocks-mini-live-v9/index.html`
