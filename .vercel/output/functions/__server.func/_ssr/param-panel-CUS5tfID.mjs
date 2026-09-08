import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as cn } from "./router-CGYLWMI0.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/param-panel-CUS5tfID.js
var import_jsx_runtime = require_jsx_runtime();
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-11 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-primary shadow-[var(--shadow-border)] transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70" })]
	});
}
function ParamPanel({ defs, values, onChange }) {
	if (defs.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Thuật toán này không có tham số chỉnh."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-4",
		children: defs.map((d) => {
			const v = values[d.key] ?? d.default;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mb-1 flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: d.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs tabular-nums text-fg",
						children: formatParam(v, d.step)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					min: d.min,
					max: d.max,
					step: d.step,
					value: [v],
					onValueChange: (next) => onChange(d.key, next[0] ?? d.default)
				})]
			}, d.key);
		})
	});
}
function formatParam(v, step) {
	const digits = step < .1 ? 3 : step < 1 ? 2 : 0;
	return v.toLocaleString("vi-VN", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
//#endregion
export { ParamPanel as t };
