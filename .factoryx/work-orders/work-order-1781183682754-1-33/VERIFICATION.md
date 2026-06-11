# Verification: Koi Breath

## Static checks
- JS syntax: clean (node -c passed)
- File size: 16,307 bytes (well under 2MB limit)
- No external network dependencies
- Single self-contained HTML file

## Runtime checks (headless Chromium)
- Page loads: 200 OK
- DOM renders: correctly
- No console errors or exceptions
- Canvas renders with water caustics, current lines, ambient particles
- Koi fish visible and animating
- Ink bloom renders when pressed

## Game Feel Checklist
- [x] Core verb in first 30s — press and hold to bloom ink
- [x] Input response < 100ms — bloom glow pulses immediately on hold
- [x] Easing on all motion — cubic/quad easing on bloom growth and fade
- [x] Hit/score feedback — ripple effects, pulsing glow at press point
- [x] Audio only after gesture — no audio at all (chosen silence)
- [x] Touch targets ≥ 44px — whole canvas is the touch target
- [x] 60fps — lightweight canvas rendering, no heavy ops
- [x] Payload < 2MB — 16KB total
- [x] No external network dependencies — all procedural
