"use client";

// About — editorial manifesto with scroll-revealed counter stats and the
// "Why Cubixso" 4-card pillar grid. GSAP ScrollTrigger drives the count-up,
// Framer Motion handles the reveal staggers.

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { STATS, WHY } from "@/lib/data";

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

export function About() {
  // Pin the manifesto headline while the right column scrolls past
  const pinRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!pinRef.current || !sectionRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top+=80",
      end: "bottom bottom-=120",
      pin: pinRef.current,
      pinSpacing: false,
    });
    return () => trigger.kill();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,14vh,200px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mono text-(--color-muted)"
        >
          CHAPTER 003 — ABOUT
        </motion.p>

        {/* Two-column: pinned editorial on left, stats + why cards scroll on right */}
        <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
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
              Cubixso.ai bridges practical AI implementation with proper business
              strategy. End-to-end capabilities — from architecture and model selection
              through deployment, observability, and ongoing support. One team, one
              accountability line.
            </motion.p>
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
                    <span className="mono text-(--color-accent-2)">{w.tag}</span>
                    <p className="mt-4 text-[15.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg) transition-colors">
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
