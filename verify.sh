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

# --- New polish checks ---

# Audio system
if grep -q 'playTone' "$FILE"; then
  echo "PASS: audio system (playTone)"
else
  echo "FAIL: audio system missing"
  exit 1
fi

# Catch sound
if grep -q 'playCatch' "$FILE"; then
  echo "PASS: catch sound feedback"
else
  echo "FAIL: playCatch missing"
  exit 1
fi

# Accessibility: aria-label attributes
if grep -q 'aria-label' "$FILE"; then
  echo "PASS: aria-label attributes"
else
  echo "FAIL: missing aria-label"
  exit 1
fi

# Controls hint
if grep -q 'controls-hint' "$FILE"; then
  echo "PASS: controls hint"
else
  echo "FAIL: missing controls-hint"
  exit 1
fi

# Stats breakdown
if grep -q 'stat-row' "$FILE"; then
  echo "PASS: stat-row breakdown"
else
  echo "FAIL: missing stat-row"
  exit 1
fi

# Relative home URL
if grep -q '../../drops/' "$FILE"; then
  echo "PASS: relative home URL"
else
  echo "FAIL: absolute home URL"
  exit 1
fi

# Level announcement
if grep -q 'level-announce' "$FILE"; then
  echo "PASS: level announcement element"
else
  echo "FAIL: missing level-announce"
  exit 1
fi

# Streak unlock
if grep -q 'streak-unlock' "$FILE"; then
  echo "PASS: streak unlock element"
else
  echo "FAIL: missing streak-unlock"
  exit 1
fi
# Timer seconds display
if grep -q 'timer-seconds' "$FILE"; then
  echo "PASS: timer-seconds display found"
else
  echo "FAIL: missing timer-seconds display"
  exit 1
fi

# playStreak audio function
if grep -q 'playStreak' "$FILE"; then
  echo "PASS: playStreak audio function found"
else
  echo "FAIL: missing playStreak audio"
  exit 1
fi

# --- Polish round 8 checks ---
if grep -q 'danger-pulse' "$FILE"; then
  echo "PASS: danger-pulse CSS animation"
else
  echo "FAIL: missing danger-pulse"
  exit 1
fi
if grep -q 'miss-flash' "$FILE"; then
  echo "PASS: miss-flash overlay"
else
  echo "FAIL: missing miss-flash"
  exit 1
fi
if grep -q 'spawnPetals' "$FILE"; then
  echo "PASS: sakura petal overlay on game-over"
else
  echo "FAIL: missing spawnPetals"
  exit 1
fi
if grep -q 'petalFall' "$FILE"; then
  echo "PASS: petalFall keyframe animation"
else
  echo "FAIL: missing petalFall"
  exit 1
fi
if grep -q 'Gentle Breeze' "$FILE"; then
  echo "PASS: streak milestone 3 text"
else
  echo "FAIL: missing streak milestone 3"
  exit 1
fi
if grep -q 'Autumn Gust' "$FILE"; then
  echo "PASS: streak milestone 10 text"
else
  echo "FAIL: missing streak milestone 10"
  exit 1
fi

# --- Polish round 9 checks ---
if grep -q 'combo-meter' "$FILE"; then
  echo "PASS: combo meter element"
else
  echo "FAIL: missing combo-meter"
  exit 1
fi
if grep -q 'combo-gold' "$FILE"; then
  echo "PASS: combo-gold class for high streaks"
else
  echo "FAIL: missing combo-gold"
  exit 1
fi
if grep -q 'level-flash' "$FILE"; then
  echo "PASS: level-flash overlay"
else
  echo "FAIL: missing level-flash"
  exit 1
fi
if grep -q 'woodblock-texture' "$FILE"; then
  echo "PASS: woodblock texture overlay"
else
  echo "FAIL: missing woodblock-texture"
  exit 1
fi
