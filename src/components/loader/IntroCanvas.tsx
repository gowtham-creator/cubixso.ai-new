"use client";

// IntroCanvas — the WebGL half of the preloader, split out of IntroSequence so
// three/fiber/drei/postprocessing live in their OWN lazy chunk.
//
// WHY THE SPLIT: IntroSequence is mounted from the root layout, so when it
// imported three.js statically the entire 3D stack (~hundreds of KB parsed and
// executed) landed in the shared bundle of EVERY route — /legal, /terms, the
// whole site — and was paid on every page load even though the intro plays once
// per session. This module is only ever requested when the curtain will
// actually render, via next/dynamic({ ssr: false }) in IntroSequence.
//
// It also reports READINESS: the parent must not lift the curtain on a blind
// timer, or a slow device reveals a blank cube. onReady fires once the GLB has
// loaded AND two frames have actually been rasterised (so shaders are compiled).

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { cdn } from "@/lib/cdn";

const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");

function PreloaderCube({ dark, onReady }: { dark: boolean; onReady: () => void }) {
  // Suspends until the GLB is decoded — reaching the first render already means
  // the geometry is in.
  const { scene } = useGLTF(MODEL, DRACO);
  const root = useRef<THREE.Group>(null);
  const frames = useRef(0);

  // dark theme → glowing white-blue edges (bloom makes the glow).
  // light theme → a SOLID NEAR-BLACK cube (charcoal edges on white), no glow.
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      if (dark) {
        mat.color.setRGB(0.02, 0.035, 0.09);
        mat.emissive.set("#cfe0ff");
        mat.emissiveIntensity = 1.8;
      } else {
        mat.color.set("#0b0b12"); // near-black body — reads as a black cube on white
        mat.emissive.set("#0b0b12");
        mat.emissiveIntensity = 0;
        mat.roughness = 0.55;
        mat.metalness = 0.1;
      }
      m.material = mat;
    });
    return c;
  }, [scene, dark]);

  // calm auto-rotate (slower than a full turn — was too fast).
  // delta is clamped so a long frame (first-paint shader compile, tab jank)
  // advances the cube smoothly instead of visibly jumping.
  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += Math.min(delta, 1 / 30) * 0.82;
    // Two rasterised frames = materials compiled and the cube is genuinely on
    // screen. Only now is it honest to let the curtain start lifting.
    frames.current += 1;
    if (frames.current === 2) onReady();
  });

  return (
    <group ref={root} rotation={[0.34, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function IntroCanvas({
  dark,
  compact,
  onReady,
}: {
  dark: boolean;
  compact: boolean;
  onReady: () => void;
}) {
  // Phones and tablets skip the postprocessing pass and the offscreen
  // environment cubemap entirely: a full-screen multi-pass bloom is the single
  // most expensive thing here and it is what stalls the first frame on mobile
  // GPUs. The cube keeps its glow from the emissive material.
  const [heavy] = useState(() => !compact);

  return (
    <Canvas
      orthographic
      // Smaller zoom on phones/tablets so the cube isn't oversized and the
      // keyword caption + wordmark below it keep clear air.
      camera={{ position: [3.4, 3.4, 3.4], zoom: compact ? 88 : 118, near: 0.1, far: 100 }}
      // antialias only matters when we render straight to the default target;
      // with the composer on, MSAA on the canvas is paid for and thrown away.
      gl={{ antialias: !heavy, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }}
      // 1.5× is already past the point of visible difference on a phone at this
      // size, and it roughly halves the fill cost versus 2×.
      dpr={compact ? [1, 1.5] : [1, 2]}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={dark ? 0.3 : 0.95} />
      <directionalLight position={[4, 6, 3]} intensity={dark ? 0.8 : 1.1} color="#cdd9ff" />
      <pointLight position={[-3, 2, -2]} intensity={dark ? 14 : 5} color="#5f8bff" distance={18} />
      <Suspense fallback={null}>
        <PreloaderCube dark={dark} onReady={onReady} />
        {heavy && (
          <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.85}>
            <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
            <Lightformer intensity={1.1} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
          </Environment>
        )}
        {/* Compile every material + the env cubemap up-front, so the cube's
            first visible frame doesn't stall on shader compilation. */}
        <Preload all />
      </Suspense>
      {heavy && (
        <EffectComposer>
          {/* Tighter bloom: only the brightest edges glow (higher threshold,
              lower intensity) so the wide soft halo no longer fills the
              background as a grey blob — the field stays pure black. */}
          <Bloom intensity={dark ? 0.55 : 0.1} luminanceThreshold={dark ? 0.28 : 0.7} luminanceSmoothing={0.7} radius={0.5} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

// Preloading lives HERE, not in IntroSequence: this module is only fetched when
// the intro is actually going to play, so the GLB request is no longer issued
// on every page load of every route.
useGLTF.preload(MODEL, DRACO);
