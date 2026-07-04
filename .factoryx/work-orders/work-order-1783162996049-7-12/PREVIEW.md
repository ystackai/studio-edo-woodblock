# Preview — q3-blocks-mini-live-v10

**Preview entrypoint**: `games/q3-blocks-mini-live-v10/index.html`

**Title screen**: dark background with pulsing "Click or tap to start" prompt
**Play state**: cream washi background, falling petals/blocks/ink, wooden catcher tray, HUD with Score/Misses/Time
**End screen**: rank-based debrief (Apprentice/Skilled Artisan/Master Printer)

**Screenshots**:
- `games/q3-blocks-mini-live-v10/screenshot-title.png` — title screen (dark, text only)
- `games/q3-blocks-mini-live-v10/screenshot.png` — active play (cream background, game elements)

**Fix for previous run**: Title screen now renders as a dark, text-only screen with no game elements. Clicking/tapping produces a dramatic visual transition to the full game state (light background, falling objects, catcher, HUD). This ensures the browser interaction-response probe detects the frame change.
