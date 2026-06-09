# Verification — Edo Inkblade: Road Opens

## Browser Smoke Test

**Tool:** Playwright + Chromium (headless)
**Script:** `inkblade-smoke.mjs` (run from checkout root with `node`)

### Results (latest run)

| Check | Status |
|-------|--------|
| Canvas element exists | ✅ PASS |
| Canvas is 960×540 | ✅ PASS |
| Objective text visible | ✅ PASS |
| Controls hint visible | ✅ PASS |
| Health bars present | ✅ PASS |
| Start overlay present | ✅ PASS |
| Game transitions to APPROACH after start | ✅ PASS |
| Game transitions to DUEL after approach | ✅ PASS |
| Duel system tracks guard HP | ✅ PASS |
| Duel system tracks player HP | ✅ PASS |
| Guard is taking damage | ✅ PASS |
| Generated assets loaded | ✅ PASS |
| No critical JS errors | ✅ PASS |

### Asset Paths Fixed

- Generated assets are at `public/assets/` — asset loading paths in `games/inkblade/index.html` corrected from `../assets/` to `../../public/assets/`
- Assets served correctly under HTTP (404 errors under file:// expected, resolved under HTTP)

## Acceptance Criteria Verification

| Criterion | Status | Notes |
|-----------|--------|-------|
| Preview opens directly into playable game | ✅ | Click "Begin" → game starts immediately |
| Controls/objective visible in <10s | ✅ | HUD shows controls + objective text on first screen |
| Player triggers duel/obstacle resolution | ✅ | 3-round timing duel with guard |
| Road opening is visually unmistakable | ✅ | Gate doors swing open with animation |
| Player reaches opened path with win feedback | ✅ | CROSS state → WIN screen with "Road Opened!" |
| Enemy actively supports interaction | ✅ | Guard patrols, winds up attacks, lunges at player |
| Asset skill doc read and followed | ✅ | Used FACTORYX_GAME_ASSET_SERVICE_URL |
| Proof pack requested via service | ✅ | Flux image + MMAudio SFX generated |
| Generated assets loaded with fallback | ✅ | Procedural fallback for all assets |
| Asset manifest complete | ✅ | public/assets/asset-manifest.json |
| Browser smoke covers all required checks | ✅ | Canvas, errors, page errors, post-play state |

## Run Instructions

```bash
# Serve and play manually
cd /path/to/checkout
python3 -m http.server 8080
# Open http://localhost:8080/games/inkblade/

# Run Playwright smoke test (requires Playwright + Chromium installed)
cd /path/to/checkout
npx playwright install chromium
node inkblade-smoke.mjs
```
