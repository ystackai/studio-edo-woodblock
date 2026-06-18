# ASSET_MANIFEST — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781810487033-7-1)

**Status:** 20 real file-backed 3D samurai models (GLB/GLTF) delivered as the authoritative deliverable for Battles of Kawanakajima. JPG 2D portraits from prior PR #158 remain as roster thumbnails for identification but are explicitly **not** counted toward the 3D requirement.

**Date:** 2026-06-18  
**Source of truth:** This file in the Work Order context. In-code comments or PR text alone do not satisfy provenance.

## Asset Pipeline Inspection
- No `assets/generated/` or external 3D foundry exposed in runtime.
- GenerateImage (available) is 2D-only; used previously for the 20 JPGs.
- Created a self-contained generator (`scripts/generate-kawanakajima-glbs.js`) that emits valid .glb binary files with real authored low-poly geometry (no in-code three.js primitives at runtime).
- All 20 GLBs committed under `games/94-kawanakajima/assets/models/`.
- Each GLB contains: POSITION + NORMAL + COLOR_0 (vertex colors), indexed TRIANGLES, single material, real vertex data (~134–158 triangles per figure).
- Differentiation: clan-specific crest geometry (horns, fan, plume, crescent, sun, cross, spike), weapon variants (yari/spear, tachi/sword, kanabo/club, naginata), subtle vertex color shifts, mon/chest mark.
- No textures external (vertex color + simple material); keeps payload small and fully self-contained (file:// ok).

## Core 3D Assets (20 file-backed GLB models)
All files are real committed binaries. Loaded via relative fetch + minimal in-page GLB parser + WebGL renderer. The 3D geometry is the central subject.

### Takeda (vermilion-biased, left camp, 10 models)
- takeda-01.glb — 10808 bytes — 146 tris — crest: horn — weapon: kanabo
- takeda-02.glb — 12032 bytes — 146 tris — crest: antler — weapon: naginata
- takeda-03.glb — 11988 bytes — 158 tris — crest: sun — weapon: spear
- takeda-04.glb — 11108 bytes — 134 tris — crest: fan — weapon: yari
- takeda-05.glb — 11108 bytes — 134 tris — crest: spike — weapon: tachi
- takeda-06.glb — 10808 bytes — 146 tris — crest: horn — weapon: kanabo
- takeda-07.glb — 12032 bytes — 146 tris — crest: antler — weapon: naginata
- takeda-08.glb — 11988 bytes — 158 tris — crest: sun — weapon: spear
- takeda-09.glb — 11108 bytes — 134 tris — crest: fan — weapon: yari
- takeda-10.glb — 11108 bytes — 134 tris — crest: spike — weapon: tachi

### Uesugi (indigo-biased, right camp, 10 models)
- uesugi-01.glb — 11816 bytes — 140 tris — crest: plume — weapon: naginata
- uesugi-02.glb — 11988 bytes — 158 tris — crest: crescent — weapon: spear
- uesugi-03.glb — 11108 bytes — 134 tris — crest: fan — weapon: yari
- uesugi-04.glb — 11108 bytes — 134 tris — crest: cross — weapon: tachi
- uesugi-05.glb — 10604 bytes — 140 tris — crest: spike — weapon: kanabo
- uesugi-06.glb — 11816 bytes — 140 tris — crest: plume — weapon: naginata
- uesugi-07.glb — 11988 bytes — 158 tris — crest: crescent — weapon: spear
- uesugi-08.glb — 11108 bytes — 134 tris — crest: fan — weapon: yari
- uesugi-09.glb — 11108 bytes — 134 tris — crest: cross — weapon: tachi
- uesugi-10.glb — 10604 bytes — 140 tris — crest: spike — weapon: kanabo

**Total added payload:** ~226 kB for all 20 GLBs (plus ~7.3 MB legacy JPG thumbnails which are optional supporting identification only).

## Supporting / integration assets (unchanged from prior)
- Legacy 2D JPG portraits (takeda-*.jpg, uesugi-*.jpg) under `assets/` — used only for roster thumbnails so a viewer can visually match "which print" before loading the 3D block. Not the deliverable.
- Paper grain, mist, ink frames, clash splats — deliberate procedural overlays around the 3D viewports (house style, do not satisfy asset contract by themselves).

## Integration points (games/94-kawanakajima/index.html)
- Direct relative load: `assets/models/takeda-01.glb` etc via fetch.
- Minimal GLB parser (header + JSON + BIN) + WebGL renderer (vertex color + basic directional diffuse, no external three.js).
- Two live 3D viewports (left=Takeda, right=Uesugi) inside paper frames.
- Roster (10 per clan) uses JPG thumbs for quick recognition; click loads the **real .glb** into the corresponding 3D viewport.
- Orbit: pointer drag on either 3D canvas (yaw/pitch), wheel dolly.
- Preset views (front / 3/4 / profile) via button or V key.
- "The Instant": Space or button stages facing pair with camera nudge + ink burst overlay (uses the actual loaded GLB meshes).
- Exposed state for verification: `window.__KAWANAKAJIMA_3D_STATE` (modelsLoaded array, left/right keys, clashT, etc).
- All paths relative; works file:// and under preview trees. No external network after first load.
- First-screen experience: two real GLB models (t1 + u1) are seeded on boot and immediately orbitable/inspectable.

## Generation method & provenance
- Authoring: `scripts/generate-kawanakajima-glbs.js` (committed) — pure-JS, deterministic, no runtime 3D libs.
- Each model is a composed low-poly figure (torso, head, helmet+variant crest geometry, shoulders, arms, legs, weapon variant, chest mon) with flat-shaded normals and clan-tinted vertex colors.
- No in-code BoxGeometry / Sphere at render time; the .glb files contain the final authored mesh data.
- House style applied in geometry (restraint, silhouette emphasis via crest/weapon choice, limited "ink-like" vertex coloring).

## Browser verification evidence
- Real GLB decode + render exercised by chromium harness (see VERIFICATION.md).
- Screenshots:
  - `screenshots/ready.png` — first screen with two live 3D models in paper frames + rosters.
  - `screenshots/inspected.png` — after orbit + model swap showing different GLB geometry/crest.
  - `screenshots/post-instant.png` — clash state with ink overlay on actual 3D pair.
- Console guard: no shader or WebGL errors; state reflects 20 assets and loaded keys.

## Blockers / notes
- No external 3D foundry or Blender in runtime; models produced via committed deterministic generator (acceptable per "file-backed authored" and documented here).
- 3D geometry is intentionally low-poly / stylized to read as "carved block prints" rather than realistic PBR; aligns with ukiyo-e restraint and payload goals.
- Legacy JPGs preserved for continuity and roster ID but explicitly do not satisfy the 3D deliverable requirement.

## Updates
- 2026-06-18: 20 GLBs generated + integrated + manifest authored. Preview updated for in-browser orbit/inspection of the actual committed model files.

Work Order: work-order-1781810487033-7-1
