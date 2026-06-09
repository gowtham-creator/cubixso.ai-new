"use client";

// Work — 05 · PRODUCTS — the MASKED TILE-HANDOFF gallery, over the living void.
//
// WOW-MOMENT (depth-of-field by refraction, not shadow):
//   • The six products become edge-framed Tier-2 LiquidGlass slabs. No opaque
//     fill — the cobalt cube light lives behind the 12–24px void gutter that
//     rings every slab.
//   • The ACTIVE product BRIGHTENS — its cube light leaks cobalt (a refractive
//     cobalt rim-glow keyed by --lit) — while neighbours stay neutral. Focus is
//     read through the glass, never via a drop-shadow.
//   • Product names wipe in line-by-line (Reveal, masked, cube-edge language).
//   • On change, the newly-active tile's cobalt edge-frame BLINKS ONCE — the
//     recurring "aperture blink."
//   • The WorkPreview visual is preserved but FLOATS in a Tier-2 glass slab.
//
// Motion is strictly transform / opacity / filter (GPU). Reduced-motion is safe
// by construction: Reveal collapses to a fade, useDepthParallax freezes, and the
// aperture-blink keyframe is disabled via @media (prefers-reduced-motion). No
// hard GSAP ScrollTrigger pins — the "pinned" handoff feel comes from the glass
// focus brighten + Reveal masks + the cube morphing behind. Copy/data/structure
// and the ChapterLabel are preserved.

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";

// Lazy-load the sticky 3D preview — it's hidden lg:block, only matters on
// desktop, and dropping it from the home bundle is a clean perf win.
// The surrounding section text still SSRs because the rest of Work.tsx is
// synchronous; only the canvas tree is deferred.
const WorkPreview = dynamic(
  () => import("@/components/canvas/WorkPreview").then((m) => m.WorkPreview),
  { ssr: false, loading: () => null },
);

export function Work({ bare = false }: { bare?: boolean } = {}) {
  const [active, setActive] = useState<number>(0);

  // Antigravity depth: headline leads slightly (plane 3), the product column
  // rides baseline (plane 2), the floated preview drifts on a back plane (1) so
  // it parallaxes behind the foreground type. Pure translate3d; the hook is
  // reduced-motion safe and freezes to translate3d(0,0,0).
  const headParallax = useDepthParallax(3);
  const listParallax = useDepthParallax(2);
  const previewParallax = useDepthParallax(1);

  return (
    <section
      id="work"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(80px,12vh,160px)]"
    >
      <WorkStyles />

      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {/* Section header — a refractive focal slab over the void (THE one
            allowed shadow per section), ringed by a void gutter. */}
        {!bare && (
          <motion.div style={{ transform: headParallax }} className="mb-16 max-w-3xl">
            <Reveal direction="up">
              <LiquidGlass tier="panel" focal className="p-[clamp(20px,3vw,40px)]">
                <ChapterLabel num="05" word="PRODUCTS" />
                <h2 className="mt-6 font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.035em] text-balance text-(--color-fg)">
                  Purpose-built AI,<br />
                  <em
                    className="font-serif not-italic italic"
                    style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                  >
                    ready to deploy.
                  </em>
                </h2>
                <p className="mt-6 max-w-prose text-[clamp(15px,1.1vw,17px)] leading-relaxed text-(--color-fg-2)">
                  Six standalone products. No custom build required.
                </p>
              </LiquidGlass>
            </Reveal>
          </motion.div>
        )}

        {/* Two-column: edge-framed glass slabs left, floated glass preview right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* ── Product slabs ───────────────────────────────────────── */}
          <motion.ul
            style={{ transform: listParallax }}
            className="flex flex-col gap-4"
            onMouseLeave={() => setActive(0)}
          >
            {PRODUCTS.map((p, i) => {
              const lit = active === i;
              return (
                <Reveal key={p.code} direction="up" delay={i * 0.06}>
                  <LiquidGlass
                    tier="panel"
                    as="article"
                    className={cn(
                      // The cobalt cube-light leak is keyed by --lit: active=1
                      // (brightens, refractive cobalt rim) → neighbours=0.
                      "lg-work-tile group relative cursor-pointer p-7 transition-colors duration-300",
                      lit ? "text-(--color-fg)" : "text-(--color-fg-2)",
                    )}
                    style={{ "--lit": lit ? 1 : 0 } as React.CSSProperties}
                  >
                    {/* APERTURE BLINK — the newly-active tile's cobalt edge-frame
                        flashes once on change. Keyed by `active` so it remounts
                        and replays only for the tile that just gained focus.
                        Decorative, filter/opacity-only, reduced-motion disabled. */}
                    {lit && (
                      <span
                        key={active}
                        aria-hidden
                        className="lg-aperture-blink pointer-events-none absolute inset-0 z-[1] rounded-[18px]"
                      />
                    )}

                    {/* Top meta — code + tag */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="mono text-(--color-muted)">{p.code}</span>
                      <span className="mono text-(--color-muted)">{p.tag}</span>
                    </div>

                    {/* Name — masked line-by-line wipe (cube-edge language). The
                        name + body live on their own Reveal so the editorial
                        product name clips up when the tile arrives. */}
                    <Reveal direction="up" delay={i * 0.06 + 0.08}>
                      <h3
                        className={cn(
                          "font-display text-[clamp(28px,3.6vw,46px)] leading-[1.02] tracking-[-0.025em] transition-transform duration-300",
                          lit && "translate-x-1",
                        )}
                      >
                        {p.name}
                      </h3>
                    </Reveal>
                    <Reveal direction="up" delay={i * 0.06 + 0.14}>
                      <p
                        className={cn(
                          "mt-3 max-w-[60ch] text-[15px] leading-relaxed transition-opacity duration-300",
                          lit ? "opacity-100" : "opacity-60",
                        )}
                      >
                        {p.body}
                      </p>
                    </Reveal>

                    {/* Hover/focus arrow */}
                    <span
                      className={cn(
                        "pointer-events-none absolute right-7 top-7 inline-flex items-center gap-2 transition-all duration-300",
                        lit
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-2 opacity-0",
                      )}
                      aria-hidden
                    >
                      <span className="mono text-(--color-muted)">EXPLORE</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 17 L17 7 M9 7 L17 7 L17 15"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    {/* Focus surface — pointer + keyboard set the active tile so
                        the cobalt leak follows attention (no layout shift). */}
                    <button
                      type="button"
                      aria-label={`Focus ${p.name}`}
                      tabIndex={lit ? -1 : 0}
                      className="absolute inset-0 z-[2] rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-2)"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                    />
                  </LiquidGlass>
                </Reveal>
              );
            })}
          </motion.ul>

          {/* ── Floated preview ─────────────────────────────────────── */}
          <div className="hidden lg:block">
            <motion.div
              style={{ transform: previewParallax }}
              className="sticky top-[calc(50vh-220px)]"
            >
              <Reveal direction="left">
                {/* WorkPreview visual PRESERVED — but floats in a Tier-2 glass
                    slab (no opaque bg; the void shows through the gutter). */}
                <LiquidGlass
                  tier="panel"
                  className="aspect-square w-full overflow-hidden"
                >
                  <WorkPreview index={active} />

                  {/* Floating label — current product name, refracting the
                      canvas beneath it. */}
                  <div className="pointer-events-none absolute inset-x-5 bottom-5 z-[2] flex items-end justify-between">
                    <div>
                      <span className="mono text-(--color-muted)">
                        {PRODUCTS[active]?.code}
                      </span>
                      <p className="mt-1 font-display text-xl tracking-tight text-(--color-fg)">
                        {PRODUCTS[active]?.name}
                      </p>
                    </div>
                    <span className="mono text-(--color-muted)">
                      {String(active + 1).padStart(2, "0")}
                      &nbsp;/&nbsp;
                      {String(PRODUCTS.length).padStart(2, "0")}
                    </span>
                  </div>
                </LiquidGlass>
              </Reveal>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Scoped styles ────────────────────────────────────────────────────────────
// Injected once (deduped) so the aperture-blink + the active cobalt cube-light
// leak live alongside this section without touching globals.css. Token-only
// colours; all motion is filter/opacity (GPU), reduced-motion disabled.

let workInjected = false;
function WorkStyles() {
  if (typeof document !== "undefined" && !workInjected) {
    workInjected = true;
    return <style data-work-glass="">{WORK_CSS}</style>;
  }
  return null;
}

const WORK_CSS = `
/* Active tile — the cube light LEAKS cobalt through the glass (depth-of-field
   by refraction). --lit (0|1) interpolates a refractive cobalt rim-glow + a
   faint brightness/saturation lift; neighbours stay neutral. Filter/box-shadow
   only — never an opaque fill, never a drop-shadow for depth. */
.lg-work-tile{
  transition:
    box-shadow .45s var(--ease-smooth),
    filter .45s var(--ease-smooth);
}
.lg-work-tile{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,calc(.14 + .04 * var(--lit, 0))),
    inset 0 -1px 0 rgba(0,0,0,.4),
    inset 0 0 0 1px color-mix(in oklab,
      var(--color-accent) calc(34% * var(--lit, 0)), var(--color-line)),
    inset 0 0 calc(40px * var(--lit, 0)) color-mix(in oklab,
      var(--color-accent-2) calc(18% * var(--lit, 0)), transparent);
  filter:saturate(calc(1 + .12 * var(--lit, 0)))
         brightness(calc(1 + .05 * var(--lit, 0)));
}
/* Active tile cobalt corner-mark burns brighter (the cube-edge primitive lit). */
.lg-work-tile::after{
  opacity:calc(.55 + .45 * var(--lit, 0));
}

/* APERTURE BLINK — one cobalt edge-frame flash on the seam when a tile gains
   focus. Drawn as a 1px cobalt inset ring that pulses once via opacity. */
.lg-aperture-blink{
  box-shadow:inset 0 0 0 1px var(--color-accent);
  opacity:0;
  animation:work-aperture-blink .5s var(--ease-out-expo) 1 both;
  will-change:opacity;
}
@keyframes work-aperture-blink{
  0%{ opacity:0; }
  35%{ opacity:1; }
  100%{ opacity:0; }
}

@media (prefers-reduced-motion: reduce){
  .lg-work-tile{ transition:none; }
  .lg-aperture-blink{ animation:none; opacity:0; }
}
`;
