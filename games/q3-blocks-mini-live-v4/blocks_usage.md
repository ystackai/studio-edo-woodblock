# Blocks Usage

## Modules Copied

### game-loop.js
- **Source:** `.factoryx/foundry/blocks-2d/game-loop.js`
- **Status:** Copied unchanged — zero modifications
- **Purpose:** Fixed-timestep game loop (60 Hz) with `update(dt)` / `render(alpha)` lifecycle and tab-blur pause

### input.js
- **Source:** `.factoryx/foundry/blocks-2d/input.js`
- **Status:** Copied unchanged — zero modifications
- **Purpose:** Keyboard/pointer input with buffered press consumption; drives move, rotate, and drop actions

## Adaptation Notes

No key changes were made to either block. Both files were copied verbatim from the foundry and loaded via `<script>` tags in `index.html`. The game code (`game.js`) uses the public APIs `FoundryLoop.start()` and `FoundryInput.install()` exactly as documented in the block header comments.
