/* The Weight of the Stone — Full Interaction Loop
   States: GRIPE -> DROP -> IMPACT -> SETTLE
   Haptic decay: cubic-bezier(0.25, 1, 0.5, 1)
 */

(function () {
  "use strict";

  // ─── CANVAS & CONTEXT
  var canvas = document.getElementById("water-canvas");
  var ctx = canvas.getContext("2d");
  var stoneEl = document.getElementById("stone");
  var stateIndicator = document.getElementById("state-indicator");
  var instructionsEl = document.getElementById("instructions");

  var W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    placeStoneCenter();
  }

  window.addEventListener("resize", resizeCanvas);

  // ─── STONE STATE
  var GRAVITY = 1800;
  var stoneX, stoneY, stoneVY = 0;
  var stoneW = 120, stoneH = 100;
  var waterLevel;

  var STATE = "GRIPE";
  var gripOffsetX = 0, gripOffsetY = 0;

  function placeStoneCenter() {
    stoneX = W / 2 - stoneW / 2;
    stoneY = H * 0.15;
    waterLevel = H * 0.55;
  }

  function updateStonePosition() {
    stoneEl.style.left = stoneX + "px";
    stoneEl.style.top = stoneY + "px";
    stoneEl.style.transform = "scale(" + stoneScale + ")";
  }

  var stoneScale = 1;
  var isGripping = false;
  var dropStartTime = 0;
  var impactTime = 0;
  var settleStartTime = 0;

  // ─── RIPS / RIPPLE SYSTEM
  var ripples = [];

  function spawnRipple(cx, cy, strength) {
    ripples.push({
      cx: cx,
      cy: cy,
      maxRadius: Math.max(W, H) * 0.6 * strength,
      radius: 0,
      t: 0,
      speed: 280,
      birth: nowMs(),
    });
  }

  // ─── HAPTIC ENGINE (Dual-Motor Simulation)
  var hapticActive = false;
  var motorA = 0;
  var motorB = 0;

  /* cubic-bezier(0.25, 1, 0.5, 1) as a JS function.
     Uses iterative Newton-Raphson for the parametric cubic. */
  function cubicBezierResolve(t) {
    // P0=(0,0), P1=(0.25,1), P2=(0.5,1), P3=(1,1)
    // We need to find u such that x(u) = t, then return y(u)
    // Due to P1.y > 1, this curve goes above 1 and comes back down.
    // Clamped: the easing gives a quick initial decay then settles.
    var u = t;
    for (var i = 0; i < 10; i++) {
      var x = bezierX(u);
      var dx = bezierXPrime(u);
      var diff = x - t;
      if (Math.abs(diff) < 0.0001) break;
      u = u - diff / (dx || 0.001);
    }
    u = Math.max(0, Math.min(1, u));
    return 1 - bezierY(u); // decay from 1 to 0
  }

  function bezierX(u) {
    return 3 * (1 - u) * (1 - u) * u * 0.25 + 3 * (1 - u) * u * u * 0.5 + u * u * u;
  }

  function bezierXPrime(u) {
    return 3 * (1 - u) * (1 - u) * 0.25 + 6 * (1 - u) * u * (0.5 - 0.25) + 3 * u * u * (1 - 0.5);
  }

  function bezierY(u) {
    return 3 * (1 - u) * (1 - u) * u * 1 + 3 * (1 - u) * u * u * 1 + u * u * u * 1;
  }

  function triggerHapticBite() {
    // Sharp spike: both motors fire hard on impact
    motorA = 1.0;
    motorB = 0.6;
    hapticActive = true;
    try {
      if (navigator.vibrate) {
        navigator.vibrate([40, 30, 25, 30, 20, 40]);
      }
    } catch (e) {}
  }

  function hapticDecayStep(dt) {
    if (!hapticActive) return;
    var decayTime = settleStartTime ? nowMs() - settleStartTime : 0;
    var t = Math.min(decayTime / 2000, 1); // 2s total decay
    var envelope = cubicBezierResolve(t);
    motorA = envelope;
    motorB = envelope * 0.4;

    // Audio envelope follower tied to haptic decay
    setAudioExhaleAmplitude(envelope);

    if (t >= 1) {
      hapticActive = false;
      motorA = 0;
      motorB = 0;
      stopAudio();
    }
  }

  // Continuous haptic feedback during grip phase
  function hapticGripLoop() {
    if (STATE === "GRIPE" && isGripping) {
      // Static resistance with subtle oscillation to simulate roughness
      var roughness = 0.15 + 0.05 * Math.sin(nowMs() * 0.008);
      motorA = roughness;
      motorB = roughness * 0.6;
      try {
        if (navigator.vibrate) {
          navigator.vibrate(8);
        }
      } catch(e) {}
    }
  }

  // ─── AUDIO SYSTEM
  var audioCtx = null;
  var thudOsc = null, thudGain = null;
  var gaspNode = null, gaspGain = null, gaspFilter = null;
  var exhaleOsc = null, exhaleGain = null;
  var masterGain = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.5;
      // Master bus compression to emphasize low-mid weight
      var compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 10;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.15;
      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playThudLow() {
    ensureAudioCtx();
    // Layer 1: Thud_Low — 80Hz sine burst, fast attack
    thudOsc = audioCtx.createOscillator();
    thudGain = audioCtx.createGain();
    thudOsc.type = "sine";
    thudOsc.frequency.value = 80;
    thudGain.gain.setValueAtTime(0, audioCtx.currentTime);
    thudGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.005);
    thudGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    thudOsc.connect(thudGain);
    thudGain.connect(masterGain);
    thudOsc.start(audioCtx.currentTime);
    thudOsc.stop(audioCtx.currentTime + 0.35);
  }

  function playWaterGasp() {
    ensureAudioCtx();
    // Layer 2: Water_Gasp — filtered noise burst, 200-800Hz sweep
    var bufferSize = audioCtx.sampleRate * 0.8;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    gaspNode = audioCtx.createBufferSource();
    gaspNode.buffer = buffer;
    gaspFilter = audioCtx.createBiquadFilter();
    gaspFilter.type = "bandpass";
    gaspFilter.frequency.setValueAtTime(800, audioCtx.currentTime);
    gaspFilter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.6);
    gaspFilter.Q.value = 2;
    gaspGain = audioCtx.createGain();
    gaspGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gaspGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    gaspNode.connect(gaspFilter);
    gaspFilter.connect(gaspGain);
    gaspGain.connect(masterGain);
    gaspNode.start(audioCtx.currentTime);
    gaspNode.stop(audioCtx.currentTime + 0.85);
  }

  function playExhaleLong() {
    ensureAudioCtx();
    // Layer 3: Exhale_Long — sine wave, slow amplitude decay, 2.5s duration
    exhaleOsc = audioCtx.createOscillator();
    exhaleGain = audioCtx.createGain();
    exhaleOsc.type = "sine";
    exhaleOsc.frequency.value = 55;
    exhaleGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    exhaleGain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.1);
    exhaleGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

    exhaleOsc.connect(exhaleGain);
    exhaleGain.connect(masterGain);
    exhaleOsc.start(audioCtx.currentTime);
    exhaleOsc.stop(audioCtx.currentTime + 2.6);
  }

  function setAudioExhaleAmplitude(envelope) {
    if (exhaleGain && audioCtx) {
      exhaleGain.gain.setTargetAtTime(envelope * 0.25, audioCtx.currentTime, 0.02);
    }
  }

  function stopAudio() {
    try {
      if (thudOsc) thudOsc.stop();
      if (gaspNode) gaspNode.stop();
      if (exhaleOsc) exhaleOsc.stop();
    } catch(e) {}
    thudOsc = null;
    gaspNode = null;
    exhaleOsc = null;
  }

  // ─── VISUAL RIPPLE SHADER (Canvas 2D procedural)
  function drawWaterBackground(time) {
    // Dark silt background
    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, W, H);

    // Subtle water shading below water level
    var waterGrad = ctx.createLinearGradient(0, waterLevel, 0, H);
    waterGrad.addColorStop(0, "rgba(12, 18, 35, 0.9)");
    waterGrad.addColorStop(0.5, "rgba(8, 14, 28, 0.95)");
    waterGrad.addColorStop(1, "rgba(4, 8, 18, 1)");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterLevel, W, H - waterLevel);

    // Surface line
    ctx.strokeStyle = "rgba(60, 70, 90, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, waterLevel);
    // Gentle ambient wave
    for (var x = 0; x <= W; x += 4) {
      var waveOffset = Math.sin(x * 0.015 + time * 0.001) * 2.5;
      ctx.lineTo(x, waterLevel + waveOffset);
    }
    ctx.stroke();

    // Ukiyo-e style ink wash texture overlay
    drawInkWashOverlay(time);
  }

  function drawInkWashOverlay(time) {
    // Subtle grain for woodblock aesthetic
    // Only draw a few large "wash" strokes
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (var i = 0; i < 3; i++) {
      var cx = W * (0.25 + i * 0.25) + Math.sin(time * 0.0003 + i) * 30;
      var cy = H * (0.3 + i * 0.15);
      var r = 120 + i * 40;
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(30, 30, 45, 1)");
      grad.addColorStop(1, "rgba(30, 30, 45, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  function drawRipples(time) {
    for (var i = ripples.length - 1; i >= 0; i--) {
      var rip = ripples[i];
      var age = time - rip.birth;
      rip.t = Math.min(age / (rip.maxRadius / rip.speed + 2000), 1);
      rip.radius = rip.maxRadius * rip.t;

      if (rip.t >= 1) {
        ripples.splice(i, 1);
        continue;
      }

      // Ripple rings — Ukiyo-e style: ink-stroke, not glow
      var alpha = (1 - rip.t) * 0.4;
      ctx.save();

      // Multiple concentric rings with varying width (woodblock ink stroke aesthetic)
      for (var ring = 0; ring < 3; ring++) {
        var ringRadius = rip.radius * (0.7 + ring * 0.15);
        var ringWidth = (2.5 - ring * 0.6) * (1 - rip.t * 0.5);
        ctx.strokeStyle = "rgba(80, 100, 130, " + (alpha * (1 - ring * 0.25)) + ")";
        ctx.lineWidth = ringWidth;
        ctx.beginPath();
        ctx.ellipse(rip.cx, rip.cy, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Surface crack effect — radiating lines from impact point
      if (rip.t < 0.3) {
        var crackAlpha = (1 - rip.t / 0.3) * 0.3;
        var numCracks = 8;
        for (var c = 0; c < numCracks; c++) {
          var angle = (c / numCracks) * Math.PI * 2 + Math.sin(c * 0.5) * 0.15;
          var crackLen = rip.radius * 0.6 * (0.7 + Math.random() * 0.3);
          ctx.strokeStyle = "rgba(100, 120, 150, " + crackAlpha + ")";
          ctx.lineWidth = 2 * (1 - rip.t / 0.3);
          ctx.beginPath();
          ctx.moveTo(rip.cx, rip.cy);
          var endX = rip.cx + Math.cos(angle) * crackLen;
          var endY = rip.cy + Math.sin(angle) * crackLen * 0.3;
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  // ─── STONE RENDERING (Canvas shadow/reflection on water)
  function drawStoneReflection(time) {
    if (STATE === "SETTLE" && stoneY >= waterLevel - 10) {
      // Stone resting on water: show subtle reflection
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.translate(0, waterLevel * 2 - stoneY);
      ctx.scale(1, -0.4);
      ctx.translate(stoneX, stoneY - waterLevel);
      var reflectGrad = ctx.createRadialGradient(stoneW / 2, stoneH / 2, 10, stoneW / 2, stoneH / 2, stoneW);
      reflectGrad.addColorStop(0, "#2a2a38");
      reflectGrad.addColorStop(1, "transparent");
      ctx.fillStyle = reflectGrad;
      ctx.beginPath();
      ctx.ellipse(stoneW / 2, stoneH / 2, stoneW / 2, stoneH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ─── INPUT HANDLING
  function getPointerPos(e) {
    if (e.touches && e.touches.length === 1) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e) {
    e.preventDefault();
    var pos = getPointerPos(e);
    // Check if press is on or near stone
    var dx = pos.x - (stoneX + stoneW / 2);
    var dy = pos.y - (stoneY + stoneH / 2);
    if (dx * dx + dy * dy < stoneW * stoneW * 0.5) {
      isGripping = true;
      gripOffsetX = pos.x - stoneX;
      gripOffsetY = pos.y - stoneY;
      STATE = "GRIPE";
      stoneEl.classList.add("gripe");
      stoneEl.classList.remove("drop");
      updateStateIndicator();
      hideInstructions();
      return true;
    }
    return false;
  }

  function onPointerMove(e) {
    if (!isGripping) return;
    e.preventDefault();
    var pos = getPointerPos(e);
    stoneX = pos.x - gripOffsetX;
    stoneY = pos.y - gripOffsetY;
    stoneVY = 0;
    updateStonePosition();
  }

  function onPointerUp(e) {
    if (!isGripping) return;
    isGripping = false;
    stoneEl.classList.remove("gripe");
    stoneEl.classList.add("drop");

    if (STATE === "GRIPE") {
      STATE = "DROP";
      dropStartTime = nowMs();
      updateStateIndicator();

      // Start gravity-driven drop
      stoneVY = 0;
    }
  }

  stoneEl.addEventListener("mousedown", onPointerDown);
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("mouseup", onPointerUp);
  stoneEl.addEventListener("touchstart", onPointerDown, { passive: false });
  document.addEventListener("touchmove", onPointerMove, { passive: false });
  document.addEventListener("touchend", onPointerUp);

  // ─── STATE MANAGEMENT
  function updateStateIndicator() {
    stateIndicator.textContent = STATE;
    stateIndicator.classList.remove("hidden");
  }

  function hideInstructions() {
    instructionsEl.style.opacity = "0";
  }

  // ─── GAME LOOP
  var lastTime = 0;
  var impactPending = false;

  function loop(timestamp) {
    var now = nowMs();
    var dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // GRIPE phase: haptic feedback loop
    if (STATE === "GRIPE" && isGripping) {
      hapticGripLoop();
    }

    // DROP phase: gravity
    if (STATE === "DROP") {
      stoneVY += GRAVITY * dt;
      stoneY += stoneVY * dt;
      updateStonePosition();

      // Check impact with water surface
      if (stoneY + stoneH / 2 >= waterLevel) {
        STATE = "IMPACT";
        stoneY = waterLevel - stoneH / 2;
        stoneVY = 0;
        impactTime = now;
        settleStartTime = now;

        // Trigger impact effects
        triggerHapticBite();
        playThudLow();
        playWaterGasp();
        playExhaleLong();
        spawnRipple(stoneX + stoneW / 2, waterLevel, 1.0);

        updateStateIndicator();
        impactPending = true;
      }
    }

    // IMPACT phase: brief, then settles
    if (STATE === "IMPACT") {
      var impactAge = now - impactTime;
      hapticDecayStep(dt);

      // After 300ms of impact, transition to SETTLE
      if (impactAge > 300) {
        STATE = "SETTLE";
        updateStateIndicator();
      }
    }

    // SETTLE phase: buoyant bob + decay
    if (STATE === "SETTLE") {
      hapticDecayStep(dt);

      // Gentle bob on the water surface
      var settleAge = now - settleStartTime;
      var bobEnvelope = cubicBezierResolve(Math.min(settleAge / 2000, 1));
      var bobAmount = (1 - Math.min(settleAge / 3000, 1)) * 4;
      var bob = Math.sin(settleAge * 0.003) * bobAmount * (1 - bobEnvelope * 0.8);
      stoneY = waterLevel - stoneH * 0.4 + bob;
      updateStonePosition();

      // Secondary ripple rings that progressively fade
      if (settleAge > 500 && settleAge < 600) {
        spawnRipple(stoneX + stoneW / 2, waterLevel, 0.4);
      }
      if (settleAge > 1200 && settleAge < 1300) {
        spawnRipple(stoneX + stoneW / 2, waterLevel, 0.2);
      }
    }

    // ─── DRAW
    drawWaterBackground(now);
    drawStoneReflection(now);
    drawRipples(now);

    requestAnimationFrame(loop);
  }

  function nowMs() {
    return performance.now();
  }

  // ─── INIT
  resizeCanvas();
  updateStonePosition();
  requestAnimationFrame(function (ts) {
    lastTime = nowMs();
    loop(ts);
  });

  // ─── RESET: Click background to reset stone
  canvas.addEventListener("click", function (e) {
    if (STATE === "SETTLE") {
      // Allow reset after settle
      setTimeout(function () {
        STATE = "GRIPE";
        stoneVY = 0;
        ripples.length = 0;
        placeStoneCenter();
        updateStonePosition();
        stateIndicator.classList.add("hidden");
        instructionsEl.style.opacity = "1";
      }, 500);
    }
  });

})();
