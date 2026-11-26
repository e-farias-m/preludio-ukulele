// progress.js — Local progress for Preludio Ukulele
//
// Stores completed lessons, best stars, XP, streak, and whether the
// first-sound tutorial has been seen. Everything is kept on this device.

(function () {
  'use strict';

  var KEY = 'preludioUkuleleProgressV1';

  function defaultState() {
    return {
      xp: 0,
      streak: 0,
      lastDate: null,
      lessons: {},
      games: {},
      skills: {},
      plan: null,
      badges: [],
      badgeDates: {},
      digestSeen: null,
      activity: {},
      weeklyGoal: 60,
      tourSeen: false,
      firstSoundSeen: false
    };
  }

  function readStorage() {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(KEY);
    } catch (e) { return null; }
  }

  function writeStorage(value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, value);
    } catch (e) { /* storage unavailable — fail silently */ }
  }

  function load() {
    var raw = readStorage();
    if (!raw) return defaultState();
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return defaultState();
      return {
        xp: Number(data.xp) || 0,
        streak: Number(data.streak) || 0,
        lastDate: data.lastDate || null,
        lessons: data.lessons && typeof data.lessons === 'object' ? data.lessons : {},
        games: data.games && typeof data.games === 'object' ? data.games : {},
        skills: data.skills && typeof data.skills === 'object' ? data.skills : {},
        plan: data.plan && typeof data.plan === 'object' ? data.plan : null,
        badges: Array.isArray(data.badges) ? data.badges : [],
        badgeDates: data.badgeDates && typeof data.badgeDates === 'object' ? data.badgeDates : {},
        digestSeen: data.digestSeen || null,
        activity: data.activity && typeof data.activity === 'object' ? data.activity : {},
        weeklyGoal: Number(data.weeklyGoal) > 0 ? Number(data.weeklyGoal) : 60,
        tourSeen: !!data.tourSeen,
        firstSoundSeen: !!data.firstSoundSeen
      };
    } catch (e) {
      return defaultState();
    }
  }

  var state = load();

  function save() {
    writeStorage(JSON.stringify(state));
  }

  function dateKey(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  function touchStreak() {
    var today = dateKey();
    if (state.lastDate === today) return;
    var y = new Date();
    y.setDate(y.getDate() - 1);
    if (state.lastDate === dateKey(y)) state.streak += 1;
    else state.streak = 1;
    state.lastDate = today;
  }

  function completeLesson(id, stars) {
    var prev = state.lessons[id];
    var first = !prev || !prev.completed;
    var prevStars = prev && prev.stars ? prev.stars : 0;
    var best = Math.max(Number(stars) || 0, prevStars);
    var xpGain = first ? best * 10 : Math.max(0, (best - prevStars) * 10);

    state.lessons[id] = {
      completed: true,
      stars: best,
      attempts: (prev && prev.attempts ? prev.attempts : 0) + 1,
      completedAt: new Date().toISOString()
    };

    if (xpGain > 0) state.xp += xpGain;
    touchStreak();
    save();

    return { first: first, xpGain: xpGain, bestStars: best };
  }

  function isCompleted(id) {
    return !!(state.lessons[id] && state.lessons[id].completed);
  }

  function getStars(id) {
    return state.lessons[id] ? (state.lessons[id].stars || 0) : 0;
  }

  function getXp() { return state.xp; }

  function getLevel() { return Math.floor(state.xp / 100) + 1; }

  function getLevelProgress() { return state.xp % 100; }

  function getStreak() { return state.streak; }

  function hasSeenFirstSound() { return state.firstSoundSeen; }

  function markFirstSoundSeen() {
    if (!state.firstSoundSeen) {
      state.firstSoundSeen = true;
      save();
    }
  }

  function reset() {
    state = defaultState();
    save();
  }

  function lessons() {
    return (typeof CURRICULUM !== 'undefined' && CURRICULUM.flatLessons)
      ? CURRICULUM.flatLessons
      : [];
  }

  function isUnlocked(id) {
    if (isCompleted(id)) return true;
    var list = lessons();
    var index = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { index = i; break; }
    }
    if (index === -1) return false;
    if (index === 0) return true;
    return isCompleted(list[index - 1].id);
  }

  function getNextLesson() {
    var list = lessons();
    for (var i = 0; i < list.length; i++) {
      if (!isCompleted(list[i].id) && isUnlocked(list[i].id)) return list[i];
    }
    return null;
  }

  function getCompletedCount() {
    var list = lessons();
    var count = 0;
    list.forEach(function (lesson) {
      if (isCompleted(lesson.id)) count++;
    });
    return count;
  }

  function getLearnedCount(type) {
    var list = lessons();
    var count = 0;
    list.forEach(function (lesson) {
      if (lesson.type === type && isCompleted(lesson.id)) count++;
    });
    return count;
  }

  function addXp(amount) {
    var n = Math.max(0, Number(amount) || 0);
    if (!n) return;
    state.xp += n;
    save();
  }

  function getGameBest(mode) {
    var v = Number(state.games[mode]);
    return v > 0 ? v : 0;
  }

  function setGameBest(mode, score) {
    var best = getGameBest(mode);
    if (score <= best) return false;
    state.games[mode] = score;
    save();
    return true;
  }

  function getSkill(key) {
    var s = state.skills[key];
    return s ? { correct: Number(s.correct) || 0, total: Number(s.total) || 0 } : null;
  }

  function recordSkill(key, correct) {
    if (!key) return;
    var s = state.skills[key] || { correct: 0, total: 0, lastSeen: 0 };
    s.total = (Number(s.total) || 0) + 1;
    if (correct) s.correct = (Number(s.correct) || 0) + 1;
    s.lastSeen = Date.now();
    state.skills[key] = s;
    save();
  }

  function getPlan() { return state.plan; }
  function setPlan(plan) { state.plan = plan; save(); }

  function addPracticeSeconds(seconds) {
    var n = Math.min(1800, Math.max(0, Number(seconds) || 0));
    if (!n) return;
    var key = dateKey();
    state.activity[key] = (Number(state.activity[key]) || 0) + n;
    save();
  }
  function getActivity() {
    var copy = {};
    Object.keys(state.activity).forEach(function (key) { copy[key] = state.activity[key]; });
    return copy;
  }
  function getWeeklyGoal() { return Number(state.weeklyGoal) || 60; }
  function setWeeklyGoal(minutes) {
    state.weeklyGoal = Math.max(1, Number(minutes) || 60);
    save();
  }

  function hasSeenTour() { return !!state.tourSeen; }
  function markTourSeen() {
    if (state.tourSeen) return;
    state.tourSeen = true;
    save();
  }

  var BADGE_TESTS = [
    { id: 'first-sound', test: function () { return state.firstSoundSeen; } },
    { id: 'first-lesson', test: function () { return getCompletedCount() >= 1; } },
    { id: 'first-chord', test: function () { return getLearnedCount('chord') >= 1; } },
    { id: 'first-song', test: function () { return getLearnedCount('song') >= 1; } },
    { id: 'ten-lessons', test: function () { return getCompletedCount() >= 10; } },
    { id: 'all-lessons', test: function () { return getCompletedCount() >= lessons().length && lessons().length > 0; } },
    { id: 'streak-seven', test: function () { return state.streak >= 7; } },
    { id: 'quick-fingers', test: function () { return getGameBest('note') >= 10 || getGameBest('chord') >= 10; } }
  ];

  function getBadges() { return state.badges.slice(); }
  function getBadgeDates() {
    var copy = {};
    Object.keys(state.badgeDates).forEach(function (id) { copy[id] = state.badgeDates[id]; });
    return copy;
  }
  function getDigestSeen() { return state.digestSeen; }
  function setDigestSeen(key) { state.digestSeen = key; save(); }
  function hasBadge(id) { return state.badges.indexOf(id) !== -1; }
  function evaluateBadges() {
    var earned = [];
    BADGE_TESTS.forEach(function (badge) {
      if (!hasBadge(badge.id) && badge.test()) {
        state.badges.push(badge.id);
        state.badgeDates[badge.id] = dateKey();
        earned.push(badge.id);
      }
    });
    if (earned.length) save();
    return earned;
  }

  var Progress = {
    completeLesson: completeLesson,
    isCompleted: isCompleted,
    getStars: getStars,
    getXp: getXp,
    getLevel: getLevel,
    getLevelProgress: getLevelProgress,
    getStreak: getStreak,
    hasSeenFirstSound: hasSeenFirstSound,
    markFirstSoundSeen: markFirstSoundSeen,
    reset: reset,
    isUnlocked: isUnlocked,
    getNextLesson: getNextLesson,
    getCompletedCount: getCompletedCount,
    getLearnedCount: getLearnedCount,
    addXp: addXp,
    getGameBest: getGameBest,
    setGameBest: setGameBest,
    getSkill: getSkill,
    recordSkill: recordSkill,
    getPlan: getPlan,
    setPlan: setPlan,
    addPracticeSeconds: addPracticeSeconds,
    getActivity: getActivity,
    getWeeklyGoal: getWeeklyGoal,
    setWeeklyGoal: setWeeklyGoal,
    hasSeenTour: hasSeenTour,
    markTourSeen: markTourSeen,
    getBadges: getBadges,
    getBadgeDates: getBadgeDates,
    getDigestSeen: getDigestSeen,
    setDigestSeen: setDigestSeen,
    hasBadge: hasBadge,
    evaluateBadges: evaluateBadges,
    _state: function () { return state; }
  };

  if (typeof window !== 'undefined') window.Progress = Progress;
  if (typeof module !== 'undefined' && module.exports) module.exports = Progress;
})();
