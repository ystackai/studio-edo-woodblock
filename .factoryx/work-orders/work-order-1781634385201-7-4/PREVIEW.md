# Preview — Rekick: Edo Inkblade road-opening slice with generated assets (work-order-1781634385201-7-4)

**Review Work Order:** work-order-1781634385201-7-4
**Canonical entrypoint:** `games/inkblade/index.html`

## How to preview
- Direct: open `games/inkblade/index.html` in a modern browser (file:// is valid and required for verification).
- Factory preview trees: serve under the path directly (relative `games/inkblade/` or the index.html).
- Do not use studio root `index.html`, `drops/index.html`, or `games/index.html` as the review entry for this artifact. (The games/ redirect is left untouched; this WO does not perform homepage or catalog work.)
- Relative link for copied trees: `games/inkblade/index.html`

## What the review sees (target after rework)
- Warm paper (#f8f4eb) ground with subtle fiber. A single strong ukiyo-e composition: receding mountain road in decisive ink (#0f172a), layered drifting mist (#0A0F3C low alpha), faint horizon, a small robed traveler silhouette waiting at the near end.
- The road is visibly blocked by a bold horizontal ward (cross-bar + ofuda seal) rendered as the only "living" element — its ink lines carry a subtle organic jitter/stutter; the strokes have a slightly damp/thirsty treatment that invites touch.
- First screen is already a complete quiet statement — no loading screen, no big chrome, no "how to play" overlay, no health or timers. The unsettled ward against the settled road + mist makes the viewer lean in.
- Obvious affordance for the verb: when the pointer enters the generous active zone around the ward, the cursor becomes a short slanted inkblade/brush. Contact produces immediate local response — the contacted segment thins, short feathered ink lifts appear, the jitter damps under the blade.
- Progressive opening: sustained carving (hold + slow drag or Space hold) drains the ward's resistance. At ~35% the road continuation beyond the ward begins to resolve (lighter ink lines strengthen, stepping or open space appears). At ~85% the ward visibly parts (leaves separate or the ofuda splits), mist thins in the center band, the traveler advances a step or two.
- Audio (silent until first gesture per rules): on first pointer/keydown over surface a WebAudio context wakes; carving produces sparse physical brush-scrape grains; a low woody resolve tone emerges and can be held by continued presence; a single soft wood+paper "open" event fires once when the threshold is crossed. Releasing lets the tone hesitate and the ward breathe back a little.
- A single tiny poetic caption may appear for a few seconds after first meaningful progress: something like "the blade that parts the ward for a moment" in the margin — not instructions, the print's own caption (Sei Shonagon voice).
- Replay: R key (or a minimal large "re-ink" control if added) resets the ward to full resistance + stutter so the cycle can be felt again; the melancholy of the closing is part of the piece.
- 30-60s slice: a new player can find the verb in <8s (the jittering ward + blade cursor), feel the point (my sustained carving opens the road) in <25s, and understand the fragility of the opening by 45s.
- House style strictly: restrained palette (off-white paper, deep ink, indigo, one vermilion accent only if earned as a seal), feathered edges, mist as atmosphere not decoration, no vfx particles, no bright color, no linear motion, no game UI.

## Evidence captured during development & verification
- (To be filled post chromium runs): ready.png (pre-gesture, ward stutter alive, full road + mist + traveler + paper tone clear, no blank or low contrast).
- opened-*.png (post sustained carve, ward parted or split, road continuation strong and connected, traveler advanced, mist locally thinner, caption if present, audio state resolved).
- Any console or runtime notes from harness (must be clean).

## Notes for reviewers
- This is a follow-up rework attached to the same deliverable node (rekick of the road-opening slice). The original "with generated assets" intent is kept; the change makes the art, the music, and the "why my action matters" legible and worth attention within the house constraints.
- Preview root opens the changed artifact directly. No links appended after </html>, no homepage or drops catalog mutation.
- The PR for this WO will contain the full FactoryX prompt in the body (per GitHub Work Order Branch Model).
- Browser runtime verification (real chromium) is required and will be evidenced here + in VERIFICATION.md before human review is appropriate.
- Total payload self-contained and light; works offline after load.

Work Order: work-order-1781634385201-7-4
Target deliverable: rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a
