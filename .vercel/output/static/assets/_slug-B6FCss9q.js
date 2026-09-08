import{U as e,V as t,l as n,r}from"./famous-DXNCAfYw.js";import{t as i}from"./arrow-left-m_VrB4FC.js";import{c as a,d as o,f as s,n as c,s as l,t as u,u as d}from"./index-CUuDYWQs.js";import{t as f}from"./candle-chart-CY-C7UKc.js";import{a as p,c as m,i as h,n as g,o as _,r as v,s as y,t as b,u as x}from"./run-DHWqOZT6.js";var S=d(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),C=d(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),w=d(`download`,[[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`polyline`,{points:`7 10 12 15 17 10`,key:`2ggqvy`}],[`line`,{x1:`12`,x2:`12`,y1:`15`,y2:`3`,key:`1vk2je`}]]),T=e(t(),1),E=`# pragma pylint: disable=missing-docstring, invalid-name, pointless-string-statement
# flake8: noqa: F401
"""
KernelBand — Meridian playbook → Freqtrade IStrategy v3

Nadaraya–Watson (Gaussian, **causal**) + 1D Kalman fair-value.

Hai chế độ, một chart (đúng luật Meridian / Kernel band):

  1. Kernel DẸT  → mean-reversion. Fade chạm dải MAE, xác nhận RSI,
     target đường kernel (custom_exit fade_to_kernel).
  2. Kernel DỐC  → continuation. Break dải cùng chiều Kalman + HMA,
     trail HMA (custom_exit trail_hma).

Khác chart Meridian
  Chart encyclopedia dùng kernel HAI PHÍA (s ≤ t và s > t) nên đường giữa
  "quá đẹp" ở giữa mẫu và MÉP PHẢI sẽ sửa khi có nến mới — không trade được.
  File này chỉ lấy s ≤ t (causal). MAE / σ Kalman là rolling, không global.

Backtest trap đã vá
  - Entry/exit **market**: limit-at-close trong backtest dễ khớp quá đẹp hoặc miss
    tùy nến sau. Market ≈ fill open nến kế (cộng slippage config).
  - Không còn populate_exit_trend HMA cho mọi long — fade bị dump oan. Exit theo
    enter_tag trong custom_exit.
  - Không tín hiệu cùng nến vào+ra từ exit_trend.
  - startup_candle_count = 120 (h=8 → 4h radius + MAE 40 + RSI).

  Trap còn lại (không vá được trong file): hyperopt in-sample; fee 0 trong config;
  kernel hai phía nếu ai "sửa" lại hàm causal.


Drop into user_data/strategies/KernelBand.py
  freqtrade backtesting --strategy KernelBand --timerange 20240101-20260901
  freqtrade hyperopt   --strategy KernelBand --hyperopt-loss SharpeHyperOptLossDaily \\\\
                       --spaces buy sell roi stoploss --timerange 20240101-20260901
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
import talib.abstract as ta
from pandas import DataFrame

import freqtrade.vendor.qtpylib.indicators as qtpylib
from freqtrade.persistence import Trade
from freqtrade.strategy import DecimalParameter, IntParameter, IStrategy


# ── pure indicators (no lookahead) ──────────────────────────────────────────


def wma(arr: np.ndarray, period: int) -> np.ndarray:
    n = arr.size
    out = np.full(n, np.nan, dtype=np.float64)
    p = max(int(period), 1)
    if n < p:
        return out
    w = np.arange(1, p + 1, dtype=np.float64)
    ws = w.sum()
    for i in range(p - 1, n):
        out[i] = float(np.dot(arr[i - p + 1 : i + 1], w) / ws)
    return out


def hull_ma(close: np.ndarray, period: int) -> np.ndarray:
    p = max(int(period), 1)
    half = max(p // 2, 1)
    sqrtn = max(int(round(np.sqrt(p))), 1)
    raw = 2.0 * wma(close, half) - wma(close, p)
    return wma(raw, sqrtn)


def kalman_1d(z: np.ndarray, q: float, r: float) -> np.ndarray:
    """Scalar random-walk Kalman. Same recursion as Meridian (Q process, R measure)."""
    n = z.size
    out = np.empty(n, dtype=np.float64)
    x = float(z[0]) if n else 0.0
    p = 1.0
    q = max(float(q), 1e-9)
    r = max(float(r), 1e-9)
    for i in range(n):
        p = p + q
        k = p / (p + r)
        zi = float(z[i])
        if not np.isfinite(zi):
            out[i] = x
            continue
        x = x + k * (zi - x)
        p = (1.0 - k) * p
        out[i] = x
    return out


def nadaraya_watson_causal(close: np.ndarray, bandwidth: float) -> np.ndarray:
    """
    ŷ(t) = Σ_{s≤t} K((t−s)/h) P_s / Σ K
    K(u) = exp(−u² / 2), truncated at 4h.

    Causal on purpose: a two-sided kernel (Meridian chart / TV) looks into
    future bars and repaints. Do not 'fix' this back to symmetric.
    """
    n = close.size
    out = np.empty(n, dtype=np.float64)
    h = max(float(bandwidth), 1.0)
    radius = int(np.ceil(h * 4.0))
    kern = np.exp(-0.5 * (np.arange(radius + 1, dtype=np.float64) / h) ** 2)
    for i in range(n):
        span = min(radius, i)
        window = close[i - span : i + 1]
        w = kern[: span + 1][::-1]
        s = float(w.sum())
        out[i] = float(np.dot(w, window) / s) if s else float(close[i])
    return out


class KernelBand(IStrategy):
    """Nadaraya–Watson causal + Kalman 1D. Fade when flat, follow when steep."""

    INTERFACE_VERSION = 3

    timeframe = "1h"
    can_short = True
    startup_candle_count = 120
    process_only_new_candles = True
    use_exit_signal = False
    exit_profit_only = False
    ignore_roi_if_entry_signal = False
    use_custom_stoploss = False

    minimal_roi = {
        "0": 0.05,
        "60": 0.025,
        "180": 0.012,
        "420": 0,
    }
    stoploss = -0.06
    trailing_stop = True
    trailing_stop_positive = 0.012
    trailing_stop_positive_offset = 0.028
    trailing_only_offset_is_reached = True

    order_types = {
        "entry": "market",
        "exit": "market",
        "stoploss": "market",
        "stoploss_on_exchange": False,
    }
    order_time_in_force = {"entry": "GTC", "exit": "GTC"}

    # Meridian defaults: h=8, MAE×2, Q=0.02, R=0.8, HMA 16, RSI 14
    nw_bandwidth = IntParameter(4, 18, default=8, space="buy", optimize=True)
    nw_mult = DecimalParameter(1.2, 3.0, default=2.0, decimals=1, space="buy", optimize=True)
    mae_span = IntParameter(20, 80, default=40, space="buy", optimize=False)
    kalman_q = DecimalParameter(0.004, 0.06, default=0.02, decimals=3, space="buy", optimize=True)
    kalman_r = DecimalParameter(0.2, 1.6, default=0.8, decimals=2, space="buy", optimize=True)
    k_sigma = DecimalParameter(1.2, 2.2, default=1.6, decimals=1, space="buy", optimize=False)
    slope_span = IntParameter(3, 12, default=5, space="buy", optimize=True)
    slope_th = DecimalParameter(0.0015, 0.02, default=0.01, decimals=4, space="buy", optimize=True)
    rsi_period = IntParameter(8, 21, default=14, space="buy", optimize=False)
    rsi_os = IntParameter(25, 45, default=35, space="buy", optimize=True)
    rsi_ob = IntParameter(55, 80, default=65, space="sell", optimize=True)
    hma_len = IntParameter(9, 34, default=16, space="sell", optimize=True)

    plot_config = {
        "main_plot": {
            "nw": {"color": "#a8b8c8"},
            "nw_upper": {"color": "#a8b8c8"},
            "nw_lower": {"color": "#a8b8c8"},
            "kalman": {"color": "#c4a882"},
            "k_upper": {"color": "#c4a882"},
            "k_lower": {"color": "#c4a882"},
            "hma": {"color": "#6a9e7c"},
        },
        "subplots": {
            "RSI": {"rsi": {"color": "#a8b8c8"}},
            "slope": {"nw_slope": {"color": "#c4b8a8"}},
        },
    }

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        close = dataframe["close"].to_numpy(dtype=np.float64, copy=False)

        nw = nadaraya_watson_causal(close, float(self.nw_bandwidth.value))
        km = kalman_1d(close, float(self.kalman_q.value), float(self.kalman_r.value))
        hma = hull_ma(close, int(self.hma_len.value))

        dataframe["nw"] = nw
        dataframe["kalman"] = km
        dataframe["hma"] = hma

        err = (dataframe["close"] - dataframe["nw"]).abs()
        mae = err.rolling(int(self.mae_span.value), min_periods=max(8, int(self.mae_span.value) // 2)).mean()
        m = float(self.nw_mult.value)
        dataframe["nw_upper"] = dataframe["nw"] + m * mae
        dataframe["nw_lower"] = dataframe["nw"] - m * mae

        resid = dataframe["close"] - dataframe["kalman"]
        kstd = resid.rolling(int(self.mae_span.value), min_periods=max(8, int(self.mae_span.value) // 2)).std()
        ks = float(self.k_sigma.value)
        dataframe["k_upper"] = dataframe["kalman"] + ks * kstd
        dataframe["k_lower"] = dataframe["kalman"] - ks * kstd

        span = int(self.slope_span.value)
        dataframe["nw_slope"] = dataframe["nw"].pct_change(span)
        th = float(self.slope_th.value)
        slope = dataframe["nw_slope"]
        dataframe["kernel_flat"] = slope.abs() < th
        dataframe["kernel_up"] = slope > th
        dataframe["kernel_down"] = slope < -th

        dataframe["rsi"] = ta.RSI(dataframe, timeperiod=int(self.rsi_period.value))
        dataframe["atr"] = ta.ATR(dataframe, timeperiod=14)
        dataframe["hma_up"] = dataframe["hma"] > dataframe["hma"].shift(1)
        dataframe["hma_dn"] = dataframe["hma"] < dataframe["hma"].shift(1)
        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        os_ = int(self.rsi_os.value)
        ob_ = int(self.rsi_ob.value)

        fade_long = (
            dataframe["kernel_flat"]
            & qtpylib.crossed_below(dataframe["close"], dataframe["nw_lower"])
            & (dataframe["close"] < dataframe["kalman"])
            & (dataframe["rsi"] < os_)
            & (dataframe["volume"] > 0)
        )
        fade_short = (
            dataframe["kernel_flat"]
            & qtpylib.crossed_above(dataframe["close"], dataframe["nw_upper"])
            & (dataframe["close"] > dataframe["kalman"])
            & (dataframe["rsi"] > ob_)
            & (dataframe["volume"] > 0)
        )
        trend_long = (
            dataframe["kernel_up"]
            & qtpylib.crossed_above(dataframe["close"], dataframe["nw_upper"])
            & (dataframe["close"] > dataframe["kalman"])
            & dataframe["hma_up"]
            & (dataframe["volume"] > 0)
        )
        trend_short = (
            dataframe["kernel_down"]
            & qtpylib.crossed_below(dataframe["close"], dataframe["nw_lower"])
            & (dataframe["close"] < dataframe["kalman"])
            & dataframe["hma_dn"]
            & (dataframe["volume"] > 0)
        )

        dataframe.loc[fade_long, ["enter_long", "enter_tag"]] = (1, "fade_long")
        dataframe.loc[trend_long, ["enter_long", "enter_tag"]] = (1, "trend_long")
        dataframe.loc[fade_short, ["enter_short", "enter_tag"]] = (1, "fade_short")
        dataframe.loc[trend_short, ["enter_short", "enter_tag"]] = (1, "trend_short")
        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Exits live in custom_exit so fade is not dumped by an HMA cross.
        dataframe["exit_long"] = 0
        dataframe["exit_short"] = 0
        return dataframe

    def custom_exit(
        self,
        pair: str,
        trade: Trade,
        current_time: datetime,
        current_rate: float,
        current_profit: float,
        **kwargs,
    ) -> Optional[str]:
        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        if dataframe is None or dataframe.empty:
            return None
        last = dataframe.iloc[-1]
        tag = trade.enter_tag or ""
        close = float(last["close"])
        nw = float(last["nw"]) if pd.notna(last["nw"]) else close
        hma = float(last["hma"]) if pd.notna(last["hma"]) else close

        if trade.is_short:
            if "fade" in tag and close <= nw:
                return "fade_to_kernel"
            if "trend" in tag and close >= hma:
                return "trail_hma"
        else:
            if "fade" in tag and close >= nw:
                return "fade_to_kernel"
            if "trend" in tag and close <= hma:
                return "trail_hma"
        return None
`,D={kernel:`causal`,fill:`next_open`,fee:6e-4,slip:2e-4,sl:.06,roi:.05,h:8,mult:2,maeSpan:40,q:.02,r:.8,kSigma:1.6,slopeSpan:5,slopeTh:.01,rsiN:14,rsiOs:35,rsiOb:65,hmaN:16,warmup:80};function O(e,t){let n=e.length,r=Array(n),i=Math.max(t,1),a=Math.ceil(i*4),o=Array.from({length:a+1},(e,t)=>Math.exp(-.5*(t/i)**2));for(let t=0;t<n;t++){let n=Math.min(a,t),i=0,s=0;for(let r=0;r<=n;r++){let n=o[r];i+=n*e[t-r],s+=n}r[t]=s===0?e[t]:i/s}return r}function k(e,t){let n=e.length,r=Array(n),i=Math.max(t,1),a=Math.ceil(i*4);for(let t=0;t<n;t++){let o=Math.max(0,t-a),s=Math.min(n-1,t+a),c=0,l=0;for(let n=o;n<=s;n++){let r=(t-n)/i,a=Math.exp(-.5*r*r);c+=a*e[n],l+=a}r[t]=l===0?e[t]:c/l}return r}function A(e,t,n){let r=e.length,i=Array(r),a=e[0]??0,o=1,s=Math.max(t,1e-9),c=Math.max(n,1e-9);for(let t=0;t<r;t++){o+=s;let n=o/(o+c);a+=n*(e[t]-a),o=(1-n)*o,i[t]=a}return i}function j(e,t){let n=Math.max(t,1),r=Math.max(Math.floor(n/2),1),i=Math.max(Math.round(Math.sqrt(n)),1),a=y(e,r),o=y(e,n),s=e.map((e,t)=>a[t]==null||o[t]==null?null:2*a[t]-o[t]);return y(s,i)}function M(e,t,n,r){return t>=r&&e<n}function N(e,t,n,r){return t<=r&&e>n}function P(e,t,n){if(e<n.warmup||e<1)return null;let r=t.c[e],i=t.c[e-1],a=t.nwL[e],o=t.nwU[e],s=t.nwL[e-1],c=t.nwU[e-1],l=t.km[e],u=t.kL[e],d=t.kU[e],f=t.rsi[e],p=t.hma[e],m=t.hma[e-1],h=t.slope[e];if(a==null||o==null||s==null||c==null||l==null||u==null||d==null||f==null||p==null||m==null||h==null)return null;let g=Math.abs(h)<n.slopeTh,_=h>n.slopeTh,v=h<-n.slopeTh;return g&&M(r,i,a,s)&&r<l&&f<n.rsiOs?{side:1,tag:`fade`}:g&&N(r,i,o,c)&&r>l&&f>n.rsiOb?{side:-1,tag:`fade`}:_&&N(r,i,o,c)&&r>l&&p>m?{side:1,tag:`trend`}:v&&M(r,i,a,s)&&r<l&&p<m?{side:-1,tag:`trend`}:null}function F(e,t){let n=e.map(e=>e.c),r=t.kernel===`causal`?O(n,t.h):k(n,t.h),i=A(n,t.q,t.r),a=n.map((e,t)=>Math.abs(e-r[t])),o=p(a,t.maeSpan),s=n.map((e,t)=>e-i[t]),c=_(s,t.maeSpan),l=o.map((e,n)=>e==null?null:r[n]-t.mult*e),u=o.map((e,n)=>e==null?null:r[n]+t.mult*e),d=c.map((e,n)=>e==null?null:i[n]-t.kSigma*e),f=c.map((e,n)=>e==null?null:i[n]+t.kSigma*e),m=r.map((e,n)=>{let i=r[n-t.slopeSpan];return i==null||i===0||n<t.slopeSpan?null:e/i-1});return{c:n,nw:r,nwL:l,nwU:u,km:i,kL:d,kU:f,rsi:v(n,t.rsiN),hma:j(n,t.hmaN),slope:m}}function I(e){return e.fee+e.slip}function L(e){if(e.length===0)return{trades:0,wins:0,winRate:0,net:0,pf:0,maxDd:0,avgHold:0,fadeN:0,trendN:0};let t=1,n=1,r=0,i=0,a=0,o=0,s=0,c=0,l=0;for(let u of e)t*=1+u.ret,n=Math.max(n,t),r=Math.min(r,t/n-1),u.ret>0?(o+=1,i+=u.ret):a+=-u.ret,s+=u.barsHeld,u.tag===`fade`?c+=1:l+=1;return{trades:e.length,wins:o,winRate:o/e.length,net:t-1,pf:a===0?i>0?99:0:i/a,maxDd:r,avgHold:s/e.length,fadeN:c,trendN:l}}function R(e,t=D){let n=F(e,t),r=e.length,i=[],a=0,o=`fade`,s=0,c=0,l=-1,u=I(t),d=(n,i)=>{let l=t.fill===`same_close`?n:n+1;if(l>=r)return;let d=t.fill===`same_close`?e[n].c:e[l].o;a=i.side,o=i.tag,c=l,s=d*(1+a*u)},f=(e,t)=>{if(a===0)return;let n=t*(1-a*u),r=a*(n/s-1);i.push({tag:o,side:a,ret:r,barsHeld:Math.max(1,e-c)}),a=0,l=e};for(let i=t.warmup;i<r;i++){if(a!==0){let l=e[i],u=a===1?s*(1-t.sl):s*(1+t.sl),d=a===1?s*(1+t.roi):s*(1-t.roi),p=a===1?l.l<=u:l.h>=u,m=a===1?l.h>=d:l.l<=d;if(p)f(i,u);else if(m)f(i,d);else if(i>c){let s=n.nw[i],c=n.hma[i];o===`fade`?(a===1&&l.c>=s||a===-1&&l.c<=s)&&f(i,t.fill===`same_close`?l.c:e[Math.min(r-1,i+1)].o):c!=null&&(a===1&&l.c<=c||a===-1&&l.c>=c)&&f(i,t.fill===`same_close`?l.c:e[Math.min(r-1,i+1)].o)}}if(a===0&&i>l){let e=P(i,n,t);e&&d(i,e)}}return a!==0&&f(r-1,e[r-1].c),L(i)}function z(e,t,n){let r=t.map(t=>R(e(t),n)),i=r.length||1,a=r.reduce((e,t)=>({trades:e.trades+t.trades,wins:e.wins+t.wins,winRate:0,net:e.net+t.net,pf:e.pf+t.pf,maxDd:e.maxDd+t.maxDd,avgHold:e.avgHold+t.avgHold,fadeN:e.fadeN+t.fadeN,trendN:e.trendN+t.trendN}),{trades:0,wins:0,winRate:0,net:0,pf:0,maxDd:0,avgHold:0,fadeN:0,trendN:0}),o=a.trades;return{trades:Math.round(a.trades/i),wins:Math.round(a.wins/i),winRate:o?a.wins/o:0,net:a.net/i,pf:a.pf/i,maxDd:a.maxDd/i,avgHold:a.avgHold/i,fadeN:Math.round(a.fadeN/i),trendN:Math.round(a.trendN/i)}}var B=[{id:`range`,label:`Đi ngang`},{id:`uptrend`,label:`Tăng`},{id:`mixed`,label:`Hỗn hợp`},{id:`breakout`,label:`Breakout`}],V=n(),H=[3,7,11,19,29],U=720;function W(e,t){return z(t=>x({scenario:e,bars:U,seed:t}),H,{...D,...t})}function G({n:e,pct:t,good:n}){let r=t?h(e):e.toLocaleString(`vi-VN`,{maximumFractionDigits:2});return(0,V.jsx)(`td`,{className:s(`px-2 py-2 text-right font-mono text-xs tabular-nums`,n==null?`text-fg`:n?`text-up`:`text-down`),children:r})}function K(){let[e,t]=(0,T.useState)(`mixed`),n=(0,T.useMemo)(()=>{let t=W(e,{}),n=W(e,{kernel:`twosided`}),r=W(e,{fill:`same_close`,fee:0,slip:0});return[{id:`honest`,name:`Causal · nến sau · phí 6+2 bps`,s:t,note:`Gần Freqtrade market, fill open nến kế.`},{id:`look`,name:`Trap: kernel hai phía`,s:n,note:`Giống chart Meridian / TV. Lookahead.`},{id:`naive`,name:`Trap: cùng nến, không phí`,s:r,note:`Fill close nến tín hiệu. Backtest đẹp giả.`}]},[e]),r=n[0].s,i=n[1].s,a=n[2].s,o=i.net-r.net,c=a.net-r.net,l=[{kind:`pass`,t:`Kernel causal`,d:`s ≤ t. Hai phía trên chart encyclopedia không phải tín hiệu bot.`},{kind:`pass`,t:`MAE / σ rolling`,d:`Không lấy σ cả mẫu — cái đó nhìn tương lai.`},{kind:`pass`,t:`Fill nến sau`,d:`Tín hiệu đóng nến t, khớp open t+1. Cùng nến là trap.`},{kind:`pass`,t:`Exit theo tag`,d:`Fade về kernel, trend trail HMA. File Freqtrade không còn dump fade khi HMA cắt.`},{kind:o>.015?`trap`:`warn`,t:`Lookahead kernel hai phía`,d:o>0?`Hai phía hơn honest ${h(o)} trên kịch bản này (range có thể +20–30 điểm). Edge giả — nến tương lai.`:`Trên kịch bản này hai phía không hơn. Trap vẫn có trên chuỗi thật khi kernel ‘quá đẹp’.`},{kind:`warn`,t:`Chuỗi giả lập ≠ sàn`,d:`GBM 720 nến × 5 seed. Phí 6+2 bps/lượt. Fade 1h sống/chết vì fee, không vì công thức.`}];return(0,V.jsxs)(`div`,{className:`mt-8 min-w-0 border-t border-border pt-6`,children:[(0,V.jsx)(`p`,{className:`text-[11px] tracking-[0.18em] text-primary uppercase`,children:`Audit · backtest trap`}),(0,V.jsx)(`h2`,{className:`mt-2 font-display text-3xl text-fg`,children:`Logic đã soi, trap để mở`}),(0,V.jsx)(`p`,{className:`mt-3 max-w-3xl text-sm leading-relaxed text-muted`,children:`Cùng luật KernelBand: fade khi kernel dẹt, break khi dốc. Honest = causal + fill open nến sau + phí 0,06% + trượt 0,02%/lượt. Hai hàng dưới là cách backtest gian.`}),(0,V.jsx)(`div`,{className:`mt-4 flex flex-wrap gap-1.5`,children:B.map(n=>(0,V.jsx)(`button`,{type:`button`,onClick:()=>t(n.id),className:s(`h-9 rounded-full px-3 text-xs`,e===n.id?`bg-primary text-primary-foreground`:`bg-surface-2 text-muted hover:text-fg`),children:n.label},n.id))}),(0,V.jsx)(`div`,{className:`mt-5 overflow-x-auto`,children:(0,V.jsxs)(`table`,{className:`w-full min-w-[32rem] text-left text-sm`,children:[(0,V.jsx)(`thead`,{children:(0,V.jsxs)(`tr`,{className:`border-b border-border text-[11px] tracking-wide text-muted uppercase`,children:[(0,V.jsx)(`th`,{className:`py-2 pr-2 font-medium`,children:`Protocol`}),(0,V.jsx)(`th`,{className:`px-2 py-2 text-right font-medium`,children:`Lệnh`}),(0,V.jsx)(`th`,{className:`px-2 py-2 text-right font-medium`,children:`Thắng`}),(0,V.jsx)(`th`,{className:`px-2 py-2 text-right font-medium`,children:`Net`}),(0,V.jsx)(`th`,{className:`px-2 py-2 text-right font-medium`,children:`PF`}),(0,V.jsx)(`th`,{className:`px-2 py-2 text-right font-medium`,children:`Max DD`})]})}),(0,V.jsx)(`tbody`,{children:n.map(e=>(0,V.jsxs)(`tr`,{className:`border-b border-border/70`,children:[(0,V.jsxs)(`td`,{className:`py-2 pr-2`,children:[(0,V.jsx)(`p`,{className:`text-fg`,children:e.name}),(0,V.jsx)(`p`,{className:`text-xs text-subtle`,children:e.note})]}),(0,V.jsx)(G,{n:e.s.trades}),(0,V.jsx)(G,{n:e.s.winRate,pct:!0,good:e.s.trades?e.s.winRate>=.5:null}),(0,V.jsx)(G,{n:e.s.net,pct:!0,good:e.s.net>0}),(0,V.jsx)(G,{n:e.s.pf,good:e.s.pf>=1}),(0,V.jsx)(G,{n:e.s.maxDd,pct:!0,good:e.s.maxDd>-.15})]},e.id))})]})}),(0,V.jsxs)(`p`,{className:`mt-3 font-mono text-xs text-muted`,children:[`Fade `,r.fadeN,` · trend `,r.trendN,` · giữ TB `,r.avgHold.toFixed(1),` nến · trap lookahead `,h(o),` · trap fill `,h(c)]}),(0,V.jsx)(`ul`,{className:`mt-6 grid gap-2 sm:grid-cols-2`,children:l.map(e=>(0,V.jsxs)(`li`,{className:`rounded-lg bg-bg px-4 py-3 shadow-[var(--shadow-border)]`,children:[(0,V.jsxs)(`p`,{className:`text-sm text-fg`,children:[(0,V.jsx)(`span`,{className:e.kind===`pass`?`text-up`:e.kind===`trap`?`text-down`:`text-warn`,children:e.kind===`pass`?`Pass`:e.kind===`trap`?`Trap`:`Warn`}),(0,V.jsx)(`span`,{className:`text-subtle`,children:` · `}),e.t]}),(0,V.jsx)(`p`,{className:`mt-1 text-sm leading-relaxed text-muted`,children:e.d})]},e.t))})]})}var q=`KernelBand.py`;function J(){let[e,t]=(0,T.useState)(!1);async function n(){try{await navigator.clipboard.writeText(E)}catch{let e=document.createElement(`textarea`);e.value=E,e.setAttribute(`readonly`,``),e.style.position=`fixed`,e.style.left=`-9999px`,document.body.appendChild(e),e.select(),document.execCommand(`copy`),e.remove()}t(!0),window.setTimeout(()=>t(!1),1800)}function r(){let e=new Blob([E],{type:`text/x-python;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=q,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(t)}return(0,V.jsxs)(`section`,{id:`freqtrade`,className:`mt-12 min-w-0 rounded-xl bg-bg-elevated p-5 shadow-[var(--shadow-border)] sm:p-6`,children:[(0,V.jsx)(`p`,{className:`text-[11px] tracking-[0.18em] text-primary uppercase`,children:`Freqtrade · IStrategy v3`}),(0,V.jsx)(`h2`,{className:`mt-2 font-display text-3xl text-fg`,children:`KernelBand.py`}),(0,V.jsx)(`p`,{className:`mt-3 max-w-3xl text-sm leading-relaxed text-muted`,children:`Port đúng luật playbook: kernel dẹt thì fade dải MAE (RSI xác nhận, thoát về đường giữa); kernel dốc thì break continuation, trail HMA. Kalman 1D giữ recursion Q/R của Meridian.`}),(0,V.jsx)(`div`,{className:`mt-5 grid gap-3 sm:grid-cols-3`,children:[{t:`Causal`,d:`Kernel chỉ lấy s ≤ t. Chart Meridian vẽ hai phía — đẹp hơn, nhưng mép phải repaint. Bot không được làm vậy.`},{t:`Rolling, không global`,d:`MAE và σ Kalman là cửa sổ lăn. σ cả chuỗi của encyclopedia nhìn tương lai.`},{t:`Hai enter_tag`,d:`fade_long/short thoát khi giá chạm kernel. trend_* trail HMA. Đừng gộp thành một tín hiệu.`}].map(e=>(0,V.jsxs)(`div`,{className:`rounded-lg bg-bg p-4 shadow-[var(--shadow-border)]`,children:[(0,V.jsx)(`p`,{className:`font-medium text-fg`,children:e.t}),(0,V.jsx)(`p`,{className:`mt-2 text-sm leading-relaxed text-muted`,children:e.d})]},e.t))}),(0,V.jsx)(K,{}),(0,V.jsxs)(`div`,{className:`mt-5 flex flex-wrap gap-2`,children:[(0,V.jsxs)(o,{type:`button`,onClick:r,children:[(0,V.jsx)(w,{}),`Tải KernelBand.py`]}),(0,V.jsxs)(o,{type:`button`,variant:`outline`,onClick:n,children:[e?(0,V.jsx)(S,{}):(0,V.jsx)(C,{}),e?`Đã chép`:`Chép file`]})]}),(0,V.jsxs)(`ol`,{className:`mt-6 space-y-2 text-sm text-muted`,children:[(0,V.jsxs)(`li`,{className:`flex gap-3`,children:[(0,V.jsx)(`span`,{className:`font-mono text-xs text-primary`,children:`01`}),`Đặt file vào `,(0,V.jsx)(`span`,{className:`font-mono text-fg`,children:`user_data/strategies/KernelBand.py`})]}),(0,V.jsxs)(`li`,{className:`flex gap-3`,children:[(0,V.jsx)(`span`,{className:`font-mono text-xs text-primary`,children:`02`}),`Config: `,(0,V.jsx)(`span`,{className:`font-mono text-fg`,children:`strategy = KernelBand`}),`, timeframe`,` `,(0,V.jsx)(`span`,{className:`font-mono text-fg`,children:`1h`}),` (đổi 15m nếu scalp; h tăng theo). Futures:`,` `,(0,V.jsx)(`span`,{className:`font-mono text-fg`,children:`trading_mode = futures`}),` để short chạy.`]}),(0,V.jsxs)(`li`,{className:`flex gap-3`,children:[(0,V.jsx)(`span`,{className:`font-mono text-xs text-primary`,children:`03`}),`Dry-run trước. Hyperopt `,(0,V.jsx)(`span`,{className:`font-mono text-fg`,children:`buy sell roi stoploss`}),` — đừng optimize trên chính đoạn bạn sẽ trade live.`]})]}),(0,V.jsx)(`pre`,{className:`mt-6 max-h-[28rem] w-full min-w-0 max-w-full overflow-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]`,children:(0,V.jsx)(`code`,{children:E})})]})}function Y(){let{strategy:e}=u.useLoaderData(),[t,n]=(0,T.useState)(12),s=(0,T.useMemo)(()=>x({scenario:`mixed`,bars:240,seed:t}),[t]),d=(0,T.useMemo)(()=>{let t=e.stack.map(e=>{let t=a(e);return g(e,s,t?l(t):{})});return b(t)},[e.stack,s]),p=c.findIndex(t=>t.slug===e.slug),h=c[p-1],_=c[p+1];return(0,V.jsxs)(`main`,{className:`mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6`,children:[(0,V.jsxs)(r,{to:`/strategies`,className:`inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg`,children:[(0,V.jsx)(i,{className:`size-4`}),`Chiến thuật`]}),(0,V.jsx)(`p`,{className:`mt-4 text-[11px] tracking-[0.18em] text-primary uppercase`,children:e.kicker}),(0,V.jsx)(`h1`,{className:`mt-1 font-display text-4xl text-fg sm:text-5xl`,children:e.name}),(0,V.jsx)(`p`,{className:`mt-4 max-w-3xl text-base leading-relaxed text-muted`,children:e.blurb}),(0,V.jsxs)(`div`,{className:`mt-8 min-w-0 overflow-hidden rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4`,children:[(0,V.jsxs)(`div`,{className:`mb-3 flex items-center justify-between`,children:[(0,V.jsx)(`p`,{className:`text-xs text-muted`,children:`Stack chồng trên kịch bản hỗn hợp`}),(0,V.jsx)(`button`,{type:`button`,className:`h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg`,onClick:()=>n(e=>e+1),children:`Nến mới`})]}),(0,V.jsx)(f,{bars:s,result:d,height:440})]}),(0,V.jsxs)(`div`,{className:`mt-10 grid gap-8 lg:grid-cols-2`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h2`,{className:`font-display text-2xl text-fg`,children:`Luật`}),(0,V.jsx)(`ol`,{className:`mt-4 space-y-3`,children:e.rules.map((e,t)=>(0,V.jsxs)(`li`,{className:`flex gap-3 text-sm leading-relaxed text-muted`,children:[(0,V.jsx)(`span`,{className:`font-mono text-xs text-primary`,children:String(t+1).padStart(2,`0`)}),e]},e))})]}),(0,V.jsxs)(`div`,{className:`space-y-8`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h2`,{className:`font-display text-2xl text-fg`,children:`Regime`}),(0,V.jsx)(`p`,{className:`mt-3 font-mono text-sm text-fg`,children:e.regime})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h2`,{className:`font-display text-2xl text-fg`,children:`Stack`}),(0,V.jsx)(`div`,{className:`mt-3 flex flex-wrap gap-2`,children:e.stack.map(e=>{let t=a(e);return t?(0,V.jsx)(r,{to:`/algorithms/$slug`,params:{slug:e},children:(0,V.jsx)(m,{variant:`accent`,children:t.name})},e):null})})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h2`,{className:`font-display text-2xl text-fg`,children:`Rủi ro`}),(0,V.jsx)(`p`,{className:`mt-3 text-sm text-muted`,children:e.risk})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h2`,{className:`font-display text-2xl text-fg`,children:`Đứng ngoài khi`}),(0,V.jsx)(`p`,{className:`mt-3 text-sm text-muted`,children:e.avoid})]})]})]}),e.freqtrade===`KernelBand`?(0,V.jsx)(J,{}):null,(0,V.jsxs)(`div`,{className:`mt-12 flex flex-wrap gap-3`,children:[(0,V.jsx)(o,{asChild:!0,children:(0,V.jsx)(r,{to:`/lab`,search:{algo:e.stack[0]},children:`Thử stack trong Lab`})}),e.freqtrade?(0,V.jsx)(o,{asChild:!0,variant:`outline`,children:(0,V.jsxs)(`a`,{href:`#freqtrade`,children:[`Freqtrade `,e.freqtrade,`.py`]})}):null]}),(0,V.jsxs)(`div`,{className:`mt-16 flex justify-between border-t border-border pt-6`,children:[h?(0,V.jsxs)(r,{to:`/strategies/$slug`,params:{slug:h.slug},className:`text-sm text-muted hover:text-fg`,children:[`← `,h.name]}):(0,V.jsx)(`span`,{}),_?(0,V.jsxs)(r,{to:`/strategies/$slug`,params:{slug:_.slug},className:`text-sm text-muted hover:text-fg`,children:[_.name,` →`]}):null]})]})}export{Y as component};