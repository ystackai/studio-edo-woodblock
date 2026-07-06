# Current Unity QA - 2026-06-22

This file records the current local QA state for the Kawanakajima Samurai Unity deliverable.

## Structural Handoff

```bash
node unity/kawanakajima-samurai/verify-unity-handoff.js
```

Result:

```text
=== Kawanakajima Unity handoff verification ===
UNITY HANDOFF STRUCTURE: PASS
```

This verifies the source handoff contains:

- Foundry samurai GLB in `Assets/StreamingAssets/Kawanakajima/samurai_character.glb`
- Foundry 20-samurai battlefield pack GLB and manifest
- Audio resources
- Review images
- Runtime bootstrap with 20 actors, charge/reform controls, audio controls, camera presets, and Foundry pack toggle
- Editor build hooks for Mac, Linux, and WebGL

## Fresh Unity Build

Unity Editor:

```text
/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity
2023.2.20f1
```

Command:

```bash
unity/kawanakajima-samurai/run-local-unity-build.sh
```

Result:

```text
Unity exit code: 0
111M    unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app
Kawanakajima Mac Unity build: PASS
```

## Fresh Built Player Smoke

Command:

```bash
APP=/private/tmp/studio-edo-v25/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai \
LOG=/tmp/kawanakajima-fresh-unity-build-smoke.log \
unity/kawanakajima-samurai/smoke-built-player.sh
```

Result:

```text
Built player smoke: PASS
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False
```

This proves the freshly built player can load the real samurai GLB, the real 20-samurai battlefield pack GLB, and file-backed audio without runtime actor or pack fallbacks.

## Unity-MCP Preflight

Repeatable helper:

```bash
unity/kawanakajima-samurai/check-unity-mcp.sh --open
```

Result:

```text
SUCCESS: MCP server is ready at http://localhost:27482
UNITY_MCP_READY url=http://localhost:27482
```

## Gate Decision

- Unity source handoff gate: pass.
- Fresh local Unity build gate: pass.
- Fresh built-player runtime gate: pass.
- Unity-MCP readiness gate: pass.

The remaining quality caveat is art fidelity: the asset pack is coherent and review-gated, but still stylized rather than final photoreal production character art.
