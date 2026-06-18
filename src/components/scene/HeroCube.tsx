"use client";

// HeroCube — a SMALL, quiet live cube that sits to the SIDE of the hero (right),
// clear of the headline. Reuses the FROZEN cubixso-cube.glb (no rebuild). Slow
// idle Y-spin only; heavily-damped subtle scroll drift. Render loop pauses when
// scrolled out of view (IntersectionObserver) so it never janks the page.
//
// Desktop only (hidden < lg) — there's no clean space beside the headline on
// small screens, and it keeps the mobile frame budget free.

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { CubixsoCube } from "./CubixsoCube";

export function HeroCube() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // Pause rendering when the cube scrolls out of the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.04 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute right-[clamp(8px,3vw,72px)] top-1/2 -translate-y-1/2 hidden lg:block w-[clamp(220px,24vw,360px)] aspect-square z-0"
    >
      <Canvas
        orthographic
        camera={{ position: [3.46, 3.46, 3.46], zoom: 70, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-3, 2, -2]} intensity={18} color="#dfe8ff" distance={16} />
        <Suspense fallback={null}>
          <CubixsoCube mode="hero" active={active} />
          <Environment resolution={128} frames={1} environmentIntensity={0.8}>
            <Lightformer intensity={2.4} color="#ffffff" position={[0, 3, 3]} scale={[7, 3, 1]} />
            <Lightformer intensity={1.4} color="#eef2ff" position={[-4, 1, 2]} scale={[3, 4, 1]} />
            <Lightformer intensity={1.2} color="#ffffff" position={[4, -1, -3]} scale={[5, 3, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
