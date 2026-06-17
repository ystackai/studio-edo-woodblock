# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated:** 2026-06-17 via FactoryX asset generation (image skill + ukiyo-e house style prompts)
**Purpose:** Real file-backed visual layers for the taste-gate "rub to still the living ink" playable slice. Addresses operator feedback "music and art are terrible please improve". Satisfies asset_contract_v2: file-backed under drops/**/assets/ + manifest + provenance. (Audio remains sparse procedural scheduler for payload/restraint; gesture-reactive and improved per Tsutaya voice.)

## Files

- `base-motif.jpg` (201 kB)
  - Role: Primary composition layer — warm paper ground, deep indigo silhouettes: horizon/wave crest, lone boat (left of center), distant pine on right hill, layered mist veils. Strong negative space.
  - Style: Ukiyo-e woodblock print aesthetic, feathered/bleeding edges, restrained palette (#f4f0e6 paper, #0A0F3C/#0f172a ink), atmospheric ma.
  - Usage in game: drawn at full opacity as the "printed" base; living jittered ink overlays (wave/veil/boat/pine) are drawn on top to create the "stutter" tremble before gesture. Provides the soul that pure procedural cannot.
  - Provenance: generated for this WO; registered with base composition for the living print.

- `reveal-detail.jpg` (403 kB)
  - Role: Progressive reveal / under-layer reward for sustained attention. Same registration as base.
  - Details (emergent with attention): boat wake ripples, two birds in upper mist, enhanced pine texture, faint vermilion seal (lower right, only visible at high resolve as earned mark), settled wave strokes, locally thinner mist revealing distant form.
  - Style: Matches base exactly for overlay; feathered, same inks + one deliberate vermilion overprint.
  - Usage in game: drawn at alpha driven by cumulative "still" factor (0 at idle full stutter → ~0.85 at strong sustained contact). Mist thins, details "settle", seal blooms at high reveal. The player co-authors the finished print.
  - Provenance: generated companion to base-motif for this rework; tied to reveal mechanic in the slice.

## Notes
- Both assets are self-contained; no external references. Game code references relative to index.html (assets/*.jpg).
- Fallback: if images fail to decode (e.g. tree copy without assets/), draw loop still renders full house-style living jitter forms + mist + paper using vector ink passes so the slice remains playable and on-style.
- Total game payload (index + 2 assets + manifest): ~620 kB — well under 2 MB gate.
- No audio files shipped: the "music" improvement is in the reactive, gesture-only, attention-modulated sparse scheduler (hesitant drops + resolve tone). This keeps the breath/sparsity authentic to house style while satisfying the visual generated_assets requirement. If future feedback demands file-backed audio loops, short WAVs can be added in a follow-on without changing the slice identity.
- License / usage: Studio internal; ephemeral digital ukiyo-e; not for redistribution outside FactoryX context.

## Verification of contract
- Real files present in drops/indigo-stutter/assets/ (not just manifest, not in-code only).
- Referenced + loaded in the playable index.html.
- Provenance explicitly includes the work order id and feedback being addressed.
- Used for material art change per the rework.

(End of manifest)
