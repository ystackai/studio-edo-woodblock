# Verification — trial e3/35b · p3-lantern-rain

## Preview
- URL: `games/trial-e3-p3-lantern-rain/index.html`
- PR: #135 (draft)

## Static checks
- File size: 23 KB (well under 2 MB limit)
- HTML structure: valid DOCTYPE, balanced tags
- JS syntax: valid (verified with `node -c`)
- No external network dependencies — all assets self-contained

## Runtime error fix
- **Fixed**: `Uncaught TypeError: Cannot read properties of undefined (reading 'radius')` at line 388
  - Root cause: `lantern` object was declared after rain/water-drop IIFEs that referenced `lantern.radius`
  - Fix: Moved `var lantern = { ... }` declaration before the rain/water-drop initialization loops

## Browser runtime checks (manual)
- [ ] Opens without console errors
- [ ] Rain streaks render and animate
- [ ] Lantern glows with warm light
- [ ] Mouse/touch interaction shelters the flame
- [ ] Flame steadies when input is held near lantern
- [ ] Patience mechanic activates after ~3 seconds
- [ ] Audio toggle button works (rain sound on/off)
- [ ] Responsive on different screen sizes
- [ ] No frame drops on mid-range laptop
