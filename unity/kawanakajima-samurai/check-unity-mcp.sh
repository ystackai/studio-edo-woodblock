#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI="${UNITY_MCP_CLI:-/Users/marcus/codex-work/local-unity-tools/node_modules/.bin/unity-mcp-cli}"
UNITY="${UNITY:-$HOME/Applications/Unity/Hub/Editor/2023.2.20f1/Unity.app/Contents/MacOS/Unity}"
MCP_URL="${UNITY_MCP_URL:-http://localhost:27482}"
LOG="${LOG:-/tmp/kawanakajima-unity-mcp-preflight.log}"
OPEN_EDITOR=0

if [[ "${1:-}" == "--open" ]]; then
  OPEN_EDITOR=1
fi

if [[ ! -x "$CLI" ]]; then
  echo "Unity-MCP CLI not executable: $CLI" >&2
  exit 2
fi

{
  echo "=== Kawanakajima Unity MCP preflight ==="
  date -u +"%Y-%m-%dT%H:%M:%SZ"
  echo "Project: $ROOT"
  echo "CLI: $CLI"
  echo "MCP_URL: $MCP_URL"
  echo "Unity: $UNITY"
  echo

  echo "=== Current status ==="
  "$CLI" status "$ROOT" || true

  echo
  echo "=== Process diagnostics ==="
  if pgrep -fl "Unity.app/Contents/MacOS/Unity .*${ROOT}" >/dev/null; then
    pgrep -fl "Unity.app/Contents/MacOS/Unity .*${ROOT}" || true
  else
    echo "No Unity Editor process found for this project path."
  fi
  if pgrep -fl "Unity Hub.*${ROOT}" >/dev/null; then
    echo "Unity Hub helper process references this project path:"
    pgrep -fl "Unity Hub.*${ROOT}" || true
  fi
  echo
  echo "Listening MCP-like ports:"
  lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | grep -E 'gamedev-mcp|Unity|27482|27481|25666|21560' || true

  if [[ "$OPEN_EDITOR" -eq 1 ]]; then
    if [[ ! -x "$UNITY" ]]; then
      echo "Unity executable not found or not executable: $UNITY" >&2
      exit 3
    fi

    echo
    echo "=== Launching Unity with MCP env ==="
    "$CLI" open "$ROOT" \
      --editor-path "$UNITY" \
      --url "$MCP_URL" \
      --auth none \
      --keep-connected \
      --transport streamableHttp \
      --start-server true \
      --no-auto-dismiss-launch-errors

    echo
    echo "=== Waiting for MCP readiness ==="
    if "$CLI" wait-for-ready "$ROOT" --url "$MCP_URL" --timeout 120000 --interval 3000; then
      echo "UNITY_MCP_READY url=$MCP_URL"
      exit 0
    fi

    echo
    echo "=== Unity Editor log tail ==="
    tail -120 "$HOME/Library/Logs/Unity/Editor.log" || true

    echo
    echo "=== Closing Unity after failed MCP preflight ==="
    "$CLI" close "$ROOT" || true
    exit 3
  fi

  echo
  echo "Run with --open to launch Unity with MCP connection variables and wait for readiness."
  exit 1
} 2>&1 | tee "$LOG"

exit "${PIPESTATUS[0]}"
