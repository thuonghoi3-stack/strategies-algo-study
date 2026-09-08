import { useMemo } from "react";
import { generateMarket } from "@/lib/market/generate";
import { runAlgorithm } from "@/lib/market/run";
import type { Overlay } from "@/lib/market/types";
import type { Scenario } from "@/lib/market/types";

function seriesFrom(overlays: Overlay[], closes: number[]): number[] {
  for (const ov of overlays) {
    if (ov.kind === "line") {
      return ov.values.map((v, i) => v ?? closes[i]!);
    }
    if (ov.kind === "band" && ov.mid) {
      return ov.mid.map((v, i) => v ?? closes[i]!);
    }
    if (ov.kind === "dots") {
      return ov.values.map((v, i) => v ?? closes[i]!);
    }
  }
  return closes;
}

export function Sparkline({
  slug,
  params,
  scenario,
  className,
}: {
  slug: string;
  params: Record<string, number>;
  scenario: Scenario;
  className?: string;
}) {
  const d = useMemo(() => {
    const bars = generateMarket({ scenario, bars: 48, seed: 11 });
    const res = runAlgorithm(slug, bars, params);
    const c = bars.map((b) => b.c);
    const nums = seriesFrom(res.overlays, c);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || 1;
    const w = 120;
    const h = 36;
    const pts = nums
      .map((v, i) => {
        const x = (i / Math.max(1, nums.length - 1)) * w;
        const y = h - 2 - ((v - min) / span) * (h - 4);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    const last = nums[nums.length - 1]! >= nums[0]!;
    return { pts, last, w, h };
  }, [slug, params, scenario]);

  return (
    <svg
      viewBox={`0 0 ${d.w} ${d.h}`}
      className={className}
      aria-hidden
      width={d.w}
      height={d.h}
    >
      <polyline
        fill="none"
        stroke={d.last ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.4"
        points={d.pts}
      />
    </svg>
  );
}
