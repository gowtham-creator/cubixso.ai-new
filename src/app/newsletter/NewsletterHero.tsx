"use client";

// NewsletterHero — the single section on /newsletter. A centered subscribe
// hero adapted from the asme HeroSection (heading + "Enter your email" input +
// Subscribe button + supporting copy), rebuilt in our Cobalt-Aperture language:
//   • PageHeader's typographic scale for the heading (display, balanced, fg),
//     muted supporting copy on --color-fg-2.
//   • The form is a Tier-1 LiquidGlass pill so the void/cube light bends
//     through it; the Subscribe button is the only cobalt-filled chrome
//     (GlassButton, white label, Ph "paper-plane-tilt").
//   • Submit is a pure client handler — flips to a "Thanks — you're
//     subscribed" status state. No backend.
//
// Theme-adaptive by construction: every surface/text/line reads from CSS-var
// tokens, so it's legible in BOTH light and dark. Reduced-motion safe (the
// only motion is the framer fade + the glass sweep, both honoring the OS flag).

import { type FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { LiquidGlass, GlassButton } from "@/components/glass/LiquidGlass";
import { Ph } from "@/components/icons/Ph";

// Entrance fade — same stable-shape pattern as PageHeader's useFade so the
// reduced-motion resolve never animates "opacity from undefined".
function useFade() {
  const reduced = useReducedMotion();
  return (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18, filter: reduced ? "blur(0px)" : "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
  });
}

export function NewsletterHero() {
  const fade = useFade();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // No backend — flip straight to the confirmed state.
    setSubmitted(true);
  };

  return (
    // Transparent over the void so the Aurora field + VoidCube spine stay alive
    // behind the type. Top padding clears the fixed Nav; min-h centers the card.
    <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-[var(--pad-x)] pt-[clamp(140px,22vh,240px)] pb-[clamp(60px,10vh,140px)] text-center">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="flex justify-center">
          <ChapterLabel num="01" word="NEWSLETTER" />
        </div>

        <motion.h1
          {...fade(0.1)}
          className="font-display text-[length:var(--text-display-2xl)] leading-[0.9] tracking-[-0.045em] text-balance text-(--color-fg)"
        >
          Stay in the{" "}
          <em
            className="font-serif not-italic italic"
            style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
          >
            loop
          </em>
          .
        </motion.h1>

        <motion.p
          {...fade(0.25)}
          className="mx-auto mt-8 max-w-prose text-[clamp(15px,1.2vw,18px)] leading-relaxed text-(--color-fg-2)"
        >
          One concise dispatch on production AI: what we shipped, what we
          learned, and where the field is heading. No noise, no spam. Subscribe
          to our newsletter today and never miss what we&apos;re building.
        </motion.p>

        <motion.div {...fade(0.4)} className="mx-auto mt-12 w-full max-w-[520px]">
          {submitted ? (
            <LiquidGlass
              tier="panel"
              rimLight={false}
              radius={999}
              className="px-7 py-4"
            >
              <p
                role="status"
                aria-live="polite"
                className="inline-flex items-center justify-center gap-2.5 text-[15px] font-medium text-(--color-fg)"
              >
                <span className="grid place-items-center w-6 h-6 rounded-full bg-(--color-cobalt) text-white">
                  <Ph name="check" weight="bold" size={14} />
                </span>
                Thanks, you&apos;re subscribed.
              </p>
            </LiquidGlass>
          ) : (
            <LiquidGlass
              tier="nav"
              radius={999}
              className="flex items-center gap-2 py-2 pl-5 pr-2"
            >
              <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="min-w-0 flex-1 border-none bg-transparent px-2 text-[15px] text-(--color-fg) placeholder:text-(--color-muted) outline-none"
                />
                <GlassButton
                  type="submit"
                  className="shrink-0 items-center gap-2 px-5 py-2.5 text-[13px] font-medium"
                >
                  Subscribe
                  <Ph name="paper-plane-tilt" weight="bold" size={16} />
                </GlassButton>
              </form>
            </LiquidGlass>
          )}

          {!submitted && (
            <p className="mt-4 text-[12.5px] leading-relaxed text-(--color-muted)">
              We&apos;ll only email when there&apos;s something worth reading.
              Unsubscribe anytime.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
