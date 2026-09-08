import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AlgoCard } from "@/components/algo-card";
import { Input } from "@/components/ui/input";
import { ALGORITHMS, CATEGORIES } from "@/data/catalog";
import type { CategoryId } from "@/lib/market/types";
import { cn } from "@/lib/utils";

type Search = { cat?: CategoryId; q?: string };

export const Route = createFileRoute("/algorithms/")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    cat: CATEGORIES.some((c) => c.id === raw.cat) ? (raw.cat as CategoryId) : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const cat = search.cat;

  useEffect(() => {
    if (typeof search.q === "string") setQ(search.q);
  }, [search.q]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ALGORITHMS.filter((a) => {
      if (cat && a.category !== cat) return false;
      if (!query) return true;
      const blob = `${a.name} ${a.nameVi} ${a.blurb} ${a.tags.join(" ")}`.toLowerCase();
      return blob.includes(query);
    });
  }, [q, cat]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Thư viện</p>
      <h1 className="mt-2 font-display text-4xl text-fg sm:text-5xl">
        {ALGORITHMS.length} thuật toán, một ngôn ngữ
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Mỗi mục có công thức, lúc dùng, lúc hỏng, và chart chạy được. Không có
        indicator thần kỳ — chỉ có công cụ đúng regime.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm Weinstein, Turtle, Connors, Kalman…"
            className="pl-10"
            aria-label="Tìm thuật toán"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link
            to="/algorithms"
            search={{}}
            className={cn(
              "h-9 rounded-full px-3 text-xs leading-9",
              !cat ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg",
            )}
          >
            Tất cả
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/algorithms"
              search={{ cat: c.id }}
              className={cn(
                "h-9 rounded-full px-3 text-xs leading-9",
                cat === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted hover:text-fg",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-xs tabular-nums text-muted">
        {list.length} kết quả
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <AlgoCard key={a.slug} algo={a} />
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-16 text-center text-muted">Không khớp. Thử từ khóa khác.</p>
      ) : null}
    </main>
  );
}
