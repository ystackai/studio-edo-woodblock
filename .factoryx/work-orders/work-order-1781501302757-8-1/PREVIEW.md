# PREVIEW — Moonlit Wave Courier

## Preview Path
`games/92-moonlit-wave-courier/index.html`

## How to Play
1. Open the preview URL
2. Click START (or press Space/↑)
3. **Jump**: Space / ↑ / tap left touch button
4. **Dash**: Shift / X / tap right touch button
5. Avoid yokai (shadow figures with glowing eyes) and wave crests
6. Collect sealed letters for score streaks
7. Ride wind currents (pale ellipses with wind lines) for speed boosts
8. Survive as long as possible — speed and difficulty increase over time

## Visual Features
- **Parallax moonlit background**: 3 mountain layers, twinkling stars, floating mist, crescent moon
- **Moonlit water**: Reflective surface with animated ripples
- **Multiple platform types**: Wooden bridges with railings, bamboo bridges with segments, stone platforms, animated wave surfaces
- **Lanterns**: Hanging paper lanterns with flickering warm glow
- **Yokai**: Shadowy creatures with pulsing vermilion eyes, wispy tendrils, mist aura
- **Wave crests**: Dynamic rising/falling water obstacles with foam particles
- **Sealed letters**: Paper documents with vermilion seal, golden glow
- **Particle effects**: Ink splash on death, dust trails, dash trails, letter collection burst

## Audio
- Ambient: water hum, wind, wave rumble (all user-gesture triggered)
- SFX: jump (triangle wave), dash (sawtooth sweep), letter collect (ascending chime), hit (sawtooth + noise burst), wind current (triangle sweep)
- Streak celebration: ascending tones at 3x streak intervals

## Technical
- Single HTML file, ~1200 lines, ~48 KB
- Canvas 2D rendering at device pixel ratio
- 60fps fixed timestep game loop
- Web Audio API (no external audio files)
- Responsive layout with mobile touch controls
- localStorage high score persistence
- No external dependencies, fully offline playable
