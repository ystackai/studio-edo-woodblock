# ASSET MANIFEST — Kawanakajima Samurai Character

## Asset: samurai_character.glb (v6)

| Field | Value |
|-------|-------|
| **File** | `assets/samurai_character.glb` |
| **Source blend** | `assets/generated/foundry/samurai/improved-20260620-v6/samurai_character_source_v6.blend` |
| **GLB size** | 599 KB |
| **Blend size** | 2.9 MB |
| **Mesh stats** | 222 nodes, 221 meshes, 21 materials, 11,765 position vertices (v5: 5,488 verts, 5,106 faces) |
| **Materials** | 13 (aged_akai_lacquer, aged_crimson_sashimono, brushed_steel_blade, dark_iron_edges, dark_stained_wood, dark_worn_leather, deep_black_lacquer, dulled_brass_mon, faded_indigo_hakama, indigo_cord_lacing, painted_mon, russet_mempo_mask, weathered_skin) |
| **Generation method** | Blender 3.4.1 procedural build, improved from Foundry v5 source |
| **Improvement script** | `improved-20260620-v6/blender_outputs.json` |

### v6 Improvements over v5

| Issue | v5 | v6 |
|-------|----|----|
| **Helmet face (mempo)** | Flat mask plate | Deepened with nose bridge, cheekbones, jawline, mouth plate, eye slit shadows |
| **Helmet crest (kuwagata)** | Small crescent | Larger cone-form crescent with center stud detail |
| **Ear guards (fukigaeshi)** | Flat flares | Cone-form with better volume |
| **Neck guard (shikoro)** | 4-layer plates | 5-layer plates with graduated sizing for depth |
| **Geta sandals** | Basic block sole + teeth | Split-toe tabi detail, ankle thong, ankle strap, shin guard with horizontal lacing |
| **Armor plates** | Uniform boxes | Edge accent trims on chest and shoulders, shoulder cord lacing |
| **Clothing** | Simple folds | Hakama vertical fold lines, sleeve drape folds |
| **GLB payload** | 1.3 MB | 599 KB (improved compression) |

### Integration Points

| Location | File | Status |
|----------|------|--------|
| Browser game | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | ✅ Updated to v6 |
| Unity project | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` | ✅ Updated to v6 |
| Game index | `games/kawanakajima-foundry-samurai-proof/index.html` | References `samurai_character.glb` (no path change needed) |

### Browser Verification

| Check | Result |
|-------|--------|
| GLB loads in Three.js/GLTFLoader | ✅ v6 verified by `node verify.js` |
| Character visible at normal camera distance | ✅ Verified by render contact sheet |
| Silhouette readable in game scene | ✅ Improved face/helmet silhouette |
| No missing materials | ✅ All 13 materials preserved |
| Contact sheet renders | ✅ `samurai_character_contact_sheet.png` updated |

### File Index

| File | Size | Purpose |
|------|------|---------|
| `samurai_character.glb` | 599 KB | Active game asset (v6) |
| `samurai_character_contact_sheet.png` | 4.9 MB | Multi-view contact sheet (v6) |
| `samurai_character_hero.png` | 669 KB | Hero hero shot (v5) |
| `samurai_character_source_v6.blend` | 2.9 MB | Blender source (v6) |
| `blender_outputs.json` | 691 B | v6 export provenance |
| `improved-20260620/` | — | v1 iteration archive |
| `improved-20260620-v3/` | — | v3 iteration archive |
| `improved-20260620-v4/` | — | v4 iteration archive |
| `improved-20260620-v5/` | — | v5 iteration archive |
| `improved-20260620-v6/` | — | v6 iteration archive (current) |

### Provenance

- **Work Order**: `work-order-1782008767760-7-11` — Improve samurai asset visual quality via Blender
- **Base branch**: `factoryx/kawanakajima-samurai-autonomous-validation-20260621-v2`
- **V5 source**: `samurai_character_source_v5.blend` (Foundry-generated base)
- **V6 script**: Procedural Blender script, run with Blender 3.4.1 headless
- **Date**: 2026-06-21
