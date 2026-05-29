"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { heroVert, heroFrag } from "@/shaders/hero";

interface HeroPlaneProps {
  accent?: string;
  accent2?: string;
  accent3?: string;
  scroll?: number;
}

export function HeroPlane({
  accent = "#3361ff",
  accent2 = "#7c5cff",
  accent3 = "#4ea6ff",
  scroll = 0,
}: HeroPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, mouse } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uMouse:      { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uScroll:     { value: 0 },
      uAccent:     { value: new THREE.Color(accent) },
      uAccent2:    { value: new THREE.Color(accent2) },
      uAccent3:    { value: new THREE.Color(accent3) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    const m = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!m) return;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    // Lerp mouse — softer feel, no jitter
    const tgt = m.uniforms.uMouse.value as THREE.Vector2;
    tgt.x += (mouse.x - tgt.x) * 0.08;
    tgt.y += (mouse.y - tgt.y) * 0.08;
    m.uniforms.uResolution.value.set(size.width, size.height);
    m.uniforms.uScroll.value += (scroll - m.uniforms.uScroll.value) * 0.06;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={heroVert}
        fragmentShader={heroFrag}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
