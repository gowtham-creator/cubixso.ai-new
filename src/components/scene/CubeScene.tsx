"use client";

// CubeScene — persistent fixed R3F canvas behind every section.
// The Canvas itself needs the browser (WebGL), but we DON'T wrap with
// next/dynamic ssr:false — that would force the whole route subtree
// into CSR and kill SEO for the editorial text. Instead: render a
// placeholder div on server + first paint, swap in the live Canvas
// post-hydration via useEffect. SSR keeps text content for crawlers,
// hydration adds the cube on top.

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { Cube, type ThemeRef } from "./Cube";
import { PostFX } from "./PostFX";
import { useTheme } from "@/components/providers/ThemeProvider";

const FIXED_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 0,
  pointerEvents: "none",
};

// Low-power detection. When ANY of these are true we skip the R3F Canvas
// and serve a pre-rendered MP4 loop instead — keeps the visual rhythm of the
// hero cube without the WebGL frame budget.
type NavExt = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};
function detectLiteMode(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as NavExt;
  if (n.connection?.saveData) return true;
  if (n.connection?.effectiveType && /^(slow-2g|2g|3g)$/.test(n.connection.effectiveType)) return true;
  if (typeof n.deviceMemory === "number" && n.deviceMemory <= 2) return true;
  if (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency <= 2) return true;
  if (typeof window !== "undefined" && window.innerWidth <= 420) return true;
  return false;
}

// Routes where the global CubeScene should skip mounting — currently just
// the hero-test exploration which mounts its own Canvas.
const SKIP_ROUTES = new Set<string>(["/hero-test"]);

export function CubeScene() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [liteMode, setLiteMode] = useState(false);
  const { resolved } = useTheme();
  const isDark = resolved === "dark";
  const bg = isDark ? "#000000" : "#f5f5f7";

  // Stable theme ref — the Canvas subtree reads this IMPERATIVELY so a theme
  // toggle never forces a React re-render of any R3F element. Re-rendering R3F
  // primitives with inline `args={[new THREE.Geometry()]}` recreates them and
  // serializes the cyclic scene graph → "cannot serialize cyclic structures".
  // Mutating this ref + reading it in useFrame sidesteps that entirely.
  const themeRef = useRef<ThemeRef["current"]>({ isDark, bg });
  themeRef.current.isDark = isDark;
  themeRef.current.bg = bg;

  // Bail on routes that need a clean canvas (e.g. /hero-test).
  if (pathname && SKIP_ROUTES.has(pathname)) return null;

  useEffect(() => {
    setMounted(true);
    setLiteMode(detectLiteMode());
    const mq = window.matchMedia("(max-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setIsMobile(mq.matches); setReducedMotion(rm.matches); };
    sync();
    mq.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
    };
  }, []);

  if (!mounted) {
    return <div style={{ ...FIXED_STYLE, background: bg }} aria-hidden />;
  }

  // Reduced-motion users get a static bg — no canvas at all
  if (reducedMotion) {
    return <div style={{ ...FIXED_STYLE, background: bg }} aria-hidden />;
  }

  // Lite mode → pre-rendered MP4 loop. The video file may not exist yet
  // (it gets recorded once the cube state machine is final); the <video>
  // element silently falls back to the themed bg in that case.
  if (liteMode) {
    return (
      <div style={{ ...FIXED_STYLE, background: bg }} aria-hidden>
        <video
          autoPlay
          loop
          muted
          playsInline
          poster=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9,
          }}
        >
          <source src={isDark ? "/video/cube-loop-dark.mp4" : "/video/cube-loop-light.mp4"} type="video/mp4" />
        </video>
      </div>
    );
  }

  return <CanvasInner isMobile={isMobile} themeRef={themeRef} />;
}

// ThemeBridge — sets scene.background IMPERATIVELY from the theme ref each
// frame (cheap: only allocates a Color when the value actually changes).
function ThemeBridge({ themeRef }: { themeRef: ThemeRef }) {
  const { scene } = useThree();
  const last = useRef<string>("");
  useFrame(() => {
    const bg = themeRef.current.bg;
    if (bg !== last.current) {
      last.current = bg;
      scene.background = new THREE.Color(bg);
    }
  });
  return null;
}

// Stable Canvas — memoized so a theme toggle NEVER re-renders any R3F element.
// Theme flows in only through `themeRef` (a stable object), read imperatively
// by ThemeBridge (bg) and Cube (edge color). isMobile is the only prop that can
// change, and it rarely does. No reconciled primitives on theme change ⇒ no
// cyclic-structure crash.
const CanvasInner = memo(function CanvasInner({
  isMobile,
  themeRef,
}: {
  isMobile: boolean;
  themeRef: ThemeRef;
}) {
  const glOpts = useMemo(
    () => ({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" as const }),
    [isMobile],
  );
  const cameraOpts = useMemo(
    () => ({ position: [0, 0, 4] as [number, number, number], fov: 38, near: 0.1, far: 100 }),
    [],
  );
  const dprCap = useMemo<[number, number]>(
    () => (isMobile ? [1, 1.25] : [1, 1.75]),
    [isMobile],
  );

  return (
    <Canvas
      gl={glOpts}
      dpr={dprCap}
      camera={cameraOpts}
      frameloop="always"
      style={FIXED_STYLE}
    >
      <ThemeBridge themeRef={themeRef} />
      <Lighting />
      <Cube themeRef={themeRef} />
      <PostFX enabled={!isMobile} />
      <VisibilityGate />
    </Canvas>
  );
});

// Pauses the canvas when the document tab is hidden — drops idle GPU usage
// to zero. We rely on `frameloop="always"` + this gate rather than
// `frameloop="demand"` because the cube needs continuous frames for the
// scroll-driven morph, but we still want to bail when the tab is invisible.
function VisibilityGate() {
  const { invalidate, gl } = useThree();
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);

  useEffect(() => {
    const onVis = () => {
      visibleRef.current = !document.hidden;
      // Force a single repaint on resume so state catches up
      if (visibleRef.current) invalidate();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(rafRef.current);
    };
  }, [invalidate, gl]);

  // No-op frame to register the component into the loop without rendering geometry
  useFrame(() => { /* intentionally empty */ });
  return null;
}
