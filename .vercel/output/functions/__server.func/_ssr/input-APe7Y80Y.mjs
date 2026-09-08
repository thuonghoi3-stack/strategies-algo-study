import "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as cn } from "./router-CGYLWMI0.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm text-fg placeholder:text-subtle", "transition-[box-shadow,border-color] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Input as t };
