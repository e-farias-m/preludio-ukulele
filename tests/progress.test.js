const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const store = new Map();
Object.defineProperty(global, 'localStorage', {
  configurable: true,
  value: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  }
});

const Progress = require('../js/progress.js');
global.CURRICULUM = require('../js/curriculum.js');

beforeEach(() => {
  store.clear();
  Progress.reset();
});

test('first completion awards stars times ten XP', () => {
  const result = Progress.completeLesson('g-open', 3);
  assert.equal(result.first, true);
  assert.equal(result.xpGain, 30);
  assert.equal(Progress.getXp(), 30);
  assert.equal(Progress.getStars('g-open'), 3);
});

test('replays only award XP for a new best score', () => {
  Progress.completeLesson('g-open', 1);
  const replay = Progress.completeLesson('g-open', 1);
  assert.equal(replay.xpGain, 0);
  const better = Progress.completeLesson('g-open', 3);
  assert.equal(better.xpGain, 20);
  assert.equal(Progress.getXp(), 30);
});

test('lessons unlock in order and completed lessons stay open', () => {
  const list = require('../js/curriculum.js').flatLessons;
  assert.equal(Progress.isUnlocked(list[0].id), true);
  assert.equal(Progress.isUnlocked(list[1].id), false);
  Progress.completeLesson(list[0].id, 3);
  assert.equal(Progress.isUnlocked(list[1].id), true);
  Progress.completeLesson(list[3].id, 3);
  assert.equal(Progress.isUnlocked(list[3].id), true);
});

test('game bests keep the highest score', () => {
  assert.equal(Progress.getGameBest('note'), 0);
  assert.equal(Progress.setGameBest('note', 4), true);
  assert.equal(Progress.setGameBest('note', 3), false);
  assert.equal(Progress.getGameBest('note'), 4);
});

test('skill accuracy is tracked per item', () => {
  Progress.recordSkill('example', true);
  Progress.recordSkill('example', false);
  const skill = Progress.getSkill('example');
  assert.equal(skill.total, 2);
  assert.equal(skill.correct, 1);
  assert.equal(Progress.getSkill('missing'), null);
});

test('addXp and reset behave predictably', () => {
  Progress.addXp(25);
  assert.equal(Progress.getXp(), 25);
  Progress.reset();
  assert.equal(Progress.getXp(), 0);
  assert.equal(Progress.getGameBest('note'), 0);
  assert.equal(Progress.isCompleted('g-open'), false);
});
