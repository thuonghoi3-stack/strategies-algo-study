import { FAMOUS_STRATEGIES } from "./famous";

export type Strategy = {
  slug: string;
  name: string;
  kicker: string;
  blurb: string;
  regime: string;
  rules: string[];
  stack: string[];
  risk: string;
  avoid: string;
  freqtrade?: string;
};

export const CORE_STRATEGIES: Strategy[] = [
  {
    slug: "trend-follow",
    name: "Trend following",
    kicker: "Đi cùng sóng",
    blurb:
      "Không đoán đỉnh đáy. Vào khi xu hướng đã có, giữ đến khi Supertrend flip hoặc cấu trúc gãy. Edge nằm ở đuôi phân phối — vài lệnh thắng lớn bù chuỗi cắt lỗ nhỏ.",
    regime: "Hurst > 0.55 · ADX > 25 · ribbon xòe",
    rules: [
      "Filter: ADX(14) > 20 và đang tăng; Hurst > 0.55.",
      "Entry: đóng cửa break Donchian 20 cùng hướng Supertrend.",
      "Stop: Supertrend hoặc 2×ATR dưới/trên entry.",
      "Không đảo chiều trong cùng phiên. Chờ flip + BOS.",
      "Size: risk cố định 0.5–1% equity / (2×ATR).",
    ],
    stack: ["hurst", "adx", "supertrend", "donchian", "atr"],
    risk: "Chuỗi whipsaw khi regime đổi. Rút vốn lớn nếu không cắt khi ADX gãy.",
    avoid: "Range, tin tức binary, thị trường mean-revert kéo dài.",
  },
  {
    slug: "mean-reversion",
    name: "Mean reversion",
    kicker: "Về giá trị",
    blurb:
      "Giá đi quá xa Kalman/Bollinger rồi bị kéo về. Chỉ bật khi thị trường không persist. Edge là xác suất, không phải R:R lớn — win rate cao, payoff nhỏ.",
    regime: "Hurst < 0.45 · ADX < 20 · BW không đang nở",
    rules: [
      "Filter: Hurst < 0.45 và ADX < 20.",
      "Entry: đóng cửa ngoài dải Kalman/BB rồi nến xác nhận quay lại.",
      "Kích hoạt kép: RSI thoát 30/70 hoặc Fisher cắt từ cực trị.",
      "Target: đường giữa. Không tham lam walk-the-band.",
      "Stop: ngoài swing vừa tạo, tối đa 1.5×ATR.",
    ],
    stack: ["hurst", "kalman", "bollinger", "rsi-div", "fisher"],
    risk: "Một breakout thật sẽ xuyên stop. Không 'trung bình giá'.",
    avoid: "H > 0.55, squeeze sắp nổ, phiên tin.",
  },
  {
    slug: "squeeze-break",
    name: "Squeeze breakout",
    kicker: "Nổ sau im",
    blurb:
      "Bollinger nằm trong Keltner = vol chết. Khi BB cắt ra, hướng lấy từ Donchian/CCI. Turtle hiện đại: không break mọi đỉnh, chỉ break sau squeeze.",
    regime: "Bandwidth percentile thấp · BB ⊂ KC",
    rules: [
      "Nhận diện squeeze: BW thấp và BB nằm trong KC.",
      "Entry: đóng cửa ngoài Donchian cùng lúc BB thoát KC.",
      "Xác nhận: CCI cắt ±100 hoặc MACD hist đổi dấu cùng chiều.",
      "Stop: phía bên kia kênh Keltner hoặc 1.5×ATR.",
      "Trail Supertrend sau khi lời > 1×ATR.",
    ],
    stack: ["bollinger", "keltner", "donchian", "cci", "supertrend"],
    risk: "Fake break hai phía. Phí nếu trade squeeze quá sớm.",
    avoid: "Squeeze trên thanh khoản chết. Break ngược volume.",
  },
  {
    slug: "ichimoku-kumo",
    name: "Ichimoku kumo",
    kicker: "Một biểu đồ đủ",
    blurb:
      "Hệ cổ điển Nhật: giá trên mây, TK-cross, Chikou tự do, kumo tương lai cùng màu. Bốn điều kiện — thiếu một thì đứng ngoài. Ít lệnh, R:R đẹp.",
    regime: "Giá ngoài kumo · mây tương lai dày vừa",
    rules: [
      "Long chỉ khi giá trên kumo; short dưới kumo. Cấm trong mây.",
      "Tenkan cắt Kijun cùng chiều, Kijun dẹt thì giảm size.",
      "Chikou không bị giá/mây cản ở 26 nến trước.",
      "Kumo tương lai cùng màu với lệnh (Span A > B nếu long).",
      "Stop dưới/trên mây hoặc Kijun. Trail theo Kijun.",
    ],
    stack: ["ichimoku", "atr", "adx"],
    risk: "Trễ. Bỏ lỡ đầu sóng. Mây mỏng dễ xuyên.",
    avoid: "Khung quá nhỏ. Thị trường gap liên tục.",
  },
  {
    slug: "structure-smc",
    name: "Cấu trúc + Fib",
    kicker: "Price action có luật",
    blurb:
      "Bias từ HH/HL. CHoCH cảnh báo. Pullback Fibonacci 0.5–0.618 của chân vừa BOS là nơi vào. Oscillator chỉ xác nhận, không dẫn dắt.",
    regime: "Swing rõ · không chop M1",
    rules: [
      "Vẽ swing từ ZigZag đã chốt. Đọc 4 điểm cuối.",
      "Chỉ long khi cấu trúc HH/HL còn; CHoCH → đứng ngoài, chờ BOS mới.",
      "Entry: 0.618 của chân BOS, nến từ chối, RSI thoát oversold.",
      "Invalid: đóng cửa dưới HL vừa tôn trọng.",
      "Target: swing high trước, rồi extension 1.272.",
    ],
    stack: ["market-structure", "zigzag", "fibonacci", "rsi-div"],
    risk: "Subjective swing. Overfit bằng mắt. CHoCH giả trên tin.",
    avoid: "Khung nhỏ, threshold ZigZag quá thấp.",
  },
  {
    slug: "kernel-band",
    name: "Kernel band",
    kicker: "Fair value phi tuyến",
    blurb:
      "Nadaraya–Watson + Kalman: hai ước lượng fair value. Khi giá chạm dải và kernel dẹt — fade. Khi kernel dốc và giá bám biên — đừng fade, flip sang trend.",
    regime: "Kernel dẹt · H thấp · hoặc kernel dốc · H cao",
    rules: [
      "Hai chế độ, một chart: đọc slope kernel trước.",
      "Dẹt: fade chạm dải MAE, target đường giữa.",
      "Dốc: break dải cùng chiều = continuation, trail HMA/ALMA.",
      "Không dùng nến cuối của kernel đối xứng như đã chốt.",
      "Xác nhận Fisher/RSI khi fade.",
    ],
    stack: ["nadaraya-watson", "kalman", "hma", "fisher"],
    risk: "Lookahead cảm nhận ở giữa chuỗi. Mép phải vẫn sống.",
    avoid: "Trade như tín hiệu đã repaint xong.",
    freqtrade: "KernelBand",
  },
  {
    slug: "momentum-burst",
    name: "Momentum burst",
    kicker: "Gia tốc ngắn",
    blurb:
      "MACD hist nở + Stochastic thoát 20/80 + giá trên EMA ribbon. Burst sống 5–15 nến. Không phải hệ nắm hàng tháng.",
    regime: "Vol nở · hist MACD cùng dấu với giá",
    rules: [
      "Bias: giá vs EMA 55. Không burst ngược ribbon.",
      "Trigger: MACD hist đổi dương/âm và Stochastic rời cực.",
      "Volume/OBV xác nhận (nếu có volume thật).",
      "Thoát khi hist co 2 nến liên tiếp hoặc SAR flip.",
      "Time-stop: 12 nến nếu chưa 1×ATR.",
    ],
    stack: ["macd", "stochastic", "ema-ribbon", "parabolic-sar", "obv"],
    risk: "Burst giả sau tin. Overtrading.",
    avoid: "Range ADX < 15. Burst thứ ba cùng hướng trong ngày.",
  },
  {
    slug: "session-anchor",
    name: "Session anchor",
    kicker: "VWAP + Pivot",
    blurb:
      "Intraday desk: bias ngày từ giá so với Pivot và VWAP. Kéo về VWAP trong xu hướng phiên là entry. R1/S1 là target đầu. ATR% quyết định có với R2 hay không.",
    regime: "Phiên có volume · gap không quá 1.5×ATR",
    rules: [
      "Mở trên P và VWAP → chỉ long. Dưới cả hai → chỉ short.",
      "Hai mỏ neo lệch nhau → giảm size, chờ chúng hội tụ.",
      "Entry: pullback VWAP, nến từ chối, Stochastic ủng hộ.",
      "Target R1/S1. R2 chỉ khi ATR% ngày đang nở.",
      "Đứng ngoài 15 phút đầu nếu gap lớn.",
    ],
    stack: ["vwap", "pivot-points", "stochastic", "atr"],
    risk: "Phiên tin. VWAP reset sai mốc.",
    avoid: "Thị trường 24/7 không neo. Illiquid lunch.",
  },
];

export const STRATEGIES: Strategy[] = [...CORE_STRATEGIES, ...FAMOUS_STRATEGIES];

export function getStrategy(slug: string) {
  return STRATEGIES.find((s) => s.slug === slug);
}
