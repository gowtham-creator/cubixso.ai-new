"use client";

// Field-guide index for /services.
//   rail  — xl+: sticky left rail, current section highlighted as you read.
//   chips — below xl: one swipeable row under the header (not sticky: the
//           floating nav pill already owns the top of a phone screen).
//
// Jumps go through Lenis when it is running. A plain hash jump would bypass the
// smooth-scroll instance and land under the fixed nav; lenis.scrollTo takes an
// offset for it. Without Lenis (reduced motion) it falls back to scrollIntoView,
// which honours each section's scroll-margin.

import { useEffect, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { TRACKS } from "@/lib/services";

type Item = { id: string; label: string; code?: string; group?: string };

const ITEMS: Item[] = [
  { id: "shifts", label: "What changed" },
  ...TRACKS.flatMap((t) => [
    { id: t.id, label: t.name, group: t.letter },
    ...t.practices.map((p) => ({ id: p.id, label: p.name, code: p.code })),
  ]),
  { id: "engagement", label: "How we work" },
  { id: "stack", label: "Stack and standards" },
];

function useJump() {
  const lenis = useLenis();
  return (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -110 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };
}

export function FieldIndex({ variant }: { variant: "rail" | "chips" }) {
  const jump = useJump();
  const [active, setActive] = useState<string>("shifts");

  useEffect(() => {
    if (variant !== "rail" || typeof IntersectionObserver === "undefined") return;
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    // A thin band across the upper-middle of the viewport: whichever section
    // crosses it is the one being read.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-38% 0px -58% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [variant]);

  if (variant === "chips") {
    return (
      <nav aria-label="Services index" className="xl:hidden">
        <ul className="-mx-[var(--pad-x)] flex snap-x gap-2 overflow-x-auto px-[var(--pad-x)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ITEMS.filter((i) => !i.group).map((i) => (
            <li key={i.id} className="snap-start">
              <a
                href={`#${i.id}`}
                onClick={(e) => jump(e, i.id)}
                className="tap-target inline-flex whitespace-nowrap rounded-full border border-(--color-line-2) px-3.5 py-1.5 text-[13px] text-(--color-fg-2) transition-colors hover:border-(--color-accent-2) hover:text-(--color-fg)"
              >
                {i.code ? <span className="mono mr-2 text-(--color-muted)">{i.code}</span> : null}
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Services index" className="sticky top-[120px] hidden max-h-[calc(100svh-140px)] overflow-y-auto xl:block">
      <ul className="space-y-0.5 text-[13px]">
        {ITEMS.map((i) => {
          const on = active === i.id;
          if (i.group) {
            return (
              <li key={i.id} className="pt-5">
                <a
                  href={`#${i.id}`}
                  onClick={(e) => jump(e, i.id)}
                  aria-current={on ? "location" : undefined}
                  className={`block py-1 font-semibold transition-colors ${on ? "text-(--color-accent-2)" : "text-(--color-fg)"}`}
                >
                  <span className="mono mr-2 text-(--color-muted)">{i.group}</span>
                  {i.label}
                </a>
              </li>
            );
          }
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                onClick={(e) => jump(e, i.id)}
                aria-current={on ? "location" : undefined}
                className={`flex gap-2 rounded-md py-1 pl-2 transition-colors ${
                  on
                    ? "bg-(--color-surface)/70 text-(--color-fg)"
                    : "text-(--color-muted) hover:text-(--color-fg)"
                }`}
              >
                {i.code ? <span className="mono w-9 shrink-0 text-(--color-muted-2)">{i.code}</span> : null}
                <span>{i.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
