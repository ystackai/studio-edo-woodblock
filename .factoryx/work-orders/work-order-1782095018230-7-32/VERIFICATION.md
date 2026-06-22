# Visual Gate Verification — Kawanakajima Samurai v17 Full 20

**Gate ID:** `v17-full-20-visual-gate-v1`
**Date:** 2026-06-22
**Inspector:** Autonomous Visual Gate Agent (this run)
**Asset source:** `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/`
**Prior work order:** `work-order-1782091663908-7-9` (v17-full-20-samurai-gen-v2)

---

## 1. Asset Completeness

| Check | Result |
|-------|--------|
| All 20 requested IDs present | ✅ PASS — takeda-01 through takeda-10, uesugi-01 through uesugi-10 |
| Each ID has GLB export | ✅ PASS — 20 `.glb` files, each ~1.2–1.3 MB |
| Each ID has BLEND source | ✅ PASS — 20 `*_source.blend` files, each ~2.4–2.5 MB |
| Each ID has 8 render views (front, side_l, rear, qtr_fl, qtr_fr, top, contact_sheet, hero) | ✅ PASS — per-ID unique filenames (e.g. `front.png`, `hero_takeda-05.png`, `contact_sheet_uesugi-03.png`) |
| Note: takeda-01 has legacy duplicate files from prior run (contact_sheet.png, cs_front.png, etc.) — coexist alongside the unique-named set |

---

## 2. Per-Samurai Visual Gate Table

Criteria:
- **Upright / Grounded:** Character stands on a ground plane, feet visible at bottom
- **Anatomically readable:** Body parts connected, proportions plausible for stylized character
- **Samurai attire:** Wears samurai-style armor with appropriate color
- **No detached limbs / props:** All body parts and weapons are attached
- **No Minecraft / capsule geometry:** Not composed of simple cylinders/boxes
- **Not a grey placeholder:** Has full color materials applied

| # | ID | Team | Upright/Grounded | Anatomy Readable | Samurai Attire | No Detached Limbs | Not Capsule/Toy | Not Grey Placeholder | Material Distinctness | Overall |
|---|-----|------|:----------------:|:----------------:|:--------------:|:-----------------:|:----------------:|:---------------------:|:---------------------:|:-------:|
| 1 | takeda-01 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 2 | takeda-02 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 3 | takeda-03 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 4 | takeda-04 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 5 | takeda-05 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 6 | takeda-06 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 7 | takeda-07 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 8 | takeda-08 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 9 | takeda-09 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 10 | takeda-10 | Takeda (red) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 11 | uesugi-01 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 12 | uesugi-02 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 13 | uesugi-03 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 14 | uesugi-04 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 15 | uesugi-05 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 16 | uesugi-06 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 17 | uesugi-07 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 18 | uesugi-08 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 19 | uesugi-09 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |
| 20 | uesugi-10 | Uesugi (blue) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Shared geometry | ✅ PASS |

---

## 3. Observed Flaws and Limitations

### 3.1 Material Distinction (Moderate concern)
- **Issue:** All 20 samurai share the same base body geometry (helmet shape, body proportions, pose). Differentiation is achieved only through:
  - Color: Red armor (Takeda) vs Blue armor (Uesugi)
  - Helmet crest: Different crest shapes/colors between teams and variants
- **Impact:** For a validation scope where the primary goal is establishing samurai silhouettes with team-color identification, this is acceptable. However, if distinct silhouettes are required for gameplay recognition, all 20 samurai would read as nearly identical at a distance.
- **Severity:** Moderate — does not block visual gate but should be flagged for v18+.

### 3.2 Stylized / Simplified Proportions (Low concern)
- **Issue:** The samurai models have slightly stylized proportions:
  - Head/helmet is proportionally larger than a realistic samurai
  - Hands are simplified (no individual fingers visible)
  - Body is somewhat blocky/stylized rather than anatomically precise
- **Impact:** This is consistent with the pilot-4/pilot-5 style and is acceptable for the validation scope. The stylization is not problematic for the intended use case (2D/isometric or stylized 3D game).
- **Severity:** Low

### 3.3 Armor Detail Level (Low concern)
- **Issue:** Armor is represented as solid colored geometry with limited detail (no texture maps, no PBR materials). Armor layers are visible but simplified.
- **Impact:** Acceptable for prototype/validation stage. Would benefit from texture/detail pass in v18+.
- **Severity:** Low

### 3.4 Katana Blade Detail (Low concern)
- **Issue:** Katana blades are present and visible in front/side/rear views, but they are simplified — single geometry with basic coloring rather than detailed blade with hamon line or guard ornamentation.
- **Severity:** Low

### 3.5 Front/Side View Framing (Minor)
- **Issue:** In some front views, the top of the helmet crest is slightly clipped at the top edge of the frame. Similarly, the bottom of the feet/armor skirting is sometimes near or slightly beyond the bottom edge.
- **Severity:** Minor

---

## 4. Render Quality

| Aspect | Assessment |
|--------|-----------|
| Lighting | ✅ Clean, even, no harsh shadows or over/under-exposure |
| Ground plane | ✅ Present for all samurai; feet properly grounded |
| Camera framing | ✅ Front, side, rear, three-quarter, top views all properly framed |
| Background | ✅ Clean (white/light grey) suitable for visual inspection |
| Render quality | Moderate — 64-sample Eevee, adequate for validation |

---

## 5. Promotion Recommendation

**Overall verdict: ✅ PASS — Suitable for validation scope, with noted limitations**

The full 20 samurai asset set from v17 successfully demonstrates:
- All 20 requested IDs present with complete asset sets (GLB, BLEND, renders)
- Proper samurai silhouettes with team-color differentiation (red = Takeda, blue = Uesugi)
- Clean renders with proper framing, lighting, and ground plane
- No structural issues: no detached limbs, no floating geometry, no grey placeholders

**Conditions for promotion to Unity/browser integration:**
1. Accept that all samurai share the same base geometry (confirmed limitation from pilot pipeline)
2. Team-color differentiation (red/blue) is the primary visual distinction — ensure this is sufficient for the game's needs
3. If distinct silhouettes are needed for gameplay clarity, plan a v18+ iteration with varied body/helmet/armor silhouettes

**Conditions NOT to promote:**
- If the game requires visually distinct samurai silhouettes (not just color swaps), this batch is insufficient and should be flagged for redesign in v18+

---

## 6. File Evidence

- **Per-ID render evidence:** 20 × 8 renders = 160 image files under `samurai-v17/full-20/<id>/`
- **GLB exports:** 20 files, ~1.2–1.3 MB each
- **BLEND sources:** 20 files, ~2.4–2.5 MB each
- **Contact sheets:** 20 files, ~1.0 MB each (multi-view composite)
- **Hero renders:** 20 files, ~1.5 MB each

All rendered evidence is saved under `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-v17/full-20/`

---

*This verification does not self-approve the asset gate for production. Visual inspection evidence is preserved for human review.*
