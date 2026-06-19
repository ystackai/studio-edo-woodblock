# VERIFICATION

## Browser runtime (Playwright over HTTP)
- Server: python -m http.server on 18935 serving the checkout root.
- URL exercised: http://127.0.0.1:18935/games/kawanakajima-autonomous-samurai-proof/
- Tool: Playwright Chromium (headless), viewport 1280x800.
- Script: local Playwright repair verification after the worker run failed before PR creation.

### Results
- 20/20 actors loaded (Takeda + Uesugi GLBs)
- 0 page errors
- 0 console errors during load + interactions
- Canvas renders non-blank content and the first screenshot uses close shoulder framing so the armor, banners, swords, and body silhouettes are reviewable.
- Charge interaction mutates state (window.KAWANAKAJIMA.isCharging() === true after call, actors visibly advance)
- Reform resets positions/state

### Evidence
- `screenshots/initial-formation.png`
- `screenshots/after-charge.png`
- `screenshots/reformed.png`
- `evidence/verification.json` (and copy at game root)
- Full JSON also under work-order context.

### Visual gate
First screenshot shows distinct armored figures with banners, readable at framing distance (not Minecraft blocks, not tiny dark blobs). The original autonomous screenshot was too wide/dark; this branch repairs camera distance, ground value, neutral light intensity, and GLB scale, then refreshes the screenshots.

## Foundry
- /healthz and /api/recipes verified at start.
- Fresh job `asset-1781907989449-2310d4ab` for baseline (recorded).
- 5 additional full Foundry jobs were launched by the agent but were unnecessary and later stopped after the Work Order failed; the completed baseline job is the source of record.
- All GLBs + source .blend + contact/turntable from this run's output dir.

## Unity
See `UNITY_BLOCKER.md`. No Unity Editor, Hub, or MCP detected. Scaffold + blocker emitted; no claim that Unity ran.

## Other
- Git branch: factoryx/factory-edo-woodblock/work-order-1781907951905-7-16
- All changes are on this salvage branch for review.
- This is not a clean autonomous success: the worker produced the assets/game commit but failed to create a PR because GitHub auth was unavailable in the runtime, and the camera/lighting proof needed operator repair.
