# Asset Manifest

## Audio Assets (Foundry-generated)

| Asset | Source | Foundry Job ID | File Path | Integration |
|---|---|---|---|---|
| Ambient loop | `cozy_audio_pack` recipe | `asset-1785157749439-88ac876b` | `assets/audio/ambient_loop.wav` (5.3 MB) | Blended with oscillator drone in `initAudio()` at 95% playback rate for atmosphere |
| Soft impact | `cozy_audio_pack` recipe | `asset-1785157749439-88ac876b` | `assets/audio/soft_impact.wav` (73 KB) | Used for baren press friction sound in `playBarenFriction()` |
| Seal confirm | `cozy_audio_pack` recipe | `asset-1785157749439-88ac876b` | `assets/audio/seal_confirm.wav` (83 KB) | Used for print-complete seal thud in `playSealThud()` |

## Procedural Assets (In-game)

| Asset | Source | Integration |
|---|---|---|
| Paper texture | Procedural washi grain (Canvas 2D noise + fiber lines) | `paperC` canvas, applied via `PaperBlock` |
| Scene background | Procedural Fuji + mountains + lake + pine (Canvas 2D) | `sceneC` canvas, applied via `SceneBlock` |
| Mist layers | 12 animated mist blocks with parallax | `MistBlock` instances, animated each frame |
| Japanese clouds | 6 drifting cloud blocks | `JapaneseCloudBlock` instances |
| Ink marks | Radial gradient blooms with capillary edges | `blooms` array, animated fade-out |
| Brush strokes | Multi-pass stroke with bleed + edge darkening | `inkMarks` array, permanent |
| Breath vapor | Animated wispy vapor curves on hold | `drawBreathVapor()` in render loop |
| Fiber lift | Subtle paper fiber displacement lines | `drawLiftedFibers()` during baren press |

## Enhancements This Work Order

| Change | Description |
|---|---|
| Baren press visual | Deep ink core + 3 spread rings + vermilion glow + fiber displacement + breath vapor |
| Brush cursor | SVG circular cursor simulating brush tip on paper |
| Paper texture | Enhanced with cross-hatch fiber pattern, darker fiber highlights |
| Deckle edge | Animated breathing pulse effect |
| Ink bloom | 3-layer radial gradient + organic capillary edge |
| Pointer resistance | Speed-dependent drag, brush bristle dots on stroke |
| Seal stamp | Irregular hanko edges + ink bleed blur effect |
| Audio | Foundry audio blended with oscillator foundation |
| Atmosphere | Deeper vignette, breathing title, enhanced CSS transitions |

## Browser Verification

- Canvas renders correctly at all viewport sizes
- All audio assets load without 404 errors
- Pointer events work on mouse and touch
- Baren press hold shows expanding ink ring with fiber displacement
- Seal stamp appears with irregular edges on finish
- No JavaScript errors in console
- Paper texture visible on initial load
