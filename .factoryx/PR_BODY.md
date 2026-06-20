## FactoryX Work Order Context

- Work Order: work-order-1781940455825-6-1
- Factory: factory-edo-woodblock
- Project: ystackai/studio-edo-woodblock
- Branch: codex/samurai-unity-guarded-retry
- Deliverable: kawanakajima-samurai-unity (unity-playable-build)
- Gate: unity-build-evidence
- Deadline: 2026-06-20T08:15:00Z

**Title:** Guarded Samurai Unity playable-build retry

**Goal (verbatim from payload):**
Guarded Samurai Unity retry. Starting from the merged Kawanakajima battlefield pack v3 on main, produce the requested playable Unity world only if the worker can prove Unity is actually available. Requirements: 20 warring samurai, 10 Takeda and 10 Uesugi, meeting on Japanese countryside; use the existing Blender/Foundry assets from the merged pack; create or update the Unity project under unity/kawanakajima-samurai; run the Unity MCP/editor preflight before claiming Unity work; produce a real Unity build artifact such as unity/**/Builds/WebGL/index.html or a platform build plus UNITY_BUILD_VERIFICATION.md. If /cache space, Unity Editor install, auth/license, or localhost MCP listener is unavailable, do not claim playable completion. Instead update UNITY_BLOCKER.md and verification notes with exact command output, open/update the PR if needed, and submit a blocker/escalation verdict. This retry is to prove the system now reports the Unity blocker honestly rather than accepting source handoff as a playable build.

**Full Work Order Prompt / Payload:**
See the attached work order directory for the complete prompt, creative brief, and JSON:
`.factoryx/work-orders/work-order-1781940455825-6-1/`

Key excerpts and the entire user request for this task are preserved in git history of the branch and the work order note files (UNITY_BLOCKER.md, VERIFICATION.md).

## What This PR Contains

- Fresh execution of Unity preflight + build attempt with **exact command output** recorded.
- Operator-side local Unity attempt recorded in `LOCAL_UNITY_ATTEMPT.md`: Unity Hub installed, Unity 2023.2.20f1 package expanded without sudo, Editor binary launched in batchmode, handoff verifier passed, WebGL build attempt blocked by missing Unity license/token/ULF.
- `UNITY_BLOCKER.md` (in work order dir + mirrored in unity/ and games/) documenting that no Unity Editor, no auth, no listener, insufficient disk.
- No `Builds/` directory or index.html Unity artifact was produced or claimed.
- No fake "playable Unity" verdict.
- Preserved + lightly annotated the existing:
  - Unity source handoff at `unity/kawanakajima-samurai/` (v3 pack assets + bootstrap + build hooks)
  - Browser Three.js proof at `games/kawanakajima-foundry-samurai-proof/` (20 samurai, same assets, verified)
- Updated work order notes: VERIFICATION.md, PREVIEW.md, WORKLOG.md, VERIFICATION.json for this specific work-order id.
- Verification run of the browser proof (node verify.js PASS, 20 actors confirmed).

## Unity Status (Honest)

**Blocked.** This worker correctly refuses to claim completion of the Unity deliverable.

See `.factoryx/work-orders/work-order-1781940455825-6-1/UNITY_BLOCKER.md` for:
- Full preflight transcript
- `unity editors -i`, auth, license, mcp status, build error
- Disk numbers
- Escalation requirements (18GB+, real Editor + listener + license)

Additional local check: a no-sudo extracted Unity 2023.2.20f1 Editor could start in batchmode, but `BuildWebGL` failed before project import/build because no valid Unity license was active. See `.factoryx/work-orders/work-order-1781940455825-6-1/LOCAL_UNITY_ATTEMPT.md`.

## Review Guidance

- Treat any claim of "Unity build done" as incorrect for this runtime.
- The browser proof + handoff are reviewable as the current state of the merged pack.
- The purpose of *this* guarded retry work order is to validate blocker honesty.

## Preview

Browser: open `games/kawanakajima-foundry-samurai-proof/index.html`

Unity (future): `unity/kawanakajima-samurai/Builds/WebGL/index.html` (does not exist yet)

## Checklist (per work order)

- [x] Started from merged pack v3 on main
- [x] Ran Unity MCP/editor preflight before any claim
- [x] 20 samurai (10/10) assets from foundry used (in handoff + browser)
- [x] Updated UNITY_BLOCKER.md + verification with exact outputs
- [x] Probed a local Unity Editor path and documented the license blocker
- [x] Did **not** claim playable Unity completion
- [x] PR body contains Work Order context
