# ASSET_MANIFEST — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781810487033-7-1)

**Status:** Technical design gate complete. No assets generated yet. This skeleton will be populated during implementation with the 20 real GLB/GLTF files.

**Source of truth note:** Per requirements and prior operator feedback, `ASSET_MANIFEST.md` in the Work Order context is authoritative. In-code comments or PR prose alone do not suffice.

## Asset Pipeline Inspection (at planning time)
- Current checkout contains only the prior 2D JPG portraits under `games/94-kawanakajima/assets/` (takeda-*.jpg, uesugi-*.jpg). These do **not** satisfy the current brief.
- No `assets/models/` directory or GLB/GLTF files present.
- No 3D generation tools (Blender, text-to-3D, glTF exporter) visible in runtime or MCP surface at planning time.
- Vendored 3D runtime (three.js + GLTFLoader) not yet present; will be added as relative files if chosen in impl.
- GenerateImage tool (used for prior 2D) produces 2D images only.

## Planned Core Assets (20 file-backed 3D samurai models)
All must be real committed files under `games/94-kawanakajima/assets/models/`.

### Takeda (10)
- takeda-01.glb … takeda-10.glb (with clan-appropriate crests, weapons, silhouette differentiation)

### Uesugi (10)
- uesugi-01.glb … uesugi-10.glb

Each entry (to be filled post-generation) will record:
- exact filename + size
- triangle / vertex count (or "low-poly stylized")
- materials + texture refs (embedded or external png under assets/textures/)
- generation/authoring method + prompt or source note (must be "file-backed authored", not pure runtime procedural)
- integration points (roster key, stage key, inspector)
- verification evidence (screenshot path showing this specific .glb rendered)

## Supporting assets
- Optional stylized textures (albedo, ink mask, etc.)
- Vendored runtime under assets/vendor/ if separate files chosen (three.min.js, GLTFLoader.js) — these are tooling, not creative assets.

## Integration points (planned)
- games/94-kawanakajima/index.html will preload or on-demand load via THREE.GLTFLoader using relative paths.
- 3D viewports or inspector will render the actual mesh geometry + materials from the .glb.
- Screenshots in this WO's screenshots/ will demonstrate the loaded files (pixel content attributable to the committed geometry).

## Blockers / notes (at gate)
- 3D model production: if no generation capability is available during impl, this will be called out explicitly. 20 real GLB files are required for the deliverable to be considered complete per the human brief and "do not count ... in-code procedural geometry".
- House style application to 3D: design specifies restrained materials, paper frame, limited palette to avoid clashing with ukiyo-e philosophy.

## Evidence (to be added)
- 20 committed .glb + manifest rows
- Browser verification output showing successful decode + render of the actual files
- At least one contact/grid or per-figure screenshot from the live preview

Work Order: work-order-1781810487033-7-1
