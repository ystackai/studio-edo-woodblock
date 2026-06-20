#!/bin/bash
set -euo pipefail

PORT=8944
SHOTDIR=".factoryx/work-orders/work-order-1781913967751-7-1/screenshots"
mkdir -p "$SHOTDIR" games/kawanakajima-foundry-samurai-proof/screenshots

echo "=== Starting verification server on :$PORT ==="
cd games/kawanakajima-foundry-samurai-proof
python3 -m http.server $PORT >/tmp/verify-server.log 2>&1 &
SRV=$!
sleep 1.4

function shot() {
  local name=$1
  local url="http://127.0.0.1:$PORT/index.html?cam=$name"
  local out="$SHOTDIR/${name}.png"
  echo "CAPTURE $name -> $out"
  chromium --headless --disable-gpu --no-sandbox --disable-setuid-sandbox \
    --disable-dev-shm-usage --window-size=1280,800 \
    --virtual-time-budget=4200 \
    --screenshot="$out" \
    "$url" 2>/dev/null || true
  sleep 0.6
  if [ -f "$out" ]; then
    cp "$out" "screenshots/${name}.png" 2>/dev/null || true
    ls -l "$out"
  else
    echo "  WARN: no screenshot for $name"
  fi
}

# Give the GLB time to load on first hit
sleep 2.2

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
ls -l "$SHOTDIR"/
