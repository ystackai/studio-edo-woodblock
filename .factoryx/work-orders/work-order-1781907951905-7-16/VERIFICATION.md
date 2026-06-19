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
First screenshot shows distinct stylized armored figures with banners, swords, helmets, and team colors at readable framing distance. The original autonomous screenshot was too wide/dark, and the first replacement asset set still read too blocky in crowd view; this branch repairs camera distance, ground value, neutral light intensity, GLB scale, and then replaces the source samurai with the v3 Asset Foundry recipe.

## Foundry
- /healthz and /api/recipes verified at start.
- Original baseline job `asset-1781907989449-2310d4ab` was recorded but visually rejected after review.
- Replacement baseline job `asset-1781910294741-3c2a83a8` completed through the live Asset Foundry API in 343.9s.
- v3 outputs include GLB, source blend, six stable camera renders, eight turntable frames, contact sheet, and GIF.
- 20 actor GLBs were regenerated from the v3 source blend with team material variations.

## Unity
See `UNITY_BLOCKER.md`. No Unity Editor, Hub, or MCP detected. Scaffold + blocker emitted; no claim that Unity ran.

## Other
- Git branch: factoryx/factory-edo-woodblock/work-order-1781907951905-7-16
- All changes are on this salvage branch for review.
- This is not a clean autonomous success: the worker produced the assets/game commit but failed to create a PR because GitHub auth was unavailable in the runtime, and the camera/lighting proof needed operator repair.
