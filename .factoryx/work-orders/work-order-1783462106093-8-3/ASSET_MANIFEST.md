# Asset Manifest — Drifting River Prints

## Generated Assets
This launch opted out of Asset Foundry-generated assets (`generated_assets_required: false`).

## Audio (WebAudio API, in-code synthesis)
| Asset | Method | Integration |
|---|---|---|
| Paper rustle | Filtered noise burst (bandpass 2800Hz, highpass 800Hz, 0.25s decay) | Played on element pickup |
| Wooden clack | Sine oscillator 85Hz + triangle 420Hz transient | Played on element snap/lock |
| Temple bell | 5-harmonic sine stack (136-680Hz, 1-4s decay) | Played on print completion |
| Water ambience | Looping lowpass noise (400Hz cutoff, 4s buffer) | Plays during play scene |

## Visuals (Canvas-drawn, ukiyo-e woodblock style)
| Asset | Method | Integration |
|---|---|---|
| Washi paper background | Procedural texture with noise + fiber lines | Main canvas background |
| Scroll border | Double-line rectangle (30px margin) | Frames the composition area |
| Koi (large) | Canvas ellipses, curves, eye, fins | Draggable play element |
| Koi (small) | Same style, smaller scale | Draggable play element |
| Waterweed A | Curved stems with leaves | Draggable play element |
| Waterweed B | Same style, different color | Draggable play element |
| Wave crest | Bezier wave shape with foam dots | Draggable play element |
| Target ghosts | Dashed ellipse outlines | Shows where each piece belongs |
| Snap particles | Pooled canvas bursts (FoundryParticles) | 16 particles on successful lock |
| Woodblock grain | Random line overlay | Applied on locked elements and background |
| Flow lines | Sine-modulated curved strokes | Animated water current |

## Foundry Blocks Used
| Module | Source | Notes |
|---|---|---|
| game-loop.js | `.factoryx/foundry/blocks-2d/game-loop.js` | Reused as-is |
| scenes.js | `.factoryx/foundry/blocks-2d/scenes.js` | Reused as-is |
| input.js | `.factoryx/foundry/blocks-2d/input.js` | Reused as-is |
| tween.js | `.factoryx/foundry/blocks-2d/tween.js` | Reused as-is |
| particles.js | `.factoryx/foundry/blocks-2d/particles.js` | Reused as-is |
| rng.js | `.factoryx/foundry/blocks-2d/rng.js` | Reused as-is |

## Payload
- Single HTML file: ~18KB
- 6 JS module files: ~7KB total
- No external dependencies, no network requests
- Total: ~25KB self-contained

## Verification
- Chromium headless: screenshot 25KB, no JS errors
- Game renders correctly on title screen
- All assets self-contained and loadable offline
