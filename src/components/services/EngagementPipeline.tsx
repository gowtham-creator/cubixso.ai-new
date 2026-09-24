// How an engagement runs, as a live pipeline. A light travels the track from
// Scope to Hand over and each step lights up as it arrives; each step carries a
// small scene of what the client actually gets at that stage (criteria agreed,
// a slice running on their data, checks passing, the code landing in their
// repository). CSS only (opacity/transform), so it costs nothing on the main
// thread; reduced motion shows every scene in its finished state.

import { ENGAGEMENT } from "@/lib/services";

const OUTPUT = ["Success criteria and eval set", "A working slice on your data", "A production-ready system", "You own the system"];

function Tick({ delay }: { delay: number }) {
  return (
    <span className="relative grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border border-(--color-line-2)">
      <svg viewBox="0 0 12 12" className="eng-tick h-2.5 w-2.5 text-(--color-accent-2)" style={{ animationDelay: `${delay}s` }} aria-hidden>
        <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ScopeScene() {
  return (
    <ul className="space-y-2">
      {["Success metric", "Your data", "Risks", "Eval set"].map((t, i) => (
        <li key={t} className="flex items-center gap-2.5 text-[12px] text-(--color-fg-2)">
          <Tick delay={0.4 + i * 0.7} />
          {t}
        </li>
      ))}
    </ul>
  );
}

function PrototypeScene() {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] text-(--color-fg-2)">
        <span className="svc-pulse-dot h-1.5 w-1.5 rounded-full bg-(--color-accent-2)" />
        Running on your data
      </p>
      <div className="mt-3 space-y-2">
        {[92, 64, 78].map((w, i) => (
          <div key={i} className="h-2 overflow-hidden rounded-full bg-(--color-surface)">
            <div className="eng-grow h-full rounded-full bg-(--color-accent-2)" style={{ width: `${w}%`, animationDelay: `${i * 0.5}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HardenScene() {
  return (
    <ul className="space-y-1.5">
      {["Accuracy evals", "Latency and cost", "Security review", "Failure recovery"].map((t, i) => (
        <li key={t} className="flex items-center justify-between gap-2 text-[12px] text-(--color-fg-2)">
          {t}
          <span className="relative mono text-[10px]">
            <span className="text-(--color-muted)">···</span>
            <span className="eng-tick absolute inset-0 grid place-items-center rounded bg-[color-mix(in_oklab,var(--color-accent-2)_18%,var(--color-bg))] px-1 text-(--color-accent-2)" style={{ animationDelay: `${0.4 + i * 0.7}s` }}>
              pass
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function HandoverScene() {
  return (
    <div>
      <p className="mono text-[11px] text-(--color-fg-2)">your-org / repository</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {["src/", "evals/", "runbook.md", "training"].map((t, i) => (
          <span key={t} className="eng-in mono rounded-md border border-(--color-line-2) bg-(--color-surface) px-2 py-1 text-[11px] text-(--color-fg)" style={{ animationDelay: `${0.4 + i * 0.7}s` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

const SCENES = [ScopeScene, PrototypeScene, HardenScene, HandoverScene];

export function EngagementPipeline() {
  return (
    <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {/* The track, with a light that travels it once per cycle. Horizontal on
          wide screens, down the left edge on phones. */}
      <span aria-hidden className="absolute left-0 right-0 top-[30px] hidden h-px overflow-hidden bg-(--color-line-2) lg:block">
        <span className="eng-flow-x absolute inset-0">
          <span className="absolute left-0 top-0 h-px w-[14%] -translate-x-full bg-[linear-gradient(90deg,transparent,var(--color-accent-2))]" />
        </span>
      </span>
      <span aria-hidden className="absolute bottom-0 left-[30px] top-0 w-px overflow-hidden bg-(--color-line-2) sm:hidden">
        <span className="eng-flow-y absolute inset-0">
          <span className="absolute left-0 top-0 h-[14%] w-px -translate-y-full bg-[linear-gradient(180deg,transparent,var(--color-accent-2))]" />
        </span>
      </span>

      {ENGAGEMENT.map((e, i) => {
        const Scene = SCENES[i];
        // Each node lights as the travelling light reaches its column.
        const stage = { animationDelay: `${1.5 + i * 3}s` };
        return (
          <li key={e.step} className="relative pl-[84px] sm:pl-0">
            <span className="absolute left-0 top-0 z-10 grid h-[60px] w-[60px] place-items-center rounded-full border border-(--color-line-2) bg-(--color-bg) mono text-[15px] text-(--color-accent-2) sm:relative">
              <span aria-hidden className="eng-stage absolute -inset-px rounded-full border border-(--color-accent-2) shadow-[0_0_24px_-2px_var(--color-accent-2)]" style={stage} />
              {e.step}
            </span>
            <h3 className="font-display text-[24px] tracking-[-0.02em] text-(--color-fg) sm:mt-6">{e.name}</h3>
            <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-(--color-fg-2)">{e.body}</p>

            <div className="relative mt-5 overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg) p-4">
              <span aria-hidden className="eng-stage absolute inset-0 rounded-2xl bg-[color-mix(in_oklab,var(--color-accent-2)_6%,transparent)]" style={stage} />
              <div className="relative min-h-[96px]">
                <Scene />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-(--color-fg)">
              <span aria-hidden className="text-(--color-accent-2)">→</span>
              {OUTPUT[i]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
