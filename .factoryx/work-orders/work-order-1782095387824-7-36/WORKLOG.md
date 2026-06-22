# Worklog — Samurai v20 Realism Proof Pair

## 2026-06-22

1. Read v19 VERIFICATION.md and ASSET_MANIFEST.md as source of truth. v19 proved faction color control (red/blue) but failed realism (toy-like geometry).
2. Copied v19 script (`samurai_v19_blender.py`) to v20 (`samurai_v20_blender.py`).
3. Applied v20 geometry improvements:
   - Torso: replaced single sphere with two-volume tapered silhouette (chest + waist)
   - Head: changed to ellipsoid (elongated y-axis for less round face)
   - Neck: replaced spherical neck guard with cylinder (longer neck structure)
   - Shoulders: enlarged shoulder undercloth + added sode shoulder armor prominence
   - Arms: tapered ellipsoid scales for upper arm and forearm
   - Legs: thinner ellipsoid scales for hakama legs and shin greaves
   - Hands: enlarged palm and finger volumes
   - Feet: enlarged foot volume and wider waraji soles
4. Fixed relative-path issue in main() by adding `.resolve()` to spec and out paths.
5. Rendered takeda-01 and uesugi-01 proof pairs (exit 0, no Python errors).
6. Generated contact sheets with PIL for both IDs.
7. Visual review: v20 shows meaningful realism improvement over v19 — tapered torso, elongated head, better proportions. Hands remain blocky; armor plates retain slight cubic quality.
8. Noted next step: v21 iteration focusing on hand articulation and armor surface refinement.
