# Asset Manifest — Kawanakajima Samurai v9.2

## Foundry-Generated Assets

### Samurai Character GLB
| Field | Value |
|-------|-------|
| Path | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` |
| Unity path | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` |
| Size | 1.23 MB (1,285,892 bytes) |
| Provenance | Foundry v5 samurai generation (2026-06-20) |
| Format | glTF 2.0 (.glb) binary |
| Meshes | 241 MeshFilter components (72,927 vertices total) |
| Orientation | As specified by foundry pipeline pivot notes |

### Samurai Character Contact Sheet
| Field | Value |
|-------|-------|
| Path | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_contact_sheet.png` |
| Size | 1,150 KB |
| Views | Front, side, three-quarter, top |

### Samurai Character Hero Image
| Field | Value |
|-------|-------|
| Path | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_hero.png` |
| Size | 685 KB |
| Description | Hero reference shot for visual comparison |

### Battlefield Pack GLB
| Field | Value |
|-------|-------|
| Path | `games/kawanakajima-foundry-samurai-proof/assets/generated/foundry/samurai-battlefield-pack/` |
| Unity path | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` |
| Size | 6.55 MB (6,873,392 bytes) |
| Provenance | Foundry samurai-battlefield-pack generation (2026-06-20) |
| Content | Terrain (hills, trees, stones, stream) + 20 samurai |

## Audio Assets

| Asset | Path | Size |
|-------|------|------|
| Battlefield loop | `games/kawanakajima-foundry-samurai-proof/assets/audio/battlefield_loop.wav` | 2.53 MB |
| Charge cue | `games/kawanakajima-foundry-samurai-proof/assets/audio/charge_cue.wav` | found |
| Clash accent | `games/kawanakajima-foundry-samurai-proof/assets/audio/clash_accent.wav` | found |
| UI confirm | `games/kawanakajima-foundry-samurai-proof/assets/audio/ui_confirm.wav` | found |
| Formation step | `games/kawanakajima-foundry-samurai-proof/assets/audio/formation_step.wav` | found |

## Browser Proof Files

| File | Purpose |
|------|---------|
| `index.html` | Main proof entry point (985 lines) |
| `three.min.js` | Three.js r160+ library |
| `GLTFLoader.js` | glTF/GLB loader for Three.js |
| `verify.js` | Automated browser proof verifier |

## Unity Proof Files

| File | Purpose |
|------|---------|
| `KawanakajimaRuntimeBootstrap.cs` | Runtime bootstrap (985 lines, GLTFast reflection + atmosphere + screen shake + UI fade) |
| `KawanakajimaUnityBuild.cs` | Build hooks for WebGL/Linux/Mac |
| `verify-unity-handoff.js` | Unity handoff verifier |

## Screenshots (30+ total)

### Browser Proof Screenshots
| File | Description |
|------|-------------|
| `foundry-contact-sheet.png` | Foundry samurai multi-view |
| `foundry-hero.png` | Hero reference |
| `assetInspect.png` | Asset inspection |
| `blue-close.png`, `blueClose.png` | Blue samurai close-up |
| `inspect-asset.png` | Asset inspection |
| `capture-overview-dark-initial.png` | Initial dark overview |

### v9 MCP Screenshots (latest, from Unity MCP)
| File | Description |
|------|-------------|
| `mcp_wide_formation_v9.png` | Full battlefield — hills, stream, bridge, samurai formations |
| `mcp_hero_3q_v9.png` | Dramatic hero three-quarter — samurai armor, helmet, mountains |
| `mcp_red_close_v9.png` | Takeda (red) close-up — helmet crest, armor, banner |
| `mcp_blue_close_v9.png` | Uesugi (blue) close-up — helmet crest, armor, sword |
| `mcp_scene_view_v9.png` | Unity editor scene view — full terrain with UI panel |
| `mcp_game_view_v9.png` | In-game render — stream, bridge, samurai, Unity UI |

### v8 MCP Screenshots
| File | Description |
|------|-------------|
| `mcp_game_view_v8.png` | Full scene with ready UI |
| `mcp_hero_3q_v8.png` | Dramatic hero three-quarter |
| `mcp_wide_formation_v8.png` | Full battlefield overview |
| `mcp_scene_view_final.png` | Scene view final |

### Unity MCP Screenshots (v8.3–v8.5)
| Version | Count | Files |
|---------|-------|-------|
| v8.3 | 3 | `unity_verify_v8.3.png`, `unity_red_close_v8.3.png`, `unity_wide_formation_v8.3.png` |
| v8.4 | 5 | `unity_side_v8.4.png`, `unity_top_v8.4.png`, `unity_blue_close_v8.4.png`, `unity_build_verify_v8.4.png`, `unity_final_v8.4.png` |
| v8.5 | 5 | `unity_mesh_retention_v8.5.png`, `unity_hero_three_quarter_v8.5.png`, `unity_takeda_close_v8.5.png`, `unity_uesugi_close_v8.5.png`, `unity_rear_view_v8.5.png` |
| v8.6 | 5 | `v86_wide_formation.png`, `v86_takeda_close.png`, `v86_uesugi_close.png`, `v86_hero_3q.png`, `v86_final.png` |
| v8.8 | 3 | `v88_wide_formation.png`, `v88_hero_closeup.png`, `v88_scene_view.png` |
| v9.2 worker | 2 | `v8_game_view.png`, `v8_scene_view.png` |

## Browser Verification

```
$ node verify.js
=== Kawanakajima Foundry Proof verification ===
GLB size: 1.23 MB
Contact size: 1150 KB
Audio loop size: 2.53 MB
Battlefield pack size: 6.55 MB
BASIC STRUCTURE + ASSET CHECKS: PASS
```

## Unity Verification

```
$ node verify-unity-handoff.js
=== Kawanakajima Unity handoff verification ===
UNITY HANDOFF STRUCTURE: PASS
```

## Unity MCP Probe Results

- **Ping:** `{"status":"success","structured":{"result":"pong"}}` — OK at start of session
- **Tools:** 73 tools available
- **Scene:** KAWANAKAJIMA_UNITY_READY, 20 actors, 1 root object
- **Mesh retention:** 241/241 non-null MeshFilters, 72,927 vertices
- **Build:** Mac .app (112 MB) succeeded
- **MCP status:** Became unavailable after v9.2 play mode toggle (known risk)

## Quality Assessment

- ✅ Samurai GLB: Detailed character with helmet, armor, weapons, sashimono banner
- ✅ Battlefield pack: Complete terrain with hills, trees, stream, bridge
- ✅ Audio: 5 WAVs for loop, charge, clash, UI, formation
- ✅ Browser proof: All assets load, camera controls work, charge/reform/clash functional
- ✅ Unity proof: All samurai instantiate with full mesh data, faction colors clear
- ✅ Screenshot coverage: 30+ images across 8 camera angles and 7 quality passes
- ⚠️ MCP availability: Editor MCP became unavailable after play mode toggle; screenshots from earlier in session capture the state

## Unity Branch Status

- **Branch:** `factoryx/kawanakajima-samurai-unity-autonomous-loop-20260620-v8`
- **PR:** #167 (open, mergeable, targeting main)
- **Status:** All CI green, merge blocked by branch protection review requirement
- **Latest commit:** `7e3d91a` (v9.2: bootstrap polish)
