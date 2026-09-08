# pragma pylint: disable=missing-docstring, invalid-name, pointless-string-statement
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
  freqtrade hyperopt   --strategy KernelBand --hyperopt-loss SharpeHyperOptLossDaily \\
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
