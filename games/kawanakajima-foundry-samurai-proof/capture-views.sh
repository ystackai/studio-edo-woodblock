#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SHOTDIR="$ROOT_DIR/.factoryx/work-orders/work-order-1781913967751-7-1/screenshots"
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
  local had_good=false
  local good_sz=0
  if [ -f "$out" ]; then
    local cursz=$(stat -c%s "$out" 2>/dev/null || echo 0)
    if [ "$cursz" -gt 30000 ]; then
      had_good=true
      good_sz=$cursz
      cp "$out" "/tmp/good_${name}.png" 2>/dev/null || true
    fi
  fi
  echo "CAPTURE $name -> $out"
  chromium --headless=new --disable-gpu --no-sandbox --disable-setuid-sandbox \
    --disable-dev-shm-usage --window-size=1280,800 \
    --virtual-time-budget=12000 --run-all-compositor-stages-before-draw \
    --screenshot="$tmpout" \
    "$url" 2>/dev/null || true
  sleep 0.7
  if [ -f "$tmpout" ]; then
    local new_sz=$(stat -c%s "$tmpout" 2>/dev/null || echo 0)
    if [ "$new_sz" -gt 30000 ]; then
      mv "$tmpout" "$out"
      cp "$out" "$GAME_DIR/screenshots/${name}.png" 2>/dev/null || true
      echo "  accepted new larger $new_sz"
    elif $had_good; then
      echo "  keeping previous good $good_sz (new was $new_sz)"
      cp "/tmp/good_${name}.png" "$out" 2>/dev/null || true
      cp "$out" "$GAME_DIR/screenshots/${name}.png" 2>/dev/null || true
    else
      mv "$tmpout" "$out" 2>/dev/null || true
      cp "$out" "$GAME_DIR/screenshots/${name}.png" 2>/dev/null || true
    fi
    ls -l "$out"
  else
    echo "  WARN: no screenshot for $name"
  fi
}

# Give the GLB time to load on first hit
sleep 2.5

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

