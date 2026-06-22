# Current Unity QA - 2026-06-21

This file records the current local QA state for the Kawanakajima Samurai Unity deliverable.

## What Passed

Structural Unity handoff verification passes:

```bash
node unity/kawanakajima-samurai/verify-unity-handoff.js
```

Result:

```text
=== Kawanakajima Unity handoff verification ===
UNITY HANDOFF STRUCTURE: PASS
```

This proves the source handoff currently contains:

- Foundry v5 samurai GLB in `Assets/StreamingAssets/Kawanakajima/samurai_character.glb`
- Foundry 20-samurai battlefield pack GLB and manifest
- Audio resources
- Review images
- Runtime bootstrap with 20 actors, charge/reform controls, audio controls, camera presets, and Foundry pack toggle
- Editor build hooks for Mac, Linux, and WebGL

## Fresh Build Attempt

Unity Editor found:

```text
/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity
2023.2.20f1
```

Command attempted:

```bash
/Users/marcus/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit \
  -projectPath /tmp/studio-edo-v25/unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildMac \
  -logFile /tmp/kawanakajima-v25-unity-mac-build.log
```

Result: failed before import/build because the local Unity Editor has no active batch license.

Relevant log excerpt:

```text
Unity Editor version:    2023.2.20f1 (0e25a174756c)
Batch mode:              YES
Available memory:        262144 MB
Error: Access token is unavailable; failed to update
Unable to update licenses. Errors: No ULF license found.,Token not found in cache
License is not active (com.unity.editor.headless). HasEntitlements will fail.
No valid Unity Editor license found. Please activate your license.
```

## Gate Decision

Unity source handoff gate: pass.

Fresh local Unity build gate: fail due to missing/expired Unity Editor license.

This is not an asset or project-code failure. The next run needs an activated Unity Editor license for batch mode on this Mac, then `./run-local-unity-build.sh` should be run from `unity/kawanakajima-samurai/`.

The full active goal remains incomplete until a fresh playable Unity build is produced and inspected.
