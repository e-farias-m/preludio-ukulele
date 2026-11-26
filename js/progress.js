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
    _state: function () { return state; }
  };

  if (typeof window !== 'undefined') window.Progress = Progress;
  if (typeof module !== 'undefined' && module.exports) module.exports = Progress;
})();
