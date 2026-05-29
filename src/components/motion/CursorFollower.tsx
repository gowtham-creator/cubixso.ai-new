"use client";

// CursorFollower — Tenbin-style 6px dot that lerp-follows the pointer.
// Mix-blend-mode difference inverts whatever it sits over, which is what
// makes a tiny white dot read as a "premium" pointer.
//
// Variant rules:
//   default → 6px dot, white
//   ibeam   → thin vertical bar over [data-cursor="text"] or h1/h2/h3 + p
//   cta     → 48px ring with arrow over [data-cursor="cta"], a, button
//   hidden  → faded out completely when over <input>, <textarea>, [data-cursor="hide"]
//
// Disabled entirely on touch devices and when prefers-reduced-motion is on,
// since both make a custom pointer feel wrong.

import { useEffect, useRef, useState } from "react";

type Variant = "default" | "ibeam" | "cta" | "hidden";

export function CursorFollower() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  const [variant, setVariant] = useState<Variant>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;
    setEnabled(true);

    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    pos.current = { ...target.current };
    ringPos.current = { ...target.current };

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      const cursorAttr = t.closest("[data-cursor]")?.getAttribute("data-cursor");
      if (cursorAttr === "cta" || t.closest("a, button") ||
          tag === "A" || tag === "BUTTON") {
        setVariant("cta");
      } else if (cursorAttr === "text" ||
                 t.closest("h1, h2, h3, h4, p, blockquote")) {
        setVariant("ibeam");
      } else if (cursorAttr === "hide" || tag === "INPUT" || tag === "TEXTAREA") {
        setVariant("hidden");
      } else {
        setVariant("default");
      }
    };

    const onLeave = () => setVariant("hidden");
    const onEnter = () => setVariant("default");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    let raf = 0;
    const tick = () => {
      // Dot lerp — fast (snappy, reads like the pointer itself)
      pos.current.x += (target.current.x - pos.current.x) * 0.35;
      pos.current.y += (target.current.y - pos.current.y) * 0.35;
      // Ring lerp — slower (gives the magnetic trailing feel)
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${pos.current.x - 3}px, ${pos.current.y - 3}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ mixBlendMode: "difference" }}
    >
      {/* Inner dot — always white in difference space */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 will-change-transform transition-[width,height,opacity,border-radius] duration-200 ease-out"
        style={{
          width: variant === "ibeam" ? 2 : variant === "cta" ? 0 : 6,
          height: variant === "ibeam" ? 28 : variant === "cta" ? 0 : 6,
          borderRadius: variant === "ibeam" ? 1 : 999,
          background: "#ffffff",
          opacity: variant === "hidden" ? 0 : 1,
        }}
      />

      {/* Outer ring — only visible for cta */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 grid place-items-center -translate-x-1/2 -translate-y-1/2 will-change-transform transition-[width,height,opacity,border-color] duration-300 ease-out"
        style={{
          width: variant === "cta" ? 56 : 0,
          height: variant === "cta" ? 56 : 0,
          border: "1px solid #ffffff",
          borderRadius: 999,
          opacity: variant === "cta" ? 1 : 0,
        }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "#ffffff" }}
        >
          →
        </span>
      </div>
    </div>
  );
}
