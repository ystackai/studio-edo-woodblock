# UNITY_BUILD_VERIFICATION

**Recorded:** 2026-06-22T18:06:00Z

Fresh Unity Editor batchmode evidence from the local Mac Studio using Unity 2023.2.20f1.

## Fresh Build

- Command: `unity/kawanakajima-samurai/run-local-unity-build.sh`
- Automation close mode: `CLOSE_EXISTING_UNITY=1` is supported for replay loops that previously opened Unity through MCP.
- Project: `unity/kawanakajima-samurai`
- Unity executable: `/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity`
- Unity version: `2023.2.20f1`
- Build method: `KawanakajimaUnityBuild.BuildMac`
- Build result: succeeded
- Exit code: 0
- Output: `Builds/Mac/KawanakajimaSamurai.app`
- Bundle size: 111 MB
- Log: `/tmp/kawanakajima-unity-mac-build.log`

```text
Unity exit code: 0
111M    unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app
Kawanakajima Mac Unity build: PASS
```

## Fresh Built Player Smoke

- Command: `unity/kawanakajima-samurai/smoke-built-player.sh`
- App: `unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai`
- Log: `/tmp/kawanakajima-fresh-unity-build-smoke.log`
- Result: pass

```text
Built player smoke: PASS
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True fallbackActors=False fallbackPack=False
```

This proves the freshly built Mac player can load the real samurai GLB, the real 20-samurai battlefield pack GLB, and file-backed audio without runtime actor or pack fallbacks.

## Unity MCP

- Command: `unity/kawanakajima-samurai/check-unity-mcp.sh --open`
- Listener: `http://localhost:27482`
- Result: pass

```text
SUCCESS: MCP server is ready at http://localhost:27482
UNITY_MCP_READY url=http://localhost:27482
```

Historical 2026-06-20 build evidence is superseded by this fresh 2026-06-22 build and smoke result.
