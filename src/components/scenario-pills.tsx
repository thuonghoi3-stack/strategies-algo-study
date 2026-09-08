import { SCENARIOS } from "@/lib/market/generate";
import type { Scenario } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export function ScenarioPills({
  value,
  onChange,
}: {
  value: Scenario;
  onChange: (s: Scenario) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SCENARIOS.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              "h-9 rounded-full px-3 text-xs transition-colors duration-150",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted hover:text-fg",
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
