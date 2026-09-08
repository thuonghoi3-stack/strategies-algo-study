import type { Bar, Scenario } from "./types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

type Phase = { len: number; drift: number; vol: number };

function phasesFor(scenario: Scenario): Phase[] {
  switch (scenario) {
    case "uptrend":
      return [
        { len: 40, drift: 0.0006, vol: 0.01 },
        { len: 80, drift: 0.0022, vol: 0.012 },
        { len: 50, drift: 0.0011, vol: 0.01 },
        { len: 50, drift: 0.0028, vol: 0.014 },
      ];
    case "downtrend":
      return [
        { len: 30, drift: 0.0004, vol: 0.01 },
        { len: 90, drift: -0.0024, vol: 0.014 },
        { len: 40, drift: -0.0008, vol: 0.011 },
        { len: 60, drift: -0.002, vol: 0.016 },
      ];
    case "range":
      return [
        { len: 50, drift: 0.0004, vol: 0.008 },
        { len: 70, drift: -0.0003, vol: 0.007 },
        { len: 60, drift: 0.0002, vol: 0.008 },
        { len: 40, drift: -0.0002, vol: 0.007 },
      ];
    case "breakout":
      return [
        { len: 90, drift: 0.0001, vol: 0.006 },
        { len: 20, drift: 0.0002, vol: 0.004 },
        { len: 70, drift: 0.0034, vol: 0.016 },
        { len: 40, drift: 0.0008, vol: 0.012 },
      ];
    case "reversal":
      return [
        { len: 90, drift: 0.0024, vol: 0.012 },
        { len: 20, drift: 0.0004, vol: 0.01 },
        { len: 80, drift: -0.0026, vol: 0.015 },
        { len: 30, drift: -0.0006, vol: 0.011 },
      ];
    case "volatile":
      return [
        { len: 40, drift: 0.001, vol: 0.02 },
        { len: 50, drift: -0.002, vol: 0.024 },
        { len: 50, drift: 0.0024, vol: 0.022 },
        { len: 80, drift: -0.0012, vol: 0.026 },
      ];
    case "mixed":
    default:
      return [
        { len: 50, drift: 0.0018, vol: 0.011 },
        { len: 40, drift: -0.0002, vol: 0.008 },
        { len: 70, drift: 0.0022, vol: 0.013 },
        { len: 60, drift: -0.002, vol: 0.015 },
      ];
  }
}

export function generateMarket(opts: {
  scenario: Scenario;
  bars?: number;
  seed?: number;
  startPrice?: number;
}): Bar[] {
  const barsN = opts.bars ?? 240;
  const rand = mulberry32(opts.seed ?? 7);
  const start = opts.startPrice ?? 100;
  const phases = phasesFor(opts.scenario);
  const totalPhase = phases.reduce((s, p) => s + p.len, 0);

  const bars: Bar[] = [];
  let price = start;
  const t0 = Date.UTC(2024, 0, 2);
  const day = 86_400_000;

  for (let i = 0; i < barsN; i++) {
    const pos = (i / barsN) * totalPhase;
    let acc = 0;
    let phase = phases[0]!;
    for (const p of phases) {
      acc += p.len;
      if (pos <= acc) {
        phase = p;
        break;
      }
    }

    const shock = i > 0 && rand() < 0.03 ? (rand() < 0.5 ? -1 : 1) * phase.vol * 3 : 0;
    const ret = phase.drift + phase.vol * gaussian(rand) + shock;
    const prev = price;
    price = Math.max(2, price * (1 + ret));

    const range = Math.abs(price - prev) + price * phase.vol * (0.4 + rand() * 0.8);
    const wickUp = range * (0.15 + rand() * 0.55);
    const wickDn = range * (0.15 + rand() * 0.55);
    const o = prev;
    const c = price;
    const h = Math.max(o, c) + wickUp;
    const l = Math.max(0.5, Math.min(o, c) - wickDn);
    const body = Math.abs(c - o);
    const v = Math.round(800 + rand() * 2200 + body * 40 + (shock ? 1800 : 0));

    const dayOffset = Math.floor(i / 5) * 2 + i;
    bars.push({
      t: t0 + dayOffset * day,
      o: round(o),
      h: round(h),
      l: round(l),
      c: round(c),
      v,
    });
  }
  return bars;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export const SCENARIOS: { id: Scenario; label: string; hint: string }[] = [
  { id: "uptrend", label: "Xu hướng tăng", hint: "Drift dương, pullback nông" },
  { id: "downtrend", label: "Xu hướng giảm", hint: "Chuỗi lower-high" },
  { id: "range", label: "Đi ngang", hint: "Biên hẹp, mean-reversion" },
  { id: "breakout", label: "Breakout", hint: "Tích lũy rồi nổ ATR" },
  { id: "reversal", label: "Đảo chiều", hint: "Tăng kéo dài rồi gãy" },
  { id: "volatile", label: "Biến động cao", hint: "Whipsaw, ATR lớn" },
  { id: "mixed", label: "Hỗn hợp", hint: "Nhiều pha liên tiếp" },
];
