# Moonlit Wave Courier — Technical System Design

## Overview
A single-file HTML5 Canvas side-scrolling arcade game. All assets drawn procedurally — no external dependencies.

## Core Systems

### 1. Game Loop
- requestAnimationFrame at 60fps
- Fixed timestep physics (1/60s) with render interpolation
- Delta-based movement

### 2. Parallax Scrolling
- 5 layers: moon/sky, distant mountains, mid mountains, foreground waves, foreground details
- Each layer scrolls at different speed for depth
- Moonlit color palette: deep indigo (#1a1f4e), dark blue (#0a0f3c), warm off-white (#f5f0e8), vermilion accents (#c23b27)

### 3. Player (Courier)
- Ink-wash style character: silhouette figure with flowing hakama
- States: running, jumping, dashing, surfing, falling
- Physics: gravity, jump velocity, dash with cooldown
- Hitbox: ~20x40px bounding box

### 4. Platforms & Terrain
- Wooden bridges, wave surfaces, paper-textured ground
- Procedural generation with gaps, elevation changes
- Scrolling toward player at base speed, accelerating over time

### 5. Hazards
- Yokai: shadowy figures that emerge from waves, move in patterns
- Wave crests: rising/falling water obstacles
- Paper tears: gaps in platform surfaces

### 6. Collectibles
- Sealed letters: deliver by reaching them (simple reach mechanic)
- Wind currents: horizontal speed boosts with visual wind lines
- Score streaks: consecutive deliveries increase multiplier

### 7. Scoring
- Distance-based base score
- Letter deliveries: +100 base * streak multiplier
- Streak multiplier: +1 per consecutive delivery, resets on hit
- High score persisted in localStorage

### 8. Difficulty Scaling
- Speed increases every 500m
- Hazard density increases
- Letter frequency stays consistent

### 9. UI/UX
- Start screen with title and START button
- HUD: score, streak, distance
- Game over screen with score and restart
- Touch controls: tap left/right for jump/dash, double-tap for special

### 10. Audio
- Web Audio API with user gesture trigger
- Sparse ambient: water sounds, wind whoosh, delivery chime
- All sounds synthesized, no external files

## File Structure
- Single index.html with embedded CSS and JS
- ~2000 lines total for game logic
- Canvas element fills viewport
- Responsive via CSS media queries
