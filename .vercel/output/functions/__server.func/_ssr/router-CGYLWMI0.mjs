import { i as __toESM } from "../_runtime.mjs";
import { n as getStrategy, r as FAMOUS_ALGORITHMS } from "./strategies-uwdh_W5o.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { R as notFound, _ as createRootRoute, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Menu, n as TriangleAlert, t as X } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog--iol_Naz.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var CATEGORIES = [
	{
		id: "trend",
		label: "Xu hướng",
		kicker: "Direction",
		body: "Trả lời câu hỏi duy nhất: giá đang đi đâu — và khi nào xu hướng còn sống."
	},
	{
		id: "curve",
		label: "Đường cong",
		kicker: "Smoothing",
		body: "Lọc nhiễu, ước lượng quỹ đạo ẩn. Kalman, kernel, hồi quy — không phải SMA cổ điển."
	},
	{
		id: "reversal",
		label: "Đảo chiều",
		kicker: "Turning points",
		body: "Pivot, phân kỳ, Fisher, Fibonacci — điểm giá đổi tay, không phải đoán đỉnh đáy."
	},
	{
		id: "momentum",
		label: "Động lượng",
		kicker: "Impulse",
		body: "Sức mạnh của chuyển động. MACD, Stochastic, CCI đo gia tốc chứ không đo vị trí."
	},
	{
		id: "volatility",
		label: "Biến động",
		kicker: "Range",
		body: "ATR, Bollinger, Keltner — kích thước nến, squeeze, và khi nào breakout đáng tin."
	},
	{
		id: "volume",
		label: "Khối lượng",
		kicker: "Participation",
		body: "Giá không đi một mình. VWAP và OBV đọc dòng tiền đứng sau nến."
	},
	{
		id: "structure",
		label: "Cấu trúc",
		kicker: "Market structure",
		body: "HH/HL, BOS, CHoCH. Bản đồ swing trước khi gắn oscillator."
	},
	{
		id: "system",
		label: "Hệ thống",
		kicker: "Named systems",
		body: "Turtle, Connors, Weinstein, TTM, VWAP Z — luật vào/ra đủ, không phải một đường."
	}
];
var ALGORITHMS = [...[
	{
		slug: "supertrend",
		name: "Supertrend",
		nameVi: "Siêu xu hướng ATR",
		category: "trend",
		blurb: "Trailing stop dựa ATR. Flip hướng khi giá đóng cửa xuyên đường.",
		summary: "Supertrend lấy trung điểm nến ± hệ số ATR. Ở pha tăng, đường bám dưới giá và chỉ nâng lên; khi đóng cửa thủng đường, hướng đảo và đường nhảy lên trên. Đơn giản hơn Ichimoku, ít nhiễu hơn EMA crossover.",
		how: [
			"ATR đo biến động thực — đường tự nới khi thị trường giật, siết khi yên.",
			"Chỉ flip khi đóng cửa xuyên, không phải wick — lọc nhiễu trong ngày.",
			"Dùng như filter: chỉ lấy tín hiệu cùng hướng Supertrend, không phải entry duy nhất."
		],
		formula: "HL2 = (H+L)/2\nUp = HL2 − m·ATR\nDn = HL2 + m·ATR\nST = hướng tăng ? Up : Dn",
		useWhen: "Thị trường có drift rõ (ADX > 20). Crypto, hàng hóa, index trend.",
		failWhen: "Sideway hẹp: flip liên tục (whipsaw). Không dùng làm mean-reversion.",
		combine: "Lọc ADX, vào theo Donchian breakout cùng hướng, trailing bằng chính Supertrend.",
		params: [{
			key: "period",
			label: "ATR period",
			min: 5,
			max: 30,
			step: 1,
			default: 10
		}, {
			key: "mult",
			label: "Hệ số ATR",
			min: 1,
			max: 6,
			step: .1,
			default: 3
		}],
		best: "uptrend",
		tags: [
			"ATR",
			"trailing",
			"flip"
		]
	},
	{
		slug: "adx",
		name: "ADX / DMI",
		nameVi: "Chỉ số hướng trung bình",
		category: "trend",
		blurb: "Đo độ mạnh xu hướng, không đo chiều. +DI/−DI mới cho chiều.",
		summary: "ADX của Wilder tách hai việc hay bị nhầm: có xu hướng hay không (ADX), và chiều nào (+DI vs −DI). ADX cao trong downtrend cũng như uptrend. Đó là filter, không phải compass.",
		how: [
			"+DM / −DM so sánh bước high và bước low.",
			"DX = |+DI − −DI| / (+DI + −DI), ADX là RMA của DX.",
			"Ngưỡng thực dụng: ADX < 20 sideway, > 25 xu hướng sống, > 40 quá đà — không phải vào thêm."
		],
		formula: "+DI = 100 · RMA(+DM) / ATR\nADX = RMA(DX, n)",
		useWhen: "Lọc setup. Bật mean-reversion khi ADX thấp, trend-follow khi ADX tăng.",
		failWhen: "Dùng ADX như tín hiệu mua/bán. ADX không biết chiều.",
		combine: "Cặp Supertrend hoặc Donchian. Chỉ vào khi ADX đang lên từ dưới 20.",
		params: [{
			key: "period",
			label: "Chu kỳ",
			min: 7,
			max: 28,
			step: 1,
			default: 14
		}],
		best: "uptrend",
		tags: [
			"Wilder",
			"filter",
			"DMI"
		]
	},
	{
		slug: "ichimoku",
		name: "Ichimoku Kinko Hyo",
		nameVi: "Nhất mục cân bằng biểu",
		category: "trend",
		blurb: "Năm đường, một mây. Hỗ trợ, kháng cự, momentum và thời gian trên một chart.",
		summary: "Ichimoku không phải 'một indicator'. Tenkan/Kijun là midpoint nhanh/chậm. Kumo (Senkou A/B) dịch 26 nến — hỗ trợ/kháng cự tương lai. Chikou là giá trễ 26 nến, đối chiếu với giá quá khứ. Vào chuẩn: giá trên mây, Tenkan cắt lên Kijun, Chikou tự do, mây tương lai xanh.",
		how: [
			"Tenkan (9) = (highest high + lowest low)/2 — nhạy hơn EMA.",
			"Kumo dày = S/R mạnh; mây mỏng = breakout dễ hơn.",
			"Không trade trong mây. Chờ kicker (giá thoát Kumo) rồi mới TK-cross."
		],
		formula: "Tenkan = (HH+LL)/2 · 9\nKijun = (HH+LL)/2 · 26\nSpan A = (Tenkan+Kijun)/2  → +26\nSpan B = (HH+LL)/2 · 52   → +26",
		useWhen: "Khung H4/D1, thị trường có nhịp (FX majors, index). Cần không gian nhìn mây.",
		failWhen: "M1/M5 nhiễu. Tin tức làm mây mất nghĩa trong vài nến.",
		combine: "ATR để đặt stop ngoài mây. ADX xác nhận khi giá thoát Kumo.",
		params: [
			{
				key: "tenkan",
				label: "Tenkan",
				min: 5,
				max: 15,
				step: 1,
				default: 9
			},
			{
				key: "kijun",
				label: "Kijun",
				min: 13,
				max: 40,
				step: 1,
				default: 26
			},
			{
				key: "senkou",
				label: "Senkou B",
				min: 26,
				max: 78,
				step: 1,
				default: 52
			}
		],
		best: "mixed",
		tags: [
			"kumo",
			"cloud",
			"Hosoda"
		]
	},
	{
		slug: "ema-ribbon",
		name: "EMA Ribbon",
		nameVi: "Dải EMA",
		category: "trend",
		blurb: "Ba EMA xếp tầng. Ribbon xòe = xu hướng sống. Ribbon xoắn = chết trend.",
		summary: "Crossover 8/21 cổ điển nhiễu. Ribbon thêm EMA chậm (55) làm xương sống. Tín hiệu sạch: EMA nhanh cắt lên chậm trong khi ribbon đã sắp xếp đúng thứ tự — không cắt khi ba đường đang thắt nút.",
		how: [
			"Thứ tự tăng: EMA8 > 21 > 55. Giảm: ngược lại.",
			"Khoảng cách ribbon ≈ sức mạnh. Co lại là cảnh báo, chưa phải đảo.",
			"Pullback vào EMA21 trong ribbon còn xòe thường tốt hơn breakout đuổi giá."
		],
		formula: "EMA(n) = α·P + (1−α)·EMA_prev\nα = 2/(n+1)",
		useWhen: "Trend bền. Cổ phiếu, BTC daily. Kết hợp volume tăng khi ribbon xòe.",
		failWhen: "Range: crossover liên tục. Không trade khi ba EMA quấn nhau.",
		combine: "Hurst > 0.55 hoặc ADX > 20 trước khi nhận cross.",
		params: [
			{
				key: "fast",
				label: "Nhanh",
				min: 5,
				max: 15,
				step: 1,
				default: 8
			},
			{
				key: "mid",
				label: "Giữa",
				min: 13,
				max: 34,
				step: 1,
				default: 21
			},
			{
				key: "slow",
				label: "Chậm",
				min: 34,
				max: 100,
				step: 1,
				default: 55
			}
		],
		best: "uptrend",
		tags: [
			"EMA",
			"crossover",
			"ribbon"
		]
	},
	{
		slug: "parabolic-sar",
		name: "Parabolic SAR",
		nameVi: "Dừng và đảo parabol",
		category: "trend",
		blurb: "Chấm bám giá, tăng tốc theo AF. Khi chấm nhảy sang phía kia — đảo.",
		summary: "Wilder thiết kế SAR vừa là trailing stop vừa là tín hiệu đảo. Acceleration factor tăng mỗi khi làm cực trị mới, nên đường càng lúc càng siết. Đó là sức mạnh và cũng là điểm chết trong chop.",
		how: [
			"SAR_t = SAR_{t−1} + AF·(EP − SAR_{t−1}).",
			"AF bắt đầu 0.02, cộng 0.02 mỗi extreme mới, trần 0.20.",
			"Dùng SAR làm stop, không phải làm lý do vào lệnh duy nhất."
		],
		formula: "SAR = SAR + AF · (EP − SAR)",
		useWhen: "Trend mượt, ít gap. Hàng hóa, FX có session rõ.",
		failWhen: "Whipsaw. Gap cuối tuần xuyên SAR giả.",
		combine: "Chỉ nhận flip SAR khi Supertrend cùng hướng và ADX đang lên.",
		params: [{
			key: "start",
			label: "AF khởi",
			min: .01,
			max: .05,
			step: .01,
			default: .02
		}, {
			key: "max",
			label: "AF max",
			min: .1,
			max: .4,
			step: .02,
			default: .2
		}],
		best: "uptrend",
		tags: [
			"Wilder",
			"SAR",
			"stop"
		]
	},
	{
		slug: "donchian",
		name: "Donchian Channel",
		nameVi: "Kênh Donchian",
		category: "trend",
		blurb: "Breakout thuần: đóng cửa trên max N nến = long. Nền tảng Turtle.",
		summary: "Richard Donchian, rồi Turtle Traders: mua khi giá làm đỉnh N ngày, bán khi đáy N ngày. Không dự đoán. Channel rộng trong xu hướng, bẹp trong tích lũy — bản thân độ rộng là tín hiệu regime.",
		how: [
			"Upper = highest high N, Lower = lowest low N.",
			"Turtle gốc: vào 20, thoát 10. Entry dài, exit ngắn.",
			"Lọc breakout giả bằng volume hoặc ATR expansion."
		],
		formula: "Upper = max(High, N)\nLower = min(Low, N)",
		useWhen: "Thị trường có đuôi fat-tail, trend kéo dài (commodities, crypto).",
		failWhen: "Range dài: liên tục stop hai phía. Phí giao dịch ăn hết edge.",
		combine: "Squeeze Bollinger/Keltner trước break. ADX xác nhận sau break.",
		params: [{
			key: "period",
			label: "Cửa sổ",
			min: 10,
			max: 55,
			step: 1,
			default: 20
		}],
		best: "breakout",
		tags: [
			"Turtle",
			"breakout",
			"channel"
		]
	},
	{
		slug: "hma",
		name: "Hull Moving Average",
		nameVi: "Trung bình Hull",
		category: "curve",
		blurb: "WMA lồng WMA, độ trễ gần như zero mà vẫn mượt hơn SMA.",
		summary: "Alan Hull giải bài toán MA: SMA trễ, EMA vẫn trễ khi n lớn. HMA = WMA(2·WMA(n/2) − WMA(n), √n). Đổi màu/đổi slope của HMA là tín hiệu sớm — sớm đến mức dễ overfit nếu săn từng chỗ gãy.",
		how: [
			"Hiệu 2·WMA_nhanh − WMA_chậm triệt trễ.",
			"WMA trên √n làm mượt lại nhiễu vừa tạo ra.",
			"Trade slope, đừng trade giá cắt HMA — quá sát sẽ nhiễu."
		],
		formula: "HMA = WMA( 2·WMA(n/2) − WMA(n), √n )",
		useWhen: "Cần đường dẫn hướng trên H1+ mà không muốn mây Ichimoku.",
		failWhen: "M5 scalp. Slope flip từng nến.",
		combine: "HMA làm bias, RSI/Fisher làm trigger trên pullback về HMA.",
		params: [{
			key: "period",
			label: "Chu kỳ",
			min: 6,
			max: 55,
			step: 1,
			default: 16
		}],
		best: "uptrend",
		tags: [
			"Hull",
			"WMA",
			"low-lag"
		]
	},
	{
		slug: "alma",
		name: "ALMA",
		nameVi: "Arnaud Legoux MA",
		category: "curve",
		blurb: "Gaussian trọng số lệch về nến mới. Offset điều khiển trễ vs mượt.",
		summary: "ALMA là đường Gaussian trên cửa sổ n, đỉnh phân phối đặt tại offset·(n−1). Offset 0.85 = gần real-time; 0.5 = đối xứng như kernel hai phía. Sigma siết hay nới quả chuông.",
		how: [
			"Offset cao → bám giá, nhiễu hơn. Thấp → mượt, trễ hơn.",
			"Sigma 6 là mặc định thực dụng.",
			"Cắt ALMA kết hợp slope cùng chiều mới đáng tin."
		],
		formula: "w_i = exp( −(i − m)² / (2σ²) )\nALMA = Σ w_i P_i / Σ w_i",
		useWhen: "Muốn một đường thay EMA, tinh chỉnh được trễ.",
		failWhen: "Offset quá cao trên dữ liệu tick — gần như đường giá.",
		combine: "ALMA bias + Stochastic thoát vùng quá mua/bán.",
		params: [
			{
				key: "period",
				label: "Cửa sổ",
				min: 5,
				max: 30,
				step: 1,
				default: 9
			},
			{
				key: "offset",
				label: "Offset",
				min: .3,
				max: .95,
				step: .05,
				default: .85
			},
			{
				key: "sigma",
				label: "Sigma",
				min: 2,
				max: 10,
				step: .5,
				default: 6
			}
		],
		best: "mixed",
		tags: ["Gaussian", "Legoux"]
	},
	{
		slug: "kama",
		name: "KAMA",
		nameVi: "MA thích nghi Kaufman",
		category: "curve",
		blurb: "Tự đổi tốc độ: chạy khi Efficiency Ratio cao, đứng khi sideway.",
		summary: "Kaufman đo ER = |change n nến| / Σ |change 1 nến|. ER gần 1 → thị trường đi thẳng → KAMA hành xử như EMA nhanh. ER gần 0 → KAMA gần như đứng. Đó là MA biết im.",
		how: [
			"SC = [ER·(fastSC − slowSC) + slowSC]² — bình phương để trễ mạnh khi ER thấp.",
			"Không cắt KAMA trong ER thấp — đường không kịp.",
			"Tín hiệu: KAMA đổi slope sau một đoạn phẳng (escape từ range)."
		],
		formula: "ER = |P_t − P_{t−n}| / Σ|ΔP|\nKAMA = KAMA + SC² · (P − KAMA)",
		useWhen: "Thị trường luân phiên range/trend (index, large-cap).",
		failWhen: "Gap lớn làm ER nhảy, KAMA phóng theo một nến.",
		combine: "Đọc ER như regime. Trend system khi ER cao, BB khi ER thấp.",
		params: [
			{
				key: "period",
				label: "ER period",
				min: 6,
				max: 30,
				step: 1,
				default: 10
			},
			{
				key: "fast",
				label: "Fast",
				min: 2,
				max: 5,
				step: 1,
				default: 2
			},
			{
				key: "slow",
				label: "Slow",
				min: 20,
				max: 50,
				step: 1,
				default: 30
			}
		],
		best: "breakout",
		tags: [
			"Kaufman",
			"adaptive",
			"ER"
		]
	},
	{
		slug: "kalman",
		name: "Kalman Filter",
		nameVi: "Lọc Kalman 1D",
		category: "curve",
		blurb: "Ước lượng giá 'thật' dưới nhiễu đo. Q = tin mô hình, R = tin quan sát.",
		summary: "Kalman không phải MA. Mỗi nến: dự báo (P += Q), rồi hiệu chỉnh bằng gain K = P/(P+R). Q lớn → bám giá. R lớn → tin đường ước lượng hơn nến mới. Dải ±1.6σ residual là kênh mean-reversion sạch.",
		how: [
			"Q nhỏ, R lớn: đường rất mượt, trễ hơn — giống SMA thông minh.",
			"Q lớn: gần như giá. Mất ý nghĩa filter.",
			"Fade khi giá chạm dải, không fade khi Kalman đang slope mạnh (trend)."
		],
		formula: "P = P + Q\nK = P / (P + R)\nx = x + K · (z − x)\nP = (1 − K) · P",
		useWhen: "Nhiễu microstructure, mean-reversion có kiểm soát.",
		failWhen: "Trend bền: fade dải sẽ ngược sóng. Kiểm tra Hurst trước.",
		combine: "Hurst < 0.5 mới fade. Cắt lỗ khi Kalman đổi slope.",
		params: [{
			key: "q",
			label: "Q (process)",
			min: .002,
			max: .08,
			step: .002,
			default: .02
		}, {
			key: "r",
			label: "R (measure)",
			min: .1,
			max: 2,
			step: .05,
			default: .8
		}],
		best: "range",
		tags: ["filter", "state-space"]
	},
	{
		slug: "nadaraya-watson",
		name: "Nadaraya–Watson",
		nameVi: "Hồi quy kernel",
		category: "curve",
		blurb: "Đường cong Gaussian quanh mỗi nến. Bandwidth = độ mượt. Nổi trên TradingView.",
		summary: "Estimator không tham số: ŷ(t) = Σ K((t−s)/h)·P_s / Σ K. Kernel hai phía nhìn cả tương lai trong mẫu — mép phải vẫn lookahead-free nếu chỉ dùng s ≤ t, nhưng bản phổ biến trên chart dùng cửa sổ đối xứng nên đường giữa 'quá đẹp'. Meridian dùng kernel hai phía để bạn thấy đúng thứ người ta vẽ, và ghi rõ giới hạn mép phải.",
		how: [
			"h nhỏ: bám nhiễu. h lớn: đường gần như đường thẳng.",
			"Dải MAE (mean abs error) làm kênh — không phải σ Gaussian.",
			"Mean-reversion khi giá ra dải và kernel dẹt. Trend khi kernel dốc và giá bám biên."
		],
		formula: "ŷ(t) = Σ K((t−s)/h) P_s / Σ K((t−s)/h)\nK(u) = exp(−u² / 2)",
		useWhen: "Nhìn 'fair value' phi tuyến. Scalp mean-reversion trên dải.",
		failWhen: "Tin đường giữa ở nến cuối như đã chốt — h hai phía sẽ sửa khi có nến mới.",
		combine: "Dùng như analog của BB nhưng phi tuyến. RSI xác nhận fade.",
		params: [{
			key: "bandwidth",
			label: "Bandwidth h",
			min: 3,
			max: 24,
			step: 1,
			default: 8
		}, {
			key: "mult",
			label: "MAE mult",
			min: 1,
			max: 4,
			step: .1,
			default: 2
		}],
		best: "range",
		tags: ["kernel", "nonparametric"]
	},
	{
		slug: "linreg",
		name: "Linear Regression Channel",
		nameVi: "Kênh hồi quy tuyến tính",
		category: "curve",
		blurb: "Least squares trên N nến. Slope = drift. ±kσ residual = kênh.",
		summary: "Hồi quy tuyến tính là mô hình drift đơn giản nhất: P ≈ a + b·t. Residual σ cho biết giá đang 'đắt' hay 'rẻ' so với quỹ đạo. Khác Bollinger: trục kênh nghiêng theo xu hướng, không nằm ngang.",
		how: [
			"b > 0 bền + residual mean-revert về fit = trend-following pullback.",
			"Giá ôm biên trên dài = momentum, đừng fade.",
			"Cửa sổ quá ngắn → slope nhảy. 30–60 nến thực dụng."
		],
		formula: "b = (nΣty − Σt Σy) / (nΣt² − (Σt)²)\nChannel = fit ± k · σ_resid",
		useWhen: "Trend có nhịp, pullback đều (index, FX daily).",
		failWhen: "Reversal chữ V: fit còn dốc lên khi giá đã gãy.",
		combine: "CHoCH cấu trúc để bỏ kênh cũ. ATR chốt lời tại biên.",
		params: [{
			key: "period",
			label: "Cửa sổ",
			min: 20,
			max: 80,
			step: 2,
			default: 40
		}, {
			key: "k",
			label: "σ multiplier",
			min: 1,
			max: 3,
			step: .1,
			default: 2
		}],
		best: "uptrend",
		tags: ["OLS", "channel"]
	},
	{
		slug: "zigzag",
		name: "ZigZag",
		nameVi: "Đường gãy khúc",
		category: "reversal",
		blurb: "Nối các pivot khi giá đảo vượt ngưỡng %. Không phải tín hiệu real-time.",
		summary: "ZigZag là công cụ đánh dấu, không phải hệ thống. Pivot cuối luôn tạm — chỉ chốt khi giá đảo đủ threshold. Dùng để đo Fibonacci, Elliott, cấu trúc HH/HL. Không backtest ZigZag như entry.",
		how: [
			"Threshold 4–6% daily cổ phiếu, 1–2% FX, 8%+ altcoin.",
			"Pivot cuối sẽ dịch. Mọi 'tín hiệu' gắn pivot cuối đều repaint.",
			"Dùng các pivot đã chốt (trừ điểm cuối) để đo sóng."
		],
		formula: "Pivot mới khi |P − extreme| / extreme ≥ θ",
		useWhen: "Gắn nhãn sóng, đo retrace, dạy cấu trúc.",
		failWhen: "Trade pivot cuối. Đó chưa phải pivot.",
		combine: "Nguồn swing cho Fibonacci, market structure, RSI divergence.",
		params: [{
			key: "pct",
			label: "Ngưỡng %",
			min: 1,
			max: 12,
			step: .5,
			default: 5
		}],
		best: "reversal",
		tags: ["pivot", "repaint"]
	},
	{
		slug: "market-structure",
		name: "Market Structure",
		nameVi: "Cấu trúc HH/HL · CHoCH",
		category: "structure",
		blurb: "Xu hướng = higher high + higher low. CHoCH là gãy cấu trúc đầu tiên.",
		summary: "Price action có luật: uptrend in HH/HL, downtrend in LH/LL. Break of structure (BOS) cùng chiều = tiếp diễn. Change of character (CHoCH) = phá HL trong uptrend hoặc HH trong downtrend — cảnh báo đảo, chưa phải đảo xong. SMC/ICT bọc khái niệm này bằng thuật ngữ; lõi vẫn là swing.",
		how: [
			"Lấy swing từ ZigZag, đọc 4 điểm cuối.",
			"CHoCH cần đóng cửa xuyên, không chỉ wick.",
			"Sau CHoCH, chờ BOS ngược chiều mới đảo bias."
		],
		formula: "Uptrend: HH ∧ HL\nCHoCH↑→↓: close < last HL",
		useWhen: "Mọi khung. Là lớp nền trước indicator.",
		failWhen: "Swing quá nhỏ trên M1 = nhiễu cấu trúc.",
		combine: "Fibonacci từ swing vừa gãy. Order block chỉ là vùng quanh swing.",
		params: [{
			key: "pct",
			label: "Swing %",
			min: 1.5,
			max: 10,
			step: .5,
			default: 4
		}],
		best: "reversal",
		tags: [
			"SMC",
			"CHoCH",
			"BOS"
		]
	},
	{
		slug: "pivot-points",
		name: "Pivot Points",
		nameVi: "Điểm quay cổ điển",
		category: "reversal",
		blurb: "P, R1–R3, S1–S3 từ H/L/C kỳ trước. Floor trader dùng hàng thập kỷ.",
		summary: "Classic floor-pivot: P = (H+L+C)/3. R1/S1 là mục tiêu phiên; R2/S2 là mở rộng. Giá trên P = bias tăng phiên. Meridian tính P từ cửa sổ lookback (mô phỏng 'phiên trước') trên chuỗi giả lập.",
		how: [
			"Mở trên P, giữ trên P → ưu tiên long về R1.",
			"R3/S3 hiếm khi chạm — nếu chạm, thường là ngày tin.",
			"Camarilla chặt hơn, Fibonacci pivot loãng hơn — classic vẫn là mặc định."
		],
		formula: "P = (H+L+C)/3\nR1 = 2P − L\nS1 = 2P − H",
		useWhen: "Intraday, session rõ (FX, index futures).",
		failWhen: "Gap lớn làm P 'treo' xa giá. Lookback không khớp session thật.",
		combine: "VWAP cùng phía với P tăng xác suất. ATR để biết R1 có với tới.",
		params: [{
			key: "lookback",
			label: "Lookback",
			min: 8,
			max: 40,
			step: 1,
			default: 20
		}],
		best: "range",
		tags: ["floor", "S/R"]
	},
	{
		slug: "rsi-div",
		name: "RSI + Phân kỳ",
		nameVi: "Sức mạnh tương đối & divergence",
		category: "reversal",
		blurb: "Wilder RSI. Phân kỳ giá/RSI là tín hiệu đảo có xác suất, không phải chắc chắn.",
		summary: "RSI đo trung bình gain vs loss. Vùng 70/30 là quá mua/bán — trong trend, RSI có thể neo ở đó rất lâu. Phân kỳ: giá HH trong khi RSI LH (âm) hoặc giá LL / RSI HL (dương). Chỉ đáng tin khi phân kỳ xuất hiện ở swing đã chốt và ADX không đang tăng mạnh.",
		how: [
			"Không short chỉ vì RSI > 70 trong uptrend.",
			"Phân kỳ thường xuyên — lọc bằng cấu trúc hoặc volume.",
			"Thoát oversold (cắt lên 30) sạch hơn tự RSI < 30."
		],
		formula: "RSI = 100 − 100 / (1 + RS)\nRS = RMA(gain, n) / RMA(loss, n)",
		useWhen: "Range, hoặc cuối trend khi ADX đã mòn.",
		failWhen: "Trend mạnh. Phân kỳ sớm bị giá bỏ lại.",
		combine: "CHoCH + phân kỳ RSI = setup đảo tốt hơn từng cái một.",
		params: [{
			key: "period",
			label: "RSI n",
			min: 5,
			max: 28,
			step: 1,
			default: 14
		}, {
			key: "zz",
			label: "Swing %",
			min: 2,
			max: 8,
			step: .5,
			default: 4
		}],
		best: "reversal",
		tags: ["Wilder", "divergence"]
	},
	{
		slug: "fisher",
		name: "Fisher Transform",
		nameVi: "Biến đổi Fisher",
		category: "reversal",
		blurb: "Ehlers: nén giá về Gaussian rồi artanh — đỉnh đáy sắc hơn RSI.",
		summary: "John Ehlers biến phân phối giá (không Gaussian) thành gần Gaussian, rồi Fisher (artanh) để đuôi mỏng thành cực trị rõ. Fisher cắt signal line gần đỉnh/đáy hơn MACD. Cực trị ±1.5 đến ±2 là vùng đảo thực dụng.",
		how: [
			"Normalize midpoint về (−1, 1) trên cửa sổ n, smoothing 0.33/0.67.",
			"Fisher = 0.5 ln((1+x)/(1−x)) + 0.5 Fisher_prev.",
			"Cắt xuống từ trên +1.5 = short setup; cắt lên từ dưới −1.5 = long."
		],
		formula: "x ← 0.33·2( (mid−min)/(max−min) − ½ ) + 0.67 x\nF = 0.5 ln((1+x)/(1−x)) + 0.5 F_prev",
		useWhen: "Cycle market, range có nhịp. Ehlers vốn cho futures.",
		failWhen: "Trend kéo Fisher neo một phía — cắt signal sẽ premature.",
		combine: "Hurst < 0.5. Không đối đầu Supertrend.",
		params: [{
			key: "period",
			label: "Cửa sổ",
			min: 5,
			max: 20,
			step: 1,
			default: 10
		}],
		best: "range",
		tags: ["Ehlers", "cycle"]
	},
	{
		slug: "macd",
		name: "MACD",
		nameVi: "Hội tụ phân kỳ trung bình",
		category: "momentum",
		blurb: "EMA12 − EMA26, signal 9, histogram. Momentum cổ điển vẫn sống.",
		summary: "Appel: hiệu hai EMA là momentum, signal là EMA của momentum. Histogram đổi dấu sớm hơn line-cross. Phân kỳ MACD/giá cùng họ với RSI nhưng mượt hơn. Zero-line cross = đổi bias trung hạn.",
		how: [
			"Hist co lại = momentum yếu, chưa phải đảo.",
			"Cross trên zero mạnh hơn cross dưới zero (và ngược lại).",
			"12/26/9 là convention, không thiêng. 8/21/5 nhạy hơn cho H1."
		],
		formula: "MACD = EMA₁₂ − EMA₂₆\nSignal = EMA₉(MACD)\nHist = MACD − Signal",
		useWhen: "Mọi thị trường. Là 'ngôn ngữ chung' của desk.",
		failWhen: "Chop quanh zero. Double-cross trong range.",
		combine: "MACD bias + Supertrend cùng chiều. Không ngược nhau.",
		params: [
			{
				key: "fast",
				label: "Nhanh",
				min: 6,
				max: 16,
				step: 1,
				default: 12
			},
			{
				key: "slow",
				label: "Chậm",
				min: 18,
				max: 40,
				step: 1,
				default: 26
			},
			{
				key: "signal",
				label: "Signal",
				min: 5,
				max: 15,
				step: 1,
				default: 9
			}
		],
		best: "mixed",
		tags: ["Appel", "histogram"]
	},
	{
		slug: "stochastic",
		name: "Stochastic",
		nameVi: "Dao động stochastic",
		category: "momentum",
		blurb: "%K vị trí đóng cửa trong range N nến. Lane: momentum đổi trước giá.",
		summary: "George Lane: trong uptrend, close dồn về high. Stochastic đo điều đó. Fast stoch nhiễu; %K làm mượt 3, %D làm mượt tiếp. Cross trong vùng <20 / >80 mới mang ý mean-reversion; cross giữa 40–60 gần như vô nghĩa.",
		how: [
			"%K = 100 · (C − LL) / (HH − LL).",
			"Full stoch (smooth 3) dùng phổ biến hơn fast.",
			"Failure swing: không tạo %K cao mới khi giá có — divergence kiểu Lane."
		],
		formula: "%K = 100 · (C − min L) / (max H − min L)\n%D = SMA(%K, d)",
		useWhen: "Range. Stock trong kênh, FX session Á.",
		failWhen: "Trend: stoch neo >80 rất lâu. Short đó là tự sát.",
		combine: "Chỉ fade stoch khi giá ở biên Bollinger/Keltner.",
		params: [{
			key: "k",
			label: "%K n",
			min: 5,
			max: 21,
			step: 1,
			default: 14
		}, {
			key: "d",
			label: "%D n",
			min: 2,
			max: 7,
			step: 1,
			default: 3
		}],
		best: "range",
		tags: ["Lane", "%K"]
	},
	{
		slug: "cci",
		name: "CCI",
		nameVi: "Chỉ số kênh hàng hóa",
		category: "momentum",
		blurb: "Lambert: typical price lệch khỏi SMA bao nhiêu MAD. Vượt ±100 = break kênh thống kê.",
		summary: "CCI vốn cho hàng hóa chu kỳ. ±100 là 'trong kênh'. Break ±100 rồi giữ = momentum; chạm ±200 thường quá đà. 0.015 trong công thức để khoảng 70–80% giá trị nằm trong ±100.",
		how: [
			"Typical price = (H+L+C)/3.",
			"MAD (mean abs deviation) bền hơn σ với outlier.",
			"Zero-cross là đổi bias; ±100 là trigger."
		],
		formula: "CCI = (TP − SMA(TP)) / (0.015 · MAD)",
		useWhen: "Breakout hàng hóa, crypto có nhịp. Cũng fade ±200 trong range.",
		failWhen: "Dùng một ngưỡng cho mọi asset — scale CCI thay đổi theo vol.",
		combine: "Donchian cùng lúc CCI cắt +100 = breakout kép.",
		params: [{
			key: "period",
			label: "Chu kỳ",
			min: 10,
			max: 40,
			step: 1,
			default: 20
		}],
		best: "breakout",
		tags: ["Lambert", "channel"]
	},
	{
		slug: "bollinger",
		name: "Bollinger Bands",
		nameVi: "Dải Bollinger",
		category: "volatility",
		blurb: "SMA ± kσ. Bandwidth co = squeeze. %B = vị trí giá trong dải.",
		summary: "John Bollinger: dải phải phồng theo vol, không cố định như envelope %. Squeeze (BW thấp kỷ lục) thường trước nổ. Walk-the-band: giá trượt dọc biên trong trend — fade biên lúc đó sai. Mean-reversion chỉ khi BW không đang nở và Hurst thấp.",
		how: [
			"%B = (C − lower) / (upper − lower). >1 trên dải, <0 dưới dải.",
			"Squeeze: BW percentile thấp + Keltner nằm trong BB (TTM Squeeze).",
			"Đóng cửa ngoài dải rồi trở lại = rejection; đóng ngoài nhiều nến = expansion."
		],
		formula: "Mid = SMA(n)\nUpper = Mid + kσ\nBW = (Upper − Lower) / Mid",
		useWhen: "Mọi thị trường. Squeeze trước event, fade trong range.",
		failWhen: "Fade walk-the-band. k=2 không phải định luật — asset fat-tail phá k=2.",
		combine: "Keltner để nhận squeeze. Supertrend để không fade trend.",
		params: [{
			key: "period",
			label: "SMA n",
			min: 10,
			max: 30,
			step: 1,
			default: 20
		}, {
			key: "k",
			label: "σ",
			min: 1,
			max: 3,
			step: .1,
			default: 2
		}],
		best: "range",
		tags: ["Bollinger", "squeeze"]
	},
	{
		slug: "keltner",
		name: "Keltner Channels",
		nameVi: "Kênh Keltner",
		category: "volatility",
		blurb: "EMA ± m·ATR. Mượt hơn Bollinger, ít 'ngoài dải' giả.",
		summary: "Keltner gốc dùng typical price SMA và ATR (phiên bản hiện đại: EMA + ATR). ATR bền outlier hơn σ, nên kênh ít giật. Breakout Keltner đáng tin hơn touch Bollinger. Cặp BB/KC là TTM Squeeze của John Carter.",
		how: [
			"BB trong KC = vol thấp (squeeze). BB cắt ra khỏi KC = nổ.",
			"Close ngoài KC = momentum; wick ngoài rồi đóng trong = rejection.",
			"Hệ số 1.5 ATR phổ biến hơn 2."
		],
		formula: "Mid = EMA(n)\nUpper = Mid + m · ATR",
		useWhen: "Breakout system. Lọc squeeze.",
		failWhen: "Range: close ngoài KC liên tục hai phía.",
		combine: "BB + KC squeeze. Donchian xác nhận hướng nổ.",
		params: [{
			key: "period",
			label: "EMA/ATR n",
			min: 10,
			max: 30,
			step: 1,
			default: 20
		}, {
			key: "mult",
			label: "Hệ số ATR",
			min: 1,
			max: 3,
			step: .1,
			default: 1.5
		}],
		best: "breakout",
		tags: [
			"Keltner",
			"ATR",
			"squeeze"
		]
	},
	{
		slug: "atr",
		name: "ATR",
		nameVi: "True Range trung bình",
		category: "volatility",
		blurb: "Wilder: kích thước nến thật, gồm gap. Nền tảng position sizing.",
		summary: "True range = max(H−L, |H−C_prev|, |L−C_prev|). ATR là RMA của TR. Không cho chiều. Cho câu trả lời: stop phải cách bao xa, size phải nhỏ thế nào. Overlay Close ± m·ATR là dải trailing thô — Supertrend tinh chỉnh thêm.",
		how: [
			"Stop 1×ATR quá sát, 3×ATR quá xa với nhiều hệ. 1.5–2.5 thực dụng.",
			"Size = risk$ / (m·ATR).",
			"ATR% (ATR/Price) so được giữa asset."
		],
		formula: "TR = max(H−L, |H−C_prev|, |L−C_prev|)\nATR = RMA(TR, n)",
		useWhen: "Mọi hệ thống. Bắt buộc nếu có stop.",
		failWhen: "Dùng ATR như tín hiệu mua/bán.",
		combine: "Gắn mọi entry. Không có ATR thì không có size.",
		params: [{
			key: "period",
			label: "Chu kỳ",
			min: 7,
			max: 28,
			step: 1,
			default: 14
		}, {
			key: "mult",
			label: "Hệ số dải",
			min: 1,
			max: 4,
			step: .1,
			default: 2
		}],
		best: "volatile",
		tags: ["Wilder", "risk"]
	},
	{
		slug: "vwap",
		name: "VWAP",
		nameVi: "Giá trung bình gia quyền khối lượng",
		category: "volume",
		blurb: "Benchmark của desk. Giá trên VWAP = buyer kiểm soát phiên.",
		summary: "VWAP = Σ(typical·volume) / Σ volume, reset theo phiên. Institution dùng để đo execution. Pullback về VWAP trong xu hướng phiên là setup phổ biến nhất của intraday. Anchored VWAP (gắn sự kiện) mạnh hơn rolling trên daily.",
		how: [
			"Meridian reset mỗi N nến để mô phỏng phiên trên dữ liệu giả.",
			"Close xuyên VWAP + volume tăng = đổi kiểm soát.",
			"Không fade VWAP khi slope VWAP đang dốc và giá walk một phía."
		],
		formula: "VWAP = Σ TP·V / Σ V",
		useWhen: "Intraday, stock có volume thật. Index futures.",
		failWhen: "Crypto 24/7 không có 'phiên' tự nhiên — phải neo mốc.",
		combine: "Pivot P cùng phía VWAP. Supertrend daily làm bias, VWAP làm entry.",
		params: [{
			key: "reset",
			label: "Reset mỗi (nến)",
			min: 16,
			max: 80,
			step: 2,
			default: 40
		}],
		best: "mixed",
		tags: ["benchmark", "intraday"]
	},
	{
		slug: "obv",
		name: "On-Balance Volume",
		nameVi: "Khối lượng cân bằng",
		category: "volume",
		blurb: "Granville: cộng volume ngày tăng, trừ ngày giảm. Dòng tiền dẫn giá.",
		summary: "OBV tích lũy volume có dấu. Giá sideway mà OBV lên = accumulation. Phân kỳ OBV/giá cổ điển hơn RSI vì gắn participation. EMA(OBV) làm signal. Yếu điểm: ngày không đổi giá vẫn im, và volume tick crypto rác.",
		how: [
			"Chỉ tin OBV trên thị trường volume trung thực (cổ phiếu niêm yết).",
			"Break giá không break OBV = breakout yếu.",
			"Không dùng magnitude tuyệt đối — chỉ slope và phân kỳ."
		],
		formula: "OBV += sign(ΔC) · V",
		useWhen: "Cổ phiếu, index. Xác nhận breakout.",
		failWhen: "Forex spot (volume tick). Illiquid altcoin.",
		combine: "Donchian break + OBV high mới = breakout có người mua.",
		params: [],
		best: "breakout",
		tags: ["Granville", "accumulation"]
	},
	{
		slug: "heikin-ashi",
		name: "Heikin-Ashi",
		nameVi: "Nến bình quân Nhật",
		category: "trend",
		blurb: "Nến trung bình: lọc nhiễu, chuỗi HA cùng màu = xu hướng sạch.",
		summary: "HA close = (O+H+L+C)/4, open = trung bình open/close HA trước. Wick ngược nhỏ + body dài = trend khỏe. Nến doji HA = mất đà, chưa phải đảo. Không đọc HA như nến thật để đặt stop — giá thật khác HA open.",
		how: [
			"Đổi màu HA sau chuỗi 5–8 nến cùng màu đáng tin hơn 1 nến.",
			"Luôn so với nến thật khi vào lệnh.",
			"HA trên Ichimoku rất sạch — hai lớp làm mượt."
		],
		formula: "HA_c = (O+H+L+C)/4\nHA_o = (HA_o_prev + HA_c_prev)/2",
		useWhen: "Đọc trend, swing. Giảm nhiễu visual.",
		failWhen: "Scalp cần giá thật. Stop trên HA open sẽ trượt.",
		combine: "HA bias + entry trên nến thật tại VWAP/EMA.",
		params: [],
		best: "uptrend",
		tags: ["candles", "smooth"]
	},
	{
		slug: "fibonacci",
		name: "Fibonacci Retracement",
		nameVi: "Hồi Fibonacci",
		category: "reversal",
		blurb: "0.382 / 0.5 / 0.618 trên swing đã chốt. Công cụ đo, không phải định luật.",
		summary: "Fib không dự đoán. Nó chuẩn hóa chỗ trader hay đặt kỳ vọng. 0.618 và 0.5 là vùng pullback phổ biến trong trend còn sống; 0.786 là ranh giới 'trend chết'. Cluster Fib với pivot, VWAP, mây Ichimoku mới có nghĩa. Swing phải lấy từ pivot đã chốt — không vẽ trên ZigZag đang chạy.",
		how: [
			"Uptrend: đo low→high, chờ giá về 0.5–0.618, xác nhận nến.",
			"Extension 1.272 / 1.618 là target, không phải entry.",
			"Nhiều fib đè nhau (confluence) > một mức lẻ."
		],
		formula: "L(r) = high − r·(high − low)   (up swing)",
		useWhen: "Pullback trong trend rõ. Mọi asset.",
		failWhen: "Vẽ lại swing cho vừa story. Overfit bằng mắt.",
		combine: "Cấu trúc HL đúng chỗ 0.618 + RSI thoát oversold.",
		params: [{
			key: "pct",
			label: "Swing %",
			min: 2,
			max: 10,
			step: .5,
			default: 5
		}],
		best: "reversal",
		tags: ["confluence", "retrace"]
	},
	{
		slug: "hurst",
		name: "Hurst Exponent",
		nameVi: "Số mũ Hurst",
		category: "trend",
		blurb: "H > 0.5 persist (trend). H < 0.5 antipersist (mean-revert). H ≈ 0.5 random.",
		summary: "Mandelbrot/Hurst: R/S analysis đo memory của chuỗi. Đây là regime detector, không phải entry. Trader hay dùng Bollinger cho mọi lúc — Hurst nói khi nào BB có edge (H<0.45) và khi nào Supertrend có edge (H>0.55). Ước lượng trên cửa sổ ngắn nhiễu; 64–128 nến tối thiểu.",
		how: [
			"H trượt theo thời gian — không phải hằng số của asset.",
			"Đừng trade khi H quanh 0.5: không hệ nào có edge rõ.",
			"Kết quả phụ thuộc log-return, không phải giá thô."
		],
		formula: "H ≈ log(R/S) / log(n)\nR = max(cumdev) − min(cumdev), S = σ",
		useWhen: "Chọn hệ thống. Dashboard regime.",
		failWhen: "Dùng H làm tín hiệu mua/bán. Cửa sổ quá ngắn.",
		combine: "H > 0.55 → Supertrend/Donchian. H < 0.45 → BB/Kalman/Fisher.",
		params: [{
			key: "period",
			label: "Cửa sổ",
			min: 32,
			max: 128,
			step: 8,
			default: 64
		}],
		best: "mixed",
		tags: ["regime", "R/S"]
	}
], ...FAMOUS_ALGORITHMS];
function getAlgorithm(slug) {
	return ALGORITHMS.find((a) => a.slug === slug);
}
function defaultParams(algo) {
	const o = {};
	for (const p of algo.params) o[p.key] = p.default;
	return o;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CGYLWMI0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-surface-2 text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 rounded-md px-4",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-md px-6",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-primary",
				children: "404"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg",
				children: "Không tìm thấy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Mục này không có trong thư viện. Quay lại danh sách thuật toán."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Về trang chủ"
				})
			})
		]
	});
}
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-fg",
				children: "Meridian"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-sm text-muted",
				children: "Thư viện thuật toán giao dịch — xu hướng, đường cong, điểm đảo chiều. Nội dung mang tính giáo dục, không phải lời khuyên đầu tư."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-6 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/algorithms",
						className: "hover:text-fg",
						children: "Thư viện"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/strategies",
						className: "hover:text-fg",
						children: "Chiến thuật"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/lab",
						className: "hover:text-fg",
						children: "Lab"
					})
				]
			})]
		})
	});
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("text-fg", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				fill: "#090a0c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "16",
				y1: "5",
				x2: "16",
				y2: "27",
				stroke: "currentColor",
				strokeWidth: "3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "8",
				fill: "none",
				stroke: "#a8b8c8",
				strokeWidth: "2.25"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "2.25",
				fill: "#6a9e7c"
			})
		]
	});
}
function Wordmark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-7 rounded-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-xl tracking-tight text-fg",
			children: "Meridian"
		})]
	});
}
var NAV = [
	{
		to: "/algorithms",
		label: "Thư viện"
	},
	{
		to: "/strategies",
		label: "Chiến thuật"
	},
	{
		to: "/lab",
		label: "Phòng thí nghiệm"
	}
];
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "shrink-0",
					onClick: () => setOpen(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: [NAV.map((item) => {
						const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: cn("rounded-md px-3 py-2 text-sm transition-colors duration-150", active ? "text-fg" : "text-muted hover:text-fg"),
							children: item.label
						}, item.to);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						className: "ml-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/lab",
							children: "Chạy thuật toán"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "relative flex size-11 items-center justify-center rounded-md md:hidden",
					"aria-label": open ? "Đóng menu" : "Mở menu",
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border px-4 py-3 md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-col gap-1",
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					onClick: () => setOpen(false),
					className: "flex h-11 items-center rounded-md px-3 text-sm text-fg hover:bg-surface-2",
					children: item.label
				}, item.to))
			})
		}) : null]
	});
}
var styles_default = "/assets/styles-hIKdSeRF.css";
var APP_NAME = "Meridian";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Meridian — thư viện thuật toán giao dịch: xác định xu hướng, đường cong, điểm đảo chiều. Chạy Supertrend, Ichimoku, Kalman và hơn 20 thuật toán trên nến giả lập."
			},
			{
				name: "theme-color",
				content: "#090a0c"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
			}
		]
	}),
	component: RootLayout
});
function RootLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "vi",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-svh bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-svh flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-D0ZaTk7x.mjs");
var Route$5 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./lab-AvixLNB1.mjs");
var Route$4 = createFileRoute("/lab")({
	validateSearch: (raw) => ({ algo: typeof raw.algo === "string" ? raw.algo : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./algorithms-DNb9JddQ.mjs");
var Route$3 = createFileRoute("/algorithms/")({
	validateSearch: (raw) => ({
		cat: CATEGORIES.some((c) => c.id === raw.cat) ? raw.cat : void 0,
		q: typeof raw.q === "string" ? raw.q : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("../_slug-Ak6XyDpX.mjs");
var Route$2 = createFileRoute("/algorithms/$slug")({
	loader: ({ params }) => {
		const algo = getAlgorithm(params.slug);
		if (!algo) throw notFound();
		return { algo };
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./strategies-P-HjFX9a.mjs");
var Route$1 = createFileRoute("/strategies/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_slug-BJWCcb0r.mjs");
var Route = createFileRoute("/strategies/$slug")({
	loader: ({ params }) => {
		const strategy = getStrategy(params.slug);
		if (!strategy) throw notFound();
		return { strategy };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var LabRoute = Route$4.update({
	id: "/lab",
	path: "/lab",
	getParentRoute: () => Route$6
});
var AlgorithmsIndexRoute = Route$3.update({
	id: "/algorithms/",
	path: "/algorithms/",
	getParentRoute: () => Route$6
});
var AlgorithmsSlugRoute = Route$2.update({
	id: "/algorithms/$slug",
	path: "/algorithms/$slug",
	getParentRoute: () => Route$6
});
var StrategiesIndexRoute = Route$1.update({
	id: "/strategies/",
	path: "/strategies/",
	getParentRoute: () => Route$6
});
var rootRouteChildren = {
	IndexRoute,
	LabRoute,
	AlgorithmsSlugRoute,
	StrategiesSlugRoute: Route.update({
		id: "/strategies/$slug",
		path: "/strategies/$slug",
		getParentRoute: () => Route$6
	}),
	AlgorithmsIndexRoute,
	StrategiesIndexRoute
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFound
	});
}
//#endregion
export { Route$4 as a, CATEGORIES as c, getAlgorithm as d, Route$3 as i, cn as l, Route as n, Button as o, Route$2 as r, ALGORITHMS as s, router_exports as t, defaultParams as u };
