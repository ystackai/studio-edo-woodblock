# LOCAL_UNITY_ATTEMPT - work-order-1781940455825-6-1

**Recorded:** 2026-06-20T08:22:39Z

This records an operator-side Mac verification attempt after the remote worker reported no Unity Editor/listener.

## Goal

Determine whether the Kawanakajima Unity source handoff can be opened and built outside the undersized remote worker, using the same PR branch and assets.

## Local Install Attempt

Initial Homebrew install:

```bash
brew install --cask unity-hub unity unity-webgl-support-for-editor
```

Result:

- `unity-hub` installed successfully at `/Applications/Unity Hub.app`.
- `unity` Editor install failed because Homebrew needed `sudo` and the automation session cannot provide a macOS password:

```text
sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper
sudo: a password is required
```

## Non-Sudo Editor Extraction

The Unity Editor package was fetched and expanded into a user-owned path:

```bash
brew fetch --cask unity
pkgutil --expand-full \
  /Users/marcus/Library/Caches/Homebrew/Cask/Unity-2023.2.20f1.pkg--2023.2.20f1,0e25a174756c.pkg \
  /Users/marcus/codex-work/unity-2023.2.20f1-expanded
```

Smoke test:

```bash
"/Users/marcus/codex-work/unity-2023.2.20f1-expanded/Unity.pkg.tmp/Payload/Unity/Unity.app/Contents/MacOS/Unity" \
  -version -batchmode -quit
```

Output:

```text
2023.2.20f1
```

This proves the Editor binary can launch in batchmode from the extracted package. It does not prove a production-ready installed Editor, and the later build log includes a licensing-client signature-validation warning from the extracted path.

## Source Handoff Verification

Clean worktree:

```text
/Users/marcus/codex-work/studio-edo-woodblock-samurai-pr163
branch: codex/samurai-unity-guarded-retry
```

Command:

```bash
node unity/kawanakajima-samurai/verify-unity-handoff.js
```

Result:

```text
=== Kawanakajima Unity handoff verification ===
UNITY HANDOFF STRUCTURE: PASS
```

## Local WebGL Build Attempt

Command:

```bash
"/Users/marcus/codex-work/unity-2023.2.20f1-expanded/Unity.pkg.tmp/Payload/Unity/Unity.app/Contents/MacOS/Unity" \
  -batchmode \
  -nographics \
  -quit \
  -projectPath /Users/marcus/codex-work/studio-edo-woodblock-samurai-pr163/unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.BuildWebGL \
  -logFile /tmp/kawanakajima-unity-webgl-local.log
```

Result: failed before project import/build because Unity licensing is not active.

Relevant log excerpt:

```text
Unity Editor version:    2023.2.20f1 (0e25a174756c)
Batch mode:              YES
Architecture:            arm64
[Licensing::Module] Error: Access token is unavailable; failed to update
[Licensing::Client] Error: Code 500 while processing request (status: Unable to update licenses. Errors: No ULF license found.,Token not found in cache)
[Licensing::Module] Error: License is not active (com.unity.editor.headless). HasEntitlements will fail.
Pro License: NO
No valid Unity Editor license found. Please activate your license.
```

## Verdict

This local attempt improves the evidence:

- The PR branch has a structurally valid Unity source handoff.
- The Unity 2023.2.20f1 Editor binary can start locally in batchmode when extracted without sudo.
- A real WebGL build still cannot be produced without an activated Unity license.

No `Builds/WebGL/index.html` exists and no Unity playable build is claimed.

## Follow-Up Attempt (2026-06-20T09:43:35Z)

The extracted Unity 2023.2.20f1 Editor binary still launches:

```bash
"/Users/marcus/codex-work/unity-2023.2.20f1-expanded/Unity.pkg.tmp/Payload/Unity/Unity.app/Contents/MacOS/Unity" -version
```

Output:

```text
2023.2.20f1
```

The extracted payload includes `MacStandaloneSupport`, but not WebGL support. The PR branch now includes `KawanakajimaUnityBuild.BuildMac()` so the locally available standalone module has a direct batch build route.

Command attempted:

```bash
"/Users/marcus/codex-work/unity-2023.2.20f1-expanded/Unity.pkg.tmp/Payload/Unity/Unity.app/Contents/MacOS/Unity" \
  -batchmode \
  -nographics \
  -quit \
  -projectPath /Users/marcus/codex-work/studio-edo-woodblock-samurai-pr163/unity/kawanakajima-samurai \
  -executeMethod KawanakajimaUnityBuild.CreateOrRefreshScene \
  -logFile /Users/marcus/codex-work/studio-edo-woodblock-samurai-pr163/unity/kawanakajima-samurai/unity-import.log
```

Result: failed before import/build because Unity licensing is not active.

Relevant log excerpt:

```text
Unity Editor version:    2023.2.20f1 (0e25a174756c)
Batch mode:              YES
Architecture:            arm64
[Licensing::Module] Error: Access token is unavailable; failed to update
[Licensing::Client] Error: Code 500 while updating license in client (status: Unable to update licenses. Errors: No ULF license found.,Token not found in cache)
[Licensing::Module] Error: License is not active (com.unity.editor.headless). HasEntitlements will fail.
Pro License: NO
No valid Unity Editor license found. Please activate your license.
```

No `Builds/Mac/KawanakajimaSamurai.app` exists and no Unity playable build is claimed.
