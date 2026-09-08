export function sma(values: Array<number | null>, n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      out[i] = null;
      continue;
    }
    sum += v;
    count += 1;
    if (count > n) {
      const old = values[i - n];
      if (old != null) {
        sum -= old;
        count -= 1;
      }
    }
    if (i >= n - 1) {
      let s = 0;
      let c = 0;
      for (let k = i - n + 1; k <= i; k++) {
        const x = values[k];
        if (x != null) {
          s += x;
          c += 1;
        }
      }
      out[i] = c === n ? s / n : null;
    }
  }
  return out;
}

export function ema(values: Array<number | null>, n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  const k = 2 / (n + 1);
  let prev: number | null = null;
  let seed = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) continue;
    if (prev == null) {
      seed += v;
      count += 1;
      if (count === n) {
        prev = seed / n;
        out[i] = prev;
      }
    } else {
      prev = v * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function rma(values: Array<number | null>, n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  let prev: number | null = null;
  let seed = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) continue;
    if (prev == null) {
      seed += v;
      count += 1;
      if (count === n) {
        prev = seed / n;
        out[i] = prev;
      }
    } else {
      prev = (prev * (n - 1) + v) / n;
      out[i] = prev;
    }
  }
  return out;
}

export function wma(values: Array<number | null>, n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  const denom = (n * (n + 1)) / 2;
  for (let i = n - 1; i < values.length; i++) {
    let s = 0;
    let ok = true;
    for (let k = 0; k < n; k++) {
      const v = values[i - n + 1 + k];
      if (v == null) {
        ok = false;
        break;
      }
      s += v * (k + 1);
    }
    out[i] = ok ? s / denom : null;
  }
  return out;
}

export function stdev(values: Array<number | null>, n: number): Array<number | null> {
  const out: Array<number | null> = Array(values.length).fill(null);
  for (let i = n - 1; i < values.length; i++) {
    let s = 0;
    let ok = true;
    for (let k = i - n + 1; k <= i; k++) {
      const v = values[k];
      if (v == null) {
        ok = false;
        break;
      }
      s += v;
    }
    if (!ok) continue;
    const mean = s / n;
    let vsum = 0;
    for (let k = i - n + 1; k <= i; k++) {
      const d = (values[k] as number) - mean;
      vsum += d * d;
    }
    out[i] = Math.sqrt(vsum / n);
  }
  return out;
}

export function highest(values: number[], n: number, i: number) {
  let m = -Infinity;
  const from = Math.max(0, i - n + 1);
  for (let k = from; k <= i; k++) m = Math.max(m, values[k]!);
  return m;
}

export function lowest(values: number[], n: number, i: number) {
  let m = Infinity;
  const from = Math.max(0, i - n + 1);
  for (let k = from; k <= i; k++) m = Math.min(m, values[k]!);
  return m;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function linreg(ys: number[]): { slope: number; intercept: number } {
  const n = ys.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += ys[i]!;
    sumXY += i * ys[i]!;
    sumXX += i * i;
  }
  const den = n * sumXX - sumX * sumX;
  const slope = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function change(values: number[]): Array<number | null> {
  return values.map((v, i) => (i === 0 ? null : v - values[i - 1]!));
}

export function fillNull(values: Array<number | null>, withValue = 0): number[] {
  return values.map((v) => (v == null ? withValue : v));
}

export function lastNumber(values: Array<number | null>): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (v != null) return v;
  }
  return null;
}

export function formatNum(n: number, d = 2) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function formatPct(n: number) {
  if (!Number.isFinite(n)) return "—";
  const s = (n * 100).toLocaleString("vi-VN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return `${n >= 0 ? "+" : ""}${s}%`;
}
