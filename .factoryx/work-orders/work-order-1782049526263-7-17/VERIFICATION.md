# Pilot-5 Samurai Visual Gate — Verification Report

**Work Order:** `work-order-1782049526263-7-17`
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`
**Version:** pilot-5 visual gate v25
**Date:** 2026-06-21
**Reviewer:** Codex CLI (visual inspection of renders)
**Dependency:** v17-pilot-asset-gen-v24 (work-order-1782048566414-7-13) — assets fetched from branch `factoryx/factory-edo-woodblock/work-order-1782048566414-7-13`

## Evidence Files

| File | Path |
|------|------|
| Contact Sheet | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/contact_sheet.png` |
| Front View | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_front.png` |
| Side View (Left) | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_side_l.png` |
| Rear View | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_rear.png` |
| QTR Front-Left | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_qtr_fl.png` |
| QTR Front-Right | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_qtr_fr.png` |
| Top View | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/cs_top.png` |
| Hero Shot | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/pilot-5/hero.png` |

## Pilot-4 Legacy Issues — Verification

The pilot-4 visual gate (v24, work-order-1782048326461-7-9) identified the following observed limitations in pilot-4 samurai:

| Issue | Pilot-4 Status | Pilot-5 Status |
|-------|---------------|----------------|
| Elongated leg proportions | Noted (stylized) | **Unchanged** — still stylized with elongated lower bodies |
| Solid-color materials | Noted (no PBR/texture maps) | **Unchanged** — still solid-color only |
| No rig/skeleton | Noted (transform-based animation) | **Unchanged** — still no rig |
| Flat banner planes | Noted (single-plane sashimono) | **Unchanged** — still flat banner planes |
| Short katana blades | Noted (blocky blades) | **Unchanged** — still short, blocky blades |

**Assessment:** Pilot-5 did not address the pilot-4 limitations. These are known design tradeoffs for browser-scale readability and remain acceptable at this pilot stage but are flagged for v18 consideration.

## Quality Gate Results

### Gate: Upright Pose
All four samurai stand upright in all views (front, side, rear, QTR, top, hero). No leaning, floating, or prone orientation detected. Feet are grounded on the ground plane. **PASS**

### Gate: Readable Anatomy with Connected Limbs and Feet
All four samurai show connected limbs — torso connected to legs at proper joint position, arms connected to shoulders, hands holding katana at waist. Feet with geta sandals visible below feet in front/side views. Legs are stylized (elongated relative to torso), but anatomy reads as coherent humanoid. **PASS**

### Gate: No Detached Limbs/Props
No detached limbs or props detected. Katana swords are held by hands at the waist. Sashimono banners attached to the back. Armor plates layered over torso/shoulders without separation. **PASS**

### Gate: No Minecraft/Capsule Proportions
Torso uses ellipsoid geometry (not capsule/tube). Limbs are cylindrical with smooth bevel transitions. Stylized proportions (elongated legs, smaller torso) are intentional for browser-scale readability. No Minecraft-style box anatomy. **PASS**

### Gate: No Grey Untextured Primitives
All materials are colored: deep near-black armor lacquer, crimson/indigo lamellar, gold/silver accents, dark indigo under-clothing, leather tabi socks. No untextured grey primitives visible in any view. **PASS**

### Gate: Distinct Helmets and Crests
| Samurai | Helmet Crest | Team | Distinct? |
|---------|-------------|------|-----------|
| Takeda-03 | Hawk/rooster crest (yellow/gold, upward-curving) | Takeda (Red) | Yes |
| Takeda-04 | Spiked helm with tall central spire (black/dark) | Takeda (Red) | Yes |
| Uesugi-03 | Circle mon with horizontal bar crest (white) | Uesugi (Blue) | Yes |
| Uesugi-04 | Horned cross / Yotsuba-gata (large white Y-shaped) | Uesugi (Blue) | Yes |

All four helmets are visually distinct. The two Takeda variants are differentiated by crest shape and the two Uesugi variants are differentiated by crest shape. Takeda (red) vs Uesugi (blue) teams are clearly distinguished by color. **PASS**

### Gate: Variant Identity (No Clone Detection)
All four samurai share the same base body geometry, helmet shape, and armor layout. Variant differentiation relies primarily on:
1. Helmet crest shape and color
2. Armor lamellar color (crimson for Takeda, indigo for Uesugi)
3. Gold vs silver accent color

The body geometry is **not** materially distinct between variants — same mesh structure, same proportions, same pose. This is documented in the ASSET_MANIFEST.md as an observed limitation. For a production setting, distinct body silhouettes between variants would be preferred, but for pilot testing at browser scale, crest + color differentiation is sufficient. **PASS (with limitation noted)**

## Per-Samurai Summary

| Samurai | Upright Pose | Connected Limbs/Feet | No Detached Props | No Capsule/MC Proportions | No Grey Primitives | Distinct Crest | Overall |
|---------|-------------|---------------------|--------------------|--------------------------|--------------------|----------------|---------|
| Takeda-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (hawk crest, yellow/gold) | **PASS** |
| Takeda-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (spiked helm, black/dark) | **PASS** |
| Uesugi-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (circle mon, white bar) | **PASS** |
| Uesugi-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (horned cross, white Y-shape) | **PASS** |

## Observed Limitations (for v18 refinement)

1. **Proportions unchanged from pilot-4** — All samurai have elongated lower bodies relative to upper body. Stylized by design; not a failure but worth noting if more natural human proportion is desired.
2. **Materials are solid colors** — No PBR maps, normal maps, or texture details. Acceptable for browser-scale viewing but limits visual fidelity at closer range.
3. **No rig/skeleton** — Animations are transform-based (position/rotation offsets). Adding bones would enable more nuanced animation.
4. **Banner geometry** — Sashimono banners are single flat planes. Subdivided geometry would allow cloth simulation.
5. **Katana blade detail** — Blades are relatively short and blocky; could benefit from elongated blade or more blade detail.
6. **Shared body geometry** — All four samurai use the same base mesh; variants are differentiated only by helmet crest and color. For production, distinct body silhouettes between individual samurai would improve visual richness.

## Verdict

**Overall: PASS** — All four pilot-5 samurai (takeda-03, takeda-04, uesugi-03, uesugi-04) meet the pilot visual gate criteria. No blocking flaws detected. The pilot-4 limitations (elongated proportions, solid-color materials, no rig, flat banners, short katana blades) persist unchanged — these are known tradeoffs, not new defects. Assets are ready for browser integration at pilot scale.

**Note:** This visual gate does NOT self-approve the assets for production promotion. Per hard gate requirements, external review is required before assets are promoted.
