# Preview — Edo Inkblade: Road Opens

## How to Play

1. Open the game at `games/inkblade/index.html` (or the `games/` redirect).
2. Click **Begin** on the title screen.
3. The player (blue inkblade samurai) auto-walks toward the torii gate.
4. When you reach the guard (red figure at the gate), the **duel** begins.
5. A timing bar appears — press **SPACE** when the cursor is in the **blue zone**.
6. Land 3 successful counter-strikes to defeat the guard.
7. The gate creaks open with a generated sound effect.
8. Walk through the opened gate to reach the **win screen**.

## Controls

| Key | Action |
|-----|--------|
| `←` `→` | Move player |
| `SPACE` | Counter-strike (during duel) |
| `R` | Retry (if defeated) |

## Visual Design

- **Ukiyo-e aesthetic**: Woodblock print style with sumi-e ink wash feel.
- **Generated background**: A Flux-generated image of a Japanese road leading to a torii gate at dusk, with mountains, cherry blossoms, and amber moonlight (960×540 PNG).
- **Characters**: Stick-figure samurai with bold colors (blue = player, red = guard).
- **Gate**: Animated wooden doors that swing open after the guard is defeated.

## Audio

- **Gate-open SFX**: MMAudio-generated sound of a heavy wooden gate creaking open.
- **Procedural fallback**: Oscillator-based sounds for footsteps, strikes, and gate opening.

## Generated Assets

| Asset | Tool | Status |
|-------|------|--------|
| Background image (generated-bg.png) | Flux (ComfyUI) | ✅ In-game |
| Gate-open SFX (generated-gate-open.wav) | MMAudio | ✅ In-game |
| Ambient loop (generated-loop.wav) | HeartMuLa (procedural-smoke) | Prototype (stored, not yet played) |

See `public/assets/asset-manifest.json` for full details.
