import { t as STRATEGIES } from "./strategies-uwdh_W5o.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/strategies-P-HjFX9a.js
var import_jsx_runtime = require_jsx_runtime();
function StrategiesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-primary uppercase",
				children: "Playbook"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-2 font-display text-4xl text-fg sm:text-5xl",
				children: [
					STRATEGIES.length,
					" chiến thuật, không phải ",
					STRATEGIES.length,
					" indicator"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: "Mỗi playbook chỉ rõ regime, luật vào/ra, stack thuật toán, và lúc đứng ngoài. Chọn một, đọc luật, rồi mở Lab để thấy từng lớp trên nến."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-3 sm:grid-cols-2",
				children: STRATEGIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/strategies/$slug",
					params: { slug: s.slug },
					className: "flex flex-col rounded-xl bg-bg-elevated p-6 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-widest text-primary uppercase",
							children: s.kicker
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-3xl text-fg",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 flex-1 text-sm leading-relaxed text-muted",
							children: s.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-xs text-subtle",
							children: [s.regime, s.freqtrade ? ` · Freqtrade ${s.freqtrade}` : ""]
						})
					]
				}, s.slug))
			})
		]
	});
}
//#endregion
export { StrategiesPage as component };
