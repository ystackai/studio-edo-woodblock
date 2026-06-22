#!/usr/bin/env bash
set -euo pipefail

APP="${APP:-/Users/marcus/Documents/Github/studio-edo-woodblock/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai}"
LOG="${LOG:-/tmp/kawanakajima-built-player-smoke.log}"
MODE="${MODE:-graphics}"
SECONDS_TO_WAIT="${SECONDS_TO_WAIT:-45}"

if [[ ! -x "$APP" ]]; then
  echo "Built player executable not found or not executable: $APP" >&2
  exit 2
fi

args=(-batchmode -logFile "$LOG")
if [[ "$MODE" == "nographics" ]]; then
  args=(-batchmode -nographics -logFile "$LOG")
fi

rm -f "$LOG"
"$APP" "${args[@]}" &
pid=$!

for ((i = 0; i < SECONDS_TO_WAIT; i++)); do
  if [[ -f "$LOG" ]]; then
    if grep -E "KAWANAKAJIMA_UNITY_READY|UNITY HANDOFF LOAD FAILED|ArgumentNullException|Exception|Error|Failed|Crash" "$LOG" >/dev/null; then
      if grep -E "KAWANAKAJIMA_UNITY_READY|UNITY HANDOFF LOAD FAILED|ArgumentNullException|Crash" "$LOG" >/dev/null; then
        break
      fi
    fi
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    break
  fi
  sleep 1
done

if kill -0 "$pid" 2>/dev/null; then
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
else
  wait "$pid" 2>/dev/null || true
fi

if [[ ! -f "$LOG" ]]; then
  echo "Player did not create a log file: $LOG" >&2
  exit 3
fi

if grep -E "KAWANAKAJIMA_UNITY_READY.*actors=20.*pack=True.*audio=True|KAWANAKAJIMA_UNITY_READY.*actors=20.*pack=true.*audio=true" "$LOG" >/dev/null; then
  echo "Built player smoke: PASS"
  grep -E "KAWANAKAJIMA_UNITY_READY|actors=|pack=|audio=" "$LOG"
  exit 0
fi

echo "Built player smoke: FAIL" >&2
grep -nE "KAWANAKAJIMA_UNITY_READY|UNITY HANDOFF LOAD FAILED|actors=|pack=|audio=|ArgumentNullException|Exception|Error|Failed|Crash" "$LOG" >&2 || true
tail -120 "$LOG" >&2
exit 1
