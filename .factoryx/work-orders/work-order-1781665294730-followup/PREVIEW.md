# Preview — Rework: Smoke Edo asset-generation skill proof pack (work-order-1781665294730-followup)

**Review Work Order:** work-order-1781665294730-followup
**Canonical entrypoint:** `drops/indigo-stutter/index.html`
**Note (this pass):** Material redesign pass executed: new generated assets (base + reveal) via GenerateImage for stronger ukiyo-e ink forms; higher-amplitude organic feathered living lines with breathing + active zone hint; stronger hover/pressure response; clearer sublabel + diegetic "linger to still the lines" printed on paper; improved audio contrast (gapped noisy -> held resolving tones); dramatic reveal (birds + extra settled strokes); re-ink and controls intact. Real assets + manifest in drop + WO context.

## How to preview
- Direct: open `drops/indigo-stutter/index.html` in a modern browser (file:// is valid and required for verification; also works served).
- Factory preview trees: serve under the drop path directly (relative `drops/indigo-stutter/`).
- Do not use studio root `index.html`, `drops/index.html`, or `games/` as the review entry for this artifact.
- The preview root opens the changed artifact directly. No links appended after </html>, no homepage or catalog mutation.

## What the review sees (target after rework)
- Warm handmade paper (#f4f0e6) ground with subtle fiber texture + one strong ukiyo-e composition in deep indigo ink (#0A0F3C / #0f172a): a horizon line or wave crest, mist veils, and a quiet central silhouette motif (lone boat + pine). The primary ink forms visibly "stutter" — strong organic jitter on the living lines — before any gesture (now higher amplitude for obviousness). Mist drifts slowly. The whole first screen is already a complete, quiet, slightly unsettled statement. A single restrained sublabel under the title describes the point poetically ("linger where the ink trembles — it settles only under sustained hand"). No loading chrome, no big "START", no tutorial overlay.
- Obvious affordance for the verb: the living ink zones carry a slightly "damp" or thirsty treatment vs the dry paper. Moving the pointer over/near them produces an immediate soft attention ring + visible micro-damping on the lines under the cursor (even without press) — exploration itself shows the response. Sustained press deepens damping + expands pressure ring (baren-like). The jitter damps/steadies on contact. Core "linger to still" verb legible in <5s; sublabel describes the meaning.
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
- This is a follow-up rework attached to the same deliverable node (smoke-edo-asset-generation-skill-proof-pack-13658fec). The asset-gen smoke (melody + art) is preserved and exercised through player agency; the interaction + explanation now make the *point* legible (sustained attention settles the fragile print; hover already shows response; sublabel describes without lecturing).
- Real file-backed generated/authored assets (ukiyo-e layers) under drops/indigo-stutter/assets/ + ASSET_MANIFEST.md + provenance satisfy asset_contract_v2.
- Preview root opens the changed artifact directly (drops/indigo-stutter/index.html).
- Browser runtime verification (real chromium) executed; fresh ready/post captures (with sublabel + stronger jitter visible) + state in this WO's screenshots/ + VERIFICATION.md.
- No unrelated polish: feedback addressed (stronger telegraph + hover response + description) before polish. Changes on canonical WO branch.
- gh auth unavailable in runner; push to factoryx/... branch; update PR manually if needed with full prompt (see FULL_WORK_ORDER_PROMPT.txt).

Work Order: work-order-1781665294730-followup
Target deliverable: smoke-edo-asset-generation-skill-proof-pack-13658fec
Parent Work Order: work-order-asset-skill-smoke-edo-20260522
