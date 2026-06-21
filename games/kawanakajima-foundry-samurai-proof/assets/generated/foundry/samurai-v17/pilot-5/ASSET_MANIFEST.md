# Pilot-5 Samurai Asset Manifest

**Work Order:** `work-order-1782048566414-7-13`
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Version:** v17 pilot-5 (retry)
**Date:** 2026-06-21
**Generator:** Blender 3.4.1 procedural script `generate-pilot5-samurai.py`
**Dependency:** v17-pilot-visual-gate-v24 (work-order-1782048326461-7-9) — all pilot-4 assets verified PASS

## Overview

Four pilot samurai models generated as part of the Kawanakajima v17 autonomous validation pipeline. Two Takeda (red-side) and two Uesugi (blue-side) variants with distinct helmet crests: hawk crest, spiked helm, circle mon, and horned cross.

## Asset Files

### GLB Exports (Runtime-ready)

| File | Size | Mesh Count | Description |
|------|------|------------|-------------|
| `takeda-03.glb` | 1.3 MB | 149 | Takeda variant 0 — Hawk/rooster crest helm |
| `takeda-04.glb` | 1.3 MB | 152 | Takeda variant 1 — Spiked helm with spire |
| `uesugi-03.glb` | 1.3 MB | 151 | Uesugi variant 0 — Circle mon helm |
| `uesugi-04.glb` | 1.3 MB | 155 | Uesugi variant 1 — Horned cross / Yotsuba-gata |

### Blender Source Files

| File | Size | Description |
|------|------|-------------|
| `takeda-03_source.blend` | 2.4 MB | v17 source — Hawk crest helm variant |
| `takeda-04_source.blend` | 2.4 MB | v17 source — Spiked helm variant |
| `uesugi-03_source.blend` | 2.4 MB | v17 source — Circle mon helm variant |
| `uesugi-04_source.blend` | 2.4 MB | v17 source — Horned cross helm variant |

### Render Views (Per-samurai inspection)

| View | File | Dimensions |
|------|------|------------|
| Front | `cs_front.png` | 720x900 |
| Side (left) | `cs_side_l.png` | 720x900 |
| Rear | `cs_rear.png` | 720x900 |
| QTR Fl (front-left) | `cs_qtr_fl.png` | 720x900 |
| QTR Fr (front-right) | `cs_qtr_fr.png` | 720x900 |
| Top | `cs_top.png` | 720x900 |
| Hero | `hero.png` | 820x1024 |
| Contact Sheet | `contact_sheet.png` | 1440x1800 |

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
2. **Unity Integration** — GLB files can be imported into the Unity project at `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/`. Scale factor: 1 unit ~ 1.55m.
3. **Formation Rendering** — Samurais are placed in 2x5 formation grids on the Kawanakajima battlefield scene.
4. **Animation Support** — Each samurai has idle bob animation, charge rotation, and banner wind oscillation. No skeleton/bone data (object-based procedural geometry).

## Visual Inspection Notes

### Observed Limitations (not self-approved)
- Materials are solid colors only — no PBR maps, normal maps, or texture details
- Mesh count per samurai (149–155) is moderate; further optimization for runtime would involve vertex merging on repeated instances
- No rig or skeleton — animations are transform-based (position/rotation offsets)
- Banner cloth is a single flat plane — could benefit from subdivided geometry for cloth simulation
- Face details (mempo mask) are stylized: eye slits, mustache lines — acceptable for browser-scale viewing
- Helms use simple cylinder/cone geometry for crest details; fine detail at small scales may be lost
- Variant differentiation relies primarily on helmet crest shape; body geometry is shared across variants

### v12 Defect Check
- [x] No capsule/tube cylinder body — torso is ellipsoid
- [x] No detached limbs — all appendages attached at proper joints
- [x] No slab/box banners — sashimono is flat cloth plane with mon disc
- [x] Feet are grounded — geta soles visible below feet in front/side views
- [x] Distinct variants — 4 models have different helmet crests; takeda-03/04 and uesugi-03/04 are not clones

## Browser Verification

| Test | Result |
|------|--------|
| GLB file load in Three.js GLTFLoader | Assets present, sizes ~1.3 MB each — within budget |
| Render view visibility | All 6 views readable at 720x900 |
| Contact sheet legibility | Hero shot and view grid readable |
| Silhouette readability | Distinct from multiple angles in contact sheet |
| Total payload (4 samurai GLBs) | ~5.2 MB uncompressed — consider Draco compression for production |

## Provenance

- **Script:** `generate-pilot5-samurai.py` (forked from `generate-pilot4-samurai.py`, patch-edited)
- **Pipeline:** Blender 3.4.1 local execution
- **Foundation:** Based on improve-samurai-v5.py patterns from improved-20260620-v5
- **Variants:** 4 distinct helmet crests (hawk, spiked, circle mon, horned cross), 2 teams (Takeda/red, Uesugi/blue)
- **Dependency verified:** v17-pilot-visual-gate-v24 (work-order-1782048326461-7-9) — pilot-4 assets verified PASS with observed limitations: elongated leg proportions, solid-color materials only, no rig, flat banner planes, short katana blades

## Visual Gate Status

**NOT self-approved.** Visual review by external gate required. This manifest records observed limitations per hard gate requirements.
