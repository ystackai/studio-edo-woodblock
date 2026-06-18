# PREVIEW — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781810487033-7-1)

**Status:** Implementation complete. 20 file-backed GLB samurai models delivered and inspectable in-browser. This replaces the prior 2D-only delivery.

**Entrypoint:** `games/94-kawanakajima/index.html` (direct)

**Preview file written:** `.factoryx/preview-entrypoint` contains `games/94-kawanakajima/index.html`

## How to open
- Direct: open `games/94-kawanakajima/index.html` in a modern browser (file:// or served). Two live 3D GLB models are shown immediately.
- Factory preview tree: `/factoryx/previews/<factory>/<work-order>/games/94-kawanakajima/index.html`
- The 3D viewports are the focal subject on first screen.

## First screen (what a reviewer sees)
- Paper-framed left and right WebGL viewports (Takeda / Uesugi).
- Two real 3D samurai models (takeda-01.glb + uesugi-01.glb) already loaded and visible — clear central subject.
- Rosters below/around use the prior JPG thumbnails only for identification; clicking a roster card loads the **actual .glb** into its 3D viewport.
- Title + "twenty carved blocks", margin note, and "THE INSTANT" stage band telegraph the subject without extra explanation.
- Drag on either 3D canvas to orbit; wheel to zoom; buttons or keys for instant / reset / views.

## Interaction (30–60s slice, no instructions needed)
- Primary verb: orbit the 3D prints by dragging the blocks.
- Click any roster item (left camp for Takeda, right for Uesugi) → loads that exact GLB file into the corresponding viewport (immediate visible change of crest/weapon geometry).
- Space or "THE INSTANT" button stages the current pair: camera nudge + ink clash burst using the real loaded meshes.
- 1–5 keys: quick-load balanced pairs.
- V cycles preset views (front / three-quarter / profile).
- R resets clash only.
- S toggles sparse physical SFX (gesture only).

## Controls
- Pointer: drag on 3D viewport = orbit; wheel = dolly. Large hit area on canvas.
- Touch: same gestures work.
- Keyboard parity as above; all discoverable in <10s of play.
- Buttons mirror keys.

## 3D assets (file-backed, listed in ASSET_MANIFEST.md)
- 20 .glb under `games/94-kawanakajima/assets/models/` (takeda-01.glb … uesugi-10.glb).
- Minimal self-contained GLB parser + WebGL renderer (no CDN, no three.js vendor; ~30kB of viewer code).
- Vertex colors + normals inside each .glb; differentiated per model.
- Screenshots captured from live browser render of the committed files.

## Screenshots / checkpoints (captured from real run)
- `screenshots/ready.png` — first screen with seeded 3D models in paper frames + rosters visible.
- `screenshots/inspected.png` — after clicking different roster entries + orbiting (different crests/weapons visible).
- `screenshots/post-instant.png` — clash state with ink overlay on actual GLB pair.

## Notes
- Self-contained after load (relative paths only).
- Prior 2D JPGs kept only as optional visual index; the 3D GLBs are the reviewable deliverable.
- Verification (chromium + WebGL) exercises model fetch, decode, render, and interaction state.
- House style: paper frames around the 3D, restrained palette, ink overlays, "the instant" as the charged moment.

Work Order: work-order-1781810487033-7-1
