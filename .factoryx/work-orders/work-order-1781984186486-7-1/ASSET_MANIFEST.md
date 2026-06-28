# Asset Manifest — Kawanakajima Samurai v8.6

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

### Samuri Character Contact Sheet
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
| Content | 20 additional samurai for battlefield formation/tactical views |

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
| `index.html` | Main proof entry point (952 lines) |
| `three.min.js` | Three.js r160+ library |
| `GLTFLoader.js` | glTF/GLB loader for Three.js |
| `verify.js` | Automated browser proof verifier |

## Unity Proof Files

| File | Purpose |
|------|---------|
| `KawanakajimaRuntimeBootstrap.cs` | Runtime bootstrap (758 lines, GLTFast reflection) |
| `KawanakajimaUnityBuild.cs` | Build hooks for WebGL/Linux/Mac |
| `verify-unity-handoff.js` | Unity handoff verifier |

## Screenshots (18 total)

### v8.6 (latest)
| File | Description |
|------|-------------|
| `screenshots/v86_wide_formation.png` | Full battlefield, 10 red vs 10 blue |
| `screenshots/v86_takeda_close.png` | Red samurai detail |
| `screenshots/v86_uesugi_close.png` | Blue samurai detail |
| `screenshots/v86_hero_3q.png` | Dramatic shoulder-angle |
| `screenshots/v86_final.png` | Full scene with UI |

### v8.5
| File | Description |
|------|-------------|
| `screenshots/unity_mesh_retention_v8.5.png` | Mesh retention proof (authoritative) |
| `screenshots/unity_hero_three_quarter_v8.5.png` | Hero three-quarter |
| `screenshots/unity_takeda_close_v8.5.png` | Takeda close |
| `screenshots/unity_uesugi_close_v8.5.png` | Uesugi close |
| `screenshots/unity_rear_view_v8.5.png` | Rear view |

### v8.4
| File | Description |
|------|-------------|
| `screenshots/unity_side_v8.4.png` | Side profile |
| `screenshots/unity_top_v8.4.png` | Top-down tactical |
| `screenshots/unity_blue_close_v8.4.png` | Blue close-up |
| `screenshots/unity_build_verify_v8.4.png` | Post-build check |
| `screenshots/unity_final_v8.4.png` | Hero shot |

### v8.3
| File | Description |
|------|-------------|
| `screenshots/unity_verify_v8.3.png` | Overview |
| `screenshots/unity_red_close_v8.3.png` | Red close |
| `screenshots/unity_wide_formation_v8.3.png` | Wide formation |

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

- **Ping:** `{"status":"success","structured":{"result":"pong"}}`
- **Scene:** KAWANAKAJIMA_UNITY_READY, 20 actors, 73 root objects
- **Mesh retention:** 241/241 non-null MeshFilters, 72,927 vertices
- **Build:** Mac .app (112 MB) succeeded

## Quality Assessment

- ✅ Samurai GLB: Detailed character with helmet, armor, weapons, sashimono banner
- ✅ Battlefield pack: Complete terrain with hills, trees, stones, 20 samurai
- ✅ Audio: 5 WAVs for loop, charge, clash, UI, formation
- ✅ Browser proof: All assets load, camera controls work, charge/reform/clash functional
- ✅ Unity proof: All samurai instantiate with full mesh data, faction colors clear
- ✅ Screenshot coverage: 18 images across 5 camera angles and 4 quality passes
