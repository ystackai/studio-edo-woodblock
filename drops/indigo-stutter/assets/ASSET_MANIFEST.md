# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up execution pass) — fresh visuals via GenerateImage tool with refined prompts for bold ink authority, decisive boat/wave/pine silhouettes, feathered bleeding edges, generous ma, graphic woodblock character (not photo). Stronger central ink density (center-crop ~39.6% dark <60L) vs prior lighter passes. Audio stems freshly re-synthesized via numpy (gen_music.py) with wooden body resonance, wet friction tails, hesitant wobble, and breath-modulated low pad to directly address verbatim operator feedback "music and art are terrible please improve". Material redesign of visual + audio assets (real files) before any unrelated polish. Real files under drops/indigo-stutter/assets/.

**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, loaded by playable code, no in-code-only procedural or manifest-alone). This pass materially improves art (stronger ink presence, better graphic forms, high contrast central subjects) and music (more organic, physical, hesitant/breathy character, sparse reactive) per feedback.

## Files

- `base-motif.jpg` (300 kB)
  - Role: Primary ukiyo-e composition layer (fresh 2026-06-20 GenerateImage pass).
  - Style: Warm paper ground (#f4f0e6), high-contrast deep indigo ink (#0A0F3C) with strong decisive silhouettes (boat/hull/mast left-center, pronounced wave crest foreground, clustered pines right, layered mist veils), feathered bleeding edges, generous ma/negative space, restrained Edo palette. High ink density/authority (center dark ~39.6%).
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ when stuttering); living vector ink overlays on top for the "stutter" tremble. The generated asset provides the carved woodblock soul; code adds the living responsive quality.
  - Provenance: GenerateImage tool 2026-06-20 follow-up with prompt tuned for "bold authentic Edo ukiyo-e woodblock print, heavy deep black-indigo ink solidly filling silhouettes... high contrast, large solid ink areas, decisive... generous ma... pure graphic carved print look" directly addressing "art are terrible please improve". Center crop stats confirm ink authority.

- `reveal-detail.jpg` (174 kB)
  - Role: Attention-reward under-layer (fresh 2026-06-20 GenerateImage pass).
  - Details: Emergent delicate marks (birds in mist, wake ripples, pine foliage linework, small vermilion hanko seal bottom-right). Light enough for low-alpha blend; high-contrast fine lines emerge with sustained attention.
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained attention "completes" the print (mono no aware).
  - Provenance: Companion GenerateImage 2026-06-20 (prompt for reward details: birds, wakes, seal, foliage; matched composition/alignment to base). Light graphic marks for overlay.

- `stutter-drop.wav` (42 kB, 0.48s)
  - Role: Primary "stutter" percussion — wooden body knock + wet friction tail with organic wobble.
  - Usage: Played via BufferSource in scheduleStutter(); playbackRate detuned 0.93-1.09 for life; lp/gain modulated by stillness (wider hesitant gaps when world trembles, tighter on still). Sparse, gapped, never machine-even.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py (body resonance sines + shaped noise burst + slow wobble + wet tail); physical/hesitant character for music redesign addressing feedback. (See gen_music.py in this WO context for exact recipe.)

- `resolve-breath.wav` (278 kB, 3.15s)
  - Role: Sustained low atmospheric "breath" pad (loopable) with soft harmonics + airy texture and natural breath-cycle amplitude modulation.
  - Usage: Looped BufferSource; lowpass freq + gain open progressively with lastStill (attention); starts on sufficient stillness (>~0.14). Fades on release. Provides resolving held tone and emotional ma/emptiness.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py (layered low fundamentals 54/81Hz + modulated air noise layer + slow 0.28Hz breath cycle + gentle atk/rel for seamless); warmer, breathier, less "terrible digital" than prior oscillator bleeps.

- `friction-rub.wav` (19 kB, 0.22s)
  - Role: Short textured rub / baren press accent with woody tick for tactile contact feedback.
  - Usage: Occasional overlays (prob ~0.09) while isPressing + still; rate variance. Reinforces "rub to still" verb.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py; tactile baren-press response.

## Notes
- All assets self-contained relative to drops/indigo-stutter/index.html (assets/*). No remote URLs.
- Visuals: base always drawn (micro jitter registration when stuttering); reveal at progressive alpha based on sustained attention; vector ink forms + mist + paper fibers + pressure ring always available (fallback if jpg decode timing fails under load).
- Audio: XHR + decodeAudioData on first user gesture only (pointerdown/touch/keydown space while over) — strict no autoplay. Full file-backed buffers when present; graceful inline noise fallback otherwise. Mute affects master without forcing loads. Reset (re-ink) stops breath src for "exhale".
- Total slice payload (index.html ~26kB + 2 jpg ~474kB + 3 wav ~339kB + manifest ~6k) ~ 0.85 MB — well under 2 MB gate. Purposeful generated art+audio assets required by feedback and contract.
- License / usage: Studio internal; ephemeral digital ukiyo-e for FactoryX review of the living print slice; not for redistribution.

## Verification of contract
- Real files present (jpgs 300/174 kB + wavs 42/278/19 kB) in drops/indigo-stutter/assets/ — not just manifest. Fresh GenerateImage (art) + numpy/gen_music.py (audio) in this 2026-06-20 session.
- Loaded and used in index.html (img.src for visuals; XHR+decodeAudioData for audio on first gesture path).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of visual assets (GenerateImage with stronger ink/silhouette/ma prompts yielding 39.6% center dark) + audio stems (physical/hesitant vs prior) executed in follow-up to address feedback directly; interaction, house style, taste-gate, direct preview, and 9/9 game feel preserved.
- Browser verification (real chromium + xvfb + file:// + assets) exercised image load/draw + audio paths with these exact assets (see VERIFICATION.md + screenshots/ in this WO dir).
- Also mirrored as FACTORYX_WORK_ORDER_CONTEXT_DIR/ASSET_MANIFEST.md for durable record.

(End of manifest)
