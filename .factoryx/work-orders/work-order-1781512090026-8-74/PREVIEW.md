# Preview — Lantern Surf Courier

**Work Order:** work-order-1781512090026-8-74  
**Entrypoint (canonical):** `games/93-lantern-surf-courier/index.html`

## How to open
- Direct file: open `games/93-lantern-surf-courier/index.html` in any modern browser (Chrome, Firefox, Safari, Edge). It is fully self-contained.
- FactoryX preview tree: served under the Work Order preview base (e.g. `https://www.ystackai.com/factoryx/edo-woodblock/previews/<...>/games/93-lantern-surf-courier/`) — the preview system should point at the game root directly.
- Relative links preferred for copyable trees: `games/93-lantern-surf-courier/`

## What you should see immediately (quality bar)
- Warm paper background (off-white with subtle fiber grain), not blank navy or black.
- Large courier/surfer character (clear silhouette, satchel, hat/robe lines) visible on the left side within 1 second, either in ready/idle or already in motion.
- Layered wave geometry scrolling or ready to scroll (strong crests, troughs).
- No tiny sprites or placeholder boxes.
- On first gesture (tap/click/space): run starts or accelerates, gates and letters begin appearing ahead.
- Clear score / letters / combo UI.
- Restart visible/usable after crash or via button.
- Responsive: scales cleanly from ~360px wide phones to desktop; touch targets comfortable.

## Controls (no explanation needed after 5s of looking)
- Space / tap anywhere on play area / click: jump to thread gates and clear crests.
- R or on-screen RESTART: restart the run (keeps session high score).
- Sound icon (top right): toggle sparse audio cues (off by default; first interaction required to unlock WebAudio).

## Known current state (update on each push)
- (initial) Slice in progress. First pass will include: paper + grain, large courier, 3+ parallax wave layers, jump physics with land-on-wave, lantern gates (thread for score), sealed letters (collect), crest hazards (crash), basic score/combo/distance, restart, kbd+pointer+touch, audio stub, speed ramp stub.
- Evidence artifacts (screenshots, console) will be captured in VERIFICATION.md and attached to PR.

## Do not
- Do not rely on the studio root `index.html` or `games/index.html` (drops redirect) as the review entrypoint for this Work Order.
- Do not append review instructions or links after the `</html>` or mutate other pages unless this WO explicitly scopes homepage work.

## Post-polish notes
- Add mobile-specific layout tweaks if needed.
- Ensure first frame after load already "makes sense" (character + waves + title + start affordance).
- Any verification harness output (pageerror, runtime state) belongs in VERIFICATION.md + PR description.
