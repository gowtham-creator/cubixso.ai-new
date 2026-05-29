"use client";

// WorkPreview — a single sticky R3F canvas that floats beside the Work grid.
// As the user hovers cards in the grid, the mesh morphs into a different
// signature geometry per product, accent color shifts, rotation continues.
// React-spring smooths transitions; Bloom + grain finish the look.

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useSpring, animated, config } from "@react-spring/three";
import * as THREE from "three";

const SHAPES = [
  // Logic Gen — torus knot for "intertwined rules"
  { kind: "torusKnot",   color: "#4ea6ff", metalness: 0.85, roughness: 0.18 },
  // Aumic Flow AI — icosahedron, faceted gem
  { kind: "icosahedron", color: "#7c5cff", metalness: 0.55, roughness: 0.22 },
  // Law Suit GPT — box, structural
  { kind: "box",         color: "#3361ff", metalness: 0.7,  roughness: 0.25 },
  // NXT School ERP — octahedron, balanced
  { kind: "octahedron",  color: "#5fb0ff", metalness: 0.75, roughness: 0.2  },
  // Cons.ai — cone (hard hat / structure)
  { kind: "cone",        color: "#ff6a40", metalness: 0.6,  roughness: 0.28 },
  // DocMind AI — sphere, contained intelligence
  { kind: "sphere",      color: "#9be7ff", metalness: 0.9,  roughness: 0.15 },
];

function Geometry({ kind }: { kind: string }) {
  switch (kind) {
    case "torusKnot":   return <torusKnotGeometry args={[0.85, 0.26, 180, 28]} />;
    case "icosahedron": return <icosahedronGeometry args={[1.15, 1]} />;
    case "box":         return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    case "octahedron":  return <octahedronGeometry args={[1.25, 0]} />;
    case "cone":        return <coneGeometry args={[1.05, 1.7, 6]} />;
    case "sphere":      return <sphereGeometry args={[1.1, 96, 96]} />;
    default:            return <icosahedronGeometry args={[1.1, 1]} />;
  }
}

function Mesh({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  const shape = SHAPES[index] ?? SHAPES[0];

  // Spring-eased scale on every hover change → little "thump" on swap
  const { scale } = useSpring({
    from: { scale: 0.65 },
    to: { scale: 1 },
    reset: true,
    config: { tension: 200, friction: 14 },
    key: index,
  });

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    g.rotation.y += delta * 0.55;
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
    // Mouse parallax — gentle
    g.position.x = THREE.MathUtils.lerp(g.position.x, state.mouse.x * 0.25, 0.06);
    g.position.y = THREE.MathUtils.lerp(g.position.y, state.mouse.y * 0.15, 0.06);
  });

  return (
    <animated.group ref={ref} scale={scale}>
      <mesh castShadow receiveShadow>
        <Geometry kind={shape.kind} />
        <meshStandardMaterial
          color={shape.color}
          metalness={shape.metalness}
          roughness={shape.roughness}
          emissive={shape.color}
          emissiveIntensity={0.18}
        />
      </mesh>
    </animated.group>
  );
}

interface WorkPreviewProps {
  index: number;
}

export function WorkPreview({ index }: WorkPreviewProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 36 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[-5, 7, 6]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[6, -3, -4]} intensity={1.0} color="#a8b8d8" />
      <pointLight position={[0, 0, 3]} intensity={1.4} color="#4ea6ff" distance={6} />
      <Mesh index={index} />
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={0.7} luminanceThreshold={0.45} luminanceSmoothing={0.32} mipmapBlur />
        <Vignette eskil={false} offset={0.3} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
