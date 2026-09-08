import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as cn } from "./router-CGYLWMI0.mjs";
import { n as SCENARIOS } from "./run-CzVnzXM9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scenario-pills-BHcuxqY7.js
var import_jsx_runtime = require_jsx_runtime();
function ScenarioPills({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: SCENARIOS.map((s) => {
			const active = s.id === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(s.id),
				className: cn("h-9 rounded-full px-3 text-xs transition-colors duration-150", active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg"),
				children: s.label
			}, s.id);
		})
	});
}
//#endregion
export { ScenarioPills as t };
