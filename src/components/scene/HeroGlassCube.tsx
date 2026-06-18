"use client";

// HeroGlassCube — faithful port of the cubixso-ai (Vercel) hero centerpiece:
// a translucent GLASS cube with thin chromatic-fringed edges and a solid
// electric-cobalt extruded "Y" floating inside it. Theme-adaptive:
//   • light → clear glass (MeshTransmissionMaterial, real chromatic aberration)
//             + solid blue Y on the soft light field, exactly like the reference.
//   • dark  → the same cube but GLOWING (bright edges + emissive Y + bloom) so it
//             reads on near-black, where clear glass would vanish.
//
// The Y silhouette is the brand glyph, traced from the logo SVG strokes (same
// shape used by the scroll cube in scene/Cube.tsx). Render loop pauses when the
// hero scrolls out of view. prefers-reduced-motion holds it still.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Edges,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";

const ACCENT = "#1B4FFF";       // electric cobalt — the Y
const ACCENT_GLOW = "#4A7BFF";  // lighter cobalt — emissive / glow

// The brand "Y" as a single extruded glyph (traced from the logo SVG strokes,
// closed into a Y outline). Mirrors scene/Cube.tsx so the mark is identical.
function makeYGeometry(): THREE.ExtrudeGeometry {
  const s = 1.05;          // fit inside the 2-unit cube
  const w = 0.085;         // half-width of arms / stem
  const armOuterY = 0.62 * s, armOuterX = 0.58 * s;
  const armInnerX = 0.46 * s, armInnerY = 0.50 * s;
  const stemTopY = -0.02 * s, stemBotY = -0.92 * s;

  const shape = new THREE.Shape();
  shape.moveTo(-armOuterX, armOuterY);
  shape.lineTo(-armInnerX + w * 0.6, armInnerY);
  shape.lineTo(-w, stemTopY);
  shape.lineTo(-w, stemBotY);
  shape.lineTo(w, stemBotY);
  shape.lineTo(w, stemTopY);
  shape.lineTo(armInnerX - w * 0.6, armInnerY);
  shape.lineTo(armOuterX, armOuterY);
  shape.lineTo(armOuterX - w * 1.6, armOuterY + w * 1.0);
  shape.lineTo(0, armInnerY - w * 0.2);
  shape.lineTo(-armOuterX + w * 1.6, armOuterY + w * 1.0);
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 8,
  });
  g.center();
  return g;
}

function CubeRig({ dark }: { dark: boolean }) {
  const yGeom = useMemo(makeYGeometry, []);
  const sway = useRef<THREE.Group>(null);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  // dispose on unmount
  useEffect(() => () => yGeom.dispose(), [yGeom]);

  // gentle continuous yaw sway around the logo pose (~±10°) — keeps the mark
  // readable and the front edge centred while still feeling alive. Float bobs.
  useFrame((state) => {
    if (!reduced && sway.current) sway.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.18;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.26}>
      {/* logo orientation: the glass CAGE turns 45° so a vertical edge faces
          the camera, and the look-down camera reveals the top → the front-top
          vertex peaks at centre, exactly like the Cubixso logo mark. */}
      <group ref={sway} scale={0.92}>
        {/* glass CAGE — vertical edge toward the camera */}
        <group rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          {dark ? (
            // dark: faint transparent shell — the glow comes from edges + Y + bloom
            <meshPhysicalMaterial
              transparent
              opacity={0.12}
              color="#0a1024"
              roughness={0.08}
              metalness={0}
              transmission={0.6}
              ior={1.3}
              clearcoat={1}
            />
          ) : (
            // light: airy clear-glass faces — barely-there light panels you read
            // the headline through, with a glassy clearcoat sheen. The edge
            // fringe is the ChromaticAberration pass, not heavy transmission.
            <meshPhysicalMaterial
              transparent
              opacity={0.1}
              color="#ffffff"
              roughness={0.06}
              metalness={0}
              ior={1.3}
              clearcoat={1}
              clearcoatRoughness={0.08}
              reflectivity={0.4}
            />
          )}
          <Edges threshold={15} lineWidth={dark ? 2.6 : 1} color={dark ? "#e6f0ff" : "#8aa0d8"} />
        </mesh>
        </group>

        {/* the solid cobalt Y — faces the camera directly (NOT rotated with the
            cage), so the full glyph reads, bisected by the front edge */}
        <mesh geometry={yGeom}>
          <meshPhysicalMaterial
            color={ACCENT}
            emissive={ACCENT_GLOW}
            emissiveIntensity={dark ? 1.1 : 0.25}
            roughness={0.28}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function HeroGlassCube({
  className,
  boxClassName,
}: { className?: string; boxClassName?: string } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const { resolved } = useTheme();
  const dark = resolved === "dark";

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
      <div className={boxClassName ?? "aspect-square w-[min(80vw,680px)]"}>
        <Canvas
          camera={{ position: [0, 2.4, 5.8], fov: 28, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={active ? "always" : "never"}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          style={{ position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={dark ? 0.35 : 0.7} />
          <directionalLight position={[4, 6, 3]} intensity={dark ? 0.7 : 1.1} color="#eaf0ff" />
          <pointLight position={[-3, 1, 2]} intensity={dark ? 10 : 4} color={ACCENT_GLOW} distance={16} />
          <pointLight position={[0, 0, 0]} intensity={dark ? 7 : 1.4} color={ACCENT} distance={7} />
          <Suspense fallback={null}>
            <CubeRig dark={dark} />
            <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.9}>
              <Lightformer intensity={dark ? 1.6 : 2.4} color="#ffffff" position={[0, 3, 3]} scale={[8, 3, 1]} />
              <Lightformer intensity={dark ? 1.0 : 1.6} color="#cfe0ff" position={[-4, 1, 2]} scale={[3, 5, 1]} />
              <Lightformer intensity={dark ? 0.8 : 1.3} color="#dbe6ff" position={[4, -1, -3]} scale={[6, 3, 1]} />
            </Environment>
          </Suspense>
          <EffectComposer>
            <Bloom
              intensity={dark ? 1.5 : 0.28}
              luminanceThreshold={dark ? 0.1 : 0.62}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            {/* thin red/cyan edge fringe — the reference's glassy chromatic edge */}
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0011, 0.0011]}
            />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
