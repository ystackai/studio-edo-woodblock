# UNITY_LOCAL_STATUS

**Recorded:** 2026-06-21T04:35:25Z

The Kawanakajima Samurai Unity project opens, builds, and passes a batch player launch check on the local Mac Studio with Unity 2023.2.20f1.

## Local Editor

- Editor binary: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- `Unity -version`: `2023.2.20f1`
- Scene generation: `KawanakajimaUnityBuild.CreateOrRefreshScene`
- Scene path: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Local Build

- Branch: `factoryx/samurai-country-battle-20-20260621`
- Batch method: `KawanakajimaUnityBuild.BuildMac`
- Output: `/Users/marcus/codex-work/studio-edo-woodblock-samurai-country-battle-20-20260621/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- Size: 110 MB
- Files: 191
- Last verified: 2026-06-21T04:35:25Z
- Verification: `UNITY_BUILD_VERIFICATION.md`
- Batch player check: exit 0, `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`

## Local MCP

- CLI/server tools installed under `/Users/marcus/codex-work/local-unity-tools`
- Unity project package: `com.ivanmurzak.unity.mcp` 0.81.1
- Listener URL: `http://localhost:25666`
- Worker routed URL: `http://host.docker.internal:27481/mcp`
- Worker preflight: passed from both Mac-local FactoryX workers.

Remote worker capacity notes from the earlier Hetzner attempt remain in the work-order history.
