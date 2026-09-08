import { rsi } from "./indicators";
import { sma, stdev, wma } from "./math";
import type { Bar, Scenario } from "./types";

export type FillMode = "next_open" | "same_close";
export type KernelMode = "causal" | "twosided";

export type BtParams = {
  kernel: KernelMode;
  fill: FillMode;
  fee: number;
  slip: number;
  sl: number;
  roi: number;
  h: number;
  mult: number;
  maeSpan: number;
  q: number;
  r: number;
  kSigma: number;
  slopeSpan: number;
  slopeTh: number;
  rsiN: number;
  rsiOs: number;
  rsiOb: number;
  hmaN: number;
  warmup: number;
};

export const BT_DEFAULTS: BtParams = {
  kernel: "causal",
  fill: "next_open",
  fee: 0.0006,
  slip: 0.0002,
  sl: 0.06,
  roi: 0.05,
  h: 8,
  mult: 2,
  maeSpan: 40,
  q: 0.02,
  r: 0.8,
  kSigma: 1.6,
  slopeSpan: 5,
  slopeTh: 0.01,
  rsiN: 14,
  rsiOs: 35,
  rsiOb: 65,
  hmaN: 16,
  warmup: 80,
};

export type BtTrade = {
  tag: string;
  side: 1 | -1;
  ret: number;
  barsHeld: number;
};

export type BtSummary = {
  trades: number;
  wins: number;
  winRate: number;
  net: number;
  pf: number;
  maxDd: number;
  avgHold: number;
  fadeN: number;
  trendN: number;
};

function nwCausal(c: number[], h: number): number[] {
  const n = c.length;
  const out = new Array<number>(n);
  const hh = Math.max(h, 1);
  const radius = Math.ceil(hh * 4);
  const kern = Array.from({ length: radius + 1 }, (_, o) => Math.exp(-0.5 * (o / hh) ** 2));
  for (let i = 0; i < n; i++) {
    const span = Math.min(radius, i);
    let num = 0;
    let den = 0;
    for (let s = 0; s <= span; s++) {
      const w = kern[s]!;
      num += w * c[i - s]!;
      den += w;
    }
    out[i] = den === 0 ? c[i]! : num / den;
  }
  return out;
}

function nwTwoSided(c: number[], h: number): number[] {
  const n = c.length;
  const out = new Array<number>(n);
  const hh = Math.max(h, 1);
  const radius = Math.ceil(hh * 4);
  for (let i = 0; i < n; i++) {
    const from = Math.max(0, i - radius);
    const to = Math.min(n - 1, i + radius);
    let num = 0;
    let den = 0;
    for (let j = from; j <= to; j++) {
      const u = (i - j) / hh;
      const k = Math.exp(-0.5 * u * u);
      num += k * c[j]!;
      den += k;
    }
    out[i] = den === 0 ? c[i]! : num / den;
  }
  return out;
}

function kalman1d(z: number[], q: number, r: number): number[] {
  const n = z.length;
  const out = new Array<number>(n);
  let x = z[0] ?? 0;
  let p = 1;
  const qq = Math.max(q, 1e-9);
  const rr = Math.max(r, 1e-9);
  for (let i = 0; i < n; i++) {
    p += qq;
    const k = p / (p + rr);
    x = x + k * (z[i]! - x);
    p = (1 - k) * p;
    out[i] = x;
  }
  return out;
}

function hull(c: number[], period: number): Array<number | null> {
  const p = Math.max(period, 1);
  const half = Math.max(Math.floor(p / 2), 1);
  const sqrtn = Math.max(Math.round(Math.sqrt(p)), 1);
  const w1 = wma(c, half);
  const w2 = wma(c, p);
  const raw = c.map((_, i) => (w1[i] == null || w2[i] == null ? null : 2 * w1[i]! - w2[i]!));
  return wma(raw, sqrtn);
}

function crossedBelow(a: number, a0: number, b: number, b0: number) {
  return a0 >= b0 && a < b;
}
function crossedAbove(a: number, a0: number, b: number, b0: number) {
  return a0 <= b0 && a > b;
}

type Signal = { side: 1 | -1; tag: "fade" | "trend" };

function signalsAt(i: number, s: Series, p: BtParams): Signal | null {
  if (i < p.warmup || i < 1) return null;
  const c = s.c[i]!;
  const c0 = s.c[i - 1]!;
  const nwL = s.nwL[i];
  const nwU = s.nwU[i];
  const nwL0 = s.nwL[i - 1];
  const nwU0 = s.nwU[i - 1];
  const km = s.km[i];
  const kL = s.kL[i];
  const kU = s.kU[i];
  const rs = s.rsi[i];
  const hma = s.hma[i];
  const hma0 = s.hma[i - 1];
  const slope = s.slope[i];
  if (
    nwL == null ||
    nwU == null ||
    nwL0 == null ||
    nwU0 == null ||
    km == null ||
    kL == null ||
    kU == null ||
    rs == null ||
    hma == null ||
    hma0 == null ||
    slope == null
  )
    return null;
  const flat = Math.abs(slope) < p.slopeTh;
  const up = slope > p.slopeTh;
  const dn = slope < -p.slopeTh;
  if (flat && crossedBelow(c, c0, nwL, nwL0) && c < km && rs < p.rsiOs)
    return { side: 1, tag: "fade" };
  if (flat && crossedAbove(c, c0, nwU, nwU0) && c > km && rs > p.rsiOb)
    return { side: -1, tag: "fade" };
  if (up && crossedAbove(c, c0, nwU, nwU0) && c > km && hma > hma0) return { side: 1, tag: "trend" };
  if (dn && crossedBelow(c, c0, nwL, nwL0) && c < km && hma < hma0) return { side: -1, tag: "trend" };
  return null;
}

type Series = {
  c: number[];
  nw: number[];
  nwL: Array<number | null>;
  nwU: Array<number | null>;
  km: number[];
  kL: Array<number | null>;
  kU: Array<number | null>;
  rsi: Array<number | null>;
  hma: Array<number | null>;
  slope: Array<number | null>;
};

function buildSeries(bars: Bar[], p: BtParams): Series {
  const c = bars.map((b) => b.c);
  const nw = p.kernel === "causal" ? nwCausal(c, p.h) : nwTwoSided(c, p.h);
  const km = kalman1d(c, p.q, p.r);
  const err = c.map((v, i) => Math.abs(v - nw[i]!));
  const mae = sma(err, p.maeSpan);
  const resid = c.map((v, i) => v - km[i]!);
  const ksd = stdev(resid, p.maeSpan);
  const nwL = mae.map((m, i) => (m == null ? null : nw[i]! - p.mult * m));
  const nwU = mae.map((m, i) => (m == null ? null : nw[i]! + p.mult * m));
  const kL = ksd.map((s, i) => (s == null ? null : km[i]! - p.kSigma * s));
  const kU = ksd.map((s, i) => (s == null ? null : km[i]! + p.kSigma * s));
  const slope: Array<number | null> = nw.map((v, i) => {
    const prev = nw[i - p.slopeSpan];
    if (prev == null || prev === 0 || i < p.slopeSpan) return null;
    return v / prev - 1;
  });
  return {
    c,
    nw,
    nwL,
    nwU,
    km,
    kL,
    kU,
    rsi: rsi(c, p.rsiN),
    hma: hull(c, p.hmaN),
    slope,
  };
}

function cost(p: BtParams) {
  return p.fee + p.slip;
}

function summarize(trades: BtTrade[]): BtSummary {
  if (trades.length === 0) {
    return { trades: 0, wins: 0, winRate: 0, net: 0, pf: 0, maxDd: 0, avgHold: 0, fadeN: 0, trendN: 0 };
  }
  let eq = 1;
  let peak = 1;
  let maxDd = 0;
  let gp = 0;
  let gl = 0;
  let wins = 0;
  let hold = 0;
  let fadeN = 0;
  let trendN = 0;
  for (const t of trades) {
    eq *= 1 + t.ret;
    peak = Math.max(peak, eq);
    maxDd = Math.min(maxDd, eq / peak - 1);
    if (t.ret > 0) {
      wins += 1;
      gp += t.ret;
    } else gl += -t.ret;
    hold += t.barsHeld;
    if (t.tag === "fade") fadeN += 1;
    else trendN += 1;
  }
  return {
    trades: trades.length,
    wins,
    winRate: wins / trades.length,
    net: eq - 1,
    pf: gl === 0 ? (gp > 0 ? 99 : 0) : gp / gl,
    maxDd,
    avgHold: hold / trades.length,
    fadeN,
    trendN,
  };
}

export function backtestKernelBand(bars: Bar[], p: BtParams = BT_DEFAULTS): BtSummary {
  const s = buildSeries(bars, p);
  const n = bars.length;
  const trades: BtTrade[] = [];
  let side: 1 | -1 | 0 = 0;
  let tag: "fade" | "trend" = "fade";
  let entry = 0;
  let entryI = 0;
  let cool = -1;
  const cx = cost(p);

  const enter = (i: number, sig: Signal) => {
    const fillI = p.fill === "same_close" ? i : i + 1;
    if (fillI >= n) return;
    const px = p.fill === "same_close" ? bars[i]!.c : bars[fillI]!.o;
    side = sig.side;
    tag = sig.tag;
    entryI = fillI;
    entry = px * (1 + side * cx);
  };

  const exitAt = (i: number, price: number) => {
    if (side === 0) return;
    const px = price * (1 - side * cx);
    const ret = side * (px / entry - 1);
    trades.push({ tag, side, ret, barsHeld: Math.max(1, i - entryI) });
    side = 0;
    cool = i;
  };

  for (let i = p.warmup; i < n; i++) {
    if (side !== 0) {
      const b = bars[i]!;
      const slPx = side === 1 ? entry * (1 - p.sl) : entry * (1 + p.sl);
      const tpPx = side === 1 ? entry * (1 + p.roi) : entry * (1 - p.roi);
      const hitSl = side === 1 ? b.l <= slPx : b.h >= slPx;
      const hitTp = side === 1 ? b.h >= tpPx : b.l <= tpPx;
      if (hitSl) {
        exitAt(i, slPx);
      } else if (hitTp) {
        exitAt(i, tpPx);
      } else if (i > entryI) {
        const nw = s.nw[i]!;
        const hma = s.hma[i];
        if (tag === "fade") {
          if (side === 1 && b.c >= nw) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)]!.o);
          else if (side === -1 && b.c <= nw)
            exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)]!.o);
        } else if (hma != null) {
          if (side === 1 && b.c <= hma) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)]!.o);
          else if (side === -1 && b.c >= hma)
            exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)]!.o);
        }
      }
    }
    if (side === 0 && i > cool) {
      const sig = signalsAt(i, s, p);
      if (sig) enter(i, sig);
    }
  }
  if (side !== 0) exitAt(n - 1, bars[n - 1]!.c);
  return summarize(trades);
}

export function averageRuns(
  makeBars: (seed: number) => Bar[],
  seeds: number[],
  p: BtParams,
): BtSummary {
  const parts = seeds.map((seed) => backtestKernelBand(makeBars(seed), p));
  const n = parts.length || 1;
  const mix = parts.reduce(
    (a, b) => ({
      trades: a.trades + b.trades,
      wins: a.wins + b.wins,
      winRate: 0,
      net: a.net + b.net,
      pf: a.pf + b.pf,
      maxDd: a.maxDd + b.maxDd,
      avgHold: a.avgHold + b.avgHold,
      fadeN: a.fadeN + b.fadeN,
      trendN: a.trendN + b.trendN,
    }),
    { trades: 0, wins: 0, winRate: 0, net: 0, pf: 0, maxDd: 0, avgHold: 0, fadeN: 0, trendN: 0 },
  );
  const trades = mix.trades;
  return {
    trades: Math.round(mix.trades / n),
    wins: Math.round(mix.wins / n),
    winRate: trades ? mix.wins / trades : 0,
    net: mix.net / n,
    pf: mix.pf / n,
    maxDd: mix.maxDd / n,
    avgHold: mix.avgHold / n,
    fadeN: Math.round(mix.fadeN / n),
    trendN: Math.round(mix.trendN / n),
  };
}

export const BT_SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "range", label: "Đi ngang" },
  { id: "uptrend", label: "Tăng" },
  { id: "mixed", label: "Hỗn hợp" },
  { id: "breakout", label: "Breakout" },
];
