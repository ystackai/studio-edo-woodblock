#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNITY="${UNITY:-$HOME/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity}"
LOG="${LOG:-/tmp/kawanakajima-unity-mac-build.log}"

if [[ ! -x "$UNITY" ]]; then
  echo "Unity executable not found or not executable: $UNITY" >&2
  echo "Set UNITY=/path/to/Unity and retry." >&2
  exit 2
fi

echo "Unity: $UNITY"
"$UNITY" -version || true
echo "Project: $ROOT"
echo "Log: $LOG"

rm -f "$LOG"

set +e
"$UNITY" \
  -batchmode \
  -quit \
  -projectPath "$ROOT" \
  -executeMethod KawanakajimaUnityBuild.BuildMac \
  -logFile "$LOG"
status=$?
set -e

echo "Unity exit code: $status"

if [[ -f "$LOG" ]]; then
  if grep -E "No valid Unity Editor license|License is not active|No ULF license found|Token not found" "$LOG" >/dev/null; then
    echo "Unity license preflight failed. Activate a Unity Editor license for batch/headless use, then retry." >&2
    tail -80 "$LOG" >&2
    exit 3
  fi

  if [[ $status -ne 0 ]]; then
    echo "Unity build failed. Recent log output:" >&2
    tail -120 "$LOG" >&2
    exit "$status"
  fi
else
  echo "Unity did not create a log file: $LOG" >&2
  exit 4
fi

if [[ ! -d "$ROOT/Builds/Mac/KawanakajimaSamurai.app" ]]; then
  echo "Unity exited successfully, but expected build app is missing." >&2
  exit 5
fi

du -sh "$ROOT/Builds/Mac/KawanakajimaSamurai.app"
echo "Kawanakajima Mac Unity build: PASS"
