#!/usr/bin/env bash
set -euo pipefail

GAME_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$GAME_DIR/../.." && pwd)"
ASSET_FOUNDRY_URL="${ASSET_FOUNDRY_URL:-http://127.0.0.1:18113}"
ASSET_FOUNDRY_DIR="${ASSET_FOUNDRY_DIR:-/Users/marcus/Documents/Github/asset-foundry}"
ASSET_NAME="${ASSET_NAME:-kawanakajima-autonomous-reviewed-battlefield-pack}"
ASSET_FOUNDRY_PORT="$(ASSET_FOUNDRY_URL="$ASSET_FOUNDRY_URL" python3 - <<'PY'
import os
from urllib.parse import urlparse

url = urlparse(os.environ["ASSET_FOUNDRY_URL"])
print(url.port or (443 if url.scheme == "https" else 80))
PY
)"
JOB_DIR=""
SUBMIT=0
RUN_BROWSER_SMOKE=0
RUN_MANAGED_UNITY_SMOKE=0
RUN_FRESH_UNITY_BUILD=0
STARTED_SERVER_PID=""

usage() {
  cat <<'USAGE'
Usage:
  run-reviewed-foundry-handoff.sh --job-dir /path/to/asset-foundry/outputs/asset-...
  run-reviewed-foundry-handoff.sh --submit

Options:
  --job-dir PATH              Use an existing reviewed Asset Foundry job.
  --submit                    Submit a fresh samurai_battlefield_pack job through the Asset Foundry HTTP API.
  --browser-smoke             Run browser pack smoke after ingest.
  --managed-unity-smoke       Run managed-patched Unity player smoke after ingest.
  --fresh-unity-build         Run a fresh local Unity Editor Mac build and smoke the built player.
  --asset-name NAME           Asset name for --submit.
  -h, --help                  Show this help.

Environment:
  ASSET_FOUNDRY_URL           Default: http://127.0.0.1:18113
  ASSET_FOUNDRY_DIR           Default: /Users/marcus/Documents/Github/asset-foundry
USAGE
}

cleanup() {
  if [[ -n "$STARTED_SERVER_PID" ]]; then
    kill "$STARTED_SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
    --job-dir)
      JOB_DIR="${2:-}"
      shift 2
      ;;
    --submit)
      SUBMIT=1
      shift
      ;;
    --browser-smoke)
      RUN_BROWSER_SMOKE=1
      shift
      ;;
    --managed-unity-smoke)
      RUN_MANAGED_UNITY_SMOKE=1
      shift
      ;;
    --fresh-unity-build)
      RUN_FRESH_UNITY_BUILD=1
      shift
      ;;
    --asset-name)
      ASSET_NAME="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ "$SUBMIT" -eq 0 && -z "$JOB_DIR" ]]; then
  echo "Provide --job-dir or --submit." >&2
  usage >&2
  exit 2
fi
if [[ "$SUBMIT" -eq 1 && -n "$JOB_DIR" ]]; then
  echo "Use either --job-dir or --submit, not both." >&2
  exit 2
fi

ensure_asset_foundry() {
  if curl -fsS "$ASSET_FOUNDRY_URL/healthz" >/dev/null 2>&1; then
    return
  fi
  if [[ ! -d "$ASSET_FOUNDRY_DIR" ]]; then
    echo "Asset Foundry is not reachable and ASSET_FOUNDRY_DIR does not exist: $ASSET_FOUNDRY_DIR" >&2
    exit 3
  fi
  echo "Starting Asset Foundry API at $ASSET_FOUNDRY_URL"
  (
    cd "$ASSET_FOUNDRY_DIR"
    PYTHONPATH=src python3 -m asset_foundry serve --port "$ASSET_FOUNDRY_PORT"
  ) >/tmp/kawanakajima-asset-foundry-api.log 2>&1 &
  STARTED_SERVER_PID=$!
  for _ in {1..30}; do
    if curl -fsS "$ASSET_FOUNDRY_URL/healthz" >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done
  echo "Asset Foundry API did not become ready. Log: /tmp/kawanakajima-asset-foundry-api.log" >&2
  exit 3
}

submit_job() {
  ensure_asset_foundry
  local response job_id state
  response="$(curl -fsS -X POST "$ASSET_FOUNDRY_URL/api/assets" \
    -H 'Content-Type: application/json' \
    --data-binary @- <<JSON
{
  "recipe": "samurai_battlefield_pack",
  "asset_name": "$ASSET_NAME",
  "prompt": "/goal Create the most realistic reviewable Kawanakajima samurai battlefield pack you can using Blender. Build 20 warring samurai, 10 Takeda and 10 Uesugi, meeting on a Japanese countryside battlefield. Use stable evidence cameras to inspect the same required angles after each significant change: wide clash, overhead layout, Takeda line, Uesugi line, and center meeting. Preserve the best version as you iterate. Stop only when the contact sheet shows no visible blocky/Minecraft-like issue worth fixing for a playable Unity world. Produce a GLB, source blend, warrior manifest, contact sheet, stable camera renders, provenance, and summary.",
  "style": "higher-fidelity stylized realism; adult armored samurai silhouettes; blackened iron, lacquer, cloth, leather, brass, steel; visible kabuto, mempo, lamellar armor, sode, kusazuri, kote, weapons, sashimono; Japanese countryside with road, rice paddies, river, hills, cedars, dawn lighting; not grey primitives, not slab-bodied, not Minecraft-like",
  "requested_by": "kawanakajima-reviewed-handoff-loop"
}
JSON
  )"
  job_id="$(printf '%s' "$response" | python3 -c 'import json,sys; print(json.load(sys.stdin)["job_id"])')"
  echo "Submitted Asset Foundry job: $job_id"
  for _ in {1..120}; do
    response="$(curl -fsS "$ASSET_FOUNDRY_URL/api/assets/$job_id")"
    state="$(printf '%s' "$response" | python3 -c 'import json,sys; print(json.load(sys.stdin)["state"])')"
    echo "Asset Foundry state: $state"
    case "$state" in
      completed)
        JOB_DIR="$(printf '%s' "$response" | python3 -c 'import json,sys; print(json.load(sys.stdin)["job_dir"])')"
        return
        ;;
      failed|failed_review)
        printf '%s\n' "$response" | python3 -m json.tool
        exit 4
        ;;
    esac
    sleep 5
  done
  echo "Timed out waiting for Asset Foundry job: $job_id" >&2
  exit 4
}

if [[ "$SUBMIT" -eq 1 ]]; then
  submit_job
fi

if [[ ! -d "$JOB_DIR" ]]; then
  echo "Job directory does not exist: $JOB_DIR" >&2
  exit 2
fi

echo "=== Ingest reviewed Foundry job ==="
node "$GAME_DIR/ingest-reviewed-foundry-job.js" "$JOB_DIR"

echo "=== Verify browser proof and Unity handoff structure ==="
(
  cd "$REPO_ROOT"
  node games/kawanakajima-foundry-samurai-proof/verify.js
  node unity/kawanakajima-samurai/verify-unity-handoff.js
)

if [[ "$RUN_BROWSER_SMOKE" -eq 1 ]]; then
  echo "=== Browser pack smoke ==="
  (cd "$REPO_ROOT" && games/kawanakajima-foundry-samurai-proof/smoke-browser-pack.sh)
fi

if [[ "$RUN_MANAGED_UNITY_SMOKE" -eq 1 ]]; then
  echo "=== Managed-patched Unity player smoke ==="
  (cd "$REPO_ROOT" && LOG=/tmp/kawanakajima-reviewed-handoff-managed-smoke.log unity/kawanakajima-samurai/smoke-managed-patched-player.sh)
fi

if [[ "$RUN_FRESH_UNITY_BUILD" -eq 1 ]]; then
  echo "=== Fresh Unity Editor build and built-player smoke ==="
  (
    cd "$REPO_ROOT"
    CLOSE_EXISTING_UNITY=1 unity/kawanakajima-samurai/run-local-unity-build.sh
    APP="$REPO_ROOT/unity/kawanakajima-samurai/Builds/Mac/KawanakajimaSamurai.app/Contents/MacOS/kawanakajima-samurai" \
      LOG=/tmp/kawanakajima-reviewed-handoff-fresh-build-smoke.log \
      unity/kawanakajima-samurai/smoke-built-player.sh
  )
fi

echo "Reviewed Foundry handoff loop: PASS"
