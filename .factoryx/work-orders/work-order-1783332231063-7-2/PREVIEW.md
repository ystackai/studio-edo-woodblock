# Preview — Pictures of the Floating World

**Work Order:** `work-order-1783332231063-7-2`  
**Preview URL:** `games/ukiyo-e-printer/index.html`

## How to Review

1. Open the preview URL in any modern browser.
2. You'll see a paper-textured canvas with Mt. Fuji silhouette and drifting mist.
3. Click/tap on the paper to leave ink blooms — they spread with organic, irregular edges.
4. Drag to draw brushstrokes with variable opacity (slower = darker).
5. Hold a click for 1–2 seconds to "press the baren" — feel the friction sound, see the paper depress and vermilion bleed through.
6. Press FINISH (or S) to download your print with a red seal stamp.

## Controls
| Input | Action |
|-------|--------|
| Click/tap | Ink bloom at point |
| Click + drag | Brushstroke (variable opacity based on speed) |
| Hold 1–2s | Baren press (paper depression, friction sound, vermilion accent) |
| Fast stroke | Ink splatter (small droplets at stroke edges) |
| Sound button (♪) | Toggle ambient audio |
| J | Toggle ambient audio |
| R or ♻️ | Clear print (paper sweep fade) |
| S or FINISH | Download PNG with seal stamp (woodblock thud) |

## What Changed in This Polish

### Paper Texture
- Multi-scale noise: coarse grain + fine texture + warm tonal variation across the paper surface.
- Variable fiber thickness: some fibers thicker than others for realistic washi.
- Warm paper gradient: slightly warmer at edges, cooler center.

### Ink Behavior
- Organic bloom shapes: 64-point irregular edges, not perfect circles.
- Velocity-aware opacity: slow strokes are darker (more ink absorbed).
- Smooth stroke interpolation: quadratic curves for natural brush feel.
- Ink splatter: small droplets appear during fast strokes.
- Brush-end fade: stroke terminus fades softly.
- Ink accumulation: dense areas darken the paper slightly.

### Baren Press
- Paper depression: radial gradient simulates the baren pressing into paper.
- Continuous friction sound: plays throughout the hold, not just at thresholds.
- Resistance ring: animated dashed ring that grows with pressure.
- Vernilion accent: red seal color bleeds through at 60%+ hold.
- Physical shake: marks subtly spread under heavy pressure.

### Atmosphere
- 16 mist layers with per-layer seasonal color phase offsets.
- 90-second seasonal color cycle.
- Mist thickens near dense ink areas.
- Fuji base veiled with atmospheric gradient.
- Paper slowly recovers saturation — patient play is rewarded.
- Occasional temple bell chime during quiet moments.

### UI Polish
- Hand-carved button aesthetic with subtle inner borders.
- Breathing animation on title/subtitle.
- Poetic Japanese labels for ink mark count.
- Paper sweep fade on reset.

### Audio
- Brush: dry bristle + wet ink layers with amplitude modulation.
- Baren friction: two-layer sound, frequency rises with pressure.
- Seal thud: woodblock texture with harmonics.
- Ambient bell chime: random temple bell during quiet periods.

## Previous Run Issues Addressed
- **Audio probe failure**: ✅ Resolved (soundOn = true)
- **Stale hold variable**: ✅ Resolved (Date.now() in hold interval)
- **Friction sound not playing**: ✅ Resolved (continuous friction during hold)

## Verification Status
- Static checks: ✅ All pass
- Audio probe: ✅ Resolved
- JS syntax: ✅ Valid (node --check passes)
- Browser smoke test: ⚠️ Screenshot capture unavailable (container limitation)