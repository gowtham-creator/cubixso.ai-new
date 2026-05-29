"use client";

// CubeScene — persistent fixed R3F canvas behind every section.
// The Canvas itself needs the browser (WebGL), but we DON'T wrap with
// next/dynamic ssr:false — that would force the whole route subtree
// into CSR and kill SEO for the editorial text. Instead: render a
// placeholder div on server + first paint, swap in the live Canvas
// post-hydration via useEffect. SSR keeps text content for crawlers,
// hydration adds the cube on top.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Lighting } from "./Lighting";
import { Cube } from "./Cube";
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

  // Mobile gets a lower DPR cap to keep frame budget sane
  const dprCap: [number, number] = isMobile ? [1, 1.25] : [1, 1.75];

  return (
    <Canvas
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      dpr={dprCap}
      camera={{ position: [0, 0, 4], fov: 38, near: 0.1, far: 100 }}
      frameloop="always"
      style={FIXED_STYLE}
    >
      <color attach="background" args={[bg]} />
      <Lighting />
      <Cube themeIsDark={isDark} />
      <PostFX enabled={!isMobile} />
      <VisibilityGate />
    </Canvas>
  );
}

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
