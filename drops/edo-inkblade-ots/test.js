const fs = require("fs");
const path = require("path");

const root = __dirname;
const htmlPath = path.join(root, "index.html");
const previewPath = path.join(root, "preview.html");
const html = fs.readFileSync(htmlPath, "utf8");
const preview = fs.readFileSync(previewPath, "utf8");

const checks = [
  ["index exists", fs.existsSync(htmlPath)],
  ["preview exists", fs.existsSync(previewPath)],
  ["canvas renderer", html.includes("<canvas") && html.includes("getContext(\"2d\")")],
  ["over the shoulder language", /over[- ]the[- ]shoulder|perspective|horizon|depth/i.test(html)],
  ["projection function for depth", html.includes("function project") && html.includes("horizon")],
  ["character selection", html.includes("Miyamoto Musashi") && html.includes("Koeda") && html.includes("Yoshino")],
  ["movement controls", html.includes("keys.w") && html.includes("arrowleft") && html.includes("arrowright")],
  ["art creation loop", html.includes("function paint") && html.includes("ink") && html.includes("marks")],
  ["duel loop", html.includes("function slash") && html.includes("blocking") && html.includes("enemies")],
  ["objective progression", html.includes("function updateQuest") && html.includes("Ganryu")],
  ["animation loop", html.includes("requestAnimationFrame(loop)")],
  ["preview redirect", preview.includes("window.location.replace")],
  ["not Floating Score", !html.includes("Floating Score") && !html.includes("floating-score-hs")],
  ["not falling object game", !/falling|catch drifting|score-display/.test(html)]
];

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) console.log(`PASS: ${name}`);
  else {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}

if (failed) {
  console.error(`${failed} Edo Inkblade smoke checks failed`);
  process.exit(1);
}
console.log("All Edo Inkblade smoke checks passed");
