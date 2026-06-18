"use client";

// BioPanel — the leadership bio dialog. A LiquidGlass panel that opens with
// an aperture-style clip reveal over a darkened void. Fully accessible:
// role=dialog + aria-modal, focus is trapped and restored, Esc and backdrop
// close, body scroll locks while open. Mobile: full-height sheet.

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Ph } from "@/components/icons/Ph";
import { tick, click } from "@/lib/feedback";
import type { TeamMember } from "@/lib/team";

export function BioPanel({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Focus management + Esc + scroll lock — runs while a member is open.
  useEffect(() => {
    if (!member) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        tick();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      // Minimal focus trap — cycle within the dialog.
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [member, onClose]);

  return (
    <AnimatePresence>
      {member && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-8"
          onClick={() => {
            tick();
            onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${member.name} — ${member.role}`}
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 28, clipPath: "inset(8% 6% 8% 6% round 24px)" }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 24px)" }
            }
            exit={{ opacity: 0, y: reduced ? 0 : 16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl max-h-[92svh] overflow-y-auto md:max-h-[84vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <LiquidGlass tier="panel" radius={24} className="p-6 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Portrait / avatar */}
                <div className="relative aspect-[4/5] w-40 shrink-0 overflow-hidden rounded-xl md:w-52">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgba(27,79,255,0.34),rgba(24,35,80,0.85)_62%,rgba(5,5,7,0.95))]">
                      <span className="font-serif italic text-5xl text-(--color-powder)/85">
                        {member.initials}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {member.group}
                    {member.open ? " · open role" : ""}
                  </p>
                  <h2 className="mt-2 font-display text-2xl tracking-tight text-(--color-fg) md:text-3xl">
                    {member.name}
                  </h2>
                  <p className="mt-1 font-serif italic text-[15px] text-(--color-fg-2)">
                    {member.role}
                  </p>

                  <div className="mt-6 space-y-4">
                    {member.bio.map((para, i) => (
                      <p
                        key={i}
                        className="text-[14.5px] leading-relaxed text-(--color-fg-2) first:text-(--color-fg) first:text-[15.5px]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {(member.links?.length || member.open) && (
                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      {member.links?.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => click()}
                          className="inline-flex items-center gap-1.5 text-[13px] text-(--color-powder) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-powder)"
                        >
                          {l.label}
                          <Ph name="arrow-up-right" size={14} />
                        </Link>
                      ))}
                      {member.open && (
                        <Link
                          href="/contact"
                          onClick={() => click()}
                          className="inline-flex items-center gap-1.5 text-[13px] text-(--color-powder) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-powder)"
                        >
                          Introduce yourself
                          <Ph name="arrow-up-right" size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Close */}
                <button
                  type="button"
                  data-autofocus
                  onClick={() => {
                    tick();
                    onClose();
                  }}
                  aria-label="Close bio"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition-colors hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-powder) md:right-6 md:top-6"
                >
                  <Ph name="x" size={16} />
                </button>
              </div>
            </LiquidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
