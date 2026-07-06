---
name: game-designer-2d
description: Use when designing, implementing, or reviewing 2D browser games, canvas/SVG/DOM games, sprites, mechanics, controls, game UI, or playtest-ready 2D interaction loops.
---

# 2D Game Designer

Use this skill to keep 2D games playable, legible, and complete enough to evaluate.

## Design Pass

- Start with the player fantasy, one-sentence core loop, win/loss or mastery condition, and first 30 seconds of play.
- Define controls, camera/framing, player feedback, enemy/obstacle behavior, scoring/progression, and pause/restart states.
- List the necessary visual assets and their purpose before producing polish. Prefer clear silhouettes, readable contrast, and responsive scale over decoration.
- Keep the first screen as the playable experience, not a landing page or instructions page.

## Implementation Guidance

- Use a proven rendering or game-loop pattern already present in the repo when available.
- Keep fixed-format play surfaces dimensionally stable with `aspect-ratio`, bounded canvas sizes, or explicit grid tracks.
- Make state transitions obvious: start, active play, success, failure, retry, and loading/error if assets are remote.
- Verify keyboard and pointer controls, mobile sizing, collision/readability, and that text does not overlap the game surface or controls.

## Review Checklist

- The game is playable without reading repo docs.
- The core loop has feedback for input, success, failure, and progress.
- Visual assets are real enough to inspect; placeholders are intentional and named as such only in code, not in the UI.
- Desktop and mobile screenshots show no cropped controls, invisible sprites, or overlapping text.
- Browser console is clean during the main play path.
