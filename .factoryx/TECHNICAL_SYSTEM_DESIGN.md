# Technical System Design — Asset Skill Smoke

**Work Order:** `work-order-asset-skill-smoke-edo-20260522`

## Asset Service Integration

- **Endpoint:** `http://100.97.47.98:8766`
- **Health check:** `GET /health` — returned ok=true
- **Available providers:** Flux (ComfyUI), MMAudio
- **Unavailable providers:** Trellis 2 (procedural-smoke), HeartMuLa (procedural-smoke)
- **Request:** POST `/v1/proof-pack` with JSON body containing prompt

## Generated Assets

| Asset | Tool | Path | Format | Size |
|-------|------|------|--------|------|
| Background image | Flux/ComfyUI | `public/assets/flux-bg-wave.png` | PNG | 449 KB |
| Water-drop SFX | MMAudio | `public/assets/mmaudio-waterdrop.wav` | WAV | 62 KB |
| Ambient loop | HeartMuLa (smoke) | `public/assets/heartmula-ambient.wav` | WAV | 353 KB |

## Integration Points in `drops/indigo-stutter/index.html`

1. **`#generated-bg` div** — New HTML element with CSS pointing to the Flux background. Set to `opacity: 0.25`, `z-index: 1`, behind all other game layers.

2. **`preloadAudio()` helper** — Fetches a WAV file, decodes it via Web Audio API, returns the AudioBuffer. Called for the MMAudio waterdrop at game start.

3. **`playWetDrop()` updated** — Checks `wetDropBuffer` first; if loaded, uses the generated MMAudio asset. Falls back to procedural noise if unavailable.

4. **`startGame()` updated** — Creates `new Audio()` for the HeartMuLa ambient loop and calls `preloadAudio()` for the MMAudio wet-drop. Both have silent `.catch()` fallbacks.

## Audio Safety

- All audio is triggered by the user clicking START (user-gesture safe).
- `.catch(() => {})` on all `play()` calls — silent fallback if blocked.
- Wet-drop uses AudioContext buffer (synchronous playback, no autoplay issues).

## Asset Manifest

`public/assets/asset-manifest.json` lists all generated assets with id, kind, path, tool, prompt, intendedUse, dimensions/duration, size, status, license, and verification notes.
