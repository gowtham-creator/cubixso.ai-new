"use client";

// CursorFollower — bespoke precision cursor. A solid dot is glued to the pointer
// for accuracy; a thin ring trails it with eased lag. THEME-ADAPTIVE: ink is
// white on the dark page, charcoal on the light page, so it reads on either.
// Over a clickable the ring expands and both ring + dot pick up the brand cobalt
// with a soft glow; pressing contracts the ring (tactile feedback). Hidden over
// text inputs and when the pointer leaves the window. Disabled on touch +
// reduced-motion (native cursor restored by globals.css).

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function CursorFollower() {
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const downRef = useRef(false);

  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false); // over a clickable
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);

    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    ring.current = { ...target.current };

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const clickable = !!t.closest("a, button, [role='button'], [data-cursor='cta']");
      const input = t.tagName === "INPUT" || t.tagName === "TEXTAREA";
      setActive(clickable);
      setHidden(input);
    };
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    const onDown = () => { downRef.current = true; };
    const onUp = () => { downRef.current = false; };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      // dot glued to the pointer for precision; ring trails with eased lag.
      // Frame-rate-independent smoothing: convert a per-frame ease into a
      // time-based one so the trail never lags badly on a slow frame and
      // stays consistent across 60/120Hz displays.
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const k = 1 - Math.exp(-16 * dt); // smoother than 0.18/frame, settles fast
      ring.current.x += (target.current.x - ring.current.x) * k;
      ring.current.y += (target.current.y - ring.current.y) * k;
      const press = downRef.current ? 0.82 : 1;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${press})`;
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
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  if (!enabled) return null;

  const base = dark ? "236,239,247" : "12,12,18"; // ink, theme-adaptive
  const cobalt = "74,123,255";
  const ease = "cubic-bezier(.22,1,.36,1)";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* trailing ring — expands + goes cobalt over clickables */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          width: active ? 44 : 26,
          height: active ? 44 : 26,
          border: `1.5px solid rgba(${active ? cobalt : base},${active ? 1 : 0.4})`,
          background: active ? `rgba(${cobalt},0.1)` : "transparent",
          boxShadow: active ? `0 0 0 1px rgba(${cobalt},0.25), 0 0 18px rgba(${cobalt},0.45)` : "none",
          opacity: hidden ? 0 : 1,
          transition: `width .2s ${ease}, height .2s ${ease}, border-color .16s ease, background .16s ease, box-shadow .16s ease, opacity .15s ease`,
        }}
      />
      {/* precision dot — glued to pointer, picks up cobalt on hover */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full will-change-transform"
        style={{
          width: active ? 6 : 5,
          height: active ? 6 : 5,
          background: `rgba(${active ? cobalt : base},${active ? 1 : 0.9})`,
          boxShadow: active ? `0 0 12px rgba(${cobalt},0.9)` : "none",
          opacity: hidden ? 0 : 1,
          transition: `width .16s ${ease}, height .16s ${ease}, background .16s ease, box-shadow .16s ease, opacity .15s ease`,
        }}
      />
    </div>
  );
}
