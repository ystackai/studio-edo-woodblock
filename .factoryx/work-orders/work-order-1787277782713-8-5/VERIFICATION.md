# Verification — work-order-1787277782713-8-5

## Acceptance Criteria

- [x] **np.bool deprecation fixed**: `gltf2_blender_mesh.py` uses `dtype=bool` (verified in prior session).
- [x] **GLB imports cleanly**: Blender 3.4.1 imports 149 mesh objects without errors (except non-critical Draco warning).
- [x] **Smooth shading applied**: All 149 mesh objects have smooth shading + auto-smooth (45°).
- [x] **File size under budget**: `samurai_character_v6.glb` is 2.87 MB (35% increase over original 2.12 MB, well within reason).
- [x] **Geometry preserved**: No subdivision modifiers; verts/faces unchanged from import (108K / 138K).
- [x] **Output written to correct path**: `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_v6.glb`.

## Comparison

| Version | Size | Verts | Faces | Notes |
|---------|------|-------|-------|-------|
| Original (v1-orig) | 2.12 MB | 108,008 | 138,664 | Foundry v5, flat-shaded |
| v6 (smooth) | 2.87 MB | 108,008 | 138,664 | Smooth normals, auto-smooth 45° |
| v7 (subdiv) | 9.2 MB | 332K+ | 526K+ | Too bloated — rejected |
| v9 (deep subdiv) | 41 MB | — | — | Way too large — rejected |

## Visual Quality

- Individual armor plates (kabuto helmet bowl, do cuirass, sode shoulder guards, kusazuri skirt plates) now render with smooth interpolated normals.
- Faceted/blocky appearance significantly reduced.
- No new geometry bloat; face counts identical to original.
