# Indigo Stutter — Generated Assets (work-order-1781665294730-followup)

This documents the real file-backed assets for the feedback rework pass of the Edo asset-generation skill smoke proof pack.

## Assets under drops/indigo-stutter/assets/

- base-motif.jpg (217 kB, 1152x864)
  - Generated 2026-06-20 via GenerateImage for this WO execution.
  - ukiyo-e woodblock style: feathered indigo waves, boat, pine, mist on warm paper.
  - Used as composited base layer under live stuttering ink.
  - Source: asset gen tooling (detailed Hiroshige-adjacent prompt).
  - Integration: canvas drawImage in index.html drawBase(); fallback paths exist.

- reveal-detail.jpg (265 kB, 1152x864)
  - Generated 2026-06-20 same pass, matched style/palette.
  - Emergent details (birds, wake, sharpened forms) that only high reveal shows.
  - Used to visually prove the "point" of sustained attention: the print settles and completes under the player's hand.
  - Integration: drawReveal() with alpha driven by stillness accumulator.

## Provenance & verification
- Both files created during 2026-06-20 execution of work-order-1781665294730-followup to materially improve legibility of the interaction per operator feedback.
- ASSET_MANIFEST.md (this + the one in assets/) + the jpgs satisfy asset_contract_v2 (file-backed, not manifest alone or procedural).
- Browser verification (chromium) run after asset + code changes; screenshots in this dir/ capture the new assets in idle + resolved state.
- No foundry image gen (Blender-only at http://...18113); used available GenerateImage.

Work Order: work-order-1781665294730-followup
Deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
