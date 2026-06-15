# WORKLOG — Moonlit Wave Courier

## 2026-06-15
- Created technical design doc
- Built initial game (index.html, ~1000 lines):
  - Canvas-based side-scroller with parallax moonlit background
  - Player: ink-wash courier character with running animation
  - Controls: Space/↑ for jump, Shift/X for dash
  - Platforms: wooden bridges and wave surfaces
  - Hazards: yokai (shadow figures with glowing eyes) and wave crests
  - Collectibles: sealed letters (deliver for streak score), wind currents (dash boost)
  - Scoring: distance + letter deliveries × streak multiplier
  - Difficulty scaling: speed increases every 500m
  - Visual polish: moon with glow, stars, mountains, mist, lanterns with flicker, particles
  - Audio: Web Audio API synthesized sounds (jump, dash, letter, hit, wind)
  - Responsive layout with touch controls
  - Game over with high score persistence
- Games index updated with link to the game

## Next steps
- Polish: improve game feel (easing, hit feedback)
- Add more visual variety to platforms and hazards
- Increase letter delivery tracking
- Browser verification and screenshots
- Push to GitHub PR
