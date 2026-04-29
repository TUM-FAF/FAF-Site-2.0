let _ctx = null;

function ac() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function beep(freq, dur, type = 'square', vol = 0.12) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start(); o.stop(c.currentTime + dur);
  } catch {}
}

export function playHit() {
  beep(200, 0.12, 'square', 0.15);
}

export function playDead() {
  try {
    const c = ac();
    [440, 330, 220, 110].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'square';
      o.frequency.value = f;
      const t = c.currentTime + i * 0.13;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      o.start(t); o.stop(t + 0.13);
    });
  } catch {}
}

export function playWin() {
  try {
    const c = ac();
    [330, 415, 495, 660].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'square';
      o.frequency.value = f;
      const t = c.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.start(t); o.stop(t + 0.15);
    });
  } catch {}
}

export function playIncoming() {
  beep(660, 0.15, 'sine', 0.07);
}
