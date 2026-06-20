# Preview - Kawanakajima Samurai Unity Playable Proof v8

## Browser Proof

- **Path:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Shows:** 20 samurai (10 Takeda/red, 10 Uesugi/blue) on a Japanese countryside battlefield, Foundry GLB loading, orbit camera, charge/reform/clash interactions, six camera presets, and audio cues.

## Unity Proof

- **Scene:** `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity`
- **Runtime:** `KawanakajimaRuntimeBootstrap` creates the world at Play Mode/build time.
- **Mac editor path:** `/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai`
- **Mac build output:** `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- **Unity MCP:** `http://172.21.0.1:25666`, ping returns `pong`.

## Verification Screenshots

| Shot | File | Description |
|------|------|-------------|
| Overview | `screenshots/unity_verify_v8.3.png` | Default camera with the full encounter loaded |
| Close | `screenshots/unity_red_close_v8.3.png` | Red Takeda-side close inspection |
| Wide | `screenshots/unity_wide_formation_v8.3.png` | Full battlefield formation |

## PR

- **PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167
- **Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
- **Base:** `main`
