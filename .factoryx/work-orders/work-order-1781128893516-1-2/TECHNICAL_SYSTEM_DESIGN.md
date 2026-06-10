# Technical System Design

**Architecture:** Single HTML file with inline CSS and JS. Canvas 2D rendering at DPR (up to 2x).

**Layers (rendered back → front):**
1. Sky gradient (warm off-white to pale grey)
2. Horizon line (thin, precise, slightly animated)
3. Sea base gradient (deepening indigo)
4. Secondary wave (behind, smaller, out of phase)
5. Primary wave (Hokusai-inspired ink wash with gradient)
6. Wave crest foam/spray particles
7. Press indentation (radial ink mark at cursor)
8. Ink ripples (expanding rings from press)
9. Mist layers (55 radial gradients drifting horizontally)
10. Paper grain overlay (baked noise texture + fold marks)
11. Edge vignette
12. Brush cursor (dot when idle, pulsing ring when pressing)

**Interaction:** Spring-damper physics. Press depth approaches 1.0 over ~3 seconds with resistance. Release settles over ~2 seconds. Ink ripples spawn during sustained press.

**Audio:** Web Audio API, user-gated. Breath noise (filtered noise burst), press click (triangle oscillator sweep).

**No external dependencies. No frameworks. ~15KB total.**
