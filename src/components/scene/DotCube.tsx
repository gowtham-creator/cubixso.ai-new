"use client";

// DotCube — a volumetric dot-lattice cube: 11 parallel layers stacked along Z,
// each a grid of dots (3×3 on odd layers, inner 2×2 on even), the whole lattice
// slow-spinning in 3D. Pure CSS 3D transforms — deterministic, GPU-cheap, no
// WebGL. Adapted from a reference into a parameterized, theme-consistent
// component for ambient BACKGROUND use (subtle, behind content).
//
// Adjustable: size / color / glow / speed / dotSize / opacity. Respects
// prefers-reduced-motion (holds still). Decorative → aria-hidden.

import { useTheme } from "@/components/providers/ThemeProvider";

interface DotCubeProps {
  size?: number;        // cube px
  color?: string;       // dot color (defaults to theme-aware)
  glow?: string;        // dot glow (defaults to theme-aware)
  speed?: number;       // seconds per full spin
  dotSize?: number;     // px
  opacity?: number;     // whole-lattice opacity
  className?: string;   // positioning wrapper
}

// dot grid positions (% within a layer)
const GRID9 = [
  [0, 0], [50, 0], [100, 0],
  [0, 50], [50, 50], [100, 50],
  [0, 100], [50, 100], [100, 100],
];
const GRID4 = [[25, 25], [75, 25], [25, 75], [75, 75]];
const LAYERS = 11;

export function DotCube({
  size = 220,
  color,
  glow,
  speed = 16,
  dotSize = 2,
  opacity = 1,
  className,
}: DotCubeProps) {
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  // theme-aware defaults: glowing cyan on dark, calm slate-blue on light
  const dotColor = color ?? (dark ? "rgba(125,211,252,0.9)" : "rgba(37,99,235,0.55)");
  const dotGlow = glow ?? (dark ? "rgba(34,211,238,0.55)" : "rgba(37,99,235,0.18)");
  const interval = size / 2 / 5; // layer spacing along Z
  const anim = `dotcube-spin ${speed * 1000}ms linear infinite`;

  return (
    <div className={className} style={{ perspective: size * 1.6 }} aria-hidden>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          animation: anim,
          willChange: "transform",
          opacity,
        }}
      >
        {Array.from({ length: LAYERS }, (_, i) => {
          const z = -interval * 5 + interval * i;
          const grid = i % 2 === 0 ? GRID9 : GRID4; // f1,f3… = 9 dots; f2,f4… = 4
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translateZ(${z}px)`,
              }}
            >
              {grid.map(([l, t], j) => (
                <span
                  key={j}
                  style={{
                    position: "absolute",
                    left: `${l}%`,
                    top: `${t}%`,
                    width: dotSize,
                    height: dotSize,
                    marginLeft: -dotSize / 2,
                    marginTop: -dotSize / 2,
                    borderRadius: "50%",
                    background: dotColor,
                    boxShadow: `0 0 ${dotSize * 3}px ${dotGlow}`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes dotcube-spin {
          0%   { transform: rotateY(0deg)   rotateX(-45deg) rotate(0deg); }
          50%  { transform: rotateY(180deg) rotateX(135deg) rotate(180deg); }
          100% { transform: rotateY(360deg) rotateX(315deg) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="dotcube-spin"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
