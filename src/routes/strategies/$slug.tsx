import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { CandleChart } from "@/components/chart/candle-chart";
import { FreqtradeExport } from "@/components/freqtrade-export";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAlgorithm } from "@/data/catalog";
import { getStrategy, STRATEGIES } from "@/data/strategies";
import { generateMarket } from "@/lib/market/generate";
import { mergeResults, runAlgorithm } from "@/lib/market/run";
import { defaultParams } from "@/data/catalog";

export const Route = createFileRoute("/strategies/$slug")({
  loader: ({ params }) => {
    const strategy = getStrategy(params.slug);
    if (!strategy) throw notFound();
    return { strategy };
  },
  component: StrategyPage,
});

function StrategyPage() {
  const { strategy } = Route.useLoaderData();
  const [seed, setSeed] = useState(12);
  const bars = useMemo(
    () => generateMarket({ scenario: "mixed", bars: 240, seed }),
    [seed],
  );
  const result = useMemo(() => {
    const parts = strategy.stack.map((slug) => {
      const algo = getAlgorithm(slug);
      return runAlgorithm(slug, bars, algo ? defaultParams(algo) : {});
    });
    return mergeResults(parts);
  }, [strategy.stack, bars]);

  const idx = STRATEGIES.findIndex((s) => s.slug === strategy.slug);
  const prev = STRATEGIES[idx - 1];
  const next = STRATEGIES[idx + 1];

  return (
    <main className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6">
      <Link
        to="/strategies"
        className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Chiến thuật
      </Link>
      <p className="mt-4 text-[11px] tracking-[0.18em] text-primary uppercase">
        {strategy.kicker}
      </p>
      <h1 className="mt-1 font-display text-4xl text-fg sm:text-5xl">{strategy.name}</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{strategy.blurb}</p>

      <div className="mt-8 min-w-0 overflow-hidden rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-muted">Stack chồng trên kịch bản hỗn hợp</p>
          <button
            type="button"
            className="h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg"
            onClick={() => setSeed((s) => s + 1)}
          >
            Nến mới
          </button>
        </div>
        <CandleChart bars={bars} result={result} height={440} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-fg">Luật</h2>
          <ol className="mt-4 space-y-3">
            {strategy.rules.map((r, i) => (
              <li key={r} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                {r}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-2xl text-fg">Regime</h2>
            <p className="mt-3 font-mono text-sm text-fg">{strategy.regime}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-fg">Stack</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {strategy.stack.map((slug) => {
                const a = getAlgorithm(slug);
                return a ? (
                  <Link key={slug} to="/algorithms/$slug" params={{ slug }}>
                    <Badge variant="accent">{a.name}</Badge>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl text-fg">Rủi ro</h2>
            <p className="mt-3 text-sm text-muted">{strategy.risk}</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-fg">Đứng ngoài khi</h2>
            <p className="mt-3 text-sm text-muted">{strategy.avoid}</p>
          </div>
        </div>
      </div>

      {strategy.freqtrade === "KernelBand" ? <FreqtradeExport /> : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/lab" search={{ algo: strategy.stack[0] }}>
            Thử stack trong Lab
          </Link>
        </Button>
        {strategy.freqtrade ? (
          <Button asChild variant="outline">
            <a href="#freqtrade">Freqtrade {strategy.freqtrade}.py</a>
          </Button>
        ) : null}
      </div>

      <div className="mt-16 flex justify-between border-t border-border pt-6">
        {prev ? (
          <Link to="/strategies/$slug" params={{ slug: prev.slug }} className="text-sm text-muted hover:text-fg">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/strategies/$slug" params={{ slug: next.slug }} className="text-sm text-muted hover:text-fg">
            {next.name} →
          </Link>
        ) : null}
      </div>
    </main>
  );
}
