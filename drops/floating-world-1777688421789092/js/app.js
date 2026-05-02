const App = (() => {
  let canvas = null;
  let ctx = null;
  let started = false;
  let isPressing = false;
  let dragSpeed = 0;
  let lastDragTime = 0;
  let lastDragX = 0, lastDragY = 0;
  let isTouchDevice = false;

        // Double-tap tracking
  let lastTapTime = 0;
  let lastTapX = 0, lastTapY = 0;

        // Reset in-progress guard
  let isResetting = false;

        // Fade-out interval handles (to avoid leaks)
  let _paperFadeInterval = null;
  let _waterFadeInterval = null;

        // Haptic feedback: batch tracking for smooth patterns
  let _lastHapticTime = 0;
  let _hapticQueue = [];
  let _hapticDraining = false;

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

    renderLoop();
    }

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Render.init(canvas);
      }

  function setupInput(el) {
     isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    el.addEventListener('mousedown', e => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => { if (isPressing) onPointerMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', onPointerUp);

    if (window.PointerEvent && isTouchDevice) {
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (e.pointerType === 'touch') el._pd = true;
        const t = e;
        onPointerDown(t.clientX, t.clientY);
       }, { passive: false });

      window.addEventListener('pointermove', e => {
        if (!isPressing) return;
        e.preventDefault();
        const pts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const pt of pts) onPointerMove(pt.clientX, pt.clientY);
       }, { passive: false });

      window.addEventListener('pointerup', e => {
        if (el._pd && e.pointerType === 'touch') {
          el._pd = false;
          onPointerUp();
          }
       }, { passive: false });

      window.addEventListener('pointercancel', () => {
        el._pd = false;
        onPointerUp();
       }, { passive: false });
      return;
     }

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

  function onPointerDown(x, y) {
      // Before engaging press, check for double-tap → reset
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
         }

    Render.onDown(x, y);
    Audio.tap();
    Audio.startPaperRub();
    Audio.setPaperVolume(.12);
    Audio.startWaterDrone();
    Audio.setWaterVolume(0);

          // Haptic feedback: soft tap, scaled by device
    queueHaptic('press');
      }

  function onPointerMove(x, y) {
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTime);
    lastDragTime = now;

      // Calculate drag speed from distance and time
    const dx2 = x - lastDragX;
    const dy2 = y - lastDragY;
    const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    dragSpeed = Math.min(1, dist / (dt * 3) * 15);
    lastDragX = x;
    lastDragY = y;

    Render.onMove(x, y);

      // Smooth audio modulation with decay when still
    const effectiveSpeed = dragSpeed;
    Audio.setPaperVolume(.08 + effectiveSpeed * .25);
    Audio.setWaterVolume(effectiveSpeed * .2);

      // Subtle periodic haptic on meaningful drag distance
    if (dist > 15 && isTouchDevice) {
       queueHaptic('drag');
      }
    }

  function onPointerUp() {
    isPressing = false;

       // Release haptic: soft pattern
    if (isTouchDevice) {
       queueHaptic('release');
        }

       // Clear any prior fade intervals
    if (_paperFadeInterval != null) clearInterval(_paperFadeInterval);
    if (_waterFadeInterval != null) clearInterval(_waterFadeInterval);
    _paperFadeInterval = null;
    _waterFadeInterval = null;

    if (!isResetting) {
      Render.onUp();
      Audio.settle();
            }

    let v = .2;
     _paperFadeInterval = setInterval(() => {
      v *= .88;
      Audio.setPaperVolume(v);
      Audio.setWaterVolume(v * .4);
      if (v < .005) {
        clearInterval(_paperFadeInterval);
        _paperFadeInterval = null;
        Audio.setPaperVolume(0);
        Audio.setWaterVolume(0);
        setTimeout(() => Audio.stopPaperRub(), 200);
              }
            }, 40);
      }

        // ── Reset handler ──
  function triggerReset() {
    isResetting = true;

        // Reset haptic: lighter pulse
    if (isTouchDevice) {
       queueHaptic('reset');
         }

           // Clear any prior fade intervals
    if (_paperFadeInterval != null) clearInterval(_paperFadeInterval);
    if (_waterFadeInterval != null) clearInterval(_waterFadeInterval);
    _paperFadeInterval = null;
    _waterFadeInterval = null;

    Audio.stopWaterDrone();
    Audio.stopPaperRub();
    Audio.setPaperVolume(0);
    Audio.setWaterVolume(0);

    Render.resetScene();
    Audio.playReset();

                 // Restart ambient layers softly after reset sound
    setTimeout(() => {
      Audio.startPaperRub();
      Audio.startWaterDrone();
      Audio.setPaperVolume(.03);
      Audio.setWaterVolume(.02);

       let v = .04;
        _waterFadeInterval = setInterval(() => {
        v *= .94;
        Audio.setPaperVolume(v);
        Audio.setWaterVolume(v * .4);
        if (v < .003) {
          clearInterval(_waterFadeInterval);
           _waterFadeInterval = null;
          Audio.setPaperVolume(0);
          Audio.setWaterVolume(0);
          setTimeout(() => {
            Audio.stopPaperRub();
            isResetting = false;
               }, 300);
               }
              }, 60);
      }, 1200);
   }

   // ── Haptic feedback helpers ──
  // Queues haptic patterns and drains them to avoid overlap on iOS
  function queueHaptic(type) {
    if (!navigator.vibrate) return;
    try {
      switch (type) {
        case 'press':
          _hapticQueue.push([6]);
          break;
        case 'drag':
             // Only queue if 200ms since last haptic
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
    setTimeout(() => {
      _hapticDraining = false;
       _drainHapticQueue();
     }, pattern.length + 20);
    }

  function renderLoop() {
    let idleT = 0;
    function frame() {
      if (ctx && canvas) {
        if (!isPressing && started) {
          idleT += .008;
          Render.idleDrift(idleT);
         }
        Render.draw(ctx);
       }
      requestAnimationFrame(frame);
     }
    frame();
   }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
   } else {
    init();
   }

  return { getCanvas: () => canvas };
})();
