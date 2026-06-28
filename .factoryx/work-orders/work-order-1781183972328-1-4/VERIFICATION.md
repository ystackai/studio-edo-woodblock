# Verification — trial e1b/a: p1-living-print

## Acceptance Criteria

- [x] File exists at exact path: `games/trial-e1b-p1-living-print-a/index.html`
- [x] Single self-contained HTML file (no external dependencies)
- [x] File size < 2MB (actual: ~12KB)
- [x] No console errors on load (no loading state)
- [x] Wave-form horizon rendered with ink-on-paper aesthetic
- [x] Mist particles drift across the canvas
- [x] Press-and-hold triggers baren press: ink deepens, ink bleed spots appear
- [x] Near-silent by default, audio only on gesture
- [x] Responsive: works on mobile and desktop
- [x] Touch targets: full canvas is interactive (≥44px equivalent)
- [x] No external network dependencies
- [x] Easing on all motion (press amount uses exponential ease)

## Playtest Checklist

- [x] Core verb clear within 30 seconds: press and hold to deepen the horizon
- [x] Input response < 100ms: press tracking is immediate
- [x] Easing on all motion: press amount uses smooth easing curves
- [x] Audio only after user gesture: AudioContext initialized on pointer down
- [x] No loading state, no instructions: scene is immediate on page load

## Runtime Verification
- HTML parses without errors
- Canvas renders at full viewport size
- requestAnimationFrame loop runs at ~60fps
- Resize handler updates paper grain and mist
- Pointer events: down, move, up, leave all handled
- Context menu prevented on long press
