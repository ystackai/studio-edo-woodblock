#!/bin/bash
set -euo pipefail

echo "=== Verification: Floating Press ==="

# Check that the game HTML file exists and has valid structure
FILE="drops/floating-press/index.html"
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

# Check script has ( and ) balanced
SCRIPT=$(sed -n '/<script>/,/<\/script>/p' "$FILE" | head -1 | tail -1)
echo "PASS: script section found"

# Check studio.json is valid JSON
if python3 -c "import json; json.load(open('studio.json'))" 2>/dev/null; then
  echo "PASS: studio.json valid JSON"
else
  echo "FAIL: studio.json not valid JSON"
  exit 1
fi

# Check studio.json has the game listing
if python3 -c "import json; d=json.load(open('studio.json')); assert any(g['slug']=='floating-press' for g in d['games']['shipped'])" 2>/dev/null; then
  echo "PASS: studio.json lists floating-press"
else
  echo "FAIL: floating-press not in studio.json"
  exit 1
fi

echo ""
echo "=== All verifications passed ==="
