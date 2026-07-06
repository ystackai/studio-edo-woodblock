# Verification — Samurai v20 Realism Proof Pair

## Commands Run

- `python3 -m py_compile samurai_v20_blender.py` — PASS (syntax clean after v19 → v20 edits).
- `python3 -m py_compile samurai_v20_blender.py` after path-absolute fix — PASS.
- `blender -b -P samurai_v20_blender.py -- --spec takeda-01/spec.json --out takeda-01` — PASS (exit 0, all 6 views + turntable rendered; GLB/blend exported).
- `blender -b -P samurai_v20_blender.py -- --spec uesugi-01/spec.json --out uesugi-01` — PASS (exit 0, all 6 views + turntable rendered; GLB/blend exported).
- PIL contact-sheet generation for both IDs — PASS.
- Log scans for `Error: Python`, `Traceback`, `Exception`, `TypeError` — no failure markers (EGL display warnings are harmless in headless mode).

## Visual Review

### Takeda-01 (Red Armor)
- **Silhouette**: The two-volume torso (chest + waist) produces a noticeably tapered human silhouette. Chest is wider than waist, creating a V-taper rather than the v19 spherical block.
- **Armor**: The kusazuri skirt plates overlap more naturally; the added shoulder armor (sode) extends the shoulder line outward, breaking the rounded shoulder block of v19.
- **Head/Helmet**: Elongated head ellipsoid (x=0.105, y=0.125, z=0.155) gives a less round facial profile. The cylinder neck guard replaces the spherical neck cloth, adding vertical neck structure.
- **Faction color**: Crimson/indigo red armor and red sashimono banner render correctly.

### Uesugi-01 (Blue Armor)
- **Silhouette**: Same improved proportions — tapered torso, elongated head, longer neck structure.
- **Armor**: Layered armor plates with shoulder prominence preserved from Takeda build.
- **Faction color**: Deep blue/indigo armor and blue sashimono banner render correctly.

### Comparison to v19
- **v19 FAIL**: Round torso, simplified cylindrical limbs, simplified hands/feet, round face, block-like armor slabs.
- **v20 IMPROVEMENT**: Tapered two-volume torso, elongated head ellipsoid, cylinder neck guard, enlarged gloved hands (0.064×0.050×0.070 vs smaller v19 palms), enlarged feet with wider waraji soles, tapered arm/leg ellipsoids, added shoulder armor plates.
- **Residual issues**: Hands still read as blocky glove shapes (cubes with small fingers); some armor plates retain a slight cubic appearance. The overall silhouette is human-like, but fine anatomical detail remains stylized.

## Quality Assessment

**v20 improves realism over v19**: Yes, the silhouette and proportions are noticeably more human. The tapered torso, elongated head, and longer neck structure address the core v19 complaints.

**Production readiness**: Not yet. The hands remain blocky, some armor reads as slightly cubic, and fine anatomical detail needs more work. The current v20 is a meaningful improvement but should be treated as an intermediate proof, not final production art.

## Next Step

Another proof iteration focusing on:
1. **Hand geometry**: Replace cube-based glove with a more articulated hand (palm + elongated finger volumes).
2. **Armor refinement**: Add slight curvature/convexity to armor plates using scaled/offset shapes rather than flat cubes.
3. **Face/neck detail**: Slightly enlarge the visible head area behind the mempo mask; add a thinner neck cylinder between head and collar.

After these refinements, a v21 proof pair should be rendered and visually reviewed before proceeding to the full 20-character batch.
