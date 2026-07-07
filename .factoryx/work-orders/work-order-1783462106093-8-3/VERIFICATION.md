# Verification — Drifting River Prints (Take 3)

## Browser Runtime Fix
**Previous blocker:** `Uncaught ReferenceError: FoundryShake is not defined` at line 368 of the runtime check HTML.

**Root cause:** `screen-shake.js` was used in the game logic (line 159: `FoundryShake.create()`) but the script tag was missing from `index.html`. The file existed in the foundry blocks (`.factoryx/foundry/blocks-2d/screen-shake.js`) but was never copied to the game directory.

**Fix:**
1. Copied `screen-shake.js` from foundry blocks to `drops/drift-river-prints/screen-shake.js`
2. Added `<script src="screen-shake.js"></script>` after `rng.js` in index.html
3. Fixed `blocks_usage.md` to accurately list all 7 foundry blocks used

## Smoke Test Results
- **Tool:** Chromium headless, window 1024×768
- **URL:** `http://localhost:8765/index.html`
- **Result:** PASS — no JavaScript errors, no pageerror events
- **Screenshot:** `/tmp/drift_verify_screenshot.png` (25K)
- **Canvas renders:** Title screen with "流れ川" (flowing river) Japanese text, "DRIFTING RIVER PRINTS" title, washi paper background with scroll border and water current lines

## Preview
- **Preview path:** `drops/drift-river-prints/index.html`
- **`.factoryx/preview-entrypoint`:** `drops/drift-river-prints/index.html` ✓
- **PR:** #202 on `factoryx/factory-edo-woodblock/work-order-1783462106093-8-3`
