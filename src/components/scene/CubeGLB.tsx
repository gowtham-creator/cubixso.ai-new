"use client";

// CubeGLB — drop-in replacement for the procedural <Cube /> that loads
// a Blender-authored .glb instead. Lives at /public/models/cubixso-cube.glb.
//
// Use this once the Blender model is ready. To swap in:
//   1. Run blender/cubixso_cube.py inside Blender, export the .glb to
//      /public/models/cubixso-cube.glb
//   2. Optionally compress: node scripts/optimize-glb.mjs public/models/cubixso-cube.glb public/models/cubixso-cube.glb
//   3. In src/components/scene/CubeScene.tsx, swap:
//        <Cube themeIsDark={isDark} />        →    <CubeGLB themeIsDark={isDark} />
//
// The R3F bridge keeps the same scroll-driven idle rotation + scale that
// the procedural Cube uses, so the rest of the state-machine (overlays,
// hinged faces) continues to work alongside.

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useScrollProgress } from "./Cube";
import { cdn } from "@/lib/cdn";

const MODEL_URL = cdn("/models/cubixso-cube.glb");

interface CubeGLBProps {
  themeIsDark?: boolean;
}

export function CubeGLB({ themeIsDark = true }: CubeGLBProps) {
  const group = useRef<THREE.Group>(null);
  const progressRef = useScrollProgress();
  const cur = useRef({ scale: 1, tilt: 0 });

  // useGLTF caches by URL — only fetched once across the app
  const { scene } = useGLTF(MODEL_URL);

  // Theme tint — tweak cage material brightness based on light/dark
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.name?.includes("Cage")) {
          mat.color = new THREE.Color(themeIsDark ? "#ffffff" : "#0a0a0c");
          mat.emissiveIntensity = themeIsDark ? 0.45 : 0.05;
        }
      }
    });
  }, [scene, themeIsDark]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progressRef.current;
    // Idle rotation + scroll-coupled tilt + mouse parallax (same envelope
    // as the procedural Cube, so the state machine timing still lines up)
    g.rotation.y += delta * 0.22;
    cur.current.tilt += (state.mouse.y * 0.087 - cur.current.tilt) * 0.05;
    g.rotation.x = cur.current.tilt + Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    // Scale shrinks at WhyUs (0.55–0.65)
    const targetScale = p < 0.55 || p > 0.85 ? 1 : 0.75;
    cur.current.scale += (targetScale - cur.current.scale) * 0.06;
    g.scale.setScalar(cur.current.scale);
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
