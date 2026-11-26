(function () {
  'use strict';

  var APP = {
    screen: 'map',
    lessonId: null,
    phase: 'present',
    quiz: null,
    wrongCount: 0,
    lastStars: 0,
    lastXp: 0,
    lastWasFirst: false
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
  function appEl() { return document.getElementById('app'); }
  function flatLessons() { return CURRICULUM.flatLessons || []; }
  function lessonById(id) {
    var list = flatLessons();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function isChord(lesson) { return !!lesson && lesson.type === 'chord'; }
  function lessonTitle(lesson) { return isChord(lesson) ? lesson.title : t(lesson.title); }

  function starsHtml(n) {
    var html = '<span class="stars" role="img" aria-label="' + n + ' / 3 stars">';
    for (var i = 0; i < 3; i++) html += '<span class="' + (i < n ? 'filled' : 'empty') + '" aria-hidden="true">★</span>';
    return html + '</span>';
  }

  function lockSvg() {
    return '<svg class="lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  }

  function render(keepScroll) {
    var app = appEl();
    if (!app) return;
    if (APP.screen === 'map') app.innerHTML = renderMap();
    else if (APP.screen === 'lesson') app.innerHTML = renderLesson();
    else if (APP.screen === 'first-sound') app.innerHTML = renderFirstSound();
    else if (APP.screen === 'settings') app.innerHTML = renderSettings();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  // ── MAP ────────────────────────────────────────────────────────────────
  function renderMap() {
    var next = Progress.getNextLesson();
    var completed = Progress.getCompletedCount();
    var total = flatLessons().length;
    var pct = total ? Math.round(completed / total * 100) : 0;
    var started = completed > 0;

    var html = '<div class="screen map-screen">';
    html += '<header class="app-header">';
    html += '<div class="brand"><div class="brand-mark">♪</div><div><div class="brand-title">Preludio Ukulele</div><div class="brand-sub">gCEA · C6 tuning</div></div></div>';
    html += '<div class="header-actions">';
    html += '<button class="icon-btn" data-action="open-first-sound" aria-label="' + esc(t('First sounds')) + '">♪</button>';
    html += '<button class="icon-btn" data-action="open-settings" aria-label="' + esc(t('Settings')) + '">⚙</button>';
    html += '</div></header>';

    html += '<div class="course-progress"><div class="course-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + t('Completed') + '"><div class="course-progress-fill" style="width:' + pct + '%"></div></div><div class="course-progress-label">' + completed + ' / ' + total + '</div></div>';

    if (next) {
      html += '<section class="continue-card">';
      html += '<div class="continue-copy">';
      html += '<div class="continue-kicker">' + t(started ? 'Continue where you left off' : 'Start here') + '</div>';
      html += '<div class="continue-title">' + esc(lessonTitle(next)) + '</div>';
      html += '<div class="continue-sub">' + esc(t(next.unitTitle)) + ' · ' + (next.index + 1) + ' / ' + total + '</div>';
      html += '</div>';
      html += '<button class="btn primary" data-action="open-lesson" data-id="' + next.id + '">' + t('Start') + '</button>';
      html += '</section>';
    } else {
      html += '<section class="continue-card done">';
      html += '<div class="continue-copy"><div class="continue-kicker">' + t('Completed') + '</div>';
      html += '<div class="continue-title">' + t('All lessons complete') + '</div>';
      html += '<div class="continue-sub">' + t('Replay any lesson to keep your skills sharp.') + '</div></div>';
      html += '</section>';
    }

    html += '<div class="stats-row">';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getLevel() + '</div><div class="stat-label">' + t('Level') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getXp() + '</div><div class="stat-label">' + t('XP') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getStreak() + '</div><div class="stat-label">' + t('Day streak') + '</div></div>';
    html += '</div>';

    if (!Progress.hasSeenFirstSound()) {
      html += '<button class="first-sound-cta" data-action="open-first-sound">';
      html += '<span class="cta-icon" aria-hidden="true">♪</span>';
      html += '<span class="cta-copy"><strong>' + t('New here? Make your first sound') + '</strong><small>' + t('A quick guide before note one.') + '</small></span>';
      html += '<span class="cta-arrow">›</span>';
      html += '</button>';
    }

    CURRICULUM.units.forEach(function (unit) {
      var done = unit.lessons.filter(function (l) { return Progress.isCompleted(l.id); }).length;
      var unitPct = Math.round(done / unit.lessons.length * 100);
      html += '<section class="unit">';
      html += '<div class="unit-head"><h2>' + esc(t(unit.title)) + '</h2><span class="unit-count">' + done + '/' + unit.lessons.length + '</span></div>';
      html += '<p class="unit-sub">' + esc(t(unit.subtitle)) + '</p>';
      html += '<div class="unit-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + unitPct + '" aria-label="' + esc(t(unit.title)) + '"><div class="unit-bar-fill" style="width:' + unitPct + '%"></div></div>';
      html += '<div class="lesson-list">';
      unit.lessons.forEach(function (lesson) {
        var unlocked = Progress.isUnlocked(lesson.id);
        var completedLesson = Progress.isCompleted(lesson.id);
        var stars = Progress.getStars(lesson.id);
        var cls = 'lesson-node' + (unlocked ? '' : ' locked') + (completedLesson ? ' completed' : '');
        html += '<button class="' + cls + '" data-action="open-lesson" data-id="' + lesson.id + '"' + (unlocked ? '' : ' disabled') + '>';
        html += '<span class="lesson-icon ' + (isChord(lesson) ? 'chord' : 'note') + '">' + esc(isChord(lesson) ? lesson.chord : t(lesson.note)) + '</span>';
        html += '<span class="node-copy"><span class="node-title">' + esc(lessonTitle(lesson)) + '</span><span class="node-desc">' + esc(t(lesson.description)) + '</span></span>';
        html += '<span class="node-status">' + (unlocked ? (completedLesson ? starsHtml(stars) : '<span class="node-go">›</span>') : lockSvg()) + '</span>';
        html += '</button>';
      });
      html += '</div></section>';
    });

    html += '<footer class="app-footer">Preludio Ukulele · v0.2 · © 2026 Eduardo de Farias Machado. All rights reserved. <a href="LICENSE">Licence</a> · <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a></footer>';
    html += '</div>';
    return html;
  }

  // ── LESSON ─────────────────────────────────────────────────────────────
  function startLesson(id) {
    var lesson = lessonById(id);
    if (!lesson || !Progress.isUnlocked(id)) return;
    APP.lessonId = id;
    APP.phase = 'present';
    APP.quiz = null;
    APP.wrongCount = 0;
    APP.lastStars = 0;
    APP.lastXp = 0;
    APP.lastWasFirst = false;
    APP.screen = 'lesson';
    render();
  }

  function goMap() {
    APP.screen = 'map';
    APP.lessonId = null;
    APP.phase = 'present';
    APP.quiz = null;
    render();
  }

  function renderLesson() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) { goMap(); return ''; }
    var body;
    if (APP.phase === 'present') body = renderPresent(lesson);
    else if (APP.phase === 'quiz') body = renderQuiz(lesson);
    else if (APP.phase === 'play') body = renderPlay(lesson);
    else body = renderComplete(lesson);
    return '<div class="screen lesson-screen">' + renderLessonHeader() + body + '</div>';
  }

  function renderLessonHeader() {
    var pct = { present: 25, quiz: 50, play: 75, complete: 100 }[APP.phase] || 25;
    return '<header class="lesson-header">' +
      '<button class="icon-btn" data-action="back-map" aria-label="' + esc(t('Back')) + '">✕</button>' +
      '<div class="lesson-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(t('Continue')) + '"><div class="lesson-progress-fill" style="width:' + pct + '%"></div></div>' +
      '</header>';
  }

  function renderPresent(lesson) {
    var diagram = isChord(lesson)
      ? Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false })
      : Graphics.fretboard(lesson.fret, lesson.string, t(lesson.note));
    return '<div class="lesson-body">' +
      '<div class="kicker">' + t(isChord(lesson) ? 'New chord' : 'New note') + '</div>' +
      '<h1 class="lesson-title">' + esc(lessonTitle(lesson)) + '</h1>' +
      '<div class="diagram-wrap">' + diagram + '</div>' +
      '<p class="lesson-desc">' + esc(t(lesson.description)) + '</p>' +
      '<div class="prompt-box"><strong>' + t('How to play it') + '</strong><span>' + esc(t(lesson.prompt)) + '</span></div>' +
      '<button class="btn secondary" data-action="hear">🔊 ' + t('Hear it') + '</button>' +
      '</div>' +
      '<div class="action-bar"><button class="btn primary wide" data-action="goto-quiz">' + t('Continue') + '</button></div>';
  }

  function buildQuiz(lesson) {
    var chordLesson = isChord(lesson);
    var correct = chordLesson ? lesson.chord : lesson.note;
    var pool;
    if (chordLesson) {
      pool = Object.keys(CURRICULUM.chords).filter(function (n) { return n !== correct; });
    } else if (lesson.quizKind === 'string') {
      pool = ['G', 'C', 'E', 'A'].filter(function (n) { return n !== correct; });
    } else {
      pool = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].filter(function (n) { return n !== correct; });
    }
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var options = [correct].concat(pool.slice(0, 3));
    for (var k = options.length - 1; k > 0; k--) {
      var m = Math.floor(Math.random() * (k + 1));
      var tmp2 = options[k]; options[k] = options[m]; options[m] = tmp2;
    }
    return { correct: correct, options: options, selected: null, wrong: [] };
  }

  function renderQuiz(lesson) {
    var q = APP.quiz || (APP.quiz = buildQuiz(lesson));
    var diagram = isChord(lesson)
      ? Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false })
      : Graphics.fretboard(lesson.fret, lesson.string, '');
    var prompt = isChord(lesson)
      ? 'Which chord is this?'
      : (lesson.quizKind === 'string' ? 'Which string is this?' : 'Which note is this?');

    var optionsHtml = q.options.map(function (opt) {
      var cls = 'quiz-option';
      if (q.wrong.indexOf(opt) !== -1) cls += ' wrong';
      if (q.selected === opt) cls += (opt === q.correct ? ' correct' : ' wrong');
      var label = isChord(lesson) ? opt : t(opt);
      return '<button class="' + cls + '" data-action="quiz-answer" data-value="' + esc(opt) + '"' + (q.wrong.indexOf(opt) !== -1 ? ' disabled' : '') + '>' + esc(label) + '</button>';
    }).join('');

    var feedback = '';
    if (q.selected === q.correct) feedback = '<div class="feedback correct" role="status" aria-live="polite">✓ ' + t('Correct!') + '</div>';
    else if (q.selected) feedback = '<div class="feedback wrong" role="status" aria-live="polite">' + t('Not quite — try again.') + '</div>';
    else feedback = '<div class="feedback" role="status" aria-live="polite"></div>';

    return '<div class="lesson-body">' +
      '<div class="kicker">' + t('Quick check') + '</div>' +
      '<h1 class="lesson-title">' + t(prompt) + '</h1>' +
      '<div class="diagram-wrap quiz-diagram">' + diagram + '</div>' +
      '<div class="quiz-options">' + optionsHtml + '</div>' +
      feedback +
      '</div>' +
      '<div class="action-bar"><button class="btn primary wide" data-action="goto-play" ' + (q.selected === q.correct ? '' : 'disabled') + '>' + t('Continue') + '</button></div>';
  }

  function answerQuiz(value) {
    var q = APP.quiz;
    if (!q || q.selected === q.correct) return;
    q.selected = value;
    if (value !== q.correct) {
      if (q.wrong.indexOf(value) === -1) q.wrong.push(value);
      APP.wrongCount++;
    }
  }

  function renderPlay(lesson) {
    var diagram = isChord(lesson)
      ? Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false })
      : Graphics.fretboard(lesson.fret, lesson.string, t(lesson.note));
    return '<div class="lesson-body">' +
      '<div class="kicker">' + t('Your turn') + '</div>' +
      '<h1 class="lesson-title">' + esc(lessonTitle(lesson)) + '</h1>' +
      '<div class="diagram-wrap">' + diagram + '</div>' +
      '<p class="lesson-desc">' + esc(t(lesson.prompt)) + '</p>' +
      '<button class="btn secondary" data-action="hear">🔊 ' + t('Hear it') + '</button>' +
      '<p class="hint">' + t('Take your time. When you are ready, mark it complete.') + '</p>' +
      '</div>' +
      '<div class="action-bar"><button class="btn primary wide" data-action="complete-lesson">' + t('I played it') + '</button></div>';
  }

  function completeCurrentLesson() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) return;
    var stars = Math.max(1, 3 - APP.wrongCount);
    var result = Progress.completeLesson(lesson.id, stars);
    APP.lastStars = result.bestStars;
    APP.lastXp = result.xpGain;
    APP.lastWasFirst = result.first;
    APP.phase = 'complete';
    render();
  }

  function renderComplete(lesson) {
    var stars = APP.lastStars || 0;
    var next = Progress.getNextLesson();
    var html = '<div class="complete-layout">';
    html += '<div class="complete-stars">' + starsHtml(stars) + '</div>';
    html += '<div class="complete-xp">' + (APP.lastXp > 0 ? '+' + APP.lastXp + ' XP' : t('Practice rep')) + '</div>';
    html += '<h1 class="complete-title">' + t(APP.lastWasFirst ? 'Lesson complete!' : 'Review complete!') + '</h1>';
    html += '<p class="complete-sub">' + esc(lessonTitle(lesson)) + '</p>';
    html += '<div class="complete-actions">';
    if (next) html += '<button class="btn primary wide" data-action="next-lesson">' + t('Next lesson') + '</button>';
    html += '<button class="btn secondary wide" data-action="back-map">' + t('Back to map') + '</button>';
    html += '</div></div>';
    return html;
  }

  function hearCurrent() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) return;
    if (isChord(lesson)) Audio.playChord(CURRICULUM.chords[lesson.chord]);
    else Audio.play(lesson.freq);
  }

  // ── FIRST SOUNDS ───────────────────────────────────────────────────────
  function renderFirstSound() {
    var steps = [
      { title: 'Hold the ukulele', text: 'Rest the body against your chest and let the neck point up and to the left. Keep your strumming hand relaxed.' },
      { title: 'Find the strings', text: 'The four strings are G, C, E, and A. In the horizontal fretboard diagram, they run from bottom to top as G, C, E, A.' },
      { title: 'Strum', text: "Drag your thumb or a felt pick across all four strings. Don't press any frets yet." }
    ];
    var html = '<div class="screen first-sound-screen">';
    html += '<header class="app-header"><button class="icon-btn" data-action="close-first-sound" aria-label="' + esc(t('Back')) + '">←</button><div class="header-title">' + t('First sounds') + '</div><div class="header-spacer"></div></header>';
    html += '<div class="lesson-body">';
    html += '<div class="first-sound-hero" aria-hidden="true">♪</div>';
    html += '<h1 class="lesson-title">' + t("Let's make your first sound") + '</h1>';
    html += '<p class="lesson-desc">' + t('A quick guide to holding, finding the strings, and strumming.') + '</p>';
    html += '<ol class="first-sound-steps">';
    steps.forEach(function (step, i) {
      html += '<li class="first-sound-step"><span class="step-num">' + (i + 1) + '</span><div><strong>' + t(step.title) + '</strong><p>' + esc(t(step.text)) + '</p></div></li>';
    });
    html += '</ol>';
    html += '<div class="string-buttons">';
    ['G', 'C', 'E', 'A'].forEach(function (name, i) {
      html += '<button class="string-btn" data-action="hear-open" data-string="' + i + '">' + name + '</button>';
    });
    html += '</div>';
    html += '<button class="btn secondary wide" data-action="hear-strum">🔊 ' + t('Hear a strum') + '</button>';
    html += '<div class="first-sound-tip"><strong>' + t('Tip') + '</strong> ' + esc(t('Short nails on the fretting hand make chords much easier.')) + '</div>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn primary wide" data-action="start-learning">' + t('Start learning') + '</button></div>';
    html += '</div>';
    return html;
  }

  // ── SETTINGS ───────────────────────────────────────────────────────────
  function renderSettings() {
    var lang = (typeof window.getLang === 'function') ? window.getLang() : 'en';
    function langBtn(code, label) {
      return '<button class="lang-btn' + (lang === code ? ' active' : '') + '" data-action="set-lang" data-lang="' + code + '">' + label + '</button>';
    }
    var html = '<div class="screen settings-screen">';
    html += '<header class="app-header"><button class="icon-btn" data-action="close-settings" aria-label="' + esc(t('Back')) + '">←</button><div class="header-title">' + t('Settings') + '</div><div class="header-spacer"></div></header>';
    html += '<div class="lesson-body settings-body">';
    html += '<div class="settings-section"><h2>' + t('Language') + '</h2><div class="lang-buttons">';
    html += langBtn('en', 'English');
    html += langBtn('pt', 'Português (BR)');
    html += langBtn('fr', 'Français (CA)');
    html += '</div></div>';
    html += '<div class="settings-section"><h2>' + t('Practice') + '</h2>';
    html += '<button class="btn secondary wide" data-action="open-first-sound">♪ ' + t('Replay first sounds') + '</button>';
    html += '<button class="btn danger wide" data-action="reset-progress">' + t('Reset all progress') + '</button>';
    html += '<p class="settings-note">' + t('Progress is saved on this device.') + '</p>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  // ── EVENTS ─────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var target = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
    if (!target) return;
    var action = target.getAttribute('data-action');

    if (action === 'open-lesson') startLesson(target.getAttribute('data-id'));
    else if (action === 'back-map') goMap();
    else if (action === 'goto-quiz') { APP.phase = 'quiz'; APP.quiz = null; APP.wrongCount = 0; render(); }
    else if (action === 'quiz-answer') { answerQuiz(target.getAttribute('data-value')); render(true); }
    else if (action === 'goto-play') { APP.phase = 'play'; render(); }
    else if (action === 'complete-lesson') completeCurrentLesson();
    else if (action === 'next-lesson') { var next = Progress.getNextLesson(); if (next) startLesson(next.id); else goMap(); }
    else if (action === 'hear') hearCurrent();
    else if (action === 'open-first-sound') { APP.screen = 'first-sound'; render(); }
    else if (action === 'close-first-sound') goMap();
    else if (action === 'start-learning') { Progress.markFirstSoundSeen(); goMap(); }
    else if (action === 'hear-open') Audio.play(CURRICULUM.tuningFreqs[Number(target.getAttribute('data-string'))]);
    else if (action === 'hear-strum') Audio.strum(CURRICULUM.tuningFreqs, { down: true });
    else if (action === 'open-settings') { APP.screen = 'settings'; render(); }
    else if (action === 'close-settings') goMap();
    else if (action === 'set-lang') { if (typeof window.setLang === 'function') window.setLang(target.getAttribute('data-lang')); render(); }
    else if (action === 'reset-progress') { if (window.confirm(t('Reset all progress?'))) { Progress.reset(); goMap(); } }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  window.render = render;
})();
