# Technical Design

## Architecture

Single HTML file with embedded CSS and JavaScript. No build step, no dependencies.

## Rendering Pipeline

Each frame (60fps):
1. Clear canvas
2. Draw sky gradient
3. Draw stars (faint, static)
4. Draw moon glow (radial gradients)
5. Draw three mountain layers (fading into distance)
6. Draw sea with wave lines
7. Draw cliff silhouette
8. Draw pine tree (trunk + branches + foliage)
9. Draw fog layers (horizontal gradient + floating wisps)
10. Apply fog parting (radial gradient, destination-out)
11. Draw paper grain overlay
12. Apply vignette (multiply composite)
13. Draw seal
14. Draw entrance fade (during first 2.2s)

## Fog System

Five horizontal fog layers, each with:
- Different Y position and height
- Different speed (0.08 to 0.35 px/frame)
- Different scale factor for parallax
- Pre-computed offset for seamless looping
- Horizontal linear gradient with multiple color stops

Plus 10 floating wisps:
- Radial gradients
- Slow horizontal + vertical drift
- Boundary bouncing (vertical)

## Fog Parting

Uses Canvas `destination-out` composite operation:
- Radial gradient centered on cursor
- Center is fully opaque (clears fog), edges are transparent
- Radius adapts to screen size
- Fog gradually returns as cursor moves away

## Pine Tree

Procedurally generated:
- Trunk: 24-segment bezier with wind offset
- 10-13 branches with bezier curves
- Each branch has 3-5 foliage clusters
- Foliage drawn as irregular ellipses

## Performance

- No offscreen canvases except paper grain (generated once)
- No complex path operations in the render loop
- Simple gradients throughout
- Target: 60fps on mid-range laptop
