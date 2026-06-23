"use client";

// Aurora — the BREATHING GRADIENT VOID (Aurora Glass v3, system 1).
// A fixed, full-viewport, pointer-events-none layer that mounts ONCE in the
// layout immediately BEFORE <VoidCube/>. Both sit at z-index 0; DOM order
// stacks the (now transparent) VoidCube canvas ABOVE this layer, so the
// render order back-to-front is: black base → aurora blobs → cube/particles
// → liquid-glass content.
//
// It paints:
//   • the pure-black void base (var(--color-bg) — follows the light theme),
//   • 4 huge radial-gradient blobs (Deep Blue #182350 → cobalt #1B4FFF →
//     violet #4338ca → Powder Blue #AFD2FA, each at 4–8% alpha),
//     filter: blur(120px), drifting on transform-only keyframe loops 60–90s.
//
// SCROLL-LINKED HUE: the blob container carries
// filter: hue-rotate(var(--aurora-shift)) — the shift is written from the
// ScrollProvider's pMotion (already rAF-throttled + passive), progressing
// 0deg at the hero → ~40deg at FinalCTA. Style writes only, zero re-renders.
//
// THEME: html[data-theme="light"] swaps every blob to Floral White / Powder
// Blue tints via CSS custom-prop overrides — no JS involvement.
//
// prefers-reduced-motion ⇒ no drift, no hue progression — static blobs.
// Styles are injected once via a deduped <style> tag (LiquidGlass pattern).

import { useEffect, useRef, useState } from "react";
import { useScrollP } from "@/components/scroll/ScrollProvider";

// Total hue progression across the full page scroll (hero 0deg → FinalCTA).
const HUE_SWEEP_DEG = 40;

export function Aurora() {
  const field = useRef<HTMLDivElement>(null);
  const { pMotion } = useScrollP();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Scroll-linked hue progression — write --aurora-shift straight onto the
  // blob container. pMotion only fires when progress actually moves, so a
  // still page costs nothing. Reduced-motion holds the static 0deg.
  useEffect(() => {
    if (reduced) return;
    const el = field.current;
    if (!el) return;
    const apply = (p: number) =>
      el.style.setProperty(
        "--aurora-shift",
        `${(p * HUE_SWEEP_DEG).toFixed(2)}deg`
      );
    apply(pMotion.get());
    return pMotion.on("change", apply);
  }, [pMotion, reduced]);

  return (
    <div className="aurora" aria-hidden>
      <div ref={field} className="aurora-field">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>
      <AuroraStyles />
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
// Injected once (deduped by a module flag) so the layer is self-contained
// without touching globals.css — same pattern as LiquidGlass.

let injected = false;
function AuroraStyles() {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (injected) return;
    injected = true;
    setMount(true);
  }, []);
  if (!mount) return null;
  return <style data-aurora="">{AURORA_CSS}</style>;
}

const AURORA_CSS = `
.aurora{
  position:fixed;
  inset:0;
  z-index:0;
  pointer-events:none;
  overflow:hidden;
  /* TRANSPARENT — the cinematic VideoVoid film renders beneath this layer
     (the body supplies the black base once the film fades past the hero). */
  background:transparent;
}
.aurora-field{
  position:absolute;
  inset:0;
  --aurora-shift:0deg;
  filter:hue-rotate(var(--aurora-shift));
}
/* Each blob = one huge radial gradient (--a-c1 core → --a-c2 mid → clear),
   heavily blurred, drifting on a transform-only alternate loop. */
.aurora-blob{
  position:absolute;
  width:110vmax;
  height:110vmax;
  border-radius:50%;
  background:radial-gradient(closest-side, var(--a-c1), var(--a-c2) 45%, transparent 72%);
  filter:blur(120px);
  will-change:transform;
}

/* Deep Blue → cobalt — the dominant mass, upper-left. */
.aurora-blob-1{
  top:-38%; left:-28%;
  --a-c1:color-mix(in oklab, var(--color-deep-blue) 19%, transparent);
  --a-c2:color-mix(in oklab, var(--color-cobalt) 13%, transparent);
  animation:aurora-drift-1 78s ease-in-out infinite alternate;
}
/* Cobalt → violet (#4338ca, brief-specified) — right flank. */
.aurora-blob-2{
  top:-12%; right:-34%;
  --a-c1:color-mix(in oklab, var(--color-cobalt) 16%, transparent);
  --a-c2:color-mix(in oklab, #4338ca 12%, transparent);
  animation:aurora-drift-2 90s ease-in-out infinite alternate;
}
/* Violet → Powder Blue — low and slow, bottom-left. */
.aurora-blob-3{
  bottom:-42%; left:-18%;
  --a-c1:color-mix(in oklab, #4338ca 14%, transparent);
  --a-c2:color-mix(in oklab, var(--color-powder) 9%, transparent);
  animation:aurora-drift-3 66s ease-in-out infinite alternate;
}
/* Faint powder breath dead-center — the cube's halo. */
.aurora-blob-4{
  top:-10%; left:5%;
  width:90vmax; height:90vmax;
  --a-c1:color-mix(in oklab, var(--color-powder) 9%, transparent);
  --a-c2:color-mix(in oklab, var(--color-deep-blue) 11%, transparent);
  animation:aurora-drift-4 84s ease-in-out infinite alternate;
}

/* ── DRIFT — transform-only, 60–90s, alternate (no snap on loop) ────────── */
@keyframes aurora-drift-1{
  from{ transform:translate3d(0,0,0) scale(1); }
  to  { transform:translate3d(10vw,9vh,0) scale(1.18); }
}
@keyframes aurora-drift-2{
  from{ transform:translate3d(0,0,0) scale(1.1); }
  to  { transform:translate3d(-12vw,12vh,0) scale(0.92); }
}
@keyframes aurora-drift-3{
  from{ transform:translate3d(0,0,0) scale(0.95); }
  to  { transform:translate3d(13vw,-9vh,0) scale(1.15); }
}
@keyframes aurora-drift-4{
  from{ transform:translate3d(0,0,0) scale(1); }
  to  { transform:translate3d(-8vw,-11vh,0) scale(1.12); }
}

/* ── LIGHT THEME — soft powder-blue washes + a cobalt-glow accent + floral
   warmth, over the cool off-white canvas. (NB: --color-powder is overridden to
   deep cobalt in light for TEXT legibility, so the blobs use literal soft sky
   tones here, not that token, to stay gentle rather than heavy.) ─────────── */
html[data-theme="light"] .aurora-blob-1{
  --a-c1:color-mix(in oklab, #AFD2FA 64%, transparent);
  --a-c2:color-mix(in oklab, #4A7BFF 26%, transparent);
}
html[data-theme="light"] .aurora-blob-2{
  --a-c1:color-mix(in oklab, #4A7BFF 28%, transparent);
  --a-c2:color-mix(in oklab, var(--color-floral) 50%, transparent);
}
html[data-theme="light"] .aurora-blob-3{
  --a-c1:color-mix(in oklab, #AFD2FA 52%, transparent);
  --a-c2:color-mix(in oklab, var(--color-floral) 34%, transparent);
}
html[data-theme="light"] .aurora-blob-4{
  --a-c1:color-mix(in oklab, var(--color-floral) 52%, transparent);
  --a-c2:color-mix(in oklab, #AFD2FA 30%, transparent);
}

/* ── REDUCED MOTION — static blobs, no drift (hue is held at 0deg in JS) ── */
@media (prefers-reduced-motion: reduce){
  .aurora-blob{ animation:none !important; }
}
`;

export default Aurora;
