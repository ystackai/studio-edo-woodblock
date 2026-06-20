# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up execution) — visuals via GenerateImage tool (this pass) with refined house-style ukiyo-e prompts for stronger ink authority, decisive silhouettes, authentic feathering and ma to directly address "art are terrible please improve". Audio stems from prior re-synth retained (sparse, gesture-reactive, physical). Material redesign of visual assets in follow-up before unrelated polish.
**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, referenced in playable code, no in-code-only or manifest-alone). This follow-up pass materially improves art (higher contrast ink forms) and music (authored sparse breathy stems instead of pure osc+noise) before any unrelated polish.

## Files

- `base-motif.jpg` (287 kB)
  - Role: Primary ukiyo-e composition layer (v3 follow-up).
  - Style: Warm paper ground, high-contrast deep indigo silhouettes (decisive boat/hull/mast, wave crest, clustered pines, layered mist veils), feathered bleeding edges, strong ma/negative space, restrained Edo palette per house style.
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ when stuttering); living vector ink overlays on top for the "stutter". Improved gen for ink authority to address "art are terrible".
  - Provenance: GenerateImage 2026-06-20 follow-up pass with refined prompt ("authentic Edo ukiyo-e woodblock... strong decisive silhouettes, feathered bleeding edges, generous ma, restrained melancholic... high ink density") directly addressing operator "art are terrible". Replaces previous to materially improve art quality.

- `reveal-detail.jpg` (324 kB)
  - Role: Attention-reward under-layer (v3).
  - Details: Added boat wakes/ripples, small birds in mist, pine needle texture, calmer settled waves, thinner mist revealing more, small vermilion hanko seal bottom-right (emerges at high resolve).
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained still "completes" the print.
  - Provenance: Companion GenerateImage 2026-06-20 in follow-up (refined prompt for reveal details: boat wakes, birds, vermilion seal, thinner mist); matched to new base for attention-reveal mechanic.

- `stutter-drop.wav` (33 kB)
  - Role: Primary "stutter" percussion — short wet wooden friction/drop + tail (~380ms).
  - Usage: Played via BufferSource in scheduleStutter (rate detuned 0.93-1.09); lp/gain modulated by stillness; wider hesitant gaps when trembling.
  - Provenance: Re-synthesized 2026-06-20 with numpy (physical ink/woodblock character, less digital); file-backed for material music change.

- `resolve-breath.wav` (241 kB)
  - Role: Sustained low atmospheric "breath" pad (~2.8s seamless loop) with soft harmonics + airy texture.
  - Usage: Looped BufferSource started when still >0.14; lowpass freq + gain open strongly with lastStill; provides resolving held tone and emotional ma. Fades on release.
  - Provenance: Re-synthesized 2026-06-20 longer/warmer for music redesign; file asset.

- `friction-rub.wav` (19 kB)
  - Role: Short textured rub / baren press accent.
  - Usage: Occasional overlays (prob ~0.09) while pressing + still; rate variance.
  - Provenance: Re-synthesized 2026-06-20; tactile contact response.

## Notes
- All assets self-contained relative to drops/indigo-stutter/index.html (assets/*).
- Visuals: base always drawn (with micro-jitter when stuttering); reveal at progressive alpha; vector ink forms + mist + fibers + pressure ring always available (fallback if jpg decode fails).
- Audio: XHR + decodeAudioData on first gesture (no autoplay); full file-backed when present, graceful inline noise fallback otherwise. Mute affects master without forcing loads. Reset stops breath src.
- Total slice payload (index.html + 2 jpg + 3 wav + manifest) ~ 1.0 MB — under 2 MB gate. Purposeful compressed art+audio for the concept.
- License / usage: Studio internal; ephemeral digital ukiyo-e for FactoryX review; not for redistribution.

## Verification of contract
- Real files present (jpgs ~287/324 kB + wavs 33/241/19 kB) in drops/indigo-stutter/assets/ — not just manifest. (fresh GenerateImage pass for art improvement this session)
- Loaded and used in index.html (img src for visuals; XHR+decodeAudioData for audio buffers on first gesture).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of visual assets (fresh GenerateImage with stronger prompts for ink, silhouette, feathering, ma) executed in follow-up to address art feedback; audio file stems + reactive code retained as sparse gesture-tied redesign.
- Browser verification (chromium + file:// + assets) exercised image paths with new assets (see VERIFICATION.md + screenshots/).

(End of manifest)
