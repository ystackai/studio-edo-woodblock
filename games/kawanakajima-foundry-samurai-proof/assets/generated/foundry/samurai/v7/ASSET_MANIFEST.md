# ASSET_MANIFEST — Kawanakajima v7 Samurai Assets

**Work Order:** work-order-1782026277354-7-12
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v7`
**Date:** 2026-06-21
**Branch:** `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v7`
**Preview:** `games/kawanakajima-foundry-samurai-proof/index.html`

---

## Status

✅ **v7 samurai assets generated successfully** via Asset Foundry Blender provider.
Both Takeda (red lacquer) and Uesugi (blue lacquer) variants pass the visual gate.
GLB files, source .blend files, and review views are all present.

---

## Generated Assets

### 1. Takeda Samurai (Red Lacquer)

| File | Size | Description |
|------|------|-------------|
| `samurai_takeda_v7.glb` | 389 KB | Exported GLB with all Takeda samurai meshes, materials, transforms |
| `samurai_takeda_source_v7.blend` | 2.1 MB | Blender 3.4.1 source file with full editable scene |

- **Provenance:** Asset Foundry Blender provider (`http://factoryx-edo-woodblock-asset-foundry:18113`)
- **Generator script:** `v7-generate-samurai.py`
- **Mesh count:** 81 objects
- **Color scheme:** Deep black lacquer (`#01500d`), aged red lacquer (`#610B09`)

### 2. Uesugi Samurai (Blue Lacquer)

| File | Size | Description |
|------|------|-------------|
| `samurai_uesugi_v7.glb` | 384 KB | Exported GLB with all Uesugi samurai meshes, materials, transforms |
| `samurai_uesugi_source_v7.blend` | 2.1 MB | Blender 3.4.1 source file with full editable scene |

- **Provenance:** Asset Foundry Blender provider (`http://factoryx-edo-woodblock-asset-foundry:18113`)
- **Generator script:** `v7-generate-samurai.py`
- **Mesh count:** 81 objects
- **Color scheme:** Deep black lacquer (`#01500d`), deep indigo/aoi blue (`#0B1A59`)

### 3. Review Views

| File | Size | View |
|------|------|------|
| `cs_front.png` | 413 KB | Front view — full body upright samurai |
| `cs_side.png` | 388 KB | Side profile — armor depth, sashimono, katana |
| `cs_rear.png` | 408 KB | Rear view — sashimono banner, armor back detail |
| `cs_qtr.png` | 404 KB | Three-quarter view — front + side armor layers |
| `cs_top.png` | 340 KB | Top-down — body outline, kabuto, kuwagata crest |
| `cs_uesugi_front.png` | 382 KB | Uesugi front — blue lacquer variant |
| `cs_uesugi_side.png` | 368 KB | Uesugi side profile |
| `cs_uesugi_qtr.png` | 377 KB | Uesugi three-quarter |
| `samurai_character_contact_sheet_v7.png` | 570 KB | Composite sheet: front, side, rear, qtr, top |
| `samurai_character_hero_v7.png` | 527 KB | Hero hero render — promotional/preview image |

---

## Asset Detail

### Silhouette & Pose
- **Upright stance:** Feet grounded, center of gravity correct
- **Human proportions:** Head-to-body ratio ~1:6.5 (realistic for stylized samurai)
- **No capsule/cylinder/primitive-only anatomy** — detailed geometry throughout

### Armor Components
- **Kabuto** (helmet): Dome with kuwagata (horned crest), mabizashi (forehead plate)
- **Shikoro** (neck guard): 3-tier layered construction
- **Do** (chest armor): Lamellar plates — 4 upper, 5 lower rows with visible cord lacing
- **Sode** (shoulder guards): Layered armor on both shoulders
- **Kusazuri** (skirt armor): 5 panels wrapping lower torso
- **Kote** (arm guards): Upper and lower arm protection with visible segmentation

### Cloth & Garments
- **Hakama:** Wide-legged trousers with 3 fold lines per leg
- **Tabi:** Split-toe socks visible beneath waraji
- **Obi:** Belt with knot at back

### Face & Head
- **Head:** Human proportions with jaw definition
- **Mempo:** Face mask with stylized mustache/whiskers
- **Eyes:** Dark indentations for socket detail
- **Nose:** Bridge and tip geometry

### Weapons & Equipment
- **Katana:** Curved blade, tsuka (handle) with wrap, tsuba (hand guard), saya (scabbard)
- **Sashimono:** Back banner with pole and mon (circular crest)

### Materials
| Material | Base Color | Roughness | Metallic |
|----------|-----------|-----------|----------|
| Deep black lacquer | (0.015, 0.013, 0.011) | 0.38 | 0.00 |
| Takeda red lacquer | (0.38, 0.045, 0.035) | 0.52 | 0.00 |
| Uesugi blue lacquer | (0.045, 0.10, 0.35) | 0.52 | 0.00 |
| Dark iron edges | (0.055, 0.052, 0.048) | 0.50 | 0.15 |
| Brushed steel blade | (0.78, 0.78, 0.72) | 0.28 | 0.45 |
| Weathered skin | (0.42, 0.25, 0.17) | 0.72 | 0.00 |
| Dulled brass mon | (0.76, 0.57, 0.22) | 0.42 | 0.15 |

---

## Visual Gate Assessment

| Criterion | Result | Notes |
|-----------|--------|-------|
| Upright stance | ✅ PASS | Feet on ground, proper center of gravity |
| Human readability | ✅ PASS | Clear head-torso-limbs silhouette |
| Non-Minecraft/non-capsule | ✅ PASS | Detailed geometry, not primitive-only |
| Armor detail | ✅ PASS | Lamellar plates, sode, kote, kusazuri visible |
| Face/head | ✅ PASS | Kabuto, mempo, eyes, nose, jaw defined |
| Hand/foot detail | ✅ PASS | Fingers visible, tabi + waraji sandals |
| Weapon | ✅ PASS | Katana with tsuka, tsuba, saya |
| Cloth/armor fold | ✅ PASS | Hakama folds, armor layering visible |
| Material PBR | ✅ PASS | Principled BSDF with correct roughness/metallic |
| Takeda vs Uesugi | ✅ PASS | Red vs blue lacquer clearly distinguished |
| GLB export | ✅ PASS | Both exported successfully, ~385 KB each |
| Source .blend | ✅ PASS | Editable Blender 3.4.1 files present |
| Review views | ✅ PASS | 5 standard views + Uesugi variants |

---

## Integration Points

- **GLB files:** `assets/samurai_takeda_v7.glb`, `assets/samurai_uesugi_v7.glb`
- **Source Blender:** `assets/generated/foundry/samurai/v7/samurai_*_source_v7.blend`
- **Generator script:** `v7-generate-samurai.py` (Blender 3.x compatible)
- **Index.html:** Update `samurai_character.glb` references to `samurai_takeda_v7.glb` and `samurai_uesugi_v7.glb`
- **Unity:** Copy GLBs to `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/`

---

## Known Limitations

- Single model variant per side (cloned for 10 per faction in game, not 10 unique models)
- No animation rigs — static poses suitable for turntable/camera views
- Contact sheet background uses manual PIL composition (Blender internal PIL unavailable)
- Weighted Normal modifier warnings in Blender log (cosmetic, does not affect render)

---

*Generated autonomously via Asset Foundry Blender provider. No human/Codex intervention on asset geometry.*
