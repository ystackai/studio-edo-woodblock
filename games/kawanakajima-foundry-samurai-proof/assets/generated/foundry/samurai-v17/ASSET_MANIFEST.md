# ASSET MANIFEST - Samurai v17 Full 20

## Overview
- **Batch**: v17 full 20 samurai set
- **Source**: Blender pilot scripts (generate_pilot4_samurai.py, generate_pilot5_samurai.py)
- **Generator**: batch_samurai_v17.py (compact batch driver)
- **Renderer**: Blender 3.4.1 background mode
- **Output root**: games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/
- **Total IDs**: 20 (10 Takeda/red + 10 Uesugi/blue)
- **Variant indices**: 0-3, cycled across variants (takeda-05..10 reuse variants 0-1)

## Assets

| # | ID | Team | Variant | GLB | BLEND | Renders per ID |
|---|-----|------|---------|-----|-------|----------------|
|  1 | takeda-01 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  2 | takeda-02 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  3 | takeda-03 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  4 | takeda-04 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  5 | takeda-05 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  6 | takeda-06 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  7 | takeda-07 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  8 | takeda-08 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
|  9 | takeda-09 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 10 | takeda-10 | Takeda (red) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 11 | uesugi-01 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 12 | uesugi-02 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 13 | uesugi-03 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 14 | uesugi-04 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 15 | uesugi-05 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 16 | uesugi-06 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 17 | uesugi-07 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 18 | uesugi-08 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 19 | uesugi-09 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |
| 20 | uesugi-10 | Uesugi (blue) | 0-3 (cycled) | ✅ | ✅ | 8 (contact_sheet, front, hero, qtr_fl, qtr_fr, rear, side_l, top) |

## Per-ID Render Evidence

Each samurai has:
- Front view
- Left side view
- Rear view
- Front-left three-quarter view
- Front-right three-quarter view
- Top-down view
- 4-view contact sheet
- Dramatic hero shot

## Integration Points
- GLB files ready for Three.js / browser game integration
- BLEND source files for iterative refinement
- Render evidence for visual review gate (not self-approved)

## Known Limitations
- Body geometry shared across variant indices (0-3); helmet/armor details vary
- Material/geometry variants are procedural, not unique meshes per ID
- Visual review gate not self-approved; requires separate visual review
- 64-sample Eevee renders (default quality)
