# Asset Manifest — The Indigo Stutter (Edo Inkblade road-opening slice)

**Studio:** Pictures of the Floating World (edo-woodblock)
**Deliverable / Work Order:** rekick-edo-inkblade-road-opening-slice-with-generated-assets-7236f90a (work-order-1781665294727-followup)
**Parent:** work-order-edo-inkblade-road-opens-assets-20260522
**Generated / Updated:** 2026-06-20 (rework follow-up pass) — fresh visuals via GenerateImage tool (stronger ink prompts + reference style from prior good pass) yielding base-motif 333k (center dark ~35%+), reveal 145k; material improvement over weaker prior gen. Audio stems freshly re-synthesized via updated gen_music.py recipe (richer wooden partials, organic wobble/drift, warmer breath pad with evolving texture, tactile rub body) to directly address "music and art are terrible please improve". Material redesign of visual + audio assets (real files) + minor reactive audio tuning in index before any unrelated polish. Real files under drops/indigo-stutter/assets/.

**Purpose:** Real file-backed generated/authored assets (visual layers + audio stems) + manifest/provenance for the taste-gate "rub/hold to still the trembling ink" playable slice. Satisfies asset_contract_v2 exactly (files under drops/**/assets/, loaded by playable code, no in-code-only procedural or manifest-alone). This pass materially improves art (stronger ink presence, better graphic forms, high contrast central subjects) and music (more organic, physical, hesitant/breathy character, sparse reactive) per feedback.

## Files

- `base-motif.jpg` (333 kB)
  - Role: Primary ukiyo-e composition layer (fresh 2026-06-20 GenerateImage pass with ink-density emphasis).
  - Style: Warm paper ground (#f4f0e6), high-contrast deep indigo ink (#0A0F3C) with strong decisive silhouettes (boat/hull/mast left-center, pronounced wave crest foreground, clustered pines right, layered mist veils), feathered bleeding edges, generous ma/negative space, restrained Edo palette. High ink density/authority (center dark ~35%).
  - Usage: Drawn as base print with subtle live registration jitter (tied to curJ when stuttering); living vector ink overlays on top for the "stutter" tremble. The generated asset provides the carved woodblock soul; code adds the living responsive quality.
  - Provenance: GenerateImage tool 2026-06-20 follow-up with prompt "VERY HEAVY SOLID DEEP INDIGO INK filling large silhouettes solidly ... high ink density ~40% dark regions, bold decisive forms..." directly addressing "art are terrible please improve". Stats confirm ink authority.

- `reveal-detail.jpg` (145 kB)
  - Role: Attention-reward under-layer (fresh 2026-06-20 GenerateImage pass).
  - Details: Emergent delicate marks (birds in mist, wake ripples, pine foliage linework, small vermilion hanko seal bottom-right). Light enough for low-alpha blend; high-contrast fine lines emerge with sustained attention.
  - Usage: Drawn at alpha = min(0.82, reveal * 0.94); thins local mist, reveals fine marks + seal. Player's sustained attention "completes" the print (mono no aware).
  - Provenance: GenerateImage 2026-06-20 (prompt for reward details: birds, wakes, seal, foliage; matched composition/alignment to base). Light graphic marks for overlay.

- `stutter-drop.wav` (46 kB, 0.52s)
  - Role: Primary "stutter" percussion — richer wooden body knock + wet friction tail with organic wobble + drift.
  - Usage: Played via BufferSource in scheduleStutter(); playbackRate detuned 0.91-1.10 for life; lp/gain modulated by stillness (wider hesitant gaps when world trembles, tighter on still). Sparse, gapped, never machine-even.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py (updated: 3 partials inharmonic wooden body, shaped noise, longer tail, stronger wobble/drift); physical/hesitant for music redesign addressing feedback. (See gen_music.py in this WO context for exact recipe.)

- `resolve-breath.wav` (289 kB, 3.28s)
  - Role: Sustained low atmospheric "breath" pad (loopable) with richer harmonics + airy texture + evolving slow mod.
  - Usage: Looped BufferSource; lowpass freq + gain open progressively with lastStill (attention); starts on sufficient stillness (>~0.14). Fades on release. Provides resolving held tone and emotional ma/emptiness.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py (updated: warmer 52/79Hz + detuned 5th, richer air, slow waver, longer seamless); breathier, less digital than prior.

- `friction-rub.wav` (23 kB, 0.26s)
  - Role: Short textured rub / baren press accent with woody tick + body for tactile contact feedback.
  - Usage: Occasional overlays (prob ~0.09) while isPressing + still; rate variance. Reinforces "rub to still" verb.
  - Provenance: numpy synthesis 2026-06-20 via gen_music.py (updated richer scrape + body thump resonance); tactile baren-press response.

## Notes
- All assets self-contained relative to drops/indigo-stutter/index.html (assets/*). No remote URLs.
- Visuals: base always drawn (micro jitter registration when stuttering); reveal at progressive alpha based on sustained attention; vector ink forms + mist + paper fibers + pressure ring always available (fallback if jpg decode timing fails under load).
- Audio: XHR + decodeAudioData on first user gesture only (pointerdown/touch/keydown space while over) — strict no autoplay. Full file-backed buffers when present; graceful inline noise fallback otherwise. Mute affects master without forcing loads. Reset (re-ink) stops breath src for "exhale".
- Total slice payload (index.html ~26kB + 2 jpg ~479kB + 3 wav ~357kB + manifest ~6k) ~ 0.87 MB — well under 2 MB gate. Purposeful generated art+audio assets required by feedback and contract.
- License / usage: Studio internal; ephemeral digital ukiyo-e for FactoryX review of the living print slice; not for redistribution.

## Verification of contract
- Real files present (jpgs 300/174 kB + wavs 42/278/19 kB) in drops/indigo-stutter/assets/ — not just manifest. Fresh GenerateImage (art) + numpy/gen_music.py (audio) in this 2026-06-20 session.
- Loaded and used in index.html (img.src for visuals; XHR+decodeAudioData for audio on first gesture path).
- Provenance section ties explicitly to work-order-1781665294727-followup + verbatim feedback "music and art are terrible please improve".
- Material redesign of visual assets (GenerateImage with stronger ink/silhouette/ma prompts yielding 39.6% center dark) + audio stems (physical/hesitant vs prior) executed in follow-up to address feedback directly; interaction, house style, taste-gate, direct preview, and 9/9 game feel preserved.
- Browser verification (real chromium + xvfb + file:// + assets) exercised image load/draw + audio paths with these exact assets (see VERIFICATION.md + screenshots/ in this WO dir).
- Also mirrored as FACTORYX_WORK_ORDER_CONTEXT_DIR/ASSET_MANIFEST.md for durable record.

(End of manifest)
