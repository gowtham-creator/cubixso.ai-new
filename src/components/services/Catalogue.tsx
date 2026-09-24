"use client";

// Catalogue — every service on one screen, grouped, at the top of /services.
//
// Desktop: hovering or focusing a row swaps a large live preview (the same
// visual the service's chapter uses) in a sticky panel beside the list.
// Phones: no preview panel; every row shows its one-line description instead.
// Rows jump to the service's chapter through Lenis, offset for the fixed nav.

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ALL_SERVICES, SERVICE_GROUPS, groupOf } from "@/lib/services";
import { ServiceVisual } from "@/components/services/ServiceVisual";

export function Catalogue() {
  const [activeId, setActiveId] = useState(ALL_SERVICES[0].id);
  const active = ALL_SERVICES.find((s) => s.id === activeId) ?? ALL_SERVICES[0];
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -96 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        {SERVICE_GROUPS.map((g) => (
          <div key={g.id} className="mb-10 last:mb-0">
            <div className="flex items-baseline justify-between gap-4 border-b border-(--color-line-2) pb-3">
              <p className="text-[15px] font-semibold text-(--color-fg)">{g.name}</p>
              <p className="text-[13px] text-(--color-muted)">{g.line}</p>
            </div>
            <ul>
              {g.services.map((s) => {
                const on = s.id === activeId;
                return (
                  <li key={s.id} className="border-b border-(--color-line)">
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => jump(e, s.id)}
                      onMouseEnter={() => setActiveId(s.id)}
                      onFocus={() => setActiveId(s.id)}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 py-4 sm:py-5"
                    >
                      <span className={`mono text-[13px] transition-colors ${on ? "text-(--color-accent-2)" : "text-(--color-muted-2)"}`}>{s.num}</span>
                      <span
                        className={`font-display text-[clamp(20px,2vw,28px)] leading-tight tracking-[-0.02em] transition-colors duration-300 ${
                          on ? "text-(--color-fg)" : "text-(--color-fg-2) lg:text-(--color-muted)"
                        } group-hover:text-(--color-fg)`}
                      >
                        {s.name}
                      </span>
                      <span
                        aria-hidden
                        className={`text-[18px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          on ? "translate-x-0 text-(--color-accent-2) opacity-100" : "-translate-x-2 opacity-0"
                        } max-lg:translate-x-0 max-lg:opacity-60`}
                      >
                        ↓
                      </span>
                      <span className="col-start-2 col-end-4 mt-1.5 text-[14px] leading-snug text-(--color-fg-2) lg:hidden">{s.short}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Live preview. Desktop only: on a phone it would push the list a full
          screen down, and each row already carries its description. */}
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-28">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServiceVisual visual={active.visual} compact />
              <div className="mt-6">
                <p className="text-[13px] text-(--color-accent-2)">
                  <span className="mono">{active.num}</span> · {groupOf(active.id).name}
                </p>
                <p className="mt-2 font-display text-[28px] leading-tight tracking-[-0.02em] text-(--color-fg)">{active.name}</p>
                <p className="mt-2 max-w-[52ch] text-[16px] leading-relaxed text-(--color-fg-2)">{active.short}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
