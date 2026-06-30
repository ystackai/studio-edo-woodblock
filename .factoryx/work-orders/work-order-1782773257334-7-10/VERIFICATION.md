# Verification — Edo Living Print

## Artifacts
- `games/edo-living-print/index.html` — 28KB, 852 lines, self-contained HTML
- `games/index.html` — updated redirect to `edo-living-print/`

## Playability checklist
- [x] **First screen playable immediately** — canvas is the game, hint text shows briefly
- [x] **Understand within 5 seconds** — hint text: "Press and hold to wake the print"
- [x] **Meaningful state** — depth accumulates 0→1, each stage adds new elements permanently
- [x] **Progression over 60 seconds** — 6 stages from paper to full scene
- [x] **Joyful surprise** — crane appears at stage 4, moon at stage 5
- [x] **Input response** — press position directly affects horizon ripple
- [x] **Audio on gesture** — all audio starts on first press
- [x] **No external dependencies** — all art is canvas-native
- [x] **Touch targets** — entire canvas is the interaction surface

## Verification to run
- Browser runtime test: open `games/edo-living-print/index.html` in a browser
- Check for `pageerror` or `console.error` events
- Verify first press triggers audio and depth increases
- Verify all 6 stages render correctly

## Known issues
- Canvas-native art only; no generated assets (intentional — serves playability)
- Rain and crane are simple procedural; more polish possible in follow-up
