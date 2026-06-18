"use client";

// Tesseract — a TRUE 4D hypercube rendered as the Cubixso logo's edge-frame
// beams. 16 vertices (±1,±1,±1,±1), 32 edges (vertices differing in exactly
// one coordinate). Each frame we rotate every 4D vertex in the XW + YW planes,
// perspective-project 4D→3D, and lay an instanced white beam along each edge —
// so the cube appears to turn *through itself*, endlessly. Scroll position
// drives the 4D angle (scroll down/up = rotate forward/back); a slow idle drift
// keeps it alive at rest. prefers-reduced-motion → a fixed, pleasing 4D pose.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 16 vertices of the 4-cube
const VERTS: number[][] = [];
for (let i = 0; i < 16; i++) {
  VERTS.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
}
// 32 edges — connect vertices differing in exactly one coordinate (bit)
const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let b = 0; b < 4; b++) {
    const j = i ^ (1 << b);
    if (i < j) EDGES.push([i, j]);
  }
}

const DIST_4D = 3; // 4D camera distance for the perspective projection
const IDLE_XW = 0.13; // rad/s idle spin in the XW plane
const IDLE_YW = 0.09; // rad/s idle spin in the YW plane
const SCROLL_XW = 0.0024; // rad per scrolled px (scroll-reactive spin)
const SCROLL_YW = 0.0017;
const THICK = 0.05; // beam cross-section (natural units, scaled by the group)

interface Props {
  color?: string;
  active?: boolean;
  reduced?: boolean;
}

export function Tesseract({ color = "#ffffff", active = true, reduced = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);

  // reusable scratch objects (no per-frame allocation)
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const proj = useMemo(
    () => Array.from({ length: 16 }, () => new THREE.Vector3()),
    [],
  );

  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const isReduced = reduced || prefersReduced;

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;

    const t = state.clock.elapsedTime;
    const sc = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight || 1 : 1;
    const p = Math.min(1.4, sc / vh); // scroll progress, in viewports

    let axw: number, ayw: number, dist: number;
    if (isReduced) {
      axw = 0.6;
      ayw = 0.32; // a fixed, dimensional pose
      dist = DIST_4D;
    } else {
      axw = t * IDLE_XW + sc * SCROLL_XW;
      ayw = t * IDLE_YW + sc * SCROLL_YW;
      dist = DIST_4D - p * 0.55; // scrolling deepens the 4D warp
    }
    const cxw = Math.cos(axw), sxw = Math.sin(axw);
    const cyw = Math.cos(ayw), syw = Math.sin(ayw);

    // rotate each 4D vertex (XW then YW) and perspective-project to 3D
    for (let i = 0; i < 16; i++) {
      const v = VERTS[i];
      const x = v[0], y = v[1], z = v[2], w = v[3];
      const x1 = x * cxw - w * sxw;
      const w1 = x * sxw + w * cxw;
      const y1 = y * cyw - w1 * syw;
      const w2 = y * syw + w1 * cyw;
      const k = 1 / (dist - w2);
      proj[i].set(x1 * k, y1 * k, z * k);
    }

    // lay a beam along each projected edge
    for (let e = 0; e < EDGES.length; e++) {
      a.copy(proj[EDGES[e][0]]);
      b.copy(proj[EDGES[e][1]]);
      mid.addVectors(a, b).multiplyScalar(0.5);
      dir.subVectors(b, a);
      const len = dir.length() || 1e-3;
      dir.divideScalar(len);
      quat.setFromUnitVectors(up, dir);
      dummy.position.copy(mid);
      dummy.quaternion.copy(quat);
      dummy.scale.set(THICK, len, THICK);
      dummy.updateMatrix();
      m.setMatrixAt(e, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // 3D viewing tumble + scroll-reactive spin & upward parallax drift
    if (group.current && !isReduced) {
      group.current.rotation.y = t * 0.15 + p * 0.6;
      group.current.rotation.x = Math.sin(t * 0.1) * 0.12;
      group.current.position.y = p * 0.22;
    } else if (group.current) {
      group.current.position.y = 0;
    }
  });

  return (
    <group ref={group} scale={1.4}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, EDGES.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.08}
          metalness={0.6}
          roughness={0.28}
        />
      </instancedMesh>
    </group>
  );
}
