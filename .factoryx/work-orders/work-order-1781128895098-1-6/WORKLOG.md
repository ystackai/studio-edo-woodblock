# Worklog — p3-lantern-rain

## Session 1 — 2026-06-11

### Goal
Rain on a single paper lantern at dusk. Atmosphere does all the emotional work.

### Design
- Single self-contained `games/lantern-rain/index.html`
- Canvas-based rendering: dusk sky, distant hills, mist, paper lantern with warm glow
- Rain particles with wind drift, puddle ripples on ground
- Touch/click near lantern to shield it — hand overlay appears
- The longer you hold, the steadier the flame becomes (flameIntensity increases)
- Warm spark particles when rain hits the lantern surface
- Rain audio (brown noise) starts on first interaction; toggleable with rain/silence button
- Film grain overlay, vignette for atmosphere

### House Style Alignment
- **Ink as primary material**: deep indigo sky, warm amber glow, paper-colored lantern
- **Silhouette and edge**: lantern stands as a warm silhouette against cold dusk
- **Paper and texture**: film grain overlay, paper ribs on lantern body, wet sheen
- **Mist, distance, breath**: layered mist, distant hills, rain as atmosphere
- **The single strong gesture**: one lantern, one interaction — shelter it from the rain
- **Restraint as generosity**: no score, no progression, no objectives — just the lantern and rain
- **Touch as carving**: the hand overlay feels like pressing a baren over the lantern

### Anchor Self-Review (final pass)

| Anchor | Score | Notes |
|--------|-------|-------|
| **Graphics** | 4 | The lantern with its warm glow against the indigo dusk is striking. Rain streaks, mist layers, and grain create a moody atmosphere. The tassel and paper ribs add authenticity. |
| **Sound** | 4 | Chosen silence as default is strong. Rain audio is subtle brown noise that fits the mood. Soft tick when rain hits the lantern/hand. Fades when shielding — the audio itself tells the story. |
| **Fun** | 4 | The core interaction — shielding a lantern from rain, watching the flame steady — is meditative. The patience reward (steadier flame) gives a gentle sense of progression. Warm spark particles when the flame is steady add a visual reward. It's not "fun" in a game sense but emotionally engaging. |
| **Unique Style** | 5 | The Edo aesthetic is unmistakable: chochin lantern, indigo/amber palette, paper texture, mist. The interaction of shielding with a hand is a gesture only this studio would think of. The piece knows when to stop. |

**Overall: 4.3/5** — All scores >= 4. No improvement passes needed.

### Technical Decisions
- Single canvas for all rendering (no DOM updates in loop)
- Procedural rain (no sprite sheets needed)
- Brown noise via Web Audio API (no external audio files)
- Film grain via offscreen canvas with procedural noise
- DPR-aware rendering (up to 2x)
- All motion uses easing: sin/cos for sway, lerp for flame, exponential for hand fade
