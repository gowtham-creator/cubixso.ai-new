"use client";

// Contact — closing editorial section with a real form (POSTs to /api/notify;
// Resend handler is a stub you can wire up later) and direct contact info.

import { useState } from "react";
import { motion } from "framer-motion";
import { CONTACT } from "@/lib/data";
import { Magnetic } from "@/components/motion/Magnetic";
import { chime, tick } from "@/lib/feedback";
import { Icon3D } from "@/components/icons/Icon3D";
import { Ph } from "@/components/icons/Ph";
import { GlassButton } from "@/components/glass/LiquidGlass";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function Contact({ bare = false }: { bare?: boolean } = {}) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return; // GlassButton has no disabled attr — guard re-entry here
    if (!form.email || !form.name) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "ok" : "error");
      if (res.ok) chime(); // glass strike — success path only, never on error
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(80px,14vh,180px)]"
    >
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {!bare && (
          <motion.p {...reveal(0)} className="mono text-(--color-muted)">
            CHAPTER 004 — CONTACT
          </motion.p>
        )}

        <div className={`${bare ? "" : "mt-12"} grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24`}>
          {/* ── Left: big editorial CTA + direct contact ────────────── */}
          <div>
            <motion.h2
              {...reveal(0.1)}
              className="font-display text-[length:var(--text-display-xl)] leading-[0.92] tracking-[-0.04em] text-balance text-(--color-fg)"
            >
              Let&rsquo;s build<br />
              something{" "}
              <em
                className="font-serif not-italic italic"
                style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
              >
                intelligent.
              </em>
            </motion.h2>

            <motion.p
              {...reveal(0.25)}
              className="mt-8 max-w-[52ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-(--color-fg-2)"
            >
              Honest scoping, real timelines. We hand you a system, not a notebook.
            </motion.p>

            <motion.dl
              {...reveal(0.4)}
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3"
            >
              <div className="border-t border-(--color-line) pt-5">
                {/* chat-bubble = the written channel — its exact semantic home. */}
                <dt className="mono text-(--color-fg-2) flex items-center justify-between gap-3">
                  EMAIL
                  <Icon3D name="chat-bubble" size={32} float glow className="-my-2 shrink-0" />
                </dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-(--color-fg) underline decoration-(--color-line-2) underline-offset-4 hover:decoration-(--color-fg) transition-colors"
                  >
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
              <div className="border-t border-(--color-line) pt-5">
                {/* call-in = the voice channel. Two Icon3D accents total — max. */}
                <dt className="mono text-(--color-fg-2) flex items-center justify-between gap-3">
                  PHONE
                  <Icon3D name="call-in" size={32} float glow className="-my-2 shrink-0" />
                </dt>
                <dd className="mt-2 text-(--color-fg)">
                  <a href="tel:+918374563012" className="block hover:text-(--color-accent-2) transition-colors">
                    {CONTACT.phone1}
                  </a>
                  <a href="tel:+919246901689" className="block hover:text-(--color-accent-2) transition-colors">
                    {CONTACT.phone2}
                  </a>
                </dd>
              </div>
              <div className="border-t border-(--color-line) pt-5">
                <dt className="mono text-(--color-fg-2)">LOCATION</dt>
                <dd className="mt-2 text-(--color-fg)">{CONTACT.location}</dd>
              </div>
            </motion.dl>
          </div>

          {/* ── Right: form ─────────────────────────────────────────── */}
          <motion.form
            {...reveal(0.3)}
            onSubmit={submit}
            className="flex flex-col gap-6"
          >
            <div>
              <label htmlFor="name" className="mono block text-(--color-fg-2)">NAME</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onFocus={() => tick()}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-2 w-full border-b border-(--color-line-2) bg-transparent py-3 text-[17px] text-(--color-fg) placeholder:text-(--color-muted) focus:border-(--color-fg) focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mono block text-(--color-fg-2)">EMAIL</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onFocus={() => tick()}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-2 w-full border-b border-(--color-line-2) bg-transparent py-3 text-[17px] text-(--color-fg) placeholder:text-(--color-muted) focus:border-(--color-fg) focus:outline-none transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="mono block text-(--color-fg-2)">MESSAGE</label>
              <textarea
                id="message"
                rows={4}
                value={form.message}
                onFocus={() => tick()}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="mt-2 w-full resize-none border-b border-(--color-line-2) bg-transparent py-3 text-[17px] text-(--color-fg) placeholder:text-(--color-muted) focus:border-(--color-fg) focus:outline-none transition-colors"
                placeholder="Tell us what you're building"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Magnetic>
                {/* GlassButton already fires tick()/click() via the feedback bus;
                    default type inside a <form> is submit. Re-entry is guarded
                    in submit() since LiquidGlass doesn't forward `disabled`. */}
                <GlassButton
                  className={`px-7 py-3.5 text-[15px] font-medium tracking-tight bg-(--color-cobalt)! text-white! ${
                    status === "sending" ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 text-white">
                    {status === "sending" ? "Sending…" :
                     status === "ok"      ? "Thanks — we'll reply within 24h" :
                     status === "error"   ? "Try again" :
                                            "Send"}
                    <Ph name="arrow-up-right" size={15} weight="light" />
                  </span>
                </GlassButton>
              </Magnetic>
              <span className="mono text-(--color-fg-2)">REPLIES&nbsp;WITHIN&nbsp;24H</span>
            </div>
          </motion.form>
        </div>

        {/* Bottom rule + colophon */}
        <div className="mt-32 border-t border-(--color-line) pt-8 flex flex-wrap items-center justify-between gap-4">
          <span className="mono text-(--color-fg-2)">© 2026 CUBIXSO AI — STARTUP INDIA RECOGNISED</span>
          <span className="mono text-(--color-fg-2)">17.385°N · 78.486°E</span>
        </div>
      </div>
    </section>
  );
}
