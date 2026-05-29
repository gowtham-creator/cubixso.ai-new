"use client";

// AIInferenceVis — temporary "the AI is thinking right now" panel that
// sits in the empty right half of the KineticStack section.
//
// Three layers, top → bottom:
//   1. TerminalStream  — typewriter status lines that rotate every ~3s
//   2. NeuralNetCanvas — a procedural 3-layer net with a firing wave
//                       that propagates left→right every ~2.2s. Nodes
//                       pulse, active edges glow cobalt.
//   3. ConfidenceMeter — a horizontal bar that ticks up to a high number
//                       (always different) then resets — feels like a
//                       live ML model converging.
//
// Designed to read as "wow, the AI is actually decomposing the problem
// right now" rather than a static infographic. Mobile-hidden via the
// caller (KineticStack adds md:block).

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STATUS_LINES = [
  "DECOMPOSING corporate ruleset · 247 nodes",
  "SCANNING semantic dependencies · 3 layers",
  "EMBEDDING legacy domain · 1024 dim",
  "INFERRING decision tree · 92.4% reached",
  "SYNTHESIZING DMN output · ready",
  "ROUTING agent · ENTERPRISE/INSURANCE",
  "VALIDATING constraints · all green",
  "RANKING candidates · top-k = 7",
];

const TARGET_FINAL = 99.74;

export function AIInferenceVis() {
  return (
    <div
      data-cursor="text"
      className="relative w-full h-full min-h-[520px] flex flex-col gap-6 justify-between p-6 rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 backdrop-blur-md"
    >
      {/* Top — terminal stream */}
      <TerminalStream />

      {/* Mid — neural net */}
      <NeuralNetCanvas />

      {/* Bottom — confidence meter */}
      <ConfidenceMeter />

      {/* Corner runner — system label */}
      <div className="absolute top-3 right-4 flex items-center gap-2 mono text-[9px] text-(--color-muted)">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--color-accent-2) animate-pulse" />
        <span>CBX.INFERENCE / v0.1</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal stream — types one status line, holds, rotates to the next
// ─────────────────────────────────────────────────────────────────────────────
function TerminalStream() {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const line = STATUS_LINES[lineIdx];
    let i = 0;
    setTyped("");
    const tickType = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(tickType);
        const hold = window.setTimeout(() => {
          setHistory((h) => [line, ...h].slice(0, 3));
          setLineIdx((idx) => (idx + 1) % STATUS_LINES.length);
        }, 1500);
        return () => clearTimeout(hold);
      }
    }, 28);
    return () => clearInterval(tickType);
  }, [lineIdx]);

  return (
    <div className="flex flex-col gap-1.5">
      {history.map((h, i) => (
        <motion.div
          key={`${i}-${h}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.45 - i * 0.12, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mono text-[10.5px] text-(--color-fg-2)"
        >
          <span className="text-(--color-muted-2)">›</span> {h}
        </motion.div>
      ))}
      <div className="mono text-[11.5px] text-(--color-fg) flex items-center gap-2">
        <span className="text-(--color-accent-2)">›</span>
        <span>{typed}</span>
        <motion.span
          className="inline-block w-[7px] h-[12px] bg-(--color-accent-2)"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Neural network canvas — 3 layers, firing wave propagates left→right
// ─────────────────────────────────────────────────────────────────────────────
function NeuralNetCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layers = [6, 10, 6]; // node counts per layer
    let W = 0, H = 0, dpr = 1;
    type Node = { x: number; y: number; layer: number; idx: number };
    let nodes: Node[] = [];
    let edges: { a: Node; b: Node; weight: number }[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas!.width = W * dpr; canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      const xPad = 28;
      const xs = layers.map((_, l) =>
        xPad + (l / (layers.length - 1)) * (W - 2 * xPad));
      layers.forEach((count, l) => {
        for (let i = 0; i < count; i++) {
          const y = (H * (i + 0.5)) / count;
          nodes.push({ x: xs[l], y, layer: l, idx: i });
        }
      });
      edges = [];
      for (let l = 0; l < layers.length - 1; l++) {
        const a = nodes.filter((n) => n.layer === l);
        const b = nodes.filter((n) => n.layer === l + 1);
        a.forEach((na) => b.forEach((nb) => {
          edges.push({ a: na, b: nb, weight: 0.15 + Math.random() * 0.85 });
        }));
      }
    }

    let raf = 0;
    let t0 = performance.now();
    const PERIOD = 2200;        // ms between fires
    const TRAVEL = 1400;        // ms for the wave to cross
    function loop() {
      const now = performance.now();
      const cycle = ((now - t0) % PERIOD) / PERIOD;        // 0..1
      const wave = Math.min(1, ((now - t0) % PERIOD) / TRAVEL);

      ctx!.clearRect(0, 0, W, H);

      // edges
      for (const e of edges) {
        const span = (e.b.x - e.a.x) / (W || 1);
        const start = (e.a.x) / (W || 1);
        const edgeActive = wave > start && wave < start + span + 0.05;
        const baseAlpha = 0.05 + e.weight * 0.10;
        const fireAlpha = edgeActive ? 0.85 : 0;
        ctx!.beginPath();
        ctx!.moveTo(e.a.x, e.a.y);
        ctx!.lineTo(e.b.x, e.b.y);
        ctx!.strokeStyle = edgeActive
          ? `rgba(74, 123, 255, ${fireAlpha})`
          : `rgba(255, 255, 255, ${baseAlpha})`;
        ctx!.lineWidth = edgeActive ? 1.5 : 0.5;
        ctx!.stroke();
      }

      // nodes
      for (const n of nodes) {
        const nx = n.x / W;
        const dist = Math.abs(nx - wave);
        const active = dist < 0.08;
        const pulse = active ? 1 - dist / 0.08 : 0;
        const r = 3 + pulse * 4;
        // halo when active
        if (active) {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 3.2, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(74, 123, 255, ${0.20 * pulse})`;
          ctx!.fill();
        }
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = active
          ? `rgba(255, 255, 255, ${0.95})`
          : `rgba(255, 255, 255, ${0.32 + Math.sin(now / 700 + n.idx) * 0.05})`;
        ctx!.fill();
      }

      // unused but keep for future scroll-coupled gain
      void cycle;

      raf = requestAnimationFrame(loop);
    }

    resize();
    loop();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex-1 min-h-[200px]">
      <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />
      {/* Layer labels */}
      <div className="absolute inset-x-0 -bottom-2 flex justify-between px-7 mono text-[9px] text-(--color-muted-2)">
        <span>INPUT</span>
        <span>HIDDEN</span>
        <span>OUTPUT</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence meter — counts up to a high % then resets
// ─────────────────────────────────────────────────────────────────────────────
function ConfidenceMeter() {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const PERIOD = 5000;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = ((now - start) % PERIOD) / PERIOD;
      const eased = t < 0.85
        ? 1 - Math.pow(1 - t / 0.85, 3)              // ease-out to ~1 at 85%
        : 1 - (t - 0.85) / 0.15;                     // sharp dip back to 0
      setVal(Math.max(0, Math.min(1, eased)) * TARGET_FINAL);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = val.toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mono text-[10px] text-(--color-muted)">
        <span>CONFIDENCE</span>
        <span className="text-(--color-fg) tabular-nums">{pct}%</span>
      </div>
      <div className="relative h-px bg-(--color-line-2) overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-(--color-accent-2)"
          style={{
            width: `${val}%`,
            boxShadow: "0 0 12px var(--color-accent-2)",
            transition: "width 50ms linear",
          }}
        />
      </div>
      <div className="flex items-center justify-between mono text-[9px] text-(--color-muted-2)">
        <span>MODEL · cbx-decompose-v2</span>
        <span>LATENCY · 12ms</span>
      </div>
    </div>
  );
}
