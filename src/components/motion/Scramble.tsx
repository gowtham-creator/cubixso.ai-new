"use client";

// Scramble — per-character scramble-reveal. Inspired by the SplitText pattern
// from GSAP. Segmentation is delegated to @chenglou/pretext for accurate
// grapheme-cluster handling (emoji ZWJ sequences, combining marks, CJK,
// RTL); falls back to Intl.Segmenter then String.from(...) on environments
// where Pretext can't initialize.
//
// Behavior: when the wrapper scrolls into view (IntersectionObserver, 40%
// threshold), each grapheme cycles through random characters from a tuned
// glyph pool, then settles to its final character. Stagger gives a wave
// front that reads as kinetic without becoming illegible.
//
// Plays exactly once per page-life unless `replay` is set.

import { useEffect, useRef, useState } from "react";
import { prepareWithSegments } from "@chenglou/pretext";

const GLYPHS = "Σ∆ΩΦΨΞΠ░▒▓│┤╣║╗╝┐└┴┬├─┼╞╟╚╔╩╦╠═╬01<>/{}[]+=#$%&*";

function pickGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

// Token used as the "font" argument when we only care about segmentation,
// not measurement. Pretext caches per-font, so a stable string avoids
// repeated cache lookups.
const SEG_FONT = "16px sans-serif";

function splitGraphemes(s: string): string[] {
  // 1) Pretext — accurate grapheme-cluster segmentation (emoji ZWJ, combining
  //    marks, CJK, RTL). Browser-only; canvas-backed.
  if (typeof document !== "undefined") {
    try {
      const prepared = prepareWithSegments(s, SEG_FONT);
      if (prepared.segments && prepared.segments.length > 0) {
        return prepared.segments;
      }
    } catch {
      // fall through
    }
  }
  // 2) Intl.Segmenter — modern Node + browser fallback.
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(s), (it) => it.segment);
  }
  // 3) Last-resort code-point split (loses graphemes but never throws).
  return Array.from(s);
}

interface ScrambleProps {
  text: string;
  /** Total scramble duration (ms). Each char settles before this expires. */
  duration?: number;
  /** Per-character start stagger (ms). */
  stagger?: number;
  /** IntersectionObserver visibility threshold (0–1). */
  threshold?: number;
  /** Re-scramble every time it enters view. Defaults to once-only. */
  replay?: boolean;
  /** Glyph-cycle interval per character (ms). */
  tick?: number;
  className?: string;
  /** Render as a `<span>` (default) or honour a custom element via `as`. */
  as?: keyof React.JSX.IntrinsicElements;
}

export function Scramble({
  text,
  duration = 720,
  stagger = 28,
  threshold = 0.4,
  replay = false,
  tick = 36,
  className = "",
  as: As = "span",
}: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string>(text);
  const playedRef = useRef(false);
  const graphemes = useRef(splitGraphemes(text));

  // If `text` changes after mount, re-snapshot.
  useEffect(() => {
    graphemes.current = splitGraphemes(text);
    setDisplay(text);
    playedRef.current = false;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    const play = () => {
      if (playedRef.current && !replay) return;
      playedRef.current = true;

      const chars = graphemes.current;
      const settleAt = chars.map((_, i) => i * stagger);
      const state = chars.map((c) => (c.trim() === "" ? c : pickGlyph()));
      const start = performance.now();

      let raf = 0;
      let lastTick = start;

      const step = (now: number) => {
        const elapsed = now - start;
        let allSettled = true;
        if (now - lastTick >= tick) {
          for (let i = 0; i < chars.length; i++) {
            if (elapsed >= settleAt[i] + duration * 0.4) {
              state[i] = chars[i];
            } else if (elapsed >= settleAt[i]) {
              allSettled = false;
              state[i] = chars[i].trim() === "" ? chars[i] : pickGlyph();
            } else {
              allSettled = false;
            }
          }
          setDisplay(state.join(""));
          lastTick = now;
        }
        if (!allSettled && elapsed < duration + stagger * chars.length + 200) {
          raf = requestAnimationFrame(step);
        } else {
          setDisplay(chars.join(""));
        }
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            play();
            if (!replay) io.disconnect();
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, duration, stagger, threshold, replay, tick]);

  const Component = As as keyof React.JSX.IntrinsicElements;
  return (
    <Component
      ref={ref as React.Ref<HTMLSpanElement>}
      className={`tabular-nums ${className}`}
      aria-label={text}
    >
      {display}
    </Component>
  );
}
