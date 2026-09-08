import type { AlgoResult, Bar, Overlay, Signal } from "./types";
import {
  clamp,
  ema,
  formatNum,
  formatPct,
  highest,
  lastNumber,
  linreg,
  lowest,
  rma,
  sma,
  stdev,
  wma,
} from "./math";

const C = {
  primary: "#a8b8c8",
  up: "#6a9e7c",
  down: "#c4685e",
  warn: "#c4a882",
  line3: "#c4b8a8",
  muted: "#8a8e96",
  fillUp: "rgba(106,158,124,0.14)",
  fillDn: "rgba(196,104,94,0.14)",
  fillBand: "rgba(168,184,200,0.12)",
};

function closes(bars: Bar[]) {
  return bars.map((b) => b.c);
}
function highs(bars: Bar[]) {
  return bars.map((b) => b.h);
}
function lows(bars: Bar[]) {
  return bars.map((b) => b.l);
}

export function trueRange(bars: Bar[]): number[] {
  const tr: number[] = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    if (i === 0) tr.push(b.h - b.l);
    else {
      const prev = bars[i - 1]!.c;
      tr.push(Math.max(b.h - b.l, Math.abs(b.h - prev), Math.abs(b.l - prev)));
    }
  }
  return tr;
}

export function atr(bars: Bar[], n: number): Array<number | null> {
  return rma(trueRange(bars), n);
}

export function rsi(values: number[], n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  let avgG = 0;
  let avgL = 0;
  for (let i = 1; i < values.length; i++) {
    const ch = values[i]! - values[i - 1]!;
    const g = Math.max(ch, 0);
    const l = Math.max(-ch, 0);
    if (i <= n) {
      avgG += g;
      avgL += l;
      if (i === n) {
        avgG /= n;
        avgL /= n;
        out[i] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
      }
    } else {
      avgG = (avgG * (n - 1) + g) / n;
      avgL = (avgL * (n - 1) + l) / n;
      out[i] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
    }
  }
  return out;
}

function crossoverSignals(
  a: Array<number | null>,
  b: Array<number | null>,
  price: number[],
): Signal[] {
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

function evalForward(bars: Bar[], signals: Signal[], horizon = 10) {
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

/* ── Supertrend ── */
export function supertrend(bars: Bar[], period: number, mult: number): AlgoResult {
  const n = bars.length;
  const atrV = atr(bars, period);
  const up: Array<number | null> = Array(n).fill(null);
  const dn: Array<number | null> = Array(n).fill(null);
  const st: Array<number | null> = Array(n).fill(null);
  const dir: number[] = Array(n).fill(1);
  const colors: Array<string | null> = Array(n).fill(null);

  for (let i = 0; i < n; i++) {
    const a = atrV[i];
    if (a == null) continue;
    const hl2 = (bars[i]!.h + bars[i]!.l) / 2;
    let basicUp = hl2 - mult * a;
    let basicDn = hl2 + mult * a;
    if (i === 0 || st[i - 1] == null) {
      up[i] = basicUp;
      dn[i] = basicDn;
      dir[i] = 1;
      st[i] = basicUp;
    } else {
      const prevUp = up[i - 1]!;
      const prevDn = dn[i - 1]!;
      const prevClose = bars[i - 1]!.c;
      up[i] = prevClose > prevUp ? Math.max(basicUp, prevUp) : basicUp;
      dn[i] = prevClose < prevDn ? Math.min(basicDn, prevDn) : basicDn;
      dir[i] = dir[i - 1]!;
      if (dir[i] === 1 && bars[i]!.c < up[i]!) dir[i] = -1;
      else if (dir[i] === -1 && bars[i]!.c > dn[i]!) dir[i] = 1;
      st[i] = dir[i] === 1 ? up[i] : dn[i];
    }
    colors[i] = dir[i] === 1 ? C.up : C.down;
  }

  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (st[i] == null || st[i - 1] == null) continue;
    if (dir[i] === 1 && dir[i - 1] === -1) signals.push({ i, side: "buy", price: bars[i]!.c, note: "Flip lên" });
    if (dir[i] === -1 && dir[i - 1] === 1) signals.push({ i, side: "sell", price: bars[i]!.c, note: "Flip xuống" });
  }

  const last = lastNumber(st);
  return {
    overlays: [
      { kind: "dots", id: "st", label: "Supertrend", values: st, colors, size: 2.4 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Supertrend", value: last == null ? "—" : formatNum(last) },
      { label: "Hướng", value: dir[n - 1] === 1 ? "Tăng" : "Giảm" },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── ADX / DMI ── */
export function adxDmi(bars: Bar[], period: number): AlgoResult {
  const n = bars.length;
  const plusDM: Array<number | null> = Array(n).fill(null);
  const minusDM: Array<number | null> = Array(n).fill(null);
  const tr = trueRange(bars);
  for (let i = 1; i < n; i++) {
    const upMove = bars[i]!.h - bars[i - 1]!.h;
    const dnMove = bars[i - 1]!.l - bars[i]!.l;
    plusDM[i] = upMove > dnMove && upMove > 0 ? upMove : 0;
    minusDM[i] = dnMove > upMove && dnMove > 0 ? dnMove : 0;
  }
  const atrV = rma(tr, period);
  const smPlus = rma(plusDM, period);
  const smMinus = rma(minusDM, period);
  const pdi: Array<number | null> = Array(n).fill(null);
  const mdi: Array<number | null> = Array(n).fill(null);
  const dx: Array<number | null> = Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (atrV[i] == null || smPlus[i] == null || smMinus[i] == null || atrV[i] === 0) continue;
    pdi[i] = (100 * smPlus[i]!) / atrV[i]!;
    mdi[i] = (100 * smMinus[i]!) / atrV[i]!;
    const den = pdi[i]! + mdi[i]!;
    dx[i] = den === 0 ? 0 : (100 * Math.abs(pdi[i]! - mdi[i]!)) / den;
  }
  const adx = rma(dx, period);
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (pdi[i] == null || mdi[i] == null || adx[i] == null) continue;
    if (adx[i]! < 20) continue;
    if (pdi[i - 1]! <= mdi[i - 1]! && pdi[i]! > mdi[i]!) signals.push({ i, side: "buy", price: bars[i]!.c });
    if (pdi[i - 1]! >= mdi[i - 1]! && pdi[i]! < mdi[i]!) signals.push({ i, side: "sell", price: bars[i]!.c });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "adx",
        label: "ADX / DMI",
        min: 0,
        max: 60,
        guides: [20, 25],
        series: [
          { id: "adx", color: C.primary, values: adx },
          { id: "+DI", color: C.up, values: pdi },
          { id: "-DI", color: C.down, values: mdi },
        ],
      },
    ],
    signals,
    stats: [
      { label: "ADX", value: formatNum(lastNumber(adx) ?? NaN, 1) },
      { label: "+DI", value: formatNum(lastNumber(pdi) ?? NaN, 1) },
      { label: "-DI", value: formatNum(lastNumber(mdi) ?? NaN, 1) },
      {
        label: "Pha",
        value: (lastNumber(adx) ?? 0) >= 25 ? "Có xu hướng" : "Sideway",
      },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Ichimoku ── */
export function ichimoku(bars: Bar[], tenkanN: number, kijunN: number, senkouN: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const tenkan: Array<number | null> = Array(n).fill(null);
  const kijun: Array<number | null> = Array(n).fill(null);
  const senkouB: Array<number | null> = Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (i >= tenkanN - 1) tenkan[i] = (highest(H, tenkanN, i) + lowest(L, tenkanN, i)) / 2;
    if (i >= kijunN - 1) kijun[i] = (highest(H, kijunN, i) + lowest(L, kijunN, i)) / 2;
    if (i >= senkouN - 1) senkouB[i] = (highest(H, senkouN, i) + lowest(L, senkouN, i)) / 2;
  }
  const spanA: Array<number | null> = Array(n).fill(null);
  const spanB: Array<number | null> = Array(n).fill(null);
  const chikou: Array<number | null> = Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (tenkan[i] != null && kijun[i] != null) {
      const j = i + kijunN;
      if (j < n) spanA[j] = (tenkan[i]! + kijun[i]!) / 2;
    }
    if (senkouB[i] != null) {
      const j = i + kijunN;
      if (j < n) spanB[j] = senkouB[i];
    }
    const k = i - kijunN;
    if (k >= 0) chikou[k] = bars[i]!.c;
  }
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (tenkan[i] == null || kijun[i] == null) continue;
    if (tenkan[i - 1]! <= kijun[i - 1]! && tenkan[i]! > kijun[i]!) {
      signals.push({ i, side: "buy", price: bars[i]!.c, note: "TK cross" });
    }
    if (tenkan[i - 1]! >= kijun[i - 1]! && tenkan[i]! < kijun[i]!) {
      signals.push({ i, side: "sell", price: bars[i]!.c, note: "TK cross" });
    }
  }
  return {
    overlays: [
      { kind: "cloud", id: "cloud", label: "Kumo", a: spanA, b: spanB, bull: C.fillUp, bear: C.fillDn },
      { kind: "line", id: "tenkan", label: "Tenkan", color: C.down, values: tenkan, width: 1.2 },
      { kind: "line", id: "kijun", label: "Kijun", color: C.primary, values: kijun, width: 1.2 },
      { kind: "line", id: "chikou", label: "Chikou", color: C.line3, values: chikou, width: 1, dashed: true },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Tenkan", value: formatNum(lastNumber(tenkan) ?? NaN) },
      { label: "Kijun", value: formatNum(lastNumber(kijun) ?? NaN) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── EMA ribbon ── */
export function emaRibbon(bars: Bar[], fast: number, mid: number, slow: number): AlgoResult {
  const c = closes(bars);
  const e1 = ema(c, fast);
  const e2 = ema(c, mid);
  const e3 = ema(c, slow);
  const signals = crossoverSignals(e1, e3, c);
  return {
    overlays: [
      { kind: "line", id: "e1", label: `EMA ${fast}`, color: C.up, values: e1, width: 1.2 },
      { kind: "line", id: "e2", label: `EMA ${mid}`, color: C.primary, values: e2, width: 1.2 },
      { kind: "line", id: "e3", label: `EMA ${slow}`, color: C.down, values: e3, width: 1.4 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: `EMA ${fast}`, value: formatNum(lastNumber(e1) ?? NaN) },
      { label: `EMA ${slow}`, value: formatNum(lastNumber(e3) ?? NaN) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Parabolic SAR ── */
export function parabolicSar(bars: Bar[], startAf: number, maxAf: number): AlgoResult {
  const n = bars.length;
  const sar: Array<number | null> = Array(n).fill(null);
  const colors: Array<string | null> = Array(n).fill(null);
  if (n < 3) return emptyResult();
  let bull = bars[1]!.c >= bars[0]!.c;
  let af = startAf;
  let ep = bull ? bars[0]!.h : bars[0]!.l;
  sar[0] = bull ? bars[0]!.l : bars[0]!.h;
  colors[0] = bull ? C.up : C.down;
  for (let i = 1; i < n; i++) {
    const prev = sar[i - 1]!;
    let next = prev + af * (ep - prev);
    if (bull) {
      next = Math.min(next, bars[i - 1]!.l, i > 1 ? bars[i - 2]!.l : bars[i - 1]!.l);
      if (bars[i]!.l < next) {
        bull = false;
        next = ep;
        ep = bars[i]!.l;
        af = startAf;
      } else {
        if (bars[i]!.h > ep) {
          ep = bars[i]!.h;
          af = Math.min(maxAf, af + startAf);
        }
      }
    } else {
      next = Math.max(next, bars[i - 1]!.h, i > 1 ? bars[i - 2]!.h : bars[i - 1]!.h);
      if (bars[i]!.h > next) {
        bull = true;
        next = ep;
        ep = bars[i]!.h;
        af = startAf;
      } else {
        if (bars[i]!.l < ep) {
          ep = bars[i]!.l;
          af = Math.min(maxAf, af + startAf);
        }
      }
    }
    sar[i] = next;
    colors[i] = bull ? C.up : C.down;
  }
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (colors[i] !== colors[i - 1] && sar[i] != null) {
      signals.push({
        i,
        side: colors[i] === C.up ? "buy" : "sell",
        price: bars[i]!.c,
      });
    }
  }
  return {
    overlays: [
      { kind: "dots", id: "sar", label: "PSAR", values: sar, colors, size: 2.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "SAR", value: formatNum(lastNumber(sar) ?? NaN) },
      { label: "Hướng", value: colors[n - 1] === C.up ? "Tăng" : "Giảm" },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Donchian ── */
export function donchian(bars: Bar[], period: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const upper: Array<number | null> = Array(n).fill(null);
  const lower: Array<number | null> = Array(n).fill(null);
  const mid: Array<number | null> = Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    upper[i] = highest(H, period, i);
    lower[i] = lowest(L, period, i);
    mid[i] = (upper[i]! + lower[i]!) / 2;
  }
  const signals: Signal[] = [];
  for (let i = period; i < n; i++) {
    if (upper[i - 1] != null && bars[i]!.c > upper[i - 1]!) {
      signals.push({ i, side: "buy", price: bars[i]!.c, note: "Break high" });
    }
    if (lower[i - 1] != null && bars[i]!.c < lower[i - 1]!) {
      signals.push({ i, side: "sell", price: bars[i]!.c, note: "Break low" });
    }
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "don",
        label: "Donchian",
        upper,
        lower,
        mid,
        fill: C.fillBand,
        upperColor: C.up,
        lowerColor: C.down,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Upper", value: formatNum(lastNumber(upper) ?? NaN) },
      { label: "Lower", value: formatNum(lastNumber(lower) ?? NaN) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Hull MA ── */
export function hullMa(bars: Bar[], period: number): AlgoResult {
  const c = closes(bars);
  const half = Math.max(1, Math.round(period / 2));
  const sqrtN = Math.max(1, Math.round(Math.sqrt(period)));
  const w1 = wma(c, half);
  const w2 = wma(c, period);
  const raw: Array<number | null> = c.map((_, i) =>
    w1[i] == null || w2[i] == null ? null : 2 * w1[i]! - w2[i]!,
  );
  const hma = wma(raw, sqrtN);
  const signals: Signal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (hma[i] == null || hma[i - 1] == null || hma[i - 2] == null) continue;
    const d0 = hma[i - 1]! - hma[i - 2]!;
    const d1 = hma[i]! - hma[i - 1]!;
    if (d0 <= 0 && d1 > 0) signals.push({ i, side: "buy", price: c[i]! });
    if (d0 >= 0 && d1 < 0) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      { kind: "line", id: "hma", label: "HMA", color: C.primary, values: hma, width: 1.8 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "HMA", value: formatNum(lastNumber(hma) ?? NaN) },
      { label: "Slope", value: slopeLabel(hma) },
      ...evalForward(bars, signals),
    ],
  };
}

function slopeLabel(values: Array<number | null>) {
  const a = lastNumber(values);
  let prev: number | null = null;
  let seen = 0;
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] != null) {
      seen += 1;
      if (seen === 4) {
        prev = values[i];
        break;
      }
    }
  }
  if (a == null || prev == null) return "—";
  return a >= prev ? "Dốc lên" : "Dốc xuống";
}

/* ── ALMA ── */
export function alma(bars: Bar[], period: number, offset: number, sigma: number): AlgoResult {
  const c = closes(bars);
  const out: Array<number | null> = Array(c.length).fill(null);
  const m = offset * (period - 1);
  const s = period / sigma;
  const weights: number[] = [];
  let wsum = 0;
  for (let i = 0; i < period; i++) {
    const w = Math.exp(-((i - m) * (i - m)) / (2 * s * s));
    weights.push(w);
    wsum += w;
  }
  for (let i = period - 1; i < c.length; i++) {
    let acc = 0;
    for (let k = 0; k < period; k++) acc += c[i - period + 1 + k]! * weights[k]!;
    out[i] = acc / wsum;
  }
  const signals: Signal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (out[i] == null || out[i - 1] == null || out[i - 2] == null) continue;
    const d0 = out[i - 1]! - out[i - 2]!;
    const d1 = out[i]! - out[i - 1]!;
    if (d0 <= 0 && d1 > 0) signals.push({ i, side: "buy", price: c[i]! });
    if (d0 >= 0 && d1 < 0) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      { kind: "line", id: "alma", label: "ALMA", color: C.primary, values: out, width: 1.8 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "ALMA", value: formatNum(lastNumber(out) ?? NaN) }, ...evalForward(bars, signals)],
  };
}

/* ── KAMA ── */
export function kama(bars: Bar[], period: number, fast: number, slow: number): AlgoResult {
  const c = closes(bars);
  const out: Array<number | null> = Array(c.length).fill(null);
  const fastSC = 2 / (fast + 1);
  const slowSC = 2 / (slow + 1);
  let prev: number | null = null;
  for (let i = period; i < c.length; i++) {
    const change = Math.abs(c[i]! - c[i - period]!);
    let vol = 0;
    for (let k = i - period + 1; k <= i; k++) vol += Math.abs(c[k]! - c[k - 1]!);
    const er = vol === 0 ? 0 : change / vol;
    const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
    if (prev == null) prev = c[i]!;
    prev = prev + sc * (c[i]! - prev);
    out[i] = prev;
  }
  const signals: Signal[] = [];
  for (let i = 2; i < c.length; i++) {
    if (out[i] == null || out[i - 1] == null || out[i - 2] == null) continue;
    if (out[i - 1]! <= out[i - 2]! && out[i]! > out[i - 1]!) signals.push({ i, side: "buy", price: c[i]! });
    if (out[i - 1]! >= out[i - 2]! && out[i]! < out[i - 1]!) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      { kind: "line", id: "kama", label: "KAMA", color: C.primary, values: out, width: 1.8 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "KAMA", value: formatNum(lastNumber(out) ?? NaN) }, ...evalForward(bars, signals)],
  };
}

/* ── Kalman ── */
export function kalman(bars: Bar[], q: number, r: number): AlgoResult {
  const c = closes(bars);
  const out: Array<number | null> = [];
  let x = c[0]!;
  let p = 1;
  for (let i = 0; i < c.length; i++) {
    p = p + q;
    const k = p / (p + r);
    x = x + k * (c[i]! - x);
    p = (1 - k) * p;
    out.push(x);
  }
  const residual = c.map((v, i) => v - out[i]!);
  const std = Math.sqrt(residual.reduce((s, v) => s + v * v, 0) / residual.length);
  const upper = out.map((v) => v! + 1.6 * std);
  const lower = out.map((v) => v! - 1.6 * std);
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (c[i - 1]! >= lower[i - 1]! && c[i]! < lower[i]!) signals.push({ i, side: "buy", price: c[i]! });
    if (c[i - 1]! <= upper[i - 1]! && c[i]! > upper[i]!) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "kalman",
        label: "Kalman ±1.6σ",
        upper,
        lower,
        mid: out,
        fill: C.fillBand,
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Ước lượng", value: formatNum(x) },
      { label: "σ residual", value: formatNum(std) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Nadaraya–Watson ── */
export function nadarayaWatson(bars: Bar[], bandwidth: number, mult: number): AlgoResult {
  const c = closes(bars);
  const n = c.length;
  const y: number[] = Array(n).fill(0);
  const h = Math.max(1, bandwidth);
  for (let i = 0; i < n; i++) {
    let num = 0;
    let den = 0;
    const from = Math.max(0, i - Math.ceil(h * 4));
    const to = Math.min(n - 1, i + Math.ceil(h * 4));
    for (let j = from; j <= to; j++) {
      const u = (i - j) / h;
      const k = Math.exp(-0.5 * u * u);
      num += k * c[j]!;
      den += k;
    }
    y[i] = den === 0 ? c[i]! : num / den;
  }
  const res = c.map((v, i) => v - y[i]!);
  const mae = res.reduce((s, v) => s + Math.abs(v), 0) / n;
  const upper = y.map((v) => v + mult * mae);
  const lower = y.map((v) => v - mult * mae);
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (c[i - 1]! >= lower[i - 1]! && c[i]! < lower[i]!) signals.push({ i, side: "buy", price: c[i]! });
    if (c[i - 1]! <= upper[i - 1]! && c[i]! > upper[i]!) signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "nw",
        label: "Nadaraya–Watson",
        upper,
        lower,
        mid: y,
        fill: C.fillBand,
        upperColor: C.primary,
        lowerColor: C.primary,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Kernel", value: formatNum(y[n - 1]!) },
      { label: "MAE", value: formatNum(mae) },
      ...evalForward(bars, signals),
    ],
    note: "Kernel hai phía nên đường giữa có độ trễ thấp ở giữa chuỗi, mép phải vẫn phụ thuộc nến mới.",
  };
}

/* ── Linear regression channel ── */
export function linregChannel(bars: Bar[], period: number, k: number): AlgoResult {
  const c = closes(bars);
  const n = c.length;
  const mid: Array<number | null> = Array(n).fill(null);
  const upper: Array<number | null> = Array(n).fill(null);
  const lower: Array<number | null> = Array(n).fill(null);
  for (let i = period - 1; i < n; i++) {
    const window = c.slice(i - period + 1, i + 1);
    const { slope, intercept } = linreg(window);
    const fit = intercept + slope * (period - 1);
    let sse = 0;
    for (let t = 0; t < period; t++) {
      const f = intercept + slope * t;
      const d = window[t]! - f;
      sse += d * d;
    }
    const sd = Math.sqrt(sse / period);
    mid[i] = fit;
    upper[i] = fit + k * sd;
    lower[i] = fit - k * sd;
  }
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (lower[i] == null || upper[i] == null) continue;
    if (c[i]! < lower[i]! && c[i - 1]! >= (lower[i - 1] ?? lower[i]!))
      signals.push({ i, side: "buy", price: c[i]! });
    if (c[i]! > upper[i]! && c[i - 1]! <= (upper[i - 1] ?? upper[i]!))
      signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "lr",
        label: "LinReg",
        upper,
        lower,
        mid,
        fill: C.fillBand,
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Fit", value: formatNum(lastNumber(mid) ?? NaN) },
      { label: "Slope", value: slopeLabel(mid) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── ZigZag ── */
export function zigzag(bars: Bar[], pct: number): AlgoResult {
  const points = zigzagPoints(bars, pct / 100);
  const signals: Signal[] = [];
  for (let p = 1; p < points.length; p++) {
    const cur = points[p]!;
    const prev = points[p - 1]!;
    signals.push({
      i: cur.i,
      side: cur.price < prev.price ? "buy" : "sell",
      price: cur.price,
      note: "Pivot",
    });
  }
  return {
    overlays: [
      { kind: "zigzag", id: "zz", label: "ZigZag", points, color: C.primary },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Số pivot", value: String(points.length) },
      { label: "Swing cuối", value: points.length ? formatNum(points[points.length - 1]!.price) : "—" },
      ...evalForward(bars, signals),
    ],
  };
}

export function zigzagPoints(bars: Bar[], threshold: number): Array<{ i: number; price: number }> {
  if (bars.length === 0) return [];
  const pts: Array<{ i: number; price: number }> = [{ i: 0, price: bars[0]!.c }];
  let dir = 0;
  let extreme = bars[0]!.c;
  let extremeI = 0;
  for (let i = 1; i < bars.length; i++) {
    const p = bars[i]!.c;
    if (dir === 0) {
      if (p >= extreme * (1 + threshold)) {
        dir = 1;
        extreme = p;
        extremeI = i;
      } else if (p <= extreme * (1 - threshold)) {
        dir = -1;
        extreme = p;
        extremeI = i;
      }
    } else if (dir === 1) {
      if (p > extreme) {
        extreme = p;
        extremeI = i;
      } else if (p <= extreme * (1 - threshold)) {
        pts.push({ i: extremeI, price: extreme });
        dir = -1;
        extreme = p;
        extremeI = i;
      }
    } else {
      if (p < extreme) {
        extreme = p;
        extremeI = i;
      } else if (p >= extreme * (1 + threshold)) {
        pts.push({ i: extremeI, price: extreme });
        dir = 1;
        extreme = p;
        extremeI = i;
      }
    }
  }
  pts.push({ i: extremeI, price: extreme });
  return pts;
}

/* ── Market structure ── */
export function marketStructure(bars: Bar[], pct: number): AlgoResult {
  const pts = zigzagPoints(bars, pct / 100);
  const signals: Signal[] = [];
  for (let i = 3; i < pts.length; i++) {
    const a = pts[i - 3]!;
    const b = pts[i - 2]!;
    const c = pts[i - 1]!;
    const d = pts[i]!;
    const up = b.price > a.price && d.price > b.price && c.price > a.price;
    const dn = b.price < a.price && d.price < b.price && c.price < a.price;
    if (up && d.price < c.price && bars[d.i]!.c < c.price) {
      signals.push({ i: d.i, side: "sell", price: bars[d.i]!.c, note: "CHoCH" });
    }
    if (dn && d.price > c.price && bars[d.i]!.c > c.price) {
      signals.push({ i: d.i, side: "buy", price: bars[d.i]!.c, note: "CHoCH" });
    }
  }
  const last = pts.slice(-4);
  let bias = "Chưa rõ";
  if (last.length >= 4) {
    const [p0, p1, p2, p3] = last as [
      { i: number; price: number },
      { i: number; price: number },
      { i: number; price: number },
      { i: number; price: number },
    ];
    if (p1.price > p0.price && p3.price > p1.price && p2.price > p0.price) bias = "HH / HL — tăng";
    else if (p1.price < p0.price && p3.price < p1.price && p2.price < p0.price) bias = "LH / LL — giảm";
  }
  return {
    overlays: [
      { kind: "zigzag", id: "ms", label: "Swing", points: pts, color: C.warn },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "Cấu trúc", value: bias },
      { label: "Swings", value: String(pts.length) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Pivot points ── */
export function pivotPoints(bars: Bar[], lookback: number): AlgoResult {
  const n = bars.length;
  const w = Math.min(lookback, n);
  const slice = bars.slice(n - w);
  const H = Math.max(...slice.map((b) => b.h));
  const L = Math.min(...slice.map((b) => b.l));
  const Cl = slice[slice.length - 1]!.c;
  const P = (H + L + Cl) / 3;
  const R1 = 2 * P - L;
  const S1 = 2 * P - H;
  const R2 = P + (H - L);
  const S2 = P - (H - L);
  const R3 = H + 2 * (P - L);
  const S3 = L - 2 * (H - P);
  const levels: Overlay = {
    kind: "levels",
    id: "pivots",
    label: "Pivots",
    levels: [
      { price: R3, label: "R3", color: C.down },
      { price: R2, label: "R2", color: C.down, dashed: true },
      { price: R1, label: "R1", color: C.down },
      { price: P, label: "P", color: C.primary },
      { price: S1, label: "S1", color: C.up },
      { price: S2, label: "S2", color: C.up, dashed: true },
      { price: S3, label: "S3", color: C.up },
    ],
  };
  const last = bars[n - 1]!.c;
  let zone = "Quanh P";
  if (last > R1) zone = "Trên R1 — mở rộng";
  else if (last < S1) zone = "Dưới S1 — mở rộng";
  return {
    overlays: [levels],
    oscillators: [],
    signals: [],
    stats: [
      { label: "Pivot", value: formatNum(P) },
      { label: "Vùng", value: zone },
      { label: "R1 / S1", value: `${formatNum(R1)} / ${formatNum(S1)}` },
    ],
  };
}

/* ── RSI + divergence ── */
export function rsiDiv(bars: Bar[], period: number, zzPct: number): AlgoResult {
  const c = closes(bars);
  const r = rsi(c, period);
  const pts = zigzagPoints(bars, zzPct / 100);
  const signals: Signal[] = [];
  for (let i = 2; i < pts.length; i++) {
    const a = pts[i - 2]!;
    const b = pts[i]!;
    const ra = r[a.i];
    const rb = r[b.i];
    if (ra == null || rb == null) continue;
    if (b.price > a.price && rb < ra && rb > 50) {
      signals.push({ i: b.i, side: "sell", price: b.price, note: "Phân kỳ âm" });
    }
    if (b.price < a.price && rb > ra && rb < 50) {
      signals.push({ i: b.i, side: "buy", price: b.price, note: "Phân kỳ dương" });
    }
  }
  for (let i = 1; i < r.length; i++) {
    if (r[i] == null || r[i - 1] == null) continue;
    if (r[i - 1]! < 30 && r[i]! >= 30) signals.push({ i, side: "buy", price: c[i]!, note: "RSI thoát oversold" });
    if (r[i - 1]! > 70 && r[i]! <= 70) signals.push({ i, side: "sell", price: c[i]!, note: "RSI thoát overbought" });
  }
  return {
    overlays: [
      { kind: "zigzag", id: "zz", label: "Swing", points: pts, color: C.muted },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "rsi",
        label: "RSI",
        min: 0,
        max: 100,
        guides: [30, 50, 70],
        series: [{ id: "rsi", color: C.primary, values: r }],
      },
    ],
    signals,
    stats: [
      { label: "RSI", value: formatNum(lastNumber(r) ?? NaN, 1) },
      { label: "Phân kỳ", value: String(signals.filter((s) => s.note?.includes("Phân kỳ")).length) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Fisher ── */
export function fisherTransform(bars: Bar[], period: number): AlgoResult {
  const n = bars.length;
  const mid = bars.map((b) => (b.h + b.l) / 2);
  const fish: Array<number | null> = Array(n).fill(null);
  const trig: Array<number | null> = Array(n).fill(null);
  let value = 0;
  let prevFish = 0;
  for (let i = period; i < n; i++) {
    let mx = -Infinity;
    let mn = Infinity;
    for (let k = i - period + 1; k <= i; k++) {
      mx = Math.max(mx, mid[k]!);
      mn = Math.min(mn, mid[k]!);
    }
    const range = mx - mn;
    let x = range === 0 ? 0 : 2 * ((mid[i]! - mn) / range - 0.5);
    x = clamp(x, -0.999, 0.999);
    value = 0.33 * x + 0.67 * value;
    value = clamp(value, -0.999, 0.999);
    const f = 0.5 * Math.log((1 + value) / (1 - value)) + 0.5 * prevFish;
    fish[i] = f;
    trig[i] = prevFish;
    prevFish = f;
  }
  const signals = crossoverSignals(fish, trig, closes(bars));
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "fisher",
        label: "Fisher",
        min: -4,
        max: 4,
        zero: 0,
        guides: [-1.5, 0, 1.5],
        series: [
          { id: "fish", color: C.primary, values: fish },
          { id: "trig", color: C.muted, values: trig },
        ],
      },
    ],
    signals,
    stats: [
      { label: "Fisher", value: formatNum(lastNumber(fish) ?? NaN, 2) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── MACD ── */
export function macd(bars: Bar[], fast: number, slow: number, signal: number): AlgoResult {
  const c = closes(bars);
  const eFast = ema(c, fast);
  const eSlow = ema(c, slow);
  const line: Array<number | null> = c.map((_, i) =>
    eFast[i] == null || eSlow[i] == null ? null : eFast[i]! - eSlow[i]!,
  );
  const sigLine = ema(line, signal);
  const hist: Array<number | null> = line.map((v, i) =>
    v == null || sigLine[i] == null ? null : v - sigLine[i]!,
  );
  const histColors = hist.map((v) => (v == null ? null : v >= 0 ? C.up : C.down));
  const signals = crossoverSignals(line, sigLine, c);
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "macd",
        label: "MACD",
        min: -4,
        max: 4,
        zero: 0,
        series: [
          { id: "hist", color: C.muted, values: hist, type: "hist", histColors },
          { id: "macd", color: C.primary, values: line },
          { id: "signal", color: C.down, values: sigLine },
        ],
      },
    ],
    signals,
    stats: [
      { label: "MACD", value: formatNum(lastNumber(line) ?? NaN, 3) },
      { label: "Hist", value: formatNum(lastNumber(hist) ?? NaN, 3) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Stochastic ── */
export function stochastic(bars: Bar[], kN: number, dN: number): AlgoResult {
  const n = bars.length;
  const H = highs(bars);
  const L = lows(bars);
  const rawK: Array<number | null> = Array(n).fill(null);
  for (let i = kN - 1; i < n; i++) {
    const hh = highest(H, kN, i);
    const ll = lowest(L, kN, i);
    rawK[i] = hh === ll ? 50 : ((bars[i]!.c - ll) / (hh - ll)) * 100;
  }
  const k = sma(rawK, 3);
  const d = sma(k, dN);
  const signals = crossoverSignals(k, d, closes(bars)).filter((_, idx, arr) => {
    const s = arr[idx]!;
    const kv = k[s.i];
    if (kv == null) return false;
    return s.side === "buy" ? kv < 30 : kv > 70;
  });
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
    stats: [
      { label: "%K", value: formatNum(lastNumber(k) ?? NaN, 1) },
      { label: "%D", value: formatNum(lastNumber(d) ?? NaN, 1) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── CCI ── */
export function cci(bars: Bar[], period: number): AlgoResult {
  const tp = bars.map((b) => (b.h + b.l + b.c) / 3);
  const sm = sma(tp, period);
  const out: Array<number | null> = Array(bars.length).fill(null);
  for (let i = period - 1; i < bars.length; i++) {
    if (sm[i] == null) continue;
    let mad = 0;
    for (let k = i - period + 1; k <= i; k++) mad += Math.abs(tp[k]! - sm[i]!);
    mad /= period;
    out[i] = mad === 0 ? 0 : (tp[i]! - sm[i]!) / (0.015 * mad);
  }
  const signals: Signal[] = [];
  for (let i = 1; i < out.length; i++) {
    if (out[i] == null || out[i - 1] == null) continue;
    if (out[i - 1]! < -100 && out[i]! >= -100) signals.push({ i, side: "buy", price: bars[i]!.c });
    if (out[i - 1]! > 100 && out[i]! <= 100) signals.push({ i, side: "sell", price: bars[i]!.c });
  }
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "cci",
        label: "CCI",
        min: -250,
        max: 250,
        zero: 0,
        guides: [-100, 0, 100],
        series: [{ id: "cci", color: C.primary, values: out }],
      },
    ],
    signals,
    stats: [{ label: "CCI", value: formatNum(lastNumber(out) ?? NaN, 1) }, ...evalForward(bars, signals)],
  };
}

/* ── Bollinger ── */
export function bollinger(bars: Bar[], period: number, k: number): AlgoResult {
  const c = closes(bars);
  const mid = sma(c, period);
  const sd = stdev(c, period);
  const upper = mid.map((v, i) => (v == null || sd[i] == null ? null : v + k * sd[i]!));
  const lower = mid.map((v, i) => (v == null || sd[i] == null ? null : v - k * sd[i]!));
  const bw = mid.map((v, i) =>
    v == null || upper[i] == null || lower[i] == null || v === 0 ? null : (upper[i]! - lower[i]!) / v,
  );
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (lower[i] == null || upper[i] == null) continue;
    if (c[i]! < lower[i]! && c[i - 1]! >= (lower[i - 1] ?? c[i - 1]!))
      signals.push({ i, side: "buy", price: c[i]! });
    if (c[i]! > upper[i]! && c[i - 1]! <= (upper[i - 1] ?? c[i - 1]!))
      signals.push({ i, side: "sell", price: c[i]! });
  }
  return {
    overlays: [
      {
        kind: "band",
        id: "bb",
        label: "Bollinger",
        upper,
        lower,
        mid,
        fill: C.fillBand,
        upperColor: C.muted,
        lowerColor: C.muted,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [
      {
        id: "bw",
        label: "Bandwidth",
        min: 0,
        max: 0.2,
        series: [{ id: "bw", color: C.warn, values: bw }],
      },
    ],
    signals,
    stats: [
      { label: "Mid", value: formatNum(lastNumber(mid) ?? NaN) },
      { label: "BW", value: formatPct(lastNumber(bw) ?? NaN) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── Keltner ── */
export function keltner(bars: Bar[], period: number, mult: number): AlgoResult {
  const c = closes(bars);
  const mid = ema(c, period);
  const a = atr(bars, period);
  const upper = mid.map((v, i) => (v == null || a[i] == null ? null : v + mult * a[i]!));
  const lower = mid.map((v, i) => (v == null || a[i] == null ? null : v - mult * a[i]!));
  const signals: Signal[] = [];
  for (let i = 1; i < c.length; i++) {
    if (upper[i - 1] == null || lower[i - 1] == null) continue;
    if (c[i]! > upper[i - 1]!) signals.push({ i, side: "buy", price: c[i]!, note: "Close > upper" });
    if (c[i]! < lower[i - 1]!) signals.push({ i, side: "sell", price: c[i]!, note: "Close < lower" });
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
        fill: C.fillBand,
        upperColor: C.up,
        lowerColor: C.down,
      },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [
      { label: "EMA", value: formatNum(lastNumber(mid) ?? NaN) },
      { label: "ATR", value: formatNum(lastNumber(a) ?? NaN) },
      ...evalForward(bars, signals),
    ],
  };
}

/* ── ATR overlay (as trailing) ── */
export function atrTrail(bars: Bar[], period: number, mult: number): AlgoResult {
  const a = atr(bars, period);
  const c = closes(bars);
  const up = c.map((v, i) => (a[i] == null ? null : v + mult * a[i]!));
  const dn = c.map((v, i) => (a[i] == null ? null : v - mult * a[i]!));
  const pct = a.map((v, i) => (v == null || c[i] === 0 ? null : v / c[i]!));
  return {
    overlays: [
      { kind: "line", id: "up", label: "Close+ATR", color: C.down, values: up, width: 1, dashed: true },
      { kind: "line", id: "dn", label: "Close−ATR", color: C.up, values: dn, width: 1, dashed: true },
    ],
    oscillators: [
      {
        id: "atr",
        label: "ATR %",
        min: 0,
        max: 0.08,
        series: [{ id: "atr", color: C.warn, values: pct }],
      },
    ],
    signals: [],
    stats: [
      { label: "ATR", value: formatNum(lastNumber(a) ?? NaN) },
      { label: "ATR %", value: formatPct(lastNumber(pct) ?? NaN) },
    ],
  };
}

/* ── VWAP ── */
export function vwap(bars: Bar[], reset: number): AlgoResult {
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
  const signals: Signal[] = [];
  for (let i = 1; i < n; i++) {
    if (val[i] == null || val[i - 1] == null) continue;
    if (bars[i - 1]!.c <= val[i - 1]! && bars[i]!.c > val[i]!)
      signals.push({ i, side: "buy", price: bars[i]!.c });
    if (bars[i - 1]!.c >= val[i - 1]! && bars[i]!.c < val[i]!)
      signals.push({ i, side: "sell", price: bars[i]!.c });
  }
  return {
    overlays: [
      { kind: "line", id: "vwap", label: "VWAP", color: C.warn, values: val, width: 1.6 },
      { kind: "markers", id: "sig", items: signals },
    ],
    oscillators: [],
    signals,
    stats: [{ label: "VWAP", value: formatNum(lastNumber(val) ?? NaN) }, ...evalForward(bars, signals)],
  };
}

/* ── OBV ── */
export function obv(bars: Bar[]): AlgoResult {
  const out: Array<number | null> = [];
  let acc = 0;
  for (let i = 0; i < bars.length; i++) {
    if (i === 0) out.push(0);
    else {
      if (bars[i]!.c > bars[i - 1]!.c) acc += bars[i]!.v;
      else if (bars[i]!.c < bars[i - 1]!.c) acc -= bars[i]!.v;
      out.push(acc);
    }
  }
  const sm = ema(out, 21);
  const signals = crossoverSignals(out, sm, closes(bars));
  const min = Math.min(...out.map((v) => v ?? 0));
  const max = Math.max(...out.map((v) => v ?? 0));
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [
      {
        id: "obv",
        label: "OBV",
        min,
        max,
        series: [
          { id: "obv", color: C.primary, values: out },
          { id: "ema", color: C.muted, values: sm },
        ],
      },
    ],
    signals,
    stats: [{ label: "OBV", value: formatNum(lastNumber(out) ?? 0, 0) }, ...evalForward(bars, signals)],
  };
}

/* ── Heikin-Ashi ── */
export function heikinAshi(bars: Bar[]): AlgoResult {
  const ha: Bar[] = [];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i]!;
    const hc = (b.o + b.h + b.l + b.c) / 4;
    const ho = i === 0 ? (b.o + b.c) / 2 : (ha[i - 1]!.o + ha[i - 1]!.c) / 2;
    const hh = Math.max(b.h, ho, hc);
    const hl = Math.min(b.l, ho, hc);
    ha.push({ t: b.t, o: ho, h: hh, l: hl, c: hc, v: b.v });
  }
  const signals: Signal[] = [];
  for (let i = 1; i < ha.length; i++) {
    const bull = ha[i]!.c >= ha[i]!.o;
    const prev = ha[i - 1]!.c >= ha[i - 1]!.o;
    if (bull && !prev) signals.push({ i, side: "buy", price: bars[i]!.c });
    if (!bull && prev) signals.push({ i, side: "sell", price: bars[i]!.c });
  }
  const last = ha[ha.length - 1]!;
  return {
    overlays: [{ kind: "markers", id: "sig", items: signals }],
    oscillators: [],
    signals,
    stats: [
      { label: "HA", value: last.c >= last.o ? "Nến tăng" : "Nến giảm" },
      { label: "Wick ngược", value: last.c >= last.o ? formatNum(last.o - last.l) : formatNum(last.h - last.o) },
      ...evalForward(bars, signals),
    ],
    chartBars: ha,
  };
}

/* ── Fibonacci ── */
export function fibonacci(bars: Bar[], pct: number): AlgoResult {
  const pts = zigzagPoints(bars, pct / 100);
  if (pts.length < 2) return emptyResult();
  const a = pts[pts.length - 2]!;
  const b = pts[pts.length - 1]!;
  const hi = Math.max(a.price, b.price);
  const lo = Math.min(a.price, b.price);
  const up = b.price > a.price;
  const ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  const levels = ratios.map((r) => {
    const price = up ? hi - (hi - lo) * r : lo + (hi - lo) * r;
    return {
      price,
      label: `${(r * 100).toFixed(1).replace(".0", "")}%`,
      color: r === 0.618 || r === 0.5 ? C.primary : C.muted,
      dashed: r !== 0 && r !== 1 && r !== 0.618,
    };
  });
  const last = bars[bars.length - 1]!.c;
  const pos = hi === lo ? 0 : up ? (hi - last) / (hi - lo) : (last - lo) / (hi - lo);
  return {
    overlays: [
      { kind: "zigzag", id: "swing", label: "Swing", points: [a, b], color: C.warn },
      { kind: "levels", id: "fib", label: "Fib", levels },
    ],
    oscillators: [],
    signals: [],
    stats: [
      { label: "Swing", value: `${formatNum(lo)} → ${formatNum(hi)}` },
      { label: "Retrace", value: formatPct(pos) },
      { label: "0.618", value: formatNum(levels[4]!.price) },
    ],
  };
}

/* ── Hurst ── */
export function hurst(bars: Bar[], period: number): AlgoResult {
  const c = closes(bars);
  const out: Array<number | null> = Array(c.length).fill(null);
  for (let i = period; i < c.length; i++) {
    const window = c.slice(i - period, i);
    const rets = [];
    for (let k = 1; k < window.length; k++) rets.push(Math.log(window[k]! / window[k - 1]!));
    out[i] = hurstRS(rets);
  }
  const h = lastNumber(out) ?? 0.5;
  let regime = "Ngẫu nhiên";
  if (h > 0.55) regime = "Xu hướng (H>0.5)";
  if (h < 0.45) regime = "Mean-reversion (H<0.5)";
  return {
    overlays: [],
    oscillators: [
      {
        id: "hurst",
        label: "Hurst",
        min: 0.2,
        max: 0.8,
        guides: [0.45, 0.5, 0.55],
        series: [{ id: "H", color: C.primary, values: out }],
      },
    ],
    signals: [],
    stats: [
      { label: "H", value: formatNum(h, 2) },
      { label: "Chế độ", value: regime },
    ],
  };
}

function hurstRS(rets: number[]): number {
  const n = rets.length;
  if (n < 16) return 0.5;
  const mean = rets.reduce((s, v) => s + v, 0) / n;
  const dev = rets.map((v) => v - mean);
  const cum: number[] = [];
  let acc = 0;
  for (const d of dev) {
    acc += d;
    cum.push(acc);
  }
  const R = Math.max(...cum) - Math.min(...cum);
  const varr = dev.reduce((s, d) => s + d * d, 0) / n;
  const S = Math.sqrt(varr);
  if (S === 0 || R === 0) return 0.5;
  return Math.log(R / S) / Math.log(n);
}

function emptyResult(): AlgoResult {
  return { overlays: [], oscillators: [], signals: [], stats: [] };
}

export const COLORS = C;
