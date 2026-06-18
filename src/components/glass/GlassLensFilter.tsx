"use client";

// GlassLensFilter — a reusable SVG <defs> filter that creates a TRUE refractive
// lens. feTurbulence generates an organic noise field; feDisplacementMap uses
// that field to bend the pixels of whatever is rendered behind the glass, and a
// dual-channel offset produces a subtle chromatic shift at the lens edges.
//
// This is the Tier-3 "wow" material from the Cobalt Aperture system. It is the
// ONLY thing that distorts geometry, so it is the costliest piece — the consumer
// is expected to IntersectionObserver-pause it off-screen by toggling `paused`
// (which freezes the animation by setting baseFrequency static / scale 0) or by
// simply not applying the filter when out of view.
//
// Usage:
//   <GlassLensFilter id="kinetic-lens" scale={26} />            // defs (render once)
//   <div style={{ filter: "url(#kinetic-lens)" }}>…behind…</div> // apply
//
// Place the <GlassLensFilter/> once near the consuming surface; reference its id.

import { useId } from "react";

export interface GlassLensFilterProps {
  /** Stable id used to reference the filter via filter:url(#id). */
  id?: string;
  /**
   * Displacement strength in px — how far pixels behind the glass are bent.
   * Brief calls for a "subtle" warp; 18–30 reads as a real lens without nausea.
   */
  scale?: number;
  /** Turbulence base frequency — lower = larger, slower lens lobes. */
  baseFrequency?: number;
  /** Octaves of turbulence detail. 2 is plenty for a smooth lens. */
  octaves?: number;
  /**
   * When true the lens is frozen (scale 0) — wire this to an
   * IntersectionObserver so off-screen lenses cost nothing.
   */
  paused?: boolean;
  /**
   * Animate the turbulence seed so the lens "breathes" — pure SMIL, no JS RAF.
   * Reduced-motion consumers should pass animate={false}.
   */
  animate?: boolean;
}

/**
 * Returns the canonical filter id for a given key so producers (the <defs/>)
 * and consumers (filter:url(...)) never drift. Pass the same string you gave
 * <GlassLensFilter id=... />.
 */
export function lensFilterUrl(id: string): string {
  return `url(#${id})`;
}

export function GlassLensFilter({
  id,
  scale = 24,
  baseFrequency = 0.012,
  octaves = 2,
  paused = false,
  animate = true,
}: GlassLensFilterProps) {
  // Allow an explicit id (so it can be referenced elsewhere) but fall back to a
  // collision-proof generated one when used purely inline.
  const reactId = useId();
  const filterId = id ?? `glass-lens-${reactId.replace(/[:]/g, "")}`;
  const effScale = paused ? 0 : scale;

  return (
    <svg
      aria-hidden
      focusable={false}
      width={0}
      height={0}
      style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter
          id={filterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Organic lens lobes. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${baseFrequency} ${baseFrequency * 1.35}`}
            numOctaves={octaves}
            seed={4}
            stitchTiles="stitch"
            result="noise"
          >
            {animate && !paused && (
              <animate
                attributeName="seed"
                values="4;9;4"
                dur="14s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>

          {/* Bend the green/luminance channels → the body of the lens. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={effScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="bent"
          />

          {/* Chromatic edge: re-displace only the red channel a touch further,
              then screen it back so the lens fringes cobalt-cyan like real glass. */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={effScale * 1.5}
            xChannelSelector="B"
            yChannelSelector="R"
            result="chroma"
          />
          <feColorMatrix
            in="chroma"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 0.35 0"
            result="chromaBlue"
          />
          <feComposite in="bent" in2="chromaBlue" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default GlassLensFilter;
