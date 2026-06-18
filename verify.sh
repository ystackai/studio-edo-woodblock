#!/bin/bash
set -euo pipefail

echo "=== Verification: Floating Score ==="

# --- Regression test: Begin/startGame interaction ---
if [ -f "test-begin-button.js" ]; then
  echo "PASS: test-begin-button.js exists"
  node test-begin-button.js || { echo "FAIL: test-begin-button.js failed"; exit 1; }
  echo "PASS: Begin/startGame regression test passes"
else
  echo "FAIL: test-begin-button.js not found"
  exit 1
fi

# --- Regression test: Kawanakajima 3D browser preview ---
if [ -f "test-kawanakajima-3d.js" ]; then
  echo "PASS: test-kawanakajima-3d.js exists"
  node test-kawanakajima-3d.js || { echo "FAIL: test-kawanakajima-3d.js failed"; exit 1; }
else
  echo "FAIL: test-kawanakajima-3d.js not found"
  exit 1
fi

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
echo "=== Core Floating Score checks passed ==="

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

# --- Polish round 10 checks ---
if grep -q 'function animateCountUp' "$FILE"; then
  echo "PASS: count-up score animation function"
else
  echo "FAIL: missing animateCountUp"
  exit 1
fi
if grep -q 'animateCountUp.*finalScore' "$FILE"; then
  echo "PASS: count-up score animation used on game-over"
else
  echo "FAIL: animateCountUp not called for final score"
  exit 1
fi

# --- Polish round 10b checks ---
if grep -q 'new-highscore' "$FILE"; then
  echo "PASS: new-highscore CSS class for celebration glow"
else
  echo "FAIL: missing new-highscore"
  exit 1
fi
if grep -q 'Beat previous record' "$FILE"; then
  echo "PASS: score comparison message on game-over"
else
  echo "FAIL: missing score comparison"
  exit 1
fi
if grep -q 'startAmbientDrone' "$FILE"; then
  echo "PASS: ambient drone audio function"
else
  echo "FAIL: missing ambient drone"
  exit 1
fi

# --- Polish round 10c checks ---
if grep -q 'game-over-flavor' "$FILE"; then
  echo "PASS: game-over ukiyo-e flavor text"
else
  echo "FAIL: missing game-over flavor text"
  exit 1
fi
if grep -q '@keyframes fadeIn' "$FILE"; then
  echo "PASS: fadeIn keyframe animation"
else
  echo "FAIL: missing fadeIn keyframe"
  exit 1
fi

# --- Polish: Mute key and focus management ---
if grep -q "M key toggles mute" "$FILE"; then
  echo "PASS: mute key handler (M key)"
else
  echo "FAIL: missing mute key handler"
  exit 1
fi
if grep -q "close-controls-btn" "$FILE" && grep -q "focus" "$FILE"; then
  echo "PASS: controls modal focus management"
else
  echo "FAIL: missing controls modal focus management"
  exit 1
fi

# --- Polish: pause-controls-btn and controls grid entry ---
if grep -q 'pause-controls-btn' "$FILE"; then
  echo "PASS: pause-controls-btn found (controls access during paused state)"
else
  echo "FAIL: missing pause-controls-btn"
  exit 1
fi
if grep -q '? / H.*Show controls' "$FILE"; then
  echo "PASS: controls grid entry for ?/H shortcut"
# --- Polish: aria-live pause announcements and titleAtmosphere background ---
if grep -q 'ariaLive.textContent.*Game paused' "$FILE"; then
  echo "PASS: aria-live announces Game paused"
else
  echo "FAIL: missing aria-live pause announcement"
  exit 1
fi
if grep -q 'ariaLive.textContent.*Game resumed' "$FILE"; then
  echo "PASS: aria-live announces Game resumed"
else
  echo "FAIL: missing aria-live resume announcement"
  exit 1
fi
if grep -q 'titleAtmosphere' "$FILE"; then
  echo "PASS: titleAtmosphere keyframe present (start-screen background drift)"
else
  echo "FAIL: missing titleAtmosphere keyframe"
  exit 1
fi
if grep -q 'goldPulse' "$FILE"; then
  echo "PASS: goldPulse keyframe present (combo meter pulse at streak milestones)"
else
  echo "FAIL: missing goldPulse keyframe"
  exit 1
fi

else
  echo "FAIL: missing ?/H controls grid entry"
  exit 1
fi
if grep -q 'toggleMute' "$FILE"; then
  echo "PASS: toggleMute function found"
else
  echo "FAIL: missing toggleMute function"
  exit 1
fi

echo "=== All verifications passed ==="
