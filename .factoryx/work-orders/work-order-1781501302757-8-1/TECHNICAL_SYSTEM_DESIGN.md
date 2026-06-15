# Moonlit Wave Courier — Technical System Design (Updated)

## Overview
A single-file HTML5 Canvas side-scrolling arcade game. All assets drawn procedurally — no external dependencies.

## Core Systems

### 1. Game Loop
- requestAnimationFrame at 60fps with fixed timestep (1/60s)
- Delta-based movement with accumulator pattern
- Particle cap at 120 for performance

### 2. Parallax Scrolling
- 5+ layers: moon/sky, stars (60 with twinkling), 3 mountain layers, mist, water with ripples, floating lanterns
- Each layer scrolls at different speed for depth
- Moonlit color palette: deep indigo (#1a1f4e), dark blue (#0a0f3c), warm off-white (#f2edd8), vermilion (#c23b27), gold (#d4a843)

### 3. Player (Courier)
- Ink-wash style character: silhouette with hakama, kasa hat, flowing vermilion scarf
- States: running, jumping, dashing (invulnerable), surfing, falling, dead
- Physics: gravity, jump velocity, dash with cooldown and trail
- Hitbox: ~20×40px bounding box
- Squash/stretch: cubic ease-out for landing and jumping
- Death animation: spin + ink splash particles

### 4. Platforms & Terrain (4 types)
- **Wooden bridges**: Deck with wood grain, railings, moonlight highlights
- **Bamboo bridges**: Segments with node rings, suspension ropes
- **Stone platforms**: Irregular shape with texture dots, edge highlights
- **Wave surfaces**: Animated sine-wave tops with foam particles

### 5. Hazards
- **Yokai**: Shadowy figures, pulsing vermilion eyes, wispy tendrils, mist aura — emerg from waves, sinusoidal movement
- **Wave crests**: Rising/falling water obstacles with foam drops
- Spawn rate scales with distance

### 6. Collectibles
- **Sealed letters**: Paper documents with vermilion seal, golden glow, collect for streak score
- **Wind currents**: Horizontal speed boost zones with wind line particles

### 7. Scoring
- Distance-based score (score += speed every 6 frames)
- Letter deliveries: +100 base × streak multiplier
- Wind current pickup: +25
- Streak multiplier: +1 per consecutive delivery, resets on hit
- Milestone popups at 500, 1500, 3000, 5000, 8000, 12000, 20000, 30000
- High score persisted in localStorage

### 8. Difficulty Scaling
- Speed increases every 500m
- Hazard spawn rate increases with distance
- Max scroll speed: 8.5 (from base 3.2)

### 9. UI/UX
- Start screen: title with Japanese characters, fade-in animation
- HUD: score, streak multiplier (with bump animation), distance
- Game over: score, distance, deliveries, high score with ★ NEW HIGH SCORE ★ celebration
- Touch controls: 64×64px buttons, responsive sizing for small screens
- Controls hint on title screen

### 10. Audio (Web Audio API)
- **Ambient**: Water hum (60Hz sine), wind (180Hz sine), wave rumble (35Hz + LFO modulation)
- **SFX**: Jump (280Hz triangle), Dash (120→60Hz sawtooth sweep), Letter (523-659-784Hz ascending chime), Hit (80Hz sawtooth + noise burst), Wind (200→350Hz triangle sweep)
- **Streak celebration**: Ascending tones at 3× streak intervals
- All audio gated by user gesture (START button)

### 11. Particle System
- Max 120 particles
- Types: splash (landing), dust (running), dash trail, letter collect burst, death ink splash, dash burst, wind particles, foam drops
- Each particle: position, velocity, life, decay, size, color

### 12. Visual Effects
- Screen shake on hit (28 frames, intensity ramp)
- Screen flash (white for collect, red for hit)
- Squash/stretch with cubic easing
- Star twinkling with randomized phases
- Lantern flicker
- Moonlight reflections on water and platforms
