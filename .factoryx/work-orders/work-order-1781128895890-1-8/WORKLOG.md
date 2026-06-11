# Worklog — Koi Breath (p4-koi-breath)

## Session 1 — Initial Build

- **Goal**: A koi pond surface where pressing breathes ink into the water. Patient holds bloom; frantic taps do nothing.
- **Single verb**: Hold to bloom ink.
- **Palette**: Sumi (ink black), indigo, faded vermilion, warm washi paper.
- **Architecture**: Single self-contained index.html in `drops/koi-breath/`. Canvas-based rendering with Web Audio for subtle sounds.
- **Key mechanics**:
   - Hold >= 400ms to trigger a bloom (prevents frantic tapping)
   - Cooldown of 1.5s between blooms at same spot
   - Longer holds (2s, 5s, 8s) unlock progressively richer ink layers
   - Each bloom fades over 10-15s with ease-out curve
   - Ghostly koi silhouettes swim across the surface
   - Subtle water ripples on cursor movement

## Self-Review Scores
(To be recorded after playtesting)
