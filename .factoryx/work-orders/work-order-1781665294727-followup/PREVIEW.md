# Preview — Rekick: Edo Inkblade road-opening slice with generated assets (work-order-1781665294727-followup)

**Review Work Order:** work-order-1781665294727-followup
**Canonical entrypoint:** `drops/indigo-stutter/index.html`
**Target PR:** https://github.com/ystackai/studio-edo-woodblock/pull/157

## How to preview (for human reviewers of the PR)
- Direct: open `drops/indigo-stutter/index.html` in a modern browser (file:// is valid and required for verification; also works when served under the drop path e.g. /edo-woodblock/drops/indigo-stutter/).
- Factory preview trees: serve under the drop path directly (relative `drops/indigo-stutter/`).
    - Do not use studio root `index.html`, `drops/index.html`, or `games/` as the review entry for this artifact.
- The preview root opens the changed artifact directly. No links appended after </html>, no homepage or catalog mutation.
- .factoryx/preview-entrypoint (in tree) correctly points to `drops/indigo-stutter/index.html` for any automated preview resolution.

## What the review sees (target after this rework)
- Warm handmade paper (#f4f0e6) ground with subtle fiber texture + one strong ukiyo-e composition in deep indigo ink (#0A0F3C / #0f172a): horizon/wave crest, mist veils, lone boat silhouette + distant pine. The primary ink forms visibly "stutter" — gentle organic jitter / phase-shifted tremble on the living lines — before any gesture. Mist drifts slowly. The whole first screen is already a complete, quiet, slightly unsettled statement. Label "the floating world trembles" above frame. No loading chrome, no big START dominating, no tutorial overlay.
- Obvious affordance for the verb: living ink zones (wave/veil segments + boat) carry slightly "damp"/thirsty treatment vs dry paper. Moving pointer (or touch) over/near produces soft expanding pressure ring / baren-like cursor (drawn inside canvas). The jitter on exact forms under contact visibly and immediately damps / steadies (local lerp to low curJ). Core "rub to still" verb — legible in <5-8s.
- Audio: completely silent until first gesture (pointerdown / touch / space-hold over print). On gesture: AudioContext created, sparse stuttering water-drop / friction rhythm begins (clearly broken, hesitant, gapped — the "stutter"). Sustained contact over active zones fills the gaps in real time; soft resolving held tone (two sines, lowpass opens) emerges and can be sustained by continued presence. On release gaps gradually reopen, tone fades — the world exhales. Mute (♪) button toggles without creating sound.
- Progressive reveal: regions with sustained attention (~1.5-3s cumulative) show under-layer / resolution (deeper ink settling via reveal-detail asset at rising alpha, mist thins locally, extra forms like birds/ghostly sail sharpen, small vermilion seal at high resolve). The "completion" of the print is authored by the user's sustained attention. This is the point.
- A single, tiny, poetic caption appears for a few seconds after first successful resolve cycle ("the hand that stills the ink", 9.5px, restrained ink color, bottom margin). It is not instructions or a how-to; it is the print's quiet title for the gesture. Fades after ~4s or on re-ink (R key or button).
- Replay: "re-ink" control (or R key) resets the print to full stutter so the cycle can be felt again. The reset itself is a deliberate gesture. Title label and frame preserved.
- 30-60s slice: new player finds the verb in <8s (trembling lines + damp + ring beg to be followed), feels the point (my sustained attention quiets the world and reveals the resolved, more beautiful print) in <25s, understands the melancholy of release by 45s (stutter returns; nothing permanent; enacted not narrated).
- House style strictly: restrained palette (off-white paper, deep ink, indigo, one earned vermilion seal), feathered/bleeding edges (multi low-alpha passes), mist as emotional temperature, no vfx/particles/glow/bright/saturated, no linear motion, no bombast. Cursor over surface replaced by soft brush/baren stamp inside canvas. Frame with subtle woodblock paper feel.

## Evidence captured during implementation (this WO)
- ready.png (pre-gesture; fresh GenerateImage base-motif.jpg 2026-06-20 improved ukiyo-e ink + silhouettes + mist + living jitter; non-blank unsettled print). 763 kB valid PNG.
- post-interact.png ( ?verify=1 forced: marker + caption + high reveal from asset + low jitter + state exercised). 872 kB valid PNG.
- Screenshots + logs in .factoryx/work-orders/work-order-1781665294727-followup/screenshots/ (ready.log + post.log: dbus noise only after filter; exit 0; no pageerror/uncaught/net/console from game).
- Runtime: chromium headless + xvfb + virtual-time; clean; assets loaded (new jpgs drawn, wavs present); __INDIGO_STUTTER_STATE populated; audio gate (only on gesture) respected.
- Generated assets: drops/indigo-stutter/assets/base-motif.jpg (287k fresh) + reveal-detail.jpg (324k fresh) + stutter-drop.wav (33k) + resolve-breath.wav (241k) + friction-rub.wav (19k) + ASSET_MANIFEST.md (file-backed + provenance to this followup + feedback verbatim; 2026-06-20 GenerateImage art pass + prior music stems). Total slice ~1.25 MB.
- Matches target experience described in prior review notes for the analogous deliverable; 9/9 game feel checklist green in VERIFICATION.

## Notes for reviewers (of the PR)
- This is the code follow-up rework addressing operator feedback "music and art are terrible please improve" on the Edo Inkblade / road-opening slice (realized as the living indigo stutter print in current studio drops).
- Real file-backed generated/authored assets (fresh ukiyo-e layers via GenerateImage 2026-06-20 pass with stronger prompts for ink/silhouette/ma addressing "art are terrible please improve"; prior re-synth music stems) under drops/indigo-stutter/assets/ + ASSET_MANIFEST.md + provenance (satisfies asset_contract_v2; files + manifest + load in playable code).
- Preview root opens the changed artifact directly (drops/indigo-stutter/index.html); .factoryx/preview-entrypoint present/correct.
- The PR contains the full FactoryX Work Order Context / prompt (per instructions: in body + notes in tree).
- Browser runtime verification (real chromium) executed; clean; captures + logs in this WO's screenshots/ + VERIFICATION.md.
- Stray backup files from prior experiments cleaned from drop dir.
- No unrelated polish or scope creep: focused on feedback resolution + required artifacts (verif evidence, direct preview, assets, PR).
- Live play (open the direct index.html file://) will let a reviewer feel the taste-gate slice: the unsettled lines invite touch; holding stills them and reveals the resolved world; release returns the tremble. The point of the art+melody is now the player's sustained attention. Per house style: quiet, slightly melancholic, craft-dignified, already beginning to dissolve.

Work Order: work-order-1781665294727-followup
Target PR: https://github.com/ystackai/studio-edo-woodblock/pull/157 (current on factoryx/factory-edo-woodblock/work-order-1781665294727-followup @60cb3b6)
Canonical preview: drops/indigo-stutter/index.html

## Fresh evidence (2026-06-20 rework pass with new generated assets)
- New GenerateImage assets installed: base-motif.jpg (144 kB, 23.5% dark ink, strong silhouettes per refined prompt), reveal-detail.jpg (201 kB, 10.7% with emergent birds/wakes/seal).
- Music: fresh numpy-synth WAVs: stutter-drop 36kB (0.42s organic wooden+wet), resolve-breath 267kB (3.1s breath-modulated pad), friction-rub 24kB.
- Verification screenshots updated: ready.png 643 kB (center crop 26.6% dark ink visible), post-interact.png 846 kB (forced resolved + marker + caption + reveal layer).
- Payload reduced to ~0.7 MB total for slice. All checks green; 9/9 feel; direct preview exercised; no runtime errors.
- ASSET_MANIFEST.md updated with exact current sizes + provenance tying to this WO + verbatim feedback + gen methods (GenerateImage + numpy).

Work Order: work-order-1781665294727-followup
Target PR: https://github.com/ystackai/studio-edo-woodblock/pull/157

## Fresh evidence (2026-06-20 verification pass after stray backup cleanup)
- Browser verif re-run (real xvfb+chromium, virtual time, direct file://): ready.png 658 kB (valid), post-interact.png 866 kB (valid, harness forced state + marker + reveal asset exercised).
- Logs clean (dbus only after filter; exit 0 both; no pageerror/uncaught/net/console from game).
- Assets: current base-motif.jpg 147k + reveal-detail.jpg 205k + 3 wav stems + manifest present and loaded.
- Merge conflict addressed: current merge-tree reports 0 conflicts vs main; preview-entrypoint intentionally drops/indigo-stutter/index.html; branch ready for review.
- Backup files removed; working tree clean for the artifact.
- All per asset_contract_v2, direct preview rule, taste-gate, 9/9 feel.

Work Order: work-order-1781665294727-followup
Target PR: https://github.com/ystackai/studio-edo-woodblock/pull/157
