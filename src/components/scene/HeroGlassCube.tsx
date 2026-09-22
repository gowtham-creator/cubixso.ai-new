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
import { useDeviceTier, hasWebGL } from "@/lib/perf";
import { CanvasBoundary } from "@/components/util/CanvasBoundary";

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

// Static fallback glyph — a tasteful CSS cube wireframe with the cobalt Y,
// shown when WebGL is unavailable so the hero never renders a blank/broken
// canvas. Pure CSS/SVG, theme-adaptive, no GPU required.
function StaticCubeFallback({ dark }: { dark: boolean }) {
  const edge = dark ? "#e6f0ff" : "#8aa0d8";
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      style={{ filter: dark ? "drop-shadow(0 0 22px rgba(74,123,255,0.5))" : "none" }}
    >
      {/* cube cage — diamond silhouette with a vertical front edge, matching
          the 3D pose (cage rotated 45°, look-down camera) */}
      <g
        fill="none"
        stroke={edge}
        strokeWidth={dark ? 2 : 1.1}
        strokeLinejoin="round"
        opacity={dark ? 0.95 : 0.8}
      >
        <polygon points="100,18 168,58 168,142 100,182 32,142 32,58" />
        <path d="M100,18 L100,100 M100,100 L168,142 M100,100 L32,142" />
      </g>
      {/* solid cobalt Y */}
      <path
        d="M100,72 L84,52 L92,52 L100,64 L108,52 L116,52 Z M96,72 L104,72 L104,108 L96,108 Z"
        fill={ACCENT}
      />
    </svg>
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

  // Device-adaptive quality. Both default to high / WebGL-present on the server
  // and first client paint (see @/lib/perf), so desktop renders pixel-identical
  // and there's no hydration mismatch; the client re-detects after mount.
  const tier = useDeviceTier();
  const [webgl, setWebgl] = useState(true);
  // A lost context leaves the last frame painted, so the cube looks rendered
  // but frozen. Swap to the static mark instead of lying about being live.
  const [lost, setLost] = useState(false);
  useEffect(() => setWebgl(hasWebGL()), []);
  const low = tier === "low";

  // On mobile/tablet the Canvas is constrained to a small box (see Hero), so the
  // cube's bloom would clip at the box edge and show a faint rectangle. Scale the
  // cube down there to leave glow margin inside the canvas. Desktop = full bleed.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // High tier keeps the approved adaptive DPR. Low tier used to clamp to 1,
  // which on a 3x phone rendered the cube into a 343x343 buffer — a third of
  // the screen's resolution, so it read soft and aliased next to the crisp
  // desktop cube ("the hero isn't the same as on desktop"). 1.5x is still far
  // cheaper than native 3x but removes the visible softness.
  const dpr: [number, number] = low ? [1, 1.5] : [1, 2];

  // Keeping the canvas mounted forever is what freezes the cube on iOS. Safari
  // caps live WebGL contexts and evicts the OLDEST one when a new canvas asks
  // for another — measured on this page: hero + scroll cube + map = 3 contexts
  // alive at once. The evicted canvas keeps its last frame painted, so the cube
  // looks rendered but never moves. Eviction does not reliably fire
  // `webglcontextlost` either, so we cannot only react to that event.
  //
  // So: unmount the canvas once the hero is more than half a viewport away, and
  // mount a FRESH one (new `gen` key) on the way back. One hero context, only
  // while it is actually near the screen.
  const [near, setNear] = useState(true);
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.02 },
    );
    const ioNear = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      // 200% (was 50%). Remounting costs a fresh WebGL context plus a shader
      // compile — roughly a second — and at 50% that bill came due exactly as
      // the hero re-entered view, so scrolling back to the top showed an empty
      // slot and then a pop-in. Two viewports of lead time means the canvas is
      // already warm before the hero is anywhere near the screen.
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    ioNear.observe(el);
    return () => { io.disconnect(); ioNear.disconnect(); };
  }, []);

  // Coming back into view after a loss: drop the dead canvas and build a new one.
  useEffect(() => {
    if (near && lost) { setLost(false); setGen((g) => g + 1); }
  }, [near, lost]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 z-0 flex items-center justify-center"}
    >
      <div className={boxClassName ?? "aspect-square w-[min(80vw,680px)]"}>
        {!webgl || lost ? (
          <StaticCubeFallback dark={dark} />
        // Unmounting is a MOBILE concession, not a universal one. iOS Safari
        // caps live WebGL contexts and evicts the oldest, which is what froze
        // this cube; desktop has no such cap, so paying a context + shader
        // rebuild there bought nothing and cost a visible pop-in on every
        // scroll back to the top. High-tier devices now keep the canvas mounted
        // for the life of the page and simply pause its frameloop.
        ) : low && !near ? null : (
        <CanvasBoundary fallback={<StaticCubeFallback dark={dark} />}>
        <Canvas
          key={gen}
          camera={{ position: [0, 2.4, 5.8], fov: 28, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          dpr={dpr}
          frameloop={active ? "always" : "never"}
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, 0, 0);
            gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setLost(true); }, { once: true });
          }}
          style={{ position: "absolute", inset: 0 }}
        >
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
        </CanvasBoundary>
        )}
      </div>
    </div>
  );
}
