# ASSET_MANIFEST — Mist settles on one carved horizon (Work Order context copy)

Deliverable: mist-settles-on-one-carved-horizon-5ca8e144
Work Order: work-order-1781665243422-followup
Studio: edo-woodblock (Pictures of the Floating World)
Date generated: 2026-06-17 (authored for rework); refreshed verification 2026-06-20

## Asset Contract
Real file-backed generated/authored assets under `games/mist-settles-on-one-carved-horizon-5ca8e144/assets/` plus this manifest in Work Order context.
In-code-only procedural systems or ASSET_MANIFEST.md alone do not satisfy `generated_assets`.

## Files (located at games/mist-settles-on-one-carved-horizon-5ca8e144/assets/)

- `paper-washi-texture.jpg` (241357 bytes)
  Role: Ground layer — warm handmade washi paper with visible kozo fibers, faint laid lines, natural tooth and subtle warmth variation.
  Provenance: Generated 2026-06-17 via Grok GenerateImage tool (high-res photographic scan of ukiyo-e quality washi, low-contrast for ink compositing, ~2048x1536).
  Integration: Drawn first at full canvas size (ctx.drawImage) with slight opacity; live canvas procedural grain/fiber/laid lines overlaid for hybrid tactility. Fallback: solid warm paper + fibers if load fails.
  Browser verification: visible in ready.png / post-*.png ; texture provides tooth that reads under ink and mist layers.

- `mist-veil-layer.jpg` (130149 bytes)
  Role: Primary expressive material — drifting atmospheric mist veils. Soft feathered bands suggesting layered fog across the horizon, very low contrast, designed for multiply/soft-light blending.
  Provenance: Generated 2026-06-17 via Grok GenerateImage, ethereal quiet mist aesthetic matching house style (mist as emotional temperature/breath, not decoration).
  Integration: Two parallax instances (layer 0/1/2) drawn with drawImage at modulated alpha/pos; alpha thins locally under baren and globally on cumulative settle. Continuous slow motion even when idle.
  Browser verification: drifting visible on first paint in screenshots; thins visibly under forced press in ?verify=1 captures.

- `horizon-ink-wave.jpg` (215686 bytes)
  Role: Foundational carved horizon element — single dominant wave-form / ridge in deep sumi ink, variable weight, feathered bleed edges, woodblock-analog imperfections, isolated for overlay.
  Provenance: Generated 2026-06-17 via Grok GenerateImage targeting ukiyo-e single-gesture horizon with one strong compositional move; high contrast black with organic edge.
  Integration: Base ink form drawn under 3-pass animated procedural wave (back feathered, main body, highlight); press deepens local + adds wick bleeds referencing the form; cumulative makes it "carve" deeper.
  Browser verification: always present as the one dominant gesture; deepens with pressDepth + cumulative in post captures.

## Integration points
- Loaded in `games/mist-settles-on-one-carved-horizon-5ca8e144/index.html` via new Image(), relative 'assets/...' paths (works for file:// and preview tree).
- onload/onerror set flags; first paint and raf loop use Ok flags or graceful fallbacks (procedural wave + grain + soft ellipses).
- No network; all <2MB total payload.

## Payload + verification
- Assets total ~587 kB; source HTML/JS ~21.5 kB.
- Chromium headless (2026-06-20): ready.png (955243 B), post-fresh.png (953464 B) non-blank, correct <title>, canvas present, FOLLOWUP-LIVE-OK marker in verify mode, 0 home-page strings (no crew/demos/board/hero), mist in motion on idle, interaction deepens ink + moves/thins mist.
- 9/9 game feel checklist + house style held.

## Source / generation method note
No direct "foundry image" job id (huggingface provider disabled on foundry); assets produced via available GenerateImage capability at implementation time for this rework pass, then committed as reviewable binary files. If a future image pipeline is exposed, re-gen with job ids can be substituted while preserving role/palette.

This manifest (in WO context) + committed assets under games/.../assets/ satisfy the contract for material visual change.

Work Order: work-order-1781665243422-followup
