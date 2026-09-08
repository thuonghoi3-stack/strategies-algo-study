//#region node_modules/.nitro/vite/services/ssr/assets/famous-Bkd_yJxz.js
var FAMOUS_ALGORITHMS = [
	{
		slug: "weinstein-s2",
		name: "Weinstein Stage 2",
		nameVi: "Pha 2 Weinstein",
		category: "system",
		blurb: "Stan Weinstein: chỉ mua khi giá trên SMA 30 tuần đang dốc lên — Stage 2 advancing.",
		summary: "Secrets for Profiting in Bull and Bear Markets. Bốn pha: 1 basing, 2 advancing, 3 topping, 4 declining. Edge nằm ở Stage 2 — giá trên MA dốc lên, volume xác nhận. Thoát khi mất Stage 2 (vào 3 hoặc 4). Không phải indicator; là bản đồ chu kỳ.",
		how: [
			"SMA 30 tuần (ở đây SMA n, mặc định 30 trên chuỗi giả lập).",
			"Stage 2: close > SMA, SMA dốc lên. Stage 4: close < SMA dốc xuống.",
			"Vào khi vừa chuyển sang Stage 2. Không mua Stage 3 dù giá còn cao."
		],
		formula: "Stage 2 ⇔ C > SMA(n) ∧ SMA_t > SMA_{t−k}\nThoát: mất Stage 2",
		useWhen: "Cổ phiếu, ETF, weekly/daily. Xu hướng lớn.",
		failWhen: "Whipsaw quanh MA phẳng. Penny volume giả.",
		combine: "Donchian 55 cùng chiều Stage 2. ADX xác nhận.",
		params: [{
			key: "ma",
			label: "SMA n",
			min: 15,
			max: 80,
			step: 1,
			default: 30
		}, {
			key: "slope",
			label: "Slope lookback",
			min: 3,
			max: 15,
			step: 1,
			default: 5
		}],
		best: "uptrend",
		tags: [
			"Weinstein",
			"stage",
			"weekly"
		]
	},
	{
		slug: "tp-mr",
		name: "TP + MR",
		nameVi: "Trend pullback + mean reversion",
		category: "system",
		blurb: "Hai chế độ một chart: kéo về EMA trong trend, fade BB+RSI khi ribbon thắt.",
		summary: "Tổ hợp desk phổ biến. Khi EMA nhanh trên EMA chậm — mua pullback reclaim EMA (trend pullback). Khi hai EMA sát nhau — thị trường không persist, fade dải Bollinger với RSI cực. Sai regime là chết: fade BB trong Stage 2, hoặc đuổi EMA trong range.",
		how: [
			"Đọc khoảng cách EMA trước. Xòe = TP. Thắt = MR.",
			"TP: nến đóng cửa cắt lại EMA nhanh, RSI không quá mua.",
			"MR: chạm dải + RSI < 30 / > 70. Target đường giữa."
		],
		formula: "TP: EMA_f > EMA_s ∧ C cắt lên EMA_f\nMR: |EMA_f − EMA_s|/C < ε ∧ C < BB_lower ∧ RSI < 30",
		useWhen: "Mọi khung nếu bạn chịu chuyển mode.",
		failWhen: "Cố một mode cho mọi lúc.",
		combine: "Hurst/ADX làm trọng tài regime.",
		params: [
			{
				key: "fast",
				label: "EMA nhanh",
				min: 8,
				max: 21,
				step: 1,
				default: 21
			},
			{
				key: "slow",
				label: "EMA chậm",
				min: 34,
				max: 89,
				step: 1,
				default: 55
			},
			{
				key: "bb",
				label: "BB n",
				min: 14,
				max: 30,
				step: 1,
				default: 20
			},
			{
				key: "rsi",
				label: "RSI n",
				min: 7,
				max: 21,
				step: 1,
				default: 14
			}
		],
		best: "mixed",
		tags: [
			"hybrid",
			"pullback",
			"fade"
		]
	},
	{
		slug: "macd-strategy",
		name: "MACD Strategy",
		nameVi: "Hệ MACD cổ điển",
		category: "system",
		blurb: "Cross MACD/signal chỉ nhận khi histogram cùng dấu — lọc double-cross range.",
		summary: "Appel dùng như hệ: vào khi MACD cắt signal và hist đã dương (long). Zero-line cross là đổi bias, không phải entry. Thoát khi cross ngược hoặc hist co 2 nến. 12/26/9 là convention; H1 hay dùng 8/21/5.",
		how: [
			"Không vào cross dưới zero nếu bias daily giảm.",
			"Hist đổi dấu sớm hơn line — cảnh báo, chưa phải lệnh.",
			"Kết hợp Supertrend cùng chiều."
		],
		formula: "Long: MACD × Signal lên ∧ Hist > 0",
		useWhen: "Trend có nhịp. Swing.",
		failWhen: "Chop quanh zero.",
		combine: "EMA 55 bias. ADX > 18.",
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
		tags: ["Appel", "cross"]
	},
	{
		slug: "rsi-strategy",
		name: "RSI Strategy",
		nameVi: "Hệ RSI 30/70",
		category: "system",
		blurb: "Không mua vì RSI < 30. Mua khi RSI thoát oversold. Ngược lại với 70.",
		summary: "Wilder gốc. Trong range, thoát 30/70 có edge. Trong trend, RSI neo 70 rất lâu — short đó là tự sát. Hệ này chỉ tín hiệu khi RSI cắt ra khỏi vùng cực, không khi mới vào.",
		how: [
			"OS/OB là tham số. 20/80 chặt hơn cho trend.",
			"Thoát về 50 thường là target mean-reversion.",
			"Lọc ADX < 20 nếu chỉ muốn fade."
		],
		formula: "Long: RSI_{t−1} < OS ∧ RSI_t ≥ OS",
		useWhen: "Range, mean-revert.",
		failWhen: "Trend mạnh, RSI neo.",
		combine: "BB cùng cực. Supertrend cấm ngược.",
		params: [
			{
				key: "period",
				label: "RSI n",
				min: 5,
				max: 21,
				step: 1,
				default: 14
			},
			{
				key: "ob",
				label: "Overbought",
				min: 60,
				max: 85,
				step: 1,
				default: 70
			},
			{
				key: "os",
				label: "Oversold",
				min: 15,
				max: 40,
				step: 1,
				default: 30
			}
		],
		best: "range",
		tags: ["Wilder", "30/70"]
	},
	{
		slug: "bb-strategy",
		name: "Bollinger Strategy",
		nameVi: "Hệ Bollinger fade",
		category: "system",
		blurb: "Fade dải 2σ khi RSI cùng cực. Không fade walk-the-band.",
		summary: "John Bollinger không bảo fade mọi touch. Hệ này thêm RSI: chỉ fade khi dải và momentum cùng nói 'đi quá'. Squeeze không phải setup của hệ này — xem TTM Squeeze.",
		how: [
			"Chạm dải + RSI < 35 / > 65.",
			"Target mid. Stop ngoài swing.",
			"Bandwidth đang nở = đừng fade."
		],
		formula: "Long: C < Lower ∧ RSI < 35",
		useWhen: "Range, Hurst thấp.",
		failWhen: "Expansion / trend walk.",
		combine: "Keltner để nhận squeeze (không fade).",
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
			min: 1.5,
			max: 3,
			step: .1,
			default: 2
		}],
		best: "range",
		tags: ["Bollinger", "fade"]
	},
	{
		slug: "stoch-strategy",
		name: "Stochastic Strategy",
		nameVi: "Hệ Stochastic 20/80",
		category: "system",
		blurb: "Lane: %K cắt %D trong vùng cực. Cross giữa 40–60 bỏ qua.",
		summary: "Full stochastic. Chỉ nhận cross dưới 25 (long) hoặc trên 75 (short). Failure swing — %K không làm cực mới khi giá có — là bản nâng cao, hệ này lấy cross thuần.",
		how: [
			"Không short %K neo 80 trong uptrend.",
			"Nến xác nhận > tin hiệu oscillator.",
			"Dùng với BB hoặc Keltner biên."
		],
		formula: "Long: %K × %D lên ∧ %K < 25",
		useWhen: "Range, session Á FX.",
		failWhen: "Trend neo cực.",
		combine: "Giá ở biên BB.",
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
		tags: ["Lane", "cross"]
	},
	{
		slug: "ema-cross",
		name: "EMA Cross",
		nameVi: "Cắt EMA 12/26",
		category: "system",
		blurb: "Hệ crossover cổ điển. Xương sống của nhiều EA — và nguồn whipsaw lớn nhất.",
		summary: "12/26 là MACD không histogram. Sống ở trend, chết ở range. Đừng thêm filter rồi gọi là 'cải tiến' nếu bạn không đo. Ribbon 8/21/55 ít nhiễu hơn cặp hai đường.",
		how: [
			"Long khi EMA nhanh cắt lên chậm.",
			"Không vào khi hai EMA quấn trong 5 nến.",
			"Trail bằng EMA chậm hoặc ATR."
		],
		formula: "Long: EMA_f × EMA_s lên",
		useWhen: "Trend bền, daily.",
		failWhen: "Sideway. Phí ăn hết.",
		combine: "ADX > 20. Hurst > 0.55.",
		params: [{
			key: "fast",
			label: "Nhanh",
			min: 5,
			max: 20,
			step: 1,
			default: 12
		}, {
			key: "slow",
			label: "Chậm",
			min: 18,
			max: 50,
			step: 1,
			default: 26
		}],
		best: "uptrend",
		tags: ["crossover", "EMA"]
	},
	{
		slug: "donchian-turtle",
		name: "Donchian Turtle Breakout",
		nameVi: "Nổ kênh Donchian kiểu Rùa",
		category: "system",
		blurb: "Richard Donchian: mua đỉnh N ngày, bán đáy N ngày. Xương sống Turtle trước khi có S1/S2.",
		summary: "Rule 4-week (sau này 20 ngày). Đóng cửa làm high N → long; làm low N → short. Không đoán, không filter. Turtle S1 thêm cửa sổ thoát ngắn hơn entry; S2 kéo N lên 55. Hệ này là bản kênh thuần — entry = exit = N.",
		how: [
			"Break high N: long. Break low N: short (đảo).",
			"Không skip. Không chờ pullback.",
			"Size ATR là phần Turtle thêm vào, không phải Donchian gốc."
		],
		formula: "Long: C > max(H_{1..N})\nShort: C < min(L_{1..N})",
		useWhen: "Futures, hàng hóa, crypto có đuôi.",
		failWhen: "Range. Phí round-turn.",
		combine: "S1 20/10, S2 55/20, EMA200 filter.",
		params: [{
			key: "entry",
			label: "Entry n",
			min: 10,
			max: 55,
			step: 1,
			default: 20
		}, {
			key: "exit",
			label: "Exit n",
			min: 5,
			max: 40,
			step: 1,
			default: 20
		}],
		best: "breakout",
		tags: [
			"Donchian",
			"Turtle",
			"breakout"
		]
	},
	{
		slug: "ema-scalper",
		name: "EMA 9/21 Scalper",
		nameVi: "Scalp EMA 9/21",
		category: "system",
		blurb: "Cặp nhanh cho H1/M15. Cùng logic EMA Cross, horizon ngắn hơn.",
		summary: "9/21 phổ biến hơn 12/26 trên khung nhỏ. Pullback vào EMA 9 trong khi 9 còn trên 21 thường tốt hơn đuổi cross. Time-stop 8–12 nến.",
		how: [
			"Bias: 9 > 21. Entry: reclaim 9.",
			"Không scalp ngược 21.",
			"Phí và spread phải nhỏ hơn 0.3×ATR."
		],
		formula: "Long: EMA9 × EMA21 lên (hoặc reclaim 9 khi 9>21)",
		useWhen: "Intraday thanh khoản.",
		failWhen: "Lunch, tin, spread nở.",
		combine: "VWAP cùng phía. Volume.",
		params: [{
			key: "fast",
			label: "Nhanh",
			min: 5,
			max: 13,
			step: 1,
			default: 9
		}, {
			key: "slow",
			label: "Chậm",
			min: 15,
			max: 34,
			step: 1,
			default: 21
		}],
		best: "uptrend",
		tags: ["scalp", "9/21"]
	},
	{
		slug: "turtle-s1",
		name: "Turtle S1 (20/10)",
		nameVi: "Rùa hệ 1",
		category: "system",
		blurb: "Dennis/Eckhardt: vào breakout Donchian 20, thoát Donchian 10. Size theo ATR.",
		summary: "Original Turtle System 1. Vào khi giá làm đỉnh/đáy 20 ngày, thoát khi ngược 10 ngày. Thua nhiều, thắng lớn. Không skip breakout vì 'trông đắt'. Position size = 1% / ATR — phần bị bỏ quên nhiều nhất.",
		how: [
			"Entry 20, exit 10. Không đảo ngay trên exit.",
			"Skip rule gốc: bỏ S1 nếu S2 vừa thắng — bản này không skip, để bạn thấy đủ tín hiệu.",
			"Đơn vị N = ATR(20)."
		],
		formula: "Long: C > max(H_{1..20})\nExit: C < min(L_{1..10})",
		useWhen: "Futures, crypto, hàng hóa — fat tail.",
		failWhen: "Range dài, chi phí round-turn cao.",
		combine: "S2 (55/20) chạy song song. ADX filter hiện đại.",
		params: [{
			key: "entry",
			label: "Entry n",
			min: 10,
			max: 40,
			step: 1,
			default: 20
		}, {
			key: "exit",
			label: "Exit n",
			min: 5,
			max: 20,
			step: 1,
			default: 10
		}],
		best: "breakout",
		tags: [
			"Turtle",
			"Donchian",
			"S1"
		]
	},
	{
		slug: "turtle-s2",
		name: "Turtle S2 (55/20)",
		nameVi: "Rùa hệ 2",
		category: "system",
		blurb: "Breakout 55 ngày, thoát 20. Ít lệnh hơn S1, R:R lớn hơn, trễ hơn.",
		summary: "System 2 bắt sóng mà S1 bỏ vì skip-rule, và bắt trend chậm hơn nhưng sạch hơn. 55 ngày là 'đỉnh không ai còn nhớ' — đúng nghĩa breakout.",
		how: [
			"Cùng triết lý S1, cửa sổ dài.",
			"Kết hợp EMA 200 để khỏi short bull market.",
			"Pyramiding gốc: thêm đơn vị mỗi ½N."
		],
		formula: "Long: C > max(H_{1..55})\nExit: C < min(L_{1..20})",
		useWhen: "Trend tháng-quý.",
		failWhen: "Thị trường mean-revert 2020s equity dài.",
		combine: "Donchian 55 + EMA200 (mục kế tiếp).",
		params: [{
			key: "entry",
			label: "Entry n",
			min: 40,
			max: 80,
			step: 1,
			default: 55
		}, {
			key: "exit",
			label: "Exit n",
			min: 10,
			max: 30,
			step: 1,
			default: 20
		}],
		best: "breakout",
		tags: ["Turtle", "S2"]
	},
	{
		slug: "donchian-ema200",
		name: "Donchian 55 + EMA200",
		nameVi: "Rùa lọc MA200",
		category: "system",
		blurb: "Chỉ nhận breakout 55 cùng phía EMA 200. Turtle hiện đại, ít short bull.",
		summary: "S2 thuần short cả uptrend. Thêm EMA 200 (ở đây n chỉnh được vì chuỗi giả lập ngắn) — long chỉ khi giá trên MA, short chỉ khi dưới. Giảm whipsaw hai phía, bỏ sóng ngược MA.",
		how: [
			"Break Donchian 55.",
			"Cùng phía EMA n.",
			"Thoát Donchian 20 hoặc mất MA."
		],
		formula: "Long: C > DonH_55 ∧ C > EMA_n",
		useWhen: "Index, cổ phiếu có drift dương.",
		failWhen: "MA200 bị giá xé trong crash rồi hồi.",
		combine: "Weinstein Stage 2. ATR size.",
		params: [{
			key: "don",
			label: "Donchian",
			min: 20,
			max: 80,
			step: 1,
			default: 55
		}, {
			key: "ma",
			label: "EMA n",
			min: 40,
			max: 200,
			step: 5,
			default: 80
		}],
		best: "uptrend",
		tags: ["Turtle", "filter"]
	},
	{
		slug: "keltner-break",
		name: "Keltner Breakout",
		nameVi: "Nổ kênh Keltner",
		category: "system",
		blurb: "Đóng cửa ngoài EMA ± m·ATR. Breakout mượt hơn Donchian, ít wick giả.",
		summary: "Keltner dùng ATR nên kênh không giật theo outlier như σ Bollinger. Close ngoài kênh = momentum. Wick ngoài rồi đóng trong = rejection, không phải break.",
		how: [
			"Close > upper → long. Close < lower → short.",
			"Lọc squeeze (BB trong KC) trước khi nổ thì sạch hơn — TTM.",
			"Trail EMA giữa kênh."
		],
		formula: "Long: C > EMA + m·ATR",
		useWhen: "Breakout, vol nở.",
		failWhen: "Range: close ngoài hai phía.",
		combine: "TTM Squeeze. Donchian xác nhận.",
		params: [{
			key: "period",
			label: "EMA/ATR n",
			min: 10,
			max: 30,
			step: 1,
			default: 20
		}, {
			key: "mult",
			label: "Hệ số",
			min: 1,
			max: 3,
			step: .1,
			default: 1.5
		}],
		best: "breakout",
		tags: ["Keltner", "ATR"]
	},
	{
		slug: "connors-rsi2",
		name: "Connors RSI-2",
		nameVi: "RSI(2) của Connors",
		category: "system",
		blurb: "Larry Connors: trên SMA200, RSI(2) < 5–10 thì mua dip. Thoát SMA5.",
		summary: "Short Term Trading Strategies That Work. Mean-reversion trong uptrend: chỉ long khi C > SMA200 và RSI(2) cực thấp. Càng thấp càng tốt (<5 hơn <10). Exit khi giá cắt lên SMA5 hoặc RSI(2) > 70. Không phải RSI 14.",
		how: [
			"Filter SMA n (200 trên daily; chuỗi lab dùng 50–80).",
			"Entry RSI(2) cắt xuống dưới ngưỡng.",
			"Exit SMA 5. Không gồng lỗ ngược MA."
		],
		formula: "Long: C > SMA_n ∧ RSI(2) < θ\nExit: C > SMA_5",
		useWhen: "Cổ phiếu, index trên MA200.",
		failWhen: "Crash: RSI(2) < 5 rồi còn 5 nữa. Stop bắt buộc.",
		combine: "Cumulative RSI chặt hơn. BB fade cùng cực.",
		params: [
			{
				key: "rsi",
				label: "RSI n",
				min: 2,
				max: 5,
				step: 1,
				default: 2
			},
			{
				key: "ma",
				label: "SMA filter",
				min: 30,
				max: 120,
				step: 5,
				default: 50
			},
			{
				key: "th",
				label: "Ngưỡng RSI",
				min: 2,
				max: 15,
				step: 1,
				default: 10
			}
		],
		best: "uptrend",
		tags: ["Connors", "RSI-2"]
	},
	{
		slug: "connors-crsi",
		name: "Connors Cumulative RSI",
		nameVi: "RSI cộng dồn",
		category: "system",
		blurb: "Tổng RSI(2) hai (hoặc ba) ngày. Cần bán liên tiếp, không phải một nến sợ.",
		summary: "Connors: một ngày RSI(2)<10 có thể là nhiễu. Tổng 2 ngày < 10–20 = bán kéo dài, mean-reversion đáng tin hơn. Cùng filter SMA. Exit RSI(2) cắt 70.",
		how: [
			"CRSI = RSI(2)_t + RSI(2)_{t−1} (+ …).",
			"Long khi CRSI cắt dưới ngưỡng và C > SMA.",
			"Ngưỡng 10 rất hiếm, 20 thực dụng hơn."
		],
		formula: "CRSI_k = Σ_{i=0}^{k−1} RSI(2)_{t−i}\nLong: C > SMA ∧ CRSI < θ",
		useWhen: "Swing 2–5 ngày, large-cap.",
		failWhen: "Thị trường gãy MA200.",
		combine: "RSI-2 đơn làm cảnh báo sớm.",
		params: [
			{
				key: "rsi",
				label: "RSI n",
				min: 2,
				max: 5,
				step: 1,
				default: 2
			},
			{
				key: "sum",
				label: "Số ngày cộng",
				min: 2,
				max: 4,
				step: 1,
				default: 2
			},
			{
				key: "ma",
				label: "SMA filter",
				min: 30,
				max: 120,
				step: 5,
				default: 50
			},
			{
				key: "th",
				label: "Ngưỡng CRSI",
				min: 8,
				max: 40,
				step: 1,
				default: 20
			}
		],
		best: "uptrend",
		tags: ["Connors", "CRSI"]
	},
	{
		slug: "ttm-squeeze",
		name: "TTM Squeeze",
		nameVi: "Nén TTM",
		category: "system",
		blurb: "John Carter: BB nằm trong Keltner = squeeze. Fire khi BB thoát, hướng theo mom.",
		summary: "Volatility compression. BB(20,2) trong KC(20,1.5) = dots đỏ (squeeze on). Khi BB cắt ra, dots xanh, histogram momentum cho chiều. Không đoán squeeze sẽ nổ lên hay xuống — chờ fire.",
		how: [
			"Squeeze ON khi BB ⊂ KC.",
			"Fire: squeeze tắt. Long nếu mom ≥ 0.",
			"Không vào giữa squeeze. Không fade fire."
		],
		formula: "Squeeze ⇔ BB_upper < KC_upper ∧ BB_lower > KC_lower\nFire: Squeeze_{t−1} ∧ ¬Squeeze_t",
		useWhen: "Trước event, daily/H4.",
		failWhen: "Squeeze giả, mom đổi dấu ngay.",
		combine: "Donchian cùng chiều. Supertrend trail.",
		params: [
			{
				key: "period",
				label: "Chu kỳ",
				min: 12,
				max: 30,
				step: 1,
				default: 20
			},
			{
				key: "bbk",
				label: "BB σ",
				min: 1.5,
				max: 2.5,
				step: .1,
				default: 2
			},
			{
				key: "kcm",
				label: "KC m",
				min: 1,
				max: 2,
				step: .1,
				default: 1.5
			}
		],
		best: "breakout",
		tags: ["Carter", "squeeze"]
	},
	{
		slug: "vwap-zscore",
		name: "VWAP Z-Score Fade",
		nameVi: "Fade Z-score VWAP",
		category: "system",
		blurb: "z = (typical − VWAP) / σ. Fade khi |z| > 2, về 0. Intraday stat-arb.",
		summary: "Desk quant đơn giản. Giá không đi quá xa VWAP phiên nếu không có tin. Z-score chuẩn hóa khoảng cách theo vol trong phiên. Fade z > 2, cover về 0–1. Không fade nếu VWAP đang dốc đứng (trend phiên).",
		how: [
			"Reset VWAP theo cửa sổ phiên giả lập.",
			"σ rolling của (TP − VWAP).",
			"Long z cắt xuống −2, short cắt lên +2."
		],
		formula: "z = (TP − VWAP) / σ_win\nFade: |z| > θ",
		useWhen: "Intraday, stock có volume.",
		failWhen: "Trend ngày, gap tin.",
		combine: "Hurst thấp. Không ngược Supertrend daily.",
		params: [
			{
				key: "reset",
				label: "Reset phiên",
				min: 16,
				max: 80,
				step: 2,
				default: 40
			},
			{
				key: "win",
				label: "σ window",
				min: 8,
				max: 30,
				step: 1,
				default: 16
			},
			{
				key: "z",
				label: "|Z| ngưỡng",
				min: 1.2,
				max: 3,
				step: .1,
				default: 2
			}
		],
		best: "range",
		tags: ["VWAP", "z-score"]
	},
	{
		slug: "vwap-reclaim",
		name: "VWAP Reclaim",
		nameVi: "Giành lại VWAP",
		category: "system",
		blurb: "Dip dưới VWAP rồi đóng cửa trở lại — buyer lấy lại phiên. Ngược lại là reject.",
		summary: "Intraday continuation. Không fade VWAP, không break lần đầu. Chờ giá xuyên rồi reclaim: nến đóng lại trên VWAP sau khi đã dip. Đó là 'failed breakdown' của phiên.",
		how: [
			"Cần có nến đóng dưới VWAP, rồi nến sau đóng trên.",
			"Volume reclaim > volume dip thì mạnh.",
			"Stop dưới đáy dip."
		],
		formula: "Long: C_{t−1} < VWAP_{t−1} ∧ C_t > VWAP_t\n(sau khi đã ở trên trước đó)",
		useWhen: "Phiên có drift. Index futures.",
		failWhen: "VWAP bị xé cả ngày.",
		combine: "EMA 9 cùng phía. Opening range.",
		params: [{
			key: "reset",
			label: "Reset",
			min: 16,
			max: 80,
			step: 2,
			default: 40
		}],
		best: "mixed",
		tags: ["VWAP", "reclaim"]
	},
	{
		slug: "stoch-rsi",
		name: "Stochastic RSI",
		nameVi: "Stoch của RSI",
		category: "system",
		blurb: "Chande/Kroll: stochastic đo trên RSI, không trên giá. Nhạy gấp đôi, nhiễu gấp đôi.",
		summary: "StochRSI = Stoch(RSI(n)). Về 0/100 thường xuyên hơn RSI. Dùng như trigger trong trend (thoát 20 trong uptrend), không phải hệ độc lập. Cross %K/%D ở cực.",
		how: [
			"Long: %K cắt %D lên khi < 25.",
			"Lọc giá vs EMA 21.",
			"Không gồng vì 'RSI còn thấp' — StochRSI đã cực rồi."
		],
		formula: "StochRSI = (RSI − min RSI) / (max RSI − min RSI)",
		useWhen: "Timing entry trong bias có sẵn.",
		failWhen: "Dùng một mình trên M1.",
		combine: "Supertrend / EMA bias.",
		params: [
			{
				key: "rsi",
				label: "RSI n",
				min: 7,
				max: 21,
				step: 1,
				default: 14
			},
			{
				key: "k",
				label: "Stoch n",
				min: 8,
				max: 21,
				step: 1,
				default: 14
			},
			{
				key: "d",
				label: "%D",
				min: 2,
				max: 5,
				step: 1,
				default: 3
			}
		],
		best: "range",
		tags: ["Chande", "StochRSI"]
	},
	{
		slug: "orb",
		name: "Opening Range Breakout",
		nameVi: "Nổ range mở cửa",
		category: "system",
		blurb: "Crabel/Fisher: range N nến đầu phiên. Break high/low là hướng ngày.",
		summary: "Opening Range Breakout. 30–60 phút đầu (ở đây N nến đầu mỗi 'phiên' giả lập) tạo high/low. Break rồi hold. Failed break (xuyên rồi đóng lại trong) là fade. ATR của range nói ngày có 'đi'.",
		how: [
			"Không trade trong range. Chờ break.",
			"Stop phía kia range.",
			"Ngày range hẹp + vol cao = edge lớn hơn."
		],
		formula: "OR = [min L, max H] của nến 1..N\nLong: C > OR_high",
		useWhen: "Futures, index, cổ phiếu mở phiên.",
		failWhen: "Gap tin, OR quá rộng (không R:R).",
		combine: "VWAP cùng chiều break. Supertrend daily.",
		params: [{
			key: "session",
			label: "Độ dài phiên",
			min: 20,
			max: 80,
			step: 5,
			default: 40
		}, {
			key: "orb",
			label: "Nến OR",
			min: 3,
			max: 12,
			step: 1,
			default: 5
		}],
		best: "breakout",
		tags: ["Crabel", "ORB"]
	},
	{
		slug: "rsi7-mom",
		name: "RSI-7 Momentum",
		nameVi: "RSI 7 theo đà",
		category: "system",
		blurb: "RSI ngắn cắt 50 theo chiều — momentum, không phải fade 30/70.",
		summary: "RSI-7 nhạy. Dùng như impulse: cắt lên 50 = buyer kiểm soát ngắn hạn. Ngược với RSI Strategy (fade cực). Time-stop ngắn. Phù hợp burst, không phải swing tuần.",
		how: [
			"Long: RSI-7 cắt lên 50, trên EMA của RSI.",
			"Không chờ 70. 70 là lúc thoát burst.",
			"Bias EMA 21."
		],
		formula: "Long: RSI7 × 50 lên",
		useWhen: "M15–H1, vol nở.",
		failWhen: "Range: cắt 50 liên tục.",
		combine: "MACD hist cùng dấu. EMA 9/21.",
		params: [{
			key: "period",
			label: "RSI n",
			min: 5,
			max: 10,
			step: 1,
			default: 7
		}],
		best: "uptrend",
		tags: ["momentum", "RSI-7"]
	},
	{
		slug: "tsm",
		name: "Time-Series Momentum",
		nameVi: "Động lượng chuỗi thời gian",
		category: "system",
		blurb: "Moskowitz / Asness / Pedersen: sign(return lookback). Long nếu 12 tháng dương.",
		summary: "TSMOM khác cross-sectional momentum (xếp hạng asset). Chỉ hỏi: asset này tự nó đang lên hay xuống? Sign của total return N nến. Trend-following academically cleanest. Horizon gốc 1–12 tháng; lab dùng cửa sổ ngắn hơn.",
		how: [
			"Bias = sign(C_t / C_{t−L} − 1).",
			"Đổi vị thế khi dấu đổi.",
			"Size inverse-vol (ATR) là bản paper."
		],
		formula: "pos = sign(R_{t−L→t})",
		useWhen: "Futures đa thị trường, monthly/weekly.",
		failWhen: "Reversal chữ V, 2020-type.",
		combine: "Hurst. Turtle S2 cùng chiều.",
		params: [{
			key: "lb",
			label: "Lookback",
			min: 20,
			max: 120,
			step: 5,
			default: 60
		}],
		best: "uptrend",
		tags: ["AQR", "TSMOM"]
	},
	{
		slug: "week52-high",
		name: "52-Week High",
		nameVi: "Đỉnh 52 tuần",
		category: "system",
		blurb: "George/Hwang: cổ phiếu làm high 52 tuần có drift tiếp. Breakout tâm lý.",
		summary: "The 52-Week High and Momentum Investing. Trader neo neo đỉnh năm — break đỉnh đó là sự kiện. Hệ: long khi close > max(high, N), N≈252 daily (lab: 80–160). Không phải bắt đáy.",
		how: [
			"Chỉ long high mới, short low mới.",
			"Volume xác nhận.",
			"Thoát nếu đóng cửa trở lại dưới đỉnh cũ."
		],
		formula: "Long: C > max(H, N)_{t−1}",
		useWhen: "Cổ phiếu, ETF.",
		failWhen: "Bull già, high giả trên tin.",
		combine: "Weinstein Stage 2. Donchian 55.",
		params: [{
			key: "lb",
			label: "Lookback",
			min: 40,
			max: 200,
			step: 5,
			default: 80
		}],
		best: "breakout",
		tags: ["52w", "breakout"]
	},
	{
		slug: "ma200-gravity",
		name: "MA200 Gravity",
		nameVi: "Hấp dẫn MA200",
		category: "system",
		blurb: "Giá bị kéo về SMA dài. Stretch quá xa = fade; tag MA trong trend = continuation.",
		summary: "Hai mặt. Gravity: khi dist% quá lớn, mean-revert về MA. Magnet: trong trend, lần chạm MA200 là entry theo chiều. Lab vẽ dải ± band quanh SMA n (n mặc định 80 vì chuỗi ngắn; daily thật dùng 200).",
		how: [
			"Stretch: chạm dải ngoài → fade về MA.",
			"Tag: cắt lại MA theo chiều cũ → continuation.",
			"Không fade stretch nếu Weinstein Stage 2 và ADX tăng."
		],
		formula: "dist = (C − SMA) / SMA\nFade: |dist| > band",
		useWhen: "Index, blue-chip.",
		failWhen: "Crash: gravitation thành rơi tự do.",
		combine: "Connors RSI-2 khi trên MA. Turtle khi gãy MA.",
		params: [{
			key: "ma",
			label: "SMA n",
			min: 40,
			max: 200,
			step: 5,
			default: 80
		}, {
			key: "band",
			label: "Band",
			min: .03,
			max: .15,
			step: .01,
			default: .06
		}],
		best: "mixed",
		tags: ["SMA200", "mean"]
	},
	{
		slug: "turn-of-month",
		name: "Turn-of-Month",
		nameVi: "Hiệu ứng cuối tháng",
		category: "system",
		blurb: "Calendar: ngày cuối tháng + 3 ngày đầu tháng sau. Drift dương có tài liệu.",
		summary: "Ariel, Lakonishok, Smidt. Luồng tiền quỹ/lương. Cửa sổ: ngày −1..+3. Hệ lab: bật long khi vào cửa sổ nếu giá trên SMA; đóng khi hết cửa sổ. Không phải Holy Grail — edge nhỏ, cần size lớn / chi phí thấp.",
		how: [
			"Không cần oscillator. Lịch + filter MA.",
			"Bỏ cửa sổ nếu gap tin FOMC.",
			"Kết hợp TSMOM: chỉ ToM khi TSMOM dương."
		],
		formula: "ToM = day ∈ {−1, 1, 2, 3}\nLong: ToM ∧ C > SMA",
		useWhen: "Index, ETF thanh khoản.",
		failWhen: "Phí cao. Tháng crisis.",
		combine: "52-week high. Weinstein 2.",
		params: [{
			key: "ma",
			label: "SMA filter",
			min: 20,
			max: 80,
			step: 5,
			default: 40
		}],
		best: "mixed",
		tags: ["calendar", "seasonality"]
	},
	{
		slug: "e0v1e",
		name: "E0V1E Scalper",
		nameVi: "Scalp EMA–VWAP–EMA",
		category: "system",
		blurb: "Stack EMA nhanh + VWAP + EMA chậm. Reclaim EMA nhanh khi cả ba cùng chiều.",
		summary: "Scalp intraday phổ biến: EMA 9, VWAP phiên, EMA 21. Bias khi 9 > 21 và giá trên VWAP. Entry khi giá dip vào EMA 9 rồi đóng cửa trở lại trên — không đuổi nến đầu tiên xuyên cả ba. Short đối xứng. Time-stop ngắn.",
		how: [
			"Không trade khi 9 và 21 xoắn, hoặc giá cắt VWAP qua lại.",
			"Reclaim EMA 9, không phải cross 9/21 (đã là bias).",
			"Stop dưới đáy pullback / trên VWAP tùy R:R."
		],
		formula: "Long: EMA9 > EMA21 ∧ C > VWAP ∧ C reclaim EMA9",
		useWhen: "M1–M15, index, FX majors.",
		failWhen: "Phiên đi ngang, spread nở.",
		combine: "ORB cùng chiều. Volume.",
		params: [
			{
				key: "fast",
				label: "EMA nhanh",
				min: 5,
				max: 13,
				step: 1,
				default: 9
			},
			{
				key: "slow",
				label: "EMA chậm",
				min: 15,
				max: 34,
				step: 1,
				default: 21
			},
			{
				key: "reset",
				label: "VWAP reset",
				min: 16,
				max: 80,
				step: 2,
				default: 40
			}
		],
		best: "uptrend",
		tags: [
			"scalp",
			"VWAP",
			"EMA"
		]
	},
	{
		slug: "turtle-soup",
		name: "Turtle Soup",
		nameVi: "Súp rùa",
		category: "system",
		blurb: "Linda Raschke: fade breakout Donchian 20 thất bại trong 4 nến. Ngược Turtle.",
		summary: "Street Smarts. Turtle Soup: sau high 20 ngày, nếu giá không follow-through và đóng cửa trở lại dưới đỉnh cũ trong ~4 nến — short failed breakout. Turtle Soup Plus One chờ thêm nến. Đây là fade, không phải trend-follow.",
		how: [
			"Cần có break thật (close > DonH 20).",
			"Fail: close trở lại trong range trong N nến.",
			"Stop trên high của nến break."
		],
		formula: "Short: ∃ break 20d high ∧ C_t < high_cũ trong ≤ k nến",
		useWhen: "Range, false break phổ biến.",
		failWhen: "Trend thật (S1/S2 thắng). Soup sẽ cháy stop.",
		combine: "Hurst < 0.5. BB squeeze không fire.",
		params: [{
			key: "don",
			label: "Donchian",
			min: 10,
			max: 30,
			step: 1,
			default: 20
		}, {
			key: "fail",
			label: "Cửa sổ fail",
			min: 2,
			max: 8,
			step: 1,
			default: 4
		}],
		best: "range",
		tags: ["Raschke", "fade"]
	},
	{
		slug: "rsi-bb-fade",
		name: "RSI Bollinger Fade",
		nameVi: "Fade RSI + BB",
		category: "system",
		blurb: "Hai cực cùng lúc: giá ngoài dải và RSI oversold/overbought. Mean-reversion kép.",
		summary: "Confluence đơn giản nhất của mean-reversion. Một mình BB hoặc RSI dễ giả. Cả hai cùng cực tăng xác suất về mid. Exit mid hoặc RSI 50. Stop ngoài swing, không trung bình giá.",
		how: [
			"Long: C ≤ BB_lower ∧ RSI < OS.",
			"Không cần chờ nến xác nhận nếu R:R tới mid ≥ 1.5.",
			"Cấm khi TTM squeeze vừa fire cùng chiều."
		],
		formula: "Long: C ≤ Mid − kσ ∧ RSI < OS",
		useWhen: "Range, Hurst thấp.",
		failWhen: "News expansion.",
		combine: "Connors RSI-2 nếu trên MA200 (chỉ long).",
		params: [
			{
				key: "rsi",
				label: "RSI n",
				min: 5,
				max: 21,
				step: 1,
				default: 14
			},
			{
				key: "bb",
				label: "BB n",
				min: 14,
				max: 30,
				step: 1,
				default: 20
			},
			{
				key: "k",
				label: "σ",
				min: 1.5,
				max: 3,
				step: .1,
				default: 2
			},
			{
				key: "os",
				label: "RSI OS",
				min: 15,
				max: 35,
				step: 1,
				default: 30
			}
		],
		best: "range",
		tags: ["confluence", "fade"]
	}
];
var FAMOUS_STRATEGIES = [
	{
		slug: "weinstein",
		name: "Weinstein Stage 2",
		kicker: "Chu kỳ 4 pha",
		blurb: "Chỉ giải ngân Stage 2: giá trên SMA 30 tuần dốc lên. Đứng ngoài Stage 1, bán Stage 3, short Stage 4. Bản đồ trước indicator.",
		regime: "Weekly · SMA 30w dốc lên · volume tăng",
		rules: [
			"Xác định stage trên weekly trước, daily chỉ để timing.",
			"Mua breakout khỏi basing (1→2), không mua giữa Stage 2 đã kéo xa MA.",
			"Stop dưới swing basing hoặc MA 30w.",
			"Giảm 50% khi vào Stage 3; flat hoặc đảo khi Stage 4."
		],
		stack: [
			"weinstein-s2",
			"donchian-ema200",
			"adx",
			"atr"
		],
		risk: "MA phẳng = stage không rõ. Whip quanh MA.",
		avoid: "Mua Stage 3 vì 'vẫn trên MA'."
	},
	{
		slug: "tp-mr-play",
		name: "TP + MR",
		kicker: "Hai mode",
		blurb: "Trend pullback khi EMA xòe, mean-reversion BB/RSI khi EMA thắt. Một desk, hai playbook — trọng tài là khoảng cách EMA.",
		regime: "Đọc |EMA21−EMA55| trước mỗi lệnh",
		rules: [
			"Xòe: chỉ TP. Reclaim EMA21, RSI < 55, Supertrend cùng chiều.",
			"Thắt: chỉ MR. BB + RSI cực, target mid, cấm gồng.",
			"ADX / Hurst nếu hai EMA 'nửa xòe' — đứng ngoài."
		],
		stack: [
			"tp-mr",
			"ema-ribbon",
			"bollinger",
			"rsi-strategy",
			"hurst"
		],
		risk: "Mode sai. Fade BB trong Stage 2.",
		avoid: "Tin nhị phân. Ribbon vừa đổi chiều."
	},
	{
		slug: "turtle-classic",
		name: "Turtle S1 / S2",
		kicker: "Breakout gốc",
		blurb: "S1 20/10 bắt sóng ngắn, S2 55/20 bắt sóng dài. Size = 1% / ATR. Thua thường, thắng ít nhưng lớn.",
		regime: "Futures/crypto có đuôi. ADX không bắt buộc ở bản gốc.",
		rules: [
			"Chạy song song hai hệ. Không skip trừ khi bạn backtest skip-rule.",
			"Vào stop-order trên high 20/55, không limit.",
			"Exit 10/20. Không 'chờ thêm'.",
			"Đơn vị 1% equity / N, N = ATR(20). Tối đa 4 đơn vị."
		],
		stack: [
			"turtle-s1",
			"turtle-s2",
			"donchian-turtle",
			"atr"
		],
		risk: "Chuỗi thua 8–12 lệnh. Cần size nhỏ.",
		avoid: "Cổ phiếu range 200 ngày. Phí cao."
	},
	{
		slug: "connors-dip",
		name: "Connors dip",
		kicker: "Mua nhát trong uptrend",
		blurb: "SMA200 filter + RSI(2) hoặc Cumulative RSI. Mean-reversion 2–5 ngày, win rate cao, payoff nhỏ. Stop vẫn bắt buộc.",
		regime: "C > SMA200 · không crash",
		rules: [
			"Chỉ long trên MA. Không short gương (Connors gốc nghiêng long equity).",
			"RSI(2) < 10, hoặc CRSI(2+2) < 20 chặt hơn.",
			"Exit SMA5 hoặc RSI(2) > 70. Không đợi đỉnh.",
			"Stop dưới swing hoặc 2×ATR — crash 2008 RSI(2) = 0 rồi còn 0."
		],
		stack: [
			"connors-rsi2",
			"connors-crsi",
			"ma200-gravity",
			"rsi-bb-fade"
		],
		risk: "Gap down. MA200 gãy.",
		avoid: "Short RSI(2) > 90 trong bull."
	},
	{
		slug: "ttm-play",
		name: "TTM Squeeze",
		kicker: "Nổ sau nén",
		blurb: "Chờ BB ⊂ KC. Không đoán hướng. Fire + mom histogram. Trail Supertrend. Khác squeeze-break (Donchian) ở chỗ mom là trọng tài chiều.",
		regime: "BB trong KC · mom sắp đổi",
		rules: [
			"Đứng ngoài khi squeeze ON.",
			"Vào nến fire, chiều = dấu mom.",
			"Invalid nếu mom đổi dấu ngay 2 nến.",
			"Trail Supertrend hoặc KC mid."
		],
		stack: [
			"ttm-squeeze",
			"keltner-break",
			"bollinger",
			"supertrend"
		],
		risk: "Fake fire hai phía.",
		avoid: "Squeeze trên thanh khoản chết."
	},
	{
		slug: "vwap-intraday",
		name: "VWAP desk",
		kicker: "Z-score + reclaim",
		blurb: "Hai play: fade |Z|>2 khi phiên đi ngang; reclaim VWAP khi phiên có drift. Đừng dùng cả hai cùng lúc.",
		regime: "Intraday · volume thật",
		rules: [
			"Phiên dẹt (VWAP slope thấp): Z-score fade, cover về 0.",
			"Phiên drift: chỉ reclaim cùng chiều, cấm fade.",
			"Opening range cùng chiều tăng xác suất reclaim."
		],
		stack: [
			"vwap-zscore",
			"vwap-reclaim",
			"orb",
			"e0v1e"
		],
		risk: "Tin giữa phiên. Z không mean-revert.",
		avoid: "Crypto 24/7 không neo phiên."
	},
	{
		slug: "e0v1e-play",
		name: "E0V1E Scalper",
		kicker: "EMA · VWAP · EMA",
		blurb: "9/VWAP/21. Bias cả ba cùng chiều, entry reclaim EMA 9, time-stop. Scalp chứ không swing.",
		regime: "M1–M15 · spread hẹp · phiên London/NY",
		rules: [
			"Long chỉ khi 9>21 và C>VWAP.",
			"Dip vào 9, đóng cửa trên 9.",
			"Stop dưới đáy pullback. Target 1–1.5×R hoặc EMA 21.",
			"Không trade 15 phút đầu nếu OR quá rộng."
		],
		stack: [
			"e0v1e",
			"ema-scalper",
			"vwap",
			"orb"
		],
		risk: "Overtrading. Spread.",
		avoid: "Lunch. Ngày FOMC."
	},
	{
		slug: "soup",
		name: "Turtle Soup",
		kicker: "Fade breakout giả",
		blurb: "Raschke: 20-day high không follow-through trong 4 nến → short. Ngược hẳn S1. Chỉ bật khi Hurst thấp.",
		regime: "Range · false break · H < 0.5",
		rules: [
			"Phải có break đóng cửa ngoài Donchian 20.",
			"Fail trong 4 nến, đóng cửa trở lại trong range.",
			"Stop trên high nến break. Target mid range.",
			"Nếu follow-through nến 2–3 = S1 thắng, không soup."
		],
		stack: [
			"turtle-soup",
			"donchian",
			"hurst",
			"rsi-bb-fade"
		],
		risk: "Trend thật xuyên stop.",
		avoid: "Stage 2 Weinstein. ADX đang lên."
	},
	{
		slug: "calendar-mom",
		name: "Calendar + TSMOM",
		kicker: "Lịch và drift",
		blurb: "Turn-of-month + time-series momentum + 52-week high. Edge nhỏ, ổn định, cần chi phí thấp và size kỷ luật.",
		regime: "Index · daily · chi phí thấp",
		rules: [
			"TSMOM dương = được long. Âm = không ToM long.",
			"Cửa sổ −1..+3: tăng size nếu 52w high mới.",
			"Không overlay oscillator. Đây là vị thế, không phải scalp."
		],
		stack: [
			"turn-of-month",
			"tsm",
			"week52-high",
			"ma200-gravity"
		],
		risk: "Crisis month. Edge bị phí ăn.",
		avoid: "Đòn bẩy cao. Penny."
	}
];
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/strategies-uwdh_W5o.js
var STRATEGIES = [...[
	{
		slug: "trend-follow",
		name: "Trend following",
		kicker: "Đi cùng sóng",
		blurb: "Không đoán đỉnh đáy. Vào khi xu hướng đã có, giữ đến khi Supertrend flip hoặc cấu trúc gãy. Edge nằm ở đuôi phân phối — vài lệnh thắng lớn bù chuỗi cắt lỗ nhỏ.",
		regime: "Hurst > 0.55 · ADX > 25 · ribbon xòe",
		rules: [
			"Filter: ADX(14) > 20 và đang tăng; Hurst > 0.55.",
			"Entry: đóng cửa break Donchian 20 cùng hướng Supertrend.",
			"Stop: Supertrend hoặc 2×ATR dưới/trên entry.",
			"Không đảo chiều trong cùng phiên. Chờ flip + BOS.",
			"Size: risk cố định 0.5–1% equity / (2×ATR)."
		],
		stack: [
			"hurst",
			"adx",
			"supertrend",
			"donchian",
			"atr"
		],
		risk: "Chuỗi whipsaw khi regime đổi. Rút vốn lớn nếu không cắt khi ADX gãy.",
		avoid: "Range, tin tức binary, thị trường mean-revert kéo dài."
	},
	{
		slug: "mean-reversion",
		name: "Mean reversion",
		kicker: "Về giá trị",
		blurb: "Giá đi quá xa Kalman/Bollinger rồi bị kéo về. Chỉ bật khi thị trường không persist. Edge là xác suất, không phải R:R lớn — win rate cao, payoff nhỏ.",
		regime: "Hurst < 0.45 · ADX < 20 · BW không đang nở",
		rules: [
			"Filter: Hurst < 0.45 và ADX < 20.",
			"Entry: đóng cửa ngoài dải Kalman/BB rồi nến xác nhận quay lại.",
			"Kích hoạt kép: RSI thoát 30/70 hoặc Fisher cắt từ cực trị.",
			"Target: đường giữa. Không tham lam walk-the-band.",
			"Stop: ngoài swing vừa tạo, tối đa 1.5×ATR."
		],
		stack: [
			"hurst",
			"kalman",
			"bollinger",
			"rsi-div",
			"fisher"
		],
		risk: "Một breakout thật sẽ xuyên stop. Không 'trung bình giá'.",
		avoid: "H > 0.55, squeeze sắp nổ, phiên tin."
	},
	{
		slug: "squeeze-break",
		name: "Squeeze breakout",
		kicker: "Nổ sau im",
		blurb: "Bollinger nằm trong Keltner = vol chết. Khi BB cắt ra, hướng lấy từ Donchian/CCI. Turtle hiện đại: không break mọi đỉnh, chỉ break sau squeeze.",
		regime: "Bandwidth percentile thấp · BB ⊂ KC",
		rules: [
			"Nhận diện squeeze: BW thấp và BB nằm trong KC.",
			"Entry: đóng cửa ngoài Donchian cùng lúc BB thoát KC.",
			"Xác nhận: CCI cắt ±100 hoặc MACD hist đổi dấu cùng chiều.",
			"Stop: phía bên kia kênh Keltner hoặc 1.5×ATR.",
			"Trail Supertrend sau khi lời > 1×ATR."
		],
		stack: [
			"bollinger",
			"keltner",
			"donchian",
			"cci",
			"supertrend"
		],
		risk: "Fake break hai phía. Phí nếu trade squeeze quá sớm.",
		avoid: "Squeeze trên thanh khoản chết. Break ngược volume."
	},
	{
		slug: "ichimoku-kumo",
		name: "Ichimoku kumo",
		kicker: "Một biểu đồ đủ",
		blurb: "Hệ cổ điển Nhật: giá trên mây, TK-cross, Chikou tự do, kumo tương lai cùng màu. Bốn điều kiện — thiếu một thì đứng ngoài. Ít lệnh, R:R đẹp.",
		regime: "Giá ngoài kumo · mây tương lai dày vừa",
		rules: [
			"Long chỉ khi giá trên kumo; short dưới kumo. Cấm trong mây.",
			"Tenkan cắt Kijun cùng chiều, Kijun dẹt thì giảm size.",
			"Chikou không bị giá/mây cản ở 26 nến trước.",
			"Kumo tương lai cùng màu với lệnh (Span A > B nếu long).",
			"Stop dưới/trên mây hoặc Kijun. Trail theo Kijun."
		],
		stack: [
			"ichimoku",
			"atr",
			"adx"
		],
		risk: "Trễ. Bỏ lỡ đầu sóng. Mây mỏng dễ xuyên.",
		avoid: "Khung quá nhỏ. Thị trường gap liên tục."
	},
	{
		slug: "structure-smc",
		name: "Cấu trúc + Fib",
		kicker: "Price action có luật",
		blurb: "Bias từ HH/HL. CHoCH cảnh báo. Pullback Fibonacci 0.5–0.618 của chân vừa BOS là nơi vào. Oscillator chỉ xác nhận, không dẫn dắt.",
		regime: "Swing rõ · không chop M1",
		rules: [
			"Vẽ swing từ ZigZag đã chốt. Đọc 4 điểm cuối.",
			"Chỉ long khi cấu trúc HH/HL còn; CHoCH → đứng ngoài, chờ BOS mới.",
			"Entry: 0.618 của chân BOS, nến từ chối, RSI thoát oversold.",
			"Invalid: đóng cửa dưới HL vừa tôn trọng.",
			"Target: swing high trước, rồi extension 1.272."
		],
		stack: [
			"market-structure",
			"zigzag",
			"fibonacci",
			"rsi-div"
		],
		risk: "Subjective swing. Overfit bằng mắt. CHoCH giả trên tin.",
		avoid: "Khung nhỏ, threshold ZigZag quá thấp."
	},
	{
		slug: "kernel-band",
		name: "Kernel band",
		kicker: "Fair value phi tuyến",
		blurb: "Nadaraya–Watson + Kalman: hai ước lượng fair value. Khi giá chạm dải và kernel dẹt — fade. Khi kernel dốc và giá bám biên — đừng fade, flip sang trend.",
		regime: "Kernel dẹt · H thấp · hoặc kernel dốc · H cao",
		rules: [
			"Hai chế độ, một chart: đọc slope kernel trước.",
			"Dẹt: fade chạm dải MAE, target đường giữa.",
			"Dốc: break dải cùng chiều = continuation, trail HMA/ALMA.",
			"Không dùng nến cuối của kernel đối xứng như đã chốt.",
			"Xác nhận Fisher/RSI khi fade."
		],
		stack: [
			"nadaraya-watson",
			"kalman",
			"hma",
			"fisher"
		],
		risk: "Lookahead cảm nhận ở giữa chuỗi. Mép phải vẫn sống.",
		avoid: "Trade như tín hiệu đã repaint xong.",
		freqtrade: "KernelBand"
	},
	{
		slug: "momentum-burst",
		name: "Momentum burst",
		kicker: "Gia tốc ngắn",
		blurb: "MACD hist nở + Stochastic thoát 20/80 + giá trên EMA ribbon. Burst sống 5–15 nến. Không phải hệ nắm hàng tháng.",
		regime: "Vol nở · hist MACD cùng dấu với giá",
		rules: [
			"Bias: giá vs EMA 55. Không burst ngược ribbon.",
			"Trigger: MACD hist đổi dương/âm và Stochastic rời cực.",
			"Volume/OBV xác nhận (nếu có volume thật).",
			"Thoát khi hist co 2 nến liên tiếp hoặc SAR flip.",
			"Time-stop: 12 nến nếu chưa 1×ATR."
		],
		stack: [
			"macd",
			"stochastic",
			"ema-ribbon",
			"parabolic-sar",
			"obv"
		],
		risk: "Burst giả sau tin. Overtrading.",
		avoid: "Range ADX < 15. Burst thứ ba cùng hướng trong ngày."
	},
	{
		slug: "session-anchor",
		name: "Session anchor",
		kicker: "VWAP + Pivot",
		blurb: "Intraday desk: bias ngày từ giá so với Pivot và VWAP. Kéo về VWAP trong xu hướng phiên là entry. R1/S1 là target đầu. ATR% quyết định có với R2 hay không.",
		regime: "Phiên có volume · gap không quá 1.5×ATR",
		rules: [
			"Mở trên P và VWAP → chỉ long. Dưới cả hai → chỉ short.",
			"Hai mỏ neo lệch nhau → giảm size, chờ chúng hội tụ.",
			"Entry: pullback VWAP, nến từ chối, Stochastic ủng hộ.",
			"Target R1/S1. R2 chỉ khi ATR% ngày đang nở.",
			"Đứng ngoài 15 phút đầu nếu gap lớn."
		],
		stack: [
			"vwap",
			"pivot-points",
			"stochastic",
			"atr"
		],
		risk: "Phiên tin. VWAP reset sai mốc.",
		avoid: "Thị trường 24/7 không neo. Illiquid lunch."
	}
], ...FAMOUS_STRATEGIES];
function getStrategy(slug) {
	return STRATEGIES.find((s) => s.slug === slug);
}
//#endregion
export { getStrategy as n, FAMOUS_ALGORITHMS as r, STRATEGIES as t };
