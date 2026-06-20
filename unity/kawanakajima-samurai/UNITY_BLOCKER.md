# UNITY_BLOCKER

**Project:** unity/kawanakajima-samurai (Kawanakajima Samurai Unity source handoff)

**Referenced Work Order:** work-order-1781940455825-6-1 (Guarded Samurai Unity playable-build retry)

This directory contains **source + build hooks only**. No Editor build has been executed here.

## Latest Preflight (exact)

See `.factoryx/work-orders/work-order-1781940455825-6-1/UNITY_BLOCKER.md` and the main README section "Current Blocker".

Summary:
- CLI wrapper only (0.1.0-beta.7)
- No Editor 2022.3.0f1 installed
- Not authenticated
- No MCP listener reachable
- Insufficient /cache space (1.3G)
- Build CLI reports Editor missing

## Local Operator Follow-Up (2026-06-20T08:22:39Z)

Outside the remote worker, the Unity 2023.2.20f1 package was expanded into a user-owned path and the extracted Editor binary returned `2023.2.20f1` from `-version -batchmode -quit`. The handoff verifier passed.

A local WebGL batch build still failed before import/build because Unity licensing is not active:

```text
No ULF license found.
Token not found in cache.
No valid Unity Editor license found. Please activate your license.
```

## Local Operator Follow-Up (2026-06-20T09:43:35Z)

The extracted local Unity 2023.2.20f1 Editor still launches (`-version` returns `2023.2.20f1`). The extracted payload includes `MacStandaloneSupport`, but not the WebGL playback engine, so `BuildMac()` was added as the locally available standalone build route.

A local batch `CreateOrRefreshScene` attempt still failed before project import/build because Unity licensing is not active:

```text
No ULF license found.
Token not found in cache.
No valid Unity Editor license found. Please activate your license.
```

See `.factoryx/work-orders/work-order-1781940455825-6-1/LOCAL_UNITY_ATTEMPT.md`.

## Build Hook Present

`Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` provides:
- Menu: FactoryX > Kawanakajima > Create Or Refresh Scene
- Batch: BuildWebGL(), BuildLinux(), and BuildMac()

When a real Editor runs this project, those produce the expected `Builds/WebGL/` or platform output.

## Do Not Claim

Absence of this blocker file or presence of a Builds/ dir with artifacts is the only signal that a real Unity build succeeded on a capable worker.
