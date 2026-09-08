import { i as __toESM } from "./_runtime.mjs";
import { t as STRATEGIES } from "./_ssr/strategies-uwdh_W5o.mjs";
import { o as require_jsx_runtime, s as require_react } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as Download, l as ArrowLeft, o as Copy, s as Check } from "./_libs/lucide-react.mjs";
import { d as getAlgorithm, l as cn, n as Route, o as Button, u as defaultParams } from "./_ssr/router-CGYLWMI0.mjs";
import { t as CandleChart } from "./_ssr/candle-chart-J2TPDqIR.mjs";
import { a as mergeResults, c as sma, i as generateMarket, l as stdev, o as rsi, r as formatPct, s as runAlgorithm, t as Badge, u as wma } from "./_ssr/run-CzVnzXM9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-BJWCcb0r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KernelBand_default = "# pragma pylint: disable=missing-docstring, invalid-name, pointless-string-statement\n# flake8: noqa: F401\n\"\"\"\nKernelBand — Meridian playbook → Freqtrade IStrategy v3\n\nNadaraya–Watson (Gaussian, **causal**) + 1D Kalman fair-value.\n\nHai chế độ, một chart (đúng luật Meridian / Kernel band):\n\n  1. Kernel DẸT  → mean-reversion. Fade chạm dải MAE, xác nhận RSI,\n     target đường kernel (custom_exit fade_to_kernel).\n  2. Kernel DỐC  → continuation. Break dải cùng chiều Kalman + HMA,\n     trail HMA (custom_exit trail_hma).\n\nKhác chart Meridian\n  Chart encyclopedia dùng kernel HAI PHÍA (s ≤ t và s > t) nên đường giữa\n  \"quá đẹp\" ở giữa mẫu và MÉP PHẢI sẽ sửa khi có nến mới — không trade được.\n  File này chỉ lấy s ≤ t (causal). MAE / σ Kalman là rolling, không global.\n\nBacktest trap đã vá\n  - Entry/exit **market**: limit-at-close trong backtest dễ khớp quá đẹp hoặc miss\n    tùy nến sau. Market ≈ fill open nến kế (cộng slippage config).\n  - Không còn populate_exit_trend HMA cho mọi long — fade bị dump oan. Exit theo\n    enter_tag trong custom_exit.\n  - Không tín hiệu cùng nến vào+ra từ exit_trend.\n  - startup_candle_count = 120 (h=8 → 4h radius + MAE 40 + RSI).\n\n  Trap còn lại (không vá được trong file): hyperopt in-sample; fee 0 trong config;\n  kernel hai phía nếu ai \"sửa\" lại hàm causal.\n\n\nDrop into user_data/strategies/KernelBand.py\n  freqtrade backtesting --strategy KernelBand --timerange 20240101-20260901\n  freqtrade hyperopt   --strategy KernelBand --hyperopt-loss SharpeHyperOptLossDaily \\\\\n                       --spaces buy sell roi stoploss --timerange 20240101-20260901\n\"\"\"\nfrom __future__ import annotations\n\nfrom datetime import datetime\nfrom typing import Optional\n\nimport numpy as np\nimport pandas as pd\nimport talib.abstract as ta\nfrom pandas import DataFrame\n\nimport freqtrade.vendor.qtpylib.indicators as qtpylib\nfrom freqtrade.persistence import Trade\nfrom freqtrade.strategy import DecimalParameter, IntParameter, IStrategy\n\n\n# ── pure indicators (no lookahead) ──────────────────────────────────────────\n\n\ndef wma(arr: np.ndarray, period: int) -> np.ndarray:\n    n = arr.size\n    out = np.full(n, np.nan, dtype=np.float64)\n    p = max(int(period), 1)\n    if n < p:\n        return out\n    w = np.arange(1, p + 1, dtype=np.float64)\n    ws = w.sum()\n    for i in range(p - 1, n):\n        out[i] = float(np.dot(arr[i - p + 1 : i + 1], w) / ws)\n    return out\n\n\ndef hull_ma(close: np.ndarray, period: int) -> np.ndarray:\n    p = max(int(period), 1)\n    half = max(p // 2, 1)\n    sqrtn = max(int(round(np.sqrt(p))), 1)\n    raw = 2.0 * wma(close, half) - wma(close, p)\n    return wma(raw, sqrtn)\n\n\ndef kalman_1d(z: np.ndarray, q: float, r: float) -> np.ndarray:\n    \"\"\"Scalar random-walk Kalman. Same recursion as Meridian (Q process, R measure).\"\"\"\n    n = z.size\n    out = np.empty(n, dtype=np.float64)\n    x = float(z[0]) if n else 0.0\n    p = 1.0\n    q = max(float(q), 1e-9)\n    r = max(float(r), 1e-9)\n    for i in range(n):\n        p = p + q\n        k = p / (p + r)\n        zi = float(z[i])\n        if not np.isfinite(zi):\n            out[i] = x\n            continue\n        x = x + k * (zi - x)\n        p = (1.0 - k) * p\n        out[i] = x\n    return out\n\n\ndef nadaraya_watson_causal(close: np.ndarray, bandwidth: float) -> np.ndarray:\n    \"\"\"\n    ŷ(t) = Σ_{s≤t} K((t−s)/h) P_s / Σ K\n    K(u) = exp(−u² / 2), truncated at 4h.\n\n    Causal on purpose: a two-sided kernel (Meridian chart / TV) looks into\n    future bars and repaints. Do not 'fix' this back to symmetric.\n    \"\"\"\n    n = close.size\n    out = np.empty(n, dtype=np.float64)\n    h = max(float(bandwidth), 1.0)\n    radius = int(np.ceil(h * 4.0))\n    kern = np.exp(-0.5 * (np.arange(radius + 1, dtype=np.float64) / h) ** 2)\n    for i in range(n):\n        span = min(radius, i)\n        window = close[i - span : i + 1]\n        w = kern[: span + 1][::-1]\n        s = float(w.sum())\n        out[i] = float(np.dot(w, window) / s) if s else float(close[i])\n    return out\n\n\nclass KernelBand(IStrategy):\n    \"\"\"Nadaraya–Watson causal + Kalman 1D. Fade when flat, follow when steep.\"\"\"\n\n    INTERFACE_VERSION = 3\n\n    timeframe = \"1h\"\n    can_short = True\n    startup_candle_count = 120\n    process_only_new_candles = True\n    use_exit_signal = False\n    exit_profit_only = False\n    ignore_roi_if_entry_signal = False\n    use_custom_stoploss = False\n\n    minimal_roi = {\n        \"0\": 0.05,\n        \"60\": 0.025,\n        \"180\": 0.012,\n        \"420\": 0,\n    }\n    stoploss = -0.06\n    trailing_stop = True\n    trailing_stop_positive = 0.012\n    trailing_stop_positive_offset = 0.028\n    trailing_only_offset_is_reached = True\n\n    order_types = {\n        \"entry\": \"market\",\n        \"exit\": \"market\",\n        \"stoploss\": \"market\",\n        \"stoploss_on_exchange\": False,\n    }\n    order_time_in_force = {\"entry\": \"GTC\", \"exit\": \"GTC\"}\n\n    # Meridian defaults: h=8, MAE×2, Q=0.02, R=0.8, HMA 16, RSI 14\n    nw_bandwidth = IntParameter(4, 18, default=8, space=\"buy\", optimize=True)\n    nw_mult = DecimalParameter(1.2, 3.0, default=2.0, decimals=1, space=\"buy\", optimize=True)\n    mae_span = IntParameter(20, 80, default=40, space=\"buy\", optimize=False)\n    kalman_q = DecimalParameter(0.004, 0.06, default=0.02, decimals=3, space=\"buy\", optimize=True)\n    kalman_r = DecimalParameter(0.2, 1.6, default=0.8, decimals=2, space=\"buy\", optimize=True)\n    k_sigma = DecimalParameter(1.2, 2.2, default=1.6, decimals=1, space=\"buy\", optimize=False)\n    slope_span = IntParameter(3, 12, default=5, space=\"buy\", optimize=True)\n    slope_th = DecimalParameter(0.0015, 0.02, default=0.01, decimals=4, space=\"buy\", optimize=True)\n    rsi_period = IntParameter(8, 21, default=14, space=\"buy\", optimize=False)\n    rsi_os = IntParameter(25, 45, default=35, space=\"buy\", optimize=True)\n    rsi_ob = IntParameter(55, 80, default=65, space=\"sell\", optimize=True)\n    hma_len = IntParameter(9, 34, default=16, space=\"sell\", optimize=True)\n\n    plot_config = {\n        \"main_plot\": {\n            \"nw\": {\"color\": \"#a8b8c8\"},\n            \"nw_upper\": {\"color\": \"#a8b8c8\"},\n            \"nw_lower\": {\"color\": \"#a8b8c8\"},\n            \"kalman\": {\"color\": \"#c4a882\"},\n            \"k_upper\": {\"color\": \"#c4a882\"},\n            \"k_lower\": {\"color\": \"#c4a882\"},\n            \"hma\": {\"color\": \"#6a9e7c\"},\n        },\n        \"subplots\": {\n            \"RSI\": {\"rsi\": {\"color\": \"#a8b8c8\"}},\n            \"slope\": {\"nw_slope\": {\"color\": \"#c4b8a8\"}},\n        },\n    }\n\n    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:\n        close = dataframe[\"close\"].to_numpy(dtype=np.float64, copy=False)\n\n        nw = nadaraya_watson_causal(close, float(self.nw_bandwidth.value))\n        km = kalman_1d(close, float(self.kalman_q.value), float(self.kalman_r.value))\n        hma = hull_ma(close, int(self.hma_len.value))\n\n        dataframe[\"nw\"] = nw\n        dataframe[\"kalman\"] = km\n        dataframe[\"hma\"] = hma\n\n        err = (dataframe[\"close\"] - dataframe[\"nw\"]).abs()\n        mae = err.rolling(int(self.mae_span.value), min_periods=max(8, int(self.mae_span.value) // 2)).mean()\n        m = float(self.nw_mult.value)\n        dataframe[\"nw_upper\"] = dataframe[\"nw\"] + m * mae\n        dataframe[\"nw_lower\"] = dataframe[\"nw\"] - m * mae\n\n        resid = dataframe[\"close\"] - dataframe[\"kalman\"]\n        kstd = resid.rolling(int(self.mae_span.value), min_periods=max(8, int(self.mae_span.value) // 2)).std()\n        ks = float(self.k_sigma.value)\n        dataframe[\"k_upper\"] = dataframe[\"kalman\"] + ks * kstd\n        dataframe[\"k_lower\"] = dataframe[\"kalman\"] - ks * kstd\n\n        span = int(self.slope_span.value)\n        dataframe[\"nw_slope\"] = dataframe[\"nw\"].pct_change(span)\n        th = float(self.slope_th.value)\n        slope = dataframe[\"nw_slope\"]\n        dataframe[\"kernel_flat\"] = slope.abs() < th\n        dataframe[\"kernel_up\"] = slope > th\n        dataframe[\"kernel_down\"] = slope < -th\n\n        dataframe[\"rsi\"] = ta.RSI(dataframe, timeperiod=int(self.rsi_period.value))\n        dataframe[\"atr\"] = ta.ATR(dataframe, timeperiod=14)\n        dataframe[\"hma_up\"] = dataframe[\"hma\"] > dataframe[\"hma\"].shift(1)\n        dataframe[\"hma_dn\"] = dataframe[\"hma\"] < dataframe[\"hma\"].shift(1)\n        return dataframe\n\n    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:\n        os_ = int(self.rsi_os.value)\n        ob_ = int(self.rsi_ob.value)\n\n        fade_long = (\n            dataframe[\"kernel_flat\"]\n            & qtpylib.crossed_below(dataframe[\"close\"], dataframe[\"nw_lower\"])\n            & (dataframe[\"close\"] < dataframe[\"kalman\"])\n            & (dataframe[\"rsi\"] < os_)\n            & (dataframe[\"volume\"] > 0)\n        )\n        fade_short = (\n            dataframe[\"kernel_flat\"]\n            & qtpylib.crossed_above(dataframe[\"close\"], dataframe[\"nw_upper\"])\n            & (dataframe[\"close\"] > dataframe[\"kalman\"])\n            & (dataframe[\"rsi\"] > ob_)\n            & (dataframe[\"volume\"] > 0)\n        )\n        trend_long = (\n            dataframe[\"kernel_up\"]\n            & qtpylib.crossed_above(dataframe[\"close\"], dataframe[\"nw_upper\"])\n            & (dataframe[\"close\"] > dataframe[\"kalman\"])\n            & dataframe[\"hma_up\"]\n            & (dataframe[\"volume\"] > 0)\n        )\n        trend_short = (\n            dataframe[\"kernel_down\"]\n            & qtpylib.crossed_below(dataframe[\"close\"], dataframe[\"nw_lower\"])\n            & (dataframe[\"close\"] < dataframe[\"kalman\"])\n            & dataframe[\"hma_dn\"]\n            & (dataframe[\"volume\"] > 0)\n        )\n\n        dataframe.loc[fade_long, [\"enter_long\", \"enter_tag\"]] = (1, \"fade_long\")\n        dataframe.loc[trend_long, [\"enter_long\", \"enter_tag\"]] = (1, \"trend_long\")\n        dataframe.loc[fade_short, [\"enter_short\", \"enter_tag\"]] = (1, \"fade_short\")\n        dataframe.loc[trend_short, [\"enter_short\", \"enter_tag\"]] = (1, \"trend_short\")\n        return dataframe\n\n    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:\n        # Exits live in custom_exit so fade is not dumped by an HMA cross.\n        dataframe[\"exit_long\"] = 0\n        dataframe[\"exit_short\"] = 0\n        return dataframe\n\n    def custom_exit(\n        self,\n        pair: str,\n        trade: Trade,\n        current_time: datetime,\n        current_rate: float,\n        current_profit: float,\n        **kwargs,\n    ) -> Optional[str]:\n        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)\n        if dataframe is None or dataframe.empty:\n            return None\n        last = dataframe.iloc[-1]\n        tag = trade.enter_tag or \"\"\n        close = float(last[\"close\"])\n        nw = float(last[\"nw\"]) if pd.notna(last[\"nw\"]) else close\n        hma = float(last[\"hma\"]) if pd.notna(last[\"hma\"]) else close\n\n        if trade.is_short:\n            if \"fade\" in tag and close <= nw:\n                return \"fade_to_kernel\"\n            if \"trend\" in tag and close >= hma:\n                return \"trail_hma\"\n        else:\n            if \"fade\" in tag and close >= nw:\n                return \"fade_to_kernel\"\n            if \"trend\" in tag and close <= hma:\n                return \"trail_hma\"\n        return None\n";
var BT_DEFAULTS = {
	kernel: "causal",
	fill: "next_open",
	fee: 6e-4,
	slip: 2e-4,
	sl: .06,
	roi: .05,
	h: 8,
	mult: 2,
	maeSpan: 40,
	q: .02,
	r: .8,
	kSigma: 1.6,
	slopeSpan: 5,
	slopeTh: .01,
	rsiN: 14,
	rsiOs: 35,
	rsiOb: 65,
	hmaN: 16,
	warmup: 80
};
function nwCausal(c, h) {
	const n = c.length;
	const out = new Array(n);
	const hh = Math.max(h, 1);
	const radius = Math.ceil(hh * 4);
	const kern = Array.from({ length: radius + 1 }, (_, o) => Math.exp(-.5 * (o / hh) ** 2));
	for (let i = 0; i < n; i++) {
		const span = Math.min(radius, i);
		let num = 0;
		let den = 0;
		for (let s = 0; s <= span; s++) {
			const w = kern[s];
			num += w * c[i - s];
			den += w;
		}
		out[i] = den === 0 ? c[i] : num / den;
	}
	return out;
}
function nwTwoSided(c, h) {
	const n = c.length;
	const out = new Array(n);
	const hh = Math.max(h, 1);
	const radius = Math.ceil(hh * 4);
	for (let i = 0; i < n; i++) {
		const from = Math.max(0, i - radius);
		const to = Math.min(n - 1, i + radius);
		let num = 0;
		let den = 0;
		for (let j = from; j <= to; j++) {
			const u = (i - j) / hh;
			const k = Math.exp(-.5 * u * u);
			num += k * c[j];
			den += k;
		}
		out[i] = den === 0 ? c[i] : num / den;
	}
	return out;
}
function kalman1d(z, q, r) {
	const n = z.length;
	const out = new Array(n);
	let x = z[0] ?? 0;
	let p = 1;
	const qq = Math.max(q, 1e-9);
	const rr = Math.max(r, 1e-9);
	for (let i = 0; i < n; i++) {
		p += qq;
		const k = p / (p + rr);
		x = x + k * (z[i] - x);
		p = (1 - k) * p;
		out[i] = x;
	}
	return out;
}
function hull(c, period) {
	const p = Math.max(period, 1);
	const half = Math.max(Math.floor(p / 2), 1);
	const sqrtn = Math.max(Math.round(Math.sqrt(p)), 1);
	const w1 = wma(c, half);
	const w2 = wma(c, p);
	const raw = c.map((_, i) => w1[i] == null || w2[i] == null ? null : 2 * w1[i] - w2[i]);
	return wma(raw, sqrtn);
}
function crossedBelow(a, a0, b, b0) {
	return a0 >= b0 && a < b;
}
function crossedAbove(a, a0, b, b0) {
	return a0 <= b0 && a > b;
}
function signalsAt(i, s, p) {
	if (i < p.warmup || i < 1) return null;
	const c = s.c[i];
	const c0 = s.c[i - 1];
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
	if (nwL == null || nwU == null || nwL0 == null || nwU0 == null || km == null || kL == null || kU == null || rs == null || hma == null || hma0 == null || slope == null) return null;
	const flat = Math.abs(slope) < p.slopeTh;
	const up = slope > p.slopeTh;
	const dn = slope < -p.slopeTh;
	if (flat && crossedBelow(c, c0, nwL, nwL0) && c < km && rs < p.rsiOs) return {
		side: 1,
		tag: "fade"
	};
	if (flat && crossedAbove(c, c0, nwU, nwU0) && c > km && rs > p.rsiOb) return {
		side: -1,
		tag: "fade"
	};
	if (up && crossedAbove(c, c0, nwU, nwU0) && c > km && hma > hma0) return {
		side: 1,
		tag: "trend"
	};
	if (dn && crossedBelow(c, c0, nwL, nwL0) && c < km && hma < hma0) return {
		side: -1,
		tag: "trend"
	};
	return null;
}
function buildSeries(bars, p) {
	const c = bars.map((b) => b.c);
	const nw = p.kernel === "causal" ? nwCausal(c, p.h) : nwTwoSided(c, p.h);
	const km = kalman1d(c, p.q, p.r);
	const err = c.map((v, i) => Math.abs(v - nw[i]));
	const mae = sma(err, p.maeSpan);
	const resid = c.map((v, i) => v - km[i]);
	const ksd = stdev(resid, p.maeSpan);
	const nwL = mae.map((m, i) => m == null ? null : nw[i] - p.mult * m);
	const nwU = mae.map((m, i) => m == null ? null : nw[i] + p.mult * m);
	const kL = ksd.map((s, i) => s == null ? null : km[i] - p.kSigma * s);
	const kU = ksd.map((s, i) => s == null ? null : km[i] + p.kSigma * s);
	const slope = nw.map((v, i) => {
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
		slope
	};
}
function cost(p) {
	return p.fee + p.slip;
}
function summarize(trades) {
	if (trades.length === 0) return {
		trades: 0,
		wins: 0,
		winRate: 0,
		net: 0,
		pf: 0,
		maxDd: 0,
		avgHold: 0,
		fadeN: 0,
		trendN: 0
	};
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
		pf: gl === 0 ? gp > 0 ? 99 : 0 : gp / gl,
		maxDd,
		avgHold: hold / trades.length,
		fadeN,
		trendN
	};
}
function backtestKernelBand(bars, p = BT_DEFAULTS) {
	const s = buildSeries(bars, p);
	const n = bars.length;
	const trades = [];
	let side = 0;
	let tag = "fade";
	let entry = 0;
	let entryI = 0;
	let cool = -1;
	const cx = cost(p);
	const enter = (i, sig) => {
		const fillI = p.fill === "same_close" ? i : i + 1;
		if (fillI >= n) return;
		const px = p.fill === "same_close" ? bars[i].c : bars[fillI].o;
		side = sig.side;
		tag = sig.tag;
		entryI = fillI;
		entry = px * (1 + side * cx);
	};
	const exitAt = (i, price) => {
		if (side === 0) return;
		const px = price * (1 - side * cx);
		const ret = side * (px / entry - 1);
		trades.push({
			tag,
			side,
			ret,
			barsHeld: Math.max(1, i - entryI)
		});
		side = 0;
		cool = i;
	};
	for (let i = p.warmup; i < n; i++) {
		if (side !== 0) {
			const b = bars[i];
			const slPx = side === 1 ? entry * (1 - p.sl) : entry * (1 + p.sl);
			const tpPx = side === 1 ? entry * (1 + p.roi) : entry * (1 - p.roi);
			const hitSl = side === 1 ? b.l <= slPx : b.h >= slPx;
			const hitTp = side === 1 ? b.h >= tpPx : b.l <= tpPx;
			if (hitSl) exitAt(i, slPx);
			else if (hitTp) exitAt(i, tpPx);
			else if (i > entryI) {
				const nw = s.nw[i];
				const hma = s.hma[i];
				if (tag === "fade") {
					if (side === 1 && b.c >= nw) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)].o);
					else if (side === -1 && b.c <= nw) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)].o);
				} else if (hma != null) {
					if (side === 1 && b.c <= hma) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)].o);
					else if (side === -1 && b.c >= hma) exitAt(i, p.fill === "same_close" ? b.c : bars[Math.min(n - 1, i + 1)].o);
				}
			}
		}
		if (side === 0 && i > cool) {
			const sig = signalsAt(i, s, p);
			if (sig) enter(i, sig);
		}
	}
	if (side !== 0) exitAt(n - 1, bars[n - 1].c);
	return summarize(trades);
}
function averageRuns(makeBars, seeds, p) {
	const parts = seeds.map((seed) => backtestKernelBand(makeBars(seed), p));
	const n = parts.length || 1;
	const mix = parts.reduce((a, b) => ({
		trades: a.trades + b.trades,
		wins: a.wins + b.wins,
		winRate: 0,
		net: a.net + b.net,
		pf: a.pf + b.pf,
		maxDd: a.maxDd + b.maxDd,
		avgHold: a.avgHold + b.avgHold,
		fadeN: a.fadeN + b.fadeN,
		trendN: a.trendN + b.trendN
	}), {
		trades: 0,
		wins: 0,
		winRate: 0,
		net: 0,
		pf: 0,
		maxDd: 0,
		avgHold: 0,
		fadeN: 0,
		trendN: 0
	});
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
		trendN: Math.round(mix.trendN / n)
	};
}
var BT_SCENARIOS = [
	{
		id: "range",
		label: "Đi ngang"
	},
	{
		id: "uptrend",
		label: "Tăng"
	},
	{
		id: "mixed",
		label: "Hỗn hợp"
	},
	{
		id: "breakout",
		label: "Breakout"
	}
];
var SEEDS = [
	3,
	7,
	11,
	19,
	29
];
var BARS = 720;
function run(scenario, patch) {
	return averageRuns((seed) => generateMarket({
		scenario,
		bars: BARS,
		seed
	}), SEEDS, {
		...BT_DEFAULTS,
		...patch
	});
}
function Cell({ n, pct, good }) {
	const t = pct ? formatPct(n) : n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("px-2 py-2 text-right font-mono text-xs tabular-nums", good == null ? "text-fg" : good ? "text-up" : "text-down"),
		children: t
	});
}
function KernelBacktest() {
	const [scenario, setScenario] = (0, import_react.useState)("mixed");
	const rows = (0, import_react.useMemo)(() => {
		const honest = run(scenario, {});
		const look = run(scenario, { kernel: "twosided" });
		const naive = run(scenario, {
			fill: "same_close",
			fee: 0,
			slip: 0
		});
		return [
			{
				id: "honest",
				name: "Causal · nến sau · phí 6+2 bps",
				s: honest,
				note: "Gần Freqtrade market, fill open nến kế."
			},
			{
				id: "look",
				name: "Trap: kernel hai phía",
				s: look,
				note: "Giống chart Meridian / TV. Lookahead."
			},
			{
				id: "naive",
				name: "Trap: cùng nến, không phí",
				s: naive,
				note: "Fill close nến tín hiệu. Backtest đẹp giả."
			}
		];
	}, [scenario]);
	const honest = rows[0].s;
	const look = rows[1].s;
	const naive = rows[2].s;
	const lookTrap = look.net - honest.net;
	const fillTrap = naive.net - honest.net;
	const checks = [
		{
			kind: "pass",
			t: "Kernel causal",
			d: "s ≤ t. Hai phía trên chart encyclopedia không phải tín hiệu bot."
		},
		{
			kind: "pass",
			t: "MAE / σ rolling",
			d: "Không lấy σ cả mẫu — cái đó nhìn tương lai."
		},
		{
			kind: "pass",
			t: "Fill nến sau",
			d: "Tín hiệu đóng nến t, khớp open t+1. Cùng nến là trap."
		},
		{
			kind: "pass",
			t: "Exit theo tag",
			d: "Fade về kernel, trend trail HMA. File Freqtrade không còn dump fade khi HMA cắt."
		},
		{
			kind: lookTrap > .015 ? "trap" : "warn",
			t: "Lookahead kernel hai phía",
			d: lookTrap > 0 ? `Hai phía hơn honest ${formatPct(lookTrap)} trên kịch bản này (range có thể +20–30 điểm). Edge giả — nến tương lai.` : "Trên kịch bản này hai phía không hơn. Trap vẫn có trên chuỗi thật khi kernel ‘quá đẹp’."
		},
		{
			kind: "warn",
			t: "Chuỗi giả lập ≠ sàn",
			d: "GBM 720 nến × 5 seed. Phí 6+2 bps/lượt. Fade 1h sống/chết vì fee, không vì công thức."
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 min-w-0 border-t border-border pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-primary uppercase",
				children: "Audit · backtest trap"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl text-fg",
				children: "Logic đã soi, trap để mở"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-3xl text-sm leading-relaxed text-muted",
				children: "Cùng luật KernelBand: fade khi kernel dẹt, break khi dốc. Honest = causal + fill open nến sau + phí 0,06% + trượt 0,02%/lượt. Hai hàng dưới là cách backtest gian."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-1.5",
				children: BT_SCENARIOS.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setScenario(x.id),
					className: cn("h-9 rounded-full px-3 text-xs", scenario === x.id ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg"),
					children: x.label
				}, x.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[32rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-[11px] tracking-wide text-muted uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-2 font-medium",
								children: "Protocol"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium",
								children: "Lệnh"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium",
								children: "Thắng"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium",
								children: "Net"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium",
								children: "PF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-right font-medium",
								children: "Max DD"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/70",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2 pr-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-fg",
									children: row.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: row.note
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { n: row.s.trades }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								n: row.s.winRate,
								pct: true,
								good: row.s.trades ? row.s.winRate >= .5 : null
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								n: row.s.net,
								pct: true,
								good: row.s.net > 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								n: row.s.pf,
								good: row.s.pf >= 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								n: row.s.maxDd,
								pct: true,
								good: row.s.maxDd > -.15
							})
						]
					}, row.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-xs text-muted",
				children: [
					"Fade ",
					honest.fadeN,
					" · trend ",
					honest.trendN,
					" · giữ TB ",
					honest.avgHold.toFixed(1),
					" nến · trap lookahead ",
					formatPct(lookTrap),
					" · trap fill ",
					formatPct(fillTrap)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid gap-2 sm:grid-cols-2",
				children: checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg bg-bg px-4 py-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: c.kind === "pass" ? "text-up" : c.kind === "trap" ? "text-down" : "text-warn",
								children: c.kind === "pass" ? "Pass" : c.kind === "trap" ? "Trap" : "Warn"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-subtle",
								children: " · "
							}),
							c.t
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed text-muted",
						children: c.d
					})]
				}, c.t))
			})
		]
	});
}
var FILENAME = "KernelBand.py";
function FreqtradeExport() {
	const [copied, setCopied] = (0, import_react.useState)(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(KernelBand_default);
		} catch {
			const ta = document.createElement("textarea");
			ta.value = KernelBand_default;
			ta.setAttribute("readonly", "");
			ta.style.position = "fixed";
			ta.style.left = "-9999px";
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			ta.remove();
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	}
	function download() {
		const blob = new Blob([KernelBand_default], { type: "text/x-python;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = FILENAME;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "freqtrade",
		className: "mt-12 min-w-0 rounded-xl bg-bg-elevated p-5 shadow-[var(--shadow-border)] sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-primary uppercase",
				children: "Freqtrade · IStrategy v3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl text-fg",
				children: "KernelBand.py"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-3xl text-sm leading-relaxed text-muted",
				children: "Port đúng luật playbook: kernel dẹt thì fade dải MAE (RSI xác nhận, thoát về đường giữa); kernel dốc thì break continuation, trail HMA. Kalman 1D giữ recursion Q/R của Meridian."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-3",
				children: [
					{
						t: "Causal",
						d: "Kernel chỉ lấy s ≤ t. Chart Meridian vẽ hai phía — đẹp hơn, nhưng mép phải repaint. Bot không được làm vậy."
					},
					{
						t: "Rolling, không global",
						d: "MAE và σ Kalman là cửa sổ lăn. σ cả chuỗi của encyclopedia nhìn tương lai."
					},
					{
						t: "Hai enter_tag",
						d: "fade_long/short thoát khi giá chạm kernel. trend_* trail HMA. Đừng gộp thành một tín hiệu."
					}
				].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-bg p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-fg",
						children: x.t
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: x.d
					})]
				}, x.t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KernelBacktest, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: download,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Tải KernelBand.py"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: copy,
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), copied ? "Đã chép" : "Chép file"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-6 space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-primary",
								children: "01"
							}),
							"Đặt file vào ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "user_data/strategies/KernelBand.py"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-primary",
								children: "02"
							}),
							"Config: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "strategy = KernelBand"
							}),
							", timeframe",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "1h"
							}),
							" (đổi 15m nếu scalp; h tăng theo). Futures:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "trading_mode = futures"
							}),
							" để short chạy."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-primary",
								children: "03"
							}),
							"Dry-run trước. Hyperopt ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "buy sell roi stoploss"
							}),
							" — đừng optimize trên chính đoạn bạn sẽ trade live."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-6 max-h-[28rem] w-full min-w-0 max-w-full overflow-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: KernelBand_default })
			})
		]
	});
}
function StrategyPage() {
	const { strategy } = Route.useLoaderData();
	const [seed, setSeed] = (0, import_react.useState)(12);
	const bars = (0, import_react.useMemo)(() => generateMarket({
		scenario: "mixed",
		bars: 240,
		seed
	}), [seed]);
	const result = (0, import_react.useMemo)(() => {
		const parts = strategy.stack.map((slug) => {
			const algo = getAlgorithm(slug);
			return runAlgorithm(slug, bars, algo ? defaultParams(algo) : {});
		});
		return mergeResults(parts);
	}, [strategy.stack, bars]);
	const idx = STRATEGIES.findIndex((s) => s.slug === strategy.slug);
	const prev = STRATEGIES[idx - 1];
	const next = STRATEGIES[idx + 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/strategies",
				className: "inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Chiến thuật"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-[11px] tracking-[0.18em] text-primary uppercase",
				children: strategy.kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-4xl text-fg sm:text-5xl",
				children: strategy.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-3xl text-base leading-relaxed text-muted",
				children: strategy.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 min-w-0 overflow-hidden rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Stack chồng trên kịch bản hỗn hợp"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg",
						onClick: () => setSeed((s) => s + 1),
						children: "Nến mới"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
					bars,
					result,
					height: 440
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-8 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Luật"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-3",
					children: strategy.rules.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 text-sm leading-relaxed text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-primary",
							children: String(i + 1).padStart(2, "0")
						}), r]
					}, r))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Regime"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-mono text-sm text-fg",
							children: strategy.regime
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Stack"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: strategy.stack.map((slug) => {
								const a = getAlgorithm(slug);
								return a ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/algorithms/$slug",
									params: { slug },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "accent",
										children: a.name
									})
								}, slug) : null;
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Rủi ro"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: strategy.risk
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Đứng ngoài khi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: strategy.avoid
						})] })
					]
				})]
			}),
			strategy.freqtrade === "KernelBand" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreqtradeExport, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/lab",
						search: { algo: strategy.stack[0] },
						children: "Thử stack trong Lab"
					})
				}), strategy.freqtrade ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#freqtrade",
						children: [
							"Freqtrade ",
							strategy.freqtrade,
							".py"
						]
					})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 flex justify-between border-t border-border pt-6",
				children: [prev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/strategies/$slug",
					params: { slug: prev.slug },
					className: "text-sm text-muted hover:text-fg",
					children: ["← ", prev.name]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/strategies/$slug",
					params: { slug: next.slug },
					className: "text-sm text-muted hover:text-fg",
					children: [next.name, " →"]
				}) : null]
			})
		]
	});
}
//#endregion
export { StrategyPage as component };
