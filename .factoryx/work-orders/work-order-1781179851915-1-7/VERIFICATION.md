# Verification — Koi Breath

## Static Checks
- [x] File exists at `games/trial-e3-p4-koi-breath/index.html`
- [x] HTML structure valid (DOCTYPE, html, head, body, canvas, script all present)
- [x] JS brace balance: 75/75
- [x] JS paren balance: 331/331
- [x] File size: ~16 KB (well under 2 MB limit)
- [x] No external network dependencies (no external CSS/JS/image/audio)
- [x] Single self-contained file

## Game Feel Checklist
- [x] Core verb demonstrated in first 30 seconds (hint text guides user)
- [x] Input response < 100ms (immediate visual feedback on press)
- [x] Easing on all motion (easeOutCubic for bloom growth, easeInOutCubic for fade)
- [x] Touch targets ≥ 44px — entire canvas is the touch target
- [x] Keyboard and pointer inputs both work (mouse + touch events)
- [x] Audio only after user gesture — no audio at all
- [x] Total payload < 2 MB — ~16 KB
- [x] No external network dependencies

## Notes
- The piece is a meditative interactive art piece, not a scored game
- Frantic tapping intentionally does nothing (threshold: 300ms hold)
- Bloom complexity scales with hold duration: size, color count, tendril count
- Koi fish react to ink blooms by gently moving away
- Ink fades over 6-16 seconds depending on hold duration
