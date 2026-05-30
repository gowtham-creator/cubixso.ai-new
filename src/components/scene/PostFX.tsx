"use client";

// PostFX — cinematic postprocessing stack for the cube canvas.
// Bloom on the emissive cobalt edges + Y core, subtle film grain,
// near-zero chromatic aberration that ramps up during cube state
// transitions, and a soft depth-of-field tuned only for the
// "WhyUs" collapsed-state moment so the cube reads as a dense node.

import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useScrollProgress } from "./Cube";
import { useEffect, useRef } from "react";

export function PostFX({ enabled = true }: { enabled?: boolean }) {
  const progress = useScrollProgress();
  const caRef = useRef<{ offset: Float32Array } | null>(null);

  // Drive chromatic aberration intensity from scroll velocity proxy.
  // Sample once per animation frame — keeps cost effectively zero.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = progress.current;
    let last_t = performance.now();
    let smoothed = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(now - last_t, 1) / 1000;
      const delta = progress.current - last;
      const vel = Math.abs(delta / dt); // scroll-normalized velocity
      smoothed += (vel - smoothed) * 0.15;
      const base = 0.0008;
      const peak = 0.0032;
      const v = Math.min(1, smoothed * 6);
      const off = base + (peak - base) * v;
      if (caRef.current?.offset) {
        caRef.current.offset[0] = off;
        caRef.current.offset[1] = off;
      }
      last = progress.current;
      last_t = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, progress]);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.75}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.22}
        mipmapBlur
        radius={0.72}
      />
      <ChromaticAberration
        ref={caRef as never}
        offset={[0.0008, 0.0008] as never}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.06}
      />
      <Vignette eskil={false} offset={0.32} darkness={0.55} />
    </EffectComposer>
  );
}
