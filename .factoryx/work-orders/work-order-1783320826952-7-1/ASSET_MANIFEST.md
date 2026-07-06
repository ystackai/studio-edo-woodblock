# Asset Manifest

**Work Order:** `work-order-1783320826952-7-1`  
**Factory:** `factory-edo-woodblock`  
**Artifact:** `games/94-kawanakajima/index.html` (ukiyo-e printmaking interaction)

---

## Generated Assets

### Foundry Assets

| Asset | Source | Path | Size | Integration |
|-------|--------|------|------|-------------|
| Music loop (cozy bunny tracker) | Asset Foundry `cozy_audio_pack` recipe | `games/94-kawanakajima/assets/generated/music.mp3` | 485K | Available as ambient loop; procedural audio used by default |
| Soft impact puff (SFX) | Asset Foundry `cozy_audio_pack` | `games/94-kawanakajima/assets/generated/soft_impact.wav` | 73K | Available for brush stroke feedback |
| UI confirm glass (SFX) | Asset Foundry `cozy_audio_pack` | `games/94-kawanakajima/assets/generated/ui_confirm.wav` | 83K | Available for finish/print action |
| Foundry samurai baseline (reference) | Asset Foundry `samurai_character` | `games/94-kawanakajima/assets/reference/foundry-samurai-baseline/` | ~1.1MB GLB | Visual reference; not directly used in game |

**Foundry Job IDs:**
- Music + SFX pack: `asset-1783323741757-6dbd120d`
- Samurai baseline: `asset-1781842494700-82b4a4e8`

### Procedural Assets (generated in-browser)

| Asset | Method | Integration |
|-------|--------|-------------|
| Paper texture (washi grain) | Procedural noise + fiber lines on offscreen canvas | Background layer under ink |
| Mt. Fuji silhouette | Procedural canvas drawing | Background landscape layer |
| Mist layers | Procedural animated gradients | Foreground atmosphere |
| Ink bloom marks | Radial gradients + irregular edge rendering | Core interaction visual feedback |
| Seal stamp (印) | Procedural vermilion square + Japanese character | Finish overlay |

### Audio (Procedural, Web Audio API)

| Sound | Method | Trigger |
|-------|--------|---------|
| Brush on paper | High-pass filtered noise burst + sine resonance | Each ink bloom/placement |
| Baren press thud | Sine wave frequency sweep (100→35Hz) | Long press (600ms+) |
| Ambient wind | Bandpass-filtered brown noise loop | Always-on when sound enabled |
| Temple drone | Dual sine oscillators (82Hz, 123.5Hz) | Always-on when sound enabled |

---

## Verification

- [x] Canvas renders on page load with paper texture and Mt. Fuji silhouette
- [x] Click produces visible ink bloom with radial gradient + irregular edge
- [x] Drag produces stroke with soft ink bleed layer
- [x] Long press (600ms+) deepens area with vermilion accent
- [x] Rapid clicking triggers paper saturation (diminishing returns)
- [x] Audio initializes on user gesture, not autoplay
- [x] Sound toggle button works (♪ / ♫)
- [x] Finish button captures canvas + seal stamp as PNG download
- [x] Reset clears all ink and resets saturation
- [x] Keyboard shortcuts: R=reset, S=finish
- [x] Responsive scaling to fit viewport
- [x] Touch targets ≥ 44px for mobile
- [x] No browser console errors
- [x] Foundry audio assets downloaded and referenced

---

## Notes

- The primary audio system is procedural (Web Audio API) — no external audio files required.
- Foundry audio assets are available as supplementary content but the game works with procedural audio alone.
- The paper texture and mist are procedurally generated each page load.
- The seal stamp (印) is slightly randomized in position and rotation for hand-crafted feel.
- All assets are self-contained; no external network dependencies after initial load.
