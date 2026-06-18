"use client";

// GlassLogo — the real Cubixso logo (frozen edge-frame glb) in a glassmorphic
// material: translucent, reflective, lit by an all-around Lightformer rig so it
// reads on black. Uses reflective transparency (not FBO transmission) so it
// renders reliably on every GPU, including software WebGL. Used as the loader
// finale; mounted early so its WebGL context is warm before it's revealed.

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { cdn } from "@/lib/cdn";

const MODEL_URL = cdn("/models/cubixso-cube.glb");
const DRACO_URL = cdn("/draco/");

function LogoMesh() {
  const { scene } = useGLTF(MODEL_URL, DRACO_URL);
  const root = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#c2d8ff"),
      transparent: true,
      opacity: 0.55,
      roughness: 0.08,
      metalness: 0.15,
      reflectivity: 0.6,
      ior: 1.45,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
    });
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = glass;
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (root.current) root.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={root} rotation={[0.35, 0, 0]} scale={1.15}>
      <primitive object={model} />
    </group>
  );
}

export function GlassLogo() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 42, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={22} color="#bcd2ff" distance={20} />
      <Suspense fallback={null}>
        <LogoMesh />
        <Environment resolution={256} frames={1} environmentIntensity={1.2}>
          <Lightformer intensity={4} color="#ffffff" position={[0, 4, 4]} scale={[9, 3, 1]} />
          <Lightformer intensity={2.4} color="#cfe0ff" position={[-5, 1, 2]} scale={[3, 6, 1]} />
          <Lightformer intensity={2.4} color="#ffffff" position={[5, -2, -3]} scale={[6, 3, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, DRACO_URL);
