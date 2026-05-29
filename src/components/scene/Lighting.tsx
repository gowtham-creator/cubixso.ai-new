"use client";

// Lighting — three-point studio rig per the prompt spec.
// Key (warm-white, upper-right) + rim (accent-blue, lower-left) + ambient.
// Subtle env map via a low-poly hemisphere fill, no full HDRI needed.

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#ffffff" />

      {/* Key — warm-white from upper-right */}
      <directionalLight
        position={[3.5, 4.5, 5]}
        intensity={1.4}
        color="#fff8e7"
        castShadow
      />

      {/* Rim — accent cobalt from lower-left, gives the cube its halo */}
      <pointLight
        position={[-3, -2, -3]}
        intensity={1.2}
        color="#1B4FFF"
        distance={10}
        decay={2}
      />

      {/* Soft fill — hemisphere keeps the wireframe readable in shadow */}
      <hemisphereLight
        color="#aabfff"
        groundColor="#06070b"
        intensity={0.25}
      />
    </>
  );
}
