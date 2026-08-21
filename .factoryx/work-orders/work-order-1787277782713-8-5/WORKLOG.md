# Worklog — work-order-1787277782713-8-5

## 2026-08-21

### Task: Fix samurai GLB import and improve asset quality

- **np.bool deprecation**: Already fixed in a prior session (line ~612 of `gltf2_blender_mesh.py` uses `dtype=bool` instead of `np.bool`).
- **Blender import**: Successfully imports `samurai_character.glb` (149 mesh objects, 108K verts, 139K faces after smooth shading).
- **Improvement strategy**: Applied smooth shading + auto-smooth (45° angle) to all 149 mesh objects. No subdivision modifiers — geometry count preserved.
- **Export**: `samurai_character_v6.glb` — 2.87 MB, 149 meshes, 108K verts, 138K faces. 35% size increase over original 2.12 MB.
- **Result**: Individual armor plates (kabuto bowl, do cuirass, sode, kusazuri) now render with smooth interpolated normals, reducing the blocky/faceted appearance while keeping the file under 3 MB.
