"use client";

// AudioToggle — bottom-right toggle pill for the site's audio gate. Off by
// default per locked decision. The ambient itself is the synthesized cinematic
// pad in src/lib/feedback.ts (startAmbient/stopAmbient) — no asset files; this
// component only flips the shared gate via setAudioEnabled() and mirrors
// external changes (the intro's "ENTER WITH SOUND" choice) via the
// `cubixso:audio` event, so there is exactly ONE source of truth.
//
// It also hosts the SECTION-WHOOSH subscriber: a single IntersectionObserver
// over every `section[id]` fires whoosh() on each section's FIRST reveal
// (whoosh is internally throttled ≥2s and gated on the audio toggle). A
// childList MutationObserver re-scans after route changes. Both observers are
// torn down in the effect cleanup, so React StrictMode's double-mount never
// leaks a second instance.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AUDIO_EVENT,
  click,
  isAudioEnabled,
  setAudioEnabled,
  whoosh,
} from "@/lib/feedback";

export function AudioToggle() {
  const [on, setOn] = useState(false);

  // Adopt the engine's current state and stay in sync with any other
  // publisher of the shared audio gate.
  useEffect(() => {
    setOn(isAudioEnabled());
    const sync = (e: Event) =>
      setOn(Boolean((e as CustomEvent<{ on: boolean }>).detail?.on));
    window.addEventListener(AUDIO_EVENT, sync);
    return () => window.removeEventListener(AUDIO_EVENT, sync);
  }, []);

  // prefers-reduced-motion — freeze the pulsing bars (static tall state).
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // SECTION WHOOSH — first reveal per section[id], app-wide, observers only.
  useEffect(() => {
    const tracked = new WeakSet<Element>(); // observed once, whooshed once
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target); // first reveal only
          whoosh(); // gated on the audio toggle + throttled ≥2s internally
        }
      },
      { threshold: 0.22 }
    );
    const scan = () => {
      document.querySelectorAll("section[id]").forEach((s) => {
        if (tracked.has(s)) return;
        tracked.add(s);
        io.observe(s);
      });
    };
    scan();

    // Route changes swap the page tree — re-scan on childList mutations,
    // coalesced to one scan per frame.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <motion.button
      type="button"
      onClick={() => {
        const next = !on;
        setOn(next);
        // Gate + ambient flip INSIDE this click gesture (autoplay-legal);
        // click() after so turning ON answers audibly, OFF stays haptic-only.
        setAudioEnabled(next);
        click();
      }}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      aria-pressed={on}
      title={on ? "Sound on" : "Sound off"}
      data-cursor="cta"
      // hubtown placement: a compact pill living in the nav's top-right
      // cluster (rendered by Nav). Label collapses to bars-only on small
      // screens so the cluster never crowds the hamburger.
      className="group cursor-pointer flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-(--color-line-2) px-3 py-2.5 mono text-[10.5px] text-(--color-fg-2) hover:text-(--color-fg) hover:border-(--color-fg) hover:bg-(--color-surface)/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-2)"
    >
      {/* Animated bars — three rectangles that pulse when sound is on */}
      <span className="inline-flex items-end gap-[2px] w-[14px] h-[12px]" aria-hidden>
        {/* CSS keyframes (.cbx-eq in globals.css), not a framer loop: this
            sits in the nav on every page with sound ON by default, and the
            infinite framer scaleY wrote three inline styles every frame for the
            whole visit — the busiest per-frame writer measured under the intro.
            A CSS transform animation runs on the compositor instead. */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`block w-[3px] origin-bottom rounded-sm bg-current ${on && !reduced ? "cbx-eq" : "transition-transform duration-300"}`}
            style={{
              height: "100%",
              transform: `scaleY(${on ? 0.85 : 0.35})`, // resting value; .cbx-eq overrides
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </span>
      <span className="hidden md:inline">{on ? "SOUND ON" : "SOUND OFF"}</span>
    </motion.button>
  );
}
