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

## Build Hook Present

`Assets/Kawanakajima/Editor/KawanakajimaUnityBuild.cs` provides:
- Menu: FactoryX > Kawanakajima > Create Or Refresh Scene
- Batch: BuildWebGL() and BuildLinux()

When a real Editor runs this project, those produce the expected `Builds/WebGL/` or platform output + index.html.

## Do Not Claim

Absence of this blocker file or presence of a Builds/ dir with artifacts is the only signal that a real Unity build succeeded on a capable worker.
