(function () {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const hint = document.createElement("div");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let breath = 0;
  const touches = [];

  hint.className = "repair-hint";
  hint.textContent = "move, drag, or tap to disturb the winter breath";
  document.body.appendChild(hint);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addTouch(x, y) {
    touches.push({ x, y, life: 1 });
    while (touches.length > 18) touches.shift();
  }

  function draw() {
    breath += 0.012;
    ctx.fillStyle = "#101724";
    ctx.fillRect(0, 0, w, h);

    for (let y = -20; y < h + 20; y += 16) {
      const offset = Math.sin(y * 0.025 + breath) * 18;
      ctx.strokeStyle = "rgba(220, 235, 245, 0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = -20; x < w + 20; x += 16) {
        let lift = Math.sin(x * 0.015 + breath + y * 0.01) * 6;
        for (const touch of touches) {
          const dx = x - touch.x;
          const dy = y - touch.y;
          const dist = Math.hypot(dx, dy);
          lift += Math.max(0, 1 - dist / 180) * 40 * touch.life;
        }
        const px = x + offset;
        const py = y + lift;
        if (x === -20) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    for (const touch of touches) touch.life *= 0.965;
    while (touches[0] && touches[0].life < 0.03) touches.shift();
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    addTouch(event.clientX, event.clientY);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons) addTouch(event.clientX, event.clientY);
  });

  resize();
  requestAnimationFrame(draw);
})();
