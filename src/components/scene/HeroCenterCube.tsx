"use client";

// HeroCenterCube — the large, CENTERED glowing Y-cube for the Omma-format hero.
// Same frozen cubixso-cube.glb as the loader/side cube, but big and centred with
// UnrealBloom for the neon glow seen in the reference. Render loop pauses when
// the hero scrolls out of view (IntersectionObserver) so it never janks.

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { CubixsoCube } from "./CubixsoCube";
import { useTheme } from "@/components/providers/ThemeProvider";

export function HeroCenterCube({
  className,
  boxClassName,
}: { className?: string; boxClassName?: string } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  // Theme-adaptive glow so the cube reads on BOTH fields:
  //  • dark  → icy white-blue edges, strong bloom (glows on pure black)
  //  • light → deep electric cobalt, gentler bloom (a blue glass cube + Y on
  //            pure white, like the reference — white-on-white would vanish)
  const accent = dark ? "#cfe0ff" : "#1B4FFF";
  const bloomIntensity = dark ? 1.15 : 0.55;
  const bloomThreshold = dark ? 0.15 : 0.45;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.02 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 z-0 flex items-center justify-center"}
    >
      <div className={boxClassName ?? "aspect-square w-[min(96vw,920px)]"}>
        <Canvas
          orthographic
          camera={{ position: [3.46, 3.46, 3.46], zoom: 92, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={active ? "always" : "never"}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          style={{ position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={dark ? 0.3 : 0.55} />
          <directionalLight position={[4, 6, 3]} intensity={0.8} color="#cdd9ff" />
          <pointLight position={[-3, 2, -2]} intensity={16} color="#5f8bff" distance={18} />
          <pointLight position={[0, 0, 0]} intensity={9} color="#1B4FFF" distance={7} />
          <Suspense fallback={null}>
            <CubixsoCube mode="hero" active={active} accent={accent} />
            <Environment resolution={128} frames={1} environmentIntensity={0.6}>
              <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
              <Lightformer intensity={1.2} color="#6e96ff" position={[-4, 1, 2]} scale={[3, 4, 1]} />
              <Lightformer intensity={1.0} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
            </Environment>
          </Suspense>
          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomThreshold}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
