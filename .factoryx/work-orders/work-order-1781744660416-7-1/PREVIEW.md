# PREVIEW — Discord Deliverable Kickoff: Pictures of the Floating World (work-order-1781744660416-7-1)

**Entrypoint:** `games/94-kawanakajima/index.html` (direct, self-contained)

**Preview file written:** `.factoryx/preview-entrypoint` contains exactly `games/94-kawanakajima/index.html`

## How to open
- Direct: open `games/94-kawanakajima/index.html` in any modern browser (file:// or served).
- Factory preview tree: `/factoryx/previews/<factory>/<work-order>/games/94-kawanakajima/index.html`
- The entrypoint file enables automated harness resolution.

## What you see on first screen (no extra instructions needed)
- Title "BATTLES OF KAWANAKAJIMA" + "Takeda · Uesugi — ten prints each" in restrained ink.
- Two opposing camps presented as woodblock prints on paper.
- Left: TAKEDA (vermilion accents) — 10 generated ukiyo-e portraits in 2×5 grid.
- Right: UESUGI (indigo accents) — 10 generated ukiyo-e portraits.
- Two exemplars (takeda-01, uesugi-01) already fully pulled so the visual language (strong silhouette, crest, weapon, paper, mist) is immediately legible.
- Remaining figures start mist-veiled / faint; hold or drag pointer over a block → ink flows, details resolve (the Asset Foundry verb enacted live).
- Lower band: "the instant" staging area. Select one from each side → they appear facing across charged negative space.
- Subtle integrated caption near bottom: "hold to pull the print · select one from each camp · space for the instant"
- Quiet pulled count in margin. No floating HUD or tutorial chrome.

## First interaction (30–60s slice)
1. Hold/drag over veiled portraits to reveal (brush-as-baren). Each has real generated file asset underneath + procedural ink wash + mist veil that lifts.
2. Click a revealed portrait to bring it forward into the confrontation stage.
3. With one Takeda + one Uesugi staged, press Space or click the stage area → "the instant": figures advance, ink splash, paper tremor, vermilion seal settles. The pairing becomes a still print.
4. Swap figures, pull more, repeat. The 20 prints remain the central subject.

## Controls
- Pointer primary: drag/hold = reveal (brush), click = select & stage.
- Space: trigger the clash instant (when pair ready).
- R: clear stage.
- S: toggle sparse physical sound (off by default; first gesture enables context).
- 1–5: quick-reveal + stage a balanced pair (discoverable, not required).

## Sound
- Gesture-gated AudioContext only.
- Sparse: brush-fiber drag on reveal, physical thock stamp on resolve/select, low struck tones + ink noise on clash.
- No loops, no beds, no autoplay. Matches house: sound is memory of the block.

## Generated assets (file-backed, per ASSET_MANIFEST.md)
- 20 JPGs under `games/94-kawanakajima/assets/` (takeda-01..10.jpg, uesugi-01..10.jpg).
- All produced 2026-06-18 via GenerateImage with explicit ukiyo-e house-style prompts.
- Loaded as <img> sources, drawn into canvas with living overlays. Screenshots show the actual pixels from these files.

## Screenshots / checkpoints (real browser)
- `screenshots/ready.png` — first screen, multiple real assets visible, two exemplars full, diptych readable.
- `screenshots/post-interact.png` — staged Takeda vs Uesugi with clash ink + seal visible.

## Notes
- Self-contained after load. Relative paths only.
- 60fps target on modest hardware; canvas cost kept reasonable (precomputed grain, alpha compositing).
- Addresses prior verification skip: `.factoryx/preview-entrypoint` + direct game root present before any harness run.
- The central subject (the 20 generated samurai prints) and the printing/staging interaction are the entire experience.
