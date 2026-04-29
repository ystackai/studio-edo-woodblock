(function () {
	"use strict";

	// ─── Constants ──────────────────────────────────────────────
	var STALL_THRESHOLD = 0.42;
	var VISCOSITY = 0.85;
	var STONE_RADIUS = 28;
	var MIST_FADE_MS = 1.2;

	// ─── State Machine ──────────────────────────────────────────
	var S_IDLE = "idle";
	var S_DRAGGING = "dragging";
	var S_STALLED = "stalled";
	var S_SETTLING = "settling";
	var S_SUNK = "sunk";
	var S_RESETTING = "resetting";

	var state = S_IDLE;

	// ─── Canvas & Contexts ──────────────────────────────────────
	var siltCanvas = document.getElementById("silt-canvas");
	var siltCtx = siltCanvas.getContext("2d");
	var glCanvas = document.getElementById("gl-canvas");
	var stoneCanvas = document.getElementById("stone-canvas");
	var stoneCtx = stoneCanvas.getContext("2d");
	var mistEl = document.getElementById("mist");

	var W = 0, H = 0, DPR = 1;

	// ─── Stone ──────────────────────────────────────────────────
	var stoneX = 0, stoneY = 0;
	var stoneBaseX = 0, stoneBaseY = 0;
	var stoneScale = 1;
	var stoneOpacity = 1;

	// ─── Drag ───────────────────────────────────────────────────
	var dragStartY = 0, dragStartX = 0;
	var dragStartStoneY = 0, dragStartStoneX = 0;
	var maxDrag = 0;
	var dragDist = 0;

	// ─── Ripple (WebGL) ────────────────────────────────────────
	var gl = null;
	var rippleProg = null;
	var rippleUni = {};
	var rippleBuf = null;
	var rippleActive = false;
	var rippleTime = 0;
	var rippleOX = 0, rippleOY = 0;
	var rippleAlpha = 0;

	// Shader sources
	var SHADER_V = [
		"attribute vec2 a_pos;",
		"void main(){ gl_Position=vec4(a_pos,0.0,1.0); }"
	].join("\n");

	var SHADER_F = [
		"precision highp float;",
		"uniform vec2 u_res;",
		"uniform vec2 u_origin;",
		"uniform float u_time;",
		"uniform float u_alpha;",
		"void main(){",
		"  vec2 px=gl_FragCoord.xy;",
		"  float d=distance(px,u_origin);",
		"  float spd=100.0;",
		"  float rad=u_time*spd;",
		"  float w=14.0+u_time*20.0;",
		"  float dr=abs(d-rad);",
		"  float r=smoothstep(w*0.5,0.0,dr);",
		"  r*=smoothstep(0.0,3.0,dr);",
		"  float rad2=rad*0.55;",
		"  float w2=w*0.55;",
		"  float d2=abs(d-rad2);",
		"  float r2=smoothstep(w2*0.5,0.0,d2);",
		"  r2*=smoothstep(0.0,2.5,d2);",
		"  float rad3=rad*0.25;",
		"  float w3=w*0.32;",
		"  float d3=abs(d-rad3);",
		"  float r3=smoothstep(w3*0.5,0.0,d3);",
		"  r3*=smoothstep(0.0,2.0,d3);",
		"  float I=r*0.5+r2*0.3+r3*0.2;",
		"  float sp=exp(-d*0.002);",
		"  float v=I*sp;",
		"  float ang=atan(px.y-u_origin.y,px.x-u_origin.x);",
		"  float vr=0.9+0.1*sin(ang*4.0+u_time*2.0);",
		"  vec3 c=mix(vec3(0.35,0.30,0.38),vec3(0.42,0.36,0.44),I)*vr;",
		"  float a=v*u_alpha;",
		"  if(d<rad*0.15){float f=d/(rad*0.15);a*=f*0.3;}",
		"  gl_FragColor=vec4(c,a);",
		"}"
	].join("\n");

	// ─── Silt Particles ────────────────────────────────────────
	var siltParts = [];
	var siltSeed = 73;
	function siltRand() {
		siltSeed = (siltSeed * 16807) % 2147483647;
		return (siltSeed - 1) / 2147483646;
	}

	function initSilt() {
		siltParts = [];
		for (var i = 0; i < 180; i++) {
			siltParts.push({
				x: siltRand() * W,
				y: H * 0.55 + siltRand() * H * 0.45,
				r: 0.4 + siltRand() * 1.8,
				a: 0.03 + siltRand() * 0.1,
				sh: 0.8 + siltRand() * 0.4,
				drift: siltRand() * 0.3 - 0.15,
				phase: siltRand() * Math.PI * 2
			});
		}
	}

	// ─── Stone Texture Points (pre-generated) ────────────────
	var stoneTex = [];
	(function () {
		var s = 42;
		function sr() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
		for (var i = 0; i < 18; i++) {
			stoneTex.push({
				a: sr() * Math.PI * 2,
				q: 0.25 + sr() * 0.7,
				r: 0.8 + sr() * 1.5
			});
		}
	})();

	// ─── Resize ─────────────────────────────────────────────────
	function resize() {
		W = window.innerWidth;
		H = window.innerHeight;
		DPR = Math.min(window.devicePixelRatio || 1, 2);

		siltCanvas.width = W * DPR;
		siltCanvas.height = H * DPR;
		siltCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

		glCanvas.width = W * DPR;
		glCanvas.height = H * DPR;

		stoneCanvas.width = W * DPR;
		stoneCanvas.height = H * DPR;
		stoneCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

		stoneBaseX = W / 2;
		stoneBaseY = H * 0.2;
		if (state === S_IDLE) {
			stoneX = stoneBaseX;
			stoneY = stoneBaseY;
		}
		maxDrag = H * 0.55;

		initSilt();
		drawBgStatic();
	}

	// ─── Background (static, drawn to silt canvas once) ──────
	function drawBgStatic() {
		var g = siltCtx.createLinearGradient(0, 0, 0, H);
		g.addColorStop(0, "#2a2535");
		g.addColorStop(0.2, "#222030");
		g.addColorStop(0.5, "#18182a");
		g.addColorStop(0.8, "#10101e");
		g.addColorStop(1, "#0a0a16");
		siltCtx.fillStyle = g;
		siltCtx.fillRect(0, 0, W, H);

		// Subtle water striations
		for (var i = 0; i < 40; i++) {
			var y = (i / 40) * H + Math.sin(i * 0.6) * 6;
			siltCtx.fillStyle = "rgba(100,110,140," + (0.01 + siltRand() * 0.015) + ")";
			siltCtx.fillRect(0, y, W, 0.8 + siltRand() * 1.5);
		}
	}

	function drawSilt(time) {
		for (var i = 0; i < siltParts.length; i++) {
			var p = siltParts[i];
			var driftX = Math.sin(time * 0.15 + p.phase) * p.drift * 8;
			var warmth = p.sh;
			var r = Math.round(56 * warmth + 10);
			var gn = Math.round(42 * warmth + 6);
			var b = Math.round(28 * warmth);
			siltCtx.beginPath();
			siltCtx.arc(p.x + driftX, p.y, p.r, 0, Math.PI * 2);
			siltCtx.fillStyle = "rgba(" + r + "," + gn + "," + b + "," + p.a + ")";
			siltCtx.fill();
		}

		// Deeper ochre gradient at bottom when stone sinks
		if (state === S_STALLED || state === S_SETTLING || state === S_SUNK) {
			var sinkProg = getSinkProgress();
			var ochre = Math.min(1, sinkProg * 2);
			var siltG = siltCtx.createLinearGradient(0, H * 0.75, 0, H);
			var baseA = 0.25 * ochre;
			siltG.addColorStop(0, "rgba(60,40,20,0)");
			siltG.addColorStop(1, "rgba(" + Math.round(50 + ochre * 24) + "," + Math.round(30 + ochre * 16) + "," + Math.round(14 + ochre * 8) + "," + baseA + ")");
			siltCtx.fillStyle = siltG;
			siltCtx.fillRect(0, H * 0.75, W, H * 0.25);
		}
	}

	// ─── Stone Drawing ──────────────────────────────────────────
	function drawStone() {
		stoneCtx.clearRect(0, 0, W, H);

		if (stoneOpacity <= 0.01) return;

		var r = STONE_RADIUS * stoneScale;

		// Shadow
		stoneCtx.beginPath();
		stoneCtx.arc(stoneX + 2, stoneY + 3, r * 1.1, 0, Math.PI * 2);
		var sg = stoneCtx.createRadialGradient(stoneX, stoneY, r * 0.4, stoneX, stoneY, r * 1.2);
		sg.addColorStop(0, "rgba(5,8,16," + (0.35 * stoneOpacity) + ")");
		sg.addColorStop(1, "rgba(5,8,16,0)");
		stoneCtx.fillStyle = sg;
		stoneCtx.fill();

		// Organic body
		stoneCtx.beginPath();
		var pts = 14;
		for (var i = 0; i <= pts; i++) {
			var ang = (i / pts) * Math.PI * 2;
			var vr = 1 + Math.sin(ang * 3 + 1.2) * 0.08 + Math.cos(ang * 5 + 0.7) * 0.05;
			var px = stoneX + Math.cos(ang) * r * vr;
			var py = stoneY + Math.sin(ang) * r * vr * 0.88;
			if (i === 0) stoneCtx.moveTo(px, py);
			else stoneCtx.lineTo(px, py);
		}
		stoneCtx.closePath();

		var stg = stoneCtx.createRadialGradient(
			stoneX - r * 0.25, stoneY - r * 0.2, r * 0.08,
			stoneX, stoneY, r * 1.05
		);
		stg.addColorStop(0, "rgba(88,78,68," + stoneOpacity + ")");
		stg.addColorStop(0.4, "rgba(58,52,46," + stoneOpacity + ")");
		stg.addColorStop(0.7, "rgba(36,32,28," + stoneOpacity + ")");
		stg.addColorStop(1, "rgba(22,19,16," + stoneOpacity + ")");
		stoneCtx.fillStyle = stg;
		stoneCtx.fill();

		// Texture dots
		for (var t = 0; t < stoneTex.length; t++) {
			var st = stoneTex[t];
			var tx = stoneX + Math.cos(st.a) * r * st.q;
			var ty = stoneY + Math.sin(st.a) * r * st.q * 0.88;
			stoneCtx.beginPath();
			stoneCtx.arc(tx, ty, st.r, 0, Math.PI * 2);
			stoneCtx.fillStyle = "rgba(" + (24 + t * 2) + "," + (19 + t) + "," + (17 + t) + "," + (0.12 * stoneOpacity) + ")";
			stoneCtx.fill();
		}

		// Wet highlight (catches light as stone yields)
		if (state === S_STALLED || state === S_SETTLING) {
			var sinkP = getSinkProgress();
			var hlAlpha = 0.06 * stoneOpacity * (0.5 + sinkP * 0.5);
			stoneCtx.beginPath();
			stoneCtx.ellipse(stoneX - r * 0.18, stoneY - r * 0.22, r * 0.32, r * 0.18, -0.35, 0, Math.PI * 2);
			stoneCtx.fillStyle = "rgba(200,190,175," + hlAlpha + ")";
			stoneCtx.fill();
		} else {
			stoneCtx.beginPath();
			stoneCtx.ellipse(stoneX - r * 0.18, stoneY - r * 0.22, r * 0.32, r * 0.18, -0.35, 0, Math.PI * 2);
			stoneCtx.fillStyle = "rgba(200,190,175," + (0.07 * stoneOpacity) + ")";
			stoneCtx.fill();
		}
	}

	// ─── Sink progress (0 = just stalled, 1 = fully submerged) ─
	function getSinkProgress() {
		if (state === S_STALLED) {
			var el = (performance.now() - stallT0) / 180;
			return Math.min(1, Math.max(0, el));
		}
		if (state === S_SETTLING) {
			var el2 = (performance.now() - settleT0) / VIS_MS;
			return Math.min(1, easePlow(el2));
		}
		if (state === S_SUNK) return 1;
		return 0;
	}

	// Non-linear "plow through wet clay" easing.
	// Heavy initial resistance, slow middle push, terminal drag.
	// No bounce, no overshoot. The curve breathes like wet clay.
	function easePlow(t) {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
			// Three-phase: hesitation (0-0.15), yield (0.15-0.7), drag (0.7-1)
			// pow with 0.48 gives pronounced initial hesitation
		var base = Math.pow(t, 0.48);
		// Terminal drag: exponential hold at the end
		var drag = 1 - Math.exp(-8 * (1 - t));
		return base * drag;
	}

	// ─── Stalling timing ───────────────────────────────────────
	var stallT0 = 0;
	var settleT0 = 0;
	var VIS_MS = 2800; // Viscous sink duration

	// ─── Audio ──────────────────────────────────────────────────
	var audioCtx = null;
	var activeGains = [];

	function ensureAudio() {
		if (!audioCtx) {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		}
		if (audioCtx.state === "suspended") audioCtx.resume();
	}

	function playStall() {
		if (!audioCtx) return;
		var t = audioCtx.currentTime;

		// Low thud — the stone meets resistance
		var o = audioCtx.createOscillator();
		var g = audioCtx.createGain();
		o.type = "sine";
		o.frequency.setValueAtTime(58, t);
		o.frequency.exponentialRampToValueAtTime(38, t + 0.15);
		g.gain.setValueAtTime(0.5, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
		o.connect(g).connect(audioCtx.destination);
		o.start(t); o.stop(t + 0.4);
		activeGains.push(g);

		// Sub-groan — the clay resists
		var o2 = audioCtx.createOscillator();
		var f2 = audioCtx.createBiquadFilter();
		var g2 = audioCtx.createGain();
		o2.type = "sawtooth";
		o2.frequency.setValueAtTime(44, t);
		o2.frequency.linearRampToValueAtTime(26, t + 0.4);
		f2.type = "lowpass";
		f2.frequency.setValueAtTime(85, t);
		f2.frequency.linearRampToValueAtTime(35, t + VIS_MS / 1000);
		g2.gain.setValueAtTime(0.001, t);
		g2.gain.linearRampToValueAtTime(0.28, t + 0.04);
		g2.gain.setValueAtTime(0.28, t + 0.1);
		g2.gain.exponentialRampToValueAtTime(0.001, t + VIS_MS / 1000 + 0.1);
		o2.connect(f2); f2.connect(g2); g2.connect(audioCtx.destination);
		o2.start(t); o2.stop(t + VIS_MS / 1000 + 0.2);
		activeGains.push(g2);

		// Silt exhale — wet noise
		var sz = audioCtx.sampleRate * 3;
		var buf = audioCtx.createBuffer(1, sz, audioCtx.sampleRate);
		var d = buf.getChannelData(0);
		for (var i = 0; i < sz; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
		var ns = audioCtx.createBufferSource();
		ns.buffer = buf;
		var ef = audioCtx.createBiquadFilter();
		ef.type = "lowpass";
		ef.frequency.setValueAtTime(280, t + 0.12);
		ef.frequency.exponentialRampToValueAtTime(35, t + VIS_MS / 1000);
		var ef2 = audioCtx.createBiquadFilter();
		ef2.type = "lowpass";
		ef2.frequency.setValueAtTime(160, t + 0.12);
		ef2.frequency.exponentialRampToValueAtTime(28, t + VIS_MS / 1000);
		var ng = audioCtx.createGain();
		ng.gain.setValueAtTime(0.001, t);
		ng.gain.linearRampToValueAtTime(0.15, t + 0.1);
		ng.gain.exponentialRampToValueAtTime(0.001, t + VIS_MS / 1000);
		ns.connect(ef); ef.connect(ef2); ef2.connect(ng); ng.connect(audioCtx.destination);
		ns.start(t + 0.08); ns.stop(t + VIS_MS / 1000 + 0.1);
		activeGains.push(ng);

		// Haptic
		try { if (navigator.vibrate) navigator.vibrate(12); } catch (_) {}
	}

	function playSettle() {
		if (!audioCtx) return;
		var t = audioCtx.currentTime;

		// Final heavy thud — earth closes
		var o = audioCtx.createOscillator();
		var g = audioCtx.createGain();
		o.type = "sine";
		o.frequency.setValueAtTime(45, t);
		o.frequency.exponentialRampToValueAtTime(22, t + 0.2);
		g.gain.setValueAtTime(0.45, t);
		g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
		o.connect(g).connect(audioCtx.destination);
		o.start(t); o.stop(t + 0.55);
		activeGains.push(g);

		// Sustained low hum after settle
		var o2 = audioCtx.createOscillator();
		var g2 = audioCtx.createGain();
		o2.type = "sine";
		o2.frequency.setValueAtTime(72, t);
		o2.frequency.linearRampToValueAtTime(58, t + 2.5);
		g2.gain.setValueAtTime(0, t);
		g2.gain.linearRampToValueAtTime(0.1, t + 0.08);
		g2.gain.setValueAtTime(0.1, t + 2.2);
		g2.gain.linearRampToValueAtTime(0.001, t + 2.5);
		o2.connect(g2).connect(audioCtx.destination);
		o2.start(t); o2.stop(t + 2.55);
		// Sub layer
		var o3 = audioCtx.createOscillator();
		var g3 = audioCtx.createGain();
		o3.type = "sine";
		o3.frequency.setValueAtTime(36, t);
		g3.gain.setValueAtTime(0, t);
		g3.gain.linearRampToValueAtTime(0.05, t + 0.15);
		g3.gain.setValueAtTime(0.05, t + 2);
		g3.gain.linearRampToValueAtTime(0.001, t + 2.5);
		o3.connect(g3).connect(audioCtx.destination);
		o3.start(t); o3.stop(t + 2.55);
		activeGains.push(g3);
	}

	function silence() {
		for (var i = 0; i < activeGains.length; i++) {
			try { activeGains[i].gain.setValueAtTime(0, audioCtx.currentTime); } catch (_) {}
				}
		activeGains = [];
	}

	function playReset() {
		if (!audioCtx) return;
		var t = audioCtx.currentTime;
			// Soft upward tone — stone rising
		var o = audioCtx.createOscillator();
		var g = audioCtx.createGain();
		o.type = "sine";
		o.frequency.setValueAtTime(110, t);
		o.frequency.linearRampToValueAtTime(140, t + 0.5);
		g.gain.setValueAtTime(0.001, t);
		g.gain.linearRampToValueAtTime(0.12, t + 0.05);
		g.gain.linearRampToValueAtTime(0.001, t + 0.6);
		o.connect(g).connect(audioCtx.destination);
		o.start(t); o.stop(t + 0.65);
		activeGains.push(g);
	}

	// ─── WebGL Init ────────────────────────────────────────────
	function initGL() {
		gl = glCanvas.getContext("webgl", {
			alpha: true, premultipliedAlpha: false, antialias: true,
			depth: false, stencil: false
		});
		if (!gl) return;

		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, SHADER_V);
		gl.compileShader(vs);
		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return;

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, SHADER_F);
		gl.compileShader(fs);
		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return;

		rippleProg = gl.createProgram();
		gl.attachShader(rippleProg, vs);
		gl.attachShader(rippleProg, fs);
		gl.linkProgram(rippleProg);
		if (!gl.getProgramParameter(rippleProg, gl.LINK_STATUS)) return;

		gl.useProgram(rippleProg);
		var v = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
		rippleBuf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rippleBuf);
		gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
		var loc = gl.getAttribLocation(rippleProg, "a_pos");
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

		rippleUni.res = gl.getUniformLocation(rippleProg, "u_res");
		rippleUni.origin = gl.getUniformLocation(rippleProg, "u_origin");
		rippleUni.time = gl.getUniformLocation(rippleProg, "u_time");
		rippleUni.alpha = gl.getUniformLocation(rippleProg, "u_alpha");

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	function drawRipple(time, alpha) {
		if (!gl || !rippleActive) return;
		gl.viewport(0, 0, glCanvas.width, glCanvas.height);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(rippleProg);
		gl.uniform2f(rippleUni.res, glCanvas.width, glCanvas.height);
		gl.uniform2f(rippleUni.origin, rippleOX * DPR, rippleOY * DPR);
		gl.uniform1f(rippleUni.time, time);
		gl.uniform1f(rippleUni.alpha, alpha);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	// ─── Input ──────────────────────────────────────────────────
	function pY(e) {
		if (e.touches && e.touches.length) return e.touches[0].clientY;
		if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientY;
		return e.clientY;
	}
	function pX(e) {
		if (e.touches && e.touches.length) return e.touches[0].clientX;
		if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientX;
		return e.clientX;
	}

	function onDown(e) {
		if (state !== S_IDLE) return;
		e.preventDefault();
		ensureAudio();
		startDragAudio();
		dragStartY = pY(e);
		dragStartX = pX(e);
		dragStartStoneY = stoneY;
		dragStartStoneX = stoneX;
		state = S_DRAGGING;
		var hint = document.getElementById("hint");
		if (hint) hint.style.opacity = "0";
	}

	function onMove(e) {
		if (state !== S_DRAGGING) return;
		e.preventDefault();
		var py = pY(e);
		var px = pX(e);

		var dy = py - dragStartY;
		if (dy < 0) dy = 0;
		dragDist = dy;

			// Stone follows with viscous drag — the deeper, the slower it tracks
		var ratio = dragDist / maxDrag;
		var lag = 1 - ratio * 0.5; // lag increases as you push deeper
		stoneX = dragStartStoneX + (px - dragStartX) * 0.25 * lag;
		stoneY = dragStartStoneY + dragDist * lag;

			// Feed drag audio
		updateDragAudio(Math.min(1, ratio));

			// Stall threshold
		if (ratio >= STALL_THRESHOLD) {
			triggerStall();
			}
	}

	function onUp(e) {
		if (state === S_DRAGGING) {
			stopDragAudio();
			var ratio = dragDist / maxDrag;
			if (ratio < STALL_THRESHOLD) {
				resetAll();
				}
			} else if (state === S_SUNK) {
			beginReset();
			}
	}

	var hintEl;
	function triggerStall() {
		stopDragAudio();
		state = S_STALLED;
		rippleActive = true;
		rippleTime = 0;
		rippleOX = stoneX;
		rippleOY = stoneY;
		stallT0 = performance.now();
		silence();
		playStall();

		// After short stall, begin viscous settle
		setTimeout(function () {
			if (state === S_STALLED) {
				state = S_SETTLING;
				settleT0 = performance.now();
				playSettle();
			}
		}, 180);
	}

	function resetAll() {
		state = S_RESETTING;
		rippleActive = false;
		rippleAlpha = 0;
		resetStart = null;
		silence();
		ensureAudio();
		playReset();
		if (mistEl) {
			mistEl.style.transition = "opacity 0.4s ease-out";
			mistEl.style.opacity = "0";
		}
	}

	function beginReset() {
		state = S_RESETTING;
		rippleActive = false;
		rippleAlpha = 0;
		resetStart = null;
		silence();
		ensureAudio();
		playReset();
		if (mistEl) {
			mistEl.style.transition = "opacity 0.4s ease-out";
			mistEl.style.opacity = "0";
		}
	}

	// Event listeners
	stoneCanvas.addEventListener("touchstart", onDown, { passive: false });
	stoneCanvas.addEventListener("touchmove", onMove, { passive: false });
	stoneCanvas.addEventListener("touchend", onUp);
	stoneCanvas.addEventListener("touchcancel", onUp);
	stoneCanvas.addEventListener("mousedown", onDown);
	window.addEventListener("mousemove", onMove);
	window.addEventListener("mouseup", onUp);

	// Resize
	var rTimer = null;
	window.addEventListener("resize", function () {
		if (rTimer) clearTimeout(rTimer);
		rTimer = setTimeout(function () { resize(); }, 80);
	});

	// ─── Main Loop ─────────────────────────────────────────────
	var lastFrame = 0;

	function loop(now) {
		requestAnimationFrame(loop);
		var dt = (now - lastFrame) / 1000;
		if (dt > 0.1) dt = 0.016;
		lastFrame = now;

		var sinkP = 0;

		if (state === S_SETTLING) {
			var elapsed = (now - settleT0) / VIS_MS;
			sinkP = easePlow(Math.min(1, elapsed));

			// Stone sinks: move down, shrink, fade
			var targetY = H - STONE_RADIUS + 12;
			stoneY = (dragStartStoneY || stoneBaseY) + (targetY - (dragStartStoneY || stoneBaseY)) * sinkP;
			stoneScale = 1 - sinkP * 0.55;
			stoneOpacity = 1 - sinkP * 0.85;

			// Ripple time follows sink
			rippleTime = elapsed * 2.5;
			rippleAlpha = Math.max(0, 1 - elapsed * 1.3);

			if (elapsed >= 1) {
				state = S_SUNK;
				stoneOpacity = 0;
				rippleAlpha = 0;
				rippleActive = false;

				// Mist fade — slow exhale, 1.2s ease-in
				if (mistEl) mistEl.style.opacity = "0.75";
				if (mistEl) mistEl.style.transition = "opacity " + MIST_FADE_MS + "s ease-in";

				// Show caption
				var cap = document.getElementById("caption");
				if (cap) cap.classList.add("show");
			}
		}

		if (state === S_STALLED) {
			var stallProg = Math.min(1, (now - stallT0) / 180);
			rippleTime = stallProg * 0.5;
			rippleAlpha = stallProg * 0.6;
		}

		if (state === S_RESETTING) {
			var rStart = (resetStart || now);
			if (!resetStart) resetStart = now;
			var rT = Math.min(1, (now - resetStart) / 600);
			var rE = rT * rT; // ease-out-ish but quick

			var bottomY = H - STONE_RADIUS + 12;
			stoneY = bottomY + (stoneBaseY - bottomY) * rE;
			stoneX = stoneBaseX;
			stoneOpacity = rT < 0.3 ? 1 - rT * 2 : 1;
			stoneScale = rT < 0.3 ? 1 - (1 - rT * 3.33) * 0.55 : 1;

			if (mistEl) mistEl.style.transition = "opacity 0.4s ease-out";
			if (mistEl) mistEl.style.opacity = String(Math.max(0, 0.75 * (1 - rT)));

			if (rT >= 1) {
				resetStart = null;
				stoneY = stoneBaseY;
				stoneX = stoneBaseX;
				stoneOpacity = 1;
				stoneScale = 1;
				state = S_IDLE;
				var hint = document.getElementById("hint");
				if (hint) hint.style.opacity = "1";
				var cap = document.getElementById("caption");
				if (cap) cap.classList.remove("show");
				}
		}

		// Silt pulse during settling — earth holds breath
		if (state === S_SETTLING) {
			var sink = getSinkProgress();
			var pulse = 0.02 * Math.sin(sink * Math.PI * 3) * (1 - sink);
			siltPulse = pulse;
		}

		// Draw layers
		if (siltPulse) {
			siltCtx.save();
			siltCtx.globalAlpha = 1 + siltPulse;
		}
		drawSilt(now / 1000);
		if (siltPulse) siltCtx.restore();

		drawRipple(rippleTime, rippleAlpha);
		drawStone();
	}

	var siltPulse = 0;
	var resetStart = null;

	// ─── Drag Audio — continuous wet drag while thumb pushes ─────
	var dragOsc = null;
	var dragGain = null;
	var dragNoise = null;
	var dragNoiseGain = null;
	var dragNoiseFilter = null;
	var dragActive = false;

	function startDragAudio() {
		if (!audioCtx || dragActive) return;
		dragActive = true;
		var t = audioCtx.currentTime;

		// Low continuous drone — weight of the stone
		dragOsc = audioCtx.createOscillator();
		dragGain = audioCtx.createGain();
		dragOsc.type = "triangle";
		dragOsc.frequency.setValueAtTime(62, t);
		dragGain.gain.setValueAtTime(0.001, t);
		dragGain.gain.linearRampToValueAtTime(0.12, t + 0.06);
		dragOsc.connect(dragGain);
		dragGain.connect(audioCtx.destination);
		dragOsc.start(t);

		// Wet silt noise — the squelch
		var sz = audioCtx.sampleRate * 4;
		var buf = audioCtx.createBuffer(1, sz, audioCtx.sampleRate);
		var d = buf.getChannelData(0);
		for (var i = 0; i < sz; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
		dragNoise = audioCtx.createBufferSource();
		dragNoise.buffer = buf;
		dragNoise.loop = true;
		dragNoiseFilter = audioCtx.createBiquadFilter();
		dragNoiseFilter.type = "lowpass";
		dragNoiseFilter.frequency.setValueAtTime(200, t);
		dragNoiseGain = audioCtx.createGain();
		dragNoiseGain.gain.setValueAtTime(0.001, t);
		dragNoiseGain.gain.linearRampToValueAtTime(0.08, t + 0.08);
		dragNoise.connect(dragNoiseFilter);
		dragNoiseFilter.connect(dragNoiseGain);
		dragNoiseGain.connect(audioCtx.destination);
		dragNoise.start(t);
	}

	function updateDragAudio(ratio) {
		if (!audioCtx || !dragActive) return;
		var t = audioCtx.currentTime;
		// Pitch rises with drag — resistance builds
		var freq = 62 + ratio * 28;
		dragOsc.frequency.linearRampToValueAtTime(freq, t + 0.033);
		// Filter opens with drag distance — more mud exposed
		var filtFreq = 200 + ratio * 250;
		dragNoiseFilter.frequency.linearRampToValueAtTime(filtFreq, t + 0.033);
		// Gain tracks resistance
		var gain = 0.08 + ratio * 0.12;
		dragGain.gain.linearRampToValueAtTime(gain, t + 0.033);
		var nGain = 0.06 + ratio * 0.1;
		dragNoiseGain.gain.linearRampToValueAtTime(nGain, t + 0.033);
	}

	function stopDragAudio() {
		if (!audioCtx || !dragActive) return;
		dragActive = false;
		var t = audioCtx.currentTime;
		// Quick fade — mud closes
		if (dragGain) {
			dragGain.gain.linearRampToValueAtTime(0.001, t + 0.04);
		}
		if (dragNoiseGain) {
			dragNoiseGain.gain.linearRampToValueAtTime(0.001, t + 0.06);
		}
		if (dragOsc) {
			dragOsc.stop(t + 0.06);
			dragOsc = null;
		}
		if (dragNoise) {
			dragNoise.stop(t + 0.08);
			dragNoise = null;
		}
		dragGain = null;
		dragNoiseGain = null;
		dragNoiseFilter = null;
	}

	// ─── Boot ───────────────────────────────────────────────────
	function init() {
		hintEl = document.getElementById("hint");
		resize();
		initGL();
		requestAnimationFrame(loop);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
