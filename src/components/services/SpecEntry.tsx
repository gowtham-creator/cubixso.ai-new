// One practice in the services field guide, laid out as a spec sheet rather than
// a card: identity and proof on the left, a ruled three-part spec on the right,
// an optional diagram full-width beneath. Server component: no client JS.

import Image from "next/image";
import type { Practice, Proof } from "@/lib/services";
import { Diagram } from "@/components/services/Diagrams";

const STATUS_TONE: Record<Proof["status"], string> = {
  "In production": "text-(--color-accent-2)",
  Live: "text-(--color-accent-2)",
  Delivered: "text-(--color-fg-2)",
  "Case study": "text-(--color-fg-2)",
  // In-build work is named as such, never dressed up as shipped.
  "In build": "text-(--color-muted)",
};

function ProofItem({ p }: { p: Proof }) {
  const body = (
    <div className="flex gap-3">
      {p.image ? (
        <Image
          src={p.image}
          alt=""
          width={96}
          height={56}
          sizes="96px"
          className="h-14 w-24 shrink-0 rounded-md border border-(--color-line) object-cover object-top"
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-[14px] text-(--color-fg)">
          <span className="font-semibold">{p.name}</span>
          <span className={`ml-2 text-[12px] ${STATUS_TONE[p.status]}`}>{p.status}</span>
        </p>
        <p className="mt-1 text-[13px] leading-snug text-(--color-fg-2)">{p.note}</p>
      </div>
    </div>
  );
  return p.href ? (
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg p-2 -m-2 transition-colors hover:bg-(--color-surface)/60 focus-visible:bg-(--color-surface)/60"
    >
      {body}
    </a>
  ) : (
    <div>{body}</div>
  );
}

function SpecColumn({ title, items, marker }: { title: string; items: string[]; marker: "build" | "risk" | "deliver" }) {
  const dot =
    marker === "build"
      ? "bg-(--color-accent-2)"
      : marker === "risk"
        ? "border border-(--color-muted-2) bg-transparent"
        : "bg-(--color-fg-2)";
  return (
    <div className="bg-(--color-bg) p-5 sm:p-6">
      <h4 className="text-[13px] font-semibold text-(--color-fg)">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[14px] leading-snug text-(--color-fg-2)">
            <span aria-hidden className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SpecEntry({ practice: p }: { practice: Practice }) {
  return (
    <article
      id={p.id}
      aria-labelledby={`${p.id}-title`}
      className="scroll-mt-32 border-t border-(--color-line) py-[clamp(44px,6vw,80px)]"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <header className="lg:col-span-4">
          <p className="mono text-[12px] text-(--color-accent-2)">{p.code}</p>
          <h3
            id={`${p.id}-title`}
            className="mt-3 font-display text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-[-0.03em] text-balance text-(--color-fg)"
          >
            {p.name}
          </h3>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-(--color-fg-2)">{p.summary}</p>

          {p.proof?.length ? (
            <div className="mt-8 space-y-4">
              <p className="text-[12px] text-(--color-muted)">Where it runs</p>
              {p.proof.map((pr) => (
                <ProofItem key={pr.name} p={pr} />
              ))}
            </div>
          ) : null}
        </header>

        <div className="lg:col-span-8">
          {/* gap-px over a line-coloured background draws the rules between the
              three columns, so the grid reads as one ruled table at every
              breakpoint instead of three floating cards. */}
          <div className="grid gap-px overflow-hidden rounded-xl border border-(--color-line) bg-(--color-line) md:grid-cols-3">
            <SpecColumn title="What we build" items={p.build} marker="build" />
            <SpecColumn title="Failure modes we design against" items={p.failures} marker="risk" />
            <SpecColumn title="You receive" items={p.deliver} marker="deliver" />
          </div>
          {p.boundary ? (
            <p className="mt-4 text-[14px] leading-relaxed text-(--color-fg-2)">
              <span className="font-semibold text-(--color-fg)">{p.boundary.split(":")[0]}:</span>
              {p.boundary.slice(p.boundary.indexOf(":") + 1)}
            </p>
          ) : null}
        </div>
      </div>

      {p.diagram ? (
        <div className="mt-10">
          <Diagram kind={p.diagram} />
        </div>
      ) : null}
    </article>
  );
}
