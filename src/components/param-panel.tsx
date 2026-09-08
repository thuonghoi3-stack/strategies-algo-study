import { Slider } from "@/components/ui/slider";
import type { ParamDef } from "@/lib/market/types";

export function ParamPanel({
  defs,
  values,
  onChange,
}: {
  defs: ParamDef[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  if (defs.length === 0) {
    return (
      <p className="text-sm text-muted">Thuật toán này không có tham số chỉnh.</p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {defs.map((d) => {
        const v = values[d.key] ?? d.default;
        return (
          <label key={d.key} className="block">
            <span className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">{d.label}</span>
              <span className="font-mono text-xs tabular-nums text-fg">
                {formatParam(v, d.step)}
              </span>
            </span>
            <Slider
              min={d.min}
              max={d.max}
              step={d.step}
              value={[v]}
              onValueChange={(next) => onChange(d.key, next[0] ?? d.default)}
            />
          </label>
        );
      })}
    </div>
  );
}

function formatParam(v: number, step: number) {
  const digits = step < 0.1 ? 3 : step < 1 ? 2 : 0;
  return v.toLocaleString("vi-VN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}
