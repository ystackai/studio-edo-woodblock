# ASSET_MANIFEST - work-order-1781984186486-7-1 (Kawanakajima Samurai Unity v8)

**Date:** 2026-06-20
**Status:** Assets integrated; Unity verified with 20 samurai loaded and `KAWANAKAJIMA_UNITY_READY`.

## Samurai Characters

| Asset | Path | Size | Provenance |
|-------|------|------|------------|
| Samurai Character GLB (Unity) | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_character.glb` | 2.74 MB | Foundry v5 export |
| Samurai Character GLB (Browser) | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | 1.29 MB | Foundry v5 export |
| Contact sheet | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_contact_sheet.png` | 1.18 MB | Foundry inspection views |
| Hero render | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_hero.png` | 685 KB | Foundry hero shot |

20 samurai instantiate in Unity: 10 Takeda (red) and 10 Uesugi (blue), each with sashimono banner and yari additive props.

## Battlefield / World

| Asset | Path | Size | Provenance |
|-------|------|------|------------|
| Battlefield Pack GLB | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_pack.glb` | 6.87 MB | Foundry v5 export |
| Battlefield manifest | `unity/kawanakajima-samurai/Assets/StreamingAssets/Kawanakajima/samurai_battlefield_manifest.json` | 4.7 KB | Foundry metadata |

The battlefield pack contains the ground plane, five ink hills, 20 pine trees, and 18 low field stones.

## Audio Cues

| Cue | Path | Size |
|-----|------|------|
| Battlefield ambient loop | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/battlefield_loop.wav` | 546 KB |
| Charge cue | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/charge_cue.wav` | 127 KB |
| Clash accent | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/clash_accent.wav` | 74 KB |
| Formation step | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/formation_step.wav` | 60 KB |
| UI confirm | `unity/kawanakajima-samurai/Assets/Resources/KawanakajimaAudio/ui_confirm.wav` | 85 KB |

Browser proof audio is also present under `games/kawanakajima-foundry-samurai-proof/assets/audio/`.

## Browser Proof Assets

| Asset | Path | Size |
|-------|------|------|
| Browser proof | `games/kawanakajima-foundry-samurai-proof/index.html` | 12 KB |
| Samurai GLB | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character.glb` | 1.29 MB |
| Contact sheet PNG | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_contact_sheet.png` | 1.18 MB |
| Hero render PNG | `games/kawanakajima-foundry-samurai-proof/assets/samurai_character_hero.png` | 685 KB |
| Audio WAVs | `games/kawanakajima-foundry-samurai-proof/assets/audio/` | About 892 KB total |

## Verification

- Unity MCP ping: `pong` from `http://172.21.0.1:25666`.
- GLTFast integration: reflection bootstrap with four service-interface implementations discovered and instantiated.
- Scene state: `Kawanakajima`, Play Mode, 20 actors loaded, `KAWANAKAJIMA_UNITY_READY`.
- Screenshots: overview, close samurai, and wide formation in `screenshots/`.
