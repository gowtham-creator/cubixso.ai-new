"use client";

// CubeScroller — a scroll-SCRUBBED 360° turntable of the Cubixso cube, which
// you can also grab and spin yourself. It's a live GLB, so it stays razor-sharp
// at any size and needs no pre-rendered PNG pipeline, and a live "FRAME xx / 94"
// counter reads out scroll progress. Theme-adaptive; the canvas pauses when the
// section is off-screen; reduced-motion holds frame 1.
//
// The rotation was originally quantized to 94 discrete steps to imitate a baked
// image sequence. It now turns continuously with exponential smoothing, and a
// manual drag offset composes on top of the scroll-driven angle — see ScrubCube
// for the motion and the drag effect below for the gesture.

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
  dragRef,
  dark,
  active,
}: {
  progressRef: React.MutableRefObject<number>;
  dragRef: React.MutableRefObject<{ x: number; y: number }>;
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

  useFrame((_, delta) => {
    if (!root.current) return;
    // Rotation used to be QUANTIZED to 94 discrete steps, to read like a baked
    // image sequence. On a real scroll that is what "not smooth" means: the cube
    // snaps between frames roughly 4° at a time instead of turning. It is now
    // continuous, with exponential smoothing so it eases toward the scroll
    // position rather than tracking it rigidly — that also absorbs the coarse,
    // bursty deltas a trackpad or wheel produces. The FRAME counter still reads
    // out of 94, so the concept survives; only the motion changed.
    const p = Math.min(1, Math.max(0, progressRef.current));
    const targetY = p * Math.PI * 2 + dragRef.current.x;
    const targetX = 0.34 + dragRef.current.y;

    // Frame-rate independent smoothing: the same easing at 60fps and 120fps.
    const k = 1 - Math.exp(-9 * Math.min(delta, 0.1));
    root.current.rotation.y += (targetY - root.current.rotation.y) * k;
    root.current.rotation.x += (targetX - root.current.rotation.x) * k;
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
  // Manual rotation offset, added on top of the scroll-driven rotation so the
  // two compose instead of fighting. Kept in a ref: it changes every pointermove
  // and must not re-render React on each one.
  const dragRef = useRef({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  // Drag to rotate, matching the contact-page globe's interaction. Pointer (not
  // mouse) events so it works on touch, and setPointerCapture so the gesture
  // survives the cursor leaving the canvas.
  //
  // touch-action is pan-y, NOT none: this is a scroll-driven section, so taking
  // vertical panning away from touch users would trap them inside it. The
  // browser keeps vertical scroll; we take horizontal drag. On a mouse, where
  // there is no such conflict, both axes are ours.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const touch = e.pointerType === "touch";
      const sx = e.clientX, sy = e.clientY;
      const start = { ...dragRef.current };
      let dragging = false;
      try { el.setPointerCapture(e.pointerId); } catch { /* not captureable */ }

      const move = (m: PointerEvent) => {
        const dx = m.clientX - sx;
        const dy = m.clientY - sy;
        // On touch, only claim the gesture once it is clearly horizontal —
        // otherwise a vertical swipe meant as a scroll would rotate the cube.
        if (touch && !dragging && Math.abs(dx) < Math.abs(dy)) return;
        dragging = true;
        dragRef.current.x = start.x + dx * 0.008;
        // Clamp tilt so the cube can never flip onto its head.
        if (!touch) {
          dragRef.current.y = Math.max(-0.8, Math.min(0.8, start.y - dy * 0.006));
        }
        el.style.cursor = "grabbing";
      };
      const up = () => {
        el.style.cursor = "grab";
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    };

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [near]);

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
    // 250% (was 100%): the GLB + Draco decode + material compile is not instant,
    // and mounting only one viewport ahead meant the canvas was still warming up
    // when the section arrived — the "cube takes time to show up" report. Two
    // and a half viewports of lead time covers the download at typical scroll
    // speeds while still keeping the WebGL context released for most of the page.
    const ioNear = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "250% 0px" });
    ioNear.observe(el);
    return () => { io.disconnect(); ioNear.disconnect(); };
  }, []);

  return (
    // 180vh, down from 320vh via 220vh. The sticky panel pins for track height
    // minus one viewport, so the original spent 2.2 viewports of scrolling on a
    // single rotation, and with the cube centred the lower half of each of those
    // screens was empty — that dead run is what read as "so much gap" between
    // this section and the testimonials. 180vh still gives a full 360° turn
    // across 0.8 of a viewport of scrub, which is plenty at this rotation speed.
    <section ref={ref} id="forge" aria-label="Built dimensional" className="relative z-10 h-[180vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
        <div className="absolute left-[var(--pad-x)] top-[clamp(80px,14vh,140px)] mono text-[11px] tracking-[0.3em] text-(--color-muted)">
          [ DIMENSIONAL ]
        </div>

        {webgl && near && (
        <div
          ref={stageRef}
          // Was pointer-events-none. The cube is now grabbable, so the stage has
          // to receive pointers — see the drag effect above for why touch-action
          // is pan-y rather than none.
          className="absolute inset-0 cursor-grab"
          style={{ touchAction: "pan-y" }}
        >
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
              <ScrubCube progressRef={progressRef} dragRef={dragRef} dark={dark} active={active} />
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
