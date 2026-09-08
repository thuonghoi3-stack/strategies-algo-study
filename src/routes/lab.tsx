import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CandleChart } from "@/components/chart/candle-chart";
import { ParamPanel } from "@/components/param-panel";
import { ScenarioPills } from "@/components/scenario-pills";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ALGORITHMS, CATEGORIES, defaultParams, getAlgorithm } from "@/data/catalog";
import { generateMarket } from "@/lib/market/generate";
import { mergeResults, runAlgorithm } from "@/lib/market/run";
import type { Scenario } from "@/lib/market/types";
import { cn } from "@/lib/utils";

type Search = { algo?: string };

export const Route = createFileRoute("/lab")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    algo: typeof raw.algo === "string" ? raw.algo : undefined,
  }),
  component: LabPage,
});

function LabPage() {
  const { algo: initial } = Route.useSearch();
  const start = getAlgorithm(initial ?? "")?.slug ?? "supertrend";
  const [selected, setSelected] = useState<string[]>([start]);
  const [active, setActive] = useState(start);
  const [scenario, setScenario] = useState<Scenario>("mixed");
  const [seed, setSeed] = useState(3);
  const [q, setQ] = useState("");
  const [paramMap, setParamMap] = useState<Record<string, Record<string, number>>>(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const a of ALGORITHMS) m[a.slug] = defaultParams(a);
    return m;
  });

  useEffect(() => {
    if (initial && getAlgorithm(initial)) {
      setSelected([initial]);
      setActive(initial);
    }
  }, [initial]);

  const bars = useMemo(
    () => generateMarket({ scenario, bars: 260, seed }),
    [scenario, seed],
  );

  const result = useMemo(() => {
    const parts = selected.map((slug) =>
      runAlgorithm(slug, bars, paramMap[slug] ?? {}),
    );
    return mergeResults(parts);
  }, [selected, bars, paramMap]);

  const current = getAlgorithm(active);

  const grouped = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CATEGORIES.map((c) => ({
      ...c,
      items: ALGORITHMS.filter((a) => {
        if (a.category !== c.id) return false;
        if (!query) return true;
        const blob = `${a.name} ${a.nameVi} ${a.tags.join(" ")}`.toLowerCase();
        return blob.includes(query);
      }),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  function toggle(slug: string) {
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">
        Phòng thí nghiệm
      </p>
      <h1 className="mt-2 font-display text-4xl text-fg sm:text-5xl">
        Chồng thuật toán lên nến
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Chọn tối đa ba thuật toán. Đổi kịch bản thị trường và tham số. Hit-rate
        10 nến chỉ để so sánh trên chuỗi giả lập — không phải hiệu suất live.
      </p>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="order-3 max-h-[40vh] overflow-y-auto rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] lg:order-none lg:max-h-[70vh]">
          <p className="px-1 pb-2 text-[11px] tracking-widest text-muted uppercase">
            Stack ({selected.length}/3)
          </p>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lọc Turtle, Connors…"
            className="mb-2 h-9"
            aria-label="Lọc thuật toán"
          />
          {grouped.map((g) => (
            <div key={g.id} className="mb-2">
              <p className="sticky top-0 z-10 bg-bg-elevated px-1 py-1 text-[10px] tracking-widest text-subtle uppercase">
                {g.label}
              </p>
              <ul className="flex flex-col">
                {g.items.map((a) => {
                  const on = selected.includes(a.slug);
                  return (
                    <li key={a.slug}>
                      <button
                        type="button"
                        onClick={() => toggle(a.slug)}
                        className={cn(
                          "flex h-11 w-full items-center justify-between rounded-md px-2 text-left text-sm",
                          on ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                        )}
                      >
                        <span className="truncate">{a.name}</span>
                        {on ? <Badge variant="accent">on</Badge> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {grouped.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted">Không khớp.</p>
          ) : null}
        </aside>

        <div className="order-1 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4 lg:order-none">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ScenarioPills value={scenario} onChange={setScenario} />
            <button
              type="button"
              className="h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg"
              onClick={() => setSeed((s) => s + 1)}
            >
              Nến mới · seed {seed}
            </button>
          </div>
          <CandleChart bars={bars} result={result} height={480} />
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
            {result.stats.slice(0, 8).map((s) => (
              <div key={s.label + s.value}>
                <p className="text-[11px] text-muted uppercase">{s.label}</p>
                <p className="font-mono text-sm tabular-nums text-fg">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-2 flex flex-col gap-4 lg:order-none">
          <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
            <p className="text-[11px] tracking-widest text-muted uppercase">Đang chỉnh</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.map((slug) => {
                const a = getAlgorithm(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setActive(slug)}
                    className={cn(
                      "h-9 rounded-full px-3 text-xs",
                      active === slug
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-muted",
                    )}
                  >
                    {a?.name}
                  </button>
                );
              })}
            </div>
            {current ? (
              <div className="mt-4">
                <ParamPanel
                  defs={current.params}
                  values={paramMap[current.slug] ?? defaultParams(current)}
                  onChange={(k, v) =>
                    setParamMap((m) => ({
                      ...m,
                      [current.slug]: { ...m[current.slug], [k]: v },
                    }))
                  }
                />
              </div>
            ) : null}
          </div>
          {current ? (
            <p className="text-sm leading-relaxed text-muted">{current.blurb}</p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
