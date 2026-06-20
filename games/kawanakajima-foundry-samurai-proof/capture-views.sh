#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SHOTDIR="$ROOT_DIR/.factoryx/work-orders/work-order-1781916431833-7-15/screenshots"
GAME_DIR="$ROOT_DIR/games/kawanakajima-foundry-samurai-proof"
mkdir -p "$SHOTDIR" "$GAME_DIR/screenshots"

PORT=8944
echo "=== Starting verification server on :$PORT (root $ROOT_DIR) ==="
python3 -m http.server $PORT --directory "$GAME_DIR" >/tmp/verify-server.log 2>&1 &
SRV=$!
sleep 1.8

function shot() {
  local name=$1
  local url="http://127.0.0.1:$PORT/index.html?cam=$name"
  local out="$SHOTDIR/${name}.png"
  local tmpout="/tmp/cap_${name}.png"
  echo "CAPTURE $name -> $out"
  rm -f "$tmpout"
  for attempt in 1 2 3; do
    chromium --headless=new --disable-gpu --no-sandbox --disable-setuid-sandbox \
      --disable-dev-shm-usage --window-size=1280,800 \
      --virtual-time-budget=$((32000 + attempt * 8000)) --run-all-compositor-stages-before-draw \
      --screenshot="$tmpout" \
      "$url" 2>/dev/null || true
    sleep 0.8
    if [ -f "$tmpout" ] && python3 - "$tmpout" "$name" <<'PY'
import sys
from pathlib import Path
from PIL import Image, ImageStat

path = Path(sys.argv[1])
name = sys.argv[2]
if path.stat().st_size < 28000:
    print(f"  invalid {name}: tiny screenshot {path.stat().st_size} bytes")
    raise SystemExit(1)
im = Image.open(path).convert("RGB")
mean = sum(ImageStat.Stat(im).mean) / 3
if mean < 18:
    print(f"  invalid {name}: dark/loading screenshot mean={mean:.2f}")
    raise SystemExit(1)
print(f"  valid {name}: {path.stat().st_size} bytes mean={mean:.2f}")
PY
    then
      mv "$tmpout" "$out"
      cp "$out" "$GAME_DIR/screenshots/${name}.png"
      ls -l "$out"
      return 0
    fi
    echo "  retrying $name ($attempt/3)"
    rm -f "$tmpout"
  done
  echo "ERROR: failed to capture readable $name screenshot" >&2
  return 1
}

# Give the GLB time to load on first hit (more for capture envs with audio+terrain)
sleep 4.5

shot "overview"
shot "redClose"
shot "blueClose"
shot "sideProfile"
shot "topFormation"
shot "assetInspect"

echo "=== Captures done ==="
kill $SRV 2>/dev/null || true
sleep 0.3
echo "Screenshots in $SHOTDIR :"
ls -l "$SHOTDIR"/*.png 2>/dev/null | cat
