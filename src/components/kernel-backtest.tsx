import { useMemo, useState } from "react";
import { averageRuns, BT_DEFAULTS, BT_SCENARIOS, type BtParams, type BtSummary } from "@/lib/market/kernel-band-bt";
import { generateMarket } from "@/lib/market/generate";
import { formatPct } from "@/lib/market/math";
import type { Scenario } from "@/lib/market/types";
import { cn } from "@/lib/utils";

const SEEDS = [3, 7, 11, 19, 29];
const BARS = 720;

function run(scenario: Scenario, patch: Partial<BtParams>): BtSummary {
  return averageRuns((seed) => generateMarket({ scenario, bars: BARS, seed }), SEEDS, {
    ...BT_DEFAULTS,
    ...patch,
  });
}

function Cell({ n, pct, good }: { n: number; pct?: boolean; good?: boolean | null }) {
  const t = pct ? formatPct(n) : n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  return (
    <td
      className={cn(
        "px-2 py-2 text-right font-mono text-xs tabular-nums",
        good == null ? "text-fg" : good ? "text-up" : "text-down",
      )}
    >
      {t}
    </td>
  );
}

export function KernelBacktest() {
  const [scenario, setScenario] = useState<Scenario>("mixed");

  const rows = useMemo(() => {
    const honest = run(scenario, {});
    const look = run(scenario, { kernel: "twosided" });
    const naive = run(scenario, { fill: "same_close", fee: 0, slip: 0 });
    return [
      { id: "honest", name: "Causal · nến sau · phí 6+2 bps", s: honest, note: "Gần Freqtrade market, fill open nến kế." },
      { id: "look", name: "Trap: kernel hai phía", s: look, note: "Giống chart Meridian / TV. Lookahead." },
      { id: "naive", name: "Trap: cùng nến, không phí", s: naive, note: "Fill close nến tín hiệu. Backtest đẹp giả." },
    ];
  }, [scenario]);

  const honest = rows[0]!.s;
  const look = rows[1]!.s;
  const naive = rows[2]!.s;
  const lookTrap = look.net - honest.net;
  const fillTrap = naive.net - honest.net;

  const checks: { kind: "pass" | "trap" | "warn"; t: string; d: string }[] = [
    {
      kind: "pass",
      t: "Kernel causal",
      d: "s ≤ t. Hai phía trên chart encyclopedia không phải tín hiệu bot.",
    },
    {
      kind: "pass",
      t: "MAE / σ rolling",
      d: "Không lấy σ cả mẫu — cái đó nhìn tương lai.",
    },
    {
      kind: "pass",
      t: "Fill nến sau",
      d: "Tín hiệu đóng nến t, khớp open t+1. Cùng nến là trap.",
    },
    {
      kind: "pass",
      t: "Exit theo tag",
      d: "Fade về kernel, trend trail HMA. File Freqtrade không còn dump fade khi HMA cắt.",
    },
    {
      kind: lookTrap > 0.015 ? "trap" : "warn",
      t: "Lookahead kernel hai phía",
      d:
        lookTrap > 0
          ? `Hai phía hơn honest ${formatPct(lookTrap)} trên kịch bản này (range có thể +20–30 điểm). Edge giả — nến tương lai.`
          : "Trên kịch bản này hai phía không hơn. Trap vẫn có trên chuỗi thật khi kernel ‘quá đẹp’.",
    },
    {
      kind: "warn",
      t: "Chuỗi giả lập ≠ sàn",
      d: "GBM 720 nến × 5 seed. Phí 6+2 bps/lượt. Fade 1h sống/chết vì fee, không vì công thức.",
    },
  ];

  return (
    <div className="mt-8 min-w-0 border-t border-border pt-6">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Audit · backtest trap</p>
      <h2 className="mt-2 font-display text-3xl text-fg">Logic đã soi, trap để mở</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
        Cùng luật KernelBand: fade khi kernel dẹt, break khi dốc. Honest = causal + fill open nến
        sau + phí 0,06% + trượt 0,02%/lượt. Hai hàng dưới là cách backtest gian.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {BT_SCENARIOS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setScenario(x.id)}
            className={cn(
              "h-9 rounded-full px-3 text-xs",
              scenario === x.id ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted hover:text-fg",
            )}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] tracking-wide text-muted uppercase">
              <th className="py-2 pr-2 font-medium">Protocol</th>
              <th className="px-2 py-2 text-right font-medium">Lệnh</th>
              <th className="px-2 py-2 text-right font-medium">Thắng</th>
              <th className="px-2 py-2 text-right font-medium">Net</th>
              <th className="px-2 py-2 text-right font-medium">PF</th>
              <th className="px-2 py-2 text-right font-medium">Max DD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/70">
                <td className="py-2 pr-2">
                  <p className="text-fg">{row.name}</p>
                  <p className="text-xs text-subtle">{row.note}</p>
                </td>
                <Cell n={row.s.trades} />
                <Cell n={row.s.winRate} pct good={row.s.trades ? row.s.winRate >= 0.5 : null} />
                <Cell n={row.s.net} pct good={row.s.net > 0} />
                <Cell n={row.s.pf} good={row.s.pf >= 1} />
                <Cell n={row.s.maxDd} pct good={row.s.maxDd > -0.15} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-xs text-muted">
        Fade {honest.fadeN} · trend {honest.trendN} · giữ TB {honest.avgHold.toFixed(1)} nến · trap
        lookahead {formatPct(lookTrap)} · trap fill {formatPct(fillTrap)}
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.t} className="rounded-lg bg-bg px-4 py-3 shadow-[var(--shadow-border)]">
            <p className="text-sm text-fg">
              <span
                className={
                  c.kind === "pass" ? "text-up" : c.kind === "trap" ? "text-down" : "text-warn"
                }
              >
                {c.kind === "pass" ? "Pass" : c.kind === "trap" ? "Trap" : "Warn"}
              </span>
              <span className="text-subtle"> · </span>
              {c.t}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{c.d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
