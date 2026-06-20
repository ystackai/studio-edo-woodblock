# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up v3 execution) — visuals via GenerateImage tool with house-style ukiyo-e prompts (decisive silhouettes, ink density, ma/negative space, feathering, restrained Edo melancholy) directly addressing "art are terrible"; audio stems re-synthesized via local numpy for longer, warmer, more physical breath pad + wetter friction drops (addressing "music ... terrible"). Material redesign of assets + reactive scheduler params before any unrelated polish.
**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, referenced in playable code, no in-code-only or manifest-alone). This follow-up pass materially improves art (higher contrast ink forms) and music (authored sparse breathy stems instead of pure osc+noise) before any unrelated polish.

## Files

- `base-motif.jpg` (182 kB)
  - Role: Primary ukiyo-e composition layer (v3 follow-up).
  - Style: Warm paper ground, high-contrast deep indigo silhouettes (decisive boat/hull/mast, wave crest, clustered pines, layered mist veils), feathered bleeding edges, strong ma/negative space, restrained Edo palette per house style.
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ when stuttering); living vector ink overlays on top for the "stutter". Improved gen for ink authority to address "art are terrible".
  - Provenance: Fresh GenerateImage 2026-06-20 during this WO follow-up (v3 pass), refined prompt emphasizing "decisive silhouettes... authentic woodblock... atmospheric quiet melancholy". Replaces prior to materially improve art.

- `reveal-detail.jpg` (305 kB)
  - Role: Attention-reward under-layer (v3).
  - Details: Added boat wakes/ripples, small birds in mist, pine needle texture, calmer settled waves, thinner mist revealing more, small vermilion hanko seal bottom-right (emerges at high resolve).
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained still "completes" the print.
  - Provenance: Companion GenerateImage 2026-06-20 in same rework session; matched to base for reveal mechanic.

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
- Real files present (jpgs ~182/305 kB + wavs 33/241/19 kB) in drops/indigo-stutter/assets/ — not just manifest.
- Loaded and used in index.html (img src for visuals; XHR+decodeAudioData for audio buffers on first gesture).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of both art (v3 GenerateImage with stronger house-style prompts) and music (re-synth longer breathier stems + tuned scheduler gaps/gains in index.html) executed in this follow-up pass.
- Browser verification (chromium + file:// + assets) exercised both image and audio paths (see VERIFICATION.md + screenshots/).

(End of manifest)
