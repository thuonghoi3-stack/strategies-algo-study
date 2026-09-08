import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Route$4, c as CATEGORIES, d as getAlgorithm, l as cn, s as ALGORITHMS, u as defaultParams } from "./router-CGYLWMI0.mjs";
import { t as CandleChart } from "./candle-chart-J2TPDqIR.mjs";
import { t as ParamPanel } from "./param-panel-CUS5tfID.mjs";
import { a as mergeResults, i as generateMarket, s as runAlgorithm, t as Badge } from "./run-CzVnzXM9.mjs";
import { t as ScenarioPills } from "./scenario-pills-BHcuxqY7.mjs";
import { t as Input } from "./input-APe7Y80Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lab-AvixLNB1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LabPage() {
	const { algo: initial } = Route$4.useSearch();
	const start = getAlgorithm(initial ?? "")?.slug ?? "supertrend";
	const [selected, setSelected] = (0, import_react.useState)([start]);
	const [active, setActive] = (0, import_react.useState)(start);
	const [scenario, setScenario] = (0, import_react.useState)("mixed");
	const [seed, setSeed] = (0, import_react.useState)(3);
	const [q, setQ] = (0, import_react.useState)("");
	const [paramMap, setParamMap] = (0, import_react.useState)(() => {
		const m = {};
		for (const a of ALGORITHMS) m[a.slug] = defaultParams(a);
		return m;
	});
	(0, import_react.useEffect)(() => {
		if (initial && getAlgorithm(initial)) {
			setSelected([initial]);
			setActive(initial);
		}
	}, [initial]);
	const bars = (0, import_react.useMemo)(() => generateMarket({
		scenario,
		bars: 260,
		seed
	}), [scenario, seed]);
	const result = (0, import_react.useMemo)(() => {
		const parts = selected.map((slug) => runAlgorithm(slug, bars, paramMap[slug] ?? {}));
		return mergeResults(parts);
	}, [
		selected,
		bars,
		paramMap
	]);
	const current = getAlgorithm(active);
	const grouped = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return CATEGORIES.map((c) => ({
			...c,
			items: ALGORITHMS.filter((a) => {
				if (a.category !== c.id) return false;
				if (!query) return true;
				return `${a.name} ${a.nameVi} ${a.tags.join(" ")}`.toLowerCase().includes(query);
			})
		})).filter((g) => g.items.length > 0);
	}, [q]);
	function toggle(slug) {
		setSelected((prev) => {
			if (prev.includes(slug)) {
				const next = prev.filter((s) => s !== slug);
				return next.length === 0 ? prev : next;
			}
			if (prev.length >= 3) return [...prev.slice(1), slug];
			return [...prev, slug];
		});
		setActive(slug);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-primary uppercase",
				children: "Phòng thí nghiệm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl text-fg sm:text-5xl",
				children: "Chồng thuật toán lên nến"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: "Chọn tối đa ba thuật toán. Đổi kịch bản thị trường và tham số. Hit-rate 10 nến chỉ để so sánh trên chuỗi giả lập — không phải hiệu suất live."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_260px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "order-3 max-h-[40vh] overflow-y-auto rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] lg:order-none lg:max-h-[70vh]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "px-1 pb-2 text-[11px] tracking-widest text-muted uppercase",
								children: [
									"Stack (",
									selected.length,
									"/3)"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Lọc Turtle, Connors…",
								className: "mb-2 h-9",
								"aria-label": "Lọc thuật toán"
							}),
							grouped.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "sticky top-0 z-10 bg-bg-elevated px-1 py-1 text-[10px] tracking-widest text-subtle uppercase",
									children: g.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "flex flex-col",
									children: g.items.map((a) => {
										const on = selected.includes(a.slug);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => toggle(a.slug),
											className: cn("flex h-11 w-full items-center justify-between rounded-md px-2 text-left text-sm", on ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: a.name
											}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "accent",
												children: "on"
											}) : null]
										}) }, a.slug);
									})
								})]
							}, g.id)),
							grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-1 py-6 text-center text-xs text-muted",
								children: "Không khớp."
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "order-1 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4 lg:order-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioPills, {
									value: scenario,
									onChange: setScenario
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg",
									onClick: () => setSeed((s) => s + 1),
									children: ["Nến mới · seed ", seed]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
								bars,
								result,
								height: 480
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4",
								children: result.stats.slice(0, 8).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted uppercase",
									children: s.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm tabular-nums text-fg",
									children: s.value
								})] }, s.label + s.value))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "order-2 flex flex-col gap-4 lg:order-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] tracking-widest text-muted uppercase",
									children: "Đang chỉnh"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: selected.map((slug) => {
										const a = getAlgorithm(slug);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setActive(slug),
											className: cn("h-9 rounded-full px-3 text-xs", active === slug ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted"),
											children: a?.name
										}, slug);
									})
								}),
								current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParamPanel, {
										defs: current.params,
										values: paramMap[current.slug] ?? defaultParams(current),
										onChange: (k, v) => setParamMap((m) => ({
											...m,
											[current.slug]: {
												...m[current.slug],
												[k]: v
											}
										}))
									})
								}) : null
							]
						}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted",
							children: current.blurb
						}) : null]
					})
				]
			})
		]
	});
}
//#endregion
export { LabPage as component };
