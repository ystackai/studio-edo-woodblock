# Preview — Kawanakajima Samurai Battlefield Playable Unity Deliverable

**Work Order:** work-order-1781989579492-7-1
**Last Updated:** 2026-06-20

## Primary Preview

**Browser proof:** `games/kawanakajima-foundry-samurai-proof/index.html`

The preview opens a Three.js WebGL scene with 20 samurai (10 Takeda/red, 10 Uesugi/blue) arrayed on a Japanese countryside battlefield.

### Controls

| Input | Action |
|-------|--------|
| Mouse drag | Orbit camera around scene |
| Mouse wheel | Zoom in/out |
| Click samurai | Inspect individual (faction info panel) |
| `1` / OVERVIEW | Wide battlefield overview |
| `2` / RED CLOSE | Close-up on Takeda (red) line |
| `3` / BLUE CLOSE | Close-up on Uesugi (blue) line |
| `4` / SIDE | Side profile of formation |
| `5` / TOP | Top-down tactical formation view |
| `6` / INSPECT | Asset detail close-up on hero samurai |
| `C` / CHARGE | Both sides charge toward each other |
| `R` / REFORM | Samurais return to formation |
| `A` / AUDIO | Toggle battlefield ambient loop |
| `X` / CLASH | Play clash SFX |
| `P` / PACK | Toggle Foundry battlefield pack view |

## Unity Handoff

**Source:** `unity/kawanakajima-samurai/`  
**Scene:** `Assets/Kawanakajima/Scenes/Kawanakajima.unity`  
**Bootstrap:** `KawanakajimaRuntimeBootstrap.cs` (758 lines, 20 samurai, charge/reform/audio/camera)  
**Build hooks:** `KawanakajimaUnityBuild.cs` (WebGL, Linux, Mac targets)

### Unity Mac Build (v8.4 verified)
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Size: 112 MB
- Unity: 2023.2.20f1
- Batch mode: Exit code 0

## Unity MCP

- Listener: `http://host.docker.internal:27481/mcp` (gamedev-mcp-server 8.0.0.0)
- Mac Studio bridge: `http://172.21.0.1:25666` (unreachable from worker)
- MCP tools listed but not callable via RPC (405 errors) — likely proxy configuration issue
- Unity Editor Play Mode verification requires local Mac Studio access

## Screenshot Gallery

| View | File | Size |
|------|------|------|
| Wide overview | `screenshots/overview.png` | 746 KB |
| Takeda (red) close | `screenshots/redClose.png` | 781 KB |
| Uesugi (blue) close | `screenshots/blueClose.png` | 838 KB |
| Side profile | `screenshots/sideProfile.png` | 744 KB |
| Top formation | `screenshots/topFormation.png` | 796 KB |
| Asset inspect | `screenshots/assetInspect.png` | 779 KB |
| Unity MCP wide formation | `screenshots/mcp_wide_formation_v8.png` | 745 KB |
| Unity MCP hero 3Q | `screenshots/mcp_hero_3q_v8.png` | 742 KB |
| Unity MCP game view | `screenshots/mcp_game_view_v8.png` | 184 KB |
| Foundry contact sheet | `screenshots/foundry-contact-sheet.png` | 288 KB |
| Foundry hero render | `screenshots/foundry-hero.png` | 722 KB |

## Visual Quality

- **Samurai silhouettes:** Readable as samurai with helmet, armor, weapons, banners
- **Faction colors:** Red Takeda vs blue Uesugi clearly distinct
- **Lighting:** PCFSoft shadows, ACES tone mapping, atmospheric fog, vignette
- **Scale:** Proper proportions, not tiny blocks or dots
- **Animation:** Idle breathing, charge LERP, reform animation
