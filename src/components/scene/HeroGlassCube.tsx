"use client";

// HeroGlassCube — faithful port of the cubixso-ai (Vercel) hero centerpiece:
// a translucent GLASS cube with thin chromatic-fringed edges and a solid
// electric-cobalt extruded "Y" floating inside it. Theme-adaptive:
//   • light → clear glass (MeshTransmissionMaterial, real chromatic aberration)
//             + solid blue Y on the soft light field, exactly like the reference.
//   • dark  → the same cube but GLOWING (bright edges + emissive Y + bloom) so it
//             reads on near-black, where clear glass would vanish.
//
// The Y silhouette is the brand glyph, traced from the logo SVG strokes (same
// shape used by the scroll cube in scene/Cube.tsx). Render loop pauses when the
// hero scrolls out of view. prefers-reduced-motion holds it still.

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useDeviceTier, detectTier, hasWebGL } from "@/lib/perf";
import { afterReveal } from "@/lib/useWarmMount";
import { CanvasBoundary } from "@/components/util/CanvasBoundary";

const ACCENT = "#1B4FFF";       // electric cobalt — the Y

// The WebGL scene lives in its own chunk. A static import here put three, R3F,
// drei and postprocessing (~450 KB transferred) in the homepage's initial JS,
// referenced straight from the HTML, so they downloaded at ~250ms alongside the
// intro loader. Loading renders nothing: the sized box below holds the layout,
// exactly as it does before `armed`.
// Shares its entry with CubeScroller's canvas so three ships once (see homeCanvases).
const loadCanvas = () =>
  import("@/components/scene/homeCanvases").then((m) => m.HeroGlassCubeCanvas);
const HeroGlassCubeCanvas = dynamic(loadCanvas, { ssr: false, loading: () => null });

// Static fallback glyph — a tasteful CSS cube wireframe with the cobalt Y,
// shown when WebGL is unavailable so the hero never renders a blank/broken
// canvas. Pure CSS/SVG, theme-adaptive, no GPU required.
function StaticCubeFallback({ dark }: { dark: boolean }) {
  const edge = dark ? "#e6f0ff" : "#8aa0d8";
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      style={{ filter: dark ? "drop-shadow(0 0 22px rgba(74,123,255,0.5))" : "none" }}
    >
      {/* cube cage — diamond silhouette with a vertical front edge, matching
          the 3D pose (cage rotated 45°, look-down camera) */}
      <g
        fill="none"
        stroke={edge}
        strokeWidth={dark ? 2 : 1.1}
        strokeLinejoin="round"
        opacity={dark ? 0.95 : 0.8}
      >
        <polygon points="100,18 168,58 168,142 100,182 32,142 32,58" />
        <path d="M100,18 L100,100 M100,100 L168,142 M100,100 L32,142" />
      </g>
      {/* solid cobalt Y */}
      <path
        d="M100,72 L84,52 L92,52 L100,64 L108,52 L116,52 Z M96,72 L104,72 L104,108 L96,108 Z"
        fill={ACCENT}
      />
    </svg>
  );
}

export function HeroGlassCube({
  className,
  boxClassName,
}: { className?: string; boxClassName?: string } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  // Device-adaptive quality. Both default to high / WebGL-present on the server
  // and first client paint (see @/lib/perf), so desktop renders pixel-identical
  // and there's no hydration mismatch; the client re-detects after mount.
  const tier = useDeviceTier();
  const [webgl, setWebgl] = useState(true);
  // A lost context leaves the last frame painted, so the cube looks rendered
  // but frozen. Swap to the static mark instead of lying about being live.
  const [lost, setLost] = useState(false);
  useEffect(() => setWebgl(hasWebGL()), []);
  const low = tier === "low";

  // Phones/tablets build the canvas only once the intro curtain has lifted and
  // the headline has landed. Building it during the intro — WebGL context, R3F
  // scene, physical-material shaders, environment map — measured 0.7s + 0.9s of
  // main-thread stalls on a cold mobile load (4x CPU), right in the intro's
  // first second when the wordmark and keywords animate: the loader lag. It
  // then rendered 30fps behind the opaque curtain for nothing. Desktop keeps
  // building at once, hidden by the curtain. Starts false on the server and
  // the first client render so both agree.
  //
  // Arming on desktop is what starts the lazy chunk download — after hydration
  // rather than from the HTML, so it no longer races the intro's own JS but is
  // still built well before the curtain lifts. Phones fetch the chunk in idle
  // time right after the reveal so it is already on hand when the 1.6s timer
  // arms the canvas, keeping their timing exactly as before.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (detectTier() !== "low") { setArmed(true); return; }
    const offFetch = afterReveal(() => { void loadCanvas(); });
    const offArm = afterReveal(() => setArmed(true), 1600);
    return () => { offFetch(); offArm(); };
  }, []);
  const [drawn, setDrawn] = useState(false);

  // On mobile/tablet the Canvas is constrained to a small box (see Hero), so the
  // cube's bloom would clip at the box edge and show a faint rectangle. Scale the
  // cube down there to leave glow margin inside the canvas. Desktop = full bleed.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);


  // Keeping the canvas mounted forever is what freezes the cube on iOS. Safari
  // caps live WebGL contexts and evicts the OLDEST one when a new canvas asks
  // for another — measured on this page: hero + scroll cube + map = 3 contexts
  // alive at once. The evicted canvas keeps its last frame painted, so the cube
  // looks rendered but never moves. Eviction does not reliably fire
  // `webglcontextlost` either, so we cannot only react to that event.
  //
  // So: unmount the canvas once the hero is more than half a viewport away, and
  // mount a FRESH one (new `gen` key) on the way back. One hero context, only
  // while it is actually near the screen.
  const [near, setNear] = useState(true);
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.02 },
    );
    const ioNear = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      // 200% (was 50%). Remounting costs a fresh WebGL context plus a shader
      // compile — roughly a second — and at 50% that bill came due exactly as
      // the hero re-entered view, so scrolling back to the top showed an empty
      // slot and then a pop-in. Two viewports of lead time means the canvas is
      // already warm before the hero is anywhere near the screen.
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    ioNear.observe(el);
    return () => { io.disconnect(); ioNear.disconnect(); };
  }, []);

  // Coming back into view after a loss: drop the dead canvas and build a new one.
  useEffect(() => {
    if (near && lost) { setLost(false); setGen((g) => g + 1); }
  }, [near, lost]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 z-0 flex items-center justify-center"}
    >
      <div className={boxClassName ?? "aspect-square w-[min(80vw,680px)]"}>
        {!webgl || lost ? (
          <StaticCubeFallback dark={dark} />
        // Unmounting is a MOBILE concession, not a universal one. iOS Safari
        // caps live WebGL contexts and evicts the oldest, which is what froze
        // this cube; desktop has no such cap, so paying a context + shader
        // rebuild there bought nothing and cost a visible pop-in on every
        // scroll back to the top. High-tier devices now keep the canvas mounted
        // for the life of the page and simply pause its frameloop.
        ) : !armed || (low && !near) ? null : (
        <CanvasBoundary fallback={<StaticCubeFallback dark={dark} />}>
        <HeroGlassCubeCanvas
          key={gen}
          dark={dark}
          active={active}
          low={low}
          compact={compact}
          drawn={drawn}
          onDrawn={() => setDrawn(true)}
          onLost={() => setLost(true)}
        />
        </CanvasBoundary>
        )}
      </div>
    </div>
  );
}
