# UNITY_BUILD_VERIFICATION

**Recorded:** 2026-06-21T04:35:25Z
**Branch:** `factoryx/samurai-country-battle-20-20260621`
**Build host:** local Mac Studio
**Unity Editor:** 2023.2.20f1

Unity Editor batchmode completed successfully from the v6 Samurai branch.

## Build

- Command:
  ```bash
  /Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity \
    -batchmode -quit \
    -projectPath /Users/marcus/codex-work/studio-edo-woodblock-samurai-country-battle-20-20260621/unity/kawanakajima-samurai \
    -executeMethod KawanakajimaUnityBuild.BuildMac \
    -logFile /tmp/kawanakajima-v6-build.log
  ```
- Build result: succeeded
- Exit code: 0
- Output: `/Users/marcus/codex-work/studio-edo-woodblock-samurai-country-battle-20-20260621/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 110 MB
- Bundle files: 191
- Bundle executable: `Contents/MacOS/kawanakajima-samurai`
- Build log: `/tmp/kawanakajima-v6-build.log`
- Unity build report: `Complete build size 110.0 mb`

The app bundle is not committed because `unity/kawanakajima-samurai/.gitignore` excludes `Builds/` and the generated bundle is large binary output. The build is reproducible with the command above on this Mac.

## Embedded Asset Verification

The built app contains the v6 samurai GLB at:

`KawanakajimaSamurai.app/Contents/Resources/Data/StreamingAssets/Kawanakajima/samurai_character.glb`

Verified GLB stats:

- Size: 612,872 bytes / 599 KB
- Nodes: 222
- Meshes: 221
- Materials: 21
- Position vertices: 11,765
- SHA-256: `17a08e3a8208ad83eeb10484478d11a1a8a67c040499ff27b13972d91edf7c5a`

Other build checksums:

- Executable SHA-256: `66a5b4c4596b8caacf7ab90b9035a45b6aa2ad055553af8b505383f9fc66d5d6`
- Battlefield pack SHA-256: `538479735435a685b93c6204916586f75621d3f9c3b26febaa60213050445fcb`

## Player Launch Verification

Command:

```bash
unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai \
  -batchmode -nographics \
  -logFile /tmp/kawanakajima-v6-player.log \
  -quit
```

Result:

- Exit code: 0
- Log: `/tmp/kawanakajima-v6-player.log`
- Readiness marker: `KAWANAKAJIMA_UNITY_READY actors=20 pack=False audio=True`

In null graphics mode the runtime uses non-rendered actor proxies to avoid glTFast material instantiation on Unity's Null device. Normal graphical play still loads the real v6 GLB through glTFast.

## MCP

- Unity-MCP plugin: `com.ivanmurzak.unity.mcp` 0.81.1
- Local listener: `http://localhost:25666`
- Worker routed listener: `http://host.docker.internal:27481/mcp`
- Worker preflight: success from both deployed Mac-local FactoryX workers
