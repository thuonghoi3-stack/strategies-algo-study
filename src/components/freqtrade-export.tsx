import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import kernelBandPy from "../../public/freqtrade/KernelBand.py?raw";
import { KernelBacktest } from "@/components/kernel-backtest";
import { Button } from "@/components/ui/button";

const FILENAME = "KernelBand.py";

export function FreqtradeExport() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(kernelBandPy);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = kernelBandPy;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function download() {
    const blob = new Blob([kernelBandPy], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="freqtrade" className="mt-12 min-w-0 rounded-xl bg-bg-elevated p-5 shadow-[var(--shadow-border)] sm:p-6">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Freqtrade · IStrategy v3</p>
      <h2 className="mt-2 font-display text-3xl text-fg">KernelBand.py</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
        Port đúng luật playbook: kernel dẹt thì fade dải MAE (RSI xác nhận, thoát về
        đường giữa); kernel dốc thì break continuation, trail HMA. Kalman 1D giữ
        recursion Q/R của Meridian.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "Causal",
            d: "Kernel chỉ lấy s ≤ t. Chart Meridian vẽ hai phía — đẹp hơn, nhưng mép phải repaint. Bot không được làm vậy.",
          },
          {
            t: "Rolling, không global",
            d: "MAE và σ Kalman là cửa sổ lăn. σ cả chuỗi của encyclopedia nhìn tương lai.",
          },
          {
            t: "Hai enter_tag",
            d: "fade_long/short thoát khi giá chạm kernel. trend_* trail HMA. Đừng gộp thành một tín hiệu.",
          },
        ].map((x) => (
          <div key={x.t} className="rounded-lg bg-bg p-4 shadow-[var(--shadow-border)]">
            <p className="font-medium text-fg">{x.t}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
          </div>
        ))}
      </div>

      <KernelBacktest />

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={download}>
          <Download />
          Tải KernelBand.py
        </Button>
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Đã chép" : "Chép file"}
        </Button>
      </div>

      <ol className="mt-6 space-y-2 text-sm text-muted">
        <li className="flex gap-3">
          <span className="font-mono text-xs text-primary">01</span>
          Đặt file vào <span className="font-mono text-fg">user_data/strategies/KernelBand.py</span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-xs text-primary">02</span>
          Config: <span className="font-mono text-fg">strategy = KernelBand</span>, timeframe{" "}
          <span className="font-mono text-fg">1h</span> (đổi 15m nếu scalp; h tăng theo). Futures:{" "}
          <span className="font-mono text-fg">trading_mode = futures</span> để short chạy.
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-xs text-primary">03</span>
          Dry-run trước. Hyperopt <span className="font-mono text-fg">buy sell roi stoploss</span> — đừng
          optimize trên chính đoạn bạn sẽ trade live.
        </li>
      </ol>

      <pre className="mt-6 max-h-[28rem] w-full min-w-0 max-w-full overflow-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted shadow-[var(--shadow-border)]">
        <code>{kernelBandPy}</code>
      </pre>
    </section>
  );
}
