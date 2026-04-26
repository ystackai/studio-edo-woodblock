(function () {
   "use strict";

   /* --------------- constants --------------- */
   var SNAP_THRESHOLD     = 0.8;     // 80% drag distance to bloom
   var VEL_THRESHOLD      = 150;     // peak px/s velocity to trigger snap
   var BLOOM_DURATION     = 250;     // ms — locked yield ease-out
   var RESET_DELAY        = 1200;    // ms before state clears
   var BASS_DELAY         = 40;      // ms delay relative to visual snap
   var BASS_FREQ          = 75;
   var HUM_FREQ           = 55;
   var SCROLL_DAMPEN      = 0.7;    // 70% momentum reduction
   var HUM_DECAY_RATE     = 0.015;
   var MAX_QUEUE          = 3;
   var EASE_POWER         = 3;       // ease-out exponent

   /* --------------- phase enum --------------- */
   var PHASE = {
     IDLE:       0,
     INITIATION: 1,
     HOLD:       2,
     SNAP:       3,
     YIELD:      4,
     RESET:      5
   };

   /* --------------- state --------------- */
   var state = {
     phase:         PHASE.IDLE,
     dragStartY:     0,
     dragCurrentY:   0,
     displacement:     0,
     velocity:         0,
     lastY:            0,
     lastTime:         0,
     blobX:           0,
     blobY:           0,
     blobRadius:       0,
     blobOpacity:      0,
     edgeSoftness:     0,
     humVolume:        0,
     swiped:        false,
     queued:          [],       // rapid-swipe queue (≤3)
     yieldStart:       0,
     resetStart:       0,
     bassPlayed:      false,
     scrollDampened:  false,
     dampenExpiry:    0,
     lastFrameTime:    0,
     activePointer: null         // pointer id currently dragging
   };

   /* --------------- canvas setup --------------- */
   var canvas = document.getElementById("c");
   var ctx    = canvas.getContext("2d");
   var dpr    = Math.min(window.devicePixelRatio || 1, 2);
   var W, H, viewH;

   function resize() {
     viewH = window.innerHeight;
     W = canvas.width   = window.innerWidth   * dpr;
     H = canvas.height = window.innerHeight * dpr;
     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
   window.addEventListener("resize", resize);
   resize();

   /* --------------- audio engine --------------- */
   var audioCtx = null;
   var humOsc   = null;
   var humGain  = null;
   var humActive = false;
   var bassSchedTime = 0;
   var bassScheduled = false;

   function ensureAudio() {
     if (!audioCtx) {
       audioCtx = new (window.AudioContext || window.webkitAudioContext)();
       humOsc  = audioCtx.createOscillator();
       humGain = audioCtx.createGain();
       humOsc.type = "sine";
       humOsc.frequency.value = HUM_FREQ;
       humGain.gain.value = 0;
       humOsc.connect(humGain);
       humGain.connect(audioCtx.destination);
       humOsc.start();
       humActive = true;
      }
     if (audioCtx.state === "suspended") audioCtx.resume();
    }

   function setHumVol(v) {
     if (!humGain || !audioCtx) return;
     v = Math.max(0, Math.min(v, 0.18));
     humGain.gain.setTargetAtTime(v, audioCtx.currentTime, 0.03);
    }

   function scheduleBass(delayMs) {
     if (!audioCtx) return;
     bassScheduled = true;
     bassSchedTime = audioCtx.currentTime + delayMs / 1000;
    }

   function fireBass() {
     if (!audioCtx || bassScheduled) return;
     bassScheduled = true;
     var now = audioCtx.currentTime;

     var osc   = audioCtx.createOscillator();
     var gain  = audioCtx.createGain();
     osc.type = "sine";
     osc.frequency.setValueAtTime(BASS_FREQ, now);
     osc.frequency.exponentialRampToValueAtTime(38, now + 0.4);
     gain.gain.setValueAtTime(0.55, now);
     gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
     osc.connect(gain);
     gain.connect(audioCtx.destination);
     osc.start(now);
     osc.stop(now + 0.65);
    }

   function checkScheduledBass() {
     if (bassScheduled && audioCtx && audioCtx.currentTime >= bassSchedTime) {
       bassScheduled = false;
       var osc = audioCtx.createOscillator();
       var gain = audioCtx.createGain();
       osc.type = "sine";
       osc.frequency.setValueAtTime(BASS_FREQ, audioCtx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(38, audioCtx.currentTime + 0.4);
       gain.gain.setValueAtTime(0.55, audioCtx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
       osc.connect(gain);
       gain.connect(audioCtx.destination);
       osc.start();
       osc.stop(audioCtx.currentTime + 0.65);
      }
    }

   /* --------------- haptics --------------- */
   function pulseHaptic() {
     if (navigator.vibrate) {
       try { navigator.vibrate(35); } catch (_) {}
      }
    }

   /* --------------- input handling --------------- */
   var pointers = new Map();

   function getPointerY(e) {
     if (e.touches && e.touches[0]) return e.touches[0].clientY;
     if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientY;
     return e.clientY;
   }

   function getPointerId(e) {
     if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
     if (e.touches && e.touches[0]) return e.touches[0].identifier;
     return "mouse";
   }

   canvas.addEventListener("touchstart", onDown, { passive: false });
   canvas.addEventListener("mousedown", onDown);

   function onDown(e) {
     e.preventDefault();
     ensureAudio();

     var y  = getPointerY(e);
     var id = getPointerId(e);
     state.activePointer = id;

     if (state.phase === PHASE.IDLE) {
       // Fresh interaction — reset everything
       state.phase         = PHASE.INITIATION;
       state.dragStartY    = y;
       state.dragCurrentY  = y;
       state.lastY         = y;
       state.lastTime      = performance.now();
       state.displacement   = 0;
       state.velocity       = 0;
       state.blobX         = window.innerWidth / 2;
       state.blobY         = y;
       state.blobRadius    = 0;
       state.blobOpacity   = 0;
       state.edgeSoftness  = 0;
       state.humVolume     = 0.1;
       state.swiped        = false;
       state.bassPlayed    = false;
       state.bassScheduled = false;
       state.queued        = [];
       setHumVol(0.1);
      } else if (
       state.phase === PHASE.RESET ||
       state.phase === PHASE.YIELD ||
       state.phase === PHASE.SNAP
     ) {
       // Queue rapid swipe (max 3)
       if (state.queued.length < MAX_QUEUE) {
         state.queued.push({
           y: y,
           t: performance.now(),
           blobX: window.innerWidth / 2,
           blobY: y
          });
        }
      }
     pointers.set(id, y);
    }

   canvas.addEventListener("touchmove", onMove, { passive: false });
   canvas.addEventListener("mousemove", onMove);

   function onMove(e) {
     e.preventDefault();
     var y  = getPointerY(e);
     var id = getPointerId(e);

     if (state.activePointer !== id) return;

     if (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD) {
       var now = performance.now();
       var dt = Math.max(0.5, now - state.lastTime);
       var dy = state.lastY - y;

       state.velocity     = Math.abs(dy / dt * 16);
       state.displacement = Math.abs(y - state.dragStartY);
       state.dragCurrentY = y;
       state.lastY        = y;
       state.lastTime     = now;
       state.blobY        = y;
       state.blobX        = window.innerWidth / 2;

       var progress = state.displacement / viewH;

       if (progress >= 0.08 && state.phase === PHASE.INITIATION) {
         state.phase = PHASE.HOLD;
        }

       // Hum fades as drag deepens
       setHumVol(0.1 * (1 - progress * 0.8));
      }

     pointers.set(id, y);
    }

   canvas.addEventListener("touchend", onUp);
   canvas.addEventListener("mouseup", onUp);

   function onUp(e) {
     var id = e.changedTouches ? e.changedTouches[0].identifier : "mouse";
     pointers.delete(id);
     if (state.activePointer === id) {
       state.activePointer = null;
      }
    }

   /* --------------- scroll dampening ------------------- */
   // Intercept wheel and touch-scroll to apply 70% dampening
   var wheelDampenActive = false;

   function activateScrollDampen() {
     if (wheelDampenActive) return;
     wheelDampenActive = true;
     state.dampenExpiry = performance.now() + RESET_DELAY;
    }

   function checkDampenExpiry() {
     if (wheelDampenActive && performance.now() >= state.dampenExpiry) {
       wheelDampenActive = false;
      }
    }

   window.addEventListener("wheel", function (e) {
     if (wheelDampenActive) {
       e.preventDefault();
       // Simulate 70% dampening by only allowing 30% of the delta
       window.scrollBy(0, Math.round(e.deltaY * (1 - SCROLL_DAMPEN)));
      }
   }, { passive: false });

   /* --------------- snap / yield logic --------------- */
   function triggerSnap() {
     if (state.swiped) return;
     state.phase    = PHASE.SNAP;
     state.swiped   = true;
     state.yieldStart = performance.now();
     state.blobOpacity = 0.05;
     state.blobRadius  = 20 * dpr;
     state.edgeSoftness = 0;

     // Haptic fires immediately at snap threshold
     pulseHaptic();

     // Bass delayed 40ms relative to visual snap
     scheduleBass(BASS_DELAY);

     // Scroll dampening kicks in
     activateScrollDampen();
    }

   function processQueue() {
     if (state.queued.length === 0) return;
     var entry = state.queued.shift();
     state.phase         = PHASE.INITIATION;
     state.dragStartY    = entry.y;
     state.dragCurrentY  = entry.y;
     state.lastY         = entry.y;
     state.lastTime      = performance.now();
     state.displacement   = 0;
     state.velocity       = 0;
     state.blobX         = entry.blobX;
     state.blobY         = entry.blobY;
     state.blobRadius    = 0;
     state.blobOpacity   = 0;
     state.edgeSoftness  = 0;
     state.humVolume     = 0.1;
     state.swiped        = false;
     state.bassPlayed    = false;
     state.bassScheduled = false;
     setHumVol(0.1);
    }

   /* --------------- drawing --------------- */

   // Core indigo-to-void gradient holding tension
   function drawBaseGradient() {
     var cx = state.blobX * dpr;
     var cy = state.blobY * dpr;
     var maxR = Math.max(W, H) * 0.7;

     var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

     if (state.phase === PHASE.IDLE) {
       grad.addColorStop(0,   "rgba(18, 12, 40, 1)");
       grad.addColorStop(0.4, "rgba(8, 6, 20, 1)");
       grad.addColorStop(1,   "rgba(0, 0, 0, 1)");
      } else {
       var soft = state.edgeSoftness;
       var op0 = 0.95 - soft * 0.15;
       var op1 = 0.9  - soft * 0.2;
       var op2 = 0.85 - soft * 0.15;
       grad.addColorStop(0,   "rgba(25, 15, 50, " + op0.toFixed(3) + ")");
       grad.addColorStop(0.4, "rgba(10, 7, 25, " + op1.toFixed(3) + ")");
       grad.addColorStop(1,   "rgba(0, 0, 0, " + op2.toFixed(3) + ")");
      }

     ctx.fillStyle = grad;
     ctx.fillRect(0, 0, W, H);
    }

   // Amber / rose bloom on snap+yield
   function drawBloom() {
     if (state.blobOpacity <= 0.005) return;

     var cx = state.blobX * dpr;
     var cy = state.blobY * dpr;
     var r  = state.blobRadius;
     var op = state.blobOpacity;

     // Primary amber core
     var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
     grad.addColorStop(0.0, "rgba(255, 185, 70, " + op.toFixed(3) + ")");
     grad.addColorStop(0.3, "rgba(240, 130, 80, " + (op * 0.7).toFixed(3) + ")");
     grad.addColorStop(0.65,"rgba(210, 75, 100, " + (op * 0.35).toFixed(3) + ")");
     grad.addColorStop(1.0, "rgba(50, 20, 40, 0)");

     ctx.save();
     ctx.globalCompositeOperation = "lighter";
     ctx.fillStyle = grad;
     ctx.beginPath();
     ctx.arc(cx, cy, r, 0, Math.PI * 2);
     ctx.fill();
     ctx.restore();

     // Outer warm glow (rose bleed)
     ctx.save();
     ctx.globalCompositeOperation = "screen";
     var glowR = r * 2;
     var glow = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, glowR);
     glow.addColorStop(0, "rgba(255, 200, 100, " + (op * 0.2).toFixed(3) + ")");
     glow.addColorStop(0.5,"rgba(220, 100, 80,  " + (op * 0.08).toFixed(3) + ")");
     glow.addColorStop(1, "rgba(80, 40, 60, 0)");
     ctx.fillStyle = glow;
     ctx.beginPath();
     ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
     ctx.fill();
     ctx.restore();
    }

   // Thin line tracing the drag path
   function drawDragLine() {
     if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;
     if (Math.abs(state.dragCurrentY - state.dragStartY) < 2) return;

     var sx = state.blobX * dpr;
     var sy1 = state.dragStartY * dpr;
     var sy2 = state.dragCurrentY * dpr;

     var grad = ctx.createLinearGradient(sx, sy1, sx, sy2);
     var prog = Math.min(1, state.displacement / viewH);
     var alpha = Math.min(0.35, prog * 0.45);
     grad.addColorStop(0, "rgba(150, 110, 200, " + alpha.toFixed(3) + ")");
     grad.addColorStop(1, "rgba(80, 50, 150, 0)");

     ctx.save();
     ctx.strokeStyle = grad;
     ctx.lineWidth   = 2 * dpr;
     ctx.lineCap    = "round";
     ctx.beginPath();
     ctx.moveTo(sx, sy1);
     ctx.lineTo(sx, sy2);
     ctx.stroke();
     ctx.restore();
    }

   // Subtle glow that tracks the thumb during drag
   function drawCursorGlow() {
     if (state.phase !== PHASE.INITIATION && state.phase !== PHASE.HOLD) return;

     var intensity = Math.min(1, state.displacement / (viewH * 0.6));
     var cx = state.blobX * dpr;
     var cy = state.blobY * dpr;
     var r  = 35 * dpr * (0.5 + intensity * 0.5);

     var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
     grad.addColorStop(0, "rgba(180, 145, 225, " + (0.06 + intensity * 0.14).toFixed(3) + ")");
     grad.addColorStop(1, "rgba(100, 70, 170, 0)");

     ctx.fillStyle = grad;
     ctx.beginPath();
     ctx.arc(cx, cy, r, 0, Math.PI * 2);
     ctx.fill();
    }

   /* --------------- render loop --------------- */
   var rafId = null;

   function update(t) {
     var dt      = (t - (state.lastFrameTime || t)) / 1000;
     dt = Math.min(dt, 0.05); // clamp to avoid huge jumps
     state.lastFrameTime = t;

     checkDampenExpiry();
     checkScheduledBass();

     var progress = state.displacement / viewH;

     /* ---- snap threshold check ---- */
     if (!state.swiped &&
         (state.phase === PHASE.INITIATION || state.phase === PHASE.HOLD)) {
       if (progress >= SNAP_THRESHOLD || state.velocity >= VEL_THRESHOLD) {
         triggerSnap();
        }
      }

     /* ---- hold: hum decay ---- */
     if (state.phase === PHASE.HOLD) {
       state.humVolume = Math.max(0.003, state.humVolume - HUM_DECAY_RATE * dt * 60);
       setHumVol(state.humVolume);
      }

     /* ---- snap: brief pause, then yield ---- */
     if (state.phase === PHASE.SNAP) {
       var snapElapsed = t - state.yieldStart;
       if (snapElapsed >= BASS_DELAY) {
         state.phase = PHASE.YIELD;
         state.yieldStart = t;
        } else {
         // Tiny pre-bloom
         state.blobRadius  = (20 + snapElapsed * 0.3) * dpr;
         state.blobOpacity = 0.05 + snapElapsed * 0.003;
        }
      }

     /* ---- yield: locked 250ms ease-out ---- */
     if (state.phase === PHASE.YIELD) {
       var elapsed  = t - state.yieldStart;
       var t0 = Math.min(1, elapsed / BLOOM_DURATION);
       // Custom ease-out: 1 - (1-t)^3
       var eased = 1 - Math.pow(1 - t0, EASE_POWER);

       state.blobOpacity  = 0.65 * (1 - eased * 0.55);
       state.blobRadius   = (25 + eased * 280) * dpr;
       state.edgeSoftness = eased * 0.55;

       // Hum swells as gradient yields
       setHumVol(0.015 + eased * 0.1);

       if (t0 >= 1) {
         state.phase     = PHASE.RESET;
         state.resetStart = t;
         setHumVol(0.005);
        }
      }

     /* ---- reset: 1.2s fade ---- */
     if (state.phase === PHASE.RESET) {
       var rp = Math.min(1, (t - state.resetStart) / RESET_DELAY);
       state.blobOpacity  = Math.max(0, 0.04 * (1 - rp));
       state.edgeSoftness = Math.max(0, state.edgeSoftness * (1 - dt * 2.5));

       if (rp >= 1) {
         state.phase         = PHASE.IDLE;
         state.blobRadius    = 0;
         state.blobOpacity   = 0;
         state.edgeSoftness  = 0;
         state.displacement  = 0;
         state.velocity      = 0;
         state.swiped       = false;
         state.bassPlayed   = false;
         state.bassScheduled = false;

         // Process queued rapid swipes
         if (state.queued.length > 0) {
           processQueue();
          }
        }
      }

     /* ---- idle: micro-hum ---- */
     if (state.phase === PHASE.IDLE && humActive) {
       setHumVol(0.004 + Math.sin(t * 0.0007) * 0.002);
      }

     /* ---- draw ---- */
     ctx.clearRect(0, 0, W, H);
     drawBaseGradient();
     drawCursorGlow();
     drawDragLine();
     drawBloom();
    }

   function loop(t) {
     update(t);
     rafId = requestAnimationFrame(loop);
    }

   rafId = requestAnimationFrame(loop);
 })();
