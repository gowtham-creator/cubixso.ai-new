"use client";

// HeroCanvas — the R3F Canvas mounted as a fixed background.
// Postprocessed (bloom + chromatic aberration + film grain + vignette)
// for the cinematic finish. Receives a scroll prop from the parent so the
// shader uniform animates with the page scroll position.

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { HeroPlane } from "./HeroPlane";

export function HeroCanvas() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max <= 0 ? 0 : window.scrollY / max;
      setScroll(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto" aria-hidden="true">
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <HeroPlane scroll={scroll} />
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={0.6} luminanceThreshold={0.55} luminanceSmoothing={0.4} mipmapBlur />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0008, 0.0014]}
            radialModulation
            modulationOffset={0.3}
          />
          <Noise opacity={0.04} premultiply blendFunction={BlendFunction.SCREEN} />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
