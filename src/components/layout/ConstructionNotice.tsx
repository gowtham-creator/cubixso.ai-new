"use client";

// ConstructionNotice — slim top banner clarifying this build is a temporary
// showcase while the real site is still under construction. Dismissible per
// session (sessionStorage) so it doesn't nag on every scroll/route change.
//
// Sits above the Nav. Mono, low-key, brand cobalt accent — reads as an
// honest status line, not an alarm.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Brand cobalt — hard-coded because the shadcn @theme inline block overrides
// the --color-accent token to a near-white oklch, which would make this bar
// invisible if we relied on the utility class.
const COBALT = "#1B4FFF";

export function ConstructionNotice() {
  const [show, setShow] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("cubixso.notice.dismissed") === "1") return;
    // Small delay so it animates in after the preloader clears
    const id = window.setTimeout(() => setShow(true), 600);
    return () => clearTimeout(id);
  }, []);

  // Publish the bar's height as --notice-h so the Nav can offset beneath it.
  useEffect(() => {
    const root = document.documentElement;
    if (!show) {
      root.style.setProperty("--notice-h", "0px");
      return;
    }
    const bar = barRef.current;
    if (!bar) return;
    const sync = () => root.style.setProperty("--notice-h", `${bar.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      root.style.setProperty("--notice-h", "0px");
    };
  }, [show]);

  const dismiss = () => {
    setShow(false);
    try { sessionStorage.setItem("cubixso.notice.dismissed", "1"); } catch { /* private mode */ }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          className="fixed top-0 left-0 right-0 z-[60] pointer-events-auto"
        >
          <div
            ref={barRef}
            style={{ background: COBALT }}
            className="relative flex items-center justify-center gap-2.5 sm:gap-3.5 px-[var(--pad-x)] py-2.5 sm:py-3 overflow-hidden"
          >
            {/* animated sheen sweep for liveliness */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ["-120%", "420%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
            />
            <span className="relative shrink-0 flex items-center gap-1.5" aria-hidden>
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block">
                <path d="M12 2 L2 7 L12 12 L22 7 Z M2 17 L12 22 L22 17 M2 12 L12 17 L22 12" />
              </svg>
            </span>
            <p className="relative mono text-[10px] sm:text-[11.5px] tracking-[0.12em] text-white text-center font-medium">
              <span className="font-semibold">🚧 UNDER CONSTRUCTION</span>
              <span className="mx-2 text-white/45">·</span>
              <span>
                Still being built to bring the best experience to our users, customers
                &amp; clients worldwide
              </span>
              <span className="mx-2 text-white/45 hidden md:inline">·</span>
              <span className="hidden md:inline text-white/80">
                live for temporary showcase only
              </span>
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss notice"
              className="relative shrink-0 grid place-items-center w-6 h-6 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M6 6 L18 18 M6 18 L18 6" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
