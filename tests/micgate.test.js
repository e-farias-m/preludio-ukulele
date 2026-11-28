const test = require('node:test');
const assert = require('node:assert/strict');
const MicGate = require('../js/micgate.js');

test('thresholds match the Recorder gate', () => {
  assert.equal(MicGate.GATE_CENTS, 80);
  assert.equal(MicGate.GATE_FRAMES_NEEDED, 4);
  assert.equal(MicGate.TIMEOUT_MS, 10000);
});

test('centsOff measures pitch distance in semitones', () => {
  assert.ok(Math.abs(MicGate.centsOff(523.25, 261.63) - 1200) < 1);
  assert.ok(Math.abs(MicGate.centsOff(261.63, 261.63)) < 0.001);
});

test('isInTune accepts ±80 cents and rejects larger errors', () => {
  assert.equal(MicGate.isInTune(266, 261.63), true);
  assert.equal(MicGate.isInTune(280, 261.63), false);
  assert.equal(MicGate.isInTune(0, 261.63), false);
});

test('detectPitch finds a sine fundamental within gate tolerance', () => {
  const rate = 44100;
  const size = 1024;
  [196, 261.63, 329.63, 392, 440, 523.25].forEach(freq => {
    const buf = new Float32Array(size);
    for (let i = 0; i < size; i++) buf[i] = 0.5 * Math.sin(2 * Math.PI * freq * i / rate);
    const detected = MicGate.detectPitch(buf, rate);
    assert.ok(detected > 0, String(freq));
    assert.ok(MicGate.isInTune(detected, freq), `${freq} detected as ${detected}`);
  });
});

test('detectPitch rejects silence', () => {
  const buf = new Float32Array(1024);
  assert.equal(MicGate.detectPitch(buf, 44100), -1);
});
