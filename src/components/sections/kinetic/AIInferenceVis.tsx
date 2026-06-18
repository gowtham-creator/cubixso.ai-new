"use client";

// AIInferenceVis — the LIVING inference console in KineticStack's right half.
// Rebuilt (user: "what is that beside it? there's nothing!!"): the old panel
// stretched three small widgets across 520px+ of empty glass and drew its
// neural net near-invisible (dark-on-dark). Now the console is content-sized
// and every layer is unmissable:
//
//   1. Header row    — ● CBX.INFERENCE / v0.1 · status chip (no absolute
//                      positioning, can never collide with the stream)
//   2. TerminalStream— typewriter log of what the model is doing
//   3. NeuralNetCanvas — 4-layer net, bright cobalt nodes/edges, a radial
//                      glow under the firing wave, signal pulses you can
//                      see from across the room
//   4. ResultCard    — a DMN-output chip that MATERIALIZES on every firing
//                      pulse and fades — inference produces a visible artifact
//   5. ConfidenceMeter — converging % bar (scrub-driven during the pin)
//
// Hosted bare inside the Tier-3 LiquidGlass lens (KineticStack). RAF loops
// pause when off-screen via `paused`.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const RESULTS = [
  { label: "DMN TABLE", value: "247 rules → deployable" },
  { label: "AGENT PLAN", value: "4 steps · 2 tools bound" },
  { label: "RETRIEVAL", value: "top-7 · 0.91 recall" },
  { label: "DECISION", value: "auto-approve · 92.4%" },
];

const TARGET_FINAL = 99.74;

interface AIInferenceVisProps {
  /** Hosted inside a LiquidGlass lens — drop own card chrome. */
  bare?: boolean;
  /** Pause RAF loops when the lens is off-screen. */
  paused?: boolean;
  /** Fires on every neural firing pulse (lens ripples + result card). */
  onPulse?: () => void;
  /** Scrub-driven confidence during the KineticStack pin. */
  confidence?: number | null;
}

export function AIInferenceVis({
  bare = false,
  paused = false,
  onPulse,
  confidence = null,
}: AIInferenceVisProps = {}) {
  // Result card cycling — advances on each net pulse.
  const [resultIdx, setResultIdx] = useState(-1);
  const pulseCount = useRef(0);

  const handlePulse = () => {
    pulseCount.current += 1;
    setResultIdx((i) => (i + 1) % RESULTS.length);
    onPulse?.();
  };

  return (
    <div
      data-cursor="text"
      className={
        bare
          ? "relative flex w-full flex-col gap-5"
          : "relative flex w-full flex-col gap-5 rounded-2xl border border-(--color-line) bg-(--color-bg-soft)/40 p-6 backdrop-blur-md"
      }
    >
      {/* 1 · Header row — flexbox, collision-proof */}
      <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 mono text-[9.5px] text-(--color-muted)">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-(--color-accent-2)" />
          CBX.INFERENCE / v0.1
        </span>
        <span className="rounded-full border border-(--color-cobalt)/40 bg-(--color-cobalt)/10 px-2.5 py-0.5 text-(--color-powder)">
          LIVE RUN
        </span>
      </div>

      {/* 2 · Terminal stream */}
      <TerminalStream paused={paused} />

      {/* 3 · Neural net — the centerpiece, bright + fixed height */}
      <NeuralNetCanvas paused={paused} onPulse={handlePulse} />

      {/* 4 · Result card — inference yields a visible artifact */}
      <div className="h-[44px]">
        <AnimatePresence mode="wait">
          {resultIdx >= 0 && (
            <motion.div
              key={resultIdx}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between rounded-lg border border-(--color-cobalt)/30 bg-(--color-cobalt)/8 px-4 py-2.5"
            >
              <span className="mono text-[9.5px] tracking-[0.16em] text-(--color-powder)">
                {RESULTS[resultIdx].label}
              </span>
              <span className="mono text-[10.5px] text-(--color-fg)">
                {RESULTS[resultIdx].value}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5 · Confidence meter */}
      <ConfidenceMeter paused={paused} value={confidence} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal stream — types one status line, holds, keeps a short history
// ─────────────────────────────────────────────────────────────────────────────
function TerminalStream({ paused = false }: { paused?: boolean }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (paused) return;
    const line = STATUS_LINES[lineIdx];
    let i = 0;
    setTyped("");
    const tickType = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(tickType);
        const hold = window.setTimeout(() => {
          setHistory((h) => [line, ...h].slice(0, 2));
          setLineIdx((idx) => (idx + 1) % STATUS_LINES.length);
        }, 1500);
        return () => clearTimeout(hold);
      }
    }, 28);
    return () => clearInterval(tickType);
  }, [lineIdx, paused]);

  return (
    <div className="flex min-h-[64px] flex-col justify-end gap-1.5">
      {history.map((h, i) => (
        <div
          key={`${i}-${h}`}
          className="mono truncate text-[10px] text-(--color-fg-2)"
          style={{ opacity: 0.5 - i * 0.18 }}
        >
          <span className="text-(--color-muted-2)">›</span> {h}
        </div>
      ))}
      <div className="mono flex items-center gap-2 text-[11.5px] text-(--color-fg)">
        <span className="text-(--color-accent-2)">›</span>
        <span className="truncate">{typed}</span>
        <motion.span
          className="inline-block h-[12px] w-[7px] shrink-0 bg-(--color-accent-2)"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Neural net canvas — 4 layers, BRIGHT: cobalt edges, glow backdrop under the
// firing wave, white-hot active nodes. Fixed 260px tall so it owns its space.
// ─────────────────────────────────────────────────────────────────────────────
function NeuralNetCanvas({
  paused = false,
  onPulse,
}: {
  paused?: boolean;
  onPulse?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef(onPulse);
  pulseRef.current = onPulse;

  useEffect(() => {
    if (paused) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layers = [5, 8, 8, 5];
    let W = 0,
      H = 0,
      dpr = 1;
    type Node = { x: number; y: number; layer: number; idx: number };
    let nodes: Node[] = [];
    let edges: { a: Node; b: Node; weight: number }[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      const xPad = 26;
      const yPad = 18;
      const xs = layers.map(
        (_, l) => xPad + (l / (layers.length - 1)) * (W - 2 * xPad),
      );
      layers.forEach((count, l) => {
        for (let i = 0; i < count; i++) {
          const y = yPad + ((H - 2 * yPad) * (i + 0.5)) / count;
          nodes.push({ x: xs[l], y, layer: l, idx: i });
        }
      });
      edges = [];
      for (let l = 0; l < layers.length - 1; l++) {
        const a = nodes.filter((n) => n.layer === l);
        const b = nodes.filter((n) => n.layer === l + 1);
        a.forEach((na) =>
          b.forEach((nb) => {
            edges.push({ a: na, b: nb, weight: 0.15 + Math.random() * 0.85 });
          }),
        );
      }
    }

    let raf = 0;
    const t0 = performance.now();
    let lastCycle = 0;
    const PERIOD = 2400;
    const TRAVEL = 1500;
    function loop() {
      const now = performance.now();
      const cycle = ((now - t0) % PERIOD) / PERIOD;
      const wave = Math.min(1, ((now - t0) % PERIOD) / TRAVEL);
      if (cycle < lastCycle) pulseRef.current?.();
      lastCycle = cycle;

      ctx!.clearRect(0, 0, W, H);

      // Radial glow backdrop riding the wave — the canvas region reads ALIVE
      const gx = wave * W;
      const grad = ctx!.createRadialGradient(gx, H / 2, 0, gx, H / 2, H * 0.85);
      grad.addColorStop(0, "rgba(27, 79, 255, 0.22)");
      grad.addColorStop(1, "rgba(27, 79, 255, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      // edges — visible at rest, cobalt-hot when the wave crosses
      for (const e of edges) {
        const span = (e.b.x - e.a.x) / (W || 1);
        const start = e.a.x / (W || 1);
        const edgeActive = wave > start && wave < start + span + 0.05;
        ctx!.beginPath();
        ctx!.moveTo(e.a.x, e.a.y);
        ctx!.lineTo(e.b.x, e.b.y);
        ctx!.strokeStyle = edgeActive
          ? "rgba(122, 162, 255, 0.9)"
          : `rgba(150, 170, 255, ${0.10 + e.weight * 0.10})`;
        ctx!.lineWidth = edgeActive ? 1.6 : 0.7;
        ctx!.stroke();
      }

      // nodes — cobalt at rest, white-hot + haloed when firing
      for (const n of nodes) {
        const nx = n.x / W;
        const dist = Math.abs(nx - wave);
        const active = dist < 0.09;
        const pulse = active ? 1 - dist / 0.09 : 0;
        const r = 3.5 + pulse * 4.5;
        if (active) {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, r * 3.4, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(74, 123, 255, ${0.28 * pulse})`;
          ctx!.fill();
        }
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = active
          ? "rgba(255, 255, 255, 0.98)"
          : `rgba(175, 210, 250, ${0.55 + Math.sin(now / 700 + n.idx) * 0.12})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(loop);
    }

    resize();
    loop();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [paused]);

  return (
    <div className="relative h-[260px]">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 mono text-[9px] text-(--color-muted)">
        <span>INPUT</span>
        <span>HIDDEN ×2</span>
        <span>OUTPUT</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence meter — converges to a high % then resets; scrub-driven when
// `value` is provided by the KineticStack pin.
// ─────────────────────────────────────────────────────────────────────────────
function ConfidenceMeter({
  paused = false,
  value = null,
}: {
  paused?: boolean;
  value?: number | null;
}) {
  const [val, setVal] = useState(0);
  const driven = value != null;

  useEffect(() => {
    if (paused || driven) return;
    const PERIOD = 5000;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = ((now - start) % PERIOD) / PERIOD;
      const eased =
        t < 0.85 ? 1 - Math.pow(1 - t / 0.85, 3) : 1 - (t - 0.85) / 0.15;
      setVal(Math.max(0, Math.min(1, eased)) * TARGET_FINAL);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, driven]);

  const shown = value ?? val;
  const pct = shown.toFixed(2);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mono text-[10px] text-(--color-muted)">
        <span>CONFIDENCE</span>
        <span className="tabular-nums text-(--color-fg)">{pct}%</span>
      </div>
      <div className="relative h-[3px] overflow-hidden rounded-full bg-(--color-line-2)">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-(--color-accent-2)"
          style={{
            width: `${shown}%`,
            boxShadow: "0 0 14px var(--color-accent-2)",
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
