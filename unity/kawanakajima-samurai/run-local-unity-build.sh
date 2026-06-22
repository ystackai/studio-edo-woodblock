#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UNITY="${UNITY:-$HOME/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity}"
LOG="${LOG:-/tmp/kawanakajima-unity-mac-build.log}"
UNITY_MCP_CLI="${UNITY_MCP_CLI:-/Users/marcus/codex-work/local-unity-tools/node_modules/.bin/unity-mcp-cli}"
CLOSE_EXISTING_UNITY="${CLOSE_EXISTING_UNITY:-0}"

if [[ ! -x "$UNITY" ]]; then
  echo "Unity executable not found or not executable: $UNITY" >&2
  echo "Set UNITY=/path/to/Unity and retry." >&2
  exit 2
fi

echo "Unity: $UNITY"
"$UNITY" -version || true
echo "Project: $ROOT"
echo "Log: $LOG"

existing_unity="$(pgrep -fl "Unity.app/Contents/MacOS/Unity .*${ROOT}" || true)"
if [[ -n "$existing_unity" ]]; then
  echo "Existing Unity process for this project:"
  printf '%s\n' "$existing_unity"
  if [[ "$CLOSE_EXISTING_UNITY" == "1" ]]; then
    if [[ ! -x "$UNITY_MCP_CLI" ]]; then
      echo "Cannot close existing Unity process; Unity-MCP CLI not executable: $UNITY_MCP_CLI" >&2
      exit 6
    fi
    "$UNITY_MCP_CLI" close "$ROOT" || true
    for _ in {1..30}; do
      if ! pgrep -fl "Unity.app/Contents/MacOS/Unity .*${ROOT}" >/dev/null; then
        break
      fi
      sleep 1
    done
    if pgrep -fl "Unity.app/Contents/MacOS/Unity .*${ROOT}" >/dev/null; then
      echo "Existing Unity process did not exit cleanly for project: $ROOT" >&2
      exit 6
    fi
  else
    echo "Unity is already open for this project. Close it or rerun with CLOSE_EXISTING_UNITY=1." >&2
    exit 6
  fi
fi

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
