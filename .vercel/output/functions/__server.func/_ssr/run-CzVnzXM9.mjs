import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as cn } from "./router-CGYLWMI0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/run-CzVnzXM9.js
var import_jsx_runtime = require_jsx_runtime();
function mulberry32(seed) {
	let a = seed >>> 0;
	return function rand() {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function gaussian(rand) {
	let u = 0;
	let v = 0;
	while (u === 0) u = rand();
	while (v === 0) v = rand();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function phasesFor(scenario) {
	switch (scenario) {
		case "uptrend": return [
			{
				len: 40,
				drift: 6e-4,
				vol: .01
			},
			{
				len: 80,
				drift: .0022,
				vol: .012
			},
			{
				len: 50,
				drift: .0011,
				vol: .01
			},
			{
				len: 50,
				drift: .0028,
				vol: .014
			}
		];
		case "downtrend": return [
			{
				len: 30,
				drift: 4e-4,
				vol: .01
			},
			{
				len: 90,
				drift: -.0024,
				vol: .014
			},
			{
				len: 40,
				drift: -8e-4,
				vol: .011
			},
			{
				len: 60,
				drift: -.002,
				vol: .016
			}
		];
		case "range": return [
			{
				len: 50,
				drift: 4e-4,
				vol: .008
			},
			{
				len: 70,
				drift: -3e-4,
				vol: .007
			},
			{
				len: 60,
				drift: 2e-4,
				vol: .008
			},
			{
				len: 40,
				drift: -2e-4,
				vol: .007
			}
		];
		case "breakout": return [
			{
				len: 90,
				drift: 1e-4,
				vol: .006
			},
			{
				len: 20,
				drift: 2e-4,
				vol: .004
			},
			{
				len: 70,
				drift: .0034,
				vol: .016
			},
			{
				len: 40,
				drift: 8e-4,
				vol: .012
			}
		];
		case "reversal": return [
			{
				len: 90,
				drift: .0024,
				vol: .012
			},
			{
				len: 20,
				drift: 4e-4,
				vol: .01
			},
			{
				len: 80,
				drift: -.0026,
				vol: .015
			},
			{
				len: 30,
				drift: -6e-4,
				vol: .011
			}
		];
		case "volatile": return [
			{
				len: 40,
				drift: .001,
				vol: .02
			},
			{
				len: 50,
				drift: -.002,
				vol: .024
			},
			{
				len: 50,
				drift: .0024,
				vol: .022
			},
			{
				len: 80,
				drift: -.0012,
				vol: .026
			}
		];
		default: return [
			{
				len: 50,
				drift: .0018,
				vol: .011
			},
			{
				len: 40,
				drift: -2e-4,
				vol: .008
			},
			{
				len: 70,
				drift: .0022,
				vol: .013
			},
			{
				len: 60,
				drift: -.002,
				vol: .015
			}
		];
	}
}
function generateMarket(opts) {
	const barsN = opts.bars ?? 240;
	const rand = mulberry32(opts.seed ?? 7);
	const start = opts.startPrice ?? 100;
	const phases = phasesFor(opts.scenario);
	const totalPhase = phases.reduce((s, p) => s + p.len, 0);
	const bars = [];
	let price = start;
	const t0 = Date.UTC(2024, 0, 2);
	const day = 864e5;
	for (let i = 0; i < barsN; i++) {
		const pos = i / barsN * totalPhase;
		let acc = 0;
		let phase = phases[0];
		for (const p of phases) {
			acc += p.len;
			if (pos <= acc) {
				phase = p;
				break;
			}
		}
		const shock = i > 0 && rand() < .03 ? (rand() < .5 ? -1 : 1) * phase.vol * 3 : 0;
		const ret = phase.drift + phase.vol * gaussian(rand) + shock;
		const prev = price;
		price = Math.max(2, price * (1 + ret));
		const range = Math.abs(price - prev) + price * phase.vol * (.4 + rand() * .8);
		const wickUp = range * (.15 + rand() * .55);
		const wickDn = range * (.15 + rand() * .55);
		const o = prev;
		const c = price;
		const h = Math.max(o, c) + wickUp;
		const l = Math.max(.5, Math.min(o, c) - wickDn);
		const body = Math.abs(c - o);
		const v = Math.round(800 + rand() * 2200 + body * 40 + (shock ? 1800 : 0));
		const dayOffset = Math.floor(i / 5) * 2 + i;
		bars.push({
			t: t0 + dayOffset * day,
			o: round(o),
			h: round(h),
			l: round(l),
			c: round(c),
			v
		});
	}
	return bars;
}
function round(n) {
	return Math.round(n * 100) / 100;
}
var SCENARIOS = [
	{
		id: "uptrend",
		label: "Xu hướng tăng",
		hint: "Drift dương, pullback nông"
	},
	{
		id: "downtrend",
		label: "Xu hướng giảm",
		hint: "Chuỗi lower-high"
	},
	{
		id: "range",
		label: "Đi ngang",
		hint: "Biên hẹp, mean-reversion"
	},
	{
		id: "breakout",
		label: "Breakout",
		hint: "Tích lũy rồi nổ ATR"
	},
	{
		id: "reversal",
		label: "Đảo chiều",
		hint: "Tăng kéo dài rồi gãy"
	},
	{
		id: "volatile",
		label: "Biến động cao",
		hint: "Whipsaw, ATR lớn"
	},
	{
		id: "mixed",
		label: "Hỗn hợp",
		hint: "Nhiều pha liên tiếp"
	}
];
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-surface-2 text-muted",
		accent: "bg-primary/15 text-primary",
		up: "bg-up/15 text-up",
		down: "bg-down/15 text-down"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function sma(values, n) {
	const out = Array(values.length).fill(null);
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
function ema(values, n) {
	const out = Array(values.length).fill(null);
	const k = 2 / (n + 1);
	let prev = null;
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
function rma(values, n) {
	const out = Array(values.length).fill(null);
	let prev = null;
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
function wma(values, n) {
	const out = Array(values.length).fill(null);
	const denom = n * (n + 1) / 2;
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
function stdev(values, n) {
	const out = Array(values.length).fill(null);
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
			const d = values[k] - mean;
			vsum += d * d;
		}
		out[i] = Math.sqrt(vsum / n);
	}
	return out;
}
function highest(values, n, i) {
	let m = -Infinity;
	const from = Math.max(0, i - n + 1);
	for (let k = from; k <= i; k++) m = Math.max(m, values[k]);
	return m;
}
function lowest(values, n, i) {
	let m = Infinity;
	const from = Math.max(0, i - n + 1);
	for (let k = from; k <= i; k++) m = Math.min(m, values[k]);
	return m;
}
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function linreg(ys) {
	const n = ys.length;
	let sumX = 0;
	let sumY = 0;
	let sumXY = 0;
	let sumXX = 0;
	for (let i = 0; i < n; i++) {
		sumX += i;
		sumY += ys[i];
		sumXY += i * ys[i];
		sumXX += i * i;
	}
	const den = n * sumXX - sumX * sumX;
	const slope = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
	return {
		slope,
		intercept: (sumY - slope * sumX) / n
	};
}
function lastNumber(values) {
	for (let i = values.length - 1; i >= 0; i--) {
		const v = values[i];
		if (v != null) return v;
	}
	return null;
}
function formatNum(n, d = 2) {
	if (!Number.isFinite(n)) return "—";
	return n.toLocaleString("vi-VN", {
		maximumFractionDigits: d,
		minimumFractionDigits: d
	});
}
function formatPct(n) {
	if (!Number.isFinite(n)) return "—";
	const s = (n * 100).toLocaleString("vi-VN", {
		maximumFractionDigits: 1,
		minimumFractionDigits: 1
	});
	return `${n >= 0 ? "+" : ""}${s}%`;
}
var C$1 = {
	primary: "#a8b8c8",
	up: "#6a9e7c",
	down: "#c4685e",
	warn: "#c4a882",
	line3: "#c4b8a8",
	muted: "#8a8e96",
	fillUp: "rgba(106,158,124,0.14)",
	fillDn: "rgba(196,104,94,0.14)",
	fillBand: "rgba(168,184,200,0.12)"
};
function closes$1(bars) {
	return bars.map((b) => b.c);
}
function highs$1(bars) {
	return bars.map((b) => b.h);
}
function lows$1(bars) {
	return bars.map((b) => b.l);
}
function trueRange(bars) {
	const tr = [];
	for (let i = 0; i < bars.length; i++) {
		const b = bars[i];
		if (i === 0) tr.push(b.h - b.l);
		else {
			const prev = bars[i - 1].c;
			tr.push(Math.max(b.h - b.l, Math.abs(b.h - prev), Math.abs(b.l - prev)));
		}
	}
	return tr;
}
function atr(bars, n) {
	return rma(trueRange(bars), n);
}
function rsi(values, n) {
	const out = Array(values.length).fill(null);
	let avgG = 0;
	let avgL = 0;
	for (let i = 1; i < values.length; i++) {
		const ch = values[i] - values[i - 1];
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
function crossoverSignals(a, b, price) {
	const sig = [];
	for (let i = 1; i < a.length; i++) {
		const a0 = a[i - 1];
		const a1 = a[i];
		const b0 = b[i - 1];
		const b1 = b[i];
		if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
		if (a0 <= b0 && a1 > b1) sig.push({
			i,
			side: "buy",
			price: price[i]
		});
		if (a0 >= b0 && a1 < b1) sig.push({
			i,
			side: "sell",
			price: price[i]
		});
	}
	return sig;
}
function evalForward(bars, signals, horizon = 10) {
	if (signals.length === 0) return [
		{
			label: "Tín hiệu",
			value: "0"
		},
		{
			label: "Hit-rate 10 nến",
			value: "—"
		},
		{
			label: "Avg. move",
			value: "—"
		}
	];
	let hits = 0;
	let counted = 0;
	let sum = 0;
	for (const s of signals) {
		const j = Math.min(bars.length - 1, s.i + horizon);
		if (j <= s.i) continue;
		const ret = (bars[j].c - s.price) / s.price;
		const signed = s.side === "buy" ? ret : -ret;
		sum += signed;
		counted += 1;
		if (signed > 0) hits += 1;
	}
	return [
		{
			label: "Tín hiệu",
			value: String(signals.length)
		},
		{
			label: "Hit-rate 10 nến",
			value: counted ? formatPct(hits / counted) : "—"
		},
		{
			label: "Avg. move",
			value: counted ? formatPct(sum / counted) : "—"
		}
	];
}
function supertrend(bars, period, mult) {
	const n = bars.length;
	const atrV = atr(bars, period);
	const up = Array(n).fill(null);
	const dn = Array(n).fill(null);
	const st = Array(n).fill(null);
	const dir = Array(n).fill(1);
	const colors = Array(n).fill(null);
	for (let i = 0; i < n; i++) {
		const a = atrV[i];
		if (a == null) continue;
		const hl2 = (bars[i].h + bars[i].l) / 2;
		let basicUp = hl2 - mult * a;
		let basicDn = hl2 + mult * a;
		if (i === 0 || st[i - 1] == null) {
			up[i] = basicUp;
			dn[i] = basicDn;
			dir[i] = 1;
			st[i] = basicUp;
		} else {
			const prevUp = up[i - 1];
			const prevDn = dn[i - 1];
			const prevClose = bars[i - 1].c;
			up[i] = prevClose > prevUp ? Math.max(basicUp, prevUp) : basicUp;
			dn[i] = prevClose < prevDn ? Math.min(basicDn, prevDn) : basicDn;
			dir[i] = dir[i - 1];
			if (dir[i] === 1 && bars[i].c < up[i]) dir[i] = -1;
			else if (dir[i] === -1 && bars[i].c > dn[i]) dir[i] = 1;
			st[i] = dir[i] === 1 ? up[i] : dn[i];
		}
		colors[i] = dir[i] === 1 ? C$1.up : C$1.down;
	}
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (st[i] == null || st[i - 1] == null) continue;
		if (dir[i] === 1 && dir[i - 1] === -1) signals.push({
			i,
			side: "buy",
			price: bars[i].c,
			note: "Flip lên"
		});
		if (dir[i] === -1 && dir[i - 1] === 1) signals.push({
			i,
			side: "sell",
			price: bars[i].c,
			note: "Flip xuống"
		});
	}
	const last = lastNumber(st);
	return {
		overlays: [{
			kind: "dots",
			id: "st",
			label: "Supertrend",
			values: st,
			colors,
			size: 2.4
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Supertrend",
				value: last == null ? "—" : formatNum(last)
			},
			{
				label: "Hướng",
				value: dir[n - 1] === 1 ? "Tăng" : "Giảm"
			},
			...evalForward(bars, signals)
		]
	};
}
function adxDmi(bars, period) {
	const n = bars.length;
	const plusDM = Array(n).fill(null);
	const minusDM = Array(n).fill(null);
	const tr = trueRange(bars);
	for (let i = 1; i < n; i++) {
		const upMove = bars[i].h - bars[i - 1].h;
		const dnMove = bars[i - 1].l - bars[i].l;
		plusDM[i] = upMove > dnMove && upMove > 0 ? upMove : 0;
		minusDM[i] = dnMove > upMove && dnMove > 0 ? dnMove : 0;
	}
	const atrV = rma(tr, period);
	const smPlus = rma(plusDM, period);
	const smMinus = rma(minusDM, period);
	const pdi = Array(n).fill(null);
	const mdi = Array(n).fill(null);
	const dx = Array(n).fill(null);
	for (let i = 0; i < n; i++) {
		if (atrV[i] == null || smPlus[i] == null || smMinus[i] == null || atrV[i] === 0) continue;
		pdi[i] = 100 * smPlus[i] / atrV[i];
		mdi[i] = 100 * smMinus[i] / atrV[i];
		const den = pdi[i] + mdi[i];
		dx[i] = den === 0 ? 0 : 100 * Math.abs(pdi[i] - mdi[i]) / den;
	}
	const adx = rma(dx, period);
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (pdi[i] == null || mdi[i] == null || adx[i] == null) continue;
		if (adx[i] < 20) continue;
		if (pdi[i - 1] <= mdi[i - 1] && pdi[i] > mdi[i]) signals.push({
			i,
			side: "buy",
			price: bars[i].c
		});
		if (pdi[i - 1] >= mdi[i - 1] && pdi[i] < mdi[i]) signals.push({
			i,
			side: "sell",
			price: bars[i].c
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "adx",
			label: "ADX / DMI",
			min: 0,
			max: 60,
			guides: [20, 25],
			series: [
				{
					id: "adx",
					color: C$1.primary,
					values: adx
				},
				{
					id: "+DI",
					color: C$1.up,
					values: pdi
				},
				{
					id: "-DI",
					color: C$1.down,
					values: mdi
				}
			]
		}],
		signals,
		stats: [
			{
				label: "ADX",
				value: formatNum(lastNumber(adx) ?? NaN, 1)
			},
			{
				label: "+DI",
				value: formatNum(lastNumber(pdi) ?? NaN, 1)
			},
			{
				label: "-DI",
				value: formatNum(lastNumber(mdi) ?? NaN, 1)
			},
			{
				label: "Pha",
				value: (lastNumber(adx) ?? 0) >= 25 ? "Có xu hướng" : "Sideway"
			},
			...evalForward(bars, signals)
		]
	};
}
function ichimoku(bars, tenkanN, kijunN, senkouN) {
	const n = bars.length;
	const H = highs$1(bars);
	const L = lows$1(bars);
	const tenkan = Array(n).fill(null);
	const kijun = Array(n).fill(null);
	const senkouB = Array(n).fill(null);
	for (let i = 0; i < n; i++) {
		if (i >= tenkanN - 1) tenkan[i] = (highest(H, tenkanN, i) + lowest(L, tenkanN, i)) / 2;
		if (i >= kijunN - 1) kijun[i] = (highest(H, kijunN, i) + lowest(L, kijunN, i)) / 2;
		if (i >= senkouN - 1) senkouB[i] = (highest(H, senkouN, i) + lowest(L, senkouN, i)) / 2;
	}
	const spanA = Array(n).fill(null);
	const spanB = Array(n).fill(null);
	const chikou = Array(n).fill(null);
	for (let i = 0; i < n; i++) {
		if (tenkan[i] != null && kijun[i] != null) {
			const j = i + kijunN;
			if (j < n) spanA[j] = (tenkan[i] + kijun[i]) / 2;
		}
		if (senkouB[i] != null) {
			const j = i + kijunN;
			if (j < n) spanB[j] = senkouB[i];
		}
		const k = i - kijunN;
		if (k >= 0) chikou[k] = bars[i].c;
	}
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (tenkan[i] == null || kijun[i] == null) continue;
		if (tenkan[i - 1] <= kijun[i - 1] && tenkan[i] > kijun[i]) signals.push({
			i,
			side: "buy",
			price: bars[i].c,
			note: "TK cross"
		});
		if (tenkan[i - 1] >= kijun[i - 1] && tenkan[i] < kijun[i]) signals.push({
			i,
			side: "sell",
			price: bars[i].c,
			note: "TK cross"
		});
	}
	return {
		overlays: [
			{
				kind: "cloud",
				id: "cloud",
				label: "Kumo",
				a: spanA,
				b: spanB,
				bull: C$1.fillUp,
				bear: C$1.fillDn
			},
			{
				kind: "line",
				id: "tenkan",
				label: "Tenkan",
				color: C$1.down,
				values: tenkan,
				width: 1.2
			},
			{
				kind: "line",
				id: "kijun",
				label: "Kijun",
				color: C$1.primary,
				values: kijun,
				width: 1.2
			},
			{
				kind: "line",
				id: "chikou",
				label: "Chikou",
				color: C$1.line3,
				values: chikou,
				width: 1,
				dashed: true
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Tenkan",
				value: formatNum(lastNumber(tenkan) ?? NaN)
			},
			{
				label: "Kijun",
				value: formatNum(lastNumber(kijun) ?? NaN)
			},
			...evalForward(bars, signals)
		]
	};
}
function emaRibbon(bars, fast, mid, slow) {
	const c = closes$1(bars);
	const e1 = ema(c, fast);
	const e2 = ema(c, mid);
	const e3 = ema(c, slow);
	const signals = crossoverSignals(e1, e3, c);
	return {
		overlays: [
			{
				kind: "line",
				id: "e1",
				label: `EMA ${fast}`,
				color: C$1.up,
				values: e1,
				width: 1.2
			},
			{
				kind: "line",
				id: "e2",
				label: `EMA ${mid}`,
				color: C$1.primary,
				values: e2,
				width: 1.2
			},
			{
				kind: "line",
				id: "e3",
				label: `EMA ${slow}`,
				color: C$1.down,
				values: e3,
				width: 1.4
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [
			{
				label: `EMA ${fast}`,
				value: formatNum(lastNumber(e1) ?? NaN)
			},
			{
				label: `EMA ${slow}`,
				value: formatNum(lastNumber(e3) ?? NaN)
			},
			...evalForward(bars, signals)
		]
	};
}
function parabolicSar(bars, startAf, maxAf) {
	const n = bars.length;
	const sar = Array(n).fill(null);
	const colors = Array(n).fill(null);
	if (n < 3) return emptyResult();
	let bull = bars[1].c >= bars[0].c;
	let af = startAf;
	let ep = bull ? bars[0].h : bars[0].l;
	sar[0] = bull ? bars[0].l : bars[0].h;
	colors[0] = bull ? C$1.up : C$1.down;
	for (let i = 1; i < n; i++) {
		const prev = sar[i - 1];
		let next = prev + af * (ep - prev);
		if (bull) {
			next = Math.min(next, bars[i - 1].l, i > 1 ? bars[i - 2].l : bars[i - 1].l);
			if (bars[i].l < next) {
				bull = false;
				next = ep;
				ep = bars[i].l;
				af = startAf;
			} else if (bars[i].h > ep) {
				ep = bars[i].h;
				af = Math.min(maxAf, af + startAf);
			}
		} else {
			next = Math.max(next, bars[i - 1].h, i > 1 ? bars[i - 2].h : bars[i - 1].h);
			if (bars[i].h > next) {
				bull = true;
				next = ep;
				ep = bars[i].h;
				af = startAf;
			} else if (bars[i].l < ep) {
				ep = bars[i].l;
				af = Math.min(maxAf, af + startAf);
			}
		}
		sar[i] = next;
		colors[i] = bull ? C$1.up : C$1.down;
	}
	const signals = [];
	for (let i = 1; i < n; i++) if (colors[i] !== colors[i - 1] && sar[i] != null) signals.push({
		i,
		side: colors[i] === C$1.up ? "buy" : "sell",
		price: bars[i].c
	});
	return {
		overlays: [{
			kind: "dots",
			id: "sar",
			label: "PSAR",
			values: sar,
			colors,
			size: 2.6
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "SAR",
				value: formatNum(lastNumber(sar) ?? NaN)
			},
			{
				label: "Hướng",
				value: colors[n - 1] === C$1.up ? "Tăng" : "Giảm"
			},
			...evalForward(bars, signals)
		]
	};
}
function donchian(bars, period) {
	const n = bars.length;
	const H = highs$1(bars);
	const L = lows$1(bars);
	const upper = Array(n).fill(null);
	const lower = Array(n).fill(null);
	const mid = Array(n).fill(null);
	for (let i = period - 1; i < n; i++) {
		upper[i] = highest(H, period, i);
		lower[i] = lowest(L, period, i);
		mid[i] = (upper[i] + lower[i]) / 2;
	}
	const signals = [];
	for (let i = period; i < n; i++) {
		if (upper[i - 1] != null && bars[i].c > upper[i - 1]) signals.push({
			i,
			side: "buy",
			price: bars[i].c,
			note: "Break high"
		});
		if (lower[i - 1] != null && bars[i].c < lower[i - 1]) signals.push({
			i,
			side: "sell",
			price: bars[i].c,
			note: "Break low"
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "don",
			label: "Donchian",
			upper,
			lower,
			mid,
			fill: C$1.fillBand,
			upperColor: C$1.up,
			lowerColor: C$1.down
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Upper",
				value: formatNum(lastNumber(upper) ?? NaN)
			},
			{
				label: "Lower",
				value: formatNum(lastNumber(lower) ?? NaN)
			},
			...evalForward(bars, signals)
		]
	};
}
function hullMa(bars, period) {
	const c = closes$1(bars);
	const half = Math.max(1, Math.round(period / 2));
	const sqrtN = Math.max(1, Math.round(Math.sqrt(period)));
	const w1 = wma(c, half);
	const w2 = wma(c, period);
	const hma = wma(c.map((_, i) => w1[i] == null || w2[i] == null ? null : 2 * w1[i] - w2[i]), sqrtN);
	const signals = [];
	for (let i = 2; i < c.length; i++) {
		if (hma[i] == null || hma[i - 1] == null || hma[i - 2] == null) continue;
		const d0 = hma[i - 1] - hma[i - 2];
		const d1 = hma[i] - hma[i - 1];
		if (d0 <= 0 && d1 > 0) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (d0 >= 0 && d1 < 0) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "hma",
			label: "HMA",
			color: C$1.primary,
			values: hma,
			width: 1.8
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "HMA",
				value: formatNum(lastNumber(hma) ?? NaN)
			},
			{
				label: "Slope",
				value: slopeLabel(hma)
			},
			...evalForward(bars, signals)
		]
	};
}
function slopeLabel(values) {
	const a = lastNumber(values);
	let prev = null;
	let seen = 0;
	for (let i = values.length - 1; i >= 0; i--) if (values[i] != null) {
		seen += 1;
		if (seen === 4) {
			prev = values[i];
			break;
		}
	}
	if (a == null || prev == null) return "—";
	return a >= prev ? "Dốc lên" : "Dốc xuống";
}
function alma(bars, period, offset, sigma) {
	const c = closes$1(bars);
	const out = Array(c.length).fill(null);
	const m = offset * (period - 1);
	const s = period / sigma;
	const weights = [];
	let wsum = 0;
	for (let i = 0; i < period; i++) {
		const w = Math.exp(-((i - m) * (i - m)) / (2 * s * s));
		weights.push(w);
		wsum += w;
	}
	for (let i = period - 1; i < c.length; i++) {
		let acc = 0;
		for (let k = 0; k < period; k++) acc += c[i - period + 1 + k] * weights[k];
		out[i] = acc / wsum;
	}
	const signals = [];
	for (let i = 2; i < c.length; i++) {
		if (out[i] == null || out[i - 1] == null || out[i - 2] == null) continue;
		const d0 = out[i - 1] - out[i - 2];
		const d1 = out[i] - out[i - 1];
		if (d0 <= 0 && d1 > 0) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (d0 >= 0 && d1 < 0) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "alma",
			label: "ALMA",
			color: C$1.primary,
			values: out,
			width: 1.8
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [{
			label: "ALMA",
			value: formatNum(lastNumber(out) ?? NaN)
		}, ...evalForward(bars, signals)]
	};
}
function kama(bars, period, fast, slow) {
	const c = closes$1(bars);
	const out = Array(c.length).fill(null);
	const fastSC = 2 / (fast + 1);
	const slowSC = 2 / (slow + 1);
	let prev = null;
	for (let i = period; i < c.length; i++) {
		const change = Math.abs(c[i] - c[i - period]);
		let vol = 0;
		for (let k = i - period + 1; k <= i; k++) vol += Math.abs(c[k] - c[k - 1]);
		const er = vol === 0 ? 0 : change / vol;
		const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
		if (prev == null) prev = c[i];
		prev = prev + sc * (c[i] - prev);
		out[i] = prev;
	}
	const signals = [];
	for (let i = 2; i < c.length; i++) {
		if (out[i] == null || out[i - 1] == null || out[i - 2] == null) continue;
		if (out[i - 1] <= out[i - 2] && out[i] > out[i - 1]) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (out[i - 1] >= out[i - 2] && out[i] < out[i - 1]) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "kama",
			label: "KAMA",
			color: C$1.primary,
			values: out,
			width: 1.8
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [{
			label: "KAMA",
			value: formatNum(lastNumber(out) ?? NaN)
		}, ...evalForward(bars, signals)]
	};
}
function kalman(bars, q, r) {
	const c = closes$1(bars);
	const out = [];
	let x = c[0];
	let p = 1;
	for (let i = 0; i < c.length; i++) {
		p = p + q;
		const k = p / (p + r);
		x = x + k * (c[i] - x);
		p = (1 - k) * p;
		out.push(x);
	}
	const residual = c.map((v, i) => v - out[i]);
	const std = Math.sqrt(residual.reduce((s, v) => s + v * v, 0) / residual.length);
	const upper = out.map((v) => v + 1.6 * std);
	const lower = out.map((v) => v - 1.6 * std);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (c[i - 1] >= lower[i - 1] && c[i] < lower[i]) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i - 1] <= upper[i - 1] && c[i] > upper[i]) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "kalman",
			label: "Kalman ±1.6σ",
			upper,
			lower,
			mid: out,
			fill: C$1.fillBand,
			upperColor: C$1.muted,
			lowerColor: C$1.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Ước lượng",
				value: formatNum(x)
			},
			{
				label: "σ residual",
				value: formatNum(std)
			},
			...evalForward(bars, signals)
		]
	};
}
function nadarayaWatson(bars, bandwidth, mult) {
	const c = closes$1(bars);
	const n = c.length;
	const y = Array(n).fill(0);
	const h = Math.max(1, bandwidth);
	for (let i = 0; i < n; i++) {
		let num = 0;
		let den = 0;
		const from = Math.max(0, i - Math.ceil(h * 4));
		const to = Math.min(n - 1, i + Math.ceil(h * 4));
		for (let j = from; j <= to; j++) {
			const u = (i - j) / h;
			const k = Math.exp(-.5 * u * u);
			num += k * c[j];
			den += k;
		}
		y[i] = den === 0 ? c[i] : num / den;
	}
	const mae = c.map((v, i) => v - y[i]).reduce((s, v) => s + Math.abs(v), 0) / n;
	const upper = y.map((v) => v + mult * mae);
	const lower = y.map((v) => v - mult * mae);
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (c[i - 1] >= lower[i - 1] && c[i] < lower[i]) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i - 1] <= upper[i - 1] && c[i] > upper[i]) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "nw",
			label: "Nadaraya–Watson",
			upper,
			lower,
			mid: y,
			fill: C$1.fillBand,
			upperColor: C$1.primary,
			lowerColor: C$1.primary
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Kernel",
				value: formatNum(y[n - 1])
			},
			{
				label: "MAE",
				value: formatNum(mae)
			},
			...evalForward(bars, signals)
		],
		note: "Kernel hai phía nên đường giữa có độ trễ thấp ở giữa chuỗi, mép phải vẫn phụ thuộc nến mới."
	};
}
function linregChannel(bars, period, k) {
	const c = closes$1(bars);
	const n = c.length;
	const mid = Array(n).fill(null);
	const upper = Array(n).fill(null);
	const lower = Array(n).fill(null);
	for (let i = period - 1; i < n; i++) {
		const window = c.slice(i - period + 1, i + 1);
		const { slope, intercept } = linreg(window);
		const fit = intercept + slope * (period - 1);
		let sse = 0;
		for (let t = 0; t < period; t++) {
			const f = intercept + slope * t;
			const d = window[t] - f;
			sse += d * d;
		}
		const sd = Math.sqrt(sse / period);
		mid[i] = fit;
		upper[i] = fit + k * sd;
		lower[i] = fit - k * sd;
	}
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (lower[i] == null || upper[i] == null) continue;
		if (c[i] < lower[i] && c[i - 1] >= (lower[i - 1] ?? lower[i])) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i] > upper[i] && c[i - 1] <= (upper[i - 1] ?? upper[i])) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "lr",
			label: "LinReg",
			upper,
			lower,
			mid,
			fill: C$1.fillBand,
			upperColor: C$1.muted,
			lowerColor: C$1.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Fit",
				value: formatNum(lastNumber(mid) ?? NaN)
			},
			{
				label: "Slope",
				value: slopeLabel(mid)
			},
			...evalForward(bars, signals)
		]
	};
}
function zigzag(bars, pct) {
	const points = zigzagPoints(bars, pct / 100);
	const signals = [];
	for (let p = 1; p < points.length; p++) {
		const cur = points[p];
		const prev = points[p - 1];
		signals.push({
			i: cur.i,
			side: cur.price < prev.price ? "buy" : "sell",
			price: cur.price,
			note: "Pivot"
		});
	}
	return {
		overlays: [{
			kind: "zigzag",
			id: "zz",
			label: "ZigZag",
			points,
			color: C$1.primary
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Số pivot",
				value: String(points.length)
			},
			{
				label: "Swing cuối",
				value: points.length ? formatNum(points[points.length - 1].price) : "—"
			},
			...evalForward(bars, signals)
		]
	};
}
function zigzagPoints(bars, threshold) {
	if (bars.length === 0) return [];
	const pts = [{
		i: 0,
		price: bars[0].c
	}];
	let dir = 0;
	let extreme = bars[0].c;
	let extremeI = 0;
	for (let i = 1; i < bars.length; i++) {
		const p = bars[i].c;
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
				pts.push({
					i: extremeI,
					price: extreme
				});
				dir = -1;
				extreme = p;
				extremeI = i;
			}
		} else if (p < extreme) {
			extreme = p;
			extremeI = i;
		} else if (p >= extreme * (1 + threshold)) {
			pts.push({
				i: extremeI,
				price: extreme
			});
			dir = 1;
			extreme = p;
			extremeI = i;
		}
	}
	pts.push({
		i: extremeI,
		price: extreme
	});
	return pts;
}
function marketStructure(bars, pct) {
	const pts = zigzagPoints(bars, pct / 100);
	const signals = [];
	for (let i = 3; i < pts.length; i++) {
		const a = pts[i - 3];
		const b = pts[i - 2];
		const c = pts[i - 1];
		const d = pts[i];
		const up = b.price > a.price && d.price > b.price && c.price > a.price;
		const dn = b.price < a.price && d.price < b.price && c.price < a.price;
		if (up && d.price < c.price && bars[d.i].c < c.price) signals.push({
			i: d.i,
			side: "sell",
			price: bars[d.i].c,
			note: "CHoCH"
		});
		if (dn && d.price > c.price && bars[d.i].c > c.price) signals.push({
			i: d.i,
			side: "buy",
			price: bars[d.i].c,
			note: "CHoCH"
		});
	}
	const last = pts.slice(-4);
	let bias = "Chưa rõ";
	if (last.length >= 4) {
		const [p0, p1, p2, p3] = last;
		if (p1.price > p0.price && p3.price > p1.price && p2.price > p0.price) bias = "HH / HL — tăng";
		else if (p1.price < p0.price && p3.price < p1.price && p2.price < p0.price) bias = "LH / LL — giảm";
	}
	return {
		overlays: [{
			kind: "zigzag",
			id: "ms",
			label: "Swing",
			points: pts,
			color: C$1.warn
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "Cấu trúc",
				value: bias
			},
			{
				label: "Swings",
				value: String(pts.length)
			},
			...evalForward(bars, signals)
		]
	};
}
function pivotPoints(bars, lookback) {
	const n = bars.length;
	const w = Math.min(lookback, n);
	const slice = bars.slice(n - w);
	const H = Math.max(...slice.map((b) => b.h));
	const L = Math.min(...slice.map((b) => b.l));
	const Cl = slice[slice.length - 1].c;
	const P = (H + L + Cl) / 3;
	const R1 = 2 * P - L;
	const S1 = 2 * P - H;
	const R2 = P + (H - L);
	const S2 = P - (H - L);
	const R3 = H + 2 * (P - L);
	const S3 = L - 2 * (H - P);
	const levels = {
		kind: "levels",
		id: "pivots",
		label: "Pivots",
		levels: [
			{
				price: R3,
				label: "R3",
				color: C$1.down
			},
			{
				price: R2,
				label: "R2",
				color: C$1.down,
				dashed: true
			},
			{
				price: R1,
				label: "R1",
				color: C$1.down
			},
			{
				price: P,
				label: "P",
				color: C$1.primary
			},
			{
				price: S1,
				label: "S1",
				color: C$1.up
			},
			{
				price: S2,
				label: "S2",
				color: C$1.up,
				dashed: true
			},
			{
				price: S3,
				label: "S3",
				color: C$1.up
			}
		]
	};
	const last = bars[n - 1].c;
	let zone = "Quanh P";
	if (last > R1) zone = "Trên R1 — mở rộng";
	else if (last < S1) zone = "Dưới S1 — mở rộng";
	return {
		overlays: [levels],
		oscillators: [],
		signals: [],
		stats: [
			{
				label: "Pivot",
				value: formatNum(P)
			},
			{
				label: "Vùng",
				value: zone
			},
			{
				label: "R1 / S1",
				value: `${formatNum(R1)} / ${formatNum(S1)}`
			}
		]
	};
}
function rsiDiv(bars, period, zzPct) {
	const c = closes$1(bars);
	const r = rsi(c, period);
	const pts = zigzagPoints(bars, zzPct / 100);
	const signals = [];
	for (let i = 2; i < pts.length; i++) {
		const a = pts[i - 2];
		const b = pts[i];
		const ra = r[a.i];
		const rb = r[b.i];
		if (ra == null || rb == null) continue;
		if (b.price > a.price && rb < ra && rb > 50) signals.push({
			i: b.i,
			side: "sell",
			price: b.price,
			note: "Phân kỳ âm"
		});
		if (b.price < a.price && rb > ra && rb < 50) signals.push({
			i: b.i,
			side: "buy",
			price: b.price,
			note: "Phân kỳ dương"
		});
	}
	for (let i = 1; i < r.length; i++) {
		if (r[i] == null || r[i - 1] == null) continue;
		if (r[i - 1] < 30 && r[i] >= 30) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "RSI thoát oversold"
		});
		if (r[i - 1] > 70 && r[i] <= 70) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "RSI thoát overbought"
		});
	}
	return {
		overlays: [{
			kind: "zigzag",
			id: "zz",
			label: "Swing",
			points: pts,
			color: C$1.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "rsi",
			label: "RSI",
			min: 0,
			max: 100,
			guides: [
				30,
				50,
				70
			],
			series: [{
				id: "rsi",
				color: C$1.primary,
				values: r
			}]
		}],
		signals,
		stats: [
			{
				label: "RSI",
				value: formatNum(lastNumber(r) ?? NaN, 1)
			},
			{
				label: "Phân kỳ",
				value: String(signals.filter((s) => s.note?.includes("Phân kỳ")).length)
			},
			...evalForward(bars, signals)
		]
	};
}
function fisherTransform(bars, period) {
	const n = bars.length;
	const mid = bars.map((b) => (b.h + b.l) / 2);
	const fish = Array(n).fill(null);
	const trig = Array(n).fill(null);
	let value = 0;
	let prevFish = 0;
	for (let i = period; i < n; i++) {
		let mx = -Infinity;
		let mn = Infinity;
		for (let k = i - period + 1; k <= i; k++) {
			mx = Math.max(mx, mid[k]);
			mn = Math.min(mn, mid[k]);
		}
		const range = mx - mn;
		let x = range === 0 ? 0 : 2 * ((mid[i] - mn) / range - .5);
		x = clamp(x, -.999, .999);
		value = .33 * x + .67 * value;
		value = clamp(value, -.999, .999);
		const f = .5 * Math.log((1 + value) / (1 - value)) + .5 * prevFish;
		fish[i] = f;
		trig[i] = prevFish;
		prevFish = f;
	}
	const signals = crossoverSignals(fish, trig, closes$1(bars));
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "fisher",
			label: "Fisher",
			min: -4,
			max: 4,
			zero: 0,
			guides: [
				-1.5,
				0,
				1.5
			],
			series: [{
				id: "fish",
				color: C$1.primary,
				values: fish
			}, {
				id: "trig",
				color: C$1.muted,
				values: trig
			}]
		}],
		signals,
		stats: [{
			label: "Fisher",
			value: formatNum(lastNumber(fish) ?? NaN, 2)
		}, ...evalForward(bars, signals)]
	};
}
function macd(bars, fast, slow, signal) {
	const c = closes$1(bars);
	const eFast = ema(c, fast);
	const eSlow = ema(c, slow);
	const line = c.map((_, i) => eFast[i] == null || eSlow[i] == null ? null : eFast[i] - eSlow[i]);
	const sigLine = ema(line, signal);
	const hist = line.map((v, i) => v == null || sigLine[i] == null ? null : v - sigLine[i]);
	const histColors = hist.map((v) => v == null ? null : v >= 0 ? C$1.up : C$1.down);
	const signals = crossoverSignals(line, sigLine, c);
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "macd",
			label: "MACD",
			min: -4,
			max: 4,
			zero: 0,
			series: [
				{
					id: "hist",
					color: C$1.muted,
					values: hist,
					type: "hist",
					histColors
				},
				{
					id: "macd",
					color: C$1.primary,
					values: line
				},
				{
					id: "signal",
					color: C$1.down,
					values: sigLine
				}
			]
		}],
		signals,
		stats: [
			{
				label: "MACD",
				value: formatNum(lastNumber(line) ?? NaN, 3)
			},
			{
				label: "Hist",
				value: formatNum(lastNumber(hist) ?? NaN, 3)
			},
			...evalForward(bars, signals)
		]
	};
}
function stochastic(bars, kN, dN) {
	const n = bars.length;
	const H = highs$1(bars);
	const L = lows$1(bars);
	const rawK = Array(n).fill(null);
	for (let i = kN - 1; i < n; i++) {
		const hh = highest(H, kN, i);
		const ll = lowest(L, kN, i);
		rawK[i] = hh === ll ? 50 : (bars[i].c - ll) / (hh - ll) * 100;
	}
	const k = sma(rawK, 3);
	const d = sma(k, dN);
	const signals = crossoverSignals(k, d, closes$1(bars)).filter((_, idx, arr) => {
		const s = arr[idx];
		const kv = k[s.i];
		if (kv == null) return false;
		return s.side === "buy" ? kv < 30 : kv > 70;
	});
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "stoch",
			label: "Stochastic",
			min: 0,
			max: 100,
			guides: [20, 80],
			series: [{
				id: "%K",
				color: C$1.primary,
				values: k
			}, {
				id: "%D",
				color: C$1.down,
				values: d
			}]
		}],
		signals,
		stats: [
			{
				label: "%K",
				value: formatNum(lastNumber(k) ?? NaN, 1)
			},
			{
				label: "%D",
				value: formatNum(lastNumber(d) ?? NaN, 1)
			},
			...evalForward(bars, signals)
		]
	};
}
function cci(bars, period) {
	const tp = bars.map((b) => (b.h + b.l + b.c) / 3);
	const sm = sma(tp, period);
	const out = Array(bars.length).fill(null);
	for (let i = period - 1; i < bars.length; i++) {
		if (sm[i] == null) continue;
		let mad = 0;
		for (let k = i - period + 1; k <= i; k++) mad += Math.abs(tp[k] - sm[i]);
		mad /= period;
		out[i] = mad === 0 ? 0 : (tp[i] - sm[i]) / (.015 * mad);
	}
	const signals = [];
	for (let i = 1; i < out.length; i++) {
		if (out[i] == null || out[i - 1] == null) continue;
		if (out[i - 1] < -100 && out[i] >= -100) signals.push({
			i,
			side: "buy",
			price: bars[i].c
		});
		if (out[i - 1] > 100 && out[i] <= 100) signals.push({
			i,
			side: "sell",
			price: bars[i].c
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "cci",
			label: "CCI",
			min: -250,
			max: 250,
			zero: 0,
			guides: [
				-100,
				0,
				100
			],
			series: [{
				id: "cci",
				color: C$1.primary,
				values: out
			}]
		}],
		signals,
		stats: [{
			label: "CCI",
			value: formatNum(lastNumber(out) ?? NaN, 1)
		}, ...evalForward(bars, signals)]
	};
}
function bollinger(bars, period, k) {
	const c = closes$1(bars);
	const mid = sma(c, period);
	const sd = stdev(c, period);
	const upper = mid.map((v, i) => v == null || sd[i] == null ? null : v + k * sd[i]);
	const lower = mid.map((v, i) => v == null || sd[i] == null ? null : v - k * sd[i]);
	const bw = mid.map((v, i) => v == null || upper[i] == null || lower[i] == null || v === 0 ? null : (upper[i] - lower[i]) / v);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (lower[i] == null || upper[i] == null) continue;
		if (c[i] < lower[i] && c[i - 1] >= (lower[i - 1] ?? c[i - 1])) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i] > upper[i] && c[i - 1] <= (upper[i - 1] ?? c[i - 1])) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "bb",
			label: "Bollinger",
			upper,
			lower,
			mid,
			fill: C$1.fillBand,
			upperColor: C$1.muted,
			lowerColor: C$1.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "bw",
			label: "Bandwidth",
			min: 0,
			max: .2,
			series: [{
				id: "bw",
				color: C$1.warn,
				values: bw
			}]
		}],
		signals,
		stats: [
			{
				label: "Mid",
				value: formatNum(lastNumber(mid) ?? NaN)
			},
			{
				label: "BW",
				value: formatPct(lastNumber(bw) ?? NaN)
			},
			...evalForward(bars, signals)
		]
	};
}
function keltner(bars, period, mult) {
	const c = closes$1(bars);
	const mid = ema(c, period);
	const a = atr(bars, period);
	const upper = mid.map((v, i) => v == null || a[i] == null ? null : v + mult * a[i]);
	const lower = mid.map((v, i) => v == null || a[i] == null ? null : v - mult * a[i]);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (upper[i - 1] == null || lower[i - 1] == null) continue;
		if (c[i] > upper[i - 1]) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Close > upper"
		});
		if (c[i] < lower[i - 1]) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Close < lower"
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "kc",
			label: "Keltner",
			upper,
			lower,
			mid,
			fill: C$1.fillBand,
			upperColor: C$1.up,
			lowerColor: C$1.down
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "EMA",
				value: formatNum(lastNumber(mid) ?? NaN)
			},
			{
				label: "ATR",
				value: formatNum(lastNumber(a) ?? NaN)
			},
			...evalForward(bars, signals)
		]
	};
}
function atrTrail(bars, period, mult) {
	const a = atr(bars, period);
	const c = closes$1(bars);
	const up = c.map((v, i) => a[i] == null ? null : v + mult * a[i]);
	const dn = c.map((v, i) => a[i] == null ? null : v - mult * a[i]);
	const pct = a.map((v, i) => v == null || c[i] === 0 ? null : v / c[i]);
	return {
		overlays: [{
			kind: "line",
			id: "up",
			label: "Close+ATR",
			color: C$1.down,
			values: up,
			width: 1,
			dashed: true
		}, {
			kind: "line",
			id: "dn",
			label: "Close−ATR",
			color: C$1.up,
			values: dn,
			width: 1,
			dashed: true
		}],
		oscillators: [{
			id: "atr",
			label: "ATR %",
			min: 0,
			max: .08,
			series: [{
				id: "atr",
				color: C$1.warn,
				values: pct
			}]
		}],
		signals: [],
		stats: [{
			label: "ATR",
			value: formatNum(lastNumber(a) ?? NaN)
		}, {
			label: "ATR %",
			value: formatPct(lastNumber(pct) ?? NaN)
		}]
	};
}
function vwap(bars, reset) {
	const n = bars.length;
	const val = Array(n).fill(null);
	let pv = 0;
	let vol = 0;
	let count = 0;
	for (let i = 0; i < n; i++) {
		if (count === 0) {
			pv = 0;
			vol = 0;
		}
		const tp = (bars[i].h + bars[i].l + bars[i].c) / 3;
		pv += tp * bars[i].v;
		vol += bars[i].v;
		val[i] = vol === 0 ? tp : pv / vol;
		count += 1;
		if (count >= reset) count = 0;
	}
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (val[i] == null || val[i - 1] == null) continue;
		if (bars[i - 1].c <= val[i - 1] && bars[i].c > val[i]) signals.push({
			i,
			side: "buy",
			price: bars[i].c
		});
		if (bars[i - 1].c >= val[i - 1] && bars[i].c < val[i]) signals.push({
			i,
			side: "sell",
			price: bars[i].c
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "vwap",
			label: "VWAP",
			color: C$1.warn,
			values: val,
			width: 1.6
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [{
			label: "VWAP",
			value: formatNum(lastNumber(val) ?? NaN)
		}, ...evalForward(bars, signals)]
	};
}
function obv(bars) {
	const out = [];
	let acc = 0;
	for (let i = 0; i < bars.length; i++) if (i === 0) out.push(0);
	else {
		if (bars[i].c > bars[i - 1].c) acc += bars[i].v;
		else if (bars[i].c < bars[i - 1].c) acc -= bars[i].v;
		out.push(acc);
	}
	const sm = ema(out, 21);
	const signals = crossoverSignals(out, sm, closes$1(bars));
	const min = Math.min(...out.map((v) => v ?? 0));
	const max = Math.max(...out.map((v) => v ?? 0));
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "obv",
			label: "OBV",
			min,
			max,
			series: [{
				id: "obv",
				color: C$1.primary,
				values: out
			}, {
				id: "ema",
				color: C$1.muted,
				values: sm
			}]
		}],
		signals,
		stats: [{
			label: "OBV",
			value: formatNum(lastNumber(out) ?? 0, 0)
		}, ...evalForward(bars, signals)]
	};
}
function heikinAshi(bars) {
	const ha = [];
	for (let i = 0; i < bars.length; i++) {
		const b = bars[i];
		const hc = (b.o + b.h + b.l + b.c) / 4;
		const ho = i === 0 ? (b.o + b.c) / 2 : (ha[i - 1].o + ha[i - 1].c) / 2;
		const hh = Math.max(b.h, ho, hc);
		const hl = Math.min(b.l, ho, hc);
		ha.push({
			t: b.t,
			o: ho,
			h: hh,
			l: hl,
			c: hc,
			v: b.v
		});
	}
	const signals = [];
	for (let i = 1; i < ha.length; i++) {
		const bull = ha[i].c >= ha[i].o;
		const prev = ha[i - 1].c >= ha[i - 1].o;
		if (bull && !prev) signals.push({
			i,
			side: "buy",
			price: bars[i].c
		});
		if (!bull && prev) signals.push({
			i,
			side: "sell",
			price: bars[i].c
		});
	}
	const last = ha[ha.length - 1];
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "HA",
				value: last.c >= last.o ? "Nến tăng" : "Nến giảm"
			},
			{
				label: "Wick ngược",
				value: last.c >= last.o ? formatNum(last.o - last.l) : formatNum(last.h - last.o)
			},
			...evalForward(bars, signals)
		],
		chartBars: ha
	};
}
function fibonacci(bars, pct) {
	const pts = zigzagPoints(bars, pct / 100);
	if (pts.length < 2) return emptyResult();
	const a = pts[pts.length - 2];
	const b = pts[pts.length - 1];
	const hi = Math.max(a.price, b.price);
	const lo = Math.min(a.price, b.price);
	const up = b.price > a.price;
	const levels = [
		0,
		.236,
		.382,
		.5,
		.618,
		.786,
		1
	].map((r) => {
		return {
			price: up ? hi - (hi - lo) * r : lo + (hi - lo) * r,
			label: `${(r * 100).toFixed(1).replace(".0", "")}%`,
			color: r === .618 || r === .5 ? C$1.primary : C$1.muted,
			dashed: r !== 0 && r !== 1 && r !== .618
		};
	});
	const last = bars[bars.length - 1].c;
	const pos = hi === lo ? 0 : up ? (hi - last) / (hi - lo) : (last - lo) / (hi - lo);
	return {
		overlays: [{
			kind: "zigzag",
			id: "swing",
			label: "Swing",
			points: [a, b],
			color: C$1.warn
		}, {
			kind: "levels",
			id: "fib",
			label: "Fib",
			levels
		}],
		oscillators: [],
		signals: [],
		stats: [
			{
				label: "Swing",
				value: `${formatNum(lo)} → ${formatNum(hi)}`
			},
			{
				label: "Retrace",
				value: formatPct(pos)
			},
			{
				label: "0.618",
				value: formatNum(levels[4].price)
			}
		]
	};
}
function hurst(bars, period) {
	const c = closes$1(bars);
	const out = Array(c.length).fill(null);
	for (let i = period; i < c.length; i++) {
		const window = c.slice(i - period, i);
		const rets = [];
		for (let k = 1; k < window.length; k++) rets.push(Math.log(window[k] / window[k - 1]));
		out[i] = hurstRS(rets);
	}
	const h = lastNumber(out) ?? .5;
	let regime = "Ngẫu nhiên";
	if (h > .55) regime = "Xu hướng (H>0.5)";
	if (h < .45) regime = "Mean-reversion (H<0.5)";
	return {
		overlays: [],
		oscillators: [{
			id: "hurst",
			label: "Hurst",
			min: .2,
			max: .8,
			guides: [
				.45,
				.5,
				.55
			],
			series: [{
				id: "H",
				color: C$1.primary,
				values: out
			}]
		}],
		signals: [],
		stats: [{
			label: "H",
			value: formatNum(h, 2)
		}, {
			label: "Chế độ",
			value: regime
		}]
	};
}
function hurstRS(rets) {
	const n = rets.length;
	if (n < 16) return .5;
	const mean = rets.reduce((s, v) => s + v, 0) / n;
	const dev = rets.map((v) => v - mean);
	const cum = [];
	let acc = 0;
	for (const d of dev) {
		acc += d;
		cum.push(acc);
	}
	const R = Math.max(...cum) - Math.min(...cum);
	const varr = dev.reduce((s, d) => s + d * d, 0) / n;
	const S = Math.sqrt(varr);
	if (S === 0 || R === 0) return .5;
	return Math.log(R / S) / Math.log(n);
}
function emptyResult() {
	return {
		overlays: [],
		oscillators: [],
		signals: [],
		stats: []
	};
}
var C = C$1;
function closes(bars) {
	return bars.map((b) => b.c);
}
function highs(bars) {
	return bars.map((b) => b.h);
}
function lows(bars) {
	return bars.map((b) => b.l);
}
function fwd(bars, signals, horizon = 10) {
	if (signals.length === 0) return [
		{
			label: "Tín hiệu",
			value: "0"
		},
		{
			label: "Hit-rate 10 nến",
			value: "—"
		},
		{
			label: "Avg. move",
			value: "—"
		}
	];
	let hits = 0;
	let counted = 0;
	let sum = 0;
	for (const s of signals) {
		const j = Math.min(bars.length - 1, s.i + horizon);
		if (j <= s.i) continue;
		const ret = (bars[j].c - s.price) / s.price;
		const signed = s.side === "buy" ? ret : -ret;
		sum += signed;
		counted += 1;
		if (signed > 0) hits += 1;
	}
	return [
		{
			label: "Tín hiệu",
			value: String(signals.length)
		},
		{
			label: "Hit-rate 10 nến",
			value: counted ? formatPct(hits / counted) : "—"
		},
		{
			label: "Avg. move",
			value: counted ? formatPct(sum / counted) : "—"
		}
	];
}
function vwapReset(bars, reset) {
	const n = bars.length;
	const val = Array(n).fill(null);
	let pv = 0;
	let vol = 0;
	let count = 0;
	for (let i = 0; i < n; i++) {
		if (count === 0) {
			pv = 0;
			vol = 0;
		}
		const tp = (bars[i].h + bars[i].l + bars[i].c) / 3;
		pv += tp * bars[i].v;
		vol += bars[i].v;
		val[i] = vol === 0 ? tp : pv / vol;
		count += 1;
		if (count >= reset) count = 0;
	}
	return val;
}
function cross(a, b, price) {
	const sig = [];
	for (let i = 1; i < a.length; i++) {
		const a0 = a[i - 1];
		const a1 = a[i];
		const b0 = b[i - 1];
		const b1 = b[i];
		if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
		if (a0 <= b0 && a1 > b1) sig.push({
			i,
			side: "buy",
			price: price[i]
		});
		if (a0 >= b0 && a1 < b1) sig.push({
			i,
			side: "sell",
			price: price[i]
		});
	}
	return sig;
}
function turtle(bars, entryN, exitN) {
	const n = bars.length;
	const H = highs(bars);
	const L = lows(bars);
	const c = closes(bars);
	const eU = Array(n).fill(null);
	const eL = Array(n).fill(null);
	const xU = Array(n).fill(null);
	const xL = Array(n).fill(null);
	const signals = [];
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
			if (c[i] > eU[i]) {
				signals.push({
					i,
					side: "buy",
					price: c[i],
					note: `Break ${entryN}`
				});
				pos = 1;
			} else if (c[i] < eL[i]) {
				signals.push({
					i,
					side: "sell",
					price: c[i],
					note: `Break ${entryN}`
				});
				pos = -1;
			}
		} else if (pos === 1 && xL[i] != null && c[i] < xL[i]) {
			signals.push({
				i,
				side: "sell",
				price: c[i],
				note: `Exit ${exitN}`
			});
			pos = 0;
		} else if (pos === -1 && xU[i] != null && c[i] > xU[i]) {
			signals.push({
				i,
				side: "buy",
				price: c[i],
				note: `Exit ${exitN}`
			});
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
				lowerColor: C.down
			},
			{
				kind: "line",
				id: "xU",
				label: `Exit ${exitN} H`,
				color: C.muted,
				values: xU,
				dashed: true,
				width: 1
			},
			{
				kind: "line",
				id: "xL",
				label: `Exit ${exitN} L`,
				color: C.muted,
				values: xL,
				dashed: true,
				width: 1
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [{
			label: "Vị thế",
			value: pos === 1 ? "Long" : pos === -1 ? "Short" : "Flat"
		}, ...fwd(bars, signals, exitN)]
	};
}
function turtleS1(bars, entry, exit) {
	return turtle(bars, entry, exit);
}
function turtleS2(bars, entry, exit) {
	return turtle(bars, entry, exit);
}
function donchianEma(bars, don, maN) {
	const n = bars.length;
	const H = highs(bars);
	const L = lows(bars);
	const c = closes(bars);
	const ma = ema(c, maN);
	const upper = Array(n).fill(null);
	const lower = Array(n).fill(null);
	const signals = [];
	for (let i = Math.max(don, maN); i < n; i++) {
		upper[i] = highest(H, don, i - 1);
		lower[i] = lowest(L, don, i - 1);
		if (ma[i] == null || upper[i] == null) continue;
		if (c[i] > upper[i] && c[i] > ma[i]) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i] < lower[i] && c[i] < ma[i]) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
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
				lowerColor: C.muted
			},
			{
				kind: "line",
				id: "ema",
				label: `EMA ${maN}`,
				color: C.warn,
				values: ma,
				width: 1.6
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [{
			label: `EMA ${maN}`,
			value: formatNum(lastNumber(ma) ?? NaN)
		}, ...fwd(bars, signals)]
	};
}
function emaCross(bars, fast, slow) {
	const c = closes(bars);
	const a = ema(c, fast);
	const b = ema(c, slow);
	const signals = cross(a, b, c);
	return {
		overlays: [
			{
				kind: "line",
				id: "fast",
				label: `EMA ${fast}`,
				color: C.up,
				values: a,
				width: 1.4
			},
			{
				kind: "line",
				id: "slow",
				label: `EMA ${slow}`,
				color: C.down,
				values: b,
				width: 1.6
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [
			{
				label: `EMA ${fast}`,
				value: formatNum(lastNumber(a) ?? NaN)
			},
			{
				label: `EMA ${slow}`,
				value: formatNum(lastNumber(b) ?? NaN)
			},
			...fwd(bars, signals)
		]
	};
}
function macdStrategy(bars, fast, slow, sigN) {
	const c = closes(bars);
	const eF = ema(c, fast);
	const eS = ema(c, slow);
	const line = c.map((_, i) => eF[i] == null || eS[i] == null ? null : eF[i] - eS[i]);
	const sig = ema(line, sigN);
	const hist = line.map((v, i) => v == null || sig[i] == null ? null : v - sig[i]);
	const histColors = hist.map((v) => v == null ? null : v >= 0 ? C.up : C.down);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (line[i] == null || sig[i] == null || hist[i] == null) continue;
		if (line[i - 1] <= sig[i - 1] && line[i] > sig[i] && hist[i] > 0) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (line[i - 1] >= sig[i - 1] && line[i] < sig[i] && hist[i] < 0) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "macd",
			label: "MACD",
			min: -1,
			max: 1,
			zero: 0,
			series: [
				{
					id: "hist",
					color: C.muted,
					values: hist,
					type: "hist",
					histColors
				},
				{
					id: "macd",
					color: C.primary,
					values: line
				},
				{
					id: "sig",
					color: C.down,
					values: sig
				}
			]
		}],
		signals,
		stats: [{
			label: "MACD",
			value: formatNum(lastNumber(line) ?? NaN, 3)
		}, ...fwd(bars, signals)]
	};
}
function rsiStrategy(bars, period, ob, os) {
	const c = closes(bars);
	const r = rsi(c, period);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (r[i] == null || r[i - 1] == null) continue;
		if (r[i - 1] < os && r[i] >= os) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Thoát OS"
		});
		if (r[i - 1] > ob && r[i] <= ob) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Thoát OB"
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "rsi",
			label: `RSI ${period}`,
			min: 0,
			max: 100,
			guides: [
				os,
				50,
				ob
			],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}]
		}],
		signals,
		stats: [{
			label: "RSI",
			value: formatNum(lastNumber(r) ?? NaN, 1)
		}, ...fwd(bars, signals)]
	};
}
function bbStrategy(bars, period, k) {
	const c = closes(bars);
	const mid = sma(c, period);
	const sd = stdev(c, period);
	const upper = mid.map((v, i) => v == null || sd[i] == null ? null : v + k * sd[i]);
	const lower = mid.map((v, i) => v == null || sd[i] == null ? null : v - k * sd[i]);
	const r = rsi(c, 14);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (lower[i] == null || upper[i] == null || r[i] == null) continue;
		if (c[i] < lower[i] && r[i] < 35) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i] > upper[i] && r[i] > 65) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "bb",
			label: "BB",
			upper,
			lower,
			mid,
			fill: "rgba(168,184,200,0.12)",
			upperColor: C.muted,
			lowerColor: C.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "rsi",
			label: "RSI 14",
			min: 0,
			max: 100,
			guides: [30, 70],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}]
		}],
		signals,
		stats: [{
			label: "Mid",
			value: formatNum(lastNumber(mid) ?? NaN)
		}, ...fwd(bars, signals)]
	};
}
function stochStrategy(bars, kN, dN) {
	const n = bars.length;
	const H = highs(bars);
	const L = lows(bars);
	const raw = Array(n).fill(null);
	for (let i = kN - 1; i < n; i++) {
		const hh = highest(H, kN, i);
		const ll = lowest(L, kN, i);
		raw[i] = hh === ll ? 50 : (bars[i].c - ll) / (hh - ll) * 100;
	}
	const k = sma(raw, 3);
	const d = sma(k, dN);
	const signals = [];
	for (let i = 1; i < n; i++) {
		if (k[i] == null || d[i] == null || k[i - 1] == null || d[i - 1] == null) continue;
		if (k[i - 1] <= d[i - 1] && k[i] > d[i] && k[i] < 25) signals.push({
			i,
			side: "buy",
			price: bars[i].c
		});
		if (k[i - 1] >= d[i - 1] && k[i] < d[i] && k[i] > 75) signals.push({
			i,
			side: "sell",
			price: bars[i].c
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "stoch",
			label: "Stochastic",
			min: 0,
			max: 100,
			guides: [20, 80],
			series: [{
				id: "%K",
				color: C.primary,
				values: k
			}, {
				id: "%D",
				color: C.down,
				values: d
			}]
		}],
		signals,
		stats: [{
			label: "%K",
			value: formatNum(lastNumber(k) ?? NaN, 1)
		}, ...fwd(bars, signals)]
	};
}
function keltnerBreak(bars, period, mult) {
	const c = closes(bars);
	const mid = ema(c, period);
	const a = atr(bars, period);
	const upper = mid.map((v, i) => v == null || a[i] == null ? null : v + mult * a[i]);
	const lower = mid.map((v, i) => v == null || a[i] == null ? null : v - mult * a[i]);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (upper[i - 1] == null || lower[i - 1] == null) continue;
		if (c[i] > upper[i - 1]) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (c[i] < lower[i - 1]) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "kc",
			label: "Keltner",
			upper,
			lower,
			mid,
			fill: "rgba(168,184,200,0.12)",
			upperColor: C.up,
			lowerColor: C.down
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [{
			label: "EMA",
			value: formatNum(lastNumber(mid) ?? NaN)
		}, ...fwd(bars, signals)]
	};
}
function connorsRsi2(bars, rsiN, maN, thresh) {
	const c = closes(bars);
	const r = rsi(c, rsiN);
	const ma = sma(c, maN);
	const sma5 = sma(c, 5);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (r[i] == null || ma[i] == null) continue;
		if (c[i] > ma[i] && r[i] < thresh && (r[i - 1] == null || r[i - 1] >= thresh)) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: `RSI(${rsiN})<${thresh}`
		});
		if (sma5[i] != null && c[i - 1] <= sma5[i - 1] && c[i] > sma5[i]) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Exit SMA5"
		});
	}
	return {
		overlays: [
			{
				kind: "line",
				id: "ma",
				label: `SMA ${maN}`,
				color: C.warn,
				values: ma,
				width: 1.5
			},
			{
				kind: "line",
				id: "s5",
				label: "SMA 5",
				color: C.muted,
				values: sma5,
				width: 1,
				dashed: true
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [{
			id: "rsi2",
			label: `RSI ${rsiN}`,
			min: 0,
			max: 100,
			guides: [thresh, 70],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}]
		}],
		signals,
		stats: [
			{
				label: `RSI ${rsiN}`,
				value: formatNum(lastNumber(r) ?? NaN, 1)
			},
			{
				label: "Filter",
				value: (lastNumber(c) ?? 0) > (lastNumber(ma) ?? 0) ? "Trên MA" : "Dưới MA"
			},
			...fwd(bars, signals, 5)
		]
	};
}
function connorsCrsi(bars, rsiN, sumN, maN, thresh) {
	const c = closes(bars);
	const r = rsi(c, rsiN);
	const cr = Array(c.length).fill(null);
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
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (cr[i] == null || ma[i] == null) continue;
		if (c[i] > ma[i] && cr[i] < thresh && (cr[i - 1] ?? 100) >= thresh) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: `CRSI<${thresh}`
		});
		if (r[i] != null && r[i - 1] != null && r[i - 1] <= 70 && r[i] > 70) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "RSI>70"
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "ma",
			label: `SMA ${maN}`,
			color: C.warn,
			values: ma,
			width: 1.5
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "crsi",
			label: `Cumulative RSI(${rsiN})×${sumN}`,
			min: 0,
			max: 100 * sumN,
			guides: [thresh],
			series: [{
				id: "crsi",
				color: C.primary,
				values: cr
			}]
		}],
		signals,
		stats: [{
			label: "CRSI",
			value: formatNum(lastNumber(cr) ?? NaN, 1)
		}, ...fwd(bars, signals, 5)]
	};
}
function ttmSqueeze(bars, period, bbK, kcM) {
	const c = closes(bars);
	const mid = sma(c, period);
	const sd = stdev(c, period);
	const a = atr(bars, period);
	const emaMid = ema(c, period);
	const bbU = mid.map((v, i) => v == null || sd[i] == null ? null : v + bbK * sd[i]);
	const bbL = mid.map((v, i) => v == null || sd[i] == null ? null : v - bbK * sd[i]);
	const kcU = emaMid.map((v, i) => v == null || a[i] == null ? null : v + kcM * a[i]);
	const kcL = emaMid.map((v, i) => v == null || a[i] == null ? null : v - kcM * a[i]);
	const sq = Array(c.length).fill(null);
	const mom = Array(c.length).fill(null);
	for (let i = period; i < c.length; i++) {
		if (bbU[i] == null || kcU[i] == null) continue;
		sq[i] = bbU[i] < kcU[i] && bbL[i] > kcL[i] ? 1 : 0;
		const { slope } = linreg(c.slice(i - period + 1, i + 1));
		mom[i] = slope;
	}
	const momC = mom.map((v) => v == null ? null : v >= 0 ? C.up : C.down);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (sq[i] == null || sq[i - 1] == null || mom[i] == null) continue;
		if (sq[i - 1] === 1 && sq[i] === 0) signals.push({
			i,
			side: mom[i] >= 0 ? "buy" : "sell",
			price: c[i],
			note: "Squeeze fire"
		});
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
				lowerColor: C.muted
			},
			{
				kind: "line",
				id: "kcU",
				label: "KC U",
				color: C.up,
				values: kcU,
				dashed: true,
				width: 1
			},
			{
				kind: "line",
				id: "kcL",
				label: "KC L",
				color: C.down,
				values: kcL,
				dashed: true,
				width: 1
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [{
			id: "sq",
			label: "Squeeze / Mom",
			min: -1,
			max: 1,
			zero: 0,
			series: [{
				id: "mom",
				color: C.primary,
				values: mom,
				type: "hist",
				histColors: momC
			}, {
				id: "sq",
				color: C.warn,
				values: sq.map((v) => v == null ? null : v === 1 ? .2 : null)
			}]
		}],
		signals,
		stats: [
			{
				label: "Squeeze",
				value: lastNumber(sq) === 1 ? "ON" : "OFF"
			},
			{
				label: "Mom",
				value: formatNum(lastNumber(mom) ?? NaN, 3)
			},
			...fwd(bars, signals)
		]
	};
}
function vwapZscore(bars, reset, win, z) {
	const vw = vwapReset(bars, reset);
	const diff = bars.map((b) => (b.h + b.l + b.c) / 3).map((v, i) => vw[i] == null ? null : v - vw[i]);
	const sd = stdev(diff, win);
	const zs = diff.map((v, i) => v == null || sd[i] == null || sd[i] === 0 ? null : v / sd[i]);
	const signals = [];
	for (let i = 1; i < bars.length; i++) {
		if (zs[i] == null || zs[i - 1] == null) continue;
		if (zs[i] < -z && zs[i - 1] >= -z) signals.push({
			i,
			side: "buy",
			price: bars[i].c,
			note: "Z fade"
		});
		if (zs[i] > z && zs[i - 1] <= z) signals.push({
			i,
			side: "sell",
			price: bars[i].c,
			note: "Z fade"
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "vwap",
			label: "VWAP",
			color: C.warn,
			values: vw,
			width: 1.6
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "z",
			label: "VWAP Z",
			min: -3,
			max: 3,
			zero: 0,
			guides: [
				-z,
				0,
				z
			],
			series: [{
				id: "z",
				color: C.primary,
				values: zs
			}]
		}],
		signals,
		stats: [{
			label: "Z",
			value: formatNum(lastNumber(zs) ?? NaN, 2)
		}, ...fwd(bars, signals, 6)]
	};
}
function vwapReclaim(bars, reset) {
	const vw = vwapReset(bars, reset);
	const c = closes(bars);
	const signals = [];
	for (let i = 2; i < c.length; i++) {
		if (vw[i] == null || vw[i - 1] == null || vw[i - 2] == null) continue;
		if (c[i - 1] < vw[i - 1] && c[i - 2] >= vw[i - 2] && c[i] > vw[i]) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Reclaim"
		});
		if (c[i - 1] > vw[i - 1] && c[i - 2] <= vw[i - 2] && c[i] < vw[i]) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Reject"
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "vwap",
			label: "VWAP",
			color: C.warn,
			values: vw,
			width: 1.7
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [{
			label: "VWAP",
			value: formatNum(lastNumber(vw) ?? NaN)
		}, ...fwd(bars, signals, 6)]
	};
}
function e0v1e(bars, fast, slow, reset) {
	const c = closes(bars);
	const e1 = ema(c, fast);
	const e2 = ema(c, slow);
	const vw = vwapReset(bars, reset);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (e1[i] == null || e2[i] == null || vw[i] == null) continue;
		const bull = e1[i] > e2[i] && c[i] > vw[i];
		const bear = e1[i] < e2[i] && c[i] < vw[i];
		if (bull && c[i - 1] < e1[i - 1] && c[i] > e1[i]) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Reclaim EMA"
		});
		if (bear && c[i - 1] > e1[i - 1] && c[i] < e1[i]) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Reject EMA"
		});
	}
	return {
		overlays: [
			{
				kind: "line",
				id: "e1",
				label: `EMA ${fast}`,
				color: C.up,
				values: e1,
				width: 1.3
			},
			{
				kind: "line",
				id: "e2",
				label: `EMA ${slow}`,
				color: C.down,
				values: e2,
				width: 1.4
			},
			{
				kind: "line",
				id: "vw",
				label: "VWAP",
				color: C.warn,
				values: vw,
				width: 1.6
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [{
			label: "Stack",
			value: (lastNumber(e1) ?? 0) > (lastNumber(e2) ?? 0) ? "EMA bull" : "EMA bear"
		}, ...fwd(bars, signals, 6)]
	};
}
function stochRsi(bars, rsiN, kN, dN) {
	const c = closes(bars);
	const r = rsi(c, rsiN);
	const n = c.length;
	const raw = Array(n).fill(null);
	const rNum = r.map((v) => v ?? 50);
	for (let i = kN; i < n; i++) {
		if (r[i] == null) continue;
		const hh = highest(rNum, kN, i);
		const ll = lowest(rNum, kN, i);
		raw[i] = hh === ll ? 50 : (r[i] - ll) / (hh - ll) * 100;
	}
	const k = sma(raw, 3);
	const d = sma(k, dN);
	const signals = cross(k, d, c).filter((s) => {
		const kv = k[s.i];
		if (kv == null) return false;
		return s.side === "buy" ? kv < 25 : kv > 75;
	});
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "srsi",
			label: "Stoch RSI",
			min: 0,
			max: 100,
			guides: [20, 80],
			series: [{
				id: "%K",
				color: C.primary,
				values: k
			}, {
				id: "%D",
				color: C.down,
				values: d
			}]
		}],
		signals,
		stats: [{
			label: "StochRSI",
			value: formatNum(lastNumber(k) ?? NaN, 1)
		}, ...fwd(bars, signals)]
	};
}
function rsi7Mom(bars, period) {
	const c = closes(bars);
	const r = rsi(c, period);
	const emaR = ema(r, 5);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (r[i] == null || emaR[i] == null) continue;
		if (r[i - 1] <= 50 && r[i] > 50 && r[i] > (emaR[i] ?? 0)) signals.push({
			i,
			side: "buy",
			price: c[i]
		});
		if (r[i - 1] >= 50 && r[i] < 50 && r[i] < (emaR[i] ?? 100)) signals.push({
			i,
			side: "sell",
			price: c[i]
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "rsi",
			label: `RSI ${period}`,
			min: 0,
			max: 100,
			guides: [50],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}, {
				id: "ema",
				color: C.muted,
				values: emaR
			}]
		}],
		signals,
		stats: [{
			label: `RSI ${period}`,
			value: formatNum(lastNumber(r) ?? NaN, 1)
		}, ...fwd(bars, signals, 7)]
	};
}
function weinstein(bars, maN, slopeN) {
	const c = closes(bars);
	const ma = sma(c, maN);
	const vol = sma(bars.map((b) => b.v), maN);
	const stage = Array(c.length).fill(null);
	const signals = [];
	for (let i = maN + slopeN; i < c.length; i++) {
		if (ma[i] == null || ma[i - slopeN] == null || vol[i] == null) continue;
		const slope = ma[i] - ma[i - slopeN];
		const above = c[i] > ma[i];
		const volUp = bars[i].v > vol[i];
		let s = 1;
		if (above && slope > 0) s = volUp ? 2 : 2;
		else if (above && slope <= 0) s = 3;
		else if (!above && slope < 0) s = 4;
		else s = 1;
		stage[i] = s;
		if (stage[i - 1] != null && stage[i - 1] !== 2 && s === 2) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Stage 2"
		});
		if (stage[i - 1] === 2 && s >= 3) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: `Stage ${s}`
		});
	}
	const last = lastNumber(stage);
	const label = last === 2 ? "Stage 2 — advancing" : last === 3 ? "Stage 3 — topping" : last === 4 ? "Stage 4 — declining" : "Stage 1 — basing";
	return {
		overlays: [{
			kind: "line",
			id: "ma",
			label: `SMA ${maN}`,
			color: C.primary,
			values: ma,
			width: 1.7
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "stage",
			label: "Weinstein stage",
			min: 0,
			max: 5,
			guides: [2],
			series: [{
				id: "st",
				color: C.warn,
				values: stage,
				type: "hist",
				histColors: stage.map((v) => v === 2 ? C.up : v === 4 ? C.down : C.muted)
			}]
		}],
		signals,
		stats: [
			{
				label: "Pha",
				value: label
			},
			{
				label: "SMA",
				value: formatNum(lastNumber(ma) ?? NaN)
			},
			...fwd(bars, signals, 20)
		]
	};
}
function tpMr(bars, fast, slow, bbN, rsiN) {
	const c = closes(bars);
	const eF = ema(c, fast);
	const eS = ema(c, slow);
	const mid = sma(c, bbN);
	const sd = stdev(c, bbN);
	const upper = mid.map((v, i) => v == null || sd[i] == null ? null : v + 2 * sd[i]);
	const lower = mid.map((v, i) => v == null || sd[i] == null ? null : v - 2 * sd[i]);
	const r = rsi(c, rsiN);
	const signals = [];
	for (let i = 2; i < c.length; i++) {
		if (eF[i] == null || eS[i] == null || r[i] == null) continue;
		const trendUp = eF[i] > eS[i];
		const trendDn = eF[i] < eS[i];
		if (trendUp && c[i - 1] <= eF[i - 1] && c[i] > eF[i] && r[i] < 55) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "TP"
		});
		if (trendDn && c[i - 1] >= eF[i - 1] && c[i] < eF[i] && r[i] > 45) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "TP"
		});
		const rangeLike = Math.abs(eF[i] - eS[i]) / c[i] < .012;
		if (rangeLike && lower[i] != null && c[i] < lower[i] && r[i] < 30) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "MR"
		});
		if (rangeLike && upper[i] != null && c[i] > upper[i] && r[i] > 70) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "MR"
		});
	}
	return {
		overlays: [
			{
				kind: "line",
				id: "ef",
				label: `EMA ${fast}`,
				color: C.up,
				values: eF,
				width: 1.3
			},
			{
				kind: "line",
				id: "es",
				label: `EMA ${slow}`,
				color: C.down,
				values: eS,
				width: 1.5
			},
			{
				kind: "band",
				id: "bb",
				label: "BB",
				upper,
				lower,
				mid,
				fill: "rgba(168,184,200,0.08)",
				upperColor: C.muted,
				lowerColor: C.muted
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [{
			id: "rsi",
			label: `RSI ${rsiN}`,
			min: 0,
			max: 100,
			guides: [30, 70],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}]
		}],
		signals,
		stats: [{
			label: "Mode",
			value: (lastNumber(eF) ?? 0) > (lastNumber(eS) ?? 0) ? "TP tăng" : "TP giảm"
		}, ...fwd(bars, signals)]
	};
}
function orb(bars, session, rangeN) {
	const n = bars.length;
	const upper = Array(n).fill(null);
	const lower = Array(n).fill(null);
	const signals = [];
	for (let i = 0; i < n; i++) {
		const pos = i % session;
		const start = i - pos;
		const end = Math.min(start + rangeN - 1, i);
		let hh = -Infinity;
		let ll = Infinity;
		for (let k = start; k <= end; k++) {
			hh = Math.max(hh, bars[k].h);
			ll = Math.min(ll, bars[k].l);
		}
		upper[i] = hh;
		lower[i] = ll;
		if (pos === rangeN) {
			if (bars[i].c > hh) signals.push({
				i,
				side: "buy",
				price: bars[i].c,
				note: "ORB"
			});
			if (bars[i].c < ll) signals.push({
				i,
				side: "sell",
				price: bars[i].c,
				note: "ORB"
			});
		} else if (pos > rangeN && upper[i - 1] != null) {
			if (bars[i - 1].c <= upper[i - 1] && bars[i].c > upper[i]) signals.push({
				i,
				side: "buy",
				price: bars[i].c,
				note: "ORB late"
			});
			if (bars[i - 1].c >= lower[i - 1] && bars[i].c < lower[i]) signals.push({
				i,
				side: "sell",
				price: bars[i].c,
				note: "ORB late"
			});
		}
	}
	return {
		overlays: [{
			kind: "band",
			id: "orb",
			label: "Opening range",
			upper,
			lower,
			fill: "rgba(196,184,168,0.10)",
			upperColor: C.warn,
			lowerColor: C.warn
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [],
		signals,
		stats: [
			{
				label: "OR high",
				value: formatNum(lastNumber(upper) ?? NaN)
			},
			{
				label: "OR low",
				value: formatNum(lastNumber(lower) ?? NaN)
			},
			...fwd(bars, signals, 8)
		]
	};
}
function tsm(bars, lookback) {
	const c = closes(bars);
	const mom = Array(c.length).fill(null);
	const signals = [];
	for (let i = lookback; i < c.length; i++) {
		const ret = c[i] / c[i - lookback] - 1;
		mom[i] = ret;
		const prev = mom[i - 1];
		if (prev == null) continue;
		if (prev <= 0 && ret > 0) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "TSMOM+"
		});
		if (prev >= 0 && ret < 0) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "TSMOM−"
		});
	}
	return {
		overlays: [{
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "tsm",
			label: "Time-series momentum",
			min: -.3,
			max: .3,
			zero: 0,
			series: [{
				id: "m",
				color: C.primary,
				values: mom
			}]
		}],
		signals,
		stats: [
			{
				label: "TSMOM",
				value: formatPct(lastNumber(mom) ?? NaN)
			},
			{
				label: "Bias",
				value: (lastNumber(mom) ?? 0) > 0 ? "Long" : "Short"
			},
			...fwd(bars, signals, lookback / 4)
		]
	};
}
function week52(bars, lookback) {
	const n = bars.length;
	const H = highs(bars);
	const L = lows(bars);
	const hh = Array(n).fill(null);
	const ll = Array(n).fill(null);
	const signals = [];
	for (let i = lookback; i < n; i++) {
		hh[i] = highest(H, lookback, i - 1);
		ll[i] = lowest(L, lookback, i - 1);
		if (bars[i].c > hh[i]) signals.push({
			i,
			side: "buy",
			price: bars[i].c,
			note: "High mới"
		});
		if (bars[i].c < ll[i]) signals.push({
			i,
			side: "sell",
			price: bars[i].c,
			note: "Low mới"
		});
	}
	return {
		overlays: [
			{
				kind: "line",
				id: "hh",
				label: "High N",
				color: C.up,
				values: hh,
				dashed: true,
				width: 1
			},
			{
				kind: "line",
				id: "ll",
				label: "Low N",
				color: C.down,
				values: ll,
				dashed: true,
				width: 1
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [{
			label: "High",
			value: formatNum(lastNumber(hh) ?? NaN)
		}, ...fwd(bars, signals, 15)]
	};
}
function maGravity(bars, maN, band) {
	const c = closes(bars);
	const ma = sma(c, maN);
	const dist = c.map((v, i) => ma[i] == null || ma[i] === 0 ? null : (v - ma[i]) / ma[i]);
	const upper = ma.map((v) => v == null ? null : v * (1 + band));
	const lower = ma.map((v) => v == null ? null : v * (1 - band));
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (lower[i] == null || upper[i] == null || ma[i] == null) continue;
		if (c[i] <= lower[i] && c[i - 1] > (lower[i - 1] ?? c[i - 1])) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Stretch"
		});
		if (c[i] >= upper[i] && c[i - 1] < (upper[i - 1] ?? c[i - 1])) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Stretch"
		});
		if (c[i - 1] < ma[i - 1] && c[i] >= ma[i]) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "Tag MA"
		});
		if (c[i - 1] > ma[i - 1] && c[i] <= ma[i]) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Lose MA"
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "g",
			label: "MA gravity",
			upper,
			lower,
			mid: ma,
			fill: "rgba(168,184,200,0.10)",
			upperColor: C.muted,
			lowerColor: C.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "dist",
			label: "Distance %",
			min: -.15,
			max: .15,
			zero: 0,
			series: [{
				id: "d",
				color: C.primary,
				values: dist
			}]
		}],
		signals,
		stats: [
			{
				label: `SMA ${maN}`,
				value: formatNum(lastNumber(ma) ?? NaN)
			},
			{
				label: "Dist",
				value: formatPct(lastNumber(dist) ?? NaN)
			},
			...fwd(bars, signals, 10)
		]
	};
}
function turnOfMonth(bars, maN) {
	const c = closes(bars);
	const ma = sma(c, maN);
	const tom = Array(c.length).fill(null);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		const d = new Date(bars[i].t);
		const day = d.getUTCDate();
		const on = day >= new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() - 1 || day <= 3;
		tom[i] = on ? 1 : 0;
		const prev = new Date(bars[i - 1].t);
		const prevOn = prev.getUTCDate() >= new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 0)).getUTCDate() - 1 || prev.getUTCDate() <= 3;
		if (on && !prevOn && ma[i] != null && c[i] > ma[i]) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "ToM"
		});
		if (!on && prevOn) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "Hết cửa sổ"
		});
	}
	return {
		overlays: [{
			kind: "line",
			id: "ma",
			label: `SMA ${maN}`,
			color: C.primary,
			values: ma,
			width: 1.4
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "tom",
			label: "Cửa sổ ToM",
			min: 0,
			max: 1.2,
			series: [{
				id: "tom",
				color: C.warn,
				values: tom,
				type: "hist",
				histColors: tom.map((v) => v ? C.warn : null)
			}]
		}],
		signals,
		stats: [{
			label: "ToM",
			value: lastNumber(tom) === 1 ? "Trong cửa sổ" : "Ngoài"
		}, ...fwd(bars, signals, 8)]
	};
}
function turtleSoup(bars, don, fail) {
	const n = bars.length;
	const H = highs(bars);
	const L = lows(bars);
	const c = closes(bars);
	const hh = Array(n).fill(null);
	const ll = Array(n).fill(null);
	const signals = [];
	let lastHighI = -99;
	let lastLowI = -99;
	let lastHigh = 0;
	let lastLow = 0;
	for (let i = don; i < n; i++) {
		hh[i] = highest(H, don, i - 1);
		ll[i] = lowest(L, don, i - 1);
		if (c[i] > hh[i]) {
			lastHighI = i;
			lastHigh = hh[i];
		} else if (lastHighI >= 0 && i - lastHighI <= fail && c[i] < lastHigh) {
			signals.push({
				i,
				side: "sell",
				price: c[i],
				note: "Soup fade high"
			});
			lastHighI = -99;
		}
		if (c[i] < ll[i]) {
			lastLowI = i;
			lastLow = ll[i];
		} else if (lastLowI >= 0 && i - lastLowI <= fail && c[i] > lastLow) {
			signals.push({
				i,
				side: "buy",
				price: c[i],
				note: "Soup fade low"
			});
			lastLowI = -99;
		}
	}
	return {
		overlays: [
			{
				kind: "line",
				id: "hh",
				label: `Don ${don} H`,
				color: C.up,
				values: hh,
				dashed: true,
				width: 1
			},
			{
				kind: "line",
				id: "ll",
				label: `Don ${don} L`,
				color: C.down,
				values: ll,
				dashed: true,
				width: 1
			},
			{
				kind: "markers",
				id: "sig",
				items: signals
			}
		],
		oscillators: [],
		signals,
		stats: [{
			label: "Donchian",
			value: String(don)
		}, ...fwd(bars, signals, 8)]
	};
}
function rsiBbFade(bars, rsiN, bbN, k, os) {
	const c = closes(bars);
	const r = rsi(c, rsiN);
	const mid = sma(c, bbN);
	const sd = stdev(c, bbN);
	const upper = mid.map((v, i) => v == null || sd[i] == null ? null : v + k * sd[i]);
	const lower = mid.map((v, i) => v == null || sd[i] == null ? null : v - k * sd[i]);
	const signals = [];
	for (let i = 1; i < c.length; i++) {
		if (r[i] == null || lower[i] == null || upper[i] == null) continue;
		if (c[i] <= lower[i] && r[i] < os) signals.push({
			i,
			side: "buy",
			price: c[i],
			note: "RSI+BB"
		});
		if (c[i] >= upper[i] && r[i] > 100 - os) signals.push({
			i,
			side: "sell",
			price: c[i],
			note: "RSI+BB"
		});
	}
	return {
		overlays: [{
			kind: "band",
			id: "bb",
			label: "BB",
			upper,
			lower,
			mid,
			fill: "rgba(168,184,200,0.12)",
			upperColor: C.muted,
			lowerColor: C.muted
		}, {
			kind: "markers",
			id: "sig",
			items: signals
		}],
		oscillators: [{
			id: "rsi",
			label: `RSI ${rsiN}`,
			min: 0,
			max: 100,
			guides: [os, 100 - os],
			series: [{
				id: "rsi",
				color: C.primary,
				values: r
			}]
		}],
		signals,
		stats: [{
			label: "RSI",
			value: formatNum(lastNumber(r) ?? NaN, 1)
		}, ...fwd(bars, signals, 6)]
	};
}
function runAlgorithm(slug, bars, params) {
	const p = (key, fallback) => Number.isFinite(params[key]) ? params[key] : fallback;
	switch (slug) {
		case "supertrend": return supertrend(bars, p("period", 10), p("mult", 3));
		case "adx": return adxDmi(bars, p("period", 14));
		case "ichimoku": return ichimoku(bars, p("tenkan", 9), p("kijun", 26), p("senkou", 52));
		case "ema-ribbon": return emaRibbon(bars, p("fast", 8), p("mid", 21), p("slow", 55));
		case "parabolic-sar": return parabolicSar(bars, p("start", .02), p("max", .2));
		case "donchian": return donchian(bars, p("period", 20));
		case "hma": return hullMa(bars, p("period", 16));
		case "alma": return alma(bars, p("period", 9), p("offset", .85), p("sigma", 6));
		case "kama": return kama(bars, p("period", 10), p("fast", 2), p("slow", 30));
		case "kalman": return kalman(bars, p("q", .02), p("r", .8));
		case "nadaraya-watson": return nadarayaWatson(bars, p("bandwidth", 8), p("mult", 2));
		case "linreg": return linregChannel(bars, p("period", 40), p("k", 2));
		case "zigzag": return zigzag(bars, p("pct", 5));
		case "market-structure": return marketStructure(bars, p("pct", 4));
		case "pivot-points": return pivotPoints(bars, p("lookback", 20));
		case "rsi-div": return rsiDiv(bars, p("period", 14), p("zz", 4));
		case "fisher": return fisherTransform(bars, p("period", 10));
		case "macd": return macd(bars, p("fast", 12), p("slow", 26), p("signal", 9));
		case "stochastic": return stochastic(bars, p("k", 14), p("d", 3));
		case "cci": return cci(bars, p("period", 20));
		case "bollinger": return bollinger(bars, p("period", 20), p("k", 2));
		case "keltner": return keltner(bars, p("period", 20), p("mult", 1.5));
		case "atr": return atrTrail(bars, p("period", 14), p("mult", 2));
		case "vwap": return vwap(bars, p("reset", 40));
		case "obv": return obv(bars);
		case "heikin-ashi": return heikinAshi(bars);
		case "fibonacci": return fibonacci(bars, p("pct", 5));
		case "hurst": return hurst(bars, p("period", 64));
		case "weinstein-s2": return weinstein(bars, p("ma", 30), p("slope", 5));
		case "tp-mr": return tpMr(bars, p("fast", 21), p("slow", 55), p("bb", 20), p("rsi", 14));
		case "macd-strategy": return macdStrategy(bars, p("fast", 12), p("slow", 26), p("signal", 9));
		case "rsi-strategy": return rsiStrategy(bars, p("period", 14), p("ob", 70), p("os", 30));
		case "bb-strategy": return bbStrategy(bars, p("period", 20), p("k", 2));
		case "stoch-strategy": return stochStrategy(bars, p("k", 14), p("d", 3));
		case "ema-cross": return emaCross(bars, p("fast", 12), p("slow", 26));
		case "ema-scalper": return emaCross(bars, p("fast", 9), p("slow", 21));
		case "donchian-turtle": return turtleS1(bars, p("entry", 20), p("exit", 20));
		case "turtle-s1": return turtleS1(bars, p("entry", 20), p("exit", 10));
		case "turtle-s2": return turtleS2(bars, p("entry", 55), p("exit", 20));
		case "donchian-ema200": return donchianEma(bars, p("don", 55), p("ma", 80));
		case "keltner-break": return keltnerBreak(bars, p("period", 20), p("mult", 1.5));
		case "connors-rsi2": return connorsRsi2(bars, p("rsi", 2), p("ma", 50), p("th", 10));
		case "connors-crsi": return connorsCrsi(bars, p("rsi", 2), p("sum", 2), p("ma", 50), p("th", 20));
		case "ttm-squeeze": return ttmSqueeze(bars, p("period", 20), p("bbk", 2), p("kcm", 1.5));
		case "vwap-zscore": return vwapZscore(bars, p("reset", 40), p("win", 16), p("z", 2));
		case "vwap-reclaim": return vwapReclaim(bars, p("reset", 40));
		case "stoch-rsi": return stochRsi(bars, p("rsi", 14), p("k", 14), p("d", 3));
		case "orb": return orb(bars, p("session", 40), p("orb", 5));
		case "rsi7-mom": return rsi7Mom(bars, p("period", 7));
		case "tsm": return tsm(bars, p("lb", 60));
		case "week52-high": return week52(bars, p("lb", 80));
		case "ma200-gravity": return maGravity(bars, p("ma", 80), p("band", .06));
		case "turn-of-month": return turnOfMonth(bars, p("ma", 40));
		case "e0v1e": return e0v1e(bars, p("fast", 9), p("slow", 21), p("reset", 40));
		case "turtle-soup": return turtleSoup(bars, p("don", 20), p("fail", 4));
		case "rsi-bb-fade": return rsiBbFade(bars, p("rsi", 14), p("bb", 20), p("k", 2), p("os", 30));
		default: return {
			overlays: [],
			oscillators: [],
			signals: [],
			stats: []
		};
	}
}
function mergeResults(results) {
	return {
		overlays: results.flatMap((r) => r.overlays),
		oscillators: results.flatMap((r) => r.oscillators),
		signals: results.flatMap((r) => r.signals),
		stats: results.flatMap((r) => r.stats),
		chartBars: results.find((r) => r.chartBars)?.chartBars,
		note: results.map((r) => r.note).filter(Boolean).join(" ")
	};
}
//#endregion
export { mergeResults as a, sma as c, generateMarket as i, stdev as l, SCENARIOS as n, rsi as o, formatPct as r, runAlgorithm as s, Badge as t, wma as u };
