# Verification — Mist Horizon

## Manual checklist

- [ ] Opens cleanly in browser with no console errors
- [ ] Wave-form horizon visible on first frame (no loading state)
- [ ] Mist layers drift horizontally, slow and continuous
- [ ] Press-and-hold deepens ink at touch point
- [ ] Ink bloom expands outward with concentric rings
- [ ] Quick taps produce no visual change
- [ ] Audio only plays during press-and-hold (dry baren drag)
- [ ] No UI chrome, buttons, or instructions visible
- [ ] Works on mobile (touch) and desktop (pointer)

## Automated checks to run

- Open `drops/mist-horizon/index.html` in headless Chrome
- Assert: no `pageerror` events
- Assert: canvas element has non-zero width/height after 2s
- Assert: `console.error` count is 0 after 5s idle
- Verify file size < 200KB (single HTML file)
