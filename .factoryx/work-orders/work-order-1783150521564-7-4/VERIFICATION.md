# Verification — Q3 Blocks Mini Live v4

## node --check
```
$ node --check games/q3-blocks-mini-live-v4/game.js
[no output — exit 0]
```
Result: **PASS** — game.js is syntactically valid (84 lines, under 90-line limit).

## File inventory
- `games/q3-blocks-mini-live-v4/index.html` — preview entrypoint, loads 3 scripts
- `games/q3-blocks-mini-live-v4/game.js` — game logic (84 lines), uses FoundryLoop + FoundryInput
- `games/q3-blocks-mini-live-v4/game-loop.js` — copied unchanged from `.factoryx/foundry/blocks-2d/game-loop.js`
- `games/q3-blocks-mini-live-v4/input.js` — copied unchanged from `.factoryx/foundry/blocks-2d/input.js`
- `games/q3-blocks-mini-live-v4/blocks_usage.md` — documents source paths and unchanged status

## Browser smoke test
- **Tool:** `chromium --headless --no-sandbox --screenshot`
- **URL:** `http://localhost:8765/games/q3-blocks-mini-live-v4/index.html`
- **Title screen:** Captured to `screenshots/title.png` — shows 10×20 grid, score counter "Score: 0", colored I-piece at top — **nonblank, PASS**
- **Active play:** CDP WebSocket connected successfully but `Page.captureScreenshot` response was not received within timeout. Virtual-time budget mode did not advance rAF-based game loop. This is a known headless Chromium limitation. Evidence of the rendered game state is in the title screenshot.
- **Console errors:** None observed during Chromium headless load (only dbus warnings which are environmental)

## Game mechanics verified by code inspection
- Colored blocks fall: auto-drop timer at 0.2s intervals
- Arrow/A-D moves: `held('left')` / `held('right')` check in update
- Up/W rotates: `consume('rotate')` triggers matrix rotation
- Space drops: `consume('drop')` hard-drops to nearest valid row
- Rows clear: complete rows splice out, new empty rows added to top
- Score changes: `score += n * 100 * n` for n cleared rows
- Rendering nonblank: canvas fills with dark bg, grid lines, colored blocks, score text

## Foundry blocks
- `game-loop.js`: copied verbatim, diff confirms 0 changes
- `input.js`: copied verbatim, diff confirms 0 changes

## Fresh re-verification (2026-07-04 07:55 UTC)

### node --check (re-run)
```
$ node --check games/q3-blocks-mini-live-v4/game.js
[no output — exit 0]
```
Result: **PASS** — game.js is syntactically valid (84 lines, under 90-line limit).

### Fresh browser screenshots
- **Title screen:** `screenshots/fresh_title.png` (5.9 KB) — shows 10×20 grid with dark bg, colored T-piece at top, "Score: 0" — **nonblank, PASS**
- **Active play:** `screenshots/delayed.png` (20 KB) — shows mid-game state with multiple placed blocks, grid lines visible, nonblank — **PASS**
- **Console errors:** None (only dbus environmental warnings)

### v3 failure mitigation
- **Uncommitted files:** All files committed in `3f35e5b`. `git status` shows only fresh screenshot evidence as untracked. Branch pushed before this verification run.
- **node --check failure:** v3 had an unexpected-token error; v4 game.js passes `node --check` cleanly with exit 0.
