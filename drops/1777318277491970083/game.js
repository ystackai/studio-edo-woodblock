(function () {
  "use strict";

  // ─── Constants ──────────────────────────────────────────────
  var STALL_THRESHOLD = 0.45;
  var DECAY_DURATION = 2.5;
  var STONE_RADIUS = 28;
  var DRAG_MIN_PX = 30;

  // ─── State ──────────────────────────────────────────────────
  var STATE_IDLE = "idle";
  var STATE_DRAGGING = "dragging";
  var STATE_STALLED = "stalled";
  var STATE_DROPPING = "dropping";
  var STATE_DECAYING = "decaying";

  var state = STATE_IDLE;
  var dragStartY = 0;
  var dragStartX = 0;
  var dragCurrentY = 0;
  var dragCurrentX = 0;
  var maxDragDistance = 0;
  var stoneX = 0;
  var stoneY = 0;
  var stoneBaseY = 0;
  var stoneBaseX = 0;
  var dropStartTime = 0;
  var dropProgress = 0;
  var stoneSubmerge = 0;
  var rippleActive = false;
  var rippleTime = 0;
  var rippleOriginX = 0;
  var rippleOriginY = 0;
  var audioCtx = null;
  var activeGainNodes = [];
  var hapticPulse = false;

    // Seeded PRNG for deterministic procedural visuals
  var bgSeed = 137;
  function bgRand() {
    bgSeed = (bgSeed * 16807) % 2147483647;
    return (bgSeed - 1) / 2147483646;
    }

    // Pre-seeded stone texture positions (deterministic, no per-frame random)
  var stoneTexAngles = [];
  var stoneTexRadii = [];
  (function () {
    var s = 42;
    function sr() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var i = 0; i < 20; i++) {
      stoneTexAngles.push(sr() * Math.PI * 2);
      stoneTexRadii.push(0.2 + sr() * 0.7);
      }
    })();

  // ─── Canvas Setup ───────────────────────────────────────────
  var bgCanvas = document.getElementById("bg-canvas");
  var bgCtx = bgCanvas.getContext("2d");
  var glCanvas = document.getElementById("gl-canvas");
  var stoneCanvas = document.getElementById("stone-canvas");
  var stoneCtx = stoneCanvas.getContext("2d");

  var width = 0;
  var height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    bgCanvas.width = width * dpr;
    bgCanvas.height = height * dpr;
    bgCtx.scale(dpr, dpr);

    glCanvas.width = width * dpr;
    glCanvas.height = height * dpr;

    stoneCanvas.width = width * dpr;
    stoneCanvas.height = height * dpr;
    stoneCtx.scale(dpr, dpr);

    stoneBaseX = width / 2;
    stoneBaseY = height * 0.35;
    stoneX = stoneBaseX;
    stoneY = stoneBaseY;

    drawBackground();
  }

  window.addEventListener("resize", resize);

  // ─── Procedural Background ──────────────────────────────────
    function drawBackground() {
       // Deep water gradient
     var g = bgCtx.createLinearGradient(0, 0, 0, height);
     g.addColorStop(0, "#2a3545");
     g.addColorStop(0.15, "#1e2a38");
     g.addColorStop(0.4, "#162030");
     g.addColorStop(0.7, "#0f1828");
     g.addColorStop(1, "#080d18");
     bgCtx.fillStyle = g;
     bgCtx.fillRect(0, 0, width, height);

      // Subtle horizontal water striations (deterministic)
     for (var i = 0; i < 60; i++) {
       var y = (i / 60) * height + Math.sin(i * 0.7) * 8;
       var a = 0.015 + bgRand() * 0.02;
       bgCtx.fillStyle = "rgba(120, 140, 170, " + a + ")";
       bgCtx.fillRect(0, y, width, 1 + bgRand() * 2);
      }

      // Silt particles at bottom (deterministic)
     for (var j = 0; j < 200; j++) {
       var sx = bgRand() * width;
       var sy = height * 0.7 + bgRand() * height * 0.3;
       var sr = 0.5 + bgRand() * 2;
       var sa = 0.05 + bgRand() * 0.12;
       var warmth = bgRand();
       var r = Math.round(60 + warmth * 50);
       var gn = Math.round(45 + warmth * 30);
       var b = Math.round(30 + warmth * 20);
       bgCtx.beginPath();
       bgCtx.arc(sx, sy, sr, 0, Math.PI * 2);
       bgCtx.fillStyle = "rgba(" + r + "," + gn + "," + b + "," + sa + ")";
       bgCtx.fill();
      }

    // Deeper silt gradient at very bottom
    var siltG = bgCtx.createLinearGradient(0, height * 0.85, 0, height);
    siltG.addColorStop(0, "rgba(30, 25, 20, 0)");
    siltG.addColorStop(1, "rgba(30, 25, 20, 0.6)");
    bgCtx.fillStyle = siltG;
    bgCtx.fillRect(0, height * 0.85, width, height * 0.15);
  }

  // ─── Stone Drawing ──────────────────────────────────────────
  function drawStone(x, y, radius, submerge) {
    stoneCtx.clearRect(0, 0, width, height);

    if (submerge >= 1.0) return;

    var visibleAlpha = 1.0 - submerge * 0.8;
    var scale = 1.0 - submerge * 0.3;
    var r = radius * scale;

    var drawX = x;
    var drawY = y + submerge * 20;

    // Shadow
    stoneCtx.beginPath();
    stoneCtx.arc(drawX + 2, drawY + 3, r, 0, Math.PI * 2);
    var shadowG = stoneCtx.createRadialGradient(drawX + 2, drawY + 3, r * 0.3, drawX + 2, drawY + 3, r);
    shadowG.addColorStop(0, "rgba(5, 10, 20, " + (0.4 * visibleAlpha) + ")");
    shadowG.addColorStop(1, "rgba(5, 10, 20, " + (0.1 * visibleAlpha) + ")");
    stoneCtx.fillStyle = shadowG;
    stoneCtx.fill();

    // Stone body - irregular organic shape
    stoneCtx.beginPath();
    var points = 12;
    for (var i = 0; i <= points; i++) {
      var angle = (i / points) * Math.PI * 2;
      var variation = 1.0 + Math.sin(angle * 3 + 1.2) * 0.08 + Math.cos(angle * 5 + 0.7) * 0.05;
      var px = drawX + Math.cos(angle) * r * variation;
      var py = drawY + Math.sin(angle) * r * variation * 0.88;
      if (i === 0) stoneCtx.moveTo(px, py);
      else stoneCtx.lineTo(px, py);
    }
    stoneCtx.closePath();

    var stoneG = stoneCtx.createRadialGradient(drawX - r * 0.25, drawY - r * 0.2, r * 0.1, drawX, drawY, r * 1.05);
    stoneG.addColorStop(0, "rgba(85, 75, 65, " + visibleAlpha + ")");
    stoneG.addColorStop(0.4, "rgba(55, 50, 45, " + visibleAlpha + ")");
    stoneG.addColorStop(0.7, "rgba(35, 32, 30, " + visibleAlpha + ")");
    stoneG.addColorStop(1, "rgba(20, 18, 16, " + visibleAlpha + ")");
    stoneCtx.fillStyle = stoneG;
    stoneCtx.fill();

      // Stone texture - small surface irregularities (pre-seeded, no flicker)
    for (var t = 0; t < 20; t++) {
      var tx = drawX + Math.cos(stoneTexAngles[t]) * r * stoneTexRadii[t];
      var ty = drawY + Math.sin(stoneTexAngles[t]) * r * stoneTexRadii[t] * 0.88;
      var tr = 1 + (stoneTexRadii[t] % 1) * 2;
      stoneCtx.beginPath();
      stoneCtx.arc(tx, ty, tr, 0, Math.PI * 2);
      stoneCtx.fillStyle = "rgba(" + (25 + t * 2) + "," + (20 + t) + "," + (18 + t) + "," + (0.15 * visibleAlpha) + ")";
      stoneCtx.fill();
     }

    // Subtle highlight
    stoneCtx.beginPath();
    stoneCtx.ellipse(drawX - r * 0.2, drawY - r * 0.25, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
    stoneCtx.fillStyle = "rgba(180, 170, 155, " + (0.08 * visibleAlpha) + ")";
    stoneCtx.fill();
  }

  // ─── WebGL Ripple Shader ────────────────────────────────────
  var gl = null;
  var rippleProgram = null;
  var rippleUniforms = {};
  var rippleBuffer = null;

  var VERT = [
    "attribute vec2 a_position;",
    "void main() {",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "uniform vec2 u_resolution;",
    "uniform vec2 u_origin;",
    "uniform float u_time;",
    "uniform float u_alpha;",
    "",
    "void main() {",
    "  vec2 uv = gl_FragCoord.xy / u_resolution;",
    "  vec2 pos = gl_FragCoord.xy;",
    "",
    "  float dist = distance(pos, u_origin);",
    "",
    "  // Ripple wave function - two concentric rings",
    "  float speed = 120.0;",
    "  float radius = u_time * speed;",
    "  float ringWidth = 18.0 + u_time * 25.0;",
    "  float distFromRing = abs(dist - radius);",
    "",
    "  // Primary ripple ring",
    "  float ring = smoothstep(ringWidth * 0.5, 0.0, distFromRing);",
    "  ring *= smoothstep(0.0, 4.0, distFromRing);",
    "",
    "  // Secondary ripple ring (trailing)",
    "  float radius2 = radius * 0.6;",
    "  float ring2Width = ringWidth * 0.6;",
    "  float dist2 = abs(dist - radius2);",
    "  float ring2 = smoothstep(ring2Width * 0.5, 0.0, dist2);",
    "  ring2 *= smoothstep(0.0, 3.0, dist2);",
    "",
    "  // Inner diffusion ring",
    "  float radius3 = radius * 0.3;",
    "  float innerWidth = ringWidth * 0.4;",
    "  float dist3 = abs(dist - radius3);",
    "  float ring3 = smoothstep(innerWidth * 0.5, 0.0, dist3);",
    "  ring3 *= smoothstep(0.0, 2.5, dist3);",
    "",
    "  // Combine rings with ink-bleed falloff",
    "  float intensity = ring * 0.5 + ring2 * 0.35 + ring3 * 0.25;",
    "",
    "  // Ink-bleed: low saturation, warm tones with alpha decay",
    "  vec3 inkColor = vec3(0.42, 0.38, 0.46);",
    "  vec3 bleedColor = vec3(0.35, 0.30, 0.40);",
    "  ",
    "  // Viscous spread effect - outward darkening",
    "  float spread = exp(-dist * 0.003);",
    "  float viscid = intensity * spread;",
    "  ",
    "  // Color variation across the ripple (like wet ink on paper)",
    "  float angle = atan(pos.y - u_origin.y, pos.x - u_origin.x);",
    "  float variation = 0.9 + 0.1 * sin(angle * 5.0 + u_time * 2.0);",
    "  ",
    "  vec3 finalColor = mix(bleedColor, inkColor, intensity) * variation;",
    "  float finalAlpha = viscid * u_alpha;",
    "  ",
    "  // Extra inner softness",
    "  if (dist < radius * 0.2) {",
    "    float innerFade = dist / (radius * 0.2);",
    "    finalAlpha *= innerFade * 0.3;",
    "  }",
    "  ",
    "  gl_FragColor = vec4(finalColor, finalAlpha);",
    "}"
  ].join("\n");

  function initWebGL() {
    gl = glCanvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      depth: false,
      stencil: false
    });

    if (!gl) {
      console.warn("WebGL not available, ripple will be skippable.");
      return;
    }

    // Compile vertex shader
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error("VS error:", gl.getShaderInfoLog(vs));
      return;
    }

    // Compile fragment shader
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("FS error:", gl.getShaderInfoLog(fs));
      return;
    }

    // Link program
    rippleProgram = gl.createProgram();
    gl.attachShader(rippleProgram, vs);
    gl.attachShader(rippleProgram, fs);
    gl.linkProgram(rippleProgram);
    if (!gl.getProgramParameter(rippleProgram, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(rippleProgram));
      return;
    }

    gl.useProgram(rippleProgram);

    // Full-screen quad
    var verts = new Float32Array([
      -1, -1,  1, -1,  -1,  1,
      -1,  1,  1, -1,   1,  1
    ]);
    rippleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rippleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    var loc = gl.getAttribLocation(rippleProgram, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    rippleUniforms.resolution = gl.getUniformLocation(rippleProgram, "u_resolution");
    rippleUniforms.origin = gl.getUniformLocation(rippleProgram, "u_origin");
    rippleUniforms.time = gl.getUniformLocation(rippleProgram, "u_time");
    rippleUniforms.alpha = gl.getUniformLocation(rippleProgram, "u_alpha");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  function drawRipple(time, alpha) {
    if (!gl || !rippleActive) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(rippleProgram);

    gl.uniform2f(rippleUniforms.resolution, glCanvas.width, glCanvas.height);
    gl.uniform2f(rippleUniforms.origin, rippleOriginX * dpr, rippleOriginY * dpr);
    gl.uniform1f(rippleUniforms.time, time);
    gl.uniform1f(rippleUniforms.alpha, alpha);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // ─── Audio Engine ───────────────────────────────────────────
  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playStallImpact() {
    ensureAudioCtx();
    var t = audioCtx.currentTime;

    // Layer 1: Dry low thud
    var thudOsc = audioCtx.createOscillator();
    var thudGain = audioCtx.createGain();
    thudOsc.type = "sine";
    thudOsc.frequency.setValueAtTime(55, t);
    thudOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
    thudGain.gain.setValueAtTime(0.6, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    thudOsc.connect(thudGain);
    thudGain.connect(audioCtx.destination);
    thudOsc.start(t);
    thudOsc.stop(t + 0.45);
    activeGainNodes.push(thudGain);

    // Layer 1b: Sub-80Hz resonance groan
    var groanOsc = audioCtx.createOscillator();
    var groanGain = audioCtx.createGain();
    var groanFilter = audioCtx.createBiquadFilter();
    groanOsc.type = "sawtooth";
    groanOsc.frequency.setValueAtTime(42, t);
    groanOsc.frequency.linearRampToValueAtTime(28, t + 0.3);
    groanFilter.type = "lowpass";
    groanFilter.frequency.setValueAtTime(80, t);
    groanFilter.frequency.linearRampToValueAtTime(40, t + DECAY_DURATION);
    groanGain.gain.setValueAtTime(0.001, t);
    groanGain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    groanGain.gain.setValueAtTime(0.35, t + 0.08);
    groanGain.gain.exponentialRampToValueAtTime(0.001, t + DECAY_DURATION);
    groanOsc.connect(groanFilter);
    groanFilter.connect(groanGain);
    groanGain.connect(audioCtx.destination);
    groanOsc.start(t);
    groanOsc.stop(t + DECAY_DURATION + 0.05);
    activeGainNodes.push(groanGain);

    // Layer 2: Water displacement / silt settling exhale
    var bufferSize = audioCtx.sampleRate * 2;
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    var exhaleFilter = audioCtx.createBiquadFilter();
    var exhaleFilter2 = audioCtx.createBiquadFilter();
    exhaleFilter.type = "lowpass";
    exhaleFilter.frequency.setValueAtTime(250, t + 0.15);
    exhaleFilter.frequency.exponentialRampToValueAtTime(40, t + DECAY_DURATION);
    exhaleFilter2.type = "lowpass";
    exhaleFilter2.frequency.setValueAtTime(180, t + 0.15);
    exhaleFilter2.frequency.exponentialRampToValueAtTime(30, t + DECAY_DURATION);

    var exhaleGain = audioCtx.createGain();
    exhaleGain.gain.setValueAtTime(0.001, t);
    exhaleGain.gain.linearRampToValueAtTime(0.18, t + 0.12);
    exhaleGain.gain.exponentialRampToValueAtTime(0.001, t + DECAY_DURATION);

    noise.connect(exhaleFilter);
    exhaleFilter.connect(exhaleFilter2);
    exhaleFilter2.connect(exhaleGain);
    exhaleGain.connect(audioCtx.destination);
    noise.start(t + 0.1);
    noise.stop(t + DECAY_DURATION + 0.05);
    activeGainNodes.push(exhaleGain);

    // Haptic feedback
    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }
  }

  function silenceAudio() {
    for (var i = 0; i < activeGainNodes.length; i++) {
      try {
        activeGainNodes[i].gain.setValueAtTime(0, audioCtx.currentTime);
      } catch (e) {}
    }
    activeGainNodes = [];
  }

  // ─── Interaction Handlers ───────────────────────────────────
  function getMaxDragDist() {
    return height * 0.55;
  }

  function getPointerY(e) {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY;
    return e.clientY;
  }

  function getPointerX(e) {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
    return e.clientX;
  }

  function onPointerDown(e) {
    if (state !== STATE_IDLE) return;
    e.preventDefault();

    var px = getPointerX(e);
    var py = getPointerY(e);

    // Check if touching near the stone
    var dist = Math.sqrt((px - stoneX) * (px - stoneX) + (py - stoneY) * (py - stoneY));
    if (dist < STONE_RADIUS * 3) {
      state = STATE_DRAGGING;
      dragStartY = py;
      dragStartX = px;
      dragCurrentY = py;
      dragCurrentX = px;
      maxDragDistance = getMaxDragDist();
    }
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (state === STATE_DRAGGING) {
      var py = getPointerY(e);
      var px = getPointerX(e);
      dragCurrentY = py;
      dragCurrentX = px;

      var dragDist = py - dragStartY;
      if (dragDist < 0) dragDist = 0;

      // Stone follows thumb with zero lag
      stoneX = stoneBaseX + (px - dragStartX) * 0.3;
      stoneY = stoneBaseY + dragDist;

      var dragRatio = dragDist / maxDragDistance;

      // STALL at exactly 45% drag distance (ratio)
      if (dragRatio >= STALL_THRESHOLD && !hapticPulse) {
        hapticPulse = true;
        triggerStall();
      }
    }
  }

  function onPointerUp(e) {
    if (state === STATE_DRAGGING) {
      // If not yet stalled, reset
      var dragDist = dragCurrentY - dragStartY;
      var dragRatio = dragDist / maxDragDistance;
      if (dragRatio < STALL_THRESHOLD) {
        resetState();
      }
    }
    if (state === STATE_DECAYING) {
      // Early reset on thumb release
      resetState();
    }
  }

  function triggerStall() {
    state = STATE_STALLED;
    rippleActive = true;
    rippleTime = 0;
    rippleOriginX = stoneX;
    rippleOriginY = stoneY;
    dropStartTime = performance.now();
    dropProgress = 0;
    stoneSubmerge = 0;

    playStallImpact();

    // After a brief stall feel, begin the drop
    setTimeout(function () {
      if (state === STATE_STALLED) {
        state = STATE_DROPPING;
      }
    }, 120);
  }

  function resetState() {
    state = STATE_IDLE;
    rippleActive = false;
    rippleTime = 0;
    stoneSubmerge = 0;
    dropProgress = 0;
    hapticPulse = false;
    silenceAudio();
    stoneX = stoneBaseX;
    stoneY = stoneBaseY;
  }

   // Touch events — on topmost canvas so nothing blocks them
  stoneCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
  stoneCanvas.addEventListener("touchmove", onPointerMove, { passive: false });
  stoneCanvas.addEventListener("touchend", onPointerUp, { passive: false });
  stoneCanvas.addEventListener("touchcancel", onPointerUp, { passive: false });

  // Mouse events (for desktop testing)
  stoneCanvas.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  // ─── Main Loop ─────────────────────────────────────────────
  var lastTime = 0;

  function frame(now) {
    requestAnimationFrame(frame);

    var dt = (now - lastTime) / 1000;
    if (dt > 0.1) dt = 0.016;
    lastTime = now;

    // Update stone position for state
    if (state === STATE_DROPPING) {
      var elapsed = (now - dropStartTime) / 1000;
      var dropDuration = 0.6;
      dropProgress = Math.min(elapsed / dropDuration, 1.0);

      // Easing: fast initial drop, then slow settle
      var eased = 1 - Math.pow(1 - dropProgress, 3);
      stoneSubmerge = eased;

      if (dropProgress >= 1.0) {
        state = STATE_DECAYING;
        dropStartTime = now;
      }
    } else if (state === STATE_DECAYING) {
      var decayElapsed = (now - dropStartTime) / 1000;
      rippleTime = decayElapsed;
      stoneSubmerge = 1.0;

      if (decayElapsed >= DECAY_DURATION) {
        resetState();
      }
    }

    // Draw stone
    drawStone(stoneX, stoneY, STONE_RADIUS, stoneSubmerge);

    // Draw ripple via WebGL
    var rippleAlpha = 1.0;
    if (rippleActive) {
      var totalElapsed = 0;

      if (state === STATE_STALLED || state === STATE_DROPPING) {
        totalElapsed = (now - dropStartTime) / 1000;
      } else if (state === STATE_DECAYING) {
        totalElapsed = rippleTime;
      }

      // Alpha decay: linear from 1 -> 0 over 2.5 seconds
      rippleAlpha = Math.max(0, 1.0 - totalElapsed / DECAY_DURATION);
      // Ensure hard cutoff at exactly DECAY_DURATION
      if (totalElapsed >= DECAY_DURATION) rippleAlpha = 0;

      // Clamp ripple time to prevent infinite expansion
      var clampTime = Math.min(totalElapsed, DECAY_DURATION);
      drawRipple(clampTime, rippleAlpha);
    }
  }

  // ─── Init ───────────────────────────────────────────────────
  function init() {
    resize();
    initWebGL();
    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
