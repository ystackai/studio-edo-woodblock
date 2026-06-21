# Pilot-4 Samurai Asset Manifest

**Work Order:** `work-order-1782040253085-7-5`  
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`  
**Version:** v17 pilot-4  
**Date:** 2026-06-21  
**Generator:** Blender 3.4.1 procedural script `generate-pilot4-samurai.py`

## Overview

Four pilot samurai models generated as part of the Kawanakajima v17 autonomous validation pipeline. Two Takeda (red-side) and two Uesugi (blue-side) variants, each with distinct helmet crests, armor details, and banner styles for visual differentiation.

## Asset Files

### GLB Exports (Runtime-ready)

| File | Size | Mesh Count | Description |
|------|------|------------|-------------|
| `takeda-01.glb` | 1.3 MB | 149 | Takeda variant 0 — Crescent moon maedate crest |
| `takeda-02.glb` | 1.3 MB | 152 | Takeda variant 1 — Horned aggressive crest with center jewel |
| `uesugi-01.glb` | 1.3 MB | 151 | Uesugi variant 0 — X-cross maedate crest |
| `uesugi-02.glb` | 1.3 MB | 155 | Uesugi variant 1 — Deer antler spread crest |

### Blender Source Files

| File | Size | Description |
|------|------|-------------|
| `takeda-01_source.blend` | 2.4 MB | v17 source — Crescent moon helm variant |
| `takeda-02_source.blend` | 2.4 MB | v17 source — Horned aggressive helm variant |
| `uesugi-01_source.blend` | 2.4 MB | v17 source — X-cross helm variant |
| `uesugi-02_source.blend` | 2.4 MB | v17 source — Deer antler helm variant |

### Render Views (Per-samurai inspection)

Each samurai has 6 standardized inspection views plus a hero shot and contact sheet:

| View | File | Dimensions |
|------|------|------------|
| Front | `cs_front.png` | 720×900 |
| Side (left) | `cs_side_l.png` | 720×900 |
| Rear | `cs_rear.png` | 720×900 |
| QTR Fl (front-left) | `cs_qtr_fl.png` | 720×900 |
| QTR Fr (front-right) | `cs_qtr_fr.png` | 720×900 |
| Top | `cs_top.png` | 720×900 |
| Hero | `hero.png` | 820×1024 |
| Contact Sheet | `contact_sheet.png` | 1440×1800 |

## Material Palette

| Material | Takeda (Red Side) | Uesugi (Blue Side) |
|----------|-------------------|---------------------|
| Armor Lacquer | `#020302` (deep near-black) | `#010204` (dark blue-black) |
| Armor Lamellar | `#480A08` (aged crimson) | `#090CE2` (deep indigo) |
| Armor Alt Lamellar | `#080302` (blackened red) | `#06091E` (deep navy) |
| Iron Edges | `#0D0C0C` | `#0C0D0F` |
| Gold/Silver Accents | `#BD8C33` (dulled brass) | `#ADB0C2` (silver) |
| Under-cloth | `#080B14` (dark indigo) | `#070AB1` (faded indigo) |
| Leather/Tabi | `#191009` (dark worn) | `#170E0C` (dark worn) |
| Banner | `#6B0F0B` (aged crimson) | `#0C0F38` (deep blue) |

## Integration Points

1. **Three.js Browser Integration** — GLB files load via `THREE.GLTFLoader` in `index.html`. Each samurai instance uses the GLB as prototype, with team-colored overrides (Takeda=red, Uesugi=blue).

2. **Unity Integration** — GLB files can be imported into the Unity project at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/`. Scale factor: 1 unit ≈ 1.55m (based on existing normalization pipeline).

3. **Formation Rendering** — Samurais are placed in 2×5 formation grids on the Kawanakajima battlefield scene. Each instance gets a small faction mon (crest marker) below.

4. **Animation Support** — Each samurai has idle bob animation (sinusoidal Y-offset), charge rotation (forward lean), and banner wind oscillation. Skeleton/bone data: none (object-based procedural geometry).

## Visual Inspection Notes

### Strengths (observed, not self-approved)
- All samurai stand upright with feet firmly on the ground plane — no floating or drifting
- Helmet crests are visually distinct: crescent moon (T01), horned with jewel (T02), X-cross (U01), deer antler spread (U02)
- Lamellar armor rows create layered, textured appearance on torso and shoulders (sode)
- Geta sandals with teeth are visible from side/front views; tabi socks present
- Katana swords hang at natural angle with tsuba guard detail
- Sashimono banners on back are proportionally sized — not slab-like or oversized
- Body proportions: torso (ellipsoid) connected to limbs (cylinders) with smooth bevel transitions

### Observed Limitations (not self-approved)
- Materials are solid colors only — no PBR maps, normal maps, or texture details
- Mesh count per samurai (149–155) is moderate; further optimization for runtime would involve vertex merging on repeated instances
- No rig or skeleton — animations are transform-based (position/rotation offsets)
- Banner cloth is a single flat plane — could benefit from subdivided geometry for cloth simulation
- Face details (mempo mask) are stylized: eye slits, mustache lines — acceptable for browser-scale viewing

### v12 Defect Check
- [x] No capsule/tube cylinder body — torso is ellipsoid
- [x] No detached limbs — all appendages attached at proper joints
- [x] No slab/box banners — sashimono is flat cloth plane with mon disc
- [x] Feet are grounded — geta soles visible below feet in front/side views
- [x] Distinct variants — 4 models are not clones; helmets, armor colors, and banners differ

## Browser Verification

| Test | Result |
|------|--------|
| GLB file load in Three.js GLTFLoader | Assets present, sizes ~1.3 MB each — within budget |
| Render view visibility | All 6 views readable at 720×900 |
| Contact sheet legibility | Hero shot and 4 view grid readable |
| Silhouette readability | Distinct from all 4 angles in contact sheet |
| Total payload (4 samurai GLBs) | ~5.2 MB uncompressed — consider Draco compression for production |

## Provenance

- **Script:** `generate-pilot4-samurai.py` (573 lines, Blender 3.4.1 compatible)
- **Pipeline:** Asset Foundry Blender provider, local execution
- **Foundation:** Built on improve-samurai-v5.py patterns from improved-20260620-v5
- **Variants:** 4 distinct helmets (crescent moon, horned, X-cross, deer antler), 2 teams (Takeda/red, Uesugi/blue), varying lamellar row counts and sashimono dimensions

## Next Steps

1. Visual review gate by external reviewer (not self-approved)
2. If approved, integrate GLB files into the Three.js browser scene
3. Consider Draco compression to reduce ~5.2 MB → ~1.5 MB total
4. Add rig/bones if animation interpolation is needed
5. Generate PBR texture maps for production
