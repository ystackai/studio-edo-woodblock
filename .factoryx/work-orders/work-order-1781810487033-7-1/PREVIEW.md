# PREVIEW — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781810487033-7-1)

**Status:** Technical design gate complete. Implementation has not started. This is the planning skeleton; will be updated with real 3D evidence after models and viewer are integrated.

**Entrypoint:** `games/94-kawanakajima/index.html` (direct; will be updated for 3D model inspection)

**Preview file written:** `.factoryx/preview-entrypoint` contains exactly `games/94-kawanakajima/index.html`

## How to open (planning)
- Direct: open `games/94-kawanakajima/index.html` in any modern browser (file:// or served). After impl this will render live 3D GLB models.
- Factory preview tree: `/factoryx/previews/<factory>/<work-order>/games/94-kawanakajima/index.html`
- The entrypoint enables automated harness resolution for the 3D-capable artifact.

## Planned first screen (after 3D delivery, per TECHNICAL_SYSTEM_DESIGN + GOAL)
- Title and camp labels in house ink.
- Central subject: 3D samurai models (Takeda left, Uesugi right) presented inside paper-framed WebGL viewports or as selectable 3D thumbnails.
- At least 2-3 models visible or immediately inspectable on first paint so the "actual 3D assets" are unmistakable (no reliance on prior 2D JPGs for the deliverable claim).
- Integrated affordance for inspection: drag to orbit, select different figures, stage a Takeda vs Uesugi "instant".
- Subtle caption: something like "the prints stand in the block — turn them in the light".

## Planned interaction (30-60s slice)
- Pointer selects / loads a model from each clan into the active view.
- Drag on 3D canvas orbits the current figure(s); wheel zooms.
- Space or stage gesture triggers a charged "instant" (facing pose, camera move, ink overlay).
- R resets; 1-5 for quick pairs.
- All 20 file-backed .glb must be reachable for inspection without leaving the page.

## Controls (to be wired)
- Pointer primary for roster selection + 3D orbit.
- Keyboard: space (instant), R (reset), S (sound), number keys.
- Touch-friendly orbit.

## Sound (carry forward, gesture only)
- Sparse physical cues (brush on reveal if hybrid, stamp, clash tones). No loops.

## 3D assets (to be produced and listed in ASSET_MANIFEST.md)
- 20 GLB/GLTF under `games/94-kawanakajima/assets/models/` (takeda-01.glb … uesugi-10.glb).
- Optional texture/material PNGs under assets/textures/ or embedded.
- Provenance and verification evidence recorded in the WO's ASSET_MANIFEST.md (not just code comments).
- Screenshots will capture real loaded geometry (not 2D fallbacks).

## Screenshots / checkpoints (to be captured post-impl)
- `screenshots/ready.png` — first screen with 3D model(s) rendered, paper frame, clear clan camps.
- `screenshots/inspected.png` — after orbit/select, showing a different model or angled view of 3D samurai.
- `screenshots/post-instant.png` — staged confrontation using the actual GLB meshes.

## Notes
- Self-contained after load + vendored three + GLTFLoader (no net).
- See TECHNICAL_SYSTEM_DESIGN.md for filesystem, libraries, data flow, and inspection approach.
- Prior 2D JPGs may remain for transition but do not satisfy the 3D brief.
- Real browser runtime verification (including WebGL model load) is required before review claim.

Work Order: work-order-1781810487033-7-1
