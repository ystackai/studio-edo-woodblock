# ASSET_MANIFEST — Mist settles on one carved horizon

Deliverable: mist-settles-on-one-carved-horizon-5ca8e144
Work Order: work-order-1781665243422-followup
Studio: edo-woodblock (Pictures of the Floating World)
Date generated: 2026-06-17

## Asset Contract
This deliverable uses real file-backed generated/authored assets under `games/mist-settles-on-one-carved-horizon-5ca8e144/assets/`.
In-code-only procedural systems or ASSET_MANIFEST.md alone do not satisfy the contract for material visual changes.

## Files

- `paper-washi-texture.jpg` (241357 bytes)
  Role: Ground layer — warm handmade washi paper with visible kozo fibers, faint laid lines, natural tooth and subtle warmth variation.
  Provenance: Generated 2026-06-17 via Grok GenerateImage tool with prompt describing high-res photographic scan of ukiyo-e quality washi, low-contrast for ink compositing, 2048x1536 equivalent.
  Usage: Drawn first at full canvas size with slight opacity; canvas procedural grain and fiber specks layered on top for hybrid life.

- `mist-veil-layer.jpg` (130149 bytes)
  Role: Primary expressive material — drifting atmospheric mist veils. Soft feathered bands suggesting layered fog across the horizon, very low contrast, designed for multiply/soft-light blending.
  Provenance: Generated 2026-06-17 via Grok GenerateImage, ethereal quiet mist aesthetic matching house style (mist as emotional temperature, not decoration).
  Usage: Two parallax instances drift at different rates; alpha modulated by press (thins locally under baren) and global slow breath; provides the continuous slow motion even when idle.

- `horizon-ink-wave.jpg` (215686 bytes)
  Role: Foundational carved horizon element — single dominant wave-form / ridge in deep sumi ink, variable weight, feathered bleed edges, woodblock-analog imperfections, isolated for overlay.
  Provenance: Generated 2026-06-17 via Grok GenerateImage targeting ukiyo-e single-gesture horizon with one strong compositional move; high contrast black with organic edge.
  Usage: Base ink form drawn under animated procedural wave passes; press deepens local opacity and adds bleed tendrils that reference this form; ensures the "carved" identity is always present even as mist and dynamic ink evolve.

## Notes
- All assets self-contained, no external network fetches at runtime.
- Fallbacks in canvas code (pure procedural wave + grain + mist) ensure the piece is always complete and beautiful even if image decode fails (e.g. file:// quirks).
- Total assets ~587 kB; combined with ~25 kB HTML/JS/CSS keeps payload well under 2 MB limit.
- These assets were created specifically for the rework to satisfy asset_contract_v2 while materially addressing the "home page" preview bug by ensuring the deliverable is a direct, reviewable, self-contained print with authored texture depth.

## Integrity
Run `sha256sum *.jpg` in this dir after any manual edit. Do not recompress or resave without updating manifest and re-verifying.

Generated for the FactoryX follow-up pass on the living print deliverable. The dominant gesture (quiet sustained baren on the single wave horizon, mist as breath) is served directly by the preview entrypoint.
