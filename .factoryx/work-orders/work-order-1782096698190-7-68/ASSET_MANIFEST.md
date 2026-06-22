# Asset Manifest — Visual Gate v17 Full 20 Samurai

**Work Order:** `work-order-1782096698190-7-68`  
**Gate Type:** Visual gate (inspection only, no new assets generated)  
**Date:** 2026-06-22  

---

## Gate Outcome

**FAIL.** 8 samurai inspected; 12 missing from full-20 target. All samurai fail visual quality (capsule/doll proportions, identity cloning).

---

## Assets Inspected

### full-20 directory (`samurai-v17/full-20/`)

| ID | GLB | BLEND | Render Views | Visual Gate |
|----|-----|-------|-------------|-------------|
| takeda-01 | ✅ present (per-ID folder) | ✅ present | ✅ 6 views + hero | FAIL (capsule anatomy) |
| takeda-02 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-03 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-04 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-05 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-06 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-07 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-08 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-09 | ❌ missing | ❌ missing | ❌ missing | — |
| takeda-10 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-01 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-02 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-03 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-04 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-05 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-06 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-07 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-08 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-09 | ❌ missing | ❌ missing | ❌ missing | — |
| uesugi-10 | ❌ missing | ❌ missing | ❌ missing | — |

### pilot-4 directory (`samurai-v17/pilot-4/`) — shared renders

| ID | GLB | BLEND | Notes |
|----|-----|-------|-------|
| takeda-01 | ✅ | ✅ | Same body as takeda-02 |
| takeda-02 | ✅ | ✅ | Clone of takeda-01 |
| uesugi-01 | ✅ | ✅ | Same body as uesugi-02 |
| uesugi-02 | ✅ | ✅ | Clone of uesugi-01 |

### pilot-5 directory (`samurai-v17/pilot-5/`) — shared renders

| ID | GLB | BLEND | Notes |
|----|-----|-------|-------|
| takeda-03 | ✅ | ✅ | Same body as takeda-04 |
| takeda-04 | ✅ | ✅ | Clone of takeda-03 |
| uesugi-03 | ✅ | ✅ | Same body as uesugi-04 |
| uesugi-04 | ✅ | ✅ | Clone of uesugi-03 |

---

## Dependency Evidence

Source: `work-order-1782091663908-7-9` (v17-full-20-samurai-gen-v2)
- Pilot-4 manifest: 4 samurai generated (takeda-01/02, uesugi-01/02)
- Pilot-5 manifest: 4 samurai generated (takeda-03/04, uesugi-03/04)
- full-20 directory: only takeda-01 rendered (incomplete batch)

---

## Blockers

1. **Missing samurai:** 12 of 20 not generated in full-20 directory
2. **Capsule/doll anatomy:** All samurai have cylinder limbs, paddle hands, flat armor
3. **Identity cloning:** Paired samurai are identical except helmet crest
4. **Shared render files:** Pilot samurai share contact sheets — individual per-ID renders needed for batch evidence
