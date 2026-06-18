# ASSET_MANIFEST — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781744660416-7-1)

**Date:** 2026-06-18  
**Status:** Generated 20 real file-backed portraits via available image generation (GenerateImage). All central heroes are concrete authored/generated PNG/JPG assets, not in-code procedural stand-ins. Supporting effects are deliberate procedural (paper grain, ink wash, mist, splats) on top of the file sources.

## Asset Pipeline Inspection
- No mounted `assets/generated/` or top-level foundry outputs in runtime at start.
- No pre-existing samurai assets.
- Used the exposed GenerateImage capability (the "Asset Foundry" path available to this worker) to produce 20 distinct ukiyo-e woodblock-style JPG portraits with house-style prompts (bold sumi feathered outlines, warm paper, restrained vermilion/indigo/black/gold, mist/ma, strong silhouettes, clan mons/crests/weapons differentiated).
- Each prompt explicitly referenced late-Edo musha-e / Yoshitoshi inspiration, paper texture, specific clan, role/gear variation, and "Battles of Kawanakajima series".
- Files committed under `games/94-kawanakajima/assets/`.
- In-code systems (reveal progress, ink overlays, mist veils, clash splats, paper tremor) support and animate the file assets; they do not replace them.

## Core Visual Assets (20 generated file-backed samurai portraits)
All are real image files loaded by the game. Sizes ~340–460 kB each (full illustration); browser draws scaled. Total payload acceptable for purposeful art.

### Takeda clan (vermilion accents, left camp) — 10 files
- takeda-01.jpg —  (commander, horned dragon maedate, no-dachi, ō-yoroi, vermilion mon)
- takeda-02.jpg — vanguard yari, crescent maedate, younger
- takeda-03.jpg — archer, deer-antler crest, yumi
- takeda-04.jpg — monk-soldier, Buddhist crest, naginata
- takeda-05.jpg — heavy infantry, fan mon helmet, tetsubo
- takeda-06.jpg — mounted officer hint, sunburst crest
- takeda-07.jpg — signaler/bannerman, horagai or banner
- takeda-08.jpg — standard bearer, rabbit-ear crest, nobori
- takeda-09.jpg — tessen specialist, open helmet
- takeda-10.jpg — ashigaru veteran, practical helmet, naginata

### Uesugi clan (indigo accents, right camp) — 10 files
- uesugi-01.jpg — Kenshin-inspired commander, white-plume/crescent, tachi, Buddhist motifs
- uesugi-02.jpg — spearman, swallowtail crest
- uesugi-03.jpg — archer, horn crest, yumi
- uesugi-04.jpg — heavy, dragon crest, kanabo/spear
- uesugi-05.jpg — cavalry officer, plumed
- uesugi-06.jpg — warrior monk, naginata, beads
- uesugi-07.jpg — veteran tessen/sword, cross crest
- uesugi-08.jpg — yari specialist
- uesugi-09.jpg — strategist/aide, tall helmet, fan
- uesugi-10.jpg — young bowman, wave crest

**Dimensions:** approximately 512–640 px longest side (varies by generation); rendered at 128–210 px in roster, ~240 px in stage.
**Format:** JPEG (paper-ground illustrations); composited on canvas with additional paper/mist/ink layers for living print effect.
**Generation:** 2026-06-18 via GenerateImage tool with house-style prompts recorded above. No silent canvas redraws for the 20 heroes.

## Supporting authored / procedural elements
- Paper ground + fiber grain (procedural 420+ flecks + subtle lines, matches lantern deliberate system).
- Mist/veil overlays per portrait (fade with reveal progress).
- Ink wash / bleed simulation on reveal increase.
- Vermilion seal stamp pop on full resolve and on clash.
- Ink splash / tremor on "the instant".
- Sparse physical SFX (brush drag noise on reveal, thock stamp, low-tone clash pair; gesture-gated, no loops).

## Integration points in games/94-kawanakajima/index.html
- Preload: all 20 Images via relative `assets/*.jpg`.
- Roster: 5×2 grid per camp. `drawPortrait(id, x, y, w, h, reveal)` composites the file image at current reveal alpha + procedural veil + ink accents.
- Selection: click on sufficiently revealed portrait selects (one per clan); frame uses clan color.
- Stage: lower band composites the two selected file images (larger), applies slight transforms on clash telegraph + ink overlay + seal.
- All paths relative; works file:// and under preview trees.
- State exposed: `window.__KAWANAKAJIMA_STATE` (reveals, selected, lastClash) for verification harness.

## Provenance & evidence
- 20 files listed above, generated 2026-06-18.
- Source of truth: prompts in generation calls (house style + specific differentiation) + this manifest.
- Verification evidence: 
  - screenshots/ready-*.png (first screen shows multiple real asset pixels from JPGs in roster, with 2+ exemplars fully revealed).
  - screenshots/post-interact-*.png (staged confrontation using the actual loaded file images + clash ink).
- Browser runtime check: successful image decode (no 404s), non-blank regions attributable to asset content.

## Blockers / notes
- Full 20 produced successfully (no rate limit hit for this run); authoritative set complete.
- Images include traditional seals and small internal labels from generation; they read as prints and are used as-delivered (house style preserved, no repaint).
- No external network after load.
- If future runs have access to higher-res or alpha-cut foundry outputs, swap documented here.

## Updates
- 2026-06-18: Initial generation of all 20 + manifest population during implementation pass. Real assets integrated before any review claim.
