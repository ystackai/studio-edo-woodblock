# VERIFICATION — work-order-1781913967751-7-1

**Browser runtime verification performed on:** `games/kawanakajima-foundry-samurai-proof/index.html`

## Checks performed
- Canvas present and non-blank on load (ground + fog + trees render immediately).
- GLB served 200, 20 actors instantiated from single Foundry source.
- No console errors on load path (GLTFLoader success path).
- Camera starts framing the tableau (default cinematic shoulder).
- All 6 repeatable cameras executable and place focal assets large + readable.
- Click-to-inspect + INSPECT ASSET + contact panel functional (comparison view).
- Charge/reform mutate positions and return cleanly.
- Resize handler present; canvas fills viewport.
- Window.KAWANAKAJIMA_FOUNDRY exposed with actorCount, do* , applyCam.
- Contact sheet + hero PNGs load in review panel.
- File-backed audio paths load from `assets/audio/`; harness exposes `audioPaths` and `hasFileBackedAudio`.
- All required assets under the tree with provenance in manifest.
- Unity source handoff structure present under `unity/kawanakajima-samurai/`.
- Unity handoff verifier checks glTFast dependency, copied GLB/WAV assets, runtime bootstrap, readiness marker, and WebGL/Linux build hooks.

## Screenshots (repeatable views)
Captured after construction + any fixes:
- See `.factoryx/work-orders/work-order-1781913967751-7-1/screenshots/`

## Visual issues identified in loop
(Updated live during self-review)
- Fixed the headless capture timing bug: URL cameras now mark `CAPTURE_READY:<view>` only after the GLB has produced all 20 actors and two rendered frames have painted.
- Replaced the earlier 21k dark/loading overview, side, and top screenshots with readable captures. Current committed view evidence ranges from 101k to 406k and all six views have mean brightness above 99.
- Vision (gateway qwen3-vl) on good close/inspect shots vs contact: "blocky cubes, flat paddle feet, and the helmet's disk face" — same as source Foundry model. Large framing achieved; no geo replacement. Recorded in ASSET_MANIFEST as characteristic of asset-1781913507610-bf69e595.

## Final status
See PR body for summary + links. Any remaining visual blocker recorded in ASSET_MANIFEST. Browser proof ready for review; preview at games/kawanakajima-foundry-samurai-proof/ . Unity source handoff exists, but Unity Editor build verification remains blocked by missing Editor/listener.
