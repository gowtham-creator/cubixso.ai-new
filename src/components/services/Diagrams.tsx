// Field-guide diagrams for /services.
//
// Built in HTML/CSS, not as one scaled SVG. An SVG with a fixed viewBox shrinks
// its text along with everything else: 12px labels drawn for a desktop width
// fall to ~7px on a phone. Real DOM text keeps its size and reflows, so each
// diagram re-lays itself for the viewport (a row on desktop, a stack on phones)
// and stays readable, selectable and translatable. Theme comes entirely from
// the --color-* tokens, so light and dark need nothing extra.

import type { DiagramKind } from "@/lib/services";

function Arrow({ dir = "right" }: { dir?: "right" | "down" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 text-(--color-muted-2) ${dir === "down" ? "rotate-90" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

function Frame({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-xl border border-(--color-line) p-[clamp(18px,2.4vw,32px)]">
      {children}
      <figcaption className="mt-6 text-[13px] leading-relaxed text-(--color-muted)">{caption}</figcaption>
    </figure>
  );
}

/* ── A.02 · The agent loop ───────────────────────────────────────────── */

const LOOP = [
  { k: "Plan", d: "Break the goal into steps" },
  { k: "Act", d: "Call a tool, or produce output" },
  { k: "Observe", d: "Read what actually happened" },
  { k: "Verify", d: "Test it against the success check" },
];
const CONTROLS = ["Step budget", "Cost budget", "Stop condition", "Human checkpoint"];

function AgentLoop() {
  return (
    <Frame caption="The loop repeats until the success check passes or a budget runs out. Every step is traced; irreversible actions wait for a person.">
      <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3">
        {LOOP.map((s, i) => (
          <li key={s.k} className="flex flex-col items-stretch gap-2 md:flex-1 md:flex-row md:items-center md:gap-3">
            <div
              className={`flex-1 rounded-lg border px-4 py-3 ${
                i === LOOP.length - 1
                  ? "border-(--color-accent-2)"
                  : "border-(--color-line-2)"
              }`}
            >
              <p className="text-[15px] font-semibold text-(--color-fg)">{s.k}</p>
              <p className="mt-1 text-[13px] leading-snug text-(--color-fg-2)">{s.d}</p>
            </div>
            {i < LOOP.length - 1 && (
              <span className="flex justify-center">
                <span className="md:hidden"><Arrow dir="down" /></span>
                <span className="hidden md:block"><Arrow /></span>
              </span>
            )}
          </li>
        ))}
      </ol>

      {/* The return edge: Verify back to Plan. */}
      <div className="mt-3 flex items-center gap-3 text-[13px] text-(--color-muted)">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-(--color-accent-2)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
        </svg>
        <span>Not yet? Back to Plan, with what was learned.</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CONTROLS.map((c) => (
          <span key={c} className="rounded-full border border-(--color-line-2) px-3 py-1 text-[12px] text-(--color-fg-2)">
            {c}
          </span>
        ))}
      </div>
    </Frame>
  );
}

/* ── A.01 · Anatomy of a harness ─────────────────────────────────────── */

function Block({ title, items, strong = false }: { title: string; items: string[]; strong?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-4 ${
        strong ? "border-(--color-accent-2)" : "border-(--color-line-2)"
      }`}
    >
      <p className={`text-[15px] font-semibold ${strong ? "text-(--color-accent-2)" : "text-(--color-fg)"}`}>{title}</p>
      <ul className="mt-2 space-y-1 text-[13px] leading-snug text-(--color-fg-2)">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function HarnessAnatomy() {
  return (
    <Frame caption="The model sits inside the harness, never outside it. Everything it reads arrives through context; everything it does goes through a tool, under a permission, into a trace.">
      <div className="rounded-lg border border-dashed border-(--color-line-2) p-3 sm:p-4">
        <p className="mb-3 text-[13px] text-(--color-muted)">
          <span className="font-semibold text-(--color-fg)">Guardrails</span>: sandboxed execution, scoped credentials, approval gates
        </p>
        <div className="grid gap-3 md:grid-cols-[1fr_0.8fr_1fr] md:items-stretch">
          <Block title="Context" items={["Retrieval over your data", "Working memory", "Compaction for long runs"]} />
          <div className="flex flex-col justify-center">
            <Block title="Model" items={["Routed per task", "Swappable without a rewrite"]} strong />
          </div>
          <Block title="Tools" items={["MCP servers", "Internal APIs", "Code execution"]} />
        </div>
        <div className="mt-3 rounded-lg border border-(--color-line-2) px-4 py-3 text-[13px] text-(--color-fg-2)">
          <span className="font-semibold text-(--color-fg)">Telemetry and evals</span>: traces, cost per task, regression gates on every change
        </div>
      </div>
    </Frame>
  );
}

/* ── B.03 · Story pipeline ───────────────────────────────────────────── */

const STORY = [
  { k: "Brief", d: "Audience, tone, length" },
  { k: "Script", d: "In the language it will be watched in" },
  { k: "Storyboard", d: "Frames drawn from the script" },
  { k: "Shot list", d: "Camera, cast and style per shot" },
  { k: "Generation", d: "Each shot routed to a video model" },
  { k: "Review", d: "Approve, reject or regenerate" },
];

function StoryPipeline() {
  return (
    <Frame caption="Character and style references travel with every shot, so the story holds together. Every clip keeps its prompt and inputs, so any shot can be traced or regenerated.">
      {/* Who does what, on wide screens: a bracket over the stages. */}
      <div className="mb-3 hidden grid-cols-7 gap-3 text-[12px] lg:grid">
        <p className="col-span-6 border-t border-(--color-accent-2) pt-2 text-(--color-accent-2)">Cubixso builds</p>
        <p className="col-span-1 border-t border-dashed border-(--color-line-2) pt-2 text-(--color-muted)">Partner</p>
      </div>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {STORY.map((s, i) => (
          <li key={s.k} className="rounded-lg border border-(--color-line-2) px-4 py-3">
            <p className="text-[12px] text-(--color-muted-2)">{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-1 text-[15px] font-semibold text-(--color-fg)">{s.k}</p>
            <p className="mt-1 text-[13px] leading-snug text-(--color-fg-2)">{s.d}</p>
            <p className="mt-2 text-[11px] text-(--color-accent-2) lg:hidden">Cubixso</p>
          </li>
        ))}
        <li className="rounded-lg border border-dashed border-(--color-line-2) px-4 py-3">
          <p className="text-[12px] text-(--color-muted-2)">07</p>
          <p className="mt-1 text-[15px] font-semibold text-(--color-fg)">Final cut</p>
          <p className="mt-1 text-[13px] leading-snug text-(--color-fg-2)">Edit, sound and grade</p>
          <p className="mt-2 text-[11px] text-(--color-muted) lg:hidden">Partner</p>
        </li>
      </ol>
    </Frame>
  );
}

export function Diagram({ kind }: { kind: DiagramKind }) {
  if (kind === "loop") return <AgentLoop />;
  if (kind === "harness") return <HarnessAnatomy />;
  return <StoryPipeline />;
}
