# Verification: Living Print

## Artifact
- **File:** `games/living-print/index.html` (~12 KB)
- **Self-contained:** No external assets, no network calls. Works offline.

## Verification checks
1. **No JS errors on load** — open in browser, check console for `pageerror` or `console.error`. Expected: none.
2. **First screen is complete** — paper grain + mist + subtle horizon line appear immediately. No loading spinner, no "start" button.
3. **Press and hold works** — mouse down or touch down anywhere; ink deepens after ~350ms resistance delay. Release; ink fades.
4. **Keyboard works** — Space or Enter deepens; release fades.
5. **Mist drifts continuously** — visible even without interaction.
6. **Audio only after gesture** — no autoplay. First press initializes AudioContext.
7. **60fps on mid laptop** — single canvas, no heavy computation. 32 mist particles, simple wave math.
8. **Payload < 2 MB** — file is ~12 KB.
9. **Touch targets** — entire viewport is the interaction area (≥ 44px by definition).

## How to test
```bash
# Serve locally and open in browser
cd games/living-print
python3 -m http.server 8080
# Open http://localhost:8080
```
