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

function Label({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[13px] font-semibold text-(--color-muted)">{children}</h4>;
}

function ProofCard({ p }: { p: Proof }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-(--color-line) p-3 pr-5 transition-colors group-hover:border-(--color-line-2)">
      {p.image ? (
        <Image
          src={p.image}
          alt=""
          width={112}
          height={66}
          sizes="112px"
          className="h-[66px] w-[112px] shrink-0 rounded-xl border border-(--color-line) object-cover object-left-top"
        />
      ) : (
        <span aria-hidden className="grid h-[66px] w-[112px] shrink-0 place-items-center rounded-xl border border-(--color-line) text-[22px] font-semibold text-(--color-line-2)">
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
    </div>
  );
  return p.href ? (
    <a href={p.href} target="_blank" rel="noopener noreferrer" className="group block">
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
