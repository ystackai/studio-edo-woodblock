# Floating World Variants — Judging Guide

## Vote Options

- **A — The Great Empty Wave** — Hokusai-like negative-space wave revealed through slow ink pressure
- **B — Rain Bridge At Dusk** — Hiroshige-like bridge, rainfall, and vermilion lantern; stillness clarifies distance
- **C — The Actor's Held Breath** — Sharaku-like theatrical mask; a decisive stroke snaps the pose, then dissolves

## Discord Vote Prompt

> Which floating-world variant has the strongest first impression and interaction feel — **A (Great Empty Wave)**, **B (Rain Bridge At Dusk)**, or **C (Actor's Held Breath)**?

## What To Judge

1. **First impression** — Does the opening frame already feel like a composed ukiyo-e print?
2. **Composition** — Is there one dominant gesture (wave, bridge, mask) with restrained color and negative space?
3. **Interaction feel** — Does touch/mouse feel tactile (baren pressure, rain bleed, held breath) rather than arcade-like?
4. **Edo house style** — Ink, paper, mist, silhouette; no neon, particles, or frantic mechanics.

## Verification Notes

- Entrypoint: `drops/88-floating-world-variants/index.html`
- A/B/C selector at top; keyboard `1`/`2`/`3` or `A`/`B`/`C` also switches variants
- Evidence screenshots captured under `evidence/` via Playwright
- `npm run verify` includes structural checks for this drop

## Known Limitations

- Procedural paper texture regenerates on resize (brief flicker possible)
- Variant C dissolve is time-based after snap; very rapid re-gestures may overlap poses
- No audio — intentional quiet composition
- Mobile selector scrolls horizontally on narrow viewports