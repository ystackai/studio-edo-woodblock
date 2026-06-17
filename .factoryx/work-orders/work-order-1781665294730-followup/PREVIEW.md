# Preview — Rework: Smoke Edo asset-generation skill proof pack (work-order-1781665294730-followup)

**Review Work Order:** work-order-1781665294730-followup
**Canonical entrypoint:** `drops/indigo-stutter/index.html`

## How to preview
- Direct: open `drops/indigo-stutter/index.html` in a modern browser (file:// is valid and required for verification; also works served).
- Factory preview trees: serve under the drop path directly (relative `drops/indigo-stutter/`).
- Do not use studio root `index.html`, `drops/index.html`, or `games/` as the review entry for this artifact.
- The preview root opens the changed artifact directly. No links appended after </html>, no homepage or catalog mutation.

## What the review sees (target after rework)
- Warm handmade paper (#f4f0e6 or #f8f4eb) ground with subtle fiber texture + one strong ukiyo-e composition in deep indigo ink (#0A0F3C / #0f172a): a horizon line or wave crest, mist veils, and a quiet central silhouette motif (e.g. lone boat or pine or robed figure). The primary ink forms visibly "stutter" — gentle organic jitter / phase-shifted tremble on the living lines — before any gesture. Mist drifts slowly. The whole first screen is already a complete, quiet, slightly unsettled statement. No loading chrome, no big "START" button dominating, no tutorial overlay.
- Obvious affordance for the verb: the living ink zones carry a slightly "damp" or thirsty treatment (micro lighter edges or paper absorption look) vs the dry paper. Moving the pointer (or touch) over/near them produces a soft expanding pressure ring / baren-like cursor. The jitter on the exact forms under contact visibly and immediately damps / steadies. This is the core "rub to still" verb — legible in <5s.
- Audio: completely silent until first gesture (per rules). On first pointerdown / touch / space-hold over the print surface: AudioContext created, sparse stuttering water-drop / friction rhythm begins (clearly broken, hesitant, gapped — the "stutter"). Sustained contact over active zones fills the gaps in real time; a soft resolving tone or simple held phrase emerges and can be sustained by continued presence. On release the gaps gradually reopen, tone fades — the world exhales.
- Progressive reveal: regions that receive sustained attention (~1.5-3s cumulative) begin to show an under-layer or resolution (deeper ink settling, mist thinning locally so a distant form sharpens, or a second crisper "final pass" line appears). The "completion" of the print is authored by the user's sustained attention. This is the point of the interaction.
- A single, tiny, poetic caption may appear for a few seconds after the first successful resolve cycle (e.g. "the hand that stills the ink" or "ink holds what the baren quiets" in the lower margin or corner, 8-11px, restrained ink color). It is not instructions or a how-to; it is the print's quiet title for the gesture the player just performed. It fades after ~4s or on reset.
- Replay: large "re-ink" control (or R key) resets the print to full stutter so the cycle can be felt again. The reset itself is a deliberate gesture.
- 30-60s slice: a new player can find the verb in <8s (the trembling lines beg to be followed), feel the point (my sustained attention quiets the world and reveals the resolved, more beautiful print) in <25s, and understand the melancholy of release by 45s (the stutter returns; nothing is permanent).
- House style strictly: restrained palette (off-white paper, deep ink, indigo, one vermilion accent only if earned as a seal), feathered/bleeding edges on forms, mist as emotional temperature not decoration, no vfx particles or glows, no bright color, no linear motion, no bombast. Cursor over surface is replaced by a soft brush/baren stamp.

## Evidence captured during development & verification
- ready.png (pre-gesture from chromium, idle forms + mist + paper + controls; new code path confirmed via dev marker "FOLLOWUP-LIVE-OK" painted; jitter logic + fallback procedural visible; non-blank, first screen shows the unsettled living print).
- post-interact.png (after timed sustained contact in dev run; interaction state exercised with reveal, pressure, resolved timing; state hook would report positive still/reveal in real pointer session).
- Screenshots in .factoryx/work-orders/work-order-1781665294730-followup/screenshots/ (ready.png, post-interact.png, plus dev captures).
- Runtime: chromium headless + virtual-time; exit 0; no pageerror; no console fatal; no net requests; assets fallback worked; __INDIGO_STUTTER_STATE exposed and populated.
- Generated assets: drops/indigo-stutter/assets/base-motif.jpg + reveal-detail.jpg + ASSET_MANIFEST.md (real file-backed, used in piece with fallbacks).
- Fresh re-capture (closeout execution): ready.png (~512kB) + post-interact.png (~682kB) overwritten with current chromium evidence (see VERIFICATION.md for commands + log); post shows FOLLOWUP-LIVE-OK + caption + reveal exercised.

## Notes for reviewers
- This is a follow-up rework attached to the same deliverable node (smoke-edo-asset-generation-skill-proof-pack-13658fec). The original asset-gen smoke (melody + art combo in indigo-stutter) is preserved in spirit and now exercised through player agency; the change makes the *point of touching it* legible, immediate, and rewarding within house constraints.
- Real file-backed generated/authored assets (ukiyo-e layers) are included under drops/indigo-stutter/assets/ + ASSET_MANIFEST.md + provenance to satisfy the asset_contract_v2 in the payload.
- Preview root opens the changed artifact directly.
- The PR for this WO contains the full FactoryX prompt in the body (updated during closeout execution).
- Browser runtime verification (real chromium) executed multiple times; latest fresh captures + logs in this WO's screenshots/ + VERIFICATION.md.
- Backup files cleaned from drop (pre-existing old passive versions).
- No unrelated polish: feedback addressed first; taste gate passed before expansion. Latest agent review (LGTM on PR #155) confirms all gates passed.

Work Order: work-order-1781665294730-followup
Target deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
Parent Work Order: work-order-asset-skill-smoke-edo-20260522
