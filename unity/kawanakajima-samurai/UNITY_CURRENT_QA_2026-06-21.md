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

## Existing Built Player Smoke

An older local Mac build exists at:

```text
/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app
```

Bundle inspection:

```text
Size: 116 MB
Executable: Contents/MacOS/kawanakajima-samurai
UnityBuildNumber: 0e25a174756c
Unity player version: 2023.2.20f1
Architectures: x86_64 and arm64
```

Headless smoke command attempted against that existing build:

```bash
/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai \
  -batchmode -nographics \
  -logFile /tmp/kawanakajima-built-player-smoke.log
```

Result: the old build starts, but fails before the Kawanakajima readiness marker because `Shader.Find("Standard")` returns null under the null graphics device and the runtime constructed `new Material(null)`.

Relevant log excerpt:

```text
Forcing GfxDevice: Null
ArgumentNullException: Value cannot be null.
Parameter name: shader
  at UnityEngine.Material..ctor (UnityEngine.Shader shader)
  at KawanakajimaRuntimeBootstrap.MakeMaterial (...)
  at KawanakajimaRuntimeBootstrap.CreateMaterials ()
```

Source fix added after this smoke test:

- `MakeMaterial` now logs `KAWANAKAJIMA_SHADER_FALLBACK` and returns null if `Shader.Find("Standard")` is unavailable.
- Primitive material assignment now goes through `ApplySharedMaterial`, which leaves Unity's default primitive material in place when a custom material is unavailable.
- `verify-unity-handoff.js` now checks for this fallback path.

This source fix still needs a fresh Unity build after the Unity license issue is resolved.

Graphics-enabled smoke was also attempted against the same existing build:

```bash
/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai \
  -batchmode \
  -logFile /tmp/kawanakajima-built-player-graphics-smoke.log
```

Result: the old build selects the Apple M3 Ultra Metal device, but still fails with the same `new Material(null)` runtime exception before reaching `KAWANAKAJIMA_UNITY_READY`.

Relevant log excerpt:

```text
Using device Apple M3 Ultra (high power)
Initializing Metal device caps: Apple M3 Ultra
ArgumentNullException: Value cannot be null.
Parameter name: shader
  at UnityEngine.Material..ctor (UnityEngine.Shader shader)
  at KawanakajimaRuntimeBootstrap.MakeMaterial (...)
  at KawanakajimaRuntimeBootstrap.CreateMaterials ()
```

`smoke-built-player.sh` was added to make this gate repeatable. It expects the built app to log:

```text
KAWANAKAJIMA_UNITY_READY actors=20 pack=True audio=True
```

The currently existing Mac build fails this smoke test because it was built before the material fallback source fix.

## Managed Patch Smoke

Because the Unity Editor currently cannot run a licensed fresh build, a managed-code patch path was tested against the existing Mac app:

```bash
unity/kawanakajima-samurai/patch-existing-mac-player-managed.sh
APP=/tmp/KawanakajimaSamurai-patched.app/Contents/MacOS/kawanakajima-samurai \
  unity/kawanakajima-samurai/smoke-built-player.sh
```

The patch script compiles `KawanakajimaRuntimeBootstrap.cs` into a replacement `Assembly-CSharp.dll` using Unity's bundled Roslyn compiler and the existing player's managed references, then copies the existing app to `/tmp/KawanakajimaSamurai-patched.app` and replaces only the managed game assembly.

Result:

```text
KAWANAKAJIMA_SHADER_FALLBACK material=Paper earth Standard shader unavailable; using Unity primitive default material
KAWANAKAJIMA_GLTF_ACTOR_FALLBACK index=0 reason=NullReferenceException: Object reference not set to an instance of an object
...
KAWANAKAJIMA_GLTF_ACTOR_FALLBACK index=19 reason=NullReferenceException: Object reference not set to an instance of an object
KAWANAKAJIMA_GLTF_PACK_FALLBACK reason=NullReferenceException: Object reference not set to an instance of an object
KAWANAKAJIMA_UNITY_READY_FALLBACK actors=20 pack=True audio=True fallbackActors=True fallbackPack=True
```

This proves the Unity runtime can reach a playable/control-ready 20-actor world after the source fix, even when the stale player lacks the shaders needed for glTFast material instantiation. It is not the final deliverable because the loaded samurai GLB and battlefield pack are replaced by runtime fallback actors in this patched smoke test. The final gate still requires a licensed Unity rebuild and a smoke result without `fallbackActors=True` or `fallbackPack=True`.
