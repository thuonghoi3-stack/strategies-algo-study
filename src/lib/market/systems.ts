import { COLORS, rsi, atr } from "./indicators";
import type { AlgoResult, Bar, Signal } from "./types";
import {
  ema,
  formatNum,
  formatPct,
  highest,
  lastNumber,
  linreg,
  lowest,
  sma,
  stdev,
} from "./math";

const C = COLORS;

function closes(bars: Bar[]) {
  return bars.map((b) => b.c);
}
function highs(bars: Bar[]) {
  return bars.map((b) => b.h);
}
function lows(bars: Bar[]) {
  return bars.map((b) => b.l);
}

function fwd(bars: Bar[], signals: Signal[], horizon = 10) {
  if (signals.length === 0) {
    return [
      { label: "Tín hiệu", value: "0" },
      { label: "Hit-rate 10 nến", value: "—" },
      { label: "Avg. move", value: "—" },
    ];
  }
  let hits = 0;
  let counted = 0;
  let sum = 0;
  for (const s of signals) {
    const j = Math.min(bars.length - 1, s.i + horizon);
    if (j <= s.i) continue;
    const ret = (bars[j]!.c - s.price) / s.price;
    const signed = s.side === "buy" ? ret : -ret;
    sum += signed;
    counted += 1;
    if (signed > 0) hits += 1;
  }
  return [
    { label: "Tín hiệu", value: String(signals.length) },
    { label: "Hit-rate 10 nến", value: counted ? formatPct(hits / counted) : "—" },
    { label: "Avg. move", value: counted ? formatPct(sum / counted) : "—" },
  ];
}

function vwapReset(bars: Bar[], reset: number): Array<number | null> {
  const n = bars.length;
  const val: Array<number | null> = Array(n).fill(null);
  let pv = 0;
  let vol = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (count === 0) {
      pv = 0;
      vol = 0;
    }
    const tp = (bars[i]!.h + bars[i]!.l + bars[i]!.c) / 3;
    pv += tp * bars[i]!.v;
    vol += bars[i]!.v;
    val[i] = vol === 0 ? tp : pv / vol;
    count += 1;
    if (count >= reset) count = 0;
  }
  return val;
}

function cross(a: Array<number | null>, b: Array<number | null>, price: number[]): Signal[] {
  const sig: Signal[] = [];
  for (let i = 1; i < a.length; i++) {
    const a0 = a[i - 1];
    const a1 = a[i];
    const b0 = b[i - 1];
    const b1 = b[i];
    if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
    if (a0 <= b0 && a1 > b1) sig.push({ i, side: "buy", price: price[i]! });
    if (a0 >= b0 && a1 < b1) sig.push({ i, side: "sell", price: price[i]! });
  }
  return sig;
}

function turtle(bars: Bar[], entryN: number, exitN: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const c = closes(bars);
  const eU: Array<number | null> = Array(n).fill(null);
  const eL: Array<number | null> = Array(n).fill(null);
  const xU: Array<number | null> = Array(n).fill(null);
  const xL: Array<number | null> = Array(n).fill(null);
  const signals: Signal[] = [];
  let pos = 0;
  for (let i = 1; i < n; i++) {
    if (i >= entryN) {
      eU[i] = highest(H, entryN, i - 1);
      eL[i] = lowest(L, entryN, i - 1);
    }
    if (i >= exitN) {
      xU[i] = highest(H, exitN, i - 1);
      xL[i] = lowest(L, exitN, i - 1);
    }
    if (eU[i] == null || eL[i] == null) continue;
    if (pos === 0) {
      if (c[i]! > eU[i]!) {
        signals.push({ i, side: "buy", price: c[i]!, note: `Break ${entryN}` });
        pos = 1;
      } else if (c[i]! < eL[i]!) {
        signals.push({ i, side: "sell", price: c[i]!, note: `Break ${entryN}` });
        pos = -1;
      }
    } else if (pos === 1 && xL[i] != null && c[i]! < xL[i]!) {
      signals.push({ i, side: "sell", price: c[i]!, note: `Exit ${exitN}` });
      pos = 0;
    } else if (pos === -1 && xU[i] != null && c[i]! > xU[i]!) {
      signals.push({ i, side: "buy", price: c[i]!, note: `Exit ${exitN}` });
      pos = 0;
    }
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "entry",
        label: `Donchian ${entryN}`,
        upper: eU,
        lower: eL,
        fill: "rgba(168,184,200,0.10)",
        upperColor: C.up,
        lowerColor: C.down,
      },
      { kind: "line", id: "xU", label: `Exit ${exitN} H`, color: C.muted, values: xU, dashed: true, width: 1 },
      { kind: "line", id: "xL", label: `Exit ${exitN} L`, color: C.muted, values: xL, dashed: true, width: 1 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Vị thế", value: pos === 1 ? "Long" : pos === -1 ? "Short" : "Flat" },
      ...fwd(bars, signals, exitN),
    ],
  };
}

export function turtleS1(bars: Bar[], entry: number, exit: number) {
  return turtle(bars, entry, exit);
}
export function turtleS2(bars: Bar[], entry: number, exit: number) {
  return turtle(bars, entry, exit);
}

export function donchianEma(bars: Bar[], don: number, maN: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const c = closes(bars);
  const ma = ema(c, maN);
  const upper: Array<number | null> = Array(n).fill(null);
  const lower: Array<number | null> = Array(n).fill(null);
  const signals: Signal[] = [];
  for (let i = Math.max(don, maN); i < n; i++) {
    upper[i] = highest(H, don, i - 1);
    lower[i] = lowest(L, don, i - 1);
    if (ma[i] == null || upper[i] == null) continue;
    if (c[i]! > upper[i]! && c[i]! > ma[i]!) signals.push({ i, side: "buy", price: c[i]! });
    if (c[i]! < lower[i]! && c[i]! < ma[i]!) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "don",
        label: `Donchian ${don}`,
        upper,
        lower,
        fill: "rgba(168,184,200,0.10)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "line", id: "ema", label: `EMA ${maN}`, color: C.warn, values: ma, width: 1.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: `EMA ${maN}`, value: formatNum(lastNumber(ma) ?? NaN) },
      ...fwd(bars, signals),
    ],
  };
}

export function emaCross(bars: Bar[], fast: number, slow: number): AlgoResult {
  const c = closes(bars);
  const a = ema(c, fast);
  const b = ema(c, slow);
  const signals = cross(a, b, c);
  return {
    overlays: [
      { kind: "line", id: "fast", label: `EMA ${fast}`, color: C.up, values: a, width: 1.4 },
      { kind: "line", id: "slow", label: `EMA ${slow}`, color: C.down, values: b, width: 1.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: `EMA ${fast}`, value: formatNum(lastNumber(a) ?? NaN) },
      { label: `EMA ${slow}`, value: formatNum(lastNumber(b) ?? NaN) },
      ...fwd(bars, signals),
    ],
  };
}

export function macdStrategy(bars: Bar[], fast: number, slow: number, sigN: number): AlgoResult {
  const c = closes(bars);
  const eF = ema(c, fast);
  const eS = ema(c, slow);
  const line = c.map((_, i) => (eF[i] == null || eS[i] == null ? null : eF[i]! - eS[i]!));
  const sig = ema(line, sigN);
  const hist = line.map((v, i) => (v == null || sig[i] == null ? null : v - sig[i]!));
  const histColors = hist.map((v) => (v == null ? null : v >= 0 ? C.up : C.down));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (line[i] == null || sig[i] == null || hist[i] == null) continue;
    if (line[i - 1]! <= sig[i - 1]! && line[i]! > sig[i]! && hist[i]! > 0)
      signals.push({ i, side: "buy", price: c[i]! });
    if (line[i - 1]! >= sig[i - 1]! && line[i]! < sig[i]! && hist[i]! < 0)
      signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "macd",
        label: "MACD",
        min: -1,
        max: 1,
        zero: 0,
        series: [
          { id: "hist", color: C.muted, values: hist, type: "hist", histColors },
          { id: "macd", color: C.primary, values: line },
          { id: "sig", color: C.down, values: sig },
        ],
      },
    ],
    signals,
    stats: [{ label: "MACD", value: formatNum(lastNumber(line) ?? NaN, 3) }, ...fwd(bars, signals)],
  };
}

export function rsiStrategy(bars: Bar[], period: number, ob: number, os: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, period);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (r[i] == null || r[i - 1] == null) continue;
    if (r[i - 1]! < os && r[i]! >= os) signals.push({ i, side: "buy", price: c[i]!, note: "Thoát OS" });
    if (r[i - 1]! > ob && r[i]! <= ob) signals.push({ i, side: "sell", price: c[i]!, note: "Thoát OB" });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "rsi",
        label: `RSI ${period}`,
        min: 0,
        max: 100,
        guides: [os, 50, ob],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [{ label: "RSI", value: formatNum(lastNumber(r) ?? NaN, 1) }, ...fwd(bars, signals)],
  };
}

export function bbStrategy(bars: Bar[], period: number, k: number): AlgoResult {
  const c = closes(bars);
  const mid = sma(c, period);
  const sd = stdev(c, period);
  const upper = mid.map((v, i) => (v == null || sd[i] == null ? null : v + k * sd[i]!));
  const lower = mid.map((v, i) => (v == null || sd[i] == null ? null : v - k * sd[i]!));
  const r = rsi(c, 14);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (lower[i] == null || upper[i] == null || r[i] == null) continue;
    if (c[i]! < lower[i]! && r[i]! < 35) signals.push({ i, side: "buy", price: c[i]! });
    if (c[i]! > upper[i]! && r[i]! > 65) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "bb",
        label: "BB",
        upper,
        lower,
        mid,
        fill: "rgba(168,184,200,0.12)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "rsi",
        label: "RSI 14",
        min: 0,
        max: 100,
        guides: [30, 70],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [{ label: "Mid", value: formatNum(lastNumber(mid) ?? NaN) }, ...fwd(bars, signals)],
  };
}

export function stochStrategy(bars: Bar[], kN: number, dN: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const raw: Array<number | null> = Array(n).fill(null);
  for (let i = kN - 1; i < n; i++) {
    const hh = highest(H, kN, i);
    const ll = lowest(L, kN, i);
    raw[i] = hh === ll ? 50 : ((bars[i]!.c - ll) / (hh - ll)) * 100;
  }
  const k = sma(raw, 3);
  const d = sma(k, dN);
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (k[i] == null || d[i] == null || k[i - 1] == null || d[i - 1] == null) continue;
    if (k[i - 1]! <= d[i - 1]! && k[i]! > d[i]! && k[i]! < 25)
      signals.push({ i, side: "buy", price: bars[i]!.c });
    if (k[i - 1]! >= d[i - 1]! && k[i]! < d[i]! && k[i]! > 75)
      signals.push({ i, side: "sell", price: bars[i]!.c });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "stoch",
        label: "Stochastic",
        min: 0,
        max: 100,
        guides: [20, 80],
        series: [
          { id: "%K", color: C.primary, values: k },
          { id: "%D", color: C.down, values: d },
        ],
      },
    ],
    signals,
    stats: [{ label: "%K", value: formatNum(lastNumber(k) ?? NaN, 1) }, ...fwd(bars, signals)],
  };
}

export function keltnerBreak(bars: Bar[], period: number, mult: number): AlgoResult {
  const c = closes(bars);
  const mid = ema(c, period);
  const a = atr(bars, period);
  const upper = mid.map((v, i) => (v == null || a[i] == null ? null : v + mult * a[i]!));
  const lower = mid.map((v, i) => (v == null || a[i] == null ? null : v - mult * a[i]!));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (upper[i - 1] == null || lower[i - 1] == null) continue;
    if (c[i]! > upper[i - 1]!) signals.push({ i, side: "buy", price: c[i]! });
    if (c[i]! < lower[i - 1]!) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "kc",
        label: "Keltner",
        upper,
        lower,
        mid,
        fill: "rgba(168,184,200,0.12)",
        upperColor: C.up,
        lowerColor: C.down,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "EMA", value: formatNum(lastNumber(mid) ?? NaN) }, ...fwd(bars, signals)],
  };
}

export function connorsRsi2(bars: Bar[], rsiN: number, maN: number, thresh: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, rsiN);
  const ma = sma(c, maN);
  const sma5 = sma(c, 5);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (r[i] == null || ma[i] == null) continue;
    if (c[i]! > ma[i]! && r[i]! < thresh && (r[i - 1] == null || r[i - 1]! >= thresh))
      signals.push({ i, side: "buy", price: c[i]!, note: `RSI(${rsiN})<${thresh}` });
    if (sma5[i] != null && c[i - 1]! <= sma5[i - 1]! && c[i]! > sma5[i]!)
      signals.push({ i, side: "sell", price: c[i]!, note: "Exit SMA5" });
  }
  return {
    overlays: [
      { kind: "line", id: "ma", label: `SMA ${maN}`, color: C.warn, values: ma, width: 1.5 },
      { kind: "line", id: "s5", label: "SMA 5", color: C.muted, values: sma5, width: 1, dashed: true },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "rsi2",
        label: `RSI ${rsiN}`,
        min: 0,
        max: 100,
        guides: [thresh, 70],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [
      { label: `RSI ${rsiN}`, value: formatNum(lastNumber(r) ?? NaN, 1) },
      { label: "Filter", value: (lastNumber(c) ?? 0) > (lastNumber(ma) ?? 0) ? "Trên MA" : "Dưới MA" },
      ...fwd(bars, signals, 5),
    ],
  };
}

export function connorsCrsi(bars: Bar[], rsiN: number, sumN: number, maN: number, thresh: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, rsiN);
  const cr: Array<number | null> = Array(c.length).fill(null);
  for (let i = 0; i < c.length; i++) {
    let s = 0;
    let ok = true;
    for (let k = 0; k < sumN; k++) {
      const v = r[i - k];
      if (v == null) {
        ok = false;
        break;
      }
      s += v;
    }
    if (ok) cr[i] = s;
  }
  const ma = sma(c, maN);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (cr[i] == null || ma[i] == null) continue;
    if (c[i]! > ma[i]! && cr[i]! < thresh && (cr[i - 1] ?? 100) >= thresh)
      signals.push({ i, side: "buy", price: c[i]!, note: `CRSI<${thresh}` });
    if (r[i] != null && r[i - 1] != null && r[i - 1]! <= 70 && r[i]! > 70)
      signals.push({ i, side: "sell", price: c[i]!, note: "RSI>70" });
  }
  return {
    overlays: [
      { kind: "line", id: "ma", label: `SMA ${maN}`, color: C.warn, values: ma, width: 1.5 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "crsi",
        label: `Cumulative RSI(${rsiN})×${sumN}`,
        min: 0,
        max: 100 * sumN,
        guides: [thresh],
        series: [{ id: "crsi", color: C.primary, values: cr }],
      },
    ],
    signals,
    stats: [{ label: "CRSI", value: formatNum(lastNumber(cr) ?? NaN, 1) }, ...fwd(bars, signals, 5)],
  };
}

export function ttmSqueeze(bars: Bar[], period: number, bbK: number, kcM: number): AlgoResult {
  const c = closes(bars);
  const mid = sma(c, period);
  const sd = stdev(c, period);
  const a = atr(bars, period);
  const emaMid = ema(c, period);
  const bbU = mid.map((v, i) => (v == null || sd[i] == null ? null : v + bbK * sd[i]!));
  const bbL = mid.map((v, i) => (v == null || sd[i] == null ? null : v - bbK * sd[i]!));
  const kcU = emaMid.map((v, i) => (v == null || a[i] == null ? null : v + kcM * a[i]!));
  const kcL = emaMid.map((v, i) => (v == null || a[i] == null ? null : v - kcM * a[i]!));
  const sq: Array<number | null> = Array(c.length).fill(null);
  const mom: Array<number | null> = Array(c.length).fill(null);
  for (let i = period; i < c.length; i++) {
    if (bbU[i] == null || kcU[i] == null) continue;
    sq[i] = bbU[i]! < kcU[i]! && bbL[i]! > kcL[i]! ? 1 : 0;
    const window = c.slice(i - period + 1, i + 1);
    const { slope } = linreg(window);
    mom[i] = slope;
  }
  const momC = mom.map((v) => (v == null ? null : v >= 0 ? C.up : C.down));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (sq[i] == null || sq[i - 1] == null || mom[i] == null) continue;
    if (sq[i - 1] === 1 && sq[i] === 0) {
      signals.push({
        i,
        side: mom[i]! >= 0 ? "buy" : "sell",
        price: c[i]!,
        note: "Squeeze fire",
      });
    }
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "bb",
        label: "BB",
        upper: bbU,
        lower: bbL,
        mid,
        fill: "rgba(168,184,200,0.08)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "line", id: "kcU", label: "KC U", color: C.up, values: kcU, dashed: true, width: 1 },
      { kind: "line", id: "kcL", label: "KC L", color: C.down, values: kcL, dashed: true, width: 1 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "sq",
        label: "Squeeze / Mom",
        min: -1,
        max: 1,
        zero: 0,
        series: [
          { id: "mom", color: C.primary, values: mom, type: "hist", histColors: momC },
          { id: "sq", color: C.warn, values: sq.map((v) => (v == null ? null : v === 1 ? 0.2 : null)) },
        ],
      },
    ],
    signals,
    stats: [
      { label: "Squeeze", value: lastNumber(sq) === 1 ? "ON" : "OFF" },
      { label: "Mom", value: formatNum(lastNumber(mom) ?? NaN, 3) },
      ...fwd(bars, signals),
    ],
  };
}

export function vwapZscore(bars: Bar[], reset: number, win: number, z: number): AlgoResult {
  const vw = vwapReset(bars, reset);
  const tp = bars.map((b) => (b.h + b.l + b.c) / 3);
  const diff = tp.map((v, i) => (vw[i] == null ? null : v - vw[i]!));
  const sd = stdev(diff, win);
  const zs = diff.map((v, i) => (v == null || sd[i] == null || sd[i] === 0 ? null : v / sd[i]!));
  const signals: Signal[] = [];
  for (let i = 1; i < bars.length; i++) {
    if (zs[i] == null || zs[i - 1] == null) continue;
    if (zs[i]! < -z && zs[i - 1]! >= -z) signals.push({ i, side: "buy", price: bars[i]!.c, note: "Z fade" });
    if (zs[i]! > z && zs[i - 1]! <= z) signals.push({ i, side: "sell", price: bars[i]!.c, note: "Z fade" });
  }
  return {
    overlays: [
      { kind: "line", id: "vwap", label: "VWAP", color: C.warn, values: vw, width: 1.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "z",
        label: "VWAP Z",
        min: -3,
        max: 3,
        zero: 0,
        guides: [-z, 0, z],
        series: [{ id: "z", color: C.primary, values: zs }],
      },
    ],
    signals,
    stats: [{ label: "Z", value: formatNum(lastNumber(zs) ?? NaN, 2) }, ...fwd(bars, signals, 6)],
  };
}

export function vwapReclaim(bars: Bar[], reset: number): AlgoResult {
  const vw = vwapReset(bars, reset);
  const c = closes(bars);
  const signals: Signal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (vw[i] == null || vw[i - 1] == null || vw[i - 2] == null) continue;
    const dipped = c[i - 1]! < vw[i - 1]! && c[i - 2]! >= vw[i - 2]!;
    if (dipped && c[i]! > vw[i]!) signals.push({ i, side: "buy", price: c[i]!, note: "Reclaim" });
    const popped = c[i - 1]! > vw[i - 1]! && c[i - 2]! <= vw[i - 2]!;
    if (popped && c[i]! < vw[i]!) signals.push({ i, side: "sell", price: c[i]!, note: "Reject" });
  }
  return {
    overlays: [
      { kind: "line", id: "vwap", label: "VWAP", color: C.warn, values: vw, width: 1.7 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "VWAP", value: formatNum(lastNumber(vw) ?? NaN) }, ...fwd(bars, signals, 6)],
  };
}

export function e0v1e(bars: Bar[], fast: number, slow: number, reset: number): AlgoResult {
  const c = closes(bars);
  const e1 = ema(c, fast);
  const e2 = ema(c, slow);
  const vw = vwapReset(bars, reset);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (e1[i] == null || e2[i] == null || vw[i] == null) continue;
    const bull = e1[i]! > e2[i]! && c[i]! > vw[i]!;
    const bear = e1[i]! < e2[i]! && c[i]! < vw[i]!;
    if (bull && c[i - 1]! < e1[i - 1]! && c[i]! > e1[i]!)
      signals.push({ i, side: "buy", price: c[i]!, note: "Reclaim EMA" });
    if (bear && c[i - 1]! > e1[i - 1]! && c[i]! < e1[i]!)
      signals.push({ i, side: "sell", price: c[i]!, note: "Reject EMA" });
  }
  return {
    overlays: [
      { kind: "line", id: "e1", label: `EMA ${fast}`, color: C.up, values: e1, width: 1.3 },
      { kind: "line", id: "e2", label: `EMA ${slow}`, color: C.down, values: e2, width: 1.4 },
      { kind: "line", id: "vw", label: "VWAP", color: C.warn, values: vw, width: 1.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Stack", value: (lastNumber(e1) ?? 0) > (lastNumber(e2) ?? 0) ? "EMA bull" : "EMA bear" },
      ...fwd(bars, signals, 6),
    ],
  };
}

export function stochRsi(bars: Bar[], rsiN: number, kN: number, dN: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, rsiN);
  const n = c.length;
  const raw: Array<number | null> = Array(n).fill(null);
  const rNum = r.map((v) => v ?? 50);
  for (let i = kN; i < n; i++) {
    if (r[i] == null) continue;
    const hh = highest(rNum, kN, i);
    const ll = lowest(rNum, kN, i);
    raw[i] = hh === ll ? 50 : ((r[i]! - ll) / (hh - ll)) * 100;
  }
  const k = sma(raw, 3);
  const d = sma(k, dN);
  const signals = cross(k, d, c).filter((s) => {
    const kv = k[s.i];
    if (kv == null) return false;
    return s.side === "buy" ? kv < 25 : kv > 75;
  });
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "srsi",
        label: "Stoch RSI",
        min: 0,
        max: 100,
        guides: [20, 80],
        series: [
          { id: "%K", color: C.primary, values: k },
          { id: "%D", color: C.down, values: d },
        ],
      },
    ],
    signals,
    stats: [{ label: "StochRSI", value: formatNum(lastNumber(k) ?? NaN, 1) }, ...fwd(bars, signals)],
  };
}

export function rsi7Mom(bars: Bar[], period: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, period);
  const emaR = ema(r, 5);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (r[i] == null || emaR[i] == null) continue;
    if (r[i - 1]! <= 50 && r[i]! > 50 && r[i]! > (emaR[i] ?? 0))
      signals.push({ i, side: "buy", price: c[i]! });
    if (r[i - 1]! >= 50 && r[i]! < 50 && r[i]! < (emaR[i] ?? 100))
      signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "rsi",
        label: `RSI ${period}`,
        min: 0,
        max: 100,
        guides: [50],
        series: [
          { id: "rsi", color: C.primary, values: r },
          { id: "ema", color: C.muted, values: emaR },
        ],
      },
    ],
    signals,
    stats: [{ label: `RSI ${period}`, value: formatNum(lastNumber(r) ?? NaN, 1) }, ...fwd(bars, signals, 7)],
  };
}

export function weinstein(bars: Bar[], maN: number, slopeN: number): AlgoResult {
  const c = closes(bars);
  const ma = sma(c, maN);
  const vol = sma(
    bars.map((b) => b.v),
    maN,
  );
  const stage: Array<number | null> = Array(c.length).fill(null);
  const signals: Signal[] = [];
  for (let i = maN + slopeN; i < c.length; i++) {
    if (ma[i] == null || ma[i - slopeN] == null || vol[i] == null) continue;
    const slope = ma[i]! - ma[i - slopeN]!;
    const above = c[i]! > ma[i]!;
    const volUp = bars[i]!.v > vol[i]!;
    let s = 1;
    if (above && slope > 0) s = volUp ? 2 : 2;
    else if (above && slope <= 0) s = 3;
    else if (!above && slope < 0) s = 4;
    else s = 1;
    stage[i] = s;
    if (stage[i - 1] != null && stage[i - 1] !== 2 && s === 2)
      signals.push({ i, side: "buy", price: c[i]!, note: "Stage 2" });
    if (stage[i - 1] === 2 && s >= 3)
      signals.push({ i, side: "sell", price: c[i]!, note: `Stage ${s}` });
  }
  const last = lastNumber(stage);
  const label = last === 2 ? "Stage 2 — advancing" : last === 3 ? "Stage 3 — topping" : last === 4 ? "Stage 4 — declining" : "Stage 1 — basing";
  return {
    overlays: [
      { kind: "line", id: "ma", label: `SMA ${maN}`, color: C.primary, values: ma, width: 1.7 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "stage",
        label: "Weinstein stage",
        min: 0,
        max: 5,
        guides: [2],
        series: [{ id: "st", color: C.warn, values: stage, type: "hist", histColors: stage.map((v) => (v === 2 ? C.up : v === 4 ? C.down : C.muted)) }],
      },
    ],
    signals,
    stats: [
      { label: "Pha", value: label },
      { label: "SMA", value: formatNum(lastNumber(ma) ?? NaN) },
      ...fwd(bars, signals, 20),
    ],
  };
}

export function tpMr(bars: Bar[], fast: number, slow: number, bbN: number, rsiN: number): AlgoResult {
  const c = closes(bars);
  const eF = ema(c, fast);
  const eS = ema(c, slow);
  const mid = sma(c, bbN);
  const sd = stdev(c, bbN);
  const upper = mid.map((v, i) => (v == null || sd[i] == null ? null : v + 2 * sd[i]!));
  const lower = mid.map((v, i) => (v == null || sd[i] == null ? null : v - 2 * sd[i]!));
  const r = rsi(c, rsiN);
  const signals: Signal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (eF[i] == null || eS[i] == null || r[i] == null) continue;
    const trendUp = eF[i]! > eS[i]!;
    const trendDn = eF[i]! < eS[i]!;
    if (trendUp && c[i - 1]! <= eF[i - 1]! && c[i]! > eF[i]! && r[i]! < 55)
      signals.push({ i, side: "buy", price: c[i]!, note: "TP" });
    if (trendDn && c[i - 1]! >= eF[i - 1]! && c[i]! < eF[i]! && r[i]! > 45)
      signals.push({ i, side: "sell", price: c[i]!, note: "TP" });
    const rangeLike = Math.abs(eF[i]! - eS[i]!) / c[i]! < 0.012;
    if (rangeLike && lower[i] != null && c[i]! < lower[i]! && r[i]! < 30)
      signals.push({ i, side: "buy", price: c[i]!, note: "MR" });
    if (rangeLike && upper[i] != null && c[i]! > upper[i]! && r[i]! > 70)
      signals.push({ i, side: "sell", price: c[i]!, note: "MR" });
  }
  return {
    overlays: [
      { kind: "line", id: "ef", label: `EMA ${fast}`, color: C.up, values: eF, width: 1.3 },
      { kind: "line", id: "es", label: `EMA ${slow}`, color: C.down, values: eS, width: 1.5 },
      {
        kind: "band",
        id: "bb",
        label: "BB",
        upper,
        lower,
        mid,
        fill: "rgba(168,184,200,0.08)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "rsi",
        label: `RSI ${rsiN}`,
        min: 0,
        max: 100,
        guides: [30, 70],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [
      { label: "Mode", value: (lastNumber(eF) ?? 0) > (lastNumber(eS) ?? 0) ? "TP tăng" : "TP giảm" },
      ...fwd(bars, signals),
    ],
  };
}

export function orb(bars: Bar[], session: number, rangeN: number): AlgoResult {
  const n = bars.length;
  const upper: Array<number | null> = Array(n).fill(null);
  const lower: Array<number | null> = Array(n).fill(null);
  const signals: Signal[] = [];
  for (let i = 0; i < n; i++) {
    const pos = i % session;
    const start = i - pos;
    const end = Math.min(start + rangeN - 1, i);
    let hh = -Infinity;
    let ll = Infinity;
    for (let k = start; k <= end; k++) {
      hh = Math.max(hh, bars[k]!.h);
      ll = Math.min(ll, bars[k]!.l);
    }
    upper[i] = hh;
    lower[i] = ll;
    if (pos === rangeN) {
      if (bars[i]!.c > hh) signals.push({ i, side: "buy", price: bars[i]!.c, note: "ORB" });
      if (bars[i]!.c < ll) signals.push({ i, side: "sell", price: bars[i]!.c, note: "ORB" });
    } else if (pos > rangeN && upper[i - 1] != null) {
      if (bars[i - 1]!.c <= upper[i - 1]! && bars[i]!.c > upper[i]!)
        signals.push({ i, side: "buy", price: bars[i]!.c, note: "ORB late" });
      if (bars[i - 1]!.c >= lower[i - 1]! && bars[i]!.c < lower[i]!)
        signals.push({ i, side: "sell", price: bars[i]!.c, note: "ORB late" });
    }
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "orb",
        label: "Opening range",
        upper,
        lower,
        fill: "rgba(196,184,168,0.10)",
        upperColor: C.warn,
        lowerColor: C.warn,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "OR high", value: formatNum(lastNumber(upper) ?? NaN) },
      { label: "OR low", value: formatNum(lastNumber(lower) ?? NaN) },
      ...fwd(bars, signals, 8),
    ],
  };
}

export function tsm(bars: Bar[], lookback: number): AlgoResult {
  const c = closes(bars);
  const mom: Array<number | null> = Array(c.length).fill(null);
  const signals: Signal[] = [];
  for (let i = lookback; i < c.length; i++) {
    const ret = c[i]! / c[i - lookback]! - 1;
    mom[i] = ret;
    const prev = mom[i - 1];
    if (prev == null) continue;
    if (prev <= 0 && ret > 0) signals.push({ i, side: "buy", price: c[i]!, note: "TSMOM+" });
    if (prev >= 0 && ret < 0) signals.push({ i, side: "sell", price: c[i]!, note: "TSMOM−" });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "tsm",
        label: "Time-series momentum",
        min: -0.3,
        max: 0.3,
        zero: 0,
        series: [{ id: "m", color: C.primary, values: mom }],
      },
    ],
    signals,
    stats: [
      { label: "TSMOM", value: formatPct(lastNumber(mom) ?? NaN) },
      { label: "Bias", value: (lastNumber(mom) ?? 0) > 0 ? "Long" : "Short" },
      ...fwd(bars, signals, lookback / 4),
    ],
  };
}

export function week52(bars: Bar[], lookback: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const hh: Array<number | null> = Array(n).fill(null);
  const ll: Array<number | null> = Array(n).fill(null);
  const signals: Signal[] = [];
  for (let i = lookback; i < n; i++) {
    hh[i] = highest(H, lookback, i - 1);
    ll[i] = lowest(L, lookback, i - 1);
    if (bars[i]!.c > hh[i]!) signals.push({ i, side: "buy", price: bars[i]!.c, note: "High mới" });
    if (bars[i]!.c < ll[i]!) signals.push({ i, side: "sell", price: bars[i]!.c, note: "Low mới" });
  }
  return {
    overlays: [
      { kind: "line", id: "hh", label: "High N", color: C.up, values: hh, dashed: true, width: 1 },
      { kind: "line", id: "ll", label: "Low N", color: C.down, values: ll, dashed: true, width: 1 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "High", value: formatNum(lastNumber(hh) ?? NaN) },
      ...fwd(bars, signals, 15),
    ],
  };
}

export function maGravity(bars: Bar[], maN: number, band: number): AlgoResult {
  const c = closes(bars);
  const ma = sma(c, maN);
  const dist = c.map((v, i) => (ma[i] == null || ma[i] === 0 ? null : (v - ma[i]!) / ma[i]!));
  const upper = ma.map((v) => (v == null ? null : v * (1 + band)));
  const lower = ma.map((v) => (v == null ? null : v * (1 - band)));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (lower[i] == null || upper[i] == null || ma[i] == null) continue;
    if (c[i]! <= lower[i]! && c[i - 1]! > (lower[i - 1] ?? c[i - 1]!))
      signals.push({ i, side: "buy", price: c[i]!, note: "Stretch" });
    if (c[i]! >= upper[i]! && c[i - 1]! < (upper[i - 1] ?? c[i - 1]!))
      signals.push({ i, side: "sell", price: c[i]!, note: "Stretch" });
    if (c[i - 1]! < ma[i - 1]! && c[i]! >= ma[i]!)
      signals.push({ i, side: "buy", price: c[i]!, note: "Tag MA" });
    if (c[i - 1]! > ma[i - 1]! && c[i]! <= ma[i]!)
      signals.push({ i, side: "sell", price: c[i]!, note: "Lose MA" });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "g",
        label: "MA gravity",
        upper,
        lower,
        mid: ma,
        fill: "rgba(168,184,200,0.10)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "dist",
        label: "Distance %",
        min: -0.15,
        max: 0.15,
        zero: 0,
        series: [{ id: "d", color: C.primary, values: dist }],
      },
    ],
    signals,
    stats: [
      { label: `SMA ${maN}`, value: formatNum(lastNumber(ma) ?? NaN) },
      { label: "Dist", value: formatPct(lastNumber(dist) ?? NaN) },
      ...fwd(bars, signals, 10),
    ],
  };
}

export function turnOfMonth(bars: Bar[], maN: number): AlgoResult {
  const c = closes(bars);
  const ma = sma(c, maN);
  const tom: Array<number | null> = Array(c.length).fill(null);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    const d = new Date(bars[i]!.t);
    const day = d.getUTCDate();
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    const on = day >= last - 1 || day <= 3;
    tom[i] = on ? 1 : 0;
    const prev = new Date(bars[i - 1]!.t);
    const prevOn =
      prev.getUTCDate() >= new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 0)).getUTCDate() - 1 ||
      prev.getUTCDate() <= 3;
    if (on && !prevOn && ma[i] != null && c[i]! > ma[i]!)
      signals.push({ i, side: "buy", price: c[i]!, note: "ToM" });
    if (!on && prevOn) signals.push({ i, side: "sell", price: c[i]!, note: "Hết cửa sổ" });
  }
  return {
    overlays: [
      { kind: "line", id: "ma", label: `SMA ${maN}`, color: C.primary, values: ma, width: 1.4 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "tom",
        label: "Cửa sổ ToM",
        min: 0,
        max: 1.2,
        series: [{ id: "tom", color: C.warn, values: tom, type: "hist", histColors: tom.map((v) => (v ? C.warn : null)) }],
      },
    ],
    signals,
    stats: [
      { label: "ToM", value: lastNumber(tom) === 1 ? "Trong cửa sổ" : "Ngoài" },
      ...fwd(bars, signals, 8),
    ],
  };
}

export function turtleSoup(bars: Bar[], don: number, fail: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const c = closes(bars);
  const hh: Array<number | null> = Array(n).fill(null);
  const ll: Array<number | null> = Array(n).fill(null);
  const signals: Signal[] = [];
  let lastHighI = -99;
  let lastLowI = -99;
  let lastHigh = 0;
  let lastLow = 0;
  for (let i = don; i < n; i++) {
    hh[i] = highest(H, don, i - 1);
    ll[i] = lowest(L, don, i - 1);
    if (c[i]! > hh[i]!) {
      lastHighI = i;
      lastHigh = hh[i]!;
    } else if (lastHighI >= 0 && i - lastHighI <= fail && c[i]! < lastHigh) {
      signals.push({ i, side: "sell", price: c[i]!, note: "Soup fade high" });
      lastHighI = -99;
    }
    if (c[i]! < ll[i]!) {
      lastLowI = i;
      lastLow = ll[i]!;
    } else if (lastLowI >= 0 && i - lastLowI <= fail && c[i]! > lastLow) {
      signals.push({ i, side: "buy", price: c[i]!, note: "Soup fade low" });
      lastLowI = -99;
    }
  }
  return {
    overlays: [
      { kind: "line", id: "hh", label: `Don ${don} H`, color: C.up, values: hh, dashed: true, width: 1 },
      { kind: "line", id: "ll", label: `Don ${don} L`, color: C.down, values: ll, dashed: true, width: 1 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "Donchian", value: String(don) }, ...fwd(bars, signals, 8)],
  };
}

export function rsiBbFade(bars: Bar[], rsiN: number, bbN: number, k: number, os: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, rsiN);
  const mid = sma(c, bbN);
  const sd = stdev(c, bbN);
  const upper = mid.map((v, i) => (v == null || sd[i] == null ? null : v + k * sd[i]!));
  const lower = mid.map((v, i) => (v == null || sd[i] == null ? null : v - k * sd[i]!));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (r[i] == null || lower[i] == null || upper[i] == null) continue;
    if (c[i]! <= lower[i]! && r[i]! < os) signals.push({ i, side: "buy", price: c[i]!, note: "RSI+BB" });
    if (c[i]! >= upper[i]! && r[i]! > 100 - os) signals.push({ i, side: "sell", price: c[i]!, note: "RSI+BB" });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "bb",
        label: "BB",
        upper,
        lower,
        mid,
        fill: "rgba(168,184,200,0.12)",
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "rsi",
        label: `RSI ${rsiN}`,
        min: 0,
        max: 100,
        guides: [os, 100 - os],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [{ label: "RSI", value: formatNum(lastNumber(r) ?? NaN, 1) }, ...fwd(bars, signals, 6)],
  };
}
