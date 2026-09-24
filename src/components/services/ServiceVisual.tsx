// ServiceVisual — the picture beside every service on /services, and in the
// catalogue preview.
//
// Two kinds: a real product screen (shown as a browser window bleeding off the
// frame), or an animated diagram of how the service works. Diagrams are real
// DOM, not a scaled SVG, so labels stay legible on a phone. Motion is CSS only
// (keyframes in globals.css, transform/opacity/stroke-dashoffset), so it costs
// no JavaScript and the global reduced-motion rule stills it.
//
// No "use client": it has no hooks, so both the server-rendered chapters and
// the client catalogue can render it.

import Image from "next/image";
import { LiveFrame } from "@/components/services/LiveFrame";
import type { DiagramKind, Visual } from "@/lib/services";

/* ── shared pieces ─────────────────────────────────────────────────────── */

function Node({
  children,
  accent = false,
  dashed = false,
  pulse,
  className = "",
}: {
  children: React.ReactNode;
  accent?: boolean;
  dashed?: boolean;
  /** stagger index for the sequential highlight */
  pulse?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-(--color-bg)/90 px-3.5 py-2.5 ${
        accent
          ? "border-(--color-accent-2) shadow-[0_0_0_1px_var(--color-accent-2),0_0_36px_-10px_var(--color-accent-2)]"
          : dashed
            ? "border-dashed border-(--color-line-2)"
            : "border-(--color-line-2)"
      } ${className}`}
    >
      {pulse !== undefined && (
        <span
          aria-hidden
          className="svc-pulse pointer-events-none absolute inset-0 rounded-2xl border border-(--color-accent-2)"
          style={{ animationDelay: `${pulse * 1}s` }}
        />
      )}
      {children}
    </div>
  );
}

const T = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[14px] font-semibold leading-tight text-(--color-fg)">{children}</p>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-0.5 text-[12px] leading-snug text-(--color-fg-2)">{children}</p>
);

/** A live arrow: a track with a light pulse running along it into the head.
    `delay` staggers pulses so a pipeline reads as work moving through it. */
function Arrow({ down = false, delay = 0 }: { down?: boolean; delay?: number }) {
  return (
    <span aria-hidden className={`flex shrink-0 items-center ${down ? "h-8 w-4 flex-col" : "h-4 w-10"}`}>
      <span className={`relative overflow-hidden rounded-full bg-(--color-line-2) ${down ? "w-px flex-1" : "h-px flex-1"}`}>
        <span
          className={`absolute left-0 top-0 rounded-full bg-(--color-accent-2) shadow-[0_0_10px_var(--color-accent-2)] ${
            down ? "svc-travel-y h-3 w-px" : "svc-travel h-px w-4"
          }`}
          style={{ animationDelay: `${delay}s` }}
        />
      </span>
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-(--svc-ink) ${down ? "-mt-1 rotate-90" : "-ml-1.5"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </span>
  );
}

/** Vertical on phones, horizontal from sm. */
function Step({ delay = 0 }: { delay?: number }) {
  return (
    <span className="flex justify-center">
      <span className="sm:hidden"><Arrow down delay={delay} /></span>
      <span className="hidden sm:flex"><Arrow delay={delay} /></span>
    </span>
  );
}

/* ── diagrams ──────────────────────────────────────────────────────────── */

function Loop() {
  return (
    <div className="relative mx-auto grid w-full max-w-[460px] grid-cols-3 items-center gap-3">
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-[12%] h-[76%] w-[76%]">
        <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke="var(--color-accent-2)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" className="svc-dash" />
        {/* One lap per 4s, clockwise from Plan: in step with the node pulses. */}
        <circle r="1.8" fill="var(--color-accent-2)" className="svc-smil">
          <animateMotion dur="4s" repeatCount="indefinite" path="M50,6 A46,44 0 0,1 50,94 A46,44 0 0,1 50,6" />
        </circle>
      </svg>
      <span />
      <Node pulse={0}><T>Plan</T><S>Break the goal down</S></Node>
      <span />
      <Node pulse={3}><T>Verify</T><S>Test against the goal</S></Node>
      <div className="text-center">
        <p className="text-[11px] text-(--color-muted)">until</p>
        <p className="text-[13px] font-semibold text-(--svc-ink)">success check</p>
        <p className="text-[11px] text-(--color-muted)">or budget</p>
      </div>
      <Node pulse={1}><T>Act</T><S>Call a tool</S></Node>
      <span />
      <Node pulse={2}><T>Observe</T><S>Read the result</S></Node>
      <span />
    </div>
  );
}

function Harness() {
  return (
    <div className="mx-auto w-full max-w-[520px] rounded-3xl border border-dashed border-(--color-line-2) p-3 sm:p-4">
      <p className="mb-3 text-[12px] text-(--color-fg-2)">
        <span className="font-semibold text-(--color-fg)">Guardrails</span> · sandbox · scoped credentials · approvals
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Node><T>Context</T><S>Retrieval, memory, compaction</S></Node>
        <Node accent className="flex flex-col justify-center text-center"><T>Model</T><S>Routed, swappable</S></Node>
        <Node><T>Tools</T><S>MCP servers, APIs, code</S></Node>
      </div>
      <Node className="mt-2 sm:mt-3"><T>Telemetry and evals</T><S>Traces, cost per task, regression gates</S></Node>
    </div>
  );
}

function Voice() {
  const bars = Array.from({ length: 36 });
  return (
    <div className="mx-auto w-full max-w-[500px]">
      <div aria-hidden className="flex h-20 items-center justify-center gap-[3px]">
        {bars.map((_, i) => (
          <span
            key={i}
            className="svc-bar block w-[4px] origin-center rounded-full bg-(--color-accent-2)"
            style={{ height: "100%", animationDelay: `${(i % 12) * 0.09 + Math.floor(i / 12) * 0.05}s`, opacity: 0.35 + ((i * 7) % 10) / 16 }}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Listen", "Real-time speech"],
          ["Understand", "Intent, not keywords"],
          ["Act", "Book, look up, update"],
          ["Hand off", "To a person, with context"],
        ].map(([t, s], i) => (
          <Node key={t} pulse={i}><T>{t}</T><S>{s}</S></Node>
        ))}
      </div>
    </div>
  );
}

function Flow() {
  return (
    <div className="mx-auto w-full max-w-[540px]">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Node pulse={0} className="sm:flex-1"><T>Intake</T><S>Forms, email, scans</S></Node>
        <Step delay={0.0} />
        <Node pulse={1} className="sm:flex-1"><T>Classify</T><S>What is it?</S></Node>
        <Step delay={0.45} />
        <Node accent className="sm:flex-1"><T>Decide</T><S>Agent, or plain rules</S></Node>
        <Step delay={0.9} />
        <Node pulse={2} className="sm:flex-1"><T>Update</T><S>Your systems</S></Node>
      </div>
      <div className="mt-3 flex items-center gap-2 sm:ml-[52%]">
        <Arrow down />
        <Node dashed className="flex-1"><T>Exceptions</T><S>Only the hard cases reach a person</S></Node>
      </div>
    </div>
  );
}

function Mcp() {
  const servers = ["CRM", "ERP", "Database", "Documents", "Email", "Payments"];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[400px]">
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {servers.map((_, i) => {
          const a = (i / servers.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <g key={i}>
              <line x1="50" y1="50" x2={50 + Math.cos(a) * 38} y2={50 + Math.sin(a) * 38} stroke="var(--color-accent-2)" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1.5 2.5" className="svc-dash" style={{ animationDelay: `${i * 0.2}s` }} />
              <circle r="1.1" fill="var(--color-accent-2)" className="svc-smil">
                <animateMotion dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" path={`M50,50 L${50 + Math.cos(a) * 30},${50 + Math.sin(a) * 30}`} />
              </circle>
            </g>
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Node accent className="text-center"><T>Agent</T><S>one protocol</S></Node>
      </div>
      {servers.map((s, i) => {
        const a = (i / servers.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div key={s} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}>
            <Node pulse={i} className="whitespace-nowrap px-3 py-1.5">
              <p className="text-[12px] font-semibold text-(--color-fg)">{s}</p>
              <p className="text-[10px] text-(--color-muted)">MCP · scoped</p>
            </Node>
          </div>
        );
      })}
    </div>
  );
}

function Evals() {
  const checks = ["Golden set", "Model judges", "Latency budget", "Cost budget"];
  return (
    <div className="mx-auto grid w-full max-w-[520px] items-center gap-3 sm:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
      <Node><T>Change</T><S>Prompt, model or tool</S></Node>
      <Step delay={0.0} />
      <Node>
        <T>Eval suite</T>
        <ul className="mt-2 space-y-1.5">
          {checks.map((c, i) => (
            <li key={c} className="flex items-center gap-2 text-[12px] text-(--color-fg-2)">
              <span className="svc-pulse-dot h-2 w-2 rounded-full bg-(--color-accent-2)" style={{ animationDelay: `${i * 0.5}s` }} aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </Node>
      <Step delay={0.45} />
      <div className="grid gap-2">
        <Node accent><T>Ship</T><S>All checks pass</S></Node>
        <Node dashed><T>Blocked</T><S>Regression found</S></Node>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="mx-auto grid w-full max-w-[540px] items-center gap-3 sm:grid-cols-[1fr_auto_auto_auto_1.1fr]">
      <div className="grid gap-2">
        {["Classify an email", "Draft a contract", "Summarise a call"].map((r) => (
          <div key={r} className="rounded-xl border border-(--color-line) px-3 py-1.5 text-[12px] text-(--color-fg-2)">{r}</div>
        ))}
      </div>
      <Step delay={0.9} />
      <Node accent className="text-center"><T>Router</T><S>cost · latency · task</S></Node>
      <Step delay={0.0} />
      <div className="grid gap-2">
        <Node pulse={0}><T>Small, fast</T><S>Routine tasks</S></Node>
        <Node pulse={1}><T>Large, reasoning</T><S>Hard problems</S></Node>
        <Node pulse={2}><T>Self-hosted</T><S>Private data</S></Node>
      </div>
    </div>
  );
}

const DIAGRAMS: Record<DiagramKind, () => React.JSX.Element> = {
  loop: Loop,
  harness: Harness,
  voice: Voice,
  flow: Flow,
  mcp: Mcp,
  evals: Evals,
  router: Router,
};

/* ── frame ─────────────────────────────────────────────────────────────── */

export function ServiceVisual({ visual, priority = false, compact = false }: { visual: Visual; priority?: boolean; compact?: boolean }) {
  return (
    <LiveFrame
      className={`relative isolate overflow-hidden rounded-[28px] border border-(--color-line) bg-(--color-bg-soft) ${
        compact ? "min-h-[300px]" : "min-h-[340px] lg:min-h-[480px]"
      }`}
    >
      {/* Light lives in the void (README principle 3): a cobalt glow and a faint
          dot grid behind the content, never a fill on a surface. */}
      {/* Three soft light pools drifting on long, out-of-phase loops, so the
          frame breathes without ever repeating visibly. Transform-only motion. */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <span className="svc-drift-a absolute -left-[22%] -top-[35%] h-[85%] w-[75%] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_38%,transparent),transparent)]" />
        <span className="svc-drift-b absolute -right-[28%] top-[18%] h-[80%] w-[70%] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent-2)_26%,transparent),transparent)]" />
        <span className="svc-drift-c absolute -bottom-[40%] left-[12%] h-[75%] w-[75%] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-powder)_20%,transparent),transparent)]" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(var(--color-line-2)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(80%_80%_at_50%_40%,#000,transparent)]" />

      {visual.kind === "image" ? (
        <div className="absolute inset-0 pl-6 pt-10 sm:pl-10 sm:pt-12">
          <div className="h-full overflow-hidden rounded-tl-2xl border-l border-t border-(--color-line-2) bg-(--color-bg) shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 border-b border-(--color-line) px-4 py-2.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-(--color-line-2)" />
              <span className="h-2.5 w-2.5 rounded-full bg-(--color-line-2)" />
              <span className="h-2.5 w-2.5 rounded-full bg-(--color-line-2)" />
            </div>
            <div className="relative h-full">
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover object-left-top"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full min-h-[inherit] items-center justify-center p-6 sm:p-10">
          {(() => {
            const D = DIAGRAMS[visual.diagram];
            return <D />;
          })()}
        </div>
      )}
    </LiveFrame>
  );
}
