"use client";

// About — editorial manifesto with scroll-revealed counter stats and the
// "Why Cubixso" 4-card pillar grid. GSAP ScrollTrigger drives the count-up,
// Framer Motion handles the reveal staggers.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { STATS, WHY } from "@/lib/data";
import { Ph } from "@/components/icons/Ph";
import { tick, click } from "@/lib/feedback";

// tick() only on true mouse hover — a touch tap must never stack tick+click.
const hoverTick = (e: React.PointerEvent) => {
  if (e.pointerType === "mouse") tick();
};

function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    // Extract leading prefix (+, $, etc.), the numeric chunk, then any suffix
    const m = String(value).match(/^(\D*)([\d.]+)([\s\S]*)$/);
    if (!m) {
      el.textContent = value;
      return;
    }
    const [, prefix, numStr, suffix] = m;
    const target = parseFloat(numStr);
    const decimals = (numStr.split(".")[1] || "").length;

    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: target,
      duration: 1.6,
      delay,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
      },
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, delay]);

  return (
    <div className="border-t border-(--color-line) pt-6">
      <span
        ref={numRef}
        className="block font-serif italic text-[clamp(40px,5.4vw,80px)] leading-none tracking-tight text-(--color-fg) tabular-nums"
      >
        0
      </span>
      <span className="mt-3 block mono text-(--color-muted)">{label}</span>
    </div>
  );
}

export function About({ bare = false }: { bare?: boolean } = {}) {
  // Pin the manifesto headline while the right column scrolls past
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pinRef.current || !sectionRef.current) return;
    // Pin ONLY on desktop with motion allowed. The pin holds the LEFT editorial
    // column fixed while the RIGHT column scrolls past — that only makes sense in
    // the two-column (lg) grid. On mobile the grid collapses to ONE stacked
    // column, so pinning the top block `position:fixed` makes it OVERLAP the
    // stats/why-cards sliding up underneath → content is occluded and the page
    // reads as un-scrollable past the hero. gsap.matchMedia auto-reverts the pin
    // (and its pin-spacer) outside this range, mirroring the Global section.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top+=80",
        end: "bottom bottom-=120",
        pin: pinRef.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
      return () => trigger.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,14vh,200px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {!bare && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mono text-(--color-muted)"
          >
            CHAPTER 003 — ABOUT
          </motion.p>
        )}

        {/* Two-column: pinned editorial on left, stats + why cards scroll on right */}
        <div className={`${bare ? "" : "mt-12"} grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24`}>
          {/* ── Pinned editorial ─────────────────────────────────────── */}
          <div ref={pinRef} className="self-start">
            <motion.h2
              initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg)"
            >
              An AI-first<br />
              <em
                className="font-serif not-italic italic"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                company,
              </em>{" "}
              for an AI-first<br />
              decade.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-[44ch] text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)"
            >
              AI implementation and business strategy, end to end &mdash; architecture
              through deployment and support.
            </motion.p>
            {/* Aperios-style serif pull-quote — the mission line, set apart
                with a hairline rule and generous whitespace. */}
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 border-l border-(--color-line-2) pl-6"
            >
              <p className="max-w-[22ch] font-serif italic text-[clamp(24px,2.4vw,34px)] leading-[1.2] tracking-[-0.015em] text-(--color-fg)">
                &ldquo;One team, one accountability&nbsp;line.&rdquo;
              </p>
            </motion.blockquote>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 inline-flex items-center gap-3 mono text-(--color-muted)"
            >
              <span className="block w-12 h-px bg-(--color-line-2)" aria-hidden />
              <span>T-HUB · HYDERABAD · IN</span>
            </motion.div>

            {/* The team behind the line — quiet cross-link to /leadership */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6"
            >
              <Link
                href="/leadership"
                onClick={() => click()}
                onPointerEnter={hoverTick}
                className="group inline-flex items-center gap-2 text-[14px] text-(--color-powder) underline-offset-4 hover:underline"
              >
                Meet the people
                <Ph
                  name="arrow-up-right"
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </motion.div>
          </div>

          {/* ── Right column: stats + why-pillars ───────────────────── */}
          <div className="flex flex-col gap-24">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
              {STATS.map((s, i) => (
                <Counter key={s.label} value={s.num} label={s.label} delay={i * 0.05} />
              ))}
            </div>

            {/* Why Cubixso — 4 pillars */}
            <div>
              <p className="mono text-(--color-muted) mb-8">
                WHY CUBIXSO · WHAT SETS US APART
              </p>
              <div className="grid grid-cols-1 gap-px bg-(--color-line) sm:grid-cols-2">
                {WHY.map((w, i) => (
                  <motion.div
                    key={w.tag}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative bg-(--color-bg) p-8 transition-colors hover:bg-(--color-bg-soft)"
                  >
                    <span className="mono font-semibold text-(--color-accent)">{w.tag}</span>
                    {/* Was 15.5px/regular on --color-fg-2, which read as washed
                        out against the light canvas. Bumped to 17px, medium
                        weight and full-strength ink so the pillars carry. */}
                    <p className="mt-4 text-[17px] font-medium leading-relaxed text-(--color-fg) transition-colors">
                      {w.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
