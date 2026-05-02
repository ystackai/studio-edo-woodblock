const App = (() => {
  let canvas = null;
  let ctx = null;
  let started = false;
  let isPressing = false;
  let dragSpeed = 0;
  let lastDragTime = 0;
  let lastDragX = 0, lastDragY = 0;

      // Double-tap tracking
  let lastTapTime = 0;
  let lastTapX = 0, lastTapY = 0;

      // Reset in-progress guard
  let isResetting = false;

      // Fade-out interval handles (to avoid leaks)
  let _paperFadeInterval = null;
  let _waterFadeInterval = null;

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
    el.addEventListener('mousedown', e => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => { if (isPressing) onPointerMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', onPointerUp);

    el.addEventListener('touchstart', e => {
      e.preventDefault();
        // Only accept single-finger touches
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      onPointerDown(t.clientX, t.clientY);
          }, { passive: false });
    window.addEventListener('touchmove', e => {
      if (!isPressing) return;
        // Only track single-finger movement
      if (e.touches.length !== 1) {
        onPointerUp();
        return;
        }
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

        // Haptic feedback (where supported)
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }
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
    }

  function onPointerUp() {
    isPressing = false;
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
