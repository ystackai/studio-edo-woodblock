const App = (() => {
  let canvas = null;
  let ctx = null;
  let started = false;
  let isPressing = false;
  let dragSpeed = 0;
  let lastDragTime = 0;

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
      const t = e.touches[0];
      onPointerDown(t.clientX, t.clientY);
     }, { passive: false });
    window.addEventListener('touchmove', e => {
      if (!isPressing) return;
      e.preventDefault();
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY);
     }, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
   }

  function onPointerDown(x, y) {
    isPressing = true;
    dragSpeed = 0;

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
   }

  function onPointerMove(x, y) {
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTime);
    lastDragTime = now;

    Render.onMove(x, y);

    dragSpeed = Math.min(1, dragSpeed * .85);
    Audio.setPaperVolume(.08 + dragSpeed * .25);
    Audio.setWaterVolume(dragSpeed * .2);
   }

  function onPointerUp() {
    isPressing = false;
    Render.onUp();
    Audio.settle();

    let v = .2;
    const fade = setInterval(() => {
      v *= .88;
      Audio.setPaperVolume(v);
      Audio.setWaterVolume(v * .4);
      if (v < .005) {
        clearInterval(fade);
        Audio.setPaperVolume(0);
        Audio.setWaterVolume(0);
        setTimeout(() => Audio.stopPaperRub(), 200);
       }
     }, 40);
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
