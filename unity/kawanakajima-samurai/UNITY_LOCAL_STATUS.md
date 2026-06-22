# UNITY_LOCAL_STATUS

**Recorded:** 2026-06-20

Historical local Unity/MCP status for the Kawanakajima Samurai project. Current QA is recorded in `UNITY_CURRENT_QA_2026-06-21.md`.

## Local Editor

- Editor binary: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- `Unity -version`: `2023.2.20f1`
- Scene generation: `KawanakajimaUnityBuild.CreateOrRefreshScene`
- Scene path: `Assets/Kawanakajima/Scenes/Kawanakajima.unity`

## Historical Local Build

- Batch method: `KawanakajimaUnityBuild.BuildMac`
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Size: 112 MB
- Last verified: 2026-06-20T15:27:40Z
- Verification: `UNITY_BUILD_VERIFICATION.md`

This is not a fresh build of the current source. As of 2026-06-22, `run-local-unity-build.sh` fails before import/build because no valid Unity Editor license is active for batch/headless use on this Mac. The current runtime source has instead been smoke-tested through the managed-patched existing Mac player path with real GLBs and no runtime fallbacks.

## Local MCP

- CLI/server tools installed under `/Users/marcus/codex-work/local-unity-tools`
- Unity project package: `com.ivanmurzak.unity.mcp` 0.81.1
- Listener URL: `http://localhost:25666`
- Worker routed URL: `http://172.21.0.1:25666`
- Worker preflight: passed
- MCP tool calls were verified against the running editor.

Remote worker capacity notes from the earlier Hetzner attempt remain in the work-order history.
