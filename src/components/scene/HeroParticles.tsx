"use client";

// HeroParticles — the central particle sphere for the hero (reference look:
// a slowly rotating grey point-cloud on black). This is a PLACEHOLDER / swap
// point: when the real animation is supplied, replace <ParticleSphere/> (or the
// whole component) — the hero layout + text frame stay exactly the same.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleSphere() {
  const ref = useRef<THREE.Points>(null);

  const geom = useMemo(() => {
    const N = 3800;
    const pos = new Float32Array(N * 3);
    const R = 2.3;
    const golden = Math.PI * (3 - Math.sqrt(5)); // fibonacci sphere
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const rr = R * (0.9 + Math.random() * 0.14); // soft radial jitter = cloud
      pos[i * 3] = Math.cos(theta) * r * rr;
      pos[i * 3 + 1] = y * rr;
      pos[i * 3 + 2] = Math.sin(theta) * r * rr;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  // Cursor tracking — window-level (the canvas is pointer-events-none, so it
  // never blocks the headline). Kept in refs: no React re-renders per frame.
  const mouse = useRef({ x: 0, y: 0 });
  const spin = useRef(0);
  const tiltX = useRef(0);
  const tiltY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const o = ref.current;
    if (!o) return;
    // slow idle drift so it's alive even when the cursor is still
    spin.current += delta * 0.05;
    // damped lean toward the cursor — the cloud follows you
    const k = Math.min(1, delta * 2.5);
    tiltY.current += (mouse.current.x * 0.6 - tiltY.current) * k;
    tiltX.current += (mouse.current.y * 0.4 - tiltX.current) * k;
    o.rotation.y = spin.current + tiltY.current;
    o.rotation.x = tiltX.current;
    // subtle positional parallax toward the cursor for depth
    o.position.x += (mouse.current.x * 0.18 - o.position.x) * k;
    o.position.y += (-mouse.current.y * 0.15 - o.position.y) * k;
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial
        size={0.025}
        color="#9aa1ad"
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export function HeroParticles() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

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
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={active ? "always" : "never"}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <ParticleSphere />
        </Suspense>
      </Canvas>
    </div>
  );
}
