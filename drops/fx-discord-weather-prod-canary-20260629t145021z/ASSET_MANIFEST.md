# Asset Manifest — Discord Control-Surface Edo Weather Print Canary

## Overview
A self-contained 2D browser experience: a living ukiyo-e weather print where the player changes weather and the interaction visibly affects the background art.

**Drop path:** `drops/fx-discord-weather-prod-canary-20260629t145021z/`
**Entrypoint:** `index.html` (single file, no build step)
**Size:** ~21 KB total (self-contained HTML with embedded CSS/JS)

## Generated Assets

| File | Size | Description |
|------|------|-------------|
| `index.html` | ~21 KB | Complete single-file experience with embedded canvas rendering, CSS styling, and game logic |
| `ASSET_MANIFEST.md` | — | This file |

## Screenshots (browser verification)

| Screenshot | Weather State | Notes |
|------------|---------------|-------|
| `screenshots/s1_initial_clear.png` | Clear | Mountain, clouds, boats, trees — 0 particles |
| `screenshots/s2_rain.png` | Rain | Dark sky, diagonal rain particles, ripples on water |
| `screenshots/s3_snow.png` | Snow | Soft palette, falling snow particles, muted colors |
| `screenshots/s4_wind.png` | Wind | Streaking cloud particles, swaying trees |
| `screenshots/s5_storm.png` | Storm | Dark scene, lightning flash, heavy rain, choppy water |
| `screenshots/s6_timer_running.png` | Storm | Timer bar progressing, ~13s into cycle |

## Browser Runtime Verification

- **Method:** Headless Chromium via Playwright
- **Runtime errors:** 0
- **Weather states verified:** 5 of 5 (clear → rain → snow → wind → storm)
- **FPS range:** 62–185 (target 60fps met)
- **Particle system:** Active across all non-clear weather states (277–304 particles)
- **Timer:** 30-second cycle running, auto-cycles weather on completion

## Behavior

- **Pointer input:** Click left third → previous weather, right third → next weather, center → next weather; click weather buttons at bottom
- **Keyboard input:** Keys `1`–`5` select weather directly; `Space` cycles forward; `ArrowLeft`/`ArrowRight` navigate
- **30-second timer:** Visible progress bar at top; auto-cycles to next weather when cycle completes
- **Weather transitions:** Smooth alpha-blended fade between states (~40 frames)
- **Weather effects:** Each weather state changes sky color, mountain shading, cloud density, water appearance, and particle system
- **Auto-cycle:** After 30 seconds, the weather advances automatically

## No External Dependencies

All rendering is done in a single `index.html` file with:
- Canvas 2D API for scene rendering
- Embedded CSS for the woodblock print frame
- Embedded JS for game loop, particles, and input handling
- No network requests, no external libraries, no build step

## Known Defects

1. **Transition state shows "rain" briefly in state reporter** — the `__edoWeatherState()` hook reads `currentWeather` which lags during transitions; the visual cross-fade is correct but the reported enum may briefly show the outgoing state. Not user-visible.
2. **FPS dips to ~62–70 during storm** — the heavy particle count (300+) and lightning flash overlay add render cost; acceptable for a mid-range laptop but may dip below 60fps on lower-end hardware.
3. **Second boat is small and easy to miss** — the secondary boat at 60% scale is subtle; considered artistic choice rather than a defect.
