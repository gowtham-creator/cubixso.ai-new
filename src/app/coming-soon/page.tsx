"use client";

// /coming-soon — the launch gate. A calm, premium countdown to the public
// go-live instant (NEXT_PUBLIC_LAUNCH_AT). Middleware rewrites every route here
// until that moment, then reveals the real site automatically. Theme-aware over
// the site-wide dust field; no nav/footer chrome (see LayoutChrome BARE_ROUTES).

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { launchAtMs } from "@/lib/launch";

const SIG = [0.16, 1, 0.3, 1] as const;

type Parts = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function remaining(toMs: number): Parts {
  const ms = Math.max(0, toMs - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    done: ms <= 0,
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-[clamp(40px,9vw,96px)] font-semibold tabular-nums leading-none tracking-[-0.04em] text-(--color-fg)">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mono mt-3 text-[10px] tracking-[0.28em] text-(--color-fg-2)">
        {label}
      </span>
    </div>
  );
}

export default function ComingSoon() {
  const target = launchAtMs();
  const [t, setT] = useState<Parts | null>(null);

  useEffect(() => {
    if (!target) return;
    setT(remaining(target));
    const id = window.setInterval(() => setT(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const live = !target || t?.done;

  return (
    <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-[var(--pad-x)] py-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: SIG }}
        className="mono mb-8 text-[11px] tracking-[0.32em] text-(--color-fg-2)"
      >
        [ LAUNCHING SOON ]
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 0.08, ease: SIG }}
        className="font-display text-[clamp(34px,6vw,72px)] font-semibold leading-[0.95] tracking-[-0.045em] text-balance text-(--color-fg)"
      >
        Generative AI for the
        <br className="hidden sm:block" /> autonomous enterprise.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.18, ease: SIG }}
        className="mt-7 max-w-prose text-[clamp(15px,1.2vw,18px)] leading-relaxed text-(--color-fg-2)"
      >
        We are putting the finishing touches on something built for scale and
        impact. The full Cubixso.ai experience goes live when the countdown ends.
      </motion.p>

      {!live && t && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: SIG }}
          className="mt-14 flex items-start gap-[clamp(16px,5vw,56px)]"
        >
          <Unit value={t.days} label="DAYS" />
          <Unit value={t.hours} label="HOURS" />
          <Unit value={t.minutes} label="MINUTES" />
          <Unit value={t.seconds} label="SECONDS" />
        </motion.div>
      )}

      {live && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="mono rounded-full bg-(--color-cobalt) px-7 py-3 text-[12px] tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
          >
            ENTER THE SITE →
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-16 font-display text-[clamp(18px,2.6vw,26px)] font-semibold tracking-[-0.02em] text-(--color-fg)"
      >
        cubixso
        <span
          style={{
            backgroundImage: "linear-gradient(95deg,#4A7BFF,#9B6BFF 55%,#37E5FF)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          .ai
        </span>
      </motion.div>
    </main>
  );
}
