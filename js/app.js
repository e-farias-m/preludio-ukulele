(function () {
  'use strict';

  var SONG_SPEED_KEY = 'preludioUkuleleSongSpeed';
  var THEME_KEY = 'preludioUkuleleTheme';
  var SPEED_MIN = 0.5;
  var SPEED_MAX = 1.0;
  var SPEED_STEP = 0.1;

  var APP = {
    screen: 'map',
    lessonId: null,
    phase: 'present',
    quiz: null,
    wrongCount: 0,
    lastStars: 0,
    lastXp: 0,
    lastWasFirst: false,
    tourSlide: 0,
    showReference: null,
    micGatePassed: false,
    gateBypassed: false,
    countTimers: [],
    countActive: false,
    countBus: null,
    songSpeed: getSavedSongSpeed(),
    song: {
      active: false,
      finished: false,
      lessonId: null,
      bus: null,
      raf: null,
      startAt: 0,
      songStart: 0,
      beatSec: 0,
      totalBeats: 0,
      beatsPerBar: 4,
      lastBeat: -1,
      noteStarts: null,
      noteDurations: null
    },
    countIn: {
      active: false,
      done: false,
      raf: null,
      bus: null,
      startAt: 0,
      beatSec: 0,
      lastBeat: -1
    }
  };

  function getSavedSongSpeed() {
    try {
      var v = parseFloat(localStorage.getItem(SONG_SPEED_KEY));
      if (v >= SPEED_MIN && v <= SPEED_MAX) return Math.round(v * 10) / 10;
    } catch (e) { /* ignore */ }
    return 0.8;
  }
  function setSavedSongSpeed(v) {
    try { localStorage.setItem(SONG_SPEED_KEY, String(v)); } catch (e) { /* ignore */ }
  }
  function clampSpeed(v) {
    return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(v * 10) / 10));
  }

  function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function logoSrc() { return getSavedTheme() === 'dark' ? 'logo-dark.svg' : 'logo.svg'; }
  function setTheme(theme) {
    var value = theme === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* ignore */ }
    document.documentElement.setAttribute('data-theme', value);
  }
  function applySavedTheme() { setTheme(getSavedTheme()); }

  var installPrompt = null;

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
  function isSong(lesson) { return !!lesson && lesson.type === 'song'; }
  function lessonTitle(lesson) {
    if (!lesson) return '';
    return isChord(lesson) ? lesson.title : t(lesson.title);
  }
  function lessonIcon(lesson) {
    if (isChord(lesson)) return lesson.chord;
    if (isSong(lesson)) return '♫';
    return t(lesson.note);
  }
  function lessonIconClass(lesson) {
    return isChord(lesson) ? 'chord' : (isSong(lesson) ? 'song' : 'note');
  }

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
    var skip = document.querySelector('.skip-link');
    if (skip) skip.textContent = t('Skip to content');
    var fixedLogo = document.getElementById('app-logo-fixed');
    if (fixedLogo) {
      fixedLogo.style.display = (APP.screen === 'map' || APP.screen === 'first-sound') ? 'none' : 'block';
      var src = logoSrc();
      if (fixedLogo.getAttribute('src') !== src) fixedLogo.setAttribute('src', src);
    }
    if (APP.screen === 'map') app.innerHTML = renderMap();
    else if (APP.screen === 'lesson') app.innerHTML = renderLesson();
    else if (APP.screen === 'first-sound') app.innerHTML = renderFirstSound();
    else if (APP.screen === 'settings') app.innerHTML = renderSettings();
    else if (APP.screen === 'hub') app.innerHTML = Practice.renderHub();
    else if (APP.screen === 'game') app.innerHTML = Practice.renderGame();
    else if (APP.screen === 'report') app.innerHTML = renderReport();
    else if (APP.screen === 'digest') app.innerHTML = renderDigest();
    else if (APP.screen === 'song-library') app.innerHTML = renderSongLibrary();
    else if (APP.screen === 'tour') app.innerHTML = renderTour();
    if (APP.showReference) app.innerHTML += renderReferenceOverlay();
    if (!keepScroll) window.scrollTo(0, 0);
  }

  // ── ADAPTIVE PLAN ────────────────────────────────────────────────────
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function weakestLesson(type) {
    var list = flatLessons().filter(function (l) {
      return l.type === type && Progress.isCompleted(l.id);
    });
    if (!list.length) return null;
    var scored = list.map(function (l) {
      var key = type === 'chord' ? l.chord : l.id;
      var skill = Progress.getSkill(key);
      var acc = skill && skill.total ? skill.correct / skill.total : 0.6;
      return { lesson: l, acc: acc, total: skill ? skill.total : 0 };
    });
    scored.sort(function (a, b) { return a.acc - b.acc || b.total - a.total; });
    return scored[0].lesson;
  }
  function planReason(lesson) {
    var key = lesson.type === 'chord' ? lesson.chord : lesson.id;
    var skill = Progress.getSkill(key);
    var acc = skill && skill.total ? skill.correct / skill.total : 0.6;
    return acc < 0.7 ? 'Shaky — needs review' : 'Keep it fresh';
  }
  function buildPlan() {
    var items = [];
    var note = weakestLesson('note');
    if (note) items.push({ id: 'review-note', kind: 'lesson', ref: note.id, reason: planReason(note), done: false });
    var chord = weakestLesson('chord');
    if (chord) items.push({ id: 'review-chord', kind: 'lesson', ref: chord.id, reason: planReason(chord), done: false });
    if (Progress.getLearnedCount('note') >= 2 || Progress.getLearnedCount('chord') >= 2) {
      var mode = Progress.getGameBest('note') <= Progress.getGameBest('chord') ? 'note' : 'chord';
      items.push({ id: 'sprint-' + mode, kind: 'game', ref: mode, reason: 'Build speed', done: false });
    }
    var song = flatLessons().filter(function (l) {
      return l.type === 'song' && !Progress.isCompleted(l.id) && Progress.isUnlocked(l.id);
    })[0];
    if (song) items.push({ id: 'song-' + song.id, kind: 'lesson', ref: song.id, reason: 'Apply your notes', done: false });
    return { date: todayKey(), items: items, bonus: false };
  }
  function getPlan() {
    var plan = Progress.getPlan();
    if (!plan || plan.date !== todayKey() || !Array.isArray(plan.items)) {
      plan = buildPlan();
      Progress.setPlan(plan);
    }
    return plan;
  }
  function savePlan(plan) { Progress.setPlan(plan); }
  function markPlanDone(matcher) {
    var plan = getPlan();
    var changed = false;
    plan.items.forEach(function (item) {
      if (!item.done && matcher(item)) { item.done = true; changed = true; }
    });
    if (!changed) return;
    if (plan.items.every(function (item) { return item.done; }) && !plan.bonus) {
      plan.bonus = true;
      Progress.addXp(20);
      showToast(t('Plan complete!'));
    }
    savePlan(plan);
  }
  function planLabel(item) {
    if (item.kind === 'game') return t(item.ref === 'note' ? 'Note sprint' : 'Chord sprint');
    var lesson = lessonById(item.ref);
    if (!lesson) return '';
    if (lesson.type === 'song') return t('Play {name}').replace('{name}', lessonTitle(lesson));
    return t('Review {name}').replace('{name}', lessonTitle(lesson));
  }
  function showToast(message) {
    var node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 2800);
  }
  function announceBadges(ids) {
    if (!ids || !ids.length) return;
    setTimeout(function () {
      showToast(t('Badge earned: {name}').replace('{name}', t(BADGE_LABELS[ids[0]])));
    }, 350);
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
    html += '<div class="brand"><img class="brand-logo" src="' + logoSrc() + '" alt="Preludio Ukulele"><div class="brand-sub">gCEA · C6 tuning</div></div>';
    html += '<div class="header-actions">';
    html += '<button class="icon-btn" data-action="open-hub" aria-label="' + esc(t('Practice & tools')) + '">🎯</button>';
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

    html += '<button class="report-open" data-action="open-report">📋 ' + t('Progress report') + '</button>';
    html += '<button class="report-open" data-action="open-song-library">♫ ' + t('Try a song') + '</button>';
    html += '<button class="tour-link" data-action="open-tour">' + t('How this app works') + '</button>';

    if (!Progress.hasSeenFirstSound()) {
      html += '<button class="first-sound-cta" data-action="open-first-sound">';
      html += '<span class="cta-icon" aria-hidden="true">♪</span>';
      html += '<span class="cta-copy"><strong>' + t('New here? Make your first sound') + '</strong><small>' + t('A quick guide before note one.') + '</small></span>';
      html += '<span class="cta-arrow">›</span>';
      html += '</button>';
    }

    if (Progress.getLearnedCount('note') >= 2 || Progress.getLearnedCount('chord') >= 2) {
      html += '<button class="practice-banner" data-action="open-hub">';
      html += '<span class="cta-icon" aria-hidden="true">🎯</span>';
      html += '<span class="cta-copy"><strong>' + t('Ready for a challenge?') + '</strong><small>' + t('Timed games and tools to keep you sharp.') + '</small></span>';
      html += '<span class="cta-arrow">›</span>';
      html += '</button>';
    }

    html += renderDigestCard();
    html += renderPlanCard();

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
        html += '<div class="' + cls + '">';
        html += '<button class="node-main" data-action="open-lesson" data-id="' + lesson.id + '"' + (unlocked ? '' : ' disabled') + '>';
        html += '<span class="lesson-icon ' + lessonIconClass(lesson) + '">' + esc(lessonIcon(lesson)) + '</span>';
        html += '<span class="node-copy"><span class="node-title">' + esc(lessonTitle(lesson)) + '</span><span class="node-desc">' + esc(t(lesson.description)) + '</span></span>';
        html += '<span class="node-status">' + (unlocked ? (completedLesson ? starsHtml(stars) : '<span class="node-go">›</span>') : lockSvg()) + '</span>';
        html += '</button>';
        if (unlocked) html += '<button class="node-reference" data-action="open-reference" data-id="' + lesson.id + '" aria-label="' + esc(t('View reference')) + '">👁</button>';
        html += '</div>';
      });
      html += '</div></section>';
    });

    html += '<footer class="app-footer">Preludio Ukulele · v0.8 · © 2026 Eduardo de Farias Machado. All rights reserved. <a href="LICENSE">Licence</a> · <a href="THIRD_PARTY_NOTICES.md">Third-party notices</a></footer>';
    html += '</div>';
    return html;
  }

  // ── SONG LIBRARY ────────────────────────────────────────────────────
  function renderSongLibrary() {
    var songs = flatLessons().filter(function (l) { return l.type === 'song'; });
    var html = '<div class="screen song-lib-screen">';
    html += '<header class="app-header"><button class="icon-btn" data-action="back-map" aria-label="' + esc(t('Back')) + '">←</button>';
    html += '<div class="header-title">' + t('Song Library') + '</div><div class="header-spacer"></div></header>';
    html += '<div class="lesson-body report-body">';
    html += '<div class="kicker">' + t('Songs') + '</div>';
    html += '<h1 class="lesson-title">' + t('Song Library') + '</h1>';
    html += '<p class="lesson-desc">' + t('Pick any song you can play. Songs unlock as you learn new chords and notes.') + '</p>';
    if (!songs.length) {
      html += '<p class="report-empty">' + t('No songs yet.') + '</p>';
    } else {
      html += '<div class="song-lib-list">';
      songs.forEach(function (song) {
        var unlocked = Progress.isUnlocked(song.id);
        var done = Progress.isCompleted(song.id);
        var cls = 'song-lib-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
        html += '<div class="' + cls + '">';
        html += '<div class="song-lib-head"><span class="song-lib-title">♫ ' + esc(lessonTitle(song)) + '</span>';
        html += done ? starsHtml(Progress.getStars(song.id)) : '';
        html += '</div>';
        html += '<div class="song-lib-level">' + esc(t(song.unitTitle)) + '</div>';
        html += '<p class="song-lib-notes">' + esc(t(song.description)) + '</p>';
        html += '<div class="song-lib-actions">';
        html += unlocked
          ? '<button class="btn secondary btn-small" data-action="open-lesson" data-id="' + song.id + '">' + t('Play') + '</button>'
          : '<span class="song-lib-lock">🔒 ' + t('Locked') + '</span>';
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ── WEEKLY DIGEST ───────────────────────────────────────────────────
  var DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var GOAL_OPTIONS = [30, 60, 120, 180];

  function dateKeyFor(date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  }
  function weekStart() {
    var d = new Date();
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function weekDays() {
    var start = weekStart();
    var activity = Progress.getActivity();
    return DAY_KEYS.map(function (label, i) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var key = dateKeyFor(d);
      return { label: label, key: key, minutes: Math.round((activity[key] || 0) / 60) };
    });
  }
  function digestData() {
    var days = weekDays();
    var total = days.reduce(function (sum, d) { return sum + d.minutes; }, 0);
    var active = days.filter(function (d) { return d.minutes > 0; }).length;
    var best = days.reduce(function (a, b) { return b.minutes > a.minutes ? b : a; }, days[0]);
    var key = dateKeyFor(weekStart());
    var dates = Progress.getBadgeDates();
    var badges = Object.keys(dates).filter(function (id) { return dates[id] >= key && BADGE_LABELS[id]; });
    var headline = active >= 5 ? 'A wonderful week of music.'
      : active >= 3 ? 'You kept the music going.'
        : active > 0 ? 'Every bit of practice counts.' : 'Start with one note today.';
    return { key: key, days: days, total: total, active: active, best: best, goal: Progress.getWeeklyGoal(), badges: badges, headline: headline };
  }
  function renderDigestCard() {
    var d = digestData();
    if (!d.total || Progress.getDigestSeen() === d.key) return '';
    var bars = d.days.map(function (day) {
      var h = Math.min(24, Math.max(3, day.minutes));
      return '<span class="digest-col"><span class="digest-bar' + (day.key === todayKey() ? ' digest-bar-today' : '') + '" style="height:' + h + 'px"></span></span>';
    }).join('');
    return '<section class="digest-card">' +
      '<div class="digest-card-head"><div><div class="digest-card-kicker">' + t('This week in music') + '</div>' +
      '<div class="digest-card-title">' + esc(t(d.headline)) + '</div></div>' +
      '<button class="digest-dismiss" data-action="dismiss-digest" aria-label="' + esc(t('Close')) + '">✕</button></div>' +
      '<div class="digest-card-min">' + d.total + ' ' + t('Minutes') + ' · ' + d.active + ' ' + t('Active days') + '</div>' +
      '<div class="digest-bars">' + bars + '</div>' +
      '<button class="btn secondary btn-small" data-action="open-digest">' + t('Weekly digest') + '</button>' +
      '</section>';
  }

  function digestText(d) {
    return [
      'Preludio Ukulele — ' + t('Weekly digest'),
      t(d.headline),
      t('Minutes') + ': ' + d.total,
      t('Active days') + ': ' + d.active,
      t('Day streak') + ': ' + Progress.getStreak(),
      t('Weekly goal') + ': ' + d.goal
    ].join('\n');
  }

  function renderDigest() {
    var d = digestData();
    var pct = Math.min(100, Math.round(d.total / d.goal * 100));
    var goalText = d.total >= d.goal
      ? t('✓ Goal met — {total} of {goal} min!').replace('{total}', d.total).replace('{goal}', d.goal)
      : t('{remaining} min to reach your {goal}-minute goal').replace('{remaining}', d.goal - d.total).replace('{goal}', d.goal);
    var bars = d.days.map(function (day) {
      var h = Math.min(60, Math.max(4, Math.round(day.minutes / 3)));
      return '<div class="digest-col' + (day.key === todayKey() ? ' digest-col-today' : '') + '">' +
        '<span class="digest-bar' + (day.key === todayKey() ? ' digest-bar-today' : '') + '" style="height:' + h + 'px"></span>' +
        '<span class="digest-col-label">' + t(day.label) + '</span>' +
        '<span class="digest-col-min">' + day.minutes + '</span></div>';
    }).join('');
    var goalChips = GOAL_OPTIONS.map(function (min) {
      return '<button class="digest-goal-chip' + (min === d.goal ? ' active' : '') + '" data-action="digest-goal" data-min="' + min + '">' + min + '</button>';
    }).join('');
    var badgeHtml = d.badges.length
      ? d.badges.map(function (id) { return '<span class="digest-badge">' + BADGE_INFO[id] + ' ' + esc(t(BADGE_LABELS[id])) + '</span>'; }).join('')
      : '<span class="report-empty">' + t('No new badges this week') + '</span>';

    var html = '<div class="screen digest-screen">';
    html += '<header class="app-header"><button class="icon-btn" data-action="close-digest" aria-label="' + esc(t('Back')) + '">←</button>';
    html += '<div class="header-title">' + t('Weekly digest') + '</div><div class="header-spacer"></div></header>';
    html += '<div class="lesson-body report-body">';
    html += '<div class="kicker">' + t('This week in music') + '</div>';
    html += '<h1 class="lesson-title">' + esc(t(d.headline)) + '</h1>';
    html += '<div class="digest-stats-row">';
    html += '<div class="stat-card"><div class="stat-value">' + d.total + '</div><div class="stat-label">' + t('Minutes') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + d.active + '</div><div class="stat-label">' + t('Active days') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getStreak() + '</div><div class="stat-label">' + t('Day streak') + '</div></div>';
    html += '</div>';
    html += '<div class="report-section-label">' + t('Daily practice (minutes)') + '</div>';
    html += '<div class="digest-bars-tall">' + bars + '</div>';
    html += '<p class="digest-best">' + t('Best day: {label} · {minutes} min').replace('{label}', t(d.best.label)).replace('{minutes}', d.best.minutes) + '</p>';
    html += '<div class="report-section-label">' + t('Weekly goal') + '</div>';
    html += '<div class="digest-goal"><div class="digest-goal-track"><div class="digest-goal-fill" style="width:' + pct + '%"></div></div>';
    html += '<div class="digest-goal-status">' + esc(goalText) + '</div>';
    html += '<div class="digest-goal-options">' + goalChips + '</div></div>';
    html += '<div class="report-section-label">' + t('New badges this week') + '</div>';
    html += '<div class="report-badges">' + badgeHtml + '</div>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn secondary" data-action="copy-digest">' + t('Copy recap') + '</button>';
    html += '<button class="btn secondary" data-action="print-digest">' + t('Print') + '</button></div>';
    return html + '</div>';
  }

  // ── TOUR / REFERENCE ────────────────────────────────────────────────
  var TOUR_SLIDES = [
    { title: 'Welcome to Preludio Ukulele', text: 'A one-minute tour to show you how everything fits together.', art: '♪' },
    { title: 'Follow your lesson path', text: 'Start at the top. Each lesson unlocks the next one, so you always know what to practise.', art: '🗺️' },
    { title: 'See it, then check it', text: 'Every note and chord has a clear picture on the fretboard, followed by a quick check.', art: 'fret' },
    { title: 'Play it yourself', text: 'Hear the model, then play it on your own ukulele. Tap “I played it” when you are ready.', art: '🎶' },
    { title: 'Practice and tools', text: 'Timed games, a metronome, a tuner, and a chord chart are one tap away.', art: '🎯' },
    { title: 'Watch yourself grow', text: 'Stars, XP, and your progress report show how far you have come.', art: '📋' }
  ];

  function renderTour() {
    var slide = TOUR_SLIDES[APP.tourSlide] || TOUR_SLIDES[0];
    var art = slide.art === 'fret' ? Graphics.fretboard(4, 1, t('E')) : '<span>' + esc(slide.art) + '</span>';
    var dots = TOUR_SLIDES.map(function (_, i) {
      return '<span class="tour-dot' + (i === APP.tourSlide ? ' active' : '') + '"></span>';
    }).join('');
    var html = '<div class="screen tour-screen">';
    html += '<header class="lesson-header"><button class="icon-btn" data-action="tour-finish" aria-label="' + esc(t('Close')) + '">✕</button>';
    html += '<div class="lesson-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round((APP.tourSlide + 1) / TOUR_SLIDES.length * 100) + '"><div class="lesson-progress-fill" style="width:' + Math.round((APP.tourSlide + 1) / TOUR_SLIDES.length * 100) + '%"></div></div></header>';
    html += '<div class="lesson-body tour-body"><div class="kicker">' + t('Quick tour') + '</div>';
    html += '<h1 class="lesson-title">' + esc(t(slide.title)) + '</h1>';
    html += '<p class="lesson-desc">' + esc(t(slide.text)) + '</p>';
    html += '<div class="tour-art">' + art + '</div>';
    html += '<div class="tour-dots">' + dots + '</div></div>';
    html += '<div class="action-bar">';
    html += '<button class="btn secondary" data-action="tour-back"' + (APP.tourSlide === 0 ? ' disabled' : '') + '>' + t('Back') + '</button>';
    if (APP.tourSlide === TOUR_SLIDES.length - 1) html += '<button class="btn primary" data-action="tour-finish">' + t('Start playing') + '</button>';
    else html += '<button class="btn primary" data-action="tour-next">' + t('Next') + '</button>';
    html += '</div><button class="tour-skip" data-action="tour-finish">' + t('Skip the tour') + '</button></div>';
    return html;
  }

  function renderReferenceOverlay() {
    var lesson = lessonById(APP.showReference);
    if (!lesson) return '';
    var diagram;
    if (isSong(lesson)) diagram = songChartHtml(lesson);
    else if (isChord(lesson)) diagram = Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false });
    else diagram = Graphics.fretboard(lesson.fret, lesson.string, t(lesson.note));
    var html = '<div class="reference-overlay" data-action="close-reference">';
    html += '<div class="reference-content" data-action="reference-dialog" role="dialog" aria-modal="true" aria-label="' + esc(t('View reference')) + '">';
    html += '<div class="reference-header"><strong>' + esc(lessonTitle(lesson)) + '</strong>';
    html += '<button class="icon-btn" data-action="close-reference" aria-label="' + esc(t('Close')) + '">✕</button></div>';
    html += '<div class="reference-diagram">' + diagram + '</div>';
    html += '<p class="reference-desc">' + esc(t(lesson.description)) + '</p>';
    html += '<p class="reference-prompt">' + esc(t(lesson.prompt)) + '</p>';
    html += '<button class="btn secondary wide" data-action="hear-reference">🔊 ' + t('Hear it') + '</button>';
    return html + '</div></div>';
  }

  function hearReference() {
    var lesson = lessonById(APP.showReference);
    if (!lesson) return;
    if (isSong(lesson)) {
      if (lesson.songKind === 'chord') Audio.playChord(CURRICULUM.chords[lesson.bars[0]]);
      else Audio.pluck(Audio.noteFreq(lesson.notes[0].string, lesson.notes[0].fret));
    } else if (isChord(lesson)) Audio.playChord(CURRICULUM.chords[lesson.chord]);
    else Audio.play(lesson.freq);
  }

  // ── PLAN / REPORT ────────────────────────────────────────────────────
  function renderPlanCard() {
    var plan = getPlan();
    if (!plan.items.length) return '';
    var done = plan.items.filter(function (item) { return item.done; }).length;
    var html = '<section class="plan-card' + (done === plan.items.length ? ' plan-card-done' : '') + '">';
    html += '<div class="plan-header"><div class="plan-title">' + t("Today's Plan") + '</div>';
    html += '<div class="plan-count">' + done + ' / ' + plan.items.length + '</div></div>';
    html += '<div class="plan-items">';
    plan.items.forEach(function (item) {
      html += '<div class="plan-item' + (item.done ? ' plan-item-done' : '') + '">';
      html += '<span class="plan-item-icon">' + (item.done ? '✓' : '•') + '</span>';
      html += '<span class="plan-item-text"><span class="plan-item-name">' + esc(planLabel(item)) + '</span>';
      html += '<span class="plan-item-reason">' + esc(t(item.reason)) + '</span></span>';
      html += item.done
        ? '<span class="plan-item-tag">' + t('Done') + '</span>'
        : '<button class="plan-item-btn" data-action="plan-start" data-id="' + esc(item.id) + '">' + t('Start') + '</button>';
      html += '</div>';
    });
    html += '</div>';
    if (done === plan.items.length) html += '<p class="plan-done-note">' + t('All done — nice work!') + '</p>';
    return html + '</section>';
  }

  var BADGE_INFO = {
    'first-sound': '♪',
    'first-lesson': '★',
    'first-chord': '♬',
    'first-song': '♫',
    'ten-lessons': '🔟',
    'all-lessons': '🏆',
    'streak-seven': '🔥',
    'quick-fingers': '⚡'
  };
  var BADGE_LABELS = {
    'first-sound': 'First sound',
    'first-lesson': 'First lesson',
    'first-chord': 'First chord',
    'first-song': 'First song',
    'ten-lessons': 'Ten lessons',
    'all-lessons': 'Course complete',
    'streak-seven': 'Seven-day streak',
    'quick-fingers': 'Quick fingers'
  };

  function weakRows(type) {
    var list = flatLessons().filter(function (l) { return l.type === type && Progress.isCompleted(l.id); });
    return list.map(function (l) {
      var key = type === 'chord' ? l.chord : l.id;
      var skill = Progress.getSkill(key);
      var acc = skill && skill.total ? Math.round(skill.correct / skill.total * 100) : 60;
      return { lesson: l, acc: acc };
    }).sort(function (a, b) { return a.acc - b.acc; }).slice(0, 3);
  }

  function renderWeakList(type) {
    var rows = weakRows(type);
    if (!rows.length) return '<p class="report-empty">' + t('No practice recorded yet.') + '</p>';
    return rows.map(function (row) {
      return '<div class="weak-row"><span class="weak-name">' + esc(lessonTitle(row.lesson)) + '</span>' +
        '<span class="weak-bar"><span class="weak-bar-fill" style="width:' + row.acc + '%"></span></span>' +
        '<span class="weak-pct">' + row.acc + '%</span></div>';
    }).join('');
  }

  function reportText() {
    var lines = [
      'Preludio Ukulele — ' + t('Progress report'),
      t('Level') + ': ' + Progress.getLevel(),
      t('XP') + ': ' + Progress.getXp(),
      t('Day streak') + ': ' + Progress.getStreak(),
      t('Lessons') + ': ' + Progress.getCompletedCount() + ' / ' + flatLessons().length,
      t('Songs') + ': ' + Progress.getLearnedCount('song') + ' / ' + flatLessons().filter(function (l) { return l.type === 'song'; }).length
    ];
    return lines.join('\n');
  }

  function renderReport() {
    var total = flatLessons().length;
    var songs = flatLessons().filter(function (l) { return l.type === 'song'; }).length;
    var html = '<div class="screen report-screen">';
    html += '<header class="app-header"><button class="icon-btn" data-action="back-map" aria-label="' + esc(t('Back')) + '">←</button>';
    html += '<div class="header-title">' + t('Progress report') + '</div><div class="header-spacer"></div></header>';
    html += '<div class="lesson-body report-body">';
    html += '<div class="report-hero"><div class="report-avatar">♪</div><div><h1 class="lesson-title">' + t('Progress report') + '</h1>';
    html += '<p class="report-date">' + t('Keep going — every note counts.') + '</p></div></div>';
    html += '<div class="stats-row">';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getCompletedCount() + '</div><div class="stat-label">' + t('Lessons') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getLearnedCount('song') + '/' + songs + '</div><div class="stat-label">' + t('Songs') + '</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + Progress.getXp() + '</div><div class="stat-label">' + t('XP') + '</div></div>';
    html += '</div>';
    html += '<div class="report-section-label">' + t('Your path') + '</div>';
    CURRICULUM.units.forEach(function (unit) {
      var done = unit.lessons.filter(function (l) { return Progress.isCompleted(l.id); }).length;
      var pct = Math.round(done / unit.lessons.length * 100);
      html += '<div class="report-card"><div class="report-card-head"><span class="report-card-name">' + esc(t(unit.title)) + '</span>';
      html += '<span class="report-card-line">' + done + '/' + unit.lessons.length + '</span></div>';
      html += '<div class="report-bar-track"><div class="report-bar-fill" style="width:' + pct + '%"></div></div></div>';
    });
    html += '<div class="report-section-label">' + t('Focus areas') + '</div>';
    html += '<div class="weak-card"><div class="weak-title">' + t('Notes') + '</div>' + renderWeakList('note') + '</div>';
    html += '<div class="weak-card"><div class="weak-title">' + t('Chords') + '</div>' + renderWeakList('chord') + '</div>';
    html += '<div class="report-section-label">' + t('Badges') + '</div>';
    html += '<div class="badges-grid">';
    Object.keys(BADGE_INFO).forEach(function (id) {
      var earned = Progress.hasBadge(id);
      html += '<div class="badge' + (earned ? ' badge-earned' : ' badge-locked') + '" title="' + esc(t(BADGE_LABELS[id])) + '">';
      html += '<span class="badge-icon">' + BADGE_INFO[id] + '</span><span class="badge-name">' + esc(t(BADGE_LABELS[id])) + '</span></div>';
    });
    html += '</div>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn secondary" data-action="copy-report">' + t('Copy summary') + '</button>';
    html += '<button class="btn secondary" data-action="print-report">' + t('Print') + '</button></div>';
    return html + '</div>';
  }

  // ── LESSON ─────────────────────────────────────────────────────────────
  function startLesson(id) {
    var lesson = lessonById(id);
    if (!lesson || !Progress.isUnlocked(id)) return;
    stopSong();
    stopCountIn();
    Practice.stopAll();
    stopPlayGate();
    APP.showReference = null;
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
    stopSong();
    stopCountIn();
    Practice.stopAll();
    stopPlayGate();
    APP.screen = 'map';
    APP.lessonId = null;
    APP.showReference = null;
    APP.phase = 'present';
    APP.quiz = null;
    render();
  }

  function renderLesson() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) { goMap(); return ''; }
    var body;
    if (APP.phase === 'present') body = isSong(lesson) ? renderSongPresent(lesson) : renderPresent(lesson);
    else if (APP.phase === 'quiz') body = renderQuiz(lesson);
    else if (APP.phase === 'play') body = isSong(lesson) ? renderSongPlay(lesson) : renderPlay(lesson);
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

  // ── SONGS ──────────────────────────────────────────────────────────────
  function songSpeedLabelText(lesson) {
    var pct = Math.round(APP.songSpeed * 100);
    var bpm = Math.round(lesson.bpm * APP.songSpeed);
    return pct + '% (' + bpm + ' BPM)';
  }

  function renderSongSpeedControl(lesson, disabled) {
    return '<div class="song-speed-control">' +
      '<button class="btn-speed" data-action="song-speed-down" aria-label="' + esc(t('Slower')) + '"' + (disabled || APP.songSpeed <= SPEED_MIN ? ' disabled' : '') + '>−</button>' +
      '<span class="song-speed-label">' + songSpeedLabelText(lesson) + '</span>' +
      '<button class="btn-speed" data-action="song-speed-up" aria-label="' + esc(t('Faster')) + '"' + (disabled || APP.songSpeed >= SPEED_MAX ? ' disabled' : '') + '>+</button>' +
      '</div>';
  }

  function countInOverlayHtml() {
    return '<div class="count-in-overlay" id="song-count-in" aria-hidden="true"><div class="count-in-beats">' +
      '<span data-ci="0">1</span><span data-ci="1">2</span><span data-ci="2">3</span><span data-ci="3">4</span>' +
      '</div></div>';
  }

  function songChartHtml(lesson) {
    if (lesson.songKind === 'melody') {
      return '<div class="song-tab-wrap">' + Graphics.tab(lesson, { title: lessonTitle(lesson), ariaLabel: t('Tablature') }) + '</div>';
    }
    return Graphics.songChart(lesson, { strumLabel: t('Strum') });
  }

  function renderSongChordGuide(lesson) {
    var unique = [];
    lesson.bars.forEach(function (name) { if (unique.indexOf(name) === -1) unique.push(name); });
    var html = '<details class="song-chord-guide"><summary>' + esc(t('Chord guide')) + '</summary>';
    html += '<div class="song-chord-grid">';
    unique.forEach(function (name) {
      html += '<div class="song-chord-card">';
      html += '<div class="song-chord-name">' + esc(name) + '</div>';
      html += Graphics.chordDiagram(CURRICULUM.chords[name], { showName: false });
      html += '<button class="btn secondary btn-small" data-action="hear-chord" data-chord="' + esc(name) + '">🔊 ' + t('Hear it') + '</button>';
      html += '</div>';
    });
    html += '</div></details>';
    return html;
  }

  function renderSongPresent(lesson) {
    var isMelody = lesson.songKind === 'melody';
    var playing = APP.song.active && APP.song.lessonId === lesson.id;
    var finished = APP.song.finished && APP.song.lessonId === lesson.id;
    var playLabel = finished
      ? '↻ ' + t(isMelody ? 'Replay the melody' : 'Replay the song')
      : '▶ ' + t(isMelody ? 'Play the melody' : 'Play the song');
    var playAction = finished ? 'song-replay' : 'song-play';

    var html = '<div class="lesson-body">';
    html += '<div class="kicker">' + t(isMelody ? 'New melody' : 'New song') + '</div>';
    html += '<h1 class="lesson-title">' + esc(lessonTitle(lesson)) + '</h1>';
    html += '<p class="lesson-desc">' + esc(t(lesson.description)) + '</p>';
    html += '<div class="song-chart-wrap">' + songChartHtml(lesson);
    if (playing) html += countInOverlayHtml();
    html += '</div>';
    html += '<div class="song-controls">';
    html += '<button class="btn secondary" data-action="' + playAction + '"' + (playing ? ' disabled' : '') + '>' + playLabel + '</button>';
    if (playing) html += '<button class="btn secondary" data-action="song-stop">' + t('Stop') + '</button>';
    html += renderSongSpeedControl(lesson, playing);
    html += '</div>';
    if (!isMelody) html += renderSongChordGuide(lesson);
    html += '<div class="prompt-box"><strong>' + t('How to play it') + '</strong><span>' + esc(t(lesson.prompt)) + '</span></div>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn primary wide" data-action="goto-quiz">' + t('Continue') + '</button></div>';
    return html;
  }

  function renderSongPlay(lesson) {
    var isMelody = lesson.songKind === 'melody';
    var playing = APP.song.active && APP.song.lessonId === lesson.id;
    var html = '<div class="lesson-body">';
    html += '<div class="kicker">' + t('Your turn') + '</div>';
    html += '<h1 class="lesson-title">' + esc(lessonTitle(lesson)) + '</h1>';
    html += '<div class="song-chart-wrap">' + songChartHtml(lesson);
    if (playing || APP.countIn.active) html += countInOverlayHtml();
    html += '</div>';
    html += '<div class="song-controls">';
    html += '<button class="btn secondary" data-action="song-count-in"' + (APP.countIn.active || playing ? ' disabled' : '') + '>▶ ' + t(APP.countIn.done ? 'Count-in again' : 'Start count-in') + '</button>';
    html += '<button class="btn secondary" data-action="song-hear"' + (playing ? ' disabled' : '') + '>🔊 ' + t(isMelody ? 'Hear the melody' : 'Hear the song') + '</button>';
    if (playing) html += '<button class="btn secondary" data-action="song-stop">' + t('Stop') + '</button>';
    html += renderSongSpeedControl(lesson, playing || APP.countIn.active);
    html += '</div>';
    html += '<p class="hint">' + t(isMelody ? 'Play each note on the C string. The tab shows the fret numbers.' : 'Strum the chord shown in each bar. Keep your hand moving.') + '</p>';
    html += '</div>';
    html += '<div class="action-bar"><button class="btn primary wide" data-action="complete-lesson">' + t('I played it') + '</button></div>';
    return html;
  }

  function buildSongQuiz(lesson) {
    if (lesson.songKind === 'melody') {
      var pick = lesson.notes[Math.floor(Math.random() * lesson.notes.length)];
      var correct = pick.note;
      var pool = [];
      lesson.notes.forEach(function (n) {
        if (n.note !== correct && pool.indexOf(n.note) === -1) pool.push(n.note);
      });
      ['C', 'D', 'E', 'F', 'G', 'A', 'B'].forEach(function (n) {
        if (n !== correct && pool.indexOf(n) === -1) pool.push(n);
      });
      shuffleArray(pool);
      return {
        correct: correct,
        options: shuffleArray([correct].concat(pool.slice(0, 3))),
        selected: null,
        wrong: [],
        diagram: Graphics.fretboard(pick.fret, pick.string, ''),
        prompt: 'Which note is this?',
        translateOptions: true
      };
    }
    var chords = [];
    lesson.bars.forEach(function (name) { if (chords.indexOf(name) === -1) chords.push(name); });
    var chord = chords[Math.floor(Math.random() * chords.length)];
    var chordPool = chords.filter(function (name) { return name !== chord; });
    Object.keys(CURRICULUM.chords).forEach(function (name) {
      if (name !== chord && chordPool.indexOf(name) === -1) chordPool.push(name);
    });
    shuffleArray(chordPool);
    return {
      correct: chord,
      options: shuffleArray([chord].concat(chordPool.slice(0, 3))),
      selected: null,
      wrong: [],
      diagram: Graphics.chordDiagram(CURRICULUM.chords[chord], { showName: false }),
      prompt: 'Which chord is this?',
      translateOptions: false
    };
  }

  function shuffleArray(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function buildQuiz(lesson) {
    if (isSong(lesson)) return buildSongQuiz(lesson);
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
    shuffleArray(pool);
    return {
      correct: correct,
      options: shuffleArray([correct].concat(pool.slice(0, 3))),
      selected: null,
      wrong: [],
      diagram: chordLesson
        ? Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false })
        : Graphics.fretboard(lesson.fret, lesson.string, ''),
      prompt: chordLesson ? 'Which chord is this?' : (lesson.quizKind === 'string' ? 'Which string is this?' : 'Which note is this?'),
      translateOptions: !chordLesson
    };
  }

  function renderQuiz(lesson) {
    var q = APP.quiz || (APP.quiz = buildQuiz(lesson));

    var optionsHtml = q.options.map(function (opt) {
      var cls = 'quiz-option';
      if (q.wrong.indexOf(opt) !== -1) cls += ' wrong';
      if (q.selected === opt) cls += (opt === q.correct ? ' correct' : ' wrong');
      var label = q.translateOptions ? t(opt) : opt;
      return '<button class="' + cls + '" data-action="quiz-answer" data-value="' + esc(opt) + '"' + (q.wrong.indexOf(opt) !== -1 ? ' disabled' : '') + '>' + esc(label) + '</button>';
    }).join('');

    var feedback = '';
    if (q.selected === q.correct) feedback = '<div class="feedback correct" role="status" aria-live="polite">✓ ' + t('Correct!') + '</div>';
    else if (q.selected) feedback = '<div class="feedback wrong" role="status" aria-live="polite">' + t('Not quite — try again.') + '</div>';
    else feedback = '<div class="feedback" role="status" aria-live="polite"></div>';

    return '<div class="lesson-body">' +
      '<div class="kicker">' + t('Quick check') + '</div>' +
      '<h1 class="lesson-title">' + t(q.prompt) + '</h1>' +
      '<div class="diagram-wrap quiz-diagram">' + q.diagram + '</div>' +
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

  function playStatusMessage() {
    var state = MicGate.state().state;
    if (state === 'heard') return 'Heard it! ✓';
    if (state === 'playing') return 'Playing…';
    if (state === 'missed') return 'I didn’t hear that note — try again, or continue below.';
    if (state === 'unavailable') return 'Microphone unavailable — you can continue below.';
    if (state === 'not-supported') return 'Microphone not available — you can continue below.';
    if (state === 'listening') return 'Play it now — I’m listening…';
    return 'Tap Start, then play along on the count.';
  }

  function renderPlay(lesson) {
    if (!isChord(lesson)) return renderNotePlay(lesson);
    var diagram = Graphics.chordDiagram(CURRICULUM.chords[lesson.chord], { showName: false });
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

  function renderNotePlay(lesson) {
    var gate = MicGate.state();
    var canConfirm = APP.micGatePassed || APP.gateBypassed;
    var fallback = gate.state === 'missed' || gate.state === 'unavailable' || gate.state === 'not-supported';
    var statusClass = gate.state === 'heard' ? ' ok' : (fallback ? ' warn' : '');
    var diagram = Graphics.fretboard(lesson.fret, lesson.string, t(lesson.note));

    var html = '<div class="lesson-body">';
    html += '<div class="kicker">' + t('Your turn') + '</div>';
    html += '<h1 class="lesson-title">' + esc(lessonTitle(lesson)) + '</h1>';
    html += '<div class="diagram-wrap">' + diagram + '</div>';
    html += '<p class="lesson-desc">' + esc(t(lesson.prompt)) + '</p>';
    html += '<div class="play-status' + statusClass + '" id="play-status" role="status" aria-live="polite">' + esc(t(playStatusMessage())) + '</div>';
    html += '<div class="play-controls">';
    html += '<button class="btn secondary" data-action="hear">🔊 ' + t('Hear it') + '</button>';
    if (!canConfirm) {
      html += '<button class="btn secondary" data-action="play-start"' + (APP.countActive ? ' disabled' : '') + '>▶ ' +
        esc(t(gate.state === 'idle' ? 'Start count-in' : 'Try again')) + '</button>';
    }
    html += '</div>';
    html += '<p class="hint">' + t('Play the note after the count. We’ll listen for it.') + '</p>';
    html += '</div>';
    html += '<div class="action-bar gate-bar">';
    html += '<button class="btn primary wide" data-action="play-confirm"' + (canConfirm ? '' : ' disabled') + '>' + t('I played it!') + '</button>';
    if (fallback && !canConfirm) {
      html += '<button class="btn secondary wide" data-action="play-confirm-anyway">' + t('Continue anyway') + '</button>';
    }
    return html + '</div>';
  }

  function completeCurrentLesson() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) return;
    if (!isChord(lesson) && !isSong(lesson) && !APP.micGatePassed && !APP.gateBypassed) return;
    stopSong();
    stopCountIn();
    stopPlayGate();
    var stars = Math.max(1, 3 - APP.wrongCount);
    var result = Progress.completeLesson(lesson.id, stars);
    APP.lastStars = result.bestStars;
    APP.lastXp = result.xpGain;
    APP.lastWasFirst = result.first;
    markPlanDone(function (item) { return item.kind === 'lesson' && item.ref === lesson.id; });
    announceBadges(Progress.evaluateBadges());
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

  // ── NOTE-LESSON MIC GATE ────────────────────────────────────────────
  function setPlayStatus(message, kind) {
    var node = document.getElementById('play-status');
    if (!node) return;
    node.textContent = t(message);
    node.className = 'play-status' + (kind ? ' ' + kind : '');
  }

  function stopPlayCountdown() {
    APP.countTimers.forEach(function (id) { clearTimeout(id); });
    APP.countTimers = [];
    APP.countActive = false;
    if (APP.countBus) { Audio.stopBus(APP.countBus); APP.countBus = null; }
  }

  function stopPlayGate() {
    stopPlayCountdown();
    MicGate.stop();
    APP.micGatePassed = false;
    APP.gateBypassed = false;
  }

  function startPlayCountdown(lesson, request) {
    stopPlayCountdown();
    APP.micGatePassed = false;
    APP.gateBypassed = false;
    var ctx = Audio.init();
    if (!ctx) return;
    APP.countActive = true;
    APP.countBus = Audio.createBus();
    var beat = 750;
    var labels = ['Get ready…', '1…', '2…', '3…', '4…'];
    labels.forEach(function (label, i) {
      APP.countTimers.push(setTimeout(function () {
        setPlayStatus(label);
        if (i > 0) Audio.click(false, 0, APP.countBus);
      }, i * beat));
    });
    APP.countTimers.push(setTimeout(function () {
      setPlayStatus('Go!');
      Audio.click(true, 0, APP.countBus);
    }, 4 * beat));
    APP.countTimers.push(setTimeout(function () {
      APP.countActive = false;
      Audio.stopBus(APP.countBus);
      APP.countBus = null;
      setPlayStatus('Play it now — I’m listening…');
      MicGate.start(lesson, request, { onChange: function () {
        if (MicGate.state().state === 'heard') APP.micGatePassed = true;
        render(true);
      } });
    }, 4 * beat + 450));
    render(true);
  }

  function hearCurrent() {
    var lesson = lessonById(APP.lessonId);
    if (!lesson) return;
    if (isSong(lesson)) { playSong(lesson); return; }
    if (isChord(lesson)) Audio.playChord(CURRICULUM.chords[lesson.chord]);
    else Audio.play(lesson.freq);
  }

  // ── SONG PLAYBACK ──────────────────────────────────────────────────────
  function playSong(lesson) {
    if (!lesson || !isSong(lesson) || APP.song.active) return;
    var ctx = Audio.init();
    if (!ctx) return;
    stopSong();
    stopCountIn();

    // Put the chart into its playing state before scheduling audio, so the
    // count-in starts with the overlay already on screen.
    APP.song = {
      active: true,
      finished: false,
      lessonId: lesson.id,
      bus: null,
      raf: null,
      startAt: 0,
      songStart: 0,
      beatSec: 0,
      totalBeats: 0,
      beatsPerBar: lesson.timeSig.num,
      lastBeat: -1,
      noteStarts: null,
      noteDurations: null
    };
    render(true);

    var beatSec = 60 / (lesson.bpm * APP.songSpeed);
    var countInBeats = 4;
    var startAt = ctx.currentTime + 0.18;
    var songStart = startAt + countInBeats * beatSec;
    var bus = Audio.createBus();
    var totalBeats = 0;
    var noteStarts = null;
    var noteDurations = null;

    if (lesson.songKind === 'chord') {
      var beatsPerBar = lesson.timeSig.num;
      totalBeats = lesson.bars.length * beatsPerBar;
      lesson.bars.forEach(function (name, bar) {
        var chord = CURRICULUM.chords[name];
        if (!chord) return;
        var freqs = Audio.chordFreqs(chord);
        lesson.strum.forEach(function (dir, beatInBar) {
          if (dir === '-') return;
          var beat = bar * beatsPerBar + beatInBar;
          var when = (songStart - ctx.currentTime) + beat * beatSec;
          Audio.strum(freqs, {
            down: dir !== 'U',
            gain: dir === 'U' ? 0.22 : 0.34,
            when: when,
            dest: bus
          });
        });
      });
    } else {
      noteStarts = [];
      noteDurations = [];
      var cum = 0;
      lesson.notes.forEach(function (n) {
        noteStarts.push(cum);
        noteDurations.push(n.beats);
        var when = (songStart - ctx.currentTime) + cum * beatSec;
        Audio.pluck(Audio.noteFreq(n.string, n.fret), when, 0.4, bus);
        cum += n.beats;
      });
      totalBeats = cum;
    }

    for (var i = 0; i < countInBeats; i++) {
      Audio.click(i === 0, (startAt - ctx.currentTime) + i * beatSec, bus);
    }

    APP.song.bus = bus;
    APP.song.startAt = startAt;
    APP.song.songStart = songStart;
    APP.song.beatSec = beatSec;
    APP.song.totalBeats = totalBeats;
    APP.song.noteStarts = noteStarts;
    APP.song.noteDurations = noteDurations;
    APP.song.raf = requestAnimationFrame(songTick);
  }

  function songTick() {
    var s = APP.song;
    if (!s.active) return;
    var ctx = Audio.getContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    if (now < s.songStart) {
      var countBeat = Math.floor((now - s.startAt) / s.beatSec);
      updateCountInBeat(Math.max(0, Math.min(3, countBeat)));
    } else {
      var overlay = document.getElementById('song-count-in');
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      var elapsed = now - s.songStart;
      var beat = Math.floor(elapsed / s.beatSec);
      if (beat !== s.lastBeat) {
        s.lastBeat = beat;
        highlightSongBeat(beat);
      }
      if (elapsed >= s.totalBeats * s.beatSec) {
        finishSong();
        return;
      }
    }
    s.raf = requestAnimationFrame(songTick);
  }

  function highlightSongBeat(beat) {
    var lesson = lessonById(APP.song.lessonId);
    if (!lesson) return;
    if (lesson.songKind === 'chord') {
      var bar = Math.floor(beat / APP.song.beatsPerBar);
      var beatInBar = beat % APP.song.beatsPerBar;
      var bars = document.querySelectorAll('.song-bar');
      for (var i = 0; i < bars.length; i++) {
        var isActive = Number(bars[i].getAttribute('data-bar')) === bar;
        bars[i].classList.toggle('active', isActive);
        var dots = bars[i].querySelectorAll('.song-beat');
        for (var j = 0; j < dots.length; j++) {
          dots[j].classList.toggle('active', isActive && j === beatInBar);
        }
      }
    } else {
      var idx = -1;
      var starts = APP.song.noteStarts || [];
      var durs = APP.song.noteDurations || [];
      for (var k = 0; k < starts.length; k++) {
        if (beat >= starts[k] && beat < starts[k] + durs[k]) { idx = k; break; }
      }
      var groups = document.querySelectorAll('.tab-note');
      for (var m = 0; m < groups.length; m++) {
        groups[m].classList.toggle('active', Number(groups[m].getAttribute('data-note-index')) === idx);
      }
    }
  }

  function finishSong() {
    var s = APP.song;
    s.active = false;
    s.finished = true;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = null;
    if (s.bus) Audio.stopBus(s.bus);
    s.bus = null;
    var overlay = document.getElementById('song-count-in');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    render(true);
  }

  function stopSong() {
    var s = APP.song;
    if (!s) return;
    s.active = false;
    s.finished = false;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = null;
    if (s.bus) Audio.stopBus(s.bus);
    s.bus = null;
    s.lastBeat = -1;
    s.noteStarts = null;
    s.noteDurations = null;
    var overlay = document.getElementById('song-count-in');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function startCountIn(lesson) {
    if (!lesson || !isSong(lesson) || APP.countIn.active) return;
    var ctx = Audio.init();
    if (!ctx) return;
    stopCountIn();
    var beatSec = 60 / (lesson.bpm * APP.songSpeed);
    var startAt = ctx.currentTime + 0.18;
    var bus = Audio.createBus();
    for (var i = 0; i < 4; i++) {
      Audio.click(i === 0, (startAt - ctx.currentTime) + i * beatSec, bus);
    }
    APP.countIn = {
      active: true,
      done: false,
      raf: null,
      bus: bus,
      startAt: startAt,
      beatSec: beatSec,
      lastBeat: -1
    };
    render(true);
    APP.countIn.raf = requestAnimationFrame(countInTick);
  }

  function countInTick() {
    var c = APP.countIn;
    if (!c.active) return;
    var ctx = Audio.getContext();
    if (!ctx) return;
    var beat = Math.floor((ctx.currentTime - c.startAt) / c.beatSec);
    if (beat !== c.lastBeat) {
      c.lastBeat = beat;
      updateCountInBeat(Math.max(0, Math.min(3, beat)));
    }
    if (beat >= 4) {
      c.active = false;
      c.done = true;
      c.raf = null;
      if (c.bus) Audio.stopBus(c.bus);
      c.bus = null;
      var overlay = document.getElementById('song-count-in');
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      render(true);
      return;
    }
    c.raf = requestAnimationFrame(countInTick);
  }

  function stopCountIn() {
    var c = APP.countIn;
    if (!c) return;
    if (c.raf) cancelAnimationFrame(c.raf);
    c.active = false;
    c.done = false;
    c.raf = null;
    c.lastBeat = -1;
    if (c.bus) Audio.stopBus(c.bus);
    c.bus = null;
    var overlay = document.getElementById('song-count-in');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function updateCountInBeat(beat) {
    var spans = document.querySelectorAll('#song-count-in [data-ci]');
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.toggle('active', i === beat);
    }
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
    html += '<div class="first-sound-hero"><img class="wordmark-logo-full" src="' + logoSrc() + '" alt="Preludio Ukulele"></div>';
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
    html += '<div class="settings-section"><h2>' + t('Appearance') + '</h2>';
    html += '<button class="btn secondary wide" data-action="toggle-theme">' +
      (getSavedTheme() === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')) + '</button>';
    html += '</div>';
    if (installPrompt) {
      html += '<div class="settings-section"><h2>' + t('Install app') + '</h2>';
      html += '<button class="btn secondary wide" data-action="install-app">' + t('Install app') + '</button>';
      html += '<p class="settings-note">' + t('Add Preludio Ukulele to your home screen.') + '</p>';
      html += '</div>';
    }
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
    else if (action === 'plan-start') {
      var item = getPlan().items.filter(function (i) { return i.id === target.getAttribute('data-id'); })[0];
      if (item && !item.done) {
        if (item.kind === 'game') Practice.startGame(item.ref);
        else startLesson(item.ref);
      }
    }
    else if (action === 'open-report') { APP.screen = 'report'; render(); }
    else if (action === 'open-song-library') { APP.screen = 'song-library'; render(); }
    else if (action === 'open-digest') { Progress.setDigestSeen(digestData().key); APP.screen = 'digest'; render(); }
    else if (action === 'dismiss-digest') { Progress.setDigestSeen(digestData().key); render(true); }
    else if (action === 'close-digest') goMap();
    else if (action === 'digest-goal') { Progress.setWeeklyGoal(Number(target.getAttribute('data-min'))); render(true); }
    else if (action === 'copy-digest') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(digestText(digestData())).then(function () { showToast(t('Summary copied.')); }).catch(function () {});
      }
    }
    else if (action === 'print-digest') { window.print(); }
    else if (action === 'open-tour') { APP.tourSlide = 0; APP.screen = 'tour'; render(); }
    else if (action === 'tour-next') { APP.tourSlide = Math.min(TOUR_SLIDES.length - 1, APP.tourSlide + 1); render(true); }
    else if (action === 'tour-back') { APP.tourSlide = Math.max(0, APP.tourSlide - 1); render(true); }
    else if (action === 'tour-finish' || action === 'tour-skip') { Progress.markTourSeen(); goMap(); }
    else if (action === 'open-reference') { APP.showReference = target.getAttribute('data-id'); render(true); }
    else if (action === 'close-reference') { APP.showReference = null; render(true); }
    else if (action === 'hear-reference') hearReference();
    else if (action === 'copy-report') {
      var text = reportText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { showToast(t('Summary copied.')); }).catch(function () {});
      }
    }
    else if (action === 'print-report') { window.print(); }
    else if (action === 'back-map') goMap();
    else if (action === 'goto-quiz') { stopSong(); stopCountIn(); APP.phase = 'quiz'; APP.quiz = null; APP.wrongCount = 0; render(); }
    else if (action === 'quiz-answer') { answerQuiz(target.getAttribute('data-value')); render(true); }
    else if (action === 'goto-play') { stopSong(); stopCountIn(); stopPlayGate(); APP.phase = 'play'; render(); }
    else if (action === 'complete-lesson') completeCurrentLesson();
    else if (action === 'play-confirm') completeCurrentLesson();
    else if (action === 'play-confirm-anyway') { APP.gateBypassed = true; completeCurrentLesson(); }
    else if (action === 'play-start') {
      var playLesson = lessonById(APP.lessonId);
      if (playLesson && !isChord(playLesson) && !isSong(playLesson)) {
        stopPlayGate();
        startPlayCountdown(playLesson, MicGate.prewarm());
      }
    }
    else if (action === 'next-lesson') { var next = Progress.getNextLesson(); if (next) startLesson(next.id); else goMap(); }
    else if (action === 'hear') hearCurrent();
    else if (action === 'song-play' || action === 'song-replay' || action === 'song-hear') { playSong(lessonById(APP.lessonId)); }
    else if (action === 'song-stop') { stopSong(); render(true); }
    else if (action === 'song-count-in') { startCountIn(lessonById(APP.lessonId)); }
    else if (action === 'song-speed-down' || action === 'song-speed-up') {
      var delta = action === 'song-speed-up' ? SPEED_STEP : -SPEED_STEP;
      APP.songSpeed = clampSpeed(APP.songSpeed + delta);
      setSavedSongSpeed(APP.songSpeed);
      render(true);
    }
    else if (action === 'hear-chord') {
      var chordName = target.getAttribute('data-chord');
      if (CURRICULUM.chords[chordName]) Audio.playChord(CURRICULUM.chords[chordName]);
    }
    else if (action === 'open-first-sound') { APP.screen = 'first-sound'; render(); }
    else if (action === 'close-first-sound') goMap();
    else if (action === 'start-learning') {
      Progress.markFirstSoundSeen();
      if (!Progress.hasSeenTour()) { APP.tourSlide = 0; APP.screen = 'tour'; render(); }
      else goMap();
    }
    else if (action === 'hear-open') Audio.play(CURRICULUM.tuningFreqs[Number(target.getAttribute('data-string'))]);
    else if (action === 'hear-strum') Audio.strum(CURRICULUM.tuningFreqs, { down: true });
    else if (action === 'open-settings') { APP.screen = 'settings'; render(); }
    else if (action === 'close-settings') goMap();
    else if (action === 'set-lang') { if (typeof window.setLang === 'function') window.setLang(target.getAttribute('data-lang')); render(); }
    else if (action === 'toggle-theme') { setTheme(getSavedTheme() === 'dark' ? 'light' : 'dark'); render(true); }
    else if (action === 'install-app') {
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt = null;
        render(true);
      }
    }
    else if (action === 'reset-progress') { if (window.confirm(t('Reset all progress?'))) { Progress.reset(); goMap(); } }
  });

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;
    if (APP.screen === 'settings') render(true);
  });
  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    if (APP.screen === 'settings') render(true);
  });

  applySavedTheme();

  var sessionStart = Date.now();
  function flushSession() {
    var seconds = Math.round((Date.now() - sessionStart) / 1000);
    if (seconds >= 2) Progress.addPracticeSeconds(seconds);
    sessionStart = Date.now();
  }
  window.addEventListener('pagehide', function () { flushSession(); stopPlayGate(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { flushSession(); stopPlayGate(); } });
  setInterval(flushSession, 60000);

  window.PreludioHooks = {
    onGameFinish: function (mode) {
      markPlanDone(function (item) { return item.kind === 'game' && item.ref === mode; });
      announceBadges(Progress.evaluateBadges());
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  window.render = render;
  window.PreludioNav = {
    go: function (screen) {
      APP.screen = screen;
      render();
    }
  };
})();
