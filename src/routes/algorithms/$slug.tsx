import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CandleChart } from "@/components/chart/candle-chart";
import { ParamPanel } from "@/components/param-panel";
import { ScenarioPills } from "@/components/scenario-pills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALGORITHMS,
  CATEGORIES,
  defaultParams,
  getAlgorithm,
} from "@/data/catalog";
import { generateMarket } from "@/lib/market/generate";
import { runAlgorithm } from "@/lib/market/run";
import type { Scenario } from "@/lib/market/types";

export const Route = createFileRoute("/algorithms/$slug")({
  loader: ({ params }) => {
    const algo = getAlgorithm(params.slug);
    if (!algo) throw notFound();
    return { algo };
  },
  component: AlgorithmPage,
});

function AlgorithmPage() {
  const { algo } = Route.useLoaderData();
  return <AlgorithmBody key={algo.slug} algo={algo} />;
}

function AlgorithmBody({ algo }: { algo: NonNullable<ReturnType<typeof getAlgorithm>> }) {
  const cat = CATEGORIES.find((c) => c.id === algo.category);
  const [params, setParams] = useState(() => defaultParams(algo));
  const [scenario, setScenario] = useState<Scenario>(algo.best);
  const [seed, setSeed] = useState(7);

  const bars = useMemo(
    () => generateMarket({ scenario, bars: 240, seed }),
    [scenario, seed],
  );
  const result = useMemo(
    () => runAlgorithm(algo.slug, bars, params),
    [algo.slug, bars, params],
  );

  const idx = ALGORITHMS.findIndex((a) => a.slug === algo.slug);
  const prev = ALGORITHMS[idx - 1];
  const next = ALGORITHMS[idx + 1];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/algorithms"
        search={{ cat: algo.category }}
        className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Thư viện
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-primary uppercase">
            {cat?.label}
          </p>
          <h1 className="mt-1 font-display text-4xl text-fg sm:text-5xl">{algo.name}</h1>
          <p className="mt-1 text-muted">{algo.nameVi}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {algo.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted">{algo.summary}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ScenarioPills value={scenario} onChange={setScenario} />
            <button
              type="button"
              className="h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg"
              onClick={() => setSeed((s) => s + 1)}
            >
              Nến mới
            </button>
          </div>
          <CandleChart bars={bars} result={result} height={460} />
          {result.note ? (
            <p className="mt-2 px-1 text-xs text-warn">{result.note}</p>
          ) : null}
        </div>
        <aside className="flex flex-col gap-6">
          <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
            <p className="text-[11px] tracking-widest text-muted uppercase">Tham số</p>
            <div className="mt-3">
              <ParamPanel
                defs={algo.params}
                values={params}
                onChange={(k, v) => setParams((p) => ({ ...p, [k]: v }))}
              />
            </div>
          </div>
          <div className="rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
            <p className="text-[11px] tracking-widest text-muted uppercase">Thống kê chuỗi này</p>
            <dl className="mt-3 space-y-2">
              {result.stats.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="font-mono text-sm tabular-nums text-fg">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/lab" search={{ algo: algo.slug }}>
                Mở trong Lab
              </Link>
            </Button>
            {algo.slug === "nadaraya-watson" || algo.slug === "kalman" ? (
              <Button asChild variant="ghost">
                <Link to="/strategies/$slug" params={{ slug: "kernel-band" }}>
                  Freqtrade KernelBand
                </Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-fg">Cách đọc</h2>
          <ul className="mt-4 space-y-3">
            {algo.how.map((line) => (
              <li key={line} className="border-l border-border pl-4 text-sm leading-relaxed text-muted">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl text-fg">Công thức</h2>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-surface p-4 font-mono text-xs leading-relaxed text-fg">
            {algo.formula}
          </pre>
        </div>
        <div>
          <h2 className="font-display text-2xl text-fg">Dùng khi</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{algo.useWhen}</p>
          <h2 className="mt-8 font-display text-2xl text-fg">Hỏng khi</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{algo.failWhen}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-fg">Ghép với</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{algo.combine}</p>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            to="/algorithms/$slug"
            params={{ slug: prev.slug }}
            className="group max-w-[45%]"
          >
            <p className="text-[11px] text-muted uppercase">Trước</p>
            <p className="font-display text-xl text-fg group-hover:text-primary">{prev.name}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/algorithms/$slug"
            params={{ slug: next.slug }}
            className="group max-w-[45%] text-right"
          >
            <p className="inline-flex items-center gap-1 text-[11px] text-muted uppercase">
              Sau <ArrowRight className="size-3" />
            </p>
            <p className="font-display text-xl text-fg group-hover:text-primary">{next.name}</p>
          </Link>
        ) : null}
      </div>
    </main>
  );
}
