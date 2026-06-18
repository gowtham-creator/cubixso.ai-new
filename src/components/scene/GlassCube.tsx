"use client";

// GlassCube — the loader finale. A pure-CSS 3D glass cube (no WebGL, so it
// renders reliably everywhere and mounts instantly). Six glassmorphic faces
// tumble slowly; the luminous borders echo the edge-frame logo.

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

const SIZE = 260; // px
const H = SIZE / 2;

const faceBase: CSSProperties = {
  position: "absolute",
  width: SIZE,
  height: SIZE,
  border: "1px solid rgba(232,240,255,0.72)",
  background:
    "linear-gradient(135deg, rgba(196,216,255,0.18), rgba(255,255,255,0.06) 55%, rgba(196,216,255,0.13))",
  boxShadow:
    "inset 0 0 70px rgba(165,195,255,0.22), 0 0 3px rgba(255,255,255,0.55)",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
};

const FACES: CSSProperties[] = [
  { transform: `translateZ(${H}px)` },
  { transform: `rotateY(180deg) translateZ(${H}px)` },
  { transform: `rotateY(90deg) translateZ(${H}px)` },
  { transform: `rotateY(-90deg) translateZ(${H}px)` },
  { transform: `rotateX(90deg) translateZ(${H}px)` },
  { transform: `rotateX(-90deg) translateZ(${H}px)` },
];

export function GlassCube() {
  return (
    <div
      className="grid h-full w-full place-items-center"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          position: "relative",
          width: SIZE,
          height: SIZE,
          transformStyle: "preserve-3d",
        }}
        initial={{ rotateX: -22, rotateY: 0 }}
        animate={{ rotateX: [-22, 338], rotateY: [0, 360] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        {FACES.map((f, i) => (
          <div key={i} style={{ ...faceBase, ...f }} />
        ))}
      </motion.div>
    </div>
  );
}
