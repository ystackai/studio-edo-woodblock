/* Haptics Worker — separate thread for timing/scheduling.
 * Posts haptic timing events to main thread which then calls navigator.vibrate.
 */

let holdInterval = null;

function scheduleImpact() {
   postMessage({ type: 'vibrate', pattern: [50, 30, 80] });
}

function scheduleHold() {
   postMessage({ type: 'vibrate', pattern: 100 });
   holdInterval = setInterval(() => {
     postMessage({ type: 'vibrate', pattern: 100 });
   }, 120);
}

function scheduleRelease() {
   if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
   postMessage({ type: 'vibrate', pattern: [40, 20, 30, 15, 20] });
}

function cancel() {
   if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
   postMessage({ type: 'cancel' });
}

self.onmessage = function (e) {
  switch (e.data.type) {
    case 'impact':  scheduleImpact();  break;
    case 'hold':    scheduleHold();    break;
    case 'release': scheduleRelease();  break;
    case 'cancel':  cancel();          break;
  }
};
