# Test API

## Verification Suite

Run `node verify.js` from the checkout root to check:

- `drops/ukiyo-e-printer/index.html` — interactive woodblock printer
  - Canvas rendering with procedural ukiyo-e drawing
  - Click/touch handlers on 4 color blocks (key, red, blue, yellow)
  - Reset button and keyboard shortcuts (1-4 for blocks, R for reset)
  - Stamp animation and completion state
  - Layer ordering enforcement (key → red → blue → yellow)

- `drops/floating-world/index.html` — existing seasonal canvas interaction

- `studio.json` — games manifest includes both drops

- `drops/index.html` — catalog page wiring
