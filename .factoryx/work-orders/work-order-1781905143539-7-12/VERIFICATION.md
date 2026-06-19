# VERIFICATION — kawanakajima-samurai-world (work-order-1781905143539-7-12)

**Timestamp:** 2026-06-19

## Runtime Facts Verified Before Work
- Blender: 3.4.1
- `grok mcp doctor`: blender healthy (stdio, handshake, 7 tools)
- Asset Foundry: 127.0.0.1:18113 responded to /api/recipes containing `samurai_character`
- Unity: confirmed absent (no binary, no hub)

## Assets
- All 23 GLBs + contact sheets + turntables + sources under `games/kawanakajima-samurai-world/assets/generated/samurai/`
- Repair baseline came from Asset Foundry HTTP job `asset-1781906889338-2ba7800f`.
- See ASSET_MANIFEST.md

## Browser Runtime Verification (playwright + chromium)
Final repaired evidence from HTTP-served run at `http://127.0.0.1:18924/games/kawanakajima-samurai-world/`:

- Canvas present: 1280x800
- 20 GLB-backed actors loaded: 10 Takeda + 10 Uesugi.
- No uncaught JS errors. Only Chromium GPU `ReadPixels` warnings from screenshot capture.
- Interaction: "charge" mutated state (`phase=clash`, morale changed, casualty count changed).
- Initial state captured in `repair-verification.json`: `{"phase":"waiting","takedaMorale":92,"uesugiMorale":88,"fallenT":0,"fallenU":0,"armies":{"takeda":10,"uesugi":10}}`
- Post-charge state captured: `{"phase":"clash","takedaMorale":78,"uesugiMorale":82,"fallenT":1,"fallenU":0,"armies":{"takeda":10,"uesugi":10}}`
- Screenshots:
  - 01-initial.png (first viewport)
  - 02-after-click.png
  - 03-post-charge.png (state changed)
  - 04-post-reform.png
  - repair-initial.png (repaired close/low camera with v3 assets)
  - repair-post-charge.png (repaired interaction evidence)
- Viewport resize exercised without crash.
- Camera: initial low/shoulder 3/4 framing the space between armies (code + manual nudge).
- Controls responsive after first interaction (drag orbit, wheel).

HTTP-served verification confirmed UI elements, GLB fetches, and charge path are all reachable.

- Contact sheets from repeatable cameras (hero/front/left/rear/top/three_quarter) after generation and v3 repair pass.
- Two vision gateway calls performed (qwen3-vl:8b via runtime gateway). Raw JSON saved. Model identified armor components; foot volume improvement applied.
- Repaired browser view no longer reads as distant Minecraft-like blocks; banners/spears/team colors make 20 actors readable at game camera distance.
- Still stylized/funny rather than photorealistic; detailed plates/lacing/crest/mempo/sashimono visible in all 6 views.

## Post-Interaction
See 03-post-charge.png and the state object above. One encounter loop executed (charge → state change → reform).

## Conclusion
The repaired preview is coherent, uses the generated v3 foundry GLBs, satisfies playable 3D + interaction + evidence requirements for the browser fallback. Unity blocker recorded separately.
