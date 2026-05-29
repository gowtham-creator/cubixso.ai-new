"use client";

// CubeOverlays — five overlay meshes for the cube state machine, one per
// non-base form. The Cube component computes a weight per state each frame
// and writes it into each overlay's `weight` ref; the overlay then drives
// its own opacity / scale / animation from that weight.

import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT      = "#1B4FFF";
const ACCENT_GLOW = "#4A7BFF";

// Shared overlay-handle API so the parent can write a weight per frame.
export interface OverlayHandle {
  setWeight: (w: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Fragments grid (2x3 layout) — 6 small cube wireframes laid flat
// ─────────────────────────────────────────────────────────────────────────────
export const FragmentsGrid = forwardRef<OverlayHandle>(function FragmentsGrid(_, ref) {
  const group = useRef<THREE.Group>(null);
  const weight = useRef(0);
  useImperativeHandle(ref, () => ({ setWeight: (w) => { weight.current = w; } }));

  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    const cols = 3, rows = 2;
    const sx = 0.75, sy = 0.75;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push([
          (c - (cols - 1) / 2) * sx,
          (r - (rows - 1) / 2) * sy,
          0,
        ]);
      }
    }
    return out;
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const w = weight.current;
    group.current.visible = w > 0.01;
    group.current.scale.setScalar(0.6 + w * 0.4);
    group.current.children.forEach((child, i) => {
      const m = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
      if (m) m.opacity = w * 0.85;
      child.rotation.x = w * (i % 2 ? 0.4 : -0.4) + Date.now() * 0.0002 * (i + 1);
      child.rotation.y = w * 0.5 + Date.now() * 0.00015 * ((i % 3) + 1);
    });
  });

  return (
    <group ref={group}>
      {positions.map((p, i) => (
        <lineSegments key={i} position={p}>
          <edgesGeometry args={[new THREE.BoxGeometry(0.32, 0.32, 0.32)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </lineSegments>
      ))}
    </group>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Orbital modules — 6 cubes orbiting on different planes
// ─────────────────────────────────────────────────────────────────────────────
export const OrbitalModules = forwardRef<OverlayHandle>(function OrbitalModules(_, ref) {
  const group = useRef<THREE.Group>(null);
  const weight = useRef(0);
  useImperativeHandle(ref, () => ({ setWeight: (w) => { weight.current = w; } }));

  const slots = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      radius: 0.95 + (i % 2) * 0.18,
      speed: 0.18 + i * 0.04,
      offset: (i / 6) * Math.PI * 2,
      tilt: (i % 3) * 0.4,
    }));
  }, []);

  const cubeRefs = useRef<THREE.Group[]>([]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const w = weight.current;
    group.current.visible = w > 0.01;
    const t = clock.elapsedTime;
    slots.forEach((s, i) => {
      const node = cubeRefs.current[i];
      if (!node) return;
      const a = t * s.speed + s.offset;
      node.position.set(
        Math.cos(a) * s.radius,
        Math.sin(a * 0.6) * 0.25 + Math.sin(s.tilt) * 0.3,
        Math.sin(a) * s.radius,
      );
      node.rotation.x = a * 0.6;
      node.rotation.y = a * 0.4;
      const m = (node.children[0] as THREE.LineSegments).material as THREE.LineBasicMaterial;
      if (m) m.opacity = w * 0.85;
    });
  });

  return (
    <group ref={group}>
      {slots.map((_, i) => (
        <group key={i} ref={(el) => { if (el) cubeRefs.current[i] = el; }}>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.22, 0.22, 0.22)]} />
            <lineBasicMaterial color={ACCENT_GLOW} transparent opacity={0} depthWrite={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Liquid particles — 200 specks pouring through a vertical column
// ─────────────────────────────────────────────────────────────────────────────
export const LiquidParticles = forwardRef<OverlayHandle>(function LiquidParticles(_, ref) {
  const pts = useRef<THREE.Points>(null);
  const weight = useRef(0);
  useImperativeHandle(ref, () => ({ setWeight: (w) => { weight.current = w; } }));

  const { positions, seeds } = useMemo(() => {
    const N = 200;
    const positions = new Float32Array(N * 3);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 1.1;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, []);

  useFrame(({ clock }) => {
    if (!pts.current) return;
    const w = weight.current;
    pts.current.visible = w > 0.01;
    const arr = (pts.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < seeds.length; i++) {
      const y = ((t * 0.5 + seeds[i] * 3) % 2) - 1;
      arr[i * 3 + 1] = -y;                                  // pour downward
      arr[i * 3 + 0] = Math.sin(t * 0.6 + seeds[i] * 9) * (0.55 - Math.abs(y) * 0.3);
      arr[i * 3 + 2] = Math.cos(t * 0.6 + seeds[i] * 9) * (0.55 - Math.abs(y) * 0.3);
    }
    (pts.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    const m = pts.current.material as THREE.PointsMaterial;
    m.opacity = w * 0.95;
    m.size = 0.025 + w * 0.018;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={ACCENT_GLOW}
        size={0.03}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Particle cloud — 2000 specks dissolving into formation
// ─────────────────────────────────────────────────────────────────────────────
export const ParticleCloud = forwardRef<OverlayHandle>(function ParticleCloud(_, ref) {
  const pts = useRef<THREE.Points>(null);
  const weight = useRef(0);
  useImperativeHandle(ref, () => ({ setWeight: (w) => { weight.current = w; } }));

  const positions = useMemo(() => {
    const N = 2000;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Spherical-ish cloud with slight cube bias
      const r = 0.6 + Math.random() * 0.55;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      arr[i * 3 + 2] = Math.cos(phi) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pts.current) return;
    const w = weight.current;
    pts.current.visible = w > 0.01;
    pts.current.rotation.y = clock.elapsedTime * 0.08;
    pts.current.rotation.x = Math.sin(clock.elapsedTime * 0.15) * 0.1;
    const m = pts.current.material as THREE.PointsMaterial;
    m.opacity = w * 0.78;
    m.size = 0.014 + w * 0.006;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.014}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Globe — low-poly icosahedron wireframe
// ─────────────────────────────────────────────────────────────────────────────
export const GlobeWire = forwardRef<OverlayHandle>(function GlobeWire(_, ref) {
  const group = useRef<THREE.Group>(null);
  const weight = useRef(0);
  useImperativeHandle(ref, () => ({ setWeight: (w) => { weight.current = w; } }));

  const wireMat = useRef<THREE.LineBasicMaterial>(null);
  const dotMat = useRef<THREE.PointsMaterial>(null);

  // City dots — same coords as PRESENCE in data.ts (radius normalized).
  // 2 active (Hyderabad, Dubai) + 1 opening soon (NY) — addresses pending.
  const cityPoints = useMemo(() => {
    const cities: [number, number][] = [
      [17.385,  78.486], // Hyderabad — HQ
      [25.276,  55.296], // Dubai — UAE
      [40.712, -74.005], // New York — coming soon
    ];
    const r = 0.95;
    const arr = new Float32Array(cities.length * 3);
    cities.forEach(([lat, lon], i) => {
      const phi   = (90 - lat)  * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      arr[i * 3 + 0] = -r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] =  r * Math.cos(phi);
      arr[i * 3 + 2] =  r * Math.sin(phi) * Math.sin(theta);
    });
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const w = weight.current;
    group.current.visible = w > 0.01;
    group.current.rotation.y = clock.elapsedTime * 0.18;
    group.current.scale.setScalar(0.85 + w * 0.15);
    if (wireMat.current) wireMat.current.opacity = w * 0.85;
    if (dotMat.current)  dotMat.current.opacity = w;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(0.92, 2)]} />
        <lineBasicMaterial ref={wireMat} color="#ffffff" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cityPoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dotMat}
          color={ACCENT}
          size={0.07}
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
          toneMapped={false}
        />
      </points>
    </group>
  );
});

export const ACCENTS = { ACCENT, ACCENT_GLOW };
