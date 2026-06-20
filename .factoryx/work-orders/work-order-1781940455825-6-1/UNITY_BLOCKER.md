# UNITY_BLOCKER — work-order-1781940455825-6-1

**Guarded Unity Playable Build Retry**

This work order explicitly requires producing a real Unity build **only if** Unity Editor + license + MCP listener can be proven available. The retry purpose: prove the system reports the blocker honestly instead of treating source handoff or browser proof as a "Unity playable build".

## Preflight Results (exact, this run 2026-06-20 ~07:50 UTC; re-executed in session)

```
date: Sat Jun 20 07:50:18 UTC 2026 (fresh preflight this session)

which unity: /root/.unity/bin/unity

unity --version:
0.1.0-beta.7

unity editors -i:
VersionArchDefaultPlatforms

unity auth status:
You are not signed in. Run `auth login` to sign in.

unity license:
<empty output>

df -h /cache:
Filesystem      Size  Used  Avail Use% Mounted on
/dev/sda1        38G   35G   1.1G  97% /cache
```

## unity-mcp-cli status (for project)

```
Unity-MCP Status
  Project: /workspaces/factory-edo-woodblock/worker-1/ystackai_studio-edo-woodblock/checkout/unity/kawanakajima-samurai
──────────────────────────────────────────────────

Unity Editor Process
WARN: Unity is not running with this project

Local MCP Server
  URL: http://localhost:23914
Probing http://localhost:23914...
ERROR: Not available (connection refused)
──────────────────────────────────────────────────

ERROR: Unity is not running and MCP server is not reachable
```

## Build Attempt (exact)

```
$ /root/.unity/bin/unity build unity/kawanakajima-samurai --target WebGL --execute-method KawanakajimaUnityBuild.BuildWebGL --log-file /tmp/wo-build.log --no-tail
Error: Editor 2022.3.0f1 (x86_64) is not installed. Re-run with --allow-install to install it automatically.
```

Project declares `2022.3.0f1` in ProjectVersion.txt. No Editor binary exists on the system. `/root/.unity/bin/unity` is only the thin CLI wrapper (0.1.0-beta.7).

## Disk / Install Gate

- 1.1 GB free on /cache (and overlay root). Unity Editor install requires ~18 GB per prior documented threshold.
- `--allow-install` would be attempted only if space/auth present; neither is.

## MCP / Listener Gate

- Unity MCP is not registered for this run.
- No reachable localhost listener for the project (23914 refused).
- `unity-mcp-cli status` confirms no Editor + no listener.
- A bare unity-mcp-cli binary or CLI does **not** count as a listener; the Editor must run the Unity-side MCP package.

## Existing State (from merged Kawanakajima pack v3)

- `unity/kawanakajima-samurai/` — Unity **source handoff** only:
  - Contains Foundry GLBs (character v5 + battlefield pack v3 with 20 samurai: 10 Takeda + 10 Uesugi), manifest, WAV audio.
  - C# bootstrap script and Editor build hooks (KawanakajimaUnityBuild.cs).
  - Declares glTFast in manifest.
  - No scene persisted yet (the C# creates on demand); no Builds/ output.
- `games/kawanakajima-foundry-samurai-proof/` — Browser Three.js playable using the same assets (20 actors, cinematic cameras, controls, file-backed audio). This satisfies browser 3D proof but is **not** a Unity deliverable.

## Verdict for this Work Order

**DO NOT claim** `unity-playable-build` or "Guarded Samurai Unity" completion.

- No real Unity Editor build artifact exists (no `unity/**/Builds/WebGL/index.html`, no platform build).
- No `UNITY_BUILD_VERIFICATION.md` with successful Editor build can be produced.
- This worker correctly escalates: the deliverable gate "unity-build-evidence" is blocked.

## Required for Future Success (escalation notes)

- Host with >=18-20 GB free under the Unity install path.
- Authenticated Unity license (Personal or higher) that the CLI can see via `unity auth login` + `unity license`.
- Running Unity Editor 2022.3+ (or 6) with the Unity-MCP package installed and listening (status must report reachable).
- Then: run preflight, open project, execute CreateOrRefreshScene, run BuildWebGL (or use unity build ...), produce Builds/ + verification.

## Actions Taken

- Re-ran full preflight in this session (`unity editors -i`, `auth status`, `license`, `unity-mcp-cli status <proj>`, build attempt) capturing 1.1G free + exact "Editor 2022.3.0f1 not installed".
- Updated blocker docs + VERIFICATION with fresh command output (no Unity Editor/listener present).
- Preserved the source handoff + browser proof. No Builds/ or playable claim made.
- Confirmed via git that PR #163 on codex/samurai-unity-guarded-retry carries the honest blocker verdict.
- Updated work order context files under `.factoryx/work-orders/work-order-1781940455825-6-1/`. Verified verify.js PASS on browser proof, asset foundry healthy.

See also:
- `unity/kawanakajima-samurai/README.md`
- `games/kawanakajima-foundry-samurai-proof/UNITY_BLOCKER.md`
- `.factoryx/work-orders/work-order-1781940455825-6-1/VERIFICATION.md`
- Previous related: work-order-1781913967751-7-1 and 1781920715097-7-1
