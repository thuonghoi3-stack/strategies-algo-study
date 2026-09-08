import { createFileRoute, Link } from "@tanstack/react-router";
import { STRATEGIES } from "@/data/strategies";

export const Route = createFileRoute("/strategies/")({ component: StrategiesPage });

function StrategiesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Playbook</p>
      <h1 className="mt-2 font-display text-4xl text-fg sm:text-5xl">
        {STRATEGIES.length} chiến thuật, không phải {STRATEGIES.length} indicator
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Mỗi playbook chỉ rõ regime, luật vào/ra, stack thuật toán, và lúc đứng ngoài.
        Chọn một, đọc luật, rồi mở Lab để thấy từng lớp trên nến.
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {STRATEGIES.map((s) => (
          <Link
            key={s.slug}
            to="/strategies/$slug"
            params={{ slug: s.slug }}
            className="flex flex-col rounded-xl bg-bg-elevated p-6 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <p className="text-[11px] tracking-widest text-primary uppercase">{s.kicker}</p>
            <h2 className="mt-2 font-display text-3xl text-fg">{s.name}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.blurb}</p>
            <p className="mt-4 font-mono text-xs text-subtle">
              {s.regime}
              {s.freqtrade ? ` · Freqtrade ${s.freqtrade}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
