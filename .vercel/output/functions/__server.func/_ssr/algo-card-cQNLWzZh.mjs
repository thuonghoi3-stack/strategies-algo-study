import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as CATEGORIES, u as defaultParams } from "./router-CGYLWMI0.mjs";
import { i as generateMarket, s as runAlgorithm, t as Badge } from "./run-CzVnzXM9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/algo-card-cQNLWzZh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function seriesFrom(overlays, closes) {
	for (const ov of overlays) {
		if (ov.kind === "line") return ov.values.map((v, i) => v ?? closes[i]);
		if (ov.kind === "band" && ov.mid) return ov.mid.map((v, i) => v ?? closes[i]);
		if (ov.kind === "dots") return ov.values.map((v, i) => v ?? closes[i]);
	}
	return closes;
}
function Sparkline({ slug, params, scenario, className }) {
	const d = (0, import_react.useMemo)(() => {
		const bars = generateMarket({
			scenario,
			bars: 48,
			seed: 11
		});
		const res = runAlgorithm(slug, bars, params);
		const c = bars.map((b) => b.c);
		const nums = seriesFrom(res.overlays, c);
		const min = Math.min(...nums);
		const span = Math.max(...nums) - min || 1;
		const w = 120;
		return {
			pts: nums.map((v, i) => {
				const x = i / Math.max(1, nums.length - 1) * w;
				const y = 34 - (v - min) / span * 32;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			}).join(" "),
			last: nums[nums.length - 1] >= nums[0],
			w,
			h: 36
		};
	}, [
		slug,
		params,
		scenario
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${d.w} ${d.h}`,
		className,
		"aria-hidden": true,
		width: d.w,
		height: d.h,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: d.last ? "var(--color-up)" : "var(--color-down)",
			strokeWidth: "1.4",
			points: d.pts
		})
	});
}
function AlgoCard({ algo }) {
	const cat = CATEGORIES.find((c) => c.id === algo.category);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/algorithms/$slug",
		params: { slug: algo.slug },
		className: "group flex flex-col rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium tracking-widest text-muted uppercase",
						children: cat?.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-1 font-display text-2xl leading-tight text-fg",
						children: algo.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: algo.nameVi
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					slug: algo.slug,
					params: defaultParams(algo),
					scenario: algo.best,
					className: "shrink-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 flex-1 text-sm leading-relaxed text-muted",
				children: algo.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-1.5",
				children: algo.tags.slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t }, t))
			})
		]
	});
}
//#endregion
export { AlgoCard as t };
