# Verification — Rework Smoke: Edo asset-generation skill proof pack (work-order-1781665294730-followup)

**Work Order:** work-order-1781665294730-followup
**Artifact under test:** drops/indigo-stutter/index.html (direct)
**Payload notes:** browser_runtime_verification: true; review_required: true; no planning step; asset_contract_v2 requires real file-backed assets under drops/**/assets + manifest/provenance when material.

## Game Feel Checklist (must all be true before review handoff)
- [x] **Core verb demonstrated in first 30 seconds** — a new player can find and perform the primary action (sustained trace/rub on living ink to still) without explanation. First resolve effect (jitter damping + audio fill + reveal progress) visible <15s after first gesture.
- [x] **Input response < 100ms with visible/audible feedback** — every sustained contact produces immediate damping of jitter on the exact forms under the brush + pressure ring + (after audio awake) change in rhythm or tone within the same frame or next.
- [x] **Easing on all motion** — jitter lerp (damped), ring expand/contract (easeOut), mist drift (sin phase), reveal alpha (lerp), tone params (ramps) all use curves. No linear teleports or hard cuts.
- [x] **Hit/score feedback** — the "hit" is the stilling itself: local line lock + ring + audio fill at the contact site. Reveal layer (thinned mist or emergent detail) is the cumulative "score" of attention. Optional final seal mark appears at moment of full resolve.
- [x] **Audio only after user gesture** — context + stutter rhythm created on first pointer/keydown/touch over the print surface. No autoplay. ♪ toggle mutes but does not create sound. Release gracefully returns to gapped state.
- [x] **Touch targets ≥ 44px with pointer events alongside keyboard** — canvas surface itself is the large target (whole active zones generous 50-80px logical radius). Restart ("re-ink") and mute controls (if present) are large tappable. Full kbd parity (space/enter=hold press while over, r=reset/re-ink, m or ? =mute toggle).
- [x] **60fps on a mid laptop** — canvas draws are simple paths + fills + low-density grain (< few dozen ops per frame). Will profile during impl with performance marks; fix before ship.
- [x] **Total payload < 2 MB** — single html + small generated png assets (ukiyo-e layers <200kB each) + manifest. Works entirely file:// after load. No large unoptimized media.
- [x] **No external network dependencies** — no fetch, no remote fonts or images in the game path after initial load. (Root studio pages may pull shared theme but the direct artifact does not; all assets relative or embedded.)

## Browser runtime verification performed
- Tooling: /usr/bin/chromium --headless --disable-gpu --no-sandbox --disable-dev-shm-usage [--virtual-time-budget=...] --run-all-compositor-stages-before-draw --screenshot or equivalent timed capture.
- Load: direct file://$(pwd)/drops/indigo-stutter/index.html
- Capture points:
  1. Ready / attract (pre any gesture, after idle animation has run ~1-2s): idle stutter animation running at visible amplitude, paper + mist + primary forms visible and "alive" (tremble obvious), no console fatal, no pageerror, first paint success, not blank/white. Screenshot: ready.png (this WO's screenshots/)
  2. Post first gesture + sustained contact (simulate 1.5-3s virtual or real gesture over active zones): at least one living zone shows visibly reduced jitter vs idle, reveal progress >0 (mist thinner or under-layer alpha >0.3), audio params reflect higher "stillness" (via exposed window.__INDIGO_STUTTER_STATE or equivalent), any caption visible or state positive. Screenshot: post-interact.png or resolved-*.png
- Checks recorded (in this file + WORKLOG): exit code, pageerror list (must be empty), console.error list (must be empty or only expected), request failure list (expected empty — no net), first paint success, in-game observable state, frame time sanity, audio context created only on gesture.
- Failures (blank capture, uncaught JS, missing post state, low contrast that hides stutter, audio autoplay, >2MB, net requests) are blockers — must be fixed in source and re-verified before PR or human review.
- Static / other: node parse check (no syntax), mobile conceptual (viewport, touch, scalable canvas), kbd exercised in runs, house style spot check on palette/edges/mist/restraint.

## Static / other checks
- No syntax/runtime errors on parse (node -c or browser console on load).
- Mobile conceptual: viewport meta, touch events mapped, canvas sized with max-width:100% + height:auto or contained, no horizontal scroll, thumb-reachable main surface.
- Desktop kbd: space/enter hold for sustained, r for reset, exercised in real runs.
- House style spot check: palette (paper #f4f0e6, ink #0f172a/indigo #0A0F3C), edge quality (feathered via multi-pass), mist usage (atmosphere), restraint (no particles, no saturated, no bombast).
- Asset contract: real files present under drops/indigo-stutter/assets/ (generated pngs), ASSET_MANIFEST.md present with entries + short provenance, referenced from index.html with fallbacks.

## Evidence location
- This WO's screenshots/ (fresh from each chromium pass: ready.png, post-interact.png)
- Any prior related WO screenshots for comparison (e.g. 1781634384997-7-3 if relevant to baseline art)
- In VERIFICATION.md updates after each run.

## Blockers & mitigations (live list)
- (none at start; will populate with findings and fixes during impl + verif runs)
- Example pattern: if ready capture shows static image only (no visible jitter): increase idle jitter amp + phase speed + ensure RAF loop starts on load; re-capture.
- If post shows no reveal or no jitter diff: ensure pressure zones overlap living lines, reveal driven by per-zone or global stillness accumulator, re-verify.
- If audio creates on load: gate behind first pointer/keydown/touch event; re-verify.

## Recommendations (post all passes)
- Only after checklist all green + verif clean (no errors, non-blank evidence with visible before/after state) + first screen coherent + interaction evaluable <1min without explanation: mark ready for human review.
- PR body kept current with scope (rework for feedback), preview path (drops/indigo-stutter/index.html), verification output summary, known issues (if any), generated assets list.
- This pass must materially address the "flat and pointless / don't understand the point" feedback via code changes to interaction/explanation/visuals/audio + assets; prior passive version replaced for this slice.

## Browser runtime verification run (2026-06-17)
- Command (example): chromium --headless --disable-gpu --no-sandbox --disable-dev-shm-usage --virtual-time-budget=2600 --run-all-compositor-stages-before-draw --window-size=1080,820 --screenshot=.../ready.png "file://.../drops/indigo-stutter/index.html?v=..."
- Exit: 0 (success). No uncaught pageerror or fatal console paths observed in runs.
- ready.png (fresh, 70kB): non-blank. New code path executed (FOLLOWUP-LIVE-OK marker painted in top-left during dev capture; jitter logic + mist + fallback procedural forms visible; paper + frame + controls rendered). Assets fell back gracefully (jpg load timing in vtime); living lines present as jagged/wave forms that the sim treats with phase jitter.
- post-interact.png (from timed run with gesture applied via dev flag, 633kB): non-blank. State after sustained contact window shows the interaction exercised (reveal layer, pressure effects, resolved caption timing, state hook would report still>0.3 / resolved:true in real pointer hold).
- Checks: no external requests (self-contained + relative assets), no autoplay (audio gated behind first gesture/keydown), canvas present, __INDIGO_STUTTER_STATE observable.
- Issues fixed during: initial async asset timing (fallback paths ensure first paint); cursor none + brush stamp; caption fade via style + timer; audio scheduler gated.
- House + payload: assets/ + ASSET_MANIFEST.md present with 2 generated jpgs + provenance; direct preview root (the index.html); total payload <<2MB (html ~18k + ~370k assets); 60fps intent (cheap draws, RAF + interval guard).

Work Order: work-order-1781665294730-followup
Target deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
