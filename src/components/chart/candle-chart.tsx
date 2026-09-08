import { useEffect, useRef, useState } from "react";
import type { AlgoResult, Bar, Overlay } from "@/lib/market/types";

type Props = {
  bars: Bar[];
  result?: AlgoResult;
  height?: number;
  className?: string;
};

function token(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

function niceStep(span: number, ticks: number) {
  const raw = span / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return step * pow;
}

export function CandleChart({ bars, result, height = 440, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || bars.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (hoverI: number | null, mx: number, my: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const bg = token(wrap, "--color-bg-elevated", "#111318");
      const fg = token(wrap, "--color-fg", "#ecece8");
      const muted = token(wrap, "--color-muted", "#8a8e96");
      const border = token(wrap, "--color-border", "rgba(236,236,232,0.12)");
      const up = token(wrap, "--color-up", "#6a9e7c");
      const down = token(wrap, "--color-down", "#c4685e");
      const primary = token(wrap, "--color-primary", "#a8b8c8");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const oscCount = Math.min(result?.oscillators.length ?? 0, 2);
      const padL = 12;
      const padR = 56;
      const padT = 16;
      const padB = 18;
      const gap = 8;
      const oscH = oscCount > 0 ? 72 : 0;
      const volH = 36;
      const priceH = h - padT - padB - volH - oscCount * (oscH + gap) - gap;
      const priceTop = padT;
      const volTop = priceTop + priceH + gap;
      const oscTop0 = volTop + volH + gap;
      const plotW = w - padL - padR;

      const chartBars = result?.chartBars ?? bars;
      const n = chartBars.length;
      const slot = plotW / n;
      const bodyW = Math.max(1.2, Math.min(9, slot * 0.62));

      let lo = Infinity;
      let hi = -Infinity;
      const consider = (v: number | null | undefined) => {
        if (v == null || !Number.isFinite(v)) return;
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      };
      for (const b of chartBars) {
        consider(b.h);
        consider(b.l);
      }
      for (const ov of result?.overlays ?? []) {
        if (ov.kind === "line" || ov.kind === "dots") ov.values.forEach(consider);
        if (ov.kind === "band") {
          ov.upper.forEach(consider);
          ov.lower.forEach(consider);
        }
        if (ov.kind === "cloud") {
          ov.a.forEach(consider);
          ov.b.forEach(consider);
        }
        if (ov.kind === "zigzag") ov.points.forEach((p) => consider(p.price));
        if (ov.kind === "levels") ov.levels.forEach((l) => consider(l.price));
      }
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi === lo) {
        lo = chartBars[0]!.l * 0.98;
        hi = chartBars[0]!.h * 1.02;
      }
      const pad = (hi - lo) * 0.08;
      lo -= pad;
      hi += pad;
      const yPrice = (v: number) => priceTop + ((hi - v) / (hi - lo)) * priceH;
      const xAt = (i: number) => padL + (i + 0.5) * slot;

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      const step = niceStep(hi - lo, 5);
      const startTick = Math.ceil(lo / step) * step;
      ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      for (let t = startTick; t <= hi; t += step) {
        const y = yPrice(t);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.fillText(t.toFixed(t >= 100 ? 1 : 2), w - padR + 8, y);
      }

      const overlays = result?.overlays ?? [];
      for (const ov of overlays) {
        if (ov.kind === "cloud") drawCloud(ctx, ov, xAt, yPrice, n);
        if (ov.kind === "band") drawBand(ctx, ov, xAt, yPrice, n);
      }
      for (const ov of overlays) {
        if (ov.kind === "levels") {
          for (const lv of ov.levels) {
            const y = yPrice(lv.price);
            ctx.strokeStyle = lv.color;
            ctx.globalAlpha = 0.7;
            ctx.lineWidth = 1;
            ctx.setLineDash(lv.dashed ? [4, 4] : []);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(w - padR, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            ctx.fillStyle = lv.color;
            ctx.textAlign = "left";
            ctx.fillText(lv.label, padL + 4, y - 7);
          }
        }
      }

      for (let i = 0; i < n; i++) {
        const b = chartBars[i]!;
        const x = xAt(i);
        const bull = b.c >= b.o;
        ctx.strokeStyle = bull ? up : down;
        ctx.fillStyle = bull ? up : down;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yPrice(b.h));
        ctx.lineTo(x, yPrice(b.l));
        ctx.stroke();
        const y1 = yPrice(Math.max(b.o, b.c));
        const y2 = yPrice(Math.min(b.o, b.c));
        const bh = Math.max(1, y2 - y1);
        ctx.globalAlpha = 0.92;
        ctx.fillRect(x - bodyW / 2, y1, bodyW, bh);
        ctx.globalAlpha = 1;
      }

      for (const ov of overlays) {
        if (ov.kind === "line") drawLine(ctx, ov.values, ov.color, xAt, yPrice, ov.width ?? 1.4, ov.dashed);
        if (ov.kind === "dots") {
          for (let i = 0; i < ov.values.length; i++) {
            const v = ov.values[i];
            if (v == null) continue;
            ctx.fillStyle = ov.colors[i] ?? primary;
            ctx.beginPath();
            ctx.arc(xAt(i), yPrice(v), ov.size ?? 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (ov.kind === "zigzag") {
          ctx.strokeStyle = ov.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ov.points.forEach((p, idx) => {
            const x = xAt(p.i);
            const y = yPrice(p.price);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      }

      for (const ov of overlays) {
        if (ov.kind !== "markers") continue;
        for (const m of ov.items) {
          const x = xAt(m.i);
          const y = yPrice(m.price);
          ctx.fillStyle = m.side === "buy" ? up : down;
          ctx.beginPath();
          if (m.side === "buy") {
            ctx.moveTo(x, y + 10);
            ctx.lineTo(x - 5, y + 18);
            ctx.lineTo(x + 5, y + 18);
          } else {
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x - 5, y - 18);
            ctx.lineTo(x + 5, y - 18);
          }
          ctx.closePath();
          ctx.fill();
        }
      }

      const maxV = Math.max(...chartBars.map((b) => b.v), 1);
      for (let i = 0; i < n; i++) {
        const b = chartBars[i]!;
        const vh = (b.v / maxV) * (volH - 4);
        ctx.fillStyle = b.c >= b.o ? up : down;
        ctx.globalAlpha = 0.45;
        ctx.fillRect(xAt(i) - bodyW / 2, volTop + volH - vh, bodyW, vh);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      ctx.fillText("Vol", w - padR + 8, volTop + 8);

      result?.oscillators.slice(0, 2).forEach((osc, oi) => {
        const top = oscTop0 + oi * (oscH + gap);
        let omin = Infinity;
        let omax = -Infinity;
        for (const s of osc.series) {
          for (const v of s.values) {
            if (v == null || !Number.isFinite(v)) continue;
            omin = Math.min(omin, v);
            omax = Math.max(omax, v);
          }
        }
        for (const g of osc.guides ?? []) {
          omin = Math.min(omin, g);
          omax = Math.max(omax, g);
        }
        if (osc.zero != null) {
          omin = Math.min(omin, osc.zero);
          omax = Math.max(omax, osc.zero);
        }
        if (!Number.isFinite(omin) || !Number.isFinite(omax) || omax === omin) {
          omin = osc.min;
          omax = osc.max;
        } else {
          const padO = (omax - omin) * 0.12 || 1;
          omin -= padO;
          omax += padO;
        }
        const yO = (v: number) => top + ((omax - v) / (omax - omin)) * oscH;
        ctx.strokeStyle = border;
        ctx.beginPath();
        ctx.moveTo(padL, top);
        ctx.lineTo(w - padR, top);
        ctx.stroke();
        for (const g of osc.guides ?? []) {
          ctx.strokeStyle = border;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(padL, yO(g));
          ctx.lineTo(w - padR, yO(g));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (osc.zero != null) {
          ctx.strokeStyle = muted;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.moveTo(padL, yO(osc.zero));
          ctx.lineTo(w - padR, yO(osc.zero));
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        for (const s of osc.series) {
          if (s.type === "hist") {
            for (let i = 0; i < s.values.length; i++) {
              const v = s.values[i];
              if (v == null) continue;
              const y0 = yO(osc.zero ?? 0);
              const y1 = yO(v);
              ctx.fillStyle = s.histColors?.[i] ?? s.color;
              ctx.globalAlpha = 0.75;
              ctx.fillRect(xAt(i) - bodyW / 2, Math.min(y0, y1), bodyW, Math.max(1, Math.abs(y1 - y0)));
              ctx.globalAlpha = 1;
            }
          } else {
            drawLine(ctx, s.values, s.color, xAt, yO, 1.3, false);
          }
        }
        ctx.fillStyle = muted;
        ctx.textAlign = "left";
        ctx.fillText(osc.label, w - padR + 8, top + 10);
      });

      if (hoverI != null && hoverI >= 0 && hoverI < n) {
        const x = xAt(hoverI);
        ctx.strokeStyle = primary;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, h - padB);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(padL, my);
        ctx.lineTo(w - padR, my);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const b = chartBars[hoverI]!;
        const label = `${fmt(b.o)}  H ${fmt(b.h)}  L ${fmt(b.l)}  C ${fmt(b.c)}`;
        ctx.font = "11px 'IBM Plex Mono', ui-monospace, monospace";
        const tw = ctx.measureText(label).width;
        const bx = Math.min(Math.max(padL, mx - tw / 2 - 8), w - padR - tw - 16);
        ctx.fillStyle = bg;
        ctx.fillRect(bx, 4, tw + 16, 18);
        ctx.fillStyle = fg;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, bx + 8, 13);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const n = (result?.chartBars ?? bars).length;
      const padL = 12;
      const padR = 56;
      const plotW = rect.width - padL - padR;
      const i = Math.max(0, Math.min(n - 1, Math.floor(((x - padL) / plotW) * n)));
      setHover({ i, x, y });
      draw(i, x, y);
    };
    const onLeave = () => {
      setHover(null);
      draw(null, 0, 0);
    };

    draw(hover?.i ?? null, hover?.x ?? 0, hover?.y ?? 0);
    const ro = new ResizeObserver(() => draw(hover?.i ?? null, hover?.x ?? 0, hover?.y ?? 0));
    ro.observe(wrap);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
    // hover is applied via event handlers; bars/result/height are the data deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bars, result, height]);

  const active = hover ? (result?.chartBars ?? bars)[hover.i] : null;
  const chg =
    active && hover && hover.i > 0
      ? active.c - (result?.chartBars ?? bars)[hover.i - 1]!.c
      : null;

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="block w-full touch-none" />
      {active ? (
        <p className="sr-only">
          Nến {hover?.i}: đóng {active.c}
          {chg != null ? `, đổi ${chg.toFixed(2)}` : ""}
        </p>
      ) : null}
    </div>
  );
}

function fmt(n: number) {
  return n.toFixed(n >= 100 ? 2 : 3);
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  values: Array<number | null>,
  color: string,
  xAt: (i: number) => number,
  yAt: (v: number) => number,
  width: number,
  dashed?: boolean,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dashed ? [5, 4] : []);
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v == null) {
      started = false;
      continue;
    }
    const x = xAt(i);
    const y = yAt(v);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBand(
  ctx: CanvasRenderingContext2D,
  ov: Extract<Overlay, { kind: "band" }>,
  xAt: (i: number) => number,
  yAt: (v: number) => number,
  n: number,
) {
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < n; i++) {
    const u = ov.upper[i];
    if (u == null) continue;
    const x = xAt(i);
    const y = yAt(u);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else ctx.lineTo(x, y);
  }
  for (let i = n - 1; i >= 0; i--) {
    const l = ov.lower[i];
    if (l == null) continue;
    ctx.lineTo(xAt(i), yAt(l));
  }
  ctx.closePath();
  ctx.fillStyle = ov.fill;
  ctx.fill();
  drawLine(ctx, ov.upper, ov.upperColor, xAt, yAt, 1, true);
  drawLine(ctx, ov.lower, ov.lowerColor, xAt, yAt, 1, true);
  if (ov.mid) drawLine(ctx, ov.mid, ov.upperColor, xAt, yAt, 1.4, false);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  ov: Extract<Overlay, { kind: "cloud" }>,
  xAt: (i: number) => number,
  yAt: (v: number) => number,
  n: number,
) {
  for (let i = 1; i < n; i++) {
    const a0 = ov.a[i - 1];
    const a1 = ov.a[i];
    const b0 = ov.b[i - 1];
    const b1 = ov.b[i];
    if (a0 == null || a1 == null || b0 == null || b1 == null) continue;
    ctx.beginPath();
    ctx.moveTo(xAt(i - 1), yAt(a0));
    ctx.lineTo(xAt(i), yAt(a1));
    ctx.lineTo(xAt(i), yAt(b1));
    ctx.lineTo(xAt(i - 1), yAt(b0));
    ctx.closePath();
    ctx.fillStyle = a1 >= b1 ? ov.bull : ov.bear;
    ctx.fill();
  }
}
