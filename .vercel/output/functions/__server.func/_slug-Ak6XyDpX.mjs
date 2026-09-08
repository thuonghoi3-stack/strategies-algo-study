import { i as __toESM } from "./_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as ArrowRight, l as ArrowLeft } from "./_libs/lucide-react.mjs";
import { c as CATEGORIES, o as Button, r as Route$2, s as ALGORITHMS, u as defaultParams } from "./_ssr/router-CGYLWMI0.mjs";
import { t as CandleChart } from "./_ssr/candle-chart-J2TPDqIR.mjs";
import { t as ParamPanel } from "./_ssr/param-panel-CUS5tfID.mjs";
import { i as generateMarket, s as runAlgorithm, t as Badge } from "./_ssr/run-CzVnzXM9.mjs";
import { t as ScenarioPills } from "./_ssr/scenario-pills-BHcuxqY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-Ak6XyDpX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AlgorithmPage() {
	const { algo } = Route$2.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgorithmBody, { algo }, algo.slug);
}
function AlgorithmBody({ algo }) {
	const cat = CATEGORIES.find((c) => c.id === algo.category);
	const [params, setParams] = (0, import_react.useState)(() => defaultParams(algo));
	const [scenario, setScenario] = (0, import_react.useState)(algo.best);
	const [seed, setSeed] = (0, import_react.useState)(7);
	const bars = (0, import_react.useMemo)(() => generateMarket({
		scenario,
		bars: 240,
		seed
	}), [scenario, seed]);
	const result = (0, import_react.useMemo)(() => runAlgorithm(algo.slug, bars, params), [
		algo.slug,
		bars,
		params
	]);
	const idx = ALGORITHMS.findIndex((a) => a.slug === algo.slug);
	const prev = ALGORITHMS[idx - 1];
	const next = ALGORITHMS[idx + 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/algorithms",
				search: { cat: algo.category },
				className: "inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Thư viện"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-primary uppercase",
						children: cat?.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-4xl text-fg sm:text-5xl",
						children: algo.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: algo.nameVi
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: algo.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 max-w-3xl text-base leading-relaxed text-muted",
				children: algo.summary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioPills, {
								value: scenario,
								onChange: setScenario
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg",
								onClick: () => setSeed((s) => s + 1),
								children: "Nến mới"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
							bars,
							result,
							height: 460
						}),
						result.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 px-1 text-xs text-warn",
							children: result.note
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] tracking-widest text-muted uppercase",
								children: "Tham số"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParamPanel, {
									defs: algo.params,
									values: params,
									onChange: (k, v) => setParams((p) => ({
										...p,
										[k]: v
									}))
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] tracking-widest text-muted uppercase",
								children: "Thống kê chuỗi này"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-3 space-y-2",
								children: result.stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-sm text-muted",
										children: s.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-mono text-sm tabular-nums text-fg",
										children: s.value
									})]
								}, s.label))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/lab",
									search: { algo: algo.slug },
									children: "Mở trong Lab"
								})
							}), algo.slug === "nadaraya-watson" || algo.slug === "kalman" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/strategies/$slug",
									params: { slug: "kernel-band" },
									children: "Freqtrade KernelBand"
								})
							}) : null]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 grid gap-8 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Cách đọc"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: algo.how.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-l border-border pl-4 text-sm leading-relaxed text-muted",
							children: line
						}, line))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Công thức"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 overflow-x-auto rounded-lg bg-surface p-4 font-mono text-xs leading-relaxed text-fg",
						children: algo.formula
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Dùng khi"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: algo.useWhen
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-8 font-display text-2xl text-fg",
							children: "Hỏng khi"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: algo.failWhen
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Ghép với"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted",
						children: algo.combine
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 flex items-center justify-between border-t border-border pt-6",
				children: [prev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/algorithms/$slug",
					params: { slug: prev.slug },
					className: "group max-w-[45%]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted uppercase",
						children: "Trước"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-fg group-hover:text-primary",
						children: prev.name
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/algorithms/$slug",
					params: { slug: next.slug },
					className: "group max-w-[45%] text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "inline-flex items-center gap-1 text-[11px] text-muted uppercase",
						children: ["Sau ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-fg group-hover:text-primary",
						children: next.name
					})]
				}) : null]
			})
		]
	});
}
//#endregion
export { AlgorithmPage as component };
