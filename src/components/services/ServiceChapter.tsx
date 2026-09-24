// One service, told in full. The visual stays pinned on one side (lg+) while
// the detail scrolls past it; sides alternate from one service to the next so
// eleven chapters never read as one repeated block. Server component apart
// from the Reveal wrapper on the heading.

import Image from "next/image";
import Link from "next/link";
import type { Proof, Service } from "@/lib/services";
import { ServiceVisual } from "@/components/services/ServiceVisual";
import { Reveal } from "@/components/scroll/Reveal";

const STATUS_TONE: Record<Proof["status"], string> = {
  "In production": "text-(--color-accent-2)",
  Live: "text-(--color-accent-2)",
  Delivered: "text-(--color-fg-2)",
  "Case study": "text-(--color-fg-2)",
  // In-build work is named as such, never dressed up as shipped.
  "In build": "text-(--color-muted)",
};

// Section heads inside a chapter. Highlighted in cobalt with a glowing key, so
// a reader scanning a long chapter can find "What we build" or "Where it runs"
// at a glance rather than hunting for small grey labels.
function Label({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-(--color-accent-2)">
      <span aria-hidden className="h-2 w-2 rounded-[3px] bg-(--color-accent-2) shadow-[0_0_10px_var(--color-accent-2)]" />
      {children}
    </h4>
  );
}

function ProofCard({ p }: { p: Proof }) {
  // Hover (and keyboard focus) lifts the card: cobalt edge and glow, a faint
  // cobalt wash, the screenshot eases in closer, and linked work shows where
  // it will take you. Transform/opacity/colour only.
  const inner = (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-bg) p-3 pr-5 transition-[border-color,box-shadow,transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:border-(--color-accent-2) group-hover:bg-[color-mix(in_oklab,var(--color-accent-2)_7%,var(--color-bg))] group-hover:shadow-[0_0_0_1px_var(--color-accent-2),0_12px_40px_-16px_var(--color-accent-2)] group-focus-visible:border-(--color-accent-2)">
      {p.image ? (
        <span className="block h-[66px] w-[112px] shrink-0 overflow-hidden rounded-xl border border-(--color-line) transition-colors duration-300 group-hover:border-(--color-accent-2)">
          <Image
            src={p.image}
            alt=""
            width={112}
            height={66}
            sizes="112px"
            className="h-full w-full object-cover object-left-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
        </span>
      ) : (
        <span aria-hidden className="grid h-[66px] w-[112px] shrink-0 place-items-center rounded-xl border border-(--color-line) text-[22px] font-semibold text-(--color-line-2) transition-colors duration-300 group-hover:border-(--color-accent-2) group-hover:text-(--color-accent-2)">
          {p.name.charAt(0)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[15px] text-(--color-fg)">
          <span className="font-semibold">{p.name}</span>
          <span className={`ml-2 text-[12px] ${STATUS_TONE[p.status]}`}>{p.status}</span>
        </p>
        <p className="mt-1 text-[13px] leading-snug text-(--color-fg-2)">{p.note}</p>
      </div>
      {p.href ? (
        <span aria-hidden className="ml-auto shrink-0 -translate-x-1 text-[16px] text-(--color-accent-2) opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          ↗
        </span>
      ) : null}
    </div>
  );
  return p.href ? (
    <a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} (opens in a new tab)`} className="group block rounded-2xl outline-none">
      {inner}
    </a>
  ) : (
    <div className="group">{inner}</div>
  );
}

export function ServiceChapter({ service: s, groupName, flip }: { service: Service; groupName: string; flip: boolean }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24 border-t border-(--color-line) py-[clamp(64px,9vw,128px)]">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
          <div className="lg:sticky lg:top-28">
            <ServiceVisual visual={s.visual} />
          </div>
        </div>

        <div className="lg:col-span-6">
          <Reveal direction="up" as="div">
            <p className="text-[13px] text-(--color-accent-2)">
              <span className="mono">{s.num}</span> · {groupName}
            </p>
            <h3
              id={`${s.id}-title`}
              className="mt-3 font-display text-[clamp(34px,4vw,60px)] leading-[1.02] tracking-[-0.035em] text-balance text-(--color-fg)"
            >
              {s.name}
            </h3>
          </Reveal>
          <p className="mt-6 max-w-[58ch] text-[clamp(17px,1.3vw,19px)] leading-relaxed text-(--color-fg-2)">{s.lead}</p>

          <div className="mt-10">
            <Label>What we build</Label>
            <ol className="mt-3">
              {s.build.map((b, i) => (
                <li key={b} className="grid grid-cols-[2.25rem_1fr] items-baseline border-b border-(--color-line) py-3.5 last:border-b-0">
                  <span className="mono text-[12px] text-(--color-accent-2)">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[16px] leading-snug text-(--color-fg)">{b}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <Label>Use it for</Label>
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.useCases.map((u) => (
                  <li key={u} className="rounded-full border border-(--color-line-2) px-3 py-1 text-[13px] text-(--color-fg)">{u}</li>
                ))}
              </ul>
            </div>
            <div>
              <Label>You receive</Label>
              <ul className="mt-3 space-y-2">
                {s.deliver.map((d) => (
                  <li key={d} className="flex gap-2.5 text-[14px] leading-snug text-(--color-fg-2)">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-fg-2)" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <Label>Designed against</Label>
              <ul className="mt-3 space-y-2">
                {s.failures.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[14px] leading-snug text-(--color-fg-2)">
                    <span aria-hidden className="mt-[6px] h-2 w-2 shrink-0 rounded-full border border-(--color-muted-2)" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label>Built with</Label>
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.stack.map((t) => (
                  <li key={t} className="mono rounded-md bg-(--color-surface) px-2.5 py-1 text-[12px] text-(--color-fg-2)">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {s.boundary ? (
            <p className="mt-10 rounded-2xl border border-dashed border-(--color-line-2) px-5 py-4 text-[14px] leading-relaxed text-(--color-fg-2)">
              <span className="font-semibold text-(--color-fg)">{s.boundary.split(":")[0]}:</span>
              {s.boundary.slice(s.boundary.indexOf(":") + 1)}
            </p>
          ) : null}

          {s.proof?.length ? (
            <div className="mt-10">
              <Label>Where it runs</Label>
              <div className="mt-3 space-y-3">
                {s.proof.map((p) => (
                  <ProofCard key={p.name} p={p} />
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/contact"
            className="tap-target mt-10 inline-flex items-center gap-2 text-[15px] font-semibold text-(--color-accent-2) transition-[gap] duration-300 hover:gap-3"
          >
            {/* Fixed label: lower-casing the service name mangled acronyms
                ("mCP", "rAG", "lLMOps"). The name is kept for screen readers. */}
            Discuss this service<span className="sr-only">: {s.name}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
