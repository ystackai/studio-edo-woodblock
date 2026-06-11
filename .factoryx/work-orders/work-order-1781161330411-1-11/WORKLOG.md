# Koi Breath — Worklog

Built a single self-contained `index.html` at `games/trial-p4-koi-breath-b/index.html`.

## Core mechanic
- Press and hold anywhere on the pond surface to breathe ink into the water
- Longer hold = larger, deeper bloom. Quick taps (< 300ms) silently ignored
- Release to let the bloom slowly fade over ~10 seconds
- Up to 14 simultaneous blooms layer on canvas

## Visual systems
- Paper texture via procedural multi-scale noise
- Ink blooms with organic wobbly shapes, tendril bleed streaks, edge stipple
- 5 koi fish with bezier-curved bodies, forked sinuous tails, varied colors
- 6 slow drift mist clouds for atmosphere
- Water caustics (screen blend), ripple rings, particles, vignette

## Audio
- Procedural sine-tone water sounds via WebAudio, only after user gesture
- No autoplay

## Anchor Self-Review
| Anchor | Score | Notes |
|--------|-------|-------|
| Graphics | 4 | Organic ink look with tendrils, granulation, koi silhouettes |
| Sound | 3 | Procedural tones work but are minimal; improving with dual oscillators + noise |
| Fun | 4 | Meditative hold mechanic is rewarding and intuitive |
| Unique Style | 5 | Unmistakably Edo Woodblock — paper, sumi ink, koi, restraint |

**Improvement pass:** Enriched audio with detuned dual oscillators and filtered noise for physical water feel.

## Final scores (after improvement)
| Anchor | Score |
|--------|-------|
| Graphics | 4 |
| Sound | 4 |
| Fun | 4 |
| Unique Style | 5 |

All ≥ 4. Done.
