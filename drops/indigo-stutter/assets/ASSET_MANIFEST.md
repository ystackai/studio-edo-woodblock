# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up execution) — fresh visuals via GenerateImage tool with refined house-style ukiyo-e prompts emphasizing bold ink authority, decisive silhouettes, authentic feathering, generous ma/negative space, and graphic woodblock character (not photographic). Audio stems freshly re-synthesized via numpy with physical resonance, wet friction, and breath-cycle modulation to directly address "music and art are terrible please improve". Material redesign of both visual + audio assets before any unrelated polish. Real files under drops/.../assets/.

**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, loaded by playable code, no in-code-only or manifest-alone). This pass materially improves art (stronger ink presence + better graphic forms) and music (less synthetic, more organic hesitant/breathy physical character) per operator feedback.

## Files

- `base-motif.jpg` (144 kB)
  - Role: Primary ukiyo-e composition layer (fresh 2026-06-20 pass).
  - Style: Warm paper ground, high-contrast deep indigo ink with strong decisive silhouettes (boat/hull/mast, wave crest, clustered pines, layered mist veils), feathered bleeding edges, generous ma/negative space, restrained Edo palette. High ink density / authority.
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ); living vector ink overlays on top for the "stutter" tremble. The generated asset provides the soul; code adds the living responsive quality.
  - Provenance: GenerateImage 2026-06-20 follow-up pass with prompt tuned for "bold authentic Edo ukiyo-e woodblock print, heavy deep black-indigo ink solidly filling silhouettes... high contrast, large solid ink areas, decisive... generous ma... pure graphic carved print look" directly addressing "art are terrible please improve".

- `reveal-detail.jpg` (201 kB)
  - Role: Attention-reward under-layer (fresh 2026-06-20 pass).
  - Details: Added crisp birds in mist, wake ripples, pine foliage line work, vermilion hanko seal (bottom-right). Details have enough contrast to emerge when blended.
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained attention "completes" the print.
  - Provenance: Companion GenerateImage 2026-06-20 (prompt for emergent details that reward stilling: birds, wakes, seal, foliage). Matched composition to base.

- `stutter-drop.wav` (36 kB)
  - Role: Primary "stutter" percussion — short wooden impact + wet friction tail (~420ms).
  - Usage: Played via BufferSource in scheduleStutter; playbackRate detuned 0.93-1.09 for organic; lp/gain modulated by stillness; wider hesitant gaps when world trembles.
  - Provenance: Fresh numpy synthesis 2026-06-20 (body resonance + shaped noise burst + slow wobble); physical/hesitant character for music redesign addressing feedback.

- `resolve-breath.wav` (267 kB)
  - Role: Sustained low atmospheric "breath" pad (~3.1s loop) with soft harmonics + airy texture and natural breath-cycle amplitude.
  - Usage: Looped BufferSource; lowpass + gain open with lastStill; starts on sufficient stillness. Fades on release. Provides resolving held tone and emotional ma.
  - Provenance: Fresh numpy synthesis 2026-06-20 (layered low fundamentals + modulated air noise); warmer, breathier, less "digital" than prior.

- `friction-rub.wav` (24 kB)
  - Role: Short textured rub / baren press accent with woody tick.
  - Usage: Occasional overlays (prob ~0.09) while pressing + still; rate variance for tactility.
  - Provenance: Fresh numpy synthesis 2026-06-20; tactile contact response.

## Notes
- All assets self-contained relative to drops/indigo-stutter/index.html (assets/*).
- Visuals: base always drawn (with micro-jitter when stuttering); reveal at progressive alpha; vector ink forms + mist + fibers + pressure ring always available (fallback if jpg decode fails).
- Audio: XHR + decodeAudioData on first gesture (no autoplay); full file-backed when present, graceful inline noise fallback otherwise. Mute affects master without forcing loads. Reset stops breath src.
- Total slice payload (index.html ~26kB + 2 jpg ~345kB + 3 wav ~327kB + manifest ~5k) ~ 0.7 MB — well under 2 MB gate. Purposeful art+audio assets for the concept.
- License / usage: Studio internal; ephemeral digital ukiyo-e for FactoryX review; not for redistribution.

## Verification of contract
- Real files present (jpgs 144/201 kB + wavs 36/267/24 kB) in drops/indigo-stutter/assets/ — not just manifest. Fresh GenerateImage + numpy synth in this session.
- Loaded and used in index.html (img src for visuals; XHR+decodeAudioData for audio buffers on first gesture).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of visual assets (fresh GenerateImage with stronger ink/silhouette/ma prompts) + audio stems executed in follow-up to address feedback; interaction and house style preserved.
- Browser verification (chromium + file:// + assets) exercised image + audio paths with new assets (see VERIFICATION.md + screenshots/).

(End of manifest)
