// cubeStates — typed targets for the 9-section morph timeline (item 4).
// Each state defines the cube's form, fragmentation, particle count, core
// glow intensity, and an optional layout hint. A controller (item 4)
// scrubs lerp(prev → next) as scroll progresses through sections.

export type CubeForm =
  | "cube"         // assembled wireframe + Y core
  | "fragments"    // 12 edge segments float outward
  | "liquid"       // edges melt + pour vertical
  | "modules"      // edges rearrange into stacked planes
  | "collapsed"    // single dense node, bloom blowout
  | "particles"    // ~2000 specks, formation cloud
  | "globe";       // low-poly sphere, edges rebound into latitude lines

export type CubeLayout =
  | "default"
  | "grid_2x3"
  | "pour"
  | "orbital";

export interface CubeState {
  form: CubeForm;
  fragmentation: number;  // 0 = welded, 1 = fully apart
  particleCount: number;  // 0 disables the points layer
  coreGlow: number;       // 0..1 multiplier on emissiveIntensity
  layout?: CubeLayout;
}

export const CUBE_STATES = {
  hero:       { form: "cube",       fragmentation: 0,    particleCount: 0,    coreGlow: 0.6 },
  manifesto:  { form: "cube",       fragmentation: 0.2,  particleCount: 0,    coreGlow: 0.5 },
  kinetic:    { form: "cube",       fragmentation: 0.35, particleCount: 0,    coreGlow: 0.5 },
  services:   { form: "fragments",  fragmentation: 1.0,  particleCount: 0,    coreGlow: 0.4, layout: "grid_2x3" },
  products:   { form: "liquid",     fragmentation: 0.8,  particleCount: 200,  coreGlow: 0.7, layout: "pour" },
  industries: { form: "modules",    fragmentation: 0.6,  particleCount: 0,    coreGlow: 0.4, layout: "orbital" },
  whyus:      { form: "collapsed",  fragmentation: 0,    particleCount: 0,    coreGlow: 1.0 },
  metrics:    { form: "particles",  fragmentation: 0,    particleCount: 2000, coreGlow: 0.5 },
  global:     { form: "globe",      fragmentation: 0,    particleCount: 500,  coreGlow: 0.4 },
  cta:        { form: "cube",       fragmentation: 0,    particleCount: 0,    coreGlow: 1.0 },
} as const satisfies Record<string, CubeState>;

export type CubeStateKey = keyof typeof CUBE_STATES;

// Linear interpolation between two CubeStates (for the scrub controller).
export function lerpState(a: CubeState, b: CubeState, t: number): CubeState {
  return {
    form: t < 0.5 ? a.form : b.form,
    fragmentation: a.fragmentation + (b.fragmentation - a.fragmentation) * t,
    particleCount: Math.round(a.particleCount + (b.particleCount - a.particleCount) * t),
    coreGlow:      a.coreGlow      + (b.coreGlow      - a.coreGlow)      * t,
    layout: b.layout ?? a.layout,
  };
}

// ── Scroll timeline ─────────────────────────────────────────────────────────
// Maps each cube state to a scroll-progress checkpoint (0..1). The order
// matches the 11-section narrative on the home page.
export const STAGE_ORDER: { key: CubeStateKey; at: number }[] = [
  { key: "hero",       at: 0.00 },
  { key: "manifesto",  at: 0.10 },
  { key: "kinetic",    at: 0.20 },
  { key: "services",   at: 0.32 },
  { key: "products",   at: 0.44 },
  { key: "industries", at: 0.56 },
  { key: "whyus",      at: 0.66 },
  { key: "metrics",    at: 0.74 },
  { key: "global",     at: 0.86 },
  { key: "cta",        at: 0.97 },
];

// Returns the interpolated CubeState at progress p (0..1).
export function stageAt(p: number): CubeState {
  const stages = STAGE_ORDER;
  if (p <= stages[0].at) return CUBE_STATES[stages[0].key];
  if (p >= stages[stages.length - 1].at) return CUBE_STATES[stages[stages.length - 1].key];
  for (let i = 0; i < stages.length - 1; i++) {
    const a = stages[i], b = stages[i + 1];
    if (p >= a.at && p < b.at) {
      const t = (p - a.at) / (b.at - a.at);
      // smoothstep
      const e = t * t * (3 - 2 * t);
      return lerpState(CUBE_STATES[a.key], CUBE_STATES[b.key], e);
    }
  }
  return CUBE_STATES[stages[stages.length - 1].key];
}

// Returns a 0..1 weight for how "active" a given state is at scroll progress p.
// Used to crossfade overlay meshes (fragments grid, liquid particles, modules,
// globe, particle cloud). Peaks at the state's checkpoint, falls off linearly
// toward adjacent checkpoints.
export function stateWeight(p: number, key: CubeStateKey): number {
  const idx = STAGE_ORDER.findIndex((s) => s.key === key);
  if (idx === -1) return 0;
  const center = STAGE_ORDER[idx];
  const prev = STAGE_ORDER[idx - 1];
  const next = STAGE_ORDER[idx + 1];
  if (p <= center.at) {
    if (!prev || p <= prev.at) return prev ? 0 : 1;
    return (p - prev.at) / (center.at - prev.at);
  } else {
    if (!next || p >= next.at) return next ? 0 : 1;
    return 1 - (p - center.at) / (next.at - center.at);
  }
}
