# Verification: lantern rain

## Static checks
- [x] Single self-contained HTML file at `games/trial-e1b-p3-lantern-rain-a/index.html`
- [x] No external network dependencies (no CDN, no external assets)
- [x] File size: ~20KB (well under 2MB limit)
- [x] JavaScript syntax validated (no parse errors)
- [x] HTML structure complete (DOCTYPE, canvas, script, closing tags)

## Runtime checks
- [x] Canvas renders correctly on load
- [x] Rain particle system runs (350 drops)
- [x] Lantern glow renders with radial gradients
- [x] Lantern sway animation (gentle pendulum motion)
- [x] Grain overlay renders (perlin noise texture)
- [x] Vignette overlay applied
- [x] Motes/embers float from lantern

## Interaction checks
- [x] Tap/click starts the experience (overlay fades)
- [x] Hold/touch shields the lantern (shield overlay appears, rain dimming)
- [x] Release triggers patience meter → flame steadiness reward
- [x] Flame steadiness decays slowly over time (encourages repeated play)
- [x] Rain hitting lantern dims flame slightly (feedback)
- [x] Rain sound is user-initiated (AudioContext starts on first tap)
- [x] Rain volume adjusts based on shield state

## Game Feel Checklist
- [x] Core verb demonstrated immediately: tap to shield, release, watch flame return
- [x] Input response < 100ms: pointer events with immediate visual feedback
- [x] Easing on all motion: shield intensity, flame steadiness, lantern sway all use lerp/easing
- [x] Rain splash particles at lantern hit points
- [x] Audio only after user gesture: rain ambience starts on first tap
- [x] Touch targets: full-screen canvas with pointer events
- [x] Responsive: canvas resizes to window, lantern radius scales to viewport
- [x] No score, no mechanics beyond shield + patience
- [x] No constant audio — rain volume adapts to shielding state
