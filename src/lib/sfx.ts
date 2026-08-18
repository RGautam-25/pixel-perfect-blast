let ctx: AudioContext | null = null;
let enabled = true;

export const isSoundOn = () => enabled;
export const setSoundOn = (v: boolean) => {
  enabled = v;
  if (typeof localStorage !== "undefined") localStorage.setItem("orbblast-sound", v ? "1" : "0");
};
export const loadSoundPref = () => {
  if (typeof localStorage === "undefined") return true;
  enabled = localStorage.getItem("orbblast-sound") !== "0";
  return enabled;
};

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.06, delay = 0) {
  const a = ac();
  if (!a || !enabled) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  select: () => tone(520, 0.08, "triangle", 0.04),
  place: () => tone(320, 0.1, "sine", 0.05),
  clear: (lines = 1) => {
    const base = 480;
    for (let i = 0; i < Math.min(lines + 1, 5); i++)
      tone(base * Math.pow(1.26, i), 0.16, "triangle", 0.06, i * 0.06);
  },
  combo: () => {
    [660, 880, 1180].forEach((f, i) => tone(f, 0.2, "sine", 0.05, i * 0.07));
  },
  over: () => {
    [420, 320, 220].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.04, i * 0.13));
  },
  start: () => {
    [520, 700, 950].forEach((f, i) => tone(f, 0.18, "triangle", 0.05, i * 0.08));
  },
};
