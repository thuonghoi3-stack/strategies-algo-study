import type { AlgoResult, Bar } from "./types";
import {
  adxDmi,
  alma,
  atrTrail,
  bollinger,
  cci,
  donchian,
  emaRibbon,
  fibonacci,
  fisherTransform,
  heikinAshi,
  hullMa,
  hurst,
  ichimoku,
  kalman,
  kama,
  keltner,
  linregChannel,
  macd,
  marketStructure,
  nadarayaWatson,
  obv,
  parabolicSar,
  pivotPoints,
  rsiDiv,
  stochastic,
  supertrend,
  vwap,
  zigzag,
} from "./indicators";
import {
  bbStrategy,
  connorsCrsi,
  connorsRsi2,
  donchianEma,
  e0v1e,
  emaCross,
  keltnerBreak,
  macdStrategy,
  maGravity,
  orb,
  rsi7Mom,
  rsiBbFade,
  rsiStrategy,
  stochRsi,
  stochStrategy,
  tpMr,
  tsm,
  ttmSqueeze,
  turtleS1,
  turtleS2,
  turtleSoup,
  turnOfMonth,
  vwapReclaim,
  vwapZscore,
  week52,
  weinstein,
} from "./systems";

export function runAlgorithm(
  slug: string,
  bars: Bar[],
  params: Record<string, number>,
): AlgoResult {
  const p = (key: string, fallback: number) =>
    Number.isFinite(params[key]) ? params[key]! : fallback;

  switch (slug) {
    case "supertrend":
      return supertrend(bars, p("period", 10), p("mult", 3));
    case "adx":
      return adxDmi(bars, p("period", 14));
    case "ichimoku":
      return ichimoku(bars, p("tenkan", 9), p("kijun", 26), p("senkou", 52));
    case "ema-ribbon":
      return emaRibbon(bars, p("fast", 8), p("mid", 21), p("slow", 55));
    case "parabolic-sar":
      return parabolicSar(bars, p("start", 0.02), p("max", 0.2));
    case "donchian":
      return donchian(bars, p("period", 20));
    case "hma":
      return hullMa(bars, p("period", 16));
    case "alma":
      return alma(bars, p("period", 9), p("offset", 0.85), p("sigma", 6));
    case "kama":
      return kama(bars, p("period", 10), p("fast", 2), p("slow", 30));
    case "kalman":
      return kalman(bars, p("q", 0.02), p("r", 0.8));
    case "nadaraya-watson":
      return nadarayaWatson(bars, p("bandwidth", 8), p("mult", 2));
    case "linreg":
      return linregChannel(bars, p("period", 40), p("k", 2));
    case "zigzag":
      return zigzag(bars, p("pct", 5));
    case "market-structure":
      return marketStructure(bars, p("pct", 4));
    case "pivot-points":
      return pivotPoints(bars, p("lookback", 20));
    case "rsi-div":
      return rsiDiv(bars, p("period", 14), p("zz", 4));
    case "fisher":
      return fisherTransform(bars, p("period", 10));
    case "macd":
      return macd(bars, p("fast", 12), p("slow", 26), p("signal", 9));
    case "stochastic":
      return stochastic(bars, p("k", 14), p("d", 3));
    case "cci":
      return cci(bars, p("period", 20));
    case "bollinger":
      return bollinger(bars, p("period", 20), p("k", 2));
    case "keltner":
      return keltner(bars, p("period", 20), p("mult", 1.5));
    case "atr":
      return atrTrail(bars, p("period", 14), p("mult", 2));
    case "vwap":
      return vwap(bars, p("reset", 40));
    case "obv":
      return obv(bars);
    case "heikin-ashi":
      return heikinAshi(bars);
    case "fibonacci":
      return fibonacci(bars, p("pct", 5));
    case "hurst":
      return hurst(bars, p("period", 64));
    case "weinstein-s2":
      return weinstein(bars, p("ma", 30), p("slope", 5));
    case "tp-mr":
      return tpMr(bars, p("fast", 21), p("slow", 55), p("bb", 20), p("rsi", 14));
    case "macd-strategy":
      return macdStrategy(bars, p("fast", 12), p("slow", 26), p("signal", 9));
    case "rsi-strategy":
      return rsiStrategy(bars, p("period", 14), p("ob", 70), p("os", 30));
    case "bb-strategy":
      return bbStrategy(bars, p("period", 20), p("k", 2));
    case "stoch-strategy":
      return stochStrategy(bars, p("k", 14), p("d", 3));
    case "ema-cross":
      return emaCross(bars, p("fast", 12), p("slow", 26));
    case "ema-scalper":
      return emaCross(bars, p("fast", 9), p("slow", 21));
    case "donchian-turtle":
      return turtleS1(bars, p("entry", 20), p("exit", 20));
    case "turtle-s1":
      return turtleS1(bars, p("entry", 20), p("exit", 10));
    case "turtle-s2":
      return turtleS2(bars, p("entry", 55), p("exit", 20));
    case "donchian-ema200":
      return donchianEma(bars, p("don", 55), p("ma", 80));
    case "keltner-break":
      return keltnerBreak(bars, p("period", 20), p("mult", 1.5));
    case "connors-rsi2":
      return connorsRsi2(bars, p("rsi", 2), p("ma", 50), p("th", 10));
    case "connors-crsi":
      return connorsCrsi(bars, p("rsi", 2), p("sum", 2), p("ma", 50), p("th", 20));
    case "ttm-squeeze":
      return ttmSqueeze(bars, p("period", 20), p("bbk", 2), p("kcm", 1.5));
    case "vwap-zscore":
      return vwapZscore(bars, p("reset", 40), p("win", 16), p("z", 2));
    case "vwap-reclaim":
      return vwapReclaim(bars, p("reset", 40));
    case "stoch-rsi":
      return stochRsi(bars, p("rsi", 14), p("k", 14), p("d", 3));
    case "orb":
      return orb(bars, p("session", 40), p("orb", 5));
    case "rsi7-mom":
      return rsi7Mom(bars, p("period", 7));
    case "tsm":
      return tsm(bars, p("lb", 60));
    case "week52-high":
      return week52(bars, p("lb", 80));
    case "ma200-gravity":
      return maGravity(bars, p("ma", 80), p("band", 0.06));
    case "turn-of-month":
      return turnOfMonth(bars, p("ma", 40));
    case "e0v1e":
      return e0v1e(bars, p("fast", 9), p("slow", 21), p("reset", 40));
    case "turtle-soup":
      return turtleSoup(bars, p("don", 20), p("fail", 4));
    case "rsi-bb-fade":
      return rsiBbFade(bars, p("rsi", 14), p("bb", 20), p("k", 2), p("os", 30));
    default:
      return { overlays: [], oscillators: [], signals: [], stats: [] };
  }
}

export function mergeResults(results: AlgoResult[]): AlgoResult {
  return {
    overlays: results.flatMap((r) => r.overlays),
    oscillators: results.flatMap((r) => r.oscillators),
    signals: results.flatMap((r) => r.signals),
    stats: results.flatMap((r) => r.stats),
    chartBars: results.find((r) => r.chartBars)?.chartBars,
    note: results.map((r) => r.note).filter(Boolean).join(" "),
  };
}
