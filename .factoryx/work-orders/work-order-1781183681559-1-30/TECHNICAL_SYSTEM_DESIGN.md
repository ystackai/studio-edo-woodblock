# Technical Design: lantern rain

## Overview
Single-file Canvas 2D game with atmospheric rain and lantern mechanics.

## Architecture
- Single HTML file with embedded CSS and JavaScript
- Canvas-based rendering at device pixel ratio (retina support)
- requestAnimationFrame game loop with delta-time updates
- Idle loop for pre-start atmospheric rendering

## Systems

### Scene Rendering
1. **Background**: Linear gradient (deep navy to indigo) with subtle ground reflection
2. **Lantern body**: Ellipse with radial gradient for paper texture, vertical rib lines, bamboo caps, tassel
3. **Flame**: Radial gradient with flicker (sine waves), warm color palette
4. **Glow**: Radial gradient halo around lantern, intensity modulated by flame steadiness
5. **Rain**: 350 diagonal line particles with variable speed, length, opacity, wind
6. **Splashes**: Elliptical particles at lantern rain impact points
7. **Motes**: Floating warm particles drifting upward from lantern
8. **Grain**: Perlin noise overlay for film texture
9. **Vignette**: Radial darkening at edges
10. **Shield overlay**: Soft dark glow + warm ellipse when shielding

### State Machine
- **Idle**: Pre-start atmospheric rendering, rain drops fall slowly
- **Active**: Full game loop with shield mechanic, flame dynamics, rain physics
- **Shielding**: Shield intensity increases (ease-in), rain dimming, patience builds
- **Released**: Shield intensity decreases (ease-out), flame steadiness increases based on patience, patience decays

### Input
- Pointer events (mouse + touch) for shield interaction
- Start overlay click/touch to begin experience
- AudioContext created on first user gesture (no autoplay)

### Audio
- Brown noise via AudioContext (generated procedurally)
- Lowpass filter at 800Hz for rain texture
- Volume: 0.18 normal, 0.08 when shielding (rain muffles under shield)
- All audio starts on user gesture only

## Performance
- ~350 rain drops + ~80 splash particles + ~40 motes
- Perlin noise grain rendered on 3px grid (~100-200 cells per frame)
- Canvas 2D with simple shapes (no complex paths)
- Target: 60fps on mid-range laptop
