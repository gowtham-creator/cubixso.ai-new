"use client";

// CubeScrollerCanvas — the WebGL half of CubeScroller: the GLB cube, lights,
// environment and bloom. Split out because CubeScroller is statically imported
// by the homepage, which put three / R3F / drei / postprocessing in the
// initial JS even though this section sits far below the fold. Only
// CubeScroller imports this, through next/dynamic.

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { cdn } from "@/lib/cdn";
import { FrameCap } from "@/components/scene/FrameCap";
import { AUTO_SPIN, BASE_TILT, type Drag } from "@/components/sections/CubeScroller";

const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");

// Start the GLB + Draco decoder fetch the moment this chunk evaluates. It used
// to run at CubeScroller's module scope, i.e. on every homepage load during
// the intro; now it fires only once the canvas is actually about to mount.
useGLTF.preload(MODEL, DRACO);

function ScrubCube({
  dragRef,
  dark,
  active,
}: {
  dragRef: React.MutableRefObject<Drag>;
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
    const d = Math.min(delta, 0.1); // clamp after a tab-switch stall

    // Continuous auto-spin, exactly like the contact-page globe: the cube turns
    // on its own and the visitor can grab it. It used to be scroll-scrubbed and
    // quantized to 94 steps, which meant it only moved while you scrolled, it
    // snapped ~4° at a time, and it needed a 320vh track to turn once — that
    // track is where the dead space below this section came from.
    if (!dragRef.current.dragging) {
      // Momentum: a flick keeps spinning and decays back to the idle rate,
      // rather than stopping dead the instant you let go.
      dragRef.current.vx += (AUTO_SPIN - dragRef.current.vx) * (1 - Math.exp(-1.6 * d));
      dragRef.current.x += dragRef.current.vx * d;
      // Tilt eases back to rest so the cube always recomposes itself.
      dragRef.current.y += (0 - dragRef.current.y) * (1 - Math.exp(-1.2 * d));
    }

    const targetY = dragRef.current.x;
    const targetX = BASE_TILT + dragRef.current.y;

    // Frame-rate independent smoothing: same easing at 60fps and 120fps.
    const k = 1 - Math.exp(-14 * d);
    root.current.rotation.y += (targetY - root.current.rotation.y) * k;
    root.current.rotation.x += (targetX - root.current.rotation.x) * k;
  });

  return (
    <group ref={root} rotation={[0.34, 0, 0]} visible={active}>
      <primitive object={model} />
    </group>
  );
}

// Fires once, on the first frame actually rendered after the model and
// environment have resolved — the moment there is a real cube on screen.
function OnFirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

export default function CubeScrollerCanvas({
  dragRef,
  dark,
  active,
  low,
  onReady,
}: {
  dragRef: React.MutableRefObject<Drag>;
  dark: boolean;
  active: boolean;
  low: boolean;
  onReady: () => void;
}) {
  // High tier keeps the approved adaptive DPR; low tier clamps to 1.
  const dpr: 1 | [number, number] = low ? 1 : [1, 1.5];
  return (
    <Canvas
      orthographic
      camera={{ position: [3.4, 3.4, 3.4], zoom: 105, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      dpr={dpr}
      // "demand", not "never", while off-screen: the desktop warm-up mounts
      // this canvas before anyone scrolls to it, and with "never" it drew
      // no frame at all — so no shader was compiled and the warm-up did
      // nothing. "demand" renders once when the scene resolves, then idles.
      frameloop="demand"
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      {/* 60fps while on screen (30 on phones); idle otherwise. */}
      <FrameCap fps={low ? 30 : 60} active={active} />
      <ambientLight intensity={dark ? 0.3 : 0.6} />
      <directionalLight position={[4, 6, 3]} intensity={0.8} color="#cdd9ff" />
      <pointLight position={[-3, 2, -2]} intensity={dark ? 14 : 5} color="#5f8bff" distance={18} />
      <Suspense fallback={null}>
        <ScrubCube dragRef={dragRef} dark={dark} active={active} />
        <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.85}>
          <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
          <Lightformer intensity={1.1} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
        </Environment>
        {/* Pre-compile materials + env map while the intro curtain still
            covers the page, so the first scrolled frame never stutters. */}
        <Preload all />
        <OnFirstFrame onReady={onReady} />
      </Suspense>
      <EffectComposer>
        <Bloom intensity={dark ? 1.1 : 0.4} luminanceThreshold={dark ? 0.12 : 0.5} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
