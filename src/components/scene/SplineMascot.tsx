"use client";

// SplineMascot → now a real INTERACTIVE 3D brand logo (user: "i want an
// interactible 3d logo here. not an 2d image"). A small transparent R3F
// canvas renders the frozen cube glb — the same geometry as the hero spine —
// with cobalt emissive edges. Idle: slow spin + gentle bob. Pointer: drag to
// tumble it (with inertia), hover swells it. No card, no black box — the
// cube floats directly over the page.
//
// Lazy-armed: mounts only after the user scrolls ~80% of a viewport so it
// never competes with the hero for first-paint budget. Suppressed on touch
// and under reduced motion (as before).

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { motion, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";
import { useDeviceTier, hasWebGL } from "@/lib/perf";
import { FrameCap } from "@/components/scene/FrameCap";

const MODEL_URL = cdn("/models/cubixso-cube.glb");
const DRACO_URL = cdn("/draco/");

function LogoCube({ hover, dark }: { hover: boolean; dark: boolean }) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL, DRACO_URL);

  // Clone scene + materials (independent of the cache — never mutate the glb).
  const [model] = useState(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = (m.material as THREE.MeshStandardMaterial).clone();
    });
    return c;
  });

  // Theme-adaptive monochrome brand mark: white edges on dark, charcoal on
  // light, so the logo reads in either mode.
  useEffect(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (dark) {
        mat.color.set("#eef1ff"); mat.emissive.set("#9fb0ff"); mat.emissiveIntensity = 0.55;
      } else {
        mat.color.set("#0c0c12"); mat.emissive.set("#000000"); mat.emissiveIntensity = 0;
      }
      mat.metalness = 0.2;
      mat.roughness = 0.35;
    });
  }, [dark, model]);

  // Drag-to-tumble with inertia. Idle spin resumes as inertia decays.
  const vel = useRef({ x: 0, y: 0.005 }); // idle yaw
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onUp = () => (dragging.current = false);
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  useFrame((state, delta) => {
    const o = root.current;
    if (!o) return;
    if (!dragging.current) {
      // inertia decay toward the idle spin
      vel.current.x += (0 - vel.current.x) * Math.min(1, delta * 2.2);
      vel.current.y += (0.005 - vel.current.y) * Math.min(1, delta * 2.2);
    }
    o.rotation.x += vel.current.x;
    o.rotation.y += vel.current.y;
    // gentle bob
    o.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
    // hover swell
    const target = hover ? 1.12 : 1.0;
    const s = o.scale.x + (target - o.scale.x) * Math.min(1, delta * 8);
    o.scale.setScalar(s);
  });

  return (
    <group
      ref={root}
      rotation={[0.4, 0.7, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        last.current = { x: e.clientX, y: e.clientY };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY };
        vel.current.y = dx * 0.004;
        vel.current.x = dy * 0.004;
      }}
    >
      <primitive object={model} />
    </group>
  );
}

export function SplineMascot() {
  const { resolved } = useTheme();
  const tier = useDeviceTier();
  const [armed, setArmed] = useState(false);
  const [hover, setHover] = useState(false);
  // Probe WebGL once on the client. Default true so SSR + first paint agree.
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);
  const lowTier = tier === "low";
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 14, mass: 1 });
  const sy = useSpring(y, { stiffness: 80, damping: 14, mass: 1 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setArmed(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Elastic cursor-follow of the whole anchor (unchanged behavior).
  useEffect(() => {
    if (!armed) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - (window.innerWidth - 80);
      const dy = e.clientY - (window.innerHeight - 80);
      x.set(Math.max(-20, Math.min(20, dx * 0.05)));
      y.set(Math.max(-20, Math.min(20, dy * 0.05)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [armed, x, y]);

  // Low-end / no-WebGL devices skip this decorative footer Canvas entirely.
  if (lowTier || !webgl) return null;

  if (!armed) return null;

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="pointer-events-auto fixed bottom-16 right-5 z-30 h-[132px] w-[132px] cursor-grab active:cursor-grabbing"
      data-cursor="cta"
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 4.4], fov: 38 }}
        style={{ background: "transparent" }}
        frameloop="demand"
      >
        {/* On every page for the whole visit: 30fps is indistinguishable for a
            slow ambient spin and a quarter of a 120Hz display's work. */}
        <FrameCap fps={30} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
        <LogoCube hover={hover} dark={resolved === "dark"} />
      </Canvas>
    </motion.div>
  );
}

// Called by LayoutChrome's loader right before the mascot mounts, not at module
// scope: this module now lives in the shared 3D entry (scene/homeCanvases), so a
// top-level preload would fetch the mascot GLB whenever the hero canvas loads.
export function preloadMascotModel() {
  useGLTF.preload(MODEL_URL, DRACO_URL);
}
