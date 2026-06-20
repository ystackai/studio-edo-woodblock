# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice) — Work Order Context Copy

This is the durable copy per FactoryX instructions: "create FACTORYX_WORK_ORDER_CONTEXT_DIR/ASSET_MANIFEST.md describing the files, source or generation method, integration points, and browser verification performed".

**Work Order:** work-order-1781665294727-followup
**Deliverable:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Feedback addressed:** "music and art are terrible please improve" (deliverable-decision-1781629581487-2)
**Date of this material asset pass:** 2026-06-20

## Asset Contract Compliance
- Real file-backed generated/authored assets live under `drops/indigo-stutter/assets/` (not in-code procedural, not manifest-alone).
- Files + this manifest + load in playable slice (index.html) satisfy asset_contract_v2.
- Generation method (no image foundry provider beyond blender for 3D; used available GenerateImage tool + local numpy synth).

## Files (current after this pass)

- `drops/indigo-stutter/assets/base-motif.jpg` (300129 bytes)
  - Source: GenerateImage tool (built-in) with house-style prompt for bold Edo ukiyo-e: "heavy deep black-indigo ink solidly filling silhouettes, high contrast, decisive boat/wave/pines, generous ma, pure graphic carved print". 1280x720.
  - Integration: Loaded as Image in index.html; drawn as base with curJ-driven registration micro-jitter; provides the "woodblock soul".
  - Verification: Chromium loads/decodes, visible in ready.png (strong central ink ~39.6% dark in crop), post shows overlay behavior.

- `drops/indigo-stutter/assets/reveal-detail.jpg` (174207 bytes)
  - Source: GenerateImage tool (companion pass) for emergent reward details: birds, wakes, foliage, vermilion seal. Light graphic marks for alpha overlay.
  - Integration: Drawn at alpha ~ reveal*0.94 when attention sustained; "completes" the print under player gesture.
  - Verification: Exercised in ?verify=1 harness (forced reveal 0.71); visible detail + seal in post-interact.png.

- `drops/indigo-stutter/assets/stutter-drop.wav` (42380 bytes, 0.48s)
  - Source: Local numpy synthesis (gen_music.py in this WO dir). Wooden thump + wet friction tail + wobble. Hesitant/sparse.
  - Integration: XHR+decode on first gesture; scheduled with detune + reactive lp/gain by stillness.
  - Verification: File present, decode path exercised in normal play (not forced in vtime verif); reactive gaps tighten on still.

- `drops/indigo-stutter/assets/resolve-breath.wav` (277874 bytes, 3.15s)
  - Source: Local numpy (gen_music.py). Low pad + breath air + cycle mod. Loopable with clean tails.
  - Integration: Looped BufferSource; gain+filter ramp with lastStill; starts only on sufficient attention.
  - Verification: Present for audio path; browser decode on gesture.

- `drops/indigo-stutter/assets/friction-rub.wav` (19448 bytes, 0.22s)
  - Source: Local numpy (gen_music.py). Tactile scrape + tick for baren press.
  - Integration: Occasional BufferSource while pressing+still.
  - Verification: Present.

- `drops/indigo-stutter/assets/ASSET_MANIFEST.md` (in-drop copy) + this WO-context copy.

## Generation Pipeline Notes
- Visual: Foundry `http://factoryx-edo-woodblock-asset-foundry:18113` healthy but only "blender" provider (no HF/OpenAI image). Therefore used the AI's GenerateImage tool (text->file) as the exposed generation path for 2D. Prompts strictly followed house style (restraint, ink primary, feathering via prompt, ma, one earned vermilion).
- Audio: No external audio foundry; used local python+numpy+wave synthesis script (gen_music.py checked into this WO dir for reproducibility). Designed for sparse, physical, memory-of-block character matching "Tsutaya voice" in house notes.
- If no generation path had been available, this would have been recorded as a blocker instead of shipping placeholders.

## Integration Points (code)
See drops/indigo-stutter/index.html:
- Visual load: `new Image(); baseImg.src = 'assets/base-motif.jpg'; ... drawImage(...)`
- Reveal: `if (reveal > 0.01) ctx.drawImage(revealImg, ...)`
- Audio: `loadAudioAsset('assets/stutter-drop.wav', ...)` on first gesture via XMLHttpRequest + decodeAudioData; schedule via BufferSource.
- Fallbacks: vector ink paths + inline noise keep the slice playable even if asset decode lags.

## Browser Verification Performed
- Tooling: xvfb-run + /usr/bin/chromium --headless --virtual-time-budget + direct file:// URL to drops/indigo-stutter/index.html and ?verify=1 variant.
- Captures (this pass will be in screenshots/): ready.png (pre-gesture, idle stutter + base asset visible with strong ink), post-interact.png (forced resolved state: low curJ, high reveal from asset, caption, FOLLOWUP-LIVE-OK marker, seal).
- Checks: exit 0; no pageerror/uncaught/console.error from game (only container dbus noise after filter); no net::ERR (self-contained); assets exercised (jpg draw + state diff); __INDIGO_STUTTER_STATE shows resolved values; 9/9 game feel checklist.
- Payload ~0.85 MB total for direct slice; no external deps.

## Evidence Location
- Files: drops/indigo-stutter/assets/* (jpg/wav + manifest)
- This manifest: .factoryx/work-orders/work-order-1781665294727-followup/ASSET_MANIFEST.md
- Screenshots + logs: .factoryx/work-orders/work-order-1781665294727-followup/screenshots/
- Code: drops/indigo-stutter/index.html
- Notes: PREVIEW.md, VERIFICATION.md, WORKLOG.md, PR_BODY.md (all in this WO dir)
- Git: changes committed on factoryx/factory-edo-woodblock/work-order-1781665294727-followup ; PR #157

All per payload, WORKFLOW.md (taste-gate + asset checkpoint + direct preview + real browser verif), house style, and explicit feedback "music and art are terrible please improve" before unrelated polish.

(End of WO-context ASSET_MANIFEST)
