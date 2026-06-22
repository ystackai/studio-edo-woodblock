# Visual Gate Verification — v17 Full 20 Samurai

**Work Order:** `work-order-1782096698190-7-68`  
**Deliverable:** `kawanakajima-samurai-autonomous-validation-20260621-v17`  
**Gate:** Independent final visual gate for all 20 samurai  
**Date:** 2026-06-22  
**Reviewer:** Automated visual gate agent

---

## Gate Outcome

**FAIL — Not promoted to Unity/browser integration.**

The full-20 samurai batch is incomplete and the visual quality of all rendered samurai fails the anatomical/readability standards defined in the visual review hard gates.

---

## 1. Coverage — Are all 20 IDs present?

| Status | Count | Details |
|--------|-------|---------|
| Present in `full-20/` | **1** | Only `takeda-01` has a dedicated per-ID folder with GLB, BLEND, and render views |
| Present in pilot-4/ | **4** | `takeda-01`, `takeda-02`, `uesugi-01`, `uesugi-02` — GLB + BLEND + shared renders |
| Present in pilot-5/ | **4** | `takeda-03`, `takeda-04`, `uesugi-03`, `uesugi-04` — GLB + BLEND + shared renders |
| **Missing from full-20/** | **12** | `takeda-05` through `takeda-10`, `uesugi-05` through `uesugi-10` |

The `samurai-v17/full-20/` directory contains only one samurai (`takeda-01`). The dependency work order `work-order-1782091663908-7-9` ("Generate full 20-samurai asset set from approved pilot pipeline") appears to have only produced the pilot-4 and pilot-5 samurai as separate batches, not consolidated into the full-20 structure. This is a **blocking issue** — the gate cannot verify 20 samurai when only 8 exist.

---

## 2. Per-Samurai Visual Pass/Fail Table

Each samurai from pilot-4 and pilot-5 was inspected via their contact sheets (all 4 samurai share the same contact sheet per pilot), front/side/hero renders, and per-ID renders where available.

### pilot-4 samurai (shared renders: `pilot-4/contact_sheet.png`, `pilot-4/hero.png`)

| ID | Faction | Crest | Upright | Grounded | Readable Anatomy | Clothed/Armored | No detached limbs | Not Minecraft/capsule | Visually distinct | Pass/Fail |
|----|---------|-------|---------|----------|-----------------|-----------------|-------------------|----------------------|-------------------|-----------|
| takeda-01 | Takeda (red) | Crescent moon | PASS | PASS | PARTIAL — head/neck/shoulder present but limbs are cylinders | PASS | PASS | FAIL — reads as capsule/doll proportions | PARTIAL — crest differs from takeda-02 | FAIL |
| takeda-02 | Takeda (red) | Horned with jewel | PASS | PASS | PARTIAL — same body as takeda-01 | PASS | PASS | FAIL — same body, same pose | FAIL — clone of takeda-01 | FAIL |
| uesugi-01 | Uesugi (blue) | X-cross | PASS | PASS | PARTIAL | PASS | PASS | FAIL — capsule proportions | PARTIAL | FAIL |
| uesugi-02 | Uesugi (blue) | Deer antler | PASS | PASS | PARTIAL — same body as uesugi-01 | PASS | PASS | FAIL | FAIL — clone of uesugi-01 | FAIL |

### pilot-5 samurai (shared renders: `pilot-5/contact_sheet.png`, `pilot-5/hero.png`)

| ID | Faction | Crest | Upright | Grounded | Readable Anatomy | Clothed/Armored | No detached limbs | Not Minecraft/capsule | Visually distinct | Pass/Fail |
|----|---------|-------|---------|----------|-----------------|-----------------|-------------------|----------------------|-------------------|-----------|
| takeda-03 | Takeda (red) | Hawk/rooster | PASS | PASS | PARTIAL | PASS | PASS | FAIL — capsule/doll proportions | PARTIAL | FAIL |
| takeda-04 | Takeda (red) | Spiked with spire | PASS | PASS | PARTIAL — same body as takeda-03 | PASS | PASS | FAIL | FAIL — clone of takeda-03 | FAIL |
| uesugi-03 | Uesugi (blue) | Circle mon | PASS | PASS | PARTIAL | PASS | PASS | FAIL | PARTIAL | FAIL |
| uesugi-04 | Uesugi (blue) | Horned cross | PASS | PASS | PARTIAL — same body as uesugi-03 | PASS | PASS | FAIL | FAIL — clone of uesugi-03 | FAIL |

### full-20/takeda-01 (individual renders available)

| ID | Upright | Grounded | Readable Anatomy | Clothed/Armored | Not capsule-like | Pass/Fail |
|----|---------|----------|-----------------|-----------------|------------------|-----------|
| takeda-01 | PASS | PASS | PARTIAL — same structural issues | PASS | FAIL | FAIL |

---

## 3. Systemic Visual Issues

### 3.1 Capsule/Doll Proportions (CRITICAL)
All 8 samurai share the same fundamental geometry:
- **Torso:** Smooth ellipsoid — no anatomical detail, no visible rib/abdomen structure
- **Head:** Cylinder with a helmet — no facial structure, the mempo mask is a flat plane with cutout eye slits and a painted-on mustache line
- **Neck:** Extremely thin — barely connects head to shoulders, reads as a pin
- **Arms:** Thin cylinders — no upper arm/lower arm/forearm differentiation, no elbow definition
- **Hands:** Paddle-like — no fingers, just small caps at limb ends
- **Legs:** Cylinders with uniform diameter — no thigh/calf differentiation
- **Feet:** Geta sandals rendered as thin rectangular boxes — visible but flat, not structurally integrated

This is the classic "toy mannequin" or "capsule doll" problem. The samurai read as stylized cartoon figures, not as believable armored warriors.

### 3.2 Identity Cloning (CRITICAL)
Across both pilots, **each faction pair is a clone**:
- `takeda-01` and `takeda-02` — identical body, same pose, same armor layout. Only difference: helmet crest shape (crescent moon vs. horned jewel).
- `uesugi-01` and `uesugi-02` — identical body, same pose, same armor layout. Only difference: helmet crest (X-cross vs. deer antler).
- `takeda-03` and `takeda-04` — identical body, same pose, same armor layout. Only difference: helmet crest (hawk vs. spiked).
- `uesugi-03` and `uesugi-04` — identical body. Only difference: helmet crest (circle mon vs. horned cross).

For a batch of 20 samurai, having 10 unique body templates with 2 variants each (color + crest) produces only 10 distinct silhouettes. At game-scale (small sprites/3D instances), this is especially problematic — the helmet crests may not be distinguishable at play distance.

### 3.3 Armor Not Integrated with Body
The lamellar armor panels are applied as flat-ish planes on the surface. They do not follow the body contours — there is no sense of overlapping plates, tension at joints, or how armor would drape and constrain movement. The armor reads as "pasted on" rather than worn.

### 3.4 Color Palette Repetition
All Takeda samurai use the same color scheme (red/black armor, brass accents) and all Uesugi use (blue/black, silver). While faction-consistent, this further reduces inter-samurai differentiation at small scales. No samurai has a truly unique color signature beyond crest and team color.

---

## 4. Positive Observations

The samurai do have several correct elements:
- **Upright and grounded:** All 8 samurai stand on the ground plane with feet visible — no floating, no sideways/prone orientation.
- **Faction-identifiable:** Takeda (red) vs. Uesugi (blue) is clear from distance.
- **Helmet crests are distinct shapes:** Crescent moon, horned jewel, X-cross, deer antler, hawk, spiked spire, circle mon, horned cross — 8 different crest shapes across the 8 samurai.
- **Props attached:** Katana swords hang at natural angles; sashimono banners are on the back, not detached.
- **Geta sandals visible:** From front and side views, the toothed soles are present.
- **No detached limbs or props:** All appendages are properly connected to the body.

---

## 5. Promotion Recommendation

**DO NOT promote to Unity/browser integration.**

The samurai assets from v17 pilot-4 and pilot-5 batches:
1. Are structurally capsule/doll-like with cylinder limbs, paddle hands, and flat armor
2. Have severe identity cloning — 8 samurai across 2 pilots, with only helmet crest differentiating paired variants
3. Would not be visually distinguishable in actual gameplay at expected scale
4. The full-20 batch is incomplete (1 of 20 rendered in the target directory)

**Required fixes before any further batch or promotion:**
1. **Redesign the base samurai body** — add anatomical structure: defined head with facial features, thicker neck, shoulder definition, upper/lower arm differentiation, hand detail (at least finger suggestion), thigh/calf leg structure, and feet that read as feet (not boxes).
2. **Create 10+ truly distinct body silhouettes** — vary height, build (stocky vs. lean), armor style, pose, helmet design, weapon type, and color palette across samurai.
3. **Complete the full-20 batch** — render all 20 IDs into their own per-ID directories.

---

## 6. Files Inspected

| File | Purpose |
|------|---------|
| `samurai-v17/full-20/takeda-01/contact_sheet.png` | Full-20 takeda-01 contact sheet (all 6 views + hero) |
| `samurai-v17/full-20/takeda-01/cs_front.png` | Full-20 takeda-01 front view |
| `samurai-v17/full-20/takeda-01/hero.png` | Full-20 takeda-01 hero render |
| `samurai-v17/full-20/takeda-01/cs_side_l.png` | Full-20 takeda-01 side view |
| `samurai-v17/full-20/takeda-01/cs_rear.png` | Full-20 takeda-01 rear view |
| `samurai-v17/pilot-4/contact_sheet.png` | Pilot-4 contact sheet (takeda-01/02, uesugi-01/02) |
| `samurai-v17/pilot-4/hero.png` | Pilot-4 hero render |
| `samurai-v17/pilot-4/cs_front.png` | Pilot-4 front view (takeda-01) |
| `samurai-v17/pilot-4/cs_side_l.png` | Pilot-4 side view (takeda-01) |
| `samurai-v17/pilot-5/contact_sheet.png` | Pilot-5 contact sheet (takeda-03/04, uesugi-03/04) |
| `samurai-v17/pilot-5/hero.png` | Pilot-5 hero render |
| `samurai-v17/pilot-5/cs_front.png` | Pilot-5 front view (takeda-03) |
| `samurai-v17/pilot-5/cs_side_l.png` | Pilot-5 side view (takeda-03) |
| `pilot-4/ASSET_MANIFEST.md` | Pilot-4 asset documentation |
| `pilot-5/ASSET_MANIFEST.md` | Pilot-5 asset documentation |

---

## 7. Blockers for Next Work Order

| Blocker | Severity | Notes |
|---------|----------|-------|
| Full-20 batch incomplete | **Critical** | Only `takeda-01` exists; 12 samurai missing |
| Capsule/doll anatomy | **Critical** | All samurai read as simplified toy figures; cylinder limbs, paddle hands, flat armor |
| Identity cloning | **Critical** | Paired samurai are clones differentiated only by helmet crest |
| No per-ID renders for pilot samurai | **Major** | Pilot samurai share contact sheets/hero renders — only `takeda-01` has individual renders |
