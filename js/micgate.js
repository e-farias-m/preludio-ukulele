// micgate.js — microphone pitch gate for note-lesson play phases
//
// Listens for the lesson's target pitch. A note counts after four sustained
// frames within ±80 cents. A missing or denied microphone, or ten seconds
// without any pitch, offers a "Continue anyway" fallback so nobody is stuck.

(function () {
  'use strict';

  var GATE_CENTS = 80;
  var GATE_FRAMES_NEEDED = 4;
  var TIMEOUT_MS = 10000;

  var S = {
    token: 0,
    state: 'idle',
    frames: 0,
    startedAt: 0,
    stream: null,
    ctx: null,
    analyser: null,
    buffer: null,
    raf: null,
    tick: 0,
    freq: 0,
    history: [],
    target: 0,
    onChange: null
  };

  function supported() {
    return !!(typeof navigator !== 'undefined' && navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : true));
  }

  function centsOff(freq, target) {
    if (!freq || !target) return Infinity;
    return 1200 * Math.log(freq / target) / Math.LN2;
  }

  function isInTune(freq, target, tolerance) {
    var cents = centsOff(freq, target);
    return Math.abs(cents) <= (tolerance == null ? GATE_CENTS : tolerance);
  }

  // Normalized autocorrelation. Returns -1 when the signal is too weak or
  // too noisy to trust, otherwise the detected fundamental in Hz.
  function detectPitch(buffer, sampleRate) {
    var size = buffer.length;
    if (!size || !sampleRate) return -1;
    var rms = 0;
    for (var i = 0; i < size; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / size);
    if (rms < 0.01) return -1;

    var minLag = Math.floor(sampleRate / 1200);
    var maxLag = Math.floor(sampleRate / 70);
    if (maxLag >= size) maxLag = size - 2;
    var scores = [];
    for (var lag = minLag; lag <= maxLag; lag++) {
      var corr = 0;
      var energy = 0;
      for (var j = 0; j < size - lag; j++) {
        corr += buffer[j] * buffer[j + lag];
        energy += buffer[j] * buffer[j];
      }
      scores.push(corr / (energy + 1e-9));
    }
    var best = -1;
    for (var k = 0; k < scores.length; k++) if (scores[k] > best) best = scores[k];
    if (best < 0.2) return -1;
    // Autocorrelation also peaks at multiples of the true period. The first
    // strong peak is the fundamental, so prefer the smallest qualifying lag.
    for (var n = 0; n < scores.length; n++) {
      if (scores[n] >= best * 0.995) {
        var freq = sampleRate / (minLag + n);
        if (freq >= 70 && freq <= 1200) return freq;
      }
    }
    return -1;
  }

  function setStatus(key, kind) {
    if (typeof document === 'undefined') return;
    var node = document.getElementById('play-status');
    if (!node) return;
    node.textContent = (typeof window.t === 'function') ? window.t(key) : key;
    node.className = 'play-status' + (kind ? ' ' + kind : '');
  }

  // Prewarm the permission prompt inside the user gesture (needed on iOS).
  function prewarm() {
    var token = ++S.token;
    if (!supported()) return { token: token, promise: Promise.resolve(null), supported: false };
    if (window.Audio && window.Audio.prepareForCapture) window.Audio.prepareForCapture();
    var settled = false;
    var timer = null;
    var requestPromise = navigator.mediaDevices.getUserMedia({ audio: true })
      .catch(function () { return null; })
      .then(function (stream) {
        if (settled) {
          if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
          return null;
        }
        settled = true;
        if (timer) clearTimeout(timer);
        return stream;
      });
    var timeoutPromise = new Promise(function (resolve) {
      timer = setTimeout(function () { if (!settled) { settled = true; resolve(null); } }, 8000);
    });
    return {
      token: token,
      promise: Promise.race([requestPromise, timeoutPromise]),
      supported: true
    };
  }

  function teardown(keepState) {
    S.token++;
    if (S.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(S.raf);
    S.raf = null;
    if (S.stream) {
      S.stream.getTracks().forEach(function (track) { track.stop(); });
      S.stream = null;
    }
    if (S.ctx && S.ctx.close) {
      try { S.ctx.close().catch(function () {}); } catch (e) { /* ignore */ }
      S.ctx = null;
    }
    S.analyser = null;
    S.buffer = null;
    if (!keepState) {
      S.state = 'idle';
      S.frames = 0;
      S.target = 0;
      S.onChange = null;
    }
    if (window.Audio && window.Audio.restorePlayback) window.Audio.restorePlayback();
  }

  function start(lesson, request, opts) {
    opts = opts || {};
    if (request && request.token !== S.token) return;
    teardown(false);
    // teardown bumps the generation counter; keep the prewarmed request tied
    // to the new generation so its late permission result is still accepted.
    if (request) request.token = S.token;
    S.target = lesson && lesson.freq ? lesson.freq : 0;
    S.onChange = opts.onChange || null;
    S.state = 'listening';
    S.frames = 0;
    S.tick = 0;
    S.startedAt = Date.now();

    if (!supported() || !S.target) {
      S.state = 'not-supported';
      setStatus('Microphone not available — you can continue below.', 'warn');
      if (S.onChange) S.onChange();
      return;
    }
    request = request || prewarm();
    var token = request.token;
    if (window.Audio && window.Audio.prepareForCapture) window.Audio.prepareForCapture();
    request.promise.then(function (stream) {
      if (token !== S.token || S.state !== 'listening') {
        if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
        return;
      }
      if (!stream) {
        S.state = 'unavailable';
        setStatus('Microphone unavailable — you can continue below.', 'warn');
        if (window.Audio && window.Audio.restorePlayback) window.Audio.restorePlayback();
        if (S.onChange) S.onChange();
        return;
      }
      var Ctx = window.AudioContext || window.webkitAudioContext;
      S.stream = stream;
      S.ctx = new Ctx();
      if (S.ctx.state === 'suspended' && S.ctx.resume) S.ctx.resume().catch(function () {});
      var source = S.ctx.createMediaStreamSource(stream);
      var analyser = S.ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      S.analyser = analyser;
      S.buffer = new Float32Array(analyser.fftSize);
      loop();
    });
  }

  function loop() {
    if (S.state !== 'listening') return;
    S.tick++;
    if (S.tick % 2 === 0 && S.analyser && S.buffer) {
      S.analyser.getFloatTimeDomainData(S.buffer);
      var freq = detectPitch(S.buffer, S.ctx.sampleRate);
      S.freq = freq;
      S.history.push(Math.round(freq));
      if (S.history.length > 12) S.history.shift();
      if (freq > 0 && S.target) {
        if (isInTune(freq, S.target)) {
          S.frames++;
          if (S.frames >= GATE_FRAMES_NEEDED) {
            S.state = 'heard';
            setStatus('Heard it! ✓', 'ok');
            if (S.onChange) S.onChange();
            teardown(true);
            return;
          }
          setStatus('Playing…');
        } else {
          S.frames = 0;
          setStatus('Listening…');
        }
      } else if (Date.now() - S.startedAt > TIMEOUT_MS) {
        S.state = 'missed';
        setStatus('I didn’t hear that note — try again, or continue below.', 'warn');
        if (S.onChange) S.onChange();
        teardown(true);
        return;
      } else {
        setStatus('Listening…');
      }
    }
    S.raf = requestAnimationFrame(loop);
  }

  function stop() { teardown(false); }
  function stopKeepState() { teardown(true); }

  function state() {
    return {
      state: S.state,
      frames: S.frames,
      freq: S.freq,
      history: S.history.slice(),
      target: S.target,
      elapsed: S.state === 'listening' ? Date.now() - S.startedAt : 0
    };
  }

  var MicGate = {
    start: start,
    prewarm: prewarm,
    stop: stop,
    stopKeepState: stopKeepState,
    supported: supported,
    state: state,
    detectPitch: detectPitch,
    centsOff: centsOff,
    isInTune: isInTune,
    setStatus: setStatus,
    GATE_CENTS: GATE_CENTS,
    GATE_FRAMES_NEEDED: GATE_FRAMES_NEEDED,
    TIMEOUT_MS: TIMEOUT_MS
  };
  if (typeof window !== 'undefined') window.MicGate = MicGate;
  if (typeof module !== 'undefined' && module.exports) module.exports = MicGate;
})();
