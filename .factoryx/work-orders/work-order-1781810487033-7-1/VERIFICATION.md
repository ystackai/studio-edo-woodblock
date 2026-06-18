# VERIFICATION — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781810487033-7-1)

**Status:** Technical design gate. Concrete commands and output will be recorded after implementation pass.

**Entrypoint:** games/94-kawanakajima/index.html (direct file:// load)

**Preview guard:** `.factoryx/preview-entrypoint` present with `games/94-kawanakajima/index.html`

## Planned verification steps (see TECHNICAL_SYSTEM_DESIGN.md for details)
1. Static presence:
   - 20 *.glb (or .gltf + .bin) files exist under games/94-kawanakajima/assets/models/
   - ASSET_MANIFEST.md in this WO context lists them with provenance.

2. Browser runtime (chromium headless with WebGL):
   ```
   chromium --headless --disable-gpu --no-sandbox --disable-dev-shm-usage --disable-extensions --disable-setuid-sandbox \
     --use-gl=swiftshader --enable-webgl --ignore-gpu-blacklist \
     --virtual-time-budget=2500 --run-all-compositor-stages-before-draw \
     --window-size=1100,780 \
     --screenshot=.factoryx/work-orders/work-order-1781810487033-7-1/screenshots/ready.png \
     "file:///workspaces/factory-edo-woodblock/worker-1/ystackai_studio-edo-woodblock/checkout/games/94-kawanakajima/index.html"
   ```
   - Guard: no pageerror, no console.error/fatal during load + 2s RAF.
   - Guard: successful relative loads for .glb and textures (no 404 in devtools or loader callbacks).
   - Capture must show non-blank 3D render (visible geometry, not flat 2D placeholder or white rect).

3. Post-interaction / inspection state:
   - Synthetic or script-driven selection of at least one Takeda + one Uesugi model.
   - Orbit or camera change + "instant" trigger.
   - Second screenshot: `screenshots/inspected.png` or `post-instant.png` showing real 3D content from the committed GLB (different angle or pair).
   - Exposed state `window.__KAWANAKAJIMA_3D_STATE` (or equivalent) reflects modelsLoaded count >=2, renderOK true, no lastError.

4. 9/9 Game Feel + house checklist (to be re-affirmed):
   - First screen legible as the subject (20 3D samurai for Kawanakajima) in <5s.
   - Interaction evaluable <60s without instructions.
   - Central assets are the file-backed GLBs (evidence in screenshots + manifest).
   - Sound (if present) sparse and gesture-gated.
   - Restraint, paper/ink frame around 3D, ma preserved.
   - Works file:// and preview tree.

## Known limitations (to be updated)
- Headless WebGL may require specific flags; if screenshots are black despite working code, note here and supply manual browser evidence.
- 3D model authoring pipeline: if no runtime generator, models produced externally and imported — documented in manifest.

## Output (post-run)
(Results and links to screenshots will be appended here after the impl + verify pass.)

Work Order: work-order-1781810487033-7-1
