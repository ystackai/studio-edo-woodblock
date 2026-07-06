#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"

UNITY_EXPANDED="${UNITY_EXPANDED:-/Users/marcus/codex-work/unity-2023.2.20f1-expanded/Unity.pkg.tmp/Payload/Unity/Unity.app}"
DOTNET="${DOTNET:-$UNITY_EXPANDED/Contents/NetCoreRuntime/dotnet}"
CSC="${CSC:-$UNITY_EXPANDED/Contents/DotNetSdkRoslyn/csc.dll}"
SOURCE_APP="${SOURCE_APP:-/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app}"
PATCHED_APP="${PATCHED_APP:-/tmp/KawanakajimaSamurai-patched.app}"
ASSEMBLY_OUT="${ASSEMBLY_OUT:-/tmp/Assembly-CSharp.dll}"

MANAGED="$SOURCE_APP/Contents/Resources/Data/Managed"
SOURCE_CS="$ROOT/Assets/Kawanakajima/Scripts/KawanakajimaRuntimeBootstrap.cs"

if [[ ! -x "$DOTNET" ]]; then
  echo "dotnet runtime not found: $DOTNET" >&2
  exit 2
fi

if [[ ! -f "$CSC" ]]; then
  echo "Roslyn csc.dll not found: $CSC" >&2
  exit 2
fi

if [[ ! -d "$SOURCE_APP" ]]; then
  echo "Source Mac app not found: $SOURCE_APP" >&2
  exit 2
fi

if [[ ! -f "$SOURCE_CS" ]]; then
  echo "Runtime bootstrap source not found: $SOURCE_CS" >&2
  exit 2
fi

echo "Compiling managed player assembly from: $SOURCE_CS"
rm -f "$ASSEMBLY_OUT"

"$DOTNET" "$CSC" \
  -nologo \
  -target:library \
  -langversion:latest \
  -out:"$ASSEMBLY_OUT" \
  -r:"$MANAGED/mscorlib.dll" \
  -r:"$MANAGED/System.dll" \
  -r:"$MANAGED/System.Core.dll" \
  -r:"$MANAGED/netstandard.dll" \
  -r:"$MANAGED/UnityEngine.dll" \
  -r:"$MANAGED/UnityEngine.CoreModule.dll" \
  -r:"$MANAGED/UnityEngine.AudioModule.dll" \
  -r:"$MANAGED/UnityEngine.IMGUIModule.dll" \
  -r:"$MANAGED/UnityEngine.InputLegacyModule.dll" \
  -r:"$MANAGED/UnityEngine.PhysicsModule.dll" \
  -r:"$MANAGED/glTFast.dll" \
  "$SOURCE_CS"

echo "Copying app: $SOURCE_APP -> $PATCHED_APP"
rm -rf "$PATCHED_APP"
ditto "$SOURCE_APP" "$PATCHED_APP"
cp "$ASSEMBLY_OUT" "$PATCHED_APP/Contents/Resources/Data/Managed/Assembly-CSharp.dll"

du -sh "$PATCHED_APP"
echo "Patched managed player app: $PATCHED_APP"
echo "Run smoke test:"
echo "  APP=\"$PATCHED_APP/Contents/MacOS/kawanakajima-samurai\" \"$ROOT/smoke-built-player.sh\""
