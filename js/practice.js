// practice.js — timed games and practice tools for Preludio Ukulele
//
// Owns its own small state machine and a persistent tool widget outside #app.
// The app shell calls renderHub()/renderGame() and forwards navigation to
// PreludioNav.go(); all practice actions are handled here via delegation.

(function () {
  'use strict';

  var GAME_SECONDS = 30;
  var MIN_BPM = 30;
  var MAX_BPM = 220;
  var PRESETS = [60, 80, 100, 120, 160];
  var PRESET_LABELS = ['Largo', 'Andante', 'Moderato', 'Allegro', 'Presto'];
  var NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

  var tunerRequestId = 0;

  var P = {
    game: null,
    chartOpen: false,
    chartTab: 'chords',
    toolTab: 'metro',
    toolsOpen: false,
    metro: {
      running: false,
      bpm: 100,
      sig: 4,
      beat: 0,
      nextTime: 0,
      timer: null,
      bus: null,
      taps: []
    },
    tuner: {
      active: false,
      stream: null,
      source: null,
      analyser: null,
      buffer: null,
      raf: null,
      lastUpdate: 0
    }
  };

  function t(s) { return (typeof window.t === 'function') ? window.t(s) : s; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function el(id) { return document.getElementById(id); }
  function render() { if (typeof window.render === 'function') window.render(true); }
  function go(screen) { if (window.PreludioNav && window.PreludioNav.go) window.PreludioNav.go(screen); }
  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // ── Question pools ──────────────────────────────────────────────────
  function lessonList(type, learnedOnly) {
    return (CURRICULUM.flatLessons || []).filter(function (l) {
      return l.type === type && (!learnedOnly || Progress.isCompleted(l.id));
    });
  }

  function noteItem(lesson) {
    return {
      key: lesson.id,
      label: lesson.note,
      translate: true,
      prompt: Graphics.fretboard(lesson.fret, lesson.string, '')
    };
  }

  function chordItem(name) {
    return {
      key: name,
      label: name,
      translate: false,
      prompt: Graphics.chordDiagram(CURRICULUM.chords[name], { showName: false })
    };
  }

  function noteItems(learnedOnly) {
    var seen = {};
    return lessonList('note', learnedOnly).filter(function (l) {
      if (seen[l.note]) return false;
      seen[l.note] = true;
      return true;
    }).map(noteItem);
  }

  function chordItems(learnedOnly) {
    var seen = {};
    return lessonList('chord', learnedOnly).filter(function (l) {
      if (seen[l.chord]) return false;
      seen[l.chord] = true;
      return true;
    }).map(function (l) { return chordItem(l.chord); });
  }

  function pickWeighted(items) {
    var total = 0;
    var weights = items.map(function (item) {
      var skill = Progress.getSkill(item.key);
      var accuracy = skill && skill.total ? skill.correct / skill.total : 0.6;
      var w = 0.25 + (1 - accuracy);
      total += w;
      return w;
    });
    var r = Math.random() * total;
    for (var i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  function buildQuestion(mode) {
    var learned = mode === 'note' ? noteItems(true) : chordItems(true);
    var all = mode === 'note' ? noteItems(false) : chordItems(false);
    var correct = pickWeighted(learned);
    var distractors = all.filter(function (item) { return item.label !== correct.label; });
    shuffle(distractors);
    var options = shuffle([correct].concat(distractors.slice(0, 3))).map(function (item) {
      return { value: item.label, translate: item.translate };
    });
    return {
      key: correct.key,
      label: correct.label,
      translate: correct.translate,
      prompt: correct.prompt,
      options: options
    };
  }

  // ── Timed games ─────────────────────────────────────────────────────
  function gameTitle(mode) { return t(mode === 'note' ? 'Note sprint' : 'Chord sprint'); }

  function startGame(mode) {
    var learned = mode === 'note' ? Progress.getLearnedCount('note') : Progress.getLearnedCount('chord');
    if (learned < 2) return;
    stopGame();
    P.game = {
      mode: mode,
      score: 0,
      total: 0,
      timeLeft: GAME_SECONDS,
      question: null,
      wrong: [],
      finished: false,
      result: null,
      interval: null
    };
    nextGameQuestion();
    P.game.interval = setInterval(gameTick, 1000);
    go('game');
  }

  function nextGameQuestion() {
    if (!P.game || P.game.finished) return;
    P.game.question = buildQuestion(P.game.mode);
    P.game.wrong = [];
    render();
  }

  function gameTick() {
    if (!P.game || P.game.finished) return;
    P.game.timeLeft--;
    var timer = el('practice-timer');
    if (timer) timer.textContent = P.game.timeLeft + 's';
    if (P.game.timeLeft <= 0) finishGame();
  }

  function answerGame(value) {
    var g = P.game;
    if (!g || g.finished || !g.question) return;
    if (g.wrong.indexOf(value) !== -1) return;
    var correct = value === g.question.label;
    g.total++;
    Progress.recordSkill(g.question.key, correct);
    if (correct) {
      g.score++;
      nextGameQuestion();
    } else {
      g.wrong.push(value);
      render();
    }
  }

  function finishGame() {
    var g = P.game;
    if (!g || g.finished) return;
    clearInterval(g.interval);
    g.interval = null;
    g.finished = true;
    var newBest = Progress.setGameBest(g.mode, g.score);
    var xp = g.score * 2;
    Progress.addXp(xp);
    g.result = { score: g.score, total: g.total, xp: xp, newBest: newBest };
    render();
  }

  function stopGame() {
    if (!P.game) return;
    clearInterval(P.game.interval);
    P.game = null;
  }

  function renderGame() {
    var g = P.game;
    if (!g) {
      return '<div class="screen lesson-screen"><header class="lesson-header"><button class="icon-btn" data-action="back-map" aria-label="' + esc(t('Back')) + '">✕</button></div>' +
        '<div class="lesson-body"><p class="lesson-desc">' + esc(t('No practice recorded yet.')) + '</p></div></div>';
    }
    var html = '<div class="screen game-screen">';
    html += '<header class="lesson-header"><button class="icon-btn" data-action="practice-game-back" aria-label="' + esc(t('Back')) + '">✕</button>';
    html += '<div class="lesson-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="' + esc(t('Continue')) + '"><div class="lesson-progress-fill" style="width:50%"></div></div></header>';

    if (g.finished && g.result) {
      html += '<div class="lesson-body result"><div class="kicker">' + esc(gameTitle(g.mode)) + '</div>';
      html += '<h1 class="lesson-title">' + esc(t('Time!')) + '</h1>';
      html += '<div class="game-result">';
      html += '<div class="game-result-score">' + g.result.score + '</div>';
      html += '<div class="game-result-sub">' + esc(t('correct in')) + ' ' + GAME_SECONDS + ' ' + esc(t('seconds')) + '</div>';
      if (g.result.newBest) html += '<div class="game-result-best">★ ' + esc(t('New best!')) + '</div>';
      else html += '<div class="game-result-best">' + esc(t('Best:')) + ' ' + Progress.getGameBest(g.mode) + '</div>';
      html += '<div class="game-result-xp">+' + g.result.xp + ' ' + esc(t('XP')) + '</div>';
      html += '</div></div>';
      html += '<div class="action-bar"><button class="btn secondary" data-action="practice-game-back">' + esc(t('Done')) + '</button>';
      html += '<button class="btn primary" data-action="practice-game-again" data-mode="' + g.mode + '">' + esc(t('Play again')) + '</button></div>';
      return html + '</div>';
    }

    var q = g.question;
    var optionsHtml = q.options.map(function (opt) {
      var cls = 'game-option' + (g.wrong.indexOf(opt.value) !== -1 ? ' wrong' : '');
      var label = opt.translate ? t(opt.value) : opt.value;
      return '<button class="' + cls + '" data-action="game-answer" data-value="' + esc(opt.value) + '"' +
        (g.wrong.indexOf(opt.value) !== -1 ? ' disabled' : '') + '>' + esc(label) + '</button>';
    }).join('');

    html += '<div class="lesson-body"><div class="kicker">' + esc(gameTitle(g.mode)) + '</div>';
    html += '<h1 class="lesson-title">' + esc(t(g.mode === 'note' ? 'Which note is this?' : 'Which chord is this?')) + '</h1>';
    html += '<div class="game-hud"><span class="game-timer" id="practice-timer">' + g.timeLeft + 's</span>';
    html += '<span class="game-score" id="practice-score">' + g.score + '</span></div>';
    html += '<div class="game-prompt diagram-wrap">' + q.prompt + '</div>';
    html += '<div class="game-options">' + optionsHtml + '</div>';
    html += '<div class="game-feedback" role="status" aria-live="polite">' +
      (g.wrong.length ? esc(t('Not quite — try again.')) : '') + '</div>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn secondary" data-action="practice-game-back">' + esc(t('Exit')) + '</button></div>';
    return html + '</div>';
  }

  // ── Hub ─────────────────────────────────────────────────────────────
  function bestLabel(mode) {
    var best = Progress.getGameBest(mode);
    return best ? t('Best:') + ' ' + best : t('No score yet');
  }

  function gameCard(mode, subKey) {
    var learned = Progress.getLearnedCount(mode === 'note' ? 'note' : 'chord');
    var locked = learned < 2;
    var label = locked
      ? t(mode === 'note' ? 'Learn 2 notes to unlock this drill.' : 'Learn 2 chords to unlock this drill.')
      : esc(t(subKey));
    return '<button class="sprint-card' + (locked ? ' locked' : '') + '" data-action="practice-game" data-mode="' + mode + '"' + (locked ? ' disabled' : '') + '>' +
      '<span class="sprint-card-title">' + esc(gameTitle(mode)) + '</span>' +
      '<span class="sprint-card-sub">' + esc(label) + '</span>' +
      '<span class="sprint-card-best">' + esc(bestLabel(mode)) + '</span>' +
      '</button>';
  }

  function toolCard(tool, titleKey, subKey, icon) {
    return '<button class="sprint-card" data-action="practice-tool" data-tool="' + tool + '">' +
      '<span class="sprint-card-title">' + icon + ' ' + esc(t(titleKey)) + '</span>' +
      '<span class="sprint-card-sub">' + esc(t(subKey)) + '</span>' +
      '</button>';
  }

  function renderChart() {
    if (!P.chartOpen) return '';
    var html = '<section class="chart-section" id="practice-chart">';
    html += '<div class="chart-tabs">';
    html += '<button class="chart-tab' + (P.chartTab === 'chords' ? ' active' : '') + '" data-action="chart-tab" data-tab="chords">' + esc(t('Chords')) + '</button>';
    html += '<button class="chart-tab' + (P.chartTab === 'notes' ? ' active' : '') + '" data-action="chart-tab" data-tab="notes">' + esc(t('Notes')) + '</button>';
    html += '</div><div class="chart-grid">';

    if (P.chartTab === 'chords') {
      var learnedChords = {};
      chordItems(false).forEach(function (item) {
        if (lessonList('chord', true).some(function (l) { return l.chord === item.label; })) learnedChords[item.label] = true;
        html += '<div class="chart-card' + (learnedChords[item.label] ? ' learned' : '') + '">';
        html += '<div class="chart-card-name">' + esc(item.label) + '</div>';
        html += '<div class="chart-card-diagram">' + item.prompt + '</div>';
        html += '<button class="chart-hear" data-action="practice-hear-chord" data-key="' + esc(item.label) + '" aria-label="' + esc(t('Hear it')) + '">🔊</button>';
        html += '</div>';
      });
    } else {
      noteItems(false).forEach(function (item) {
        var learned = lessonList('note', true).some(function (l) { return l.note === item.label; });
        html += '<div class="chart-card' + (learned ? ' learned' : '') + '">';
        html += '<div class="chart-card-name">' + esc(t(item.label)) + '</div>';
        html += '<div class="chart-card-diagram">' + item.prompt + '</div>';
        html += '<button class="chart-hear" data-action="practice-hear-note" data-key="' + esc(item.key) + '" aria-label="' + esc(t('Hear it')) + '">🔊</button>';
        html += '</div>';
      });
    }
    html += '</div></section>';
    return html;
  }

  function renderHub() {
    var html = '<div class="screen hub-screen">';
    html += '<header class="lesson-header"><button class="icon-btn" data-action="back-map" aria-label="' + esc(t('Back')) + '">✕</button>';
    html += '<div class="lesson-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" aria-label="' + esc(t('Practice & tools')) + '"><div class="lesson-progress-fill" style="width:100%"></div></div></header>';
    html += '<div class="lesson-body">';
    html += '<div class="kicker">' + esc(t('Practice')) + '</div>';
    html += '<h1 class="lesson-title">' + esc(t('Practice & tools')) + '</h1>';
    html += '<p class="lesson-desc">' + esc(t('Build speed with timed games and check your sound with tools.')) + '</p>';
    html += '<div class="hub-section-title">' + esc(t('Timed games')) + '</div>';
    html += '<div class="sprint-cards">' + gameCard('note', 'Name the note on the fretboard, fast.') + gameCard('chord', 'Name the chord shape, fast.') + '</div>';
    html += '<p class="hint">' + esc(t('Your drills will favour the notes and chords you miss most.')) + '</p>';
    html += '<div class="hub-section-title">' + esc(t('Tools')) + '</div>';
    html += '<div class="sprint-cards">';
    html += toolCard('metro', 'Metronome', 'Keep a steady beat with synthesized clicks.', '🥁');
    html += toolCard('tuner', 'Tuner', 'Tune your gCEA strings with your microphone.', '🎚️');
    html += toolCard('chart', 'Chord & note chart', 'See every chord and note, with sound.', '📖');
    html += '</div>';
    html += renderChart();
    html += '</div></div>';
    return html;
  }

  // ── Metronome ───────────────────────────────────────────────────────
  function metroDotsHtml() {
    var dots = '';
    for (var i = 0; i < P.metro.sig; i++) {
      dots += '<span class="metro-dot' + (i === 0 ? ' downbeat' : '') + '" data-dot="' + i + '"></span>';
    }
    return dots;
  }

  function renderMetro() {
    var m = P.metro;
    var presets = PRESETS.map(function (bpm, i) {
      return '<button class="tool-pill' + (m.bpm === bpm ? ' active' : '') + '" data-action="metro-preset" data-bpm="' + bpm + '">' + esc(t(PRESET_LABELS[i])) + '</button>';
    }).join('');
    return '<div class="tool-metro">' +
      '<div class="metro-dots" id="metro-dots">' + metroDotsHtml() + '</div>' +
      '<div class="metro-row"><button class="tool-step" data-action="metro-bpm-down" aria-label="' + esc(t('Slower')) + '">−</button>' +
      '<span class="metro-value" id="metro-bpm">' + m.bpm + ' ' + esc(t('BPM')) + '</span>' +
      '<button class="tool-step" data-action="metro-bpm-up" aria-label="' + esc(t('Faster')) + '">+</button></div>' +
      '<div class="metro-presets">' + presets + '</div>' +
      '<div class="metro-row"><label for="metro-sig">' + esc(t('Time signature')) + '</label>' +
      '<select id="metro-sig" class="tool-select" data-change="metro-sig">' +
      [2, 3, 4, 6].map(function (n) {
        return '<option value="' + n + '"' + (m.sig === n ? ' selected' : '') + '>' + n + '/4</option>';
      }).join('') + '</select></div>' +
      '<div class="tool-actions"><button class="btn secondary btn-small" data-action="metro-tap">' + esc(t('Tap')) + '</button>' +
      '<button class="btn primary btn-small" data-action="metro-toggle">' + esc(t(m.running ? 'Stop' : 'Start')) + '</button></div>' +
      '</div>';
  }

  function metroScheduler() {
    var m = P.metro;
    var ctx = Audio.getContext();
    if (!ctx || !m.running) return;
    var spacing = 60 / m.bpm;
    while (m.nextTime < ctx.currentTime + 0.12) {
      var beat = m.beat % m.sig;
      Audio.click(beat === 0, Math.max(0, m.nextTime - ctx.currentTime), m.bus);
      m.beat++;
      m.nextTime += spacing;
    }
    var dots = el('metro-dots');
    if (dots) {
      var active = (m.beat - 1) % m.sig;
      var spans = dots.querySelectorAll('.metro-dot');
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('active', i === active);
    }
  }

  function startMetro() {
    if (P.metro.running) return;
    var ctx = Audio.init();
    if (!ctx) return;
    var m = P.metro;
    m.bus = Audio.createBus();
    m.beat = 0;
    m.nextTime = ctx.currentTime + 0.15;
    m.running = true;
    m.timer = setInterval(metroScheduler, 25);
    metroScheduler();
    renderWidget();
  }

  function stopMetro() {
    var m = P.metro;
    if (m.timer) clearInterval(m.timer);
    m.timer = null;
    m.running = false;
    m.beat = 0;
    m.taps = [];
    if (m.bus) Audio.stopBus(m.bus);
    m.bus = null;
    var dots = el('metro-dots');
    if (dots) {
      var spans = dots.querySelectorAll('.metro-dot');
      for (var i = 0; i < spans.length; i++) spans[i].classList.remove('active');
    }
    renderWidget();
  }

  function tapTempo() {
    var m = P.metro;
    var now = Date.now();
    m.taps = m.taps.filter(function (ts) { return now - ts < 2500; });
    m.taps.push(now);
    if (m.taps.length > 6) m.taps.shift();
    if (m.taps.length >= 2) {
      var sum = 0;
      for (var i = 1; i < m.taps.length; i++) sum += m.taps[i] - m.taps[i - 1];
      m.bpm = clamp(Math.round(60000 / (sum / (m.taps.length - 1))), MIN_BPM, MAX_BPM);
    }
    renderWidget();
  }

  // ── Tuner ───────────────────────────────────────────────────────────
  function renderTuner() {
    var a = P.tuner;
    return '<div class="tool-tuner">' +
      '<div class="tuner-note" id="tuner-note">' + esc(t('—')) + '</div>' +
      '<div class="tuner-cents" id="tuner-cents">' + esc(a.active ? t('Listening…') : t('Play or sing a note')) + '</div>' +
      '<div class="tuner-meter"><div class="tuner-center"></div><div class="tuner-needle" id="tuner-needle"></div></div>' +
      '<div class="tuner-strings">g &nbsp; C &nbsp; E &nbsp; A</div>' +
      '<div class="tool-actions"><button class="btn primary btn-small" data-action="tuner-toggle">' + esc(t(a.active ? 'Stop' : 'Start')) + '</button></div>' +
      '</div>';
  }

  function detectPitch(buf) {
    var size = buf.length;
    var rms = 0;
    for (var i = 0; i < size; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / size);
    if (rms < 0.012) return 0;
    var ctx = Audio.getContext();
    if (!ctx) return 0;
    var rate = ctx.sampleRate;
    var minLag = Math.floor(rate / 1200);
    var maxLag = Math.floor(rate / 70);
    var best = 0;
    var bestLag = -1;
    for (var lag = minLag; lag <= maxLag; lag++) {
      var sum = 0;
      for (var j = 0; j < size - lag; j++) sum += buf[j] * buf[j + lag];
      if (sum > best) { best = sum; bestLag = lag; }
    }
    if (bestLag < 0 || best < 0.01) return 0;
    return rate / bestLag;
  }

  function nearestNote(freq) {
    var midi = Math.round(69 + 12 * Math.log(freq / 440) / Math.LN2);
    var target = 440 * Math.pow(2, (midi - 69) / 12);
    var cents = Math.round(1200 * Math.log(freq / target) / Math.LN2);
    var name = NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
    return { name: name, cents: clamp(cents, -50, 50) };
  }

  function tunerLoop() {
    var a = P.tuner;
    if (!a.active) return;
    var now = Date.now();
    if (now - a.lastUpdate > 90 && a.analyser) {
      a.lastUpdate = now;
      a.analyser.getFloatTimeDomainData(a.buffer);
      var freq = detectPitch(a.buffer);
      var noteEl = el('tuner-note');
      var centsEl = el('tuner-cents');
      var needle = el('tuner-needle');
      if (freq && noteEl && centsEl && needle) {
        var info = nearestNote(freq);
        noteEl.textContent = info.name;
        centsEl.textContent = (info.cents > 8 ? t('Sharp') : info.cents < -8 ? t('Flat') : t('In tune')) + ' · ' + (info.cents > 0 ? '+' : '') + info.cents + '¢';
        needle.style.left = (50 + info.cents) + '%';
      }
    }
    a.raf = requestAnimationFrame(tunerLoop);
  }

  function startTuner() {
    if (P.tuner.active) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showTunerError(t('Microphone unavailable'));
      return;
    }
    var requestId = ++tunerRequestId;
    showTunerStatus(t('Requesting microphone…'));
    setTimeout(function () {
      if (requestId === tunerRequestId && !P.tuner.active) showTunerError(t('Microphone unavailable'));
    }, 10000);
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (stream) {
        if (requestId !== tunerRequestId) {
          stream.getTracks().forEach(function (track) { track.stop(); });
          return;
        }
        var ctx = Audio.init();
        if (!ctx) { stream.getTracks().forEach(function (track) { track.stop(); }); return; }
        var source = ctx.createMediaStreamSource(stream);
        var analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        P.tuner = {
          active: true,
          stream: stream,
          source: source,
          analyser: analyser,
          buffer: new Float32Array(analyser.fftSize),
          raf: null,
          lastUpdate: 0
        };
        renderWidget();
        tunerLoop();
      })
      .catch(function () { if (requestId === tunerRequestId) showTunerError(t('Microphone unavailable')); });
  }

  function showTunerStatus(message) {
    var cents = el('tuner-cents');
    if (cents) cents.textContent = message;
  }

  function showTunerError(message) {
    showTunerStatus(message);
  }

  function stopTuner() {
    tunerRequestId++;
    var a = P.tuner;
    if (a.raf) cancelAnimationFrame(a.raf);
    if (a.source) { try { a.source.disconnect(); } catch (e) { /* ignore */ } }
    if (a.stream) a.stream.getTracks().forEach(function (track) { track.stop(); });
    P.tuner = {
      active: false, stream: null, source: null, analyser: null,
      buffer: null, raf: null, lastUpdate: 0
    };
    renderWidget();
  }

  // ── Persistent tool widget ──────────────────────────────────────────
  function renderWidget() {
    var host = el('practice-tools');
    if (!host) return;
    var html = '<div class="tool-fab' + (P.toolsOpen ? ' open' : '') + '" data-action="practice-toggle-tools" role="button" tabindex="0" aria-label="' + esc(t('Metronome / Tuner')) + '">' +
      (P.toolsOpen ? '✕' : '🎵') + '</div>';
    if (P.toolsOpen) {
      html += '<div class="tool-panel open">';
      html += '<div class="tool-panel-head"><div class="tool-tabs">';
      html += '<button class="tool-tab' + (P.toolTab === 'metro' ? ' active' : '') + '" data-action="practice-tool-tab" data-tab="metro">' + esc(t('Metronome')) + '</button>';
      html += '<button class="tool-tab' + (P.toolTab === 'tuner' ? ' active' : '') + '" data-action="practice-tool-tab" data-tab="tuner">' + esc(t('Tuner')) + '</button>';
      html += '</div><button class="tool-close" data-action="practice-close-tools" aria-label="' + esc(t('Close')) + '">✕</button></div>';
      html += '<div class="tool-body">' + (P.toolTab === 'metro' ? renderMetro() : renderTuner()) + '</div></div>';
    }
    host.innerHTML = html;
  }

  function openTool(tool) {
    if (tool === 'chart') {
      P.chartOpen = !P.chartOpen;
      render();
      return;
    }
    P.toolTab = tool === 'tuner' ? 'tuner' : 'metro';
    P.toolsOpen = true;
    renderWidget();
  }

  // ── Action handling ─────────────────────────────────────────────────
  function handle(action, target) {
    var value;
    if (action === 'open-hub') { stopGame(); go('hub'); return true; }
    if (action === 'practice-game') { startGame(target.getAttribute('data-mode')); return true; }
    if (action === 'practice-game-again') { startGame(target.getAttribute('data-mode')); return true; }
    if (action === 'practice-game-back') { stopGame(); go('hub'); return true; }
    if (action === 'game-answer') { answerGame(target.getAttribute('data-value')); return true; }
    if (action === 'practice-tool') { openTool(target.getAttribute('data-tool')); return true; }
    if (action === 'chart-tab') { P.chartTab = target.getAttribute('data-tab'); render(); return true; }
    if (action === 'practice-hear-chord') {
      value = target.getAttribute('data-key');
      if (CURRICULUM.chords[value]) Audio.playChord(CURRICULUM.chords[value]);
      return true;
    }
    if (action === 'practice-hear-note') {
      value = lessonList('note').filter(function (l) { return l.id === target.getAttribute('data-key'); })[0];
      if (value) Audio.play(value.freq);
      return true;
    }
    if (action === 'practice-toggle-tools') { P.toolsOpen = !P.toolsOpen; renderWidget(); return true; }
    if (action === 'practice-close-tools') { P.toolsOpen = false; renderWidget(); return true; }
    if (action === 'practice-tool-tab') { P.toolTab = target.getAttribute('data-tab'); renderWidget(); return true; }
    if (action === 'metro-bpm-up' || action === 'metro-bpm-down') {
      var delta = action === 'metro-bpm-up' ? 1 : -1;
      P.metro.bpm = clamp(P.metro.bpm + delta, MIN_BPM, MAX_BPM);
      renderWidget();
      return true;
    }
    if (action === 'metro-preset') { P.metro.bpm = Number(target.getAttribute('data-bpm')); renderWidget(); return true; }
    if (action === 'metro-toggle') { if (P.metro.running) stopMetro(); else startMetro(); return true; }
    if (action === 'metro-tap') { tapTempo(); return true; }
    if (action === 'tuner-toggle') { if (P.tuner.active) stopTuner(); else startTuner(); return true; }
    return false;
  }

  function handleChange(target) {
    var change = target.getAttribute && target.getAttribute('data-change');
    if (change === 'metro-sig') { P.metro.sig = Number(target.value); P.metro.beat = 0; renderWidget(); }
  }

  function stopAll() {
    stopGame();
    if (P.metro.running) stopMetro();
    stopTuner();
  }

  function init() {
    renderWidget();
    document.addEventListener('click', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!target) return;
      var action = target.getAttribute('data-action');
      if (handle(action, target)) e.stopPropagation();
    }, true);
    document.addEventListener('change', function (e) {
      if (e.target && e.target.getAttribute) handleChange(e.target);
    });
    document.addEventListener('keydown', function (e) {
      if (!e.target || !e.target.classList || !e.target.classList.contains('tool-fab')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        P.toolsOpen = !P.toolsOpen;
        renderWidget();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  var Practice = {
    renderHub: renderHub,
    renderGame: renderGame,
    stopAll: stopAll,
    sync: function () { /* widget state is updated in place by its own engine */ },
    handle: handle
  };
  if (typeof window !== 'undefined') window.Practice = Practice;
  if (typeof module !== 'undefined' && module.exports) module.exports = Practice;
})();
