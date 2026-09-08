import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Search } from "../_libs/lucide-react.mjs";
import { c as CATEGORIES, i as Route$3, l as cn, s as ALGORITHMS } from "./router-CGYLWMI0.mjs";
import { t as AlgoCard } from "./algo-card-cQNLWzZh.mjs";
import { t as Input } from "./input-APe7Y80Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/algorithms-DNb9JddQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Catalog() {
	const search = Route$3.useSearch();
	const [q, setQ] = (0, import_react.useState)(search.q ?? "");
	const cat = search.cat;
	(0, import_react.useEffect)(() => {
		if (typeof search.q === "string") setQ(search.q);
	}, [search.q]);
	const list = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return ALGORITHMS.filter((a) => {
			if (cat && a.category !== cat) return false;
			if (!query) return true;
			return `${a.name} ${a.nameVi} ${a.blurb} ${a.tags.join(" ")}`.toLowerCase().includes(query);
		});
	}, [q, cat]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-primary uppercase",
				children: "Thư viện"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-2 font-display text-4xl text-fg sm:text-5xl",
				children: [ALGORITHMS.length, " thuật toán, một ngôn ngữ"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: "Mỗi mục có công thức, lúc dùng, lúc hỏng, và chart chạy được. Không có indicator thần kỳ — chỉ có công cụ đúng regime."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Tìm Weinstein, Turtle, Connors, Kalman…",
						className: "pl-10",
						"aria-label": "Tìm thuật toán"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/algorithms",
						search: {},
						className: cn("h-9 rounded-full px-3 text-xs leading-9", !cat ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg"),
						children: "Tất cả"
					}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/algorithms",
						search: { cat: c.id },
						className: cn("h-9 rounded-full px-3 text-xs leading-9", cat === c.id ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg"),
						children: c.label
					}, c.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 font-mono text-xs tabular-nums text-muted",
				children: [list.length, " kết quả"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: list.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlgoCard, { algo: a }, a.slug))
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-16 text-center text-muted",
				children: "Không khớp. Thử từ khóa khác."
			}) : null
		]
	});
}
//#endregion
export { Catalog as component };
