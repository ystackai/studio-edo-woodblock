#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCHED_APP="${PATCHED_APP:-/tmp/KawanakajimaSamurai-patched.app}"
LOG="${LOG:-/tmp/kawanakajima-managed-patched-player-smoke.log}"
MODE="${MODE:-graphics}"
SECONDS_TO_WAIT="${SECONDS_TO_WAIT:-45}"

PATCHED_APP="$PATCHED_APP" "$ROOT/patch-existing-mac-player-managed.sh"

APP="$PATCHED_APP/Contents/MacOS/kawanakajima-samurai" \
LOG="$LOG" \
MODE="$MODE" \
SECONDS_TO_WAIT="$SECONDS_TO_WAIT" \
"$ROOT/smoke-built-player.sh"
