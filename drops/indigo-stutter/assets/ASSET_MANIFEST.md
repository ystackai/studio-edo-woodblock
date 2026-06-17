# Indigo Stutter — Generated Assets Manifest (asset_contract_v2)

This manifest + real file-backed assets under `drops/indigo-stutter/assets/` satisfy the generated_assets requirement for the Edo asset-generation skill smoke proof pack (deliverable smoke-edo-asset-generation-skill-proof-pack-13658fec). ASSET_MANIFEST.md alone or in-code-only procedural would not suffice; these are concrete authored/generated files used in the piece.

## Files

- `base-motif.jpg` (165 kB)
  - Role: Base ukiyo-e ink layer. Drawn first (after paper, under live jitter ink and mist). Provides the authored "skill output" composition: horizon/wave crest, mist veils, lone boat silhouette, distant pine. The live canvas system (stutter jitter on key lines + pressure response + reveal) lets the player "finish" this generated print.
  - Generation: Produced via asset-generation tooling for this rework (ukiyo-e woodblock print style prompt, restrained indigo on warm paper, feathered silhouettes, negative space, Hiroshige-adjacent atmosphere).
  - Provenance: Generated 2026-06-17 during work-order-1781665294730-followup implementation pass. Part of explicit feedback-driven redesign to make the art+melody interaction legible and player-authored.
  - Usage in index.html: Loaded as Image, drawn via ctx.drawImage at 0,0 scaled to canvas logical size with globalAlpha ~0.95. Fallback: if load fails or slow, equivalent procedural horizon + boat + mist paths are drawn instead (ensures first paint and offline always work).

- `reveal-detail.jpg` (207 kB)
  - Role: Subtle under-ink / reflection / final-pass detail layer. Increases in opacity (0 -> 0.35-0.55) only in regions that have received sustained player attention (local reveal progress or global stillness driven). Represents the "settled" or "completed" state the player's baren/breath co-authors.
  - Generation: Matched prompt to base-motif for seamless compositing (same palette, feathering, minimal forms: boat wake, small bird/sail in mist, additional settled strokes). Low inherent contrast so it reads as emergent rather than overlaid.
  - Provenance: Generated 2026-06-17 during work-order-1781665294730-followup. Same session and intent as base-motif.
  - Usage in index.html: Loaded as second Image, drawn after base and primary jitter ink, clipped or alpha-modulated per attended zone (simple globalStillness * 0.4 or per-zone accumulator mask for the taste-gate slice). Fallback: skip or draw faint additional procedural strokes if image unavailable.

## Notes for reviewers / future
- Both assets are small, purpose-built for this living print. They are the concrete output of the asset-generation skill being smoked/proven.
- The "melody" half is exercised via WebAudio (gapped stutter rhythm -> resolved held tone under sustained contact). No separate audio file was synthesized for v1 of this pass (procedural is lightweight and gesture-safe); if a short wav is added later it will be listed here with same manifest rules.
- Total asset payload for the drop remains well under 400 kB for these two; html source + inline logic keeps the slice < 2 MB easily.
- Date stamps and WO id tie the assets to this feedback followup (rework of prior passive version and prior 7-3 attempt).

Work Order: work-order-1781665294730-followup
Deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
Generated: 2026-06-17
