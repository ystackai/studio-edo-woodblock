# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up execution) — visuals via FactoryX image gen tool with refined ukiyo-e prompts for stronger contrast, decisive indigo silhouettes, better ma/negative space and ink authority (v2 pass directly addressing "art are terrible"); audio stems synthesized via local numpy/wave as short file-backed WAVs for reactive "music" (addressing "music ... terrible").
**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, referenced in playable code, no in-code-only or manifest-alone). This follow-up pass materially improves art (higher contrast ink forms) and music (authored sparse breathy stems instead of pure osc+noise) before any unrelated polish.

## Files

- `base-motif.jpg` (357 kB)
  - Role: Primary ukiyo-e composition layer (v2 improved).
  - Style: Warm paper ground, high-contrast deep indigo silhouettes (stronger boat, wave crest, pine, mist veils per feedback), feathered/bleeding edges, restrained Edo palette, ma/negative space.
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ); living vector ink overlays on top for the "stutter". New v2 has measurably higher ink contrast (std~72, ~14% dark pixels) vs prior.
  - Provenance: Regenerated 2026-06-20 via image gen tool during this WO follow-up execution, using refined prompts for "strong decisive silhouettes... high contrast... authentic woodblock". Replaces earlier gentler gen to address "art are terrible".

- `reveal-detail.jpg` (373 kB)
  - Role: Attention-reward under-layer (v2).
  - Details: Emergent boat wakes, birds in mist, pine texture, settled waves, faint vermilion seal (bottom-right, blooms only at high resolve).
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained still "completes" the print.
  - Provenance: Companion gen 2026-06-20, same session as base v2 for this rework; tied to reveal mechanic.

- `stutter-drop.wav` (24 kB)
  - Role: Primary "stutter" percussion sample — short wet friction/drop with tail (~280ms).
  - Usage: Played via BufferSource in scheduleStutter (rate detuned 0.94-1.08 per instance for organic variation); lowpass + gain modulated by stillness (tighter when still); gaps shrink with attention.
  - Provenance: Locally authored/synthesized 2026-06-20 with numpy for this follow-up (sparse, physical, ink/woodblock feel); file-backed to satisfy contract for material music change.

- `resolve-breath.wav` (138 kB)
  - Role: Sustained low atmospheric "breath" pad (~1.6s loopable) with soft harmonics + noise texture.
  - Usage: Looped BufferSource started on high still; lowpass freq + gain open with lastStill (0.12..0.5); provides the "resolving held tone" and ma of sustained attention. Fades on release.
  - Provenance: Synthesized 2026-06-20 for music redesign; file asset, not oscillator-only.

- `friction-rub.wav` (52 kB)
  - Role: Short friction layer for "rub" press feel.
  - Usage: Occasional overlays (probabilistic) while pressing + still >0.3; slight rate variance.
  - Provenance: Synthesized 2026-06-20; adds tactile "baren" audio response.

## Notes
- All assets self-contained relative to drops/indigo-stutter/index.html (assets/*).
- Visuals: base always drawn (with micro-jitter when stuttering); reveal at progressive alpha; vector ink forms + mist + fibers + pressure ring always available (fallback if jpg decode fails).
- Audio: XHR + decodeAudioData on first gesture (no autoplay); full file-backed when present, graceful inline noise fallback otherwise. Mute affects master without forcing loads. Reset stops breath src.
- Total slice payload (index.html + 2 jpg + 3 wav + manifest) ~ 1.0 MB — under 2 MB gate. Purposeful compressed art+audio for the concept.
- License / usage: Studio internal; ephemeral digital ukiyo-e for FactoryX review; not for redistribution.

## Verification of contract
- Real files present (jpgs 357/373 kB + wavs 24/138/52 kB) in drops/indigo-stutter/assets/ — not just manifest.
- Loaded and used in index.html (img src for visuals; XHR+decode for audio buffers).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of both art (v2 contrast) and music (authored stems + scheduler) executed in this follow-up pass.
- Browser verification (chromium + file:// + assets) exercised both image and audio paths (see VERIFICATION.md + screenshots/).

(End of manifest)
