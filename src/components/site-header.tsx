import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/algorithms" as const, label: "Thư viện" },
  { to: "/strategies" as const, label: "Chiến thuật" },
  { to: "/lab" as const, label: "Phòng thí nghiệm" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors duration-150",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Button asChild size="sm" className="ml-2">
            <Link to="/lab">Chạy thuật toán</Link>
          </Button>
        </nav>
        <button
          type="button"
          className="relative flex size-11 items-center justify-center rounded-md md:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-md px-3 text-sm text-fg hover:bg-surface-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
