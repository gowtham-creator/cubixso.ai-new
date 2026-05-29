"use client";

// CubeFaces — Hubtown-signature hinged face panels. Six translucent face
// planes, each hinged on one cube edge, that mechanically swing open and
// closed as scroll progresses. This is what gives the cube the
// "origami-box-blooming" feel rather than a fade-dissolve.
//
// Architecture per face:
//   <group position={hingeAnchor} rotation={[openX|Y|Z, ...]}>
//     <mesh position={panelCenterOffsetFromHinge}>
//       <planeGeometry args={[size, size]} />
//     </mesh>
//   </group>
//
// The outer group sits at the hinge anchor (one edge of the cube). The
// child mesh is offset to the face's natural center when closed (angle 0).
// Rotating the outer group sweeps the panel around the hinge axis.
//
// Open schedule (driven by scroll progress 0..1):
//   0.00 hero         all closed
//   0.10 manifesto    slight crack (~25%)
//   0.20 kinetic      half open
//   0.32 services     fully open (180°) — bloom moment
//   0.44 products     re-folding (60%)
//   0.56 industries   nearly closed
//   0.66 whyus        TIGHT — closed + scale down
//   0.74 metrics      slight crack again
//   0.86 global       petal-open (110°)
//   0.97 cta          closed clean

import { useRef, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HALF = 0.8;
const PANEL_SIZE = HALF * 2 * 0.94;   // slightly under cube extent so edges read

export interface FacesHandle {
  setOpen: (amount01: number, holdFactor?: number) => void;
}

interface FaceDef {
  // hinge anchor (one edge of the cube — midpoint of that edge)
  anchor: [number, number, number];
  // axis of rotation (local, must be ±X | ±Y | ±Z)
  axis: "x" | "y" | "z";
  // sign of opening rotation
  sign: 1 | -1;
  // offset of panel-center from anchor when closed
  closedOffset: [number, number, number];
  // local plane orientation when closed (faces outward)
  facing: "x+" | "x-" | "y+" | "y-" | "z+" | "z-";
  // stagger 0..1 — when in the open schedule this face starts opening
  delay: number;
}

// Six faces hinged so the cube opens like a flower from the back-bottom.
const FACES: FaceDef[] = [
  // top — hinges along back-top edge, swings backward & up
  { anchor: [0,  HALF, -HALF], axis: "x", sign: -1, closedOffset: [0, 0,  HALF], facing: "y+", delay: 0.00 },
  // bottom — hinges along back-bottom edge, swings down/back
  { anchor: [0, -HALF, -HALF], axis: "x", sign:  1, closedOffset: [0, 0,  HALF], facing: "y-", delay: 0.20 },
  // left — hinges along back-left edge, swings left/back
  { anchor: [-HALF, 0, -HALF], axis: "y", sign:  1, closedOffset: [0, 0,  HALF], facing: "x-", delay: 0.05 },
  // right — hinges along back-right edge, swings right/back
  { anchor: [ HALF, 0, -HALF], axis: "y", sign: -1, closedOffset: [0, 0,  HALF], facing: "x+", delay: 0.10 },
  // front — hinges along bottom-front edge, swings forward/down
  { anchor: [0, -HALF,  HALF], axis: "x", sign:  1, closedOffset: [0,  HALF, 0], facing: "z+", delay: 0.15 },
  // back — hinges along bottom-back edge, swings backward/down (lid stays last)
  { anchor: [0, -HALF, -HALF], axis: "x", sign: -1, closedOffset: [0,  HALF, 0], facing: "z-", delay: 0.25 },
];

// Build the panel mesh rotation that makes a unit plane face the named direction
function facingQuat(facing: FaceDef["facing"]): THREE.Euler {
  const e = new THREE.Euler();
  switch (facing) {
    case "z+": e.set(0, 0, 0); break;
    case "z-": e.set(0, Math.PI, 0); break;
    case "x+": e.set(0, Math.PI / 2, 0); break;
    case "x-": e.set(0, -Math.PI / 2, 0); break;
    case "y+": e.set(-Math.PI / 2, 0, 0); break;
    case "y-": e.set( Math.PI / 2, 0, 0); break;
  }
  return e;
}

// Smoothstep
function ss(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

export const CubeFaces = forwardRef<FacesHandle, { themeIsDark?: boolean }>(
  function CubeFaces({ themeIsDark = true }, ref) {
    const open = useRef(0);
    const hold = useRef(1); // multiplier — scaled down at whyus collapse
    useImperativeHandle(ref, () => ({
      setOpen: (amt, h = 1) => { open.current = amt; hold.current = h; },
    }));

    // One outer-group ref + one material ref per face
    const groupRefs = useRef<(THREE.Group | null)[]>(Array(FACES.length).fill(null));
    const matRefs   = useRef<(THREE.MeshBasicMaterial | null)[]>(Array(FACES.length).fill(null));

    useFrame(() => {
      const O = open.current;
      const H = hold.current;
      const MAX_ANGLE = Math.PI * 0.62; // ~112° fully open — petal-style

      for (let i = 0; i < FACES.length; i++) {
        const def = FACES[i];
        const g = groupRefs.current[i];
        if (!g) continue;

        // Per-face open scalar with stagger
        const local = ss((O - def.delay * 0.8) / (1 - def.delay * 0.8));
        const angle = local * MAX_ANGLE * def.sign;

        // Apply to the correct rotation axis
        g.rotation.set(0, 0, 0);
        if (def.axis === "x") g.rotation.x = angle;
        if (def.axis === "y") g.rotation.y = angle;
        if (def.axis === "z") g.rotation.z = angle;

        // Material opacity — panels are invisible when fully closed (we want
        // the wireframe to dominate), then fade in as they open.
        const m = matRefs.current[i];
        if (m) {
          m.opacity = (0.05 + local * 0.18) * H;
        }
      }
    });

    const panelColor = themeIsDark ? "#4A7BFF" : "#1B4FFF";

    return (
      <group>
        {FACES.map((def, i) => {
          const facing = facingQuat(def.facing);
          return (
            <group
              key={i}
              ref={(el) => { groupRefs.current[i] = el; }}
              position={def.anchor}
            >
              <mesh
                position={def.closedOffset}
                rotation={[facing.x, facing.y, facing.z]}
              >
                <planeGeometry args={[PANEL_SIZE, PANEL_SIZE]} />
                <meshBasicMaterial
                  ref={(el) => { matRefs.current[i] = el; }}
                  color={panelColor}
                  transparent
                  opacity={0.05}
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  },
);
