"use client";

// HeroTesseract — the homepage centerpiece. A full-bleed canvas sitting BEHIND
// the hero headline (z-0, pointer-events-none) that renders the live 4D
// tesseract. Offset slightly up so the lower headline stays clear/legible.
// Theme-aware beams (white on dark, charcoal on light). Render loop pauses when
// the hero scrolls out of view.

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Tesseract } from "./Tesseract";
import { useTheme } from "@/components/providers/ThemeProvider";

export function HeroTesseract() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const { resolved } = useTheme();
  const color = resolved === "dark" ? "#ffffff" : "#17191e";

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
      className="pointer-events-none absolute right-[clamp(8px,3vw,56px)] top-1/2 z-0 hidden aspect-square w-[clamp(300px,34vw,520px)] -translate-y-1/2 overflow-hidden lg:block"
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={20} color="#cfe0ff" distance={20} />
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <Tesseract color={color} active={active} />
          </group>
          <Environment resolution={128} frames={1} environmentIntensity={0.7}>
            <Lightformer intensity={2.2} color="#ffffff" position={[0, 3, 4]} scale={[8, 3, 1]} />
            <Lightformer intensity={1.3} color="#eaf0ff" position={[-5, 1, 2]} scale={[3, 5, 1]} />
            <Lightformer intensity={1.1} color="#ffffff" position={[5, -2, -3]} scale={[5, 3, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
