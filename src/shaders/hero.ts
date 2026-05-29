// hero.ts — vertex + fragment shaders for the Hero gradient-mesh backdrop.
// Domain-warped fbm noise, mouse warp, scroll modulation, accent color
// blending. Designed for a fullscreen orthographic plane.

export const heroVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const heroFrag = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uMouse;       // -1..1 NDC, smoothed
  uniform vec2  uResolution;
  uniform float uScroll;      // 0..1
  uniform vec3  uAccent;      // primary
  uniform vec3  uAccent2;     // secondary
  uniform vec3  uAccent3;     // tertiary

  // Hash + value noise (Quilez)
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  // Domain-warped fbm — feels organic, never repeats over a session
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    p.x *= aspect;

    // Mouse warp — pull the field gently toward the cursor
    vec2 m = uMouse; m.x *= aspect;
    vec2 toM = p - m;
    float pull = 0.55 / (length(toM) + 0.55);
    p -= toM * pull * 0.08;

    // Time + scroll drive the warp
    float t = uTime * 0.13 + uScroll * 1.6;

    // Two-pass domain warping for that organic gradient-mesh look
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.5)),
                  fbm(p + vec2(5.2, t * 0.7)));
    vec2 r = vec2(fbm(p + 1.4 * q + vec2(1.7, 9.2) + t * 0.3),
                  fbm(p + 1.4 * q + vec2(8.3, 2.8) + t * 0.4));
    float n = fbm(p + 1.6 * r);

    // Color ramp — blend the three accents along the noise field
    vec3 c1 = mix(vec3(0.02, 0.02, 0.04), uAccent,  smoothstep(0.0, 0.7, n));
    vec3 c2 = mix(c1, uAccent2, smoothstep(0.4, 0.9, n * 1.1 + r.x * 0.4));
    vec3 col = mix(c2, uAccent3, smoothstep(0.55, 0.95, length(r) * 0.7 + 0.25));

    // Soft glow toward the cursor — keeps the field feeling reactive
    float glow = exp(-length(p - m) * 1.8) * 0.45;
    col += uAccent2 * glow;

    // Vignette + film grain — cinematic finish in-shader
    float vign = 1.0 - smoothstep(0.55, 1.5, length(p));
    col *= mix(0.32, 1.0, vign);
    col += (hash(uv * uResolution.xy + uTime) - 0.5) * 0.045;

    // Gentle gamma + lift
    col = pow(col, vec3(0.88));
    col = mix(vec3(0.0), col, 0.97);

    gl_FragColor = vec4(col, 1.0);
  }
`;
