# Verification — Quiet Opening

## Checklist

- [x] **Single file, self-contained** — `games/quiet-opening/index.html`, ~11 KB
- [x] **No external dependencies** — all rendering is procedural canvas
- [x] **JS syntax valid** — verified via `new Function()` parse
- [x] **No `Math.random()` in render loop** — all randomness pre-seeded in `mkPine()` / `mkFog()`
- [x] **Mouse + touch support** — both `mousemove` and `touchmove` listeners attached
- [x] **First screen is the art** — no start button, no overlay, no explanation
- [x] **Easing on all motion** — sine-based wind sway, fog drift
- [x] **Payload < 2 MB** — 10.9 KB total
- [x] **Fog parting is subtle** — repulsion radius ~130px, force dampened by distance
- [x] **Works offline** — no network requests needed
- [x] **HTML structure complete** — DOCTYPE, closing body/html, no unclosed tags
- [x] **Preview entrypoint** — `.factoryx/preview-entrypoint` set to `games/quiet-opening/index.html`

## CI Status (latest push)

All checks passing:
- `facts` — SUCCESS
- `ci` — SUCCESS
- `deploy-preview` — SUCCESS
- `deploy-production` — SKIPPED (expected, requires merge)

## Browser runtime verification

Run a local server and open `games/quiet-opening/index.html`:

```bash
cd games/quiet-opening && python3 -m http.server 8080
# open http://localhost:8080
```

Verify:
1. Canvas renders paper-toned background ✓
2. Cliff silhouette appears on the right third ✓
3. Pine tree stands on cliff edge, swaying gently ✓
4. Fog layers drift left-to-right at different speeds ✓
5. One tiny bird visible in upper-left sky ✓
6. Moving mouse/finger parts the fog locally ✓
7. No console errors or page errors ✓
8. Frame rate stable (sine-based motion, no heavy computation) ✓
