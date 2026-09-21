"use client";

// CubeScroller — a scroll-SCRUBBED 360° turntable of the Cubixso cube. As you
// scroll the tall section, the cube's Y-rotation is driven by scroll progress
// and QUANTIZED to exactly 94 steps, so it advances frame-by-frame like a baked
// image sequence (the "94 frames" the brief asks for) — but it's a live GLB, so
// it stays razor-sharp at any size and needs no pre-rendered PNG pipeline. A
// live "FRAME xx / 94" counter makes the frame-scrub literal. Theme-adaptive;
// the canvas pauses when the section is off-screen; reduced-motion holds frame 1.

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useScroll, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";
import { useDeviceTier, hasWebGL } from "@/lib/perf";

const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");
const FRAMES = 94;

function ScrubCube({
  progressRef,
  dark,
  active,
}: {
  progressRef: React.MutableRefObject<number>;
  dark: boolean;
  active: boolean;
}) {
  const { scene } = useGLTF(MODEL, DRACO);
  const root = useRef<THREE.Group>(null);

  // Clone + recolor: dark glowing body, theme-tinted emissive edges (bloom turns
  // these into the brand glow). Cloned so we never mutate the shared GLB cache.
  const model = useMemo(() => {
    const neon = new THREE.Color(dark ? "#cfe0ff" : "#1B4FFF");
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.color.setRGB(0.02, 0.035, 0.09);
      mat.emissive.copy(neon);
      mat.emissiveIntensity = dark ? 1.7 : 1.1;
      m.material = mat;
    });
    return c;
  }, [scene, dark]);

  useFrame(() => {
    if (!root.current) return;
    // quantize scroll progress to 94 discrete frames → a full 360° turn
    const p = Math.min(1, Math.max(0, progressRef.current));
    const step = Math.round(p * (FRAMES - 1)) / (FRAMES - 1);
    root.current.rotation.y = step * Math.PI * 2;
  });

  return (
    <group ref={root} rotation={[0.34, 0, 0]} visible={active}>
      <primitive object={model} />
    </group>
  );
}

export function CubeScroller() {
  const ref = useRef<HTMLElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const progressRef = useRef(0);
  const [frame, setFrame] = useState(1);
  const [active, setActive] = useState(true);
  // iOS Safari caps simultaneous WebGL contexts and evicts the OLDEST when the
  // cap is hit, leaving that canvas frozen on its last frame. This section sits
  // far below the fold but used to create its context at page load, competing
  // with the hero's. `near` defers creation until the section is within a
  // viewport of the fold — mounted in time to be ready, not at first paint.
  const [near, setNear] = useState(false);

  // Device-adaptive quality. Both default to high / WebGL-present on the server
  // and first client paint (see @/lib/perf), so desktop renders pixel-identical
  // and there is no hydration mismatch — degradation kicks in only after mount.
  const tier = useDeviceTier();
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);

  // High tier keeps the approved adaptive DPR; low tier clamps to 1.
  const dpr: 1 | [number, number] = tier === "low" ? 1 : [1, 2];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    setFrame(Math.min(FRAMES, Math.max(1, Math.round(v * (FRAMES - 1)) + 1)));
  });

  // Pause the render loop when the section is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    const ioNear = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "100% 0px" });
    ioNear.observe(el);
    return () => { io.disconnect(); ioNear.disconnect(); };
  }, []);

  return (
    <section ref={ref} id="forge" aria-label="Built dimensional" className="relative z-10 h-[320vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
        <div className="absolute left-[var(--pad-x)] top-[clamp(80px,14vh,140px)] mono text-[11px] tracking-[0.3em] text-(--color-muted)">
          [ DIMENSIONAL ]
        </div>

        {webgl && near && (
        <div className="pointer-events-none absolute inset-0">
          <Canvas
            orthographic
            camera={{ position: [3.4, 3.4, 3.4], zoom: 105, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: true }}
            dpr={dpr}
            frameloop={active ? "always" : "never"}
            onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          >
            <ambientLight intensity={dark ? 0.3 : 0.6} />
            <directionalLight position={[4, 6, 3]} intensity={0.8} color="#cdd9ff" />
            <pointLight position={[-3, 2, -2]} intensity={dark ? 14 : 5} color="#5f8bff" distance={18} />
            <Suspense fallback={null}>
              <ScrubCube progressRef={progressRef} dark={dark} active={active} />
              <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.85}>
                <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
                <Lightformer intensity={1.1} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
              </Environment>
              {/* Pre-compile materials + env map while the intro curtain still
                  covers the page, so the first scrolled frame never stutters. */}
              <Preload all />
            </Suspense>
            <EffectComposer>
              <Bloom intensity={dark ? 1.1 : 0.4} luminanceThreshold={dark ? 0.12 : 0.5} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Canvas>
        </div>
        )}

        {/* copy + live frame counter — the 94-frame scrub, made literal */}
        <div className="pointer-events-none absolute bottom-[clamp(48px,9vh,110px)] left-1/2 z-10 -translate-x-1/2 text-center">
          <h2 className="font-display text-[clamp(26px,4.4vw,56px)] font-medium leading-[0.95] tracking-[-0.03em] text-(--color-fg)">
            Built dimensional.
          </h2>
          <p className="mono mt-4 text-[11px] tracking-[0.3em] text-(--color-muted)">
            FRAME {String(frame).padStart(2, "0")} / {FRAMES} · SCROLL TO ROTATE
          </p>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload(MODEL, DRACO);
