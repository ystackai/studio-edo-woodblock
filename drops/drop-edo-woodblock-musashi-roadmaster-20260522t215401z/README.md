# Way of the Brush and Blade

A single-file interactive web piece set on the old Tōkaidō road. You play as a wandering swordsman in the style of Miyamoto Musashi, stopping at five scenic waypoints. At each stop, choose between **steel** (a timing-based draw-cut duel) or **brush** (a sumi-e composition minigame). Both build a shared **mastery** resource that shapes the final duel at Ganryūjima.

## How to play

1. **Title screen** — press ENTER or click "Begin the Journey"
2. **Five waypoints** — read the prose vignette, then choose:
   - **Draw Your Blade** — a timing minigame: press SPACE when the ink stroke aligns with the target zone
   - **Take Up the Brush** — select 3 of 6 sumi-e strokes (keys 1-6 or click), then drag/click to place them in the composition
3. **Final duel at Ganryūjima** — five rounds with feint detection. Higher mastery makes the opponent's patterns slower and more readable
4. **Three endings** based on mastery + duel result:
   - *The Wooden Oar* (mastery ≥ 80 and duel won) — triumphant
   - *The Long Path* (won with lower mastery) — bittersweet
   - *The Other Shore* (duel lost) — the journey reframed

## Technical

- **Single `index.html`** — vanilla JS + CSS, no build step, no external CDN
- **Assets** in `assets/` — generated via the FactoryX asset service (`POST /v1/proof-pack`) with three distinct prompts for visuals and audio
- **Save** via `localStorage` under key `edo-musashi-roadmaster-v1`
- **Accessibility** — keyboard alternatives for every interaction (SPACE for timing, 1-6 + ENTER for brush)
- **Aesthetic** — ukiyo-e / sumi-e palette with accent `#8B4513`, ink-wash textures, vertical-friendly layout

## File structure

```
drops/drop-edo-woodblock-musashi-roadmaster-<timestamp>/
├── index.html          # Complete game (single file)
├── README.md           # This file
├── CHANGELOG.md        # Version history
└── assets/
    ├── pack1-style-frame.png    # Title card / vignette art
    ├── pack1-music-loop.wav     # Ambient music
    ├── pack1-sfx.wav            # Ambient SFX (cicadas / footsteps)
    ├── pack2-style-frame.png    # Duel screen background
    ├── pack2-music-loop.wav     # Duel music
    ├── pack2-sfx.wav            # Draw-cut sound
    ├── pack3-style-frame.png    # Brush minigame background
    ├── pack3-music-loop.wav     # Brush music
    └── pack3-sfx.wav            # Brush SFX
```

## Credits

Built for the Pictures of the Floating World studio. Assets generated through FactoryX's proof-pack pipeline using Flux (style frames), MMAudio (SFX), and HeartMuLa (music loops).
