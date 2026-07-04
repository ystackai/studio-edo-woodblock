# Preview — q3-blocks-mini-live-v8

## Preview entrypoint
`games/q3-blocks-mini-live-v8/index.html`

## What you'll see
- Dark multi-color background bands (purple/teal/green)
- Faint horizontal guide lines
- Orange player paddle at the bottom
- 6 colored falling blocks (pink, yellow, green, blue, orange) already descending
- "SCORE: 0" and "misses: 0 / 8" text

## Controls
- ArrowLeft/ArrowRight or A/D to move the paddle
- Catch falling blocks to score points
- 8 misses = game over; press A/D to restart

## Audio
- Sound starts on first interaction (keydown or pointerdown)
- Catch: `FoundryAudio.pickup()` (rising chime)
- Miss: `FoundryAudio.fail()` (descending tones)
- Game over: `FoundryAudio.fail()` + `FoundryAudio.droneStart(44)` (ambient pad)
