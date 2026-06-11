/* haptics.js — bridge between main thread and haptics worker.
 * Spawns the worker, relays vibrate patterns to navigator.vibrate.
 */

(function () {
  'use strict';

  let worker = null;
  let cancelled = false;

  function navVibrate(pattern) {
    if (cancelled) return;
    cancelled = false;
    try { navigator.vibrate(pattern); } catch (_) { /* no support */ }
  }

  function init() {
    try {
      worker = new Worker('haptics.worker.js');
      worker.onmessage = function (e) {
        switch (e.data.type) {
          case 'vibrate': navVibrate(e.data.pattern); break;
          case 'cancel':  navigator.vibrate(0); break;
        }
      };
    } catch (_) {
      // Worker not supported — fall back to empty
    }
  }

  window.Haptics = {
    init: init,
    impact:  function () { if (worker) worker.postMessage({ type: 'impact' });  },
    hold:    function () { if (worker) worker.postMessage({ type: 'hold' });    },
    release: function () { if (worker) worker.postMessage({ type: 'release' }); },
    cancel:  function () {
      cancelled = true;
      navigator.vibrate(0);
      if (worker) worker.postMessage({ type: 'cancel' });
    },
  };

})();
