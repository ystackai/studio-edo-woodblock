# Verification — Koi Breath (p4-koi-breath)

## Runtime verification (browser, headless Chromium)

| Check | Result |
|---|---|
| Page loads without errors | ✓ PASS |
| Canvas renders (1280×720) | ✓ PASS |
| Patient press (1.5s hold) creates bloom | ✓ PASS (0→1 bloom) |
| Multiple patient presses accumulate blooms | ✓ PASS (1→2 blooms) |
| Frantic tapping (4 rapid taps) rejected | ✓ PASS (still 2 blooms) |
| No console/page errors | ✓ PASS |

## Static checks

| Check | Result |
|---|---|
| File at `games/trial-p4-koi-breath-a/index.html` | ✓ PASS |
| File size ~20 KB (well under 2 MB) | ✓ PASS |
| No external network dependencies | ✓ PASS |
| Single self-contained HTML file | ✓ PASS |

## Game Feel Checklist

- [x] Core verb in first 30s — "press and hold gently" hint, bloom on patient hold
- [x] Input response <100ms — gathering ring appears immediately on press
- [x] Easing on all motion — cubic/sine/quad easing throughout
- [x] Hit feedback — bloom rings + tendrils + ripples on release
- [x] Audio only after gesture — no audio (appropriate for the piece)
- [x] Touch + pointer — both supported
- [x] 60fps target — lightweight canvas draw
- [x] Payload <2MB — 20KB single file
- [x] No external deps — fully self-contained
