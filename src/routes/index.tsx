import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { AlgoCard } from "@/components/algo-card";
import { CandleChart } from "@/components/chart/candle-chart";
import { ScenarioPills } from "@/components/scenario-pills";
import { Button } from "@/components/ui/button";
import { ALGORITHMS, CATEGORIES, defaultParams, getAlgorithm } from "@/data/catalog";
import { STRATEGIES } from "@/data/strategies";
import { generateMarket } from "@/lib/market/generate";
import { runAlgorithm } from "@/lib/market/run";
import type { Scenario } from "@/lib/market/types";

export const Route = createFileRoute("/")({ component: Home });

const FEATURED = [
  "weinstein-s2",
  "turtle-s1",
  "connors-rsi2",
  "ttm-squeeze",
  "supertrend",
  "ichimoku",
  "e0v1e",
  "turtle-soup",
];

const HERO_ALGOS = [
  "weinstein-s2",
  "turtle-s1",
  "ttm-squeeze",
  "connors-rsi2",
  "supertrend",
  "ichimoku",
];

function Home() {
  const [slug, setSlug] = useState("weinstein-s2");
  const [scenario, setScenario] = useState<Scenario>("mixed");
  const algo = getAlgorithm(slug) ?? ALGORITHMS[0]!;
  const bars = useMemo(
    () => generateMarket({ scenario, bars: 220, seed: 21 }),
    [scenario],
  );
  const result = useMemo(
    () => runAlgorithm(algo.slug, bars, defaultParams(algo)),
    [algo, bars],
  );
  const featured = FEATURED.map((s) => getAlgorithm(s)).filter(Boolean);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-grain opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="stagger-in max-w-3xl">
            <p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
              Thư viện thuật toán giao dịch
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-fg">
              Xu hướng. Đường cong.
              <span className="italic text-muted"> Điểm đảo chiều.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Meridian chạy {ALGORITHMS.length} thuật toán — Supertrend, Ichimoku,
              Weinstein Stage 2, Turtle, Connors RSI-2, TTM Squeeze, Kalman —
              để bạn thấy chúng làm gì, và khi nào chúng chết.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/lab">
                  Mở phòng thí nghiệm
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/algorithms">Xem toàn bộ thư viện</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-border)] sm:p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {HERO_ALGOS.map((id) => {
                  const a = getAlgorithm(id);
                  if (!a) return null;
                  const on = id === slug;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSlug(id)}
                      className={
                        on
                          ? "h-9 rounded-full bg-primary px-3 text-xs text-primary-foreground"
                          : "h-9 rounded-full bg-surface-2 px-3 text-xs text-muted hover:text-fg"
                      }
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
              <ScenarioPills value={scenario} onChange={setScenario} />
            </div>
            <CandleChart bars={bars} result={result} height={420} />
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-border px-1 pt-3">
              {result.stats.slice(0, 5).map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] tracking-wide text-muted uppercase">{s.label}</p>
                  <p className="font-mono text-sm tabular-nums text-fg">{s.value}</p>
                </div>
              ))}
              <Link
                to="/algorithms/$slug"
                params={{ slug: algo.slug }}
                className="ml-auto flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Chi tiết {algo.name}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/algorithms"
              search={{ cat: c.id }}
              className="bg-bg px-5 py-8 transition-colors duration-150 hover:bg-bg-elevated"
            >
              <p className="text-[11px] tracking-[0.18em] text-primary uppercase">{c.kicker}</p>
              <h2 className="mt-2 font-display text-2xl text-fg">{c.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Tuyển chọn</p>
            <h2 className="mt-1 font-display text-3xl text-fg sm:text-4xl">
              Tám hệ thống nên thuộc
            </h2>
          </div>
          <Link to="/algorithms" className="hidden text-sm text-primary hover:underline sm:inline">
            Tất cả {ALGORITHMS.length} →
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((a) => (a ? <AlgoCard key={a.slug} algo={a} /> : null))}
        </div>
      </section>

      <section className="border-y border-border bg-bg-elevated">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">Hệ thống</p>
          <h2 className="mt-1 font-display text-3xl text-fg sm:text-4xl">
            Thuật toán đơn không phải chiến thuật
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            {STRATEGIES.length} playbook: trend, mean-reversion, Turtle, Connors,
            Weinstein, TTM, VWAP, Soup — luật vào/ra đủ, không phải một đường.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STRATEGIES.map((s) => (
              <Link
                key={s.slug}
                to="/strategies/$slug"
                params={{ slug: s.slug }}
                className="rounded-xl bg-bg p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <p className="text-[11px] tracking-widest text-primary uppercase">{s.kicker}</p>
                <h3 className="mt-2 font-display text-xl text-fg">{s.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{s.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          {[
            {
              n: "01",
              t: "Chọn regime",
              d: "Hurst và ADX nói thị trường đang persist hay mean-revert. Sai regime thì thuật toán xuất sắc cũng thành nhiễu.",
            },
            {
              n: "02",
              t: "Chạy trên nến",
              d: "Mọi thuật toán ở đây có công thức thật, không mô tả suông. Phòng thí nghiệm cho đổi tham số, kịch bản, xem tín hiệu.",
            },
            {
              n: "03",
              t: "Ghép thành hệ",
              d: "Filter + trigger + stop + size. Supertrend không phải hệ thống cho đến khi bạn nói được lúc nào không được dùng nó.",
            },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-mono text-xs text-primary">{s.n}</p>
              <h3 className="mt-2 font-display text-2xl text-fg">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
