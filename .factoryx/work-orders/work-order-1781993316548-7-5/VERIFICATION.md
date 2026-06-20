# Verification — work-order-1781993316548-7-5

## Browser Verification

- `node games/kawanakajima-foundry-samurai-proof/verify.js` → **PASS**
  - GLB: 1.23 MB (Foundry)
  - Contact sheet: 1150 KB
  - Audio loop: 2.53 MB
  - Battlefield pack: 6.55 MB (20 warriors, 10/10 faction split)
  - All structure, path, size, syntax, audio, Unity handoff checks pass
  - VERIFICATION.json written with full evidence

## Unity Handoff Verification

- `node unity/kawanakajima-samurai/verify-unity-handoff.js` → **PASS**
  - Unity handoff structure intact
  - StreamingAssets GLB present
  - Scripts, scenes, build hooks present

## Unity MCP Live Smoke

- Initialize with protocolVersion `2024-11-05` → **200 OK**, returned `Mcp-Session-Id`
- `tools/list` → 38 tools listed (assets-find, scene-list-opened, script-execute, etc.)
- `tools/call` with `{"name":"scene-list-opened","arguments":{}}` → **PASS**
  - Scene: `Kawanakajima`
  - IsLoaded: true, IsDirty: false, IsValidScene: true
  - RootCount: 73
  - Path: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Visual Evidence

| View | Source | Status |
|------|--------|--------|
| Wide overview | screenshots/overview.png | ✅ |
| Takeda close | screenshots/redClose.png | ✅ |
| Uesugi close | screenshots/blueClose.png | ✅ |
| Side profile | screenshots/sideProfile.png | ✅ |
| Top formation | screenshots/topFormation.png | ✅ |
| Asset inspect | screenshots/assetInspect.png | ✅ |
| Unity wide formation | screenshots/mcp_wide_formation_v8.png | ✅ |
| Unity hero 3Q | screenshots/mcp_hero_3q_v8.png | ✅ |
| Unity game view | screenshots/mcp_game_view_v8.png | ✅ |
| Foundry contact | assets/samurai_character_contact_sheet.png | ✅ |
| Foundry hero | assets/samurai_character_hero.png | ✅ |

## Quality Gates

- ✅ First viewport: nonblank 3D scene with 20 samurai visible
- ✅ Camera: default low/shoulder angle, frames subjects off-center
- ✅ Controls: orbit (drag), zoom (wheel), keyboard shortcuts
- ✅ Lighting: cool key + rim, proper shadows, ACES tone mapping
- ✅ Depth: layered hills, distant fog, ground fog band
- ✅ Materials: faction coloring (red/blue), readable silhouettes
- ✅ Audio: file-backed WAVs, loop toggle, SFX on charge/clash/step
- ✅ No scratch files committed
- ✅ No oscillator/fake audio claims

## Remaining

- PR #167 merge blocked only by GitHub branch protection requiring one approving review from a write-access reviewer.
- Unity build artifact (.app) not committed (verified locally on Mac).
