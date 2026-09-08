import { Link } from "@tanstack/react-router";
import { Sparkline } from "@/components/chart/sparkline";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, defaultParams, type Algorithm } from "@/data/catalog";

export function AlgoCard({ algo }: { algo: Algorithm }) {
  const cat = CATEGORIES.find((c) => c.id === algo.category);
  return (
    <Link
      to="/algorithms/$slug"
      params={{ slug: algo.slug }}
      className="group flex flex-col rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-widest text-muted uppercase">
            {cat?.label}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-fg">
            {algo.name}
          </h3>
          <p className="text-sm text-muted">{algo.nameVi}</p>
        </div>
        <Sparkline
          slug={algo.slug}
          params={defaultParams(algo)}
          scenario={algo.best}
          className="shrink-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100"
        />
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{algo.blurb}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {algo.tags.slice(0, 3).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    </Link>
  );
}
