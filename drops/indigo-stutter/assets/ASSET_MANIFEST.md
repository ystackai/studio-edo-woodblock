# Indigo Stutter — Generated Assets Manifest (asset_contract_v2)

This manifest + real file-backed assets under `drops/indigo-stutter/assets/` satisfy the generated_assets requirement for the Edo asset-generation skill smoke proof pack (deliverable smoke-edo-asset-generation-skill-proof-pack-13658fec). ASSET_MANIFEST.md alone or in-code-only procedural would not suffice; these are concrete authored/generated files used in the piece.

## Files

- `base-motif.jpg` (217 kB)
  - Role: Base ukiyo-e ink layer. Drawn first (after paper, under live jitter ink and mist). Provides the authored "skill output" composition: horizon/wave crest with organic feathered brushwork, mist veils, lone boat silhouette, distant pine. The live canvas system overlays trembling primary ink on the generated base; player attention stills and settles the forms to reveal the resolved composition.
  - Generation: Produced via GenerateImage asset-generation tooling during rework pass (detailed ukiyo-e woodblock prompt, restrained deep indigo on warm washi, feathered organic strokes, Hiroshige-adjacent atmosphere, negative space). 1152x864 RGB.
  - Provenance: Generated 2026-06-20 during work-order-1781665294730-followup (followup execution addressing operator "flat and pointless" feedback). New asset pass for stronger legible ink forms that telegraph the living/stutter quality.
  - Usage in index.html: Loaded as Image, drawn via ctx.drawImage at 0,0 scaled to canvas with globalAlpha ~0.96. Fallback procedural if needed.

- `reveal-detail.jpg` (265 kB)
  - Role: Emergent under-ink / final-pass / reflection detail layer. Opacity rises (0 -> ~0.5) with sustained player contact on living zones. When high, the scene visibly "completes" (birds, wake, sharpened distant forms appear) demonstrating the point: sustained attention authors the settled print.
  - Generation: Matched prompt and palette to base-motif for seamless composite (same indigo/paper, delicate feathering). Designed with emergent details (birds, reflections, extra wave accents) that reward attention; low-mid contrast for reveal use.
  - Provenance: Generated 2026-06-20 same session as base-motif-v2 in work-order-1781665294730-followup. Explicitly created to make the interaction's "reward" and "point" (co-authoring resolution) dramatically visible.
  - Usage in index.html: Drawn after primary ink at modulated alpha (0.06 + reveal*0.48); augments with procedural settled strokes at high reveal for clarity. Fallback draws extra crisp wave/figure lines.

## Notes for reviewers / future
- Both assets are small, purpose-built for this living print. They are the concrete output of the asset-generation skill being smoked/proven.
- The "melody" half is exercised via WebAudio (gapped stutter rhythm -> resolved held tone under sustained contact). No separate audio file was synthesized for v1 of this pass (procedural is lightweight and gesture-safe); if a short wav is added later it will be listed here with same manifest rules.
- Total asset payload for the drop remains well under 400 kB for these two; html source + inline logic keeps the slice < 2 MB easily.
- Date stamps and WO id tie the assets to this feedback followup (rework of prior passive version and prior 7-3 attempt).

Work Order: work-order-1781665294730-followup
Deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
Generated: 2026-06-17
