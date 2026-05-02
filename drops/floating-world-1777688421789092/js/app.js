const App = (() => {
  let canvas = null;
  let ctx = null;
  let started = false;
  let isPressing = false;
  let dragSpeed = 0;
  let lastDragTime = 0;
  let lastDragX = 0, lastDragY = 0;
  let isTouchDevice = false;
  let activePointerId = null;

    // Double-tap tracking
  let lastTapTime = 0;
  let lastTapX = 0, lastTapY = 0;

    // Reset in-progress guard
  let isResetting = false;

    // Settle guard: prevents double call from pointerup/pointercancel race
  let isSettling = false;

   // Haptic feedback: batch tracking for smooth patterns
  let _lastHapticTime = 0;
  let _hapticQueue = [];
  let _hapticDraining = false;

   // ── RAF delta time accumulator for frame-rate-independent motion ──
  let _lastFrameTime = 0;

  function init() {
    canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    window.addEventListener('resize', onResize);
    onResize();
    Render.init(canvas);
    setupInput(canvas);

    const prompt = document.getElementById('prompt');
    window._hidePrompt = () => {
      if (prompt) prompt.classList.add('hidden');
     };

     // Start RAF loop with initial timestamp
    _lastFrameTime = performance.now();
    renderLoop();
   }

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Render.init(canvas);
   }

  function setupInput(el) {
    isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (window.PointerEvent) {
      // ── Unified PointerEvent path: lowest-latency input path ──
      // Uses getCoalescedEvents() for batched touch samples
      // Tracks active pointerId to reject overlapping touches
     el.addEventListener('pointerdown', e => {
       e.preventDefault();
       activePointerId = e.pointerId;
       onPointerDown(e.clientX, e.clientY, e.pointerId);
       }, { passive: false });

     window.addEventListener('pointermove', e => {
       if (!isPressing || e.pointerId !== activePointerId) return;
       e.preventDefault();
         // Process all coalesced events to minimize input lag
       if (e.getCoalescedEvents) {
         const pts = e.getCoalescedEvents();
         for (const pt of pts) {
           if (pt.pointerId === activePointerId) onPointerMove(pt.clientX, pt.clientY);
           }
         } else {
         onPointerMove(e.clientX, e.clientY);
         }
       }, { passive: false });

      window.addEventListener('pointerup', e => {
        if (e.pointerId !== activePointerId) return;
        onPointerUp();
        }, { passive: true });
      window.addEventListener('pointercancel', e => {
        if (e.pointerId !== activePointerId) return;
        onPointerUp();
        }, { passive: true });

        // CRITICAL: pointerleave fires when pointer exits viewport (e.g., scroll, swipe,
        // browser chrome). Without this, isPressing stays true perpetually, causing
        // stuck audio layers and visual artifacts on next press.
      window.addEventListener('pointerleave', e => {
        if (e.pointerId === activePointerId && isPressing) {
          onPointerUp();
          }
        }, { passive: true });

        // Visibility change: treat as release if pressing
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPressing) {
          onPointerUp();
          }
        });

      return;
      }

      // Fallback: separate mouse + touch listeners for older browsers.
      // Guard: only register these if PointerEvent is NOT supported, otherwise
      // both paths would fire simultaneously (double audio taps, double visual updates).
    if (!window.PointerEvent) {
      el.addEventListener('mousedown', e => onPointerDown(e.clientX, e.clientY));
      window.addEventListener('mousemove', e => { if (isPressing) onPointerMove(e.clientX, e.clientY); });
      window.addEventListener('mouseup', onPointerUp);

      el.addEventListener('touchstart', e => {
        e.preventDefault();
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        onPointerDown(t.clientX, t.clientY);
        }, { passive: false });

      window.addEventListener('touchmove', e => {
        if (!isPressing) return;
        if (e.touches.length !== 1) { onPointerUp(); return; }
        e.preventDefault();
        const t = e.touches[0];
        onPointerMove(t.clientX, t.clientY);
        }, { passive: false });

      window.addEventListener('touchend', onPointerUp);
      window.addEventListener('touchcancel', onPointerUp);
      }
  }

   // ── Double-tap detection ──
  function checkDoubleTap(x, y) {
    const now = performance.now();
    const dt = now - lastTapTime;
    const dx = Math.abs(x - lastTapX);
    const dy = Math.abs(y - lastTapY);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dt < 500 && dist < 120 && started) {
      return true;
     }
    lastTapTime = now;
    lastTapX = x;
    lastTapY = y;
    return false;
   }

  function onPointerDown(x, y, pointerId) {
    if (isResetting) return;

    if (checkDoubleTap(x, y)) {
      triggerReset();
      return;
      }

    isPressing = true;
    dragSpeed = 0;
    lastDragX = x;
    lastDragY = y;

    if (!started) {
      started = true;
      Audio.init();
      window._hidePrompt && window._hidePrompt();

        // Start ambient harbor tone on first press — fades in slowly (~8s)
      Audio.startAmbient();
      }

    Render.onDown(x, y);
    Audio.tap();
    Audio.startPaperRub();
    Audio.setPaperVolume(.12);
    Audio.startWaterDrone();
    Audio.setWaterVolume(0);

    queueHaptic('press');
   }

  function onPointerMove(x, y) {
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTime);
    lastDragTime = now;

    const dx2 = x - lastDragX;
    const dy2 = y - lastDragY;
    const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    dragSpeed = Math.min(1, dist / (dt * 3) * 15);
    lastDragX = x;
    lastDragY = y;

    Render.onMove(x, y);

    const effectiveSpeed = dragSpeed;
    Audio.setPaperVolume(.08 + effectiveSpeed * .25);
    Audio.setWaterVolume(effectiveSpeed * .2);

    if (dist > 15 && isTouchDevice) {
      queueHaptic('drag');
     }
   }

  function onPointerUp() {
    if (!isPressing) return;
    isPressing = false;
    activePointerId = null;

    if (isTouchDevice) {
      queueHaptic('release');
      }

       // ── SetInterval replaced with Web Audio native exponentialRampToValueAtTime ──
       // No more setInterval for audio fade. Audio.settle() now handles all fade-out
       // using Web Audio scheduled ramps.
       // Double-call guard: isSettling prevents pointerup/pointercancel race
    if (!isResetting && !isSettling) {
      isSettling = true;
      Render.onUp();
      Audio.settle();
       // Unlock after fade completes (1.6s matches Web Audio ramp)
      setTimeout(() => { isSettling = false; }, 1700);
      }
    }

   // ── Reset handler ──
  function triggerReset() {
    isResetting = true;

    if (isTouchDevice) {
      queueHaptic('reset');
     }

     // Stop all continuous audio layers
    Audio.stopWaterDrone();
    Audio.stopPaperRub();
    Audio.setPaperVolume(0);
    Audio.setWaterVolume(0);

    Render.resetScene();
    Audio.playReset();

     // Restart ambient layers softly after reset sound (no setInterval)
    setTimeout(() => {
      Audio.startPaperRub();
      Audio.startWaterDrone();
      Audio.startAmbient();

       // Use Web Audio's exponentialRamp for smooth volume ramp-down (no setInterval)
      Audio.setPaperVolume(.04);
      Audio.setWaterVolume(.03);
      Audio.fadeAllDown(2500);

      setTimeout(() => {
        Audio.stopPaperRub();
        Audio.stopWaterDrone();
        Audio.setPaperVolume(0);
        Audio.setWaterVolume(0);
        isResetting = false;
       }, 2700);
     }, 1200);
   }

   // ── Haptic feedback helpers ──
  function queueHaptic(type) {
    if (!navigator.vibrate) return;
    try {
      switch (type) {
        case 'press':
          _hapticQueue.push([6]);
          break;
        case 'drag':
          if (performance.now() - _lastHapticTime < 200) return;
          _hapticQueue.push([3]);
          break;
        case 'release':
          _hapticQueue.push([1, 30, 8]);
          break;
        case 'reset':
          _hapticQueue.push([4, 50, 4]);
          break;
       }
      _drainHapticQueue();
     } catch (_) {}
   }

  function _drainHapticQueue() {
    if (_hapticDraining || !_hapticQueue.length) return;
    _hapticDraining = true;
    const pattern = _hapticQueue.shift();
    _lastHapticTime = performance.now();
    navigator.vibrate(pattern);
    const totalMs = pattern.reduce((a, b) => a + b, 0) + 20;
    setTimeout(() => {
        _hapticDraining = false;
        _drainHapticQueue();
       }, totalMs);
    }

  function renderLoop() {
    let idleT = 0;
    let rafId = null;
    function frame(now) {
       rafId = requestAnimationFrame(frame);

        // Audio lookahead: schedule audio events on rAF cadence for sync
      Audio.scheduleTick();

        // Frame-rate-independent idle drift
      const dt = Math.min(50, now - _lastFrameTime);
       _lastFrameTime = now;

       if (ctx && canvas) {
             // Always draw - the render.js dirty flag handles skipping expensive layers
         Render.draw(ctx);

         if (started) {
           idleT += dt * .008;
           Render.idleDrift(idleT, isPressing);
             }
          }
      }
    requestAnimationFrame(frame);
    }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
   } else {
    init();
   }

  return { getCanvas: () => canvas };
})();
