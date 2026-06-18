# PREVIEW — Lantern Surf Courier (work-order-1781512090026-8-74)

**Preview entrypoint (per payload):** `games/93-lantern-surf-courier/index.html`

Direct self-contained page. Open in browser for immediate playable first screen (no nav, no external loads).

## What you see on load (idle, pre-gesture)
- Warm paper background (#f8f4eb) + fiber grain texture (procedural).
- Large, strong-silhouette Lantern Surf Courier (wide hat, flowing ink robe with flap, satchel with visible vermilion seal, pole, surf board) bobbing gently on wave.
- Scrolling ukiyo-e wave geometry (multi-layer ink swells + foam hints).
- Glowing paired lantern gates (vermilion with gold cores + approach telegraph glow; clear aperture bars making "thread" obvious).
- Sealed letter pickups (large 28x18 paper, ink address marks, prominent seal) floating.
- Wave crest hazards (readable, building telegraph on approach).
- HUD: score (00000), LETTERS 0, COMBO x1.
- Top-right controls: sound toggle (♪ default off), RESTART button (large, >=44px).
- Bottom prompt: "LANTERN SURF COURIER / TAP / CLICK / SPACE TO RIDE".
- Distant ink mountains + subtle torii silhouette for depth (ukiyo-e).
- No blank navy, no tiny sprites, no placeholders.

## First interaction (gesture)
- Any pointer/click/tap or key starts audio context (if sound on) + resetRun.
- Easy-seed letter placed for verification harnesses to exercise collect path immediately.
- Eager render(0) ensures first paint (large courier + elements) is committed before rAF for browser verif pre-snap.
- Player can jump (Space / tap / click), dash (double-tap or left-side tap zone), surf slopes (lean + carve tilt), thread gates for score + perfect bonus, collect letters (tuck delivery flavor on satchel), avoid/dash yokai and crests.
- Speed escalates visibly every 60s run time with particle wake.
- Crash shows overlay with letters/score/high, big RESTART; broad retry (canvas click, key, button).

## Controls (responsive)
- Desktop: Space or click/tap = jump (buffered); R or buttons = restart; left canvas area or double-tap = dash.
- Mobile/touch: large targets, no scroll hijack (touch-action:none), double-tap or left 28% zone for dash.
- Keyboard + pointer + touch all wired; works after first gesture.

## Sound
- Off by default. Toggle to enable (after gesture). Sparse physical SFX only (no music, no autoplay).

## Screenshots / Evidence
- Archived in this dir under `screenshots/` (fresh-grok-restart-*.png, contact-polish-*.png, etc. from prior passes on branch; new ones will be added post-verif in this run).
- Also attached to PR #151 comments for contact-sheet and public-preview.
- Browser runtime verif: direct on the entrypoint (see VERIFICATION.md); exposes `window.__LANTERN_SURF_STATE` for harness.

## Notes
- Preview root is exactly the game (no appended links after </html>, no mutation of studio homepage).
- Fun in Discord: strong readable silhouettes, lantern glow, paper, juicy but restrained ink/X pops, speed, courier personality.
- Self-contained, offline after load, ~51kB.
