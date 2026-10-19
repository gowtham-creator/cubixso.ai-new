"use client";

// HeroGlassCubeCanvas — the WebGL half of HeroGlassCube: the R3F scene, lights,
// environment and post-processing. Split out so three / R3F / drei /
// postprocessing are a lazy chunk instead of riding in the homepage's initial
// JS, where they downloaded alongside the intro loader. Only HeroGlassCube
// imports this, through next/dynamic; all gating (tier, reveal, near, lost,
// fallback) stays in the lightweight wrapper.

import { Suspense, useEffect, useMemo, useRef } from "react";
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
import { FrameCap } from "@/components/scene/FrameCap";

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

function CubeRig({ dark, fit = 0.92 }: { dark: boolean; fit?: number }) {
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
      <group ref={sway} scale={fit}>
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

// Reports once the first frame has been drawn. That frame carries the shader +
// environment compile, so fading the canvas in only after it means the cube
// eases in fully formed rather than popping in after an empty beat.
function FirstFrame({ onDrawn }: { onDrawn: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onDrawn); // next tick = after this frame's render
  });
  return null;
}

export default function HeroGlassCubeCanvas({
  dark,
  active,
  low,
  compact,
  drawn,
  onDrawn,
  onLost,
}: {
  dark: boolean;
  active: boolean;
  low: boolean;
  compact: boolean;
  drawn: boolean;
  onDrawn: () => void;
  onLost: () => void;
}) {
  // High tier keeps the approved adaptive DPR. Low tier used to clamp to 1,
  // which on a 3x phone rendered the cube into a 343x343 buffer — a third of
  // the screen's resolution, so it read soft and aliased next to the crisp
  // desktop cube ("the hero isn't the same as on desktop"). 1.5x is still far
  // cheaper than native 3x but removes the visible softness.
  // Capped at 1.5 on every tier. This canvas is viewport-sized with a bloom +
  // chromatic-aberration composer, so 2x on a Retina/4K laptop meant filling
  // ~3.9M pixels several times a frame; 1.5x cuts that by ~44% and the
  // bloom-softened glass looks the same.
  const dpr: [number, number] = [1, 1.5];
  return (
    <Canvas
      camera={{ position: [0, 2.4, 5.8], fov: 28, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      dpr={dpr}
      frameloop={active ? "demand" : "never"}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onLost(); }, { once: true });
      }}
      // Low tier arrives after the reveal, in view, so it fades in once
      // drawn. Desktop builds under the curtain and needs no fade.
      style={{
        position: "absolute",
        inset: 0,
        opacity: low && !drawn ? 0 : 1,
        transition: low ? "opacity 0.9s ease" : undefined,
      }}
    >
      <FirstFrame onDrawn={onDrawn} />
      <FrameCap fps={low ? 30 : 60} active={active} />
      <ambientLight intensity={dark ? 0.35 : 0.7} />
      <directionalLight position={[4, 6, 3]} intensity={dark ? 0.7 : 1.1} color="#eaf0ff" />
      <pointLight position={[-3, 1, 2]} intensity={dark ? 10 : 4} color={ACCENT_GLOW} distance={16} />
      <pointLight position={[0, 0, 0]} intensity={dark ? 7 : 1.4} color={ACCENT} distance={7} />
      <Suspense fallback={null}>
        <CubeRig dark={dark} fit={compact ? 0.8 : 0.92} />
        <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.9}>
          <Lightformer intensity={dark ? 1.6 : 2.4} color="#ffffff" position={[0, 3, 3]} scale={[8, 3, 1]} />
          <Lightformer intensity={dark ? 1.0 : 1.6} color="#cfe0ff" position={[-4, 1, 2]} scale={[3, 5, 1]} />
          <Lightformer intensity={dark ? 0.8 : 1.3} color="#dbe6ff" position={[4, -1, -3]} scale={[6, 3, 1]} />
        </Environment>
      </Suspense>
      {/* Desktop (high, !compact) keeps the approved bright composer. On
          compact (mobile/tablet) the bloom is TIGHTENED — a higher threshold +
          lower intensity keep the glow on the edges so it doesn't fill the
          constrained canvas box and read as a faint grey rectangle/seam. Low
          tier softens further to ease the GPU. */}
      {compact ? null : low ? (
        // COMPACT (mobile/tablet): NO post-processing composer at all. The
        // composer renders an opaque background that would cover the dust
        // field as a visible rectangle inside the constrained canvas box. With
        // no composer the canvas stays truly transparent — the dust shows
        // through and the cube floats seamlessly; the emissive edges keep it
        // bright without a bloom halo. Low tier (desktop-ish, non-compact):
        // bloom only, softened for the GPU.
        <EffectComposer>
          <Bloom
            intensity={dark ? 0.9 : 0.18}
            luminanceThreshold={dark ? 0.1 : 0.62}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      ) : (
        // Desktop high tier: the approved bright composer + chromatic fringe.
        <EffectComposer>
          <Bloom
            intensity={dark ? 1.5 : 0.28}
            luminanceThreshold={dark ? 0.1 : 0.62}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0011, 0.0011]}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
