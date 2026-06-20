# Preview - Kawanakajima Samurai Unity Playable Proof v8

## Browser Proof

- **Path:** `games/kawanakajima-foundry-samurai-proof/index.html`
- **Shows:** 20 samurai (10 Takeda/red, 10 Uesugi/blue) on a Japanese countryside battlefield, Foundry GLB loading, orbit camera, charge/reform/clash interactions, six camera presets, and audio cues.
- **Controls:** drag orbit, wheel zoom, keyboard shortcuts (1-6 cameras, C charge, R reform, A audio, X clash), click-to-inspect
- **Review panel:** contact sheet, hero image, faction info per samurai click

## Unity Proof

- **Scene:** `unity/kawanakajima-samurai/Assets/Kawanakajima/Scenes/Kawanakajima.unity`
- **Runtime:** `KawanakajimaRuntimeBootstrap` creates the world at Play Mode/build time.
- **Mac editor path:** `/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai`
- **Mac build output:** `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- **Unity MCP:** `http://172.21.0.1:25666`, ping returns `pong`.
- **Scene state:** 20 actors loaded, status `KAWANAKAJIMA_UNITY_READY`, root count 73

## Verification Screenshots (12 total)

| Shot | File | Description |
|------|------|-------------|
| Overview | `screenshots/unity_verify_v8.3.png` | Default camera with all 20 samurai on battlefield |
| Close (Red) | `screenshots/unity_red_close_v8.3.png` | Red Takeda samurai close inspection |
| Wide Formation | `screenshots/unity_wide_formation_v8.3.png` | Full battlefield with terrain, trees, hills |
| Side Profile | `screenshots/unity_side_v8.4.png` | Formation side view |
| Top Down | `screenshots/unity_top_v8.4.png` | Tactical top-down formation |
| Blue Close | `screenshots/unity_blue_close_v8.4.png` | Blue Uesugi samurai close inspection |
| Build Verify | `screenshots/unity_build_verify_v8.4.png` | Post-build scene check |
| Final | `screenshots/unity_final_v8.4.png` | Blue samurai hero shot |
| Hero 3Q | `screenshots/unity_hero_three_quarter_v8.5.png` | Dramatic shoulder-angle close-up |
| Takeda Close | `screenshots/unity_takeda_close_v8.5.png` | Red samurai detail — helmet, armor, katana |
| Uesugi Close | `screenshots/unity_uesugi_close_v8.5.png` | Blue samurai detail — faction color distinct |
| Rear View | `screenshots/unity_rear_view_v8.5.png` | Both armies from behind, sashimono banners |

## PR

- **PR:** https://github.com/ystackai/studio-edo-woodblock/pull/167
- **Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
- **Base:** `main`
- **Checks:** facts ✅, ci ✅, deploy-preview ✅
