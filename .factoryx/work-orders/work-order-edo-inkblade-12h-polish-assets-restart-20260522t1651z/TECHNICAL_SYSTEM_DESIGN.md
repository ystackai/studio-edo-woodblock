# Technical System Design — Edo Inkblade: Road Opens

## Architecture

Single HTML file with embedded CSS and JS. Canvas-based rendering at 960x540 (16:9), scaled to fit viewport.

## Game States

| State | Description |
|-------|-------------|
| `START` | Title screen with start button (audio context init) |
| `APPROACH` | Player walks toward the blocked road |
| `DUEL` | Active combat with the guard (timed inputs) |
| `OPENING` | Gate/road opens with animation |
| `CROSS` | Player walks through the opened road |
| `WIN` | Victory screen with continue option |

## Input

- **Arrow keys**: Move player (left/right in APPROACH, left/right dodge in DUEL)
- **SPACE**: Strike/attack in DUEL
- Game auto-transitions from START→APPROACH on click, then proceeds automatically

## Rendering Layers

1. **Background**: Sky, mountains, road (procedural + generated asset)
2. **Midground**: Gate/guard structure, road surface
3. **Characters**: Player (inkblade samurai), Guard (blocking figure)
4. **Effects**: Slash marks, particles, ink splatter, gate animation
5. **HUD**: Health bars, controls reminder, objective text

## Audio

- Procedural: Oscillator-based SFX for footsteps, strikes, gate open
- Generated: MMAudio gate-open SFX, Flux background image
- All audio behind user-gesture (start button click)

## Generated Assets

| Asset | Tool | Purpose |
|-------|------|---------|
| Road/gate scene background | Flux (ComfyUI) | Replace procedural background |
| Gate-open SFX | MMAudio | Replace procedural gate sound |

Graceful fallback: If asset request fails, game uses procedural placeholders with no visible degradation.

## Canvas Coordinate System

- Canvas: 960 × 540
- Road center: x=480, spans y=340 to y=540
- Gate position: y=340 (horizon-ish)
- Player start: x=480, y=470
- Guard position: x=480, y=320 (at the gate)

## Duel Mechanics

- 3-round timing game: guard winds up an attack, player must press SPACE at the right moment
- Guard shows a windup animation (2-3 seconds), then attacks
- Player has a ~0.5s window to counter-strike with SPACE
- 3 successful counters = guard falls, gate opens
- Missing a counter reduces player health; 0 health = retry
