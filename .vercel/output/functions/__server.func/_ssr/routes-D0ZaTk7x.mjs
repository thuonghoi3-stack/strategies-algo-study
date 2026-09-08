import { i as __toESM } from "../_runtime.mjs";
import { t as STRATEGIES } from "./strategies-uwdh_W5o.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as ArrowRight } from "../_libs/lucide-react.mjs";
import { c as CATEGORIES, d as getAlgorithm, o as Button, s as ALGORITHMS, u as defaultParams } from "./router-CGYLWMI0.mjs";
import { t as CandleChart } from "./candle-chart-J2TPDqIR.mjs";
import { i as generateMarket, s as runAlgorithm } from "./run-CzVnzXM9.mjs";
import { t as ScenarioPills } from "./scenario-pills-BHcuxqY7.mjs";
import { t as AlgoCard } from "./algo-card-cQNLWzZh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D0ZaTk7x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FEATURED = [
	"weinstein-s2",
	"turtle-s1",
	"connors-rsi2",
	"ttm-squeeze",
	"supertrend",
	"ichimoku",
	"e0v1e",
	"turtle-soup"
];
var HERO_ALGOS = [
	"weinstein-s2",
	"turtle-s1",
	"ttm-squeeze",
	"connors-rsi2",
	"supertrend",
	"ichimoku"
];
function Home() {
	const [slug, setSlug] = (0, import_react.useState)("weinstein-s2");
	const [scenario, setScenario] = (0, import_react.useState)("mixed");
	const algo = getAlgorithm(slug) ?? ALGORITHMS[0];
	const bars = (0, import_react.useMemo)(() => generateMarket({
		scenario,
		bars: 220,
		seed: 21
	}), [scenario]);
	const result = (0, import_react.useMemo)(() => runAlgorithm(algo.slug, bars, defaultParams(algo)), [algo, bars]);
	const featured = FEATURED.map((s) => getAlgorithm(s)).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 grid-grain opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stagger-in max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium tracking-[0.22em] text-primary uppercase",
							children: "Thư viện thuật toán giao dịch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-fg",
							children: ["Xu hướng. Đường cong.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic text-muted",
								children: " Điểm đảo chiều."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg",
							children: [
								"Meridian chạy ",
								ALGORITHMS.length,
								" thuật toán — Supertrend, Ichimoku, Weinstein Stage 2, Turtle, Connors RSI-2, TTM Squeeze, Kalman — để bạn thấy chúng làm gì, và khi nào chúng chết."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/lab",
									children: ["Mở phòng thí nghiệm", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/algorithms",
									children: "Xem toàn bộ thư viện"
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: HERO_ALGOS.map((id) => {
									const a = getAlgorithm(id);
									if (!a) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setSlug(id),
										className: id === slug ? "h-9 rounded-full bg-primary px-3 text-xs text-primary-foreground" : "h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg",
										children: a.name
									}, id);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioPills, {
								value: scenario,
								onChange: setScenario
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
							bars,
							result,
							height: 420
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-1 pt-3",
							children: [result.stats.slice(0, 5).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] tracking-wide text-muted uppercase",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums text-fg",
								children: s.value
							})] }, s.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/algorithms/$slug",
								params: { slug: algo.slug },
								className: "ml-auto flex items-center gap-1 text-sm text-primary hover:underline",
								children: [
									"Chi tiết ",
									algo.name,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })
								]
							})]
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4",
				children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/algorithms",
					search: { cat: c.id },
					className: "bg-bg px-5 py-8 transition-colors duration-150 hover:bg-bg-elevated",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.18em] text-primary uppercase",
							children: c.kicker
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: c.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: c.body
						})
					]
				}, c.id))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 py-16 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted uppercase",
					children: "Tuyển chọn"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-3xl text-fg sm:text-4xl",
					children: "Tám hệ thống nên thuộc"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/algorithms",
					className: "hidden text-sm text-primary hover:underline sm:inline",
					children: [
						"Tất cả ",
						ALGORITHMS.length,
						" →"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: featured.map((a) => a ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgoCard, { algo: a }, a.slug) : null)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 py-16 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-muted uppercase",
						children: "Hệ thống"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl text-fg sm:text-4xl",
						children: "Thuật toán đơn không phải chiến thuật"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 max-w-2xl text-muted",
						children: [STRATEGIES.length, " playbook: trend, mean-reversion, Turtle, Connors, Weinstein, TTM, VWAP, Soup — luật vào/ra đủ, không phải một đường."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: STRATEGIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/strategies/$slug",
							params: { slug: s.slug },
							className: "rounded-xl bg-bg p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] tracking-widest text-primary uppercase",
									children: s.kicker
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 font-display text-xl text-fg",
									children: s.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 line-clamp-3 text-sm text-muted",
									children: s.blurb
								})
							]
						}, s.slug))
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-6xl px-4 py-16 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-10 lg:grid-cols-3",
				children: [
					{
						n: "01",
						t: "Chọn regime",
						d: "Hurst và ADX nói thị trường đang persist hay mean-revert. Sai regime thì thuật toán xuất sắc cũng thành nhiễu."
					},
					{
						n: "02",
						t: "Chạy trên nến",
						d: "Mọi thuật toán ở đây có công thức thật, không mô tả suông. Phòng thí nghiệm cho đổi tham số, kịch bản, xem tín hiệu."
					},
					{
						n: "03",
						t: "Ghép thành hệ",
						d: "Filter + trigger + stop + size. Supertrend không phải hệ thống cho đến khi bạn nói được lúc nào không được dùng nó."
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-primary",
						children: s.n
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 font-display text-2xl text-fg",
						children: s.t
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: s.d
					})
				] }, s.n))
			})
		})
	] });
}
//#endregion
export { Home as component };
