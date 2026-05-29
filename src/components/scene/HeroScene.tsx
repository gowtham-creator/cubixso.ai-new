"use client";

// HeroScene — exploration scene to A/B-test the Hubtown vibe.
// Pasted verbatim from the "60-line scene" reference, then we decide
// whether to go deeper with R3F or pivot to Spline.
//
// IMPORTANT: this scene mounts as its own Canvas. If you want a clean
// comparison vs the global persistent CubeScene, temporarily disable
// `<CubeScene />` in src/app/layout.tsx — otherwise both canvases stack
// and the visuals fight each other.

import { Canvas } from "@react-three/fiber";
import {
  MeshReflectorMaterial,
  Environment,
  Stars,
  Float,
  Edges,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 6], fov: 35 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#03050C"]} />
      <fog attach="fog" args={["#03050C", 8, 25]} />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[4, 6, 3]} intensity={0.8} color="#FFF1DC" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#4A7BFF" distance={6} />

      {/* HDRI for subtle reflections on the cube */}
      <Environment preset="night" />

      {/* The hero cube — floating, gently rotating */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshPhysicalMaterial
            color="#1B4FFF"
            emissive="#4A7BFF"
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.4}
            clearcoat={1}
          />
          <Edges threshold={15} color="#9DB8FF" />
        </mesh>
      </Float>

      {/* Reflective floor — this is the magic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.5}
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
          color="#050714"
          metalness={0.6}
          mirror={0.5}
        />
      </mesh>

      {/* Particles in the sky */}
      <Stars radius={50} depth={40} count={2000} factor={3} fade speed={0.5} />

      {/* The post-processing that ties it all together */}
      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
        <ChromaticAberration offset={[0.0008, 0.0008]} blendFunction={BlendFunction.NORMAL} />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
