#!/bin/bash
set -euo pipefail

echo "=== Verification: Floating Score ==="

# Check that the game HTML file exists
FILE="drops/floating-score/index.html"
if [ ! -f "$FILE" ]; then
  echo "FAIL: $FILE missing"
  exit 1
fi
echo "PASS: $FILE exists"

# Check DOCTYPE
if grep -q '<!DOCTYPE html>' "$FILE"; then
  echo "PASS: DOCTYPE present"
else
  echo "FAIL: missing DOCTYPE"
  exit 1
fi

# Check balanced HTML tags
if grep -q '</html>' "$FILE"; then
  echo "PASS: closing html tag"
else
  echo "FAIL: missing closing html"
  exit 1
fi
if grep -q '</body>' "$FILE"; then
  echo "PASS: closing body tag"
else
  echo "FAIL: missing closing body"
  exit 1
fi

# Check game canvas exists
if grep -q '<canvas' "$FILE"; then
  echo "PASS: canvas element found"
else
  echo "FAIL: missing canvas"
  exit 1
fi

# Check score/level/streak mechanics
if grep -q 'score-display' "$FILE"; then
  echo "PASS: score display found"
else
  echo "FAIL: missing score display"
  exit 1
fi
if grep -q 'level-display' "$FILE"; then
  echo "PASS: level display found"
else
  echo "FAIL: missing level display"
  exit 1
fi
if grep -q 'streak' "$FILE"; then
  echo "PASS: streak mechanic found"
else
  echo "FAIL: missing streak mechanic"
  exit 1
fi
if grep -q 'timeLeft' "$FILE"; then
  echo "PASS: timer mechanic found"
else
  echo "FAIL: missing timer mechanic"
  exit 1
fi

# Check progression mechanics
if grep -q 'level' "$FILE" && grep -q 'score' "$FILE"; then
  echo "PASS: progression mechanics present (level + score)"
else
  echo "FAIL: missing progression mechanics"
  exit 1
fi

# Check high score persistence
if grep -q 'localStorage' "$FILE" && grep -q 'floating-score-hs' "$FILE"; then
  echo "PASS: high score persistence via localStorage"
else
  echo "FAIL: missing high score persistence"
  exit 1
fi

# Check input support
if grep -q 'keydown' "$FILE"; then
  echo "PASS: keyboard support"
else
  echo "FAIL: missing keyboard support"
  exit 1
fi
if grep -q 'touchstart' "$FILE"; then
  echo "PASS: touch support"
else
  echo "FAIL: missing touch support"
  exit 1
fi

# Check ukiyo-e drawing functions
if grep -q 'drawWave\|drawBlossom\|drawMountain\|drawBird\|drawCloud' "$FILE"; then
  echo "PASS: ukiyo-e element drawing functions found"
else
  echo "FAIL: missing ukiyo-e drawing functions"
  exit 1
fi

# Check studio.json registration
if python3 -c "import json; d=json.load(open('studio.json')); assert any(g['slug']=='floating-score' for g in d['games']['shipped'])" 2>/dev/null; then
  echo "PASS: studio.json lists floating-score"
else
  echo "FAIL: floating-score not in studio.json"
  exit 1
fi

# Check asset-manifest registration
if python3 -c "import json; d=json.load(open('.ystack/current/asset-manifest.json')); assert any(a['slug']=='floating-score' for a in d['assets'])" 2>/dev/null; then
  echo "PASS: asset-manifest lists floating-score"
else
  echo "FAIL: floating-score not in asset-manifest"
  exit 1
fi

# Check drops/index.html lists floating-score
if grep -q 'floating-score' 'drops/index.html'; then
  echo "PASS: drops/index.html lists floating-score"
else
  echo "FAIL: floating-score not in drops/index"
  exit 1
fi

echo ""
echo "=== All verifications passed ==="
