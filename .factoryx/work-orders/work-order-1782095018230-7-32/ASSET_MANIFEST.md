# Asset Manifest — Kawanakajima Samurai v17 Full 20

**Work Order:** work-order-1782095018230-7-32
**Deliverable:** v17-full-20-visual-gate-v1
**Date:** 2026-06-22

## Overview
- **Batch:** v17 full 20 samurai set
- **Source:** Blender pilot scripts (generate-pilot4-samurai.py, generate-pilot5-samurai.py)
- **Generator:** generate-samurai-v17-batch.py (compact batch driver)
- **Renderer:** Blender 3.4.1 background mode
- **Output root:** `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/`
- **Total IDs:** 20 (10 Takeda/red + 10 Uesugi/blue)
- **Visual gate:** ✅ PASS (see VERIFICATION.md)

## Assets Per ID

Each ID has:
- 1 GLB export (~1.2–1.3 MB)
- 1 BLEND source (~2.4–2.5 MB)
- 8 render images (~1.0–1.5 MB each):
  - `front.png` — front view
  - `side_l.png` — left side view
  - `rear.png` — rear view
  - `qtr_fl.png` — front-left three-quarter view
  - `qtr_fr.png` — front-right three-quarter view
  - `top.png` — top-down view
  - `contact_sheet_<id>.png` — 6-view composite contact sheet
  - `hero_<id>.png` — dramatic hero render

## Complete Asset List

| # | ID | Team | GLB | BLEND | Renders | Visual Gate |
|---|-----|------|-----|-------|---------|-------------|
| 1 | takeda-01 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 2 | takeda-02 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 3 | takeda-03 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 4 | takeda-04 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 5 | takeda-05 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 6 | takeda-06 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 7 | takeda-07 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 8 | takeda-08 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 9 | takeda-09 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 10 | takeda-10 | Takeda (red) | ✅ | ✅ | ✅ | ✅ PASS |
| 11 | uesugi-01 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 12 | uesugi-02 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 13 | uesugi-03 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 14 | uesugi-04 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 15 | uesugi-05 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 16 | uesugi-06 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 17 | uesugi-07 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 18 | uesugi-08 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 19 | uesugi-09 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |
| 20 | uesugi-10 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ PASS |

## Integration Points
- GLB files ready for Three.js / browser game integration
- BLEND source files for iterative refinement
- Contact sheets available for visual review
- Hero renders for promotional/art purposes

## Known Limitations
- Body geometry shared across all 20 variants (4 variant templates cycled)
- Material/geometry variants are procedural, not unique meshes per ID
- Only differentiation: team color (red/blue) and helmet crest design
- Stylized proportions (larger head, simplified hands)
- Armor has no PBR texture maps

## Visual Gate Evidence
- 20 contact sheets inspected (6-view composites)
- 60+ individual renders inspected (front, side, rear samples)
- 2 hero renders inspected (takeda-01, uesugi-01)
- Full per-samurai breakdown in VERIFICATION.md
