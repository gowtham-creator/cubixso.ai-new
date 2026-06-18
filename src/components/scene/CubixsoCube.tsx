"use client";

// CubixsoCube — ONE cube component, two states. Loads the Blender-authored
// edge-frame logo glb (public/models/cubixso-cube.glb) and is reused by both
// the loader intro and the homepage hero — no second cube, no second load.
//
//   mode="intro"  the baked assembly clips play once + JS opacity/emission fade,
//                 then it HOLDS the resolved logo pose (no spin).
//   mode="hero"   fully settled; RESTS at the exact logo pose at scroll 0, and
//                 page-scroll progress adds a gentle, damped Y rotation so
//                 scrolling reveals the dimensional cube (logo at rest → depth
//                 on scroll). prefers-reduced-motion ⇒ static logo.
//
// Each instance clones the glb scene + its materials, so the intro instance and
// the hero instance never fight over the shared useGLTF cache.

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/cubixso-cube.glb";

// per-bar opacity + emission fade windows (seconds) for the intro assembly
const FADE: Record<string, [number, number]> = {
  bar_00: [0.03, 0.43], bar_01: [0.13, 0.53], bar_02: [0.23, 0.63], bar_03: [0.33, 0.73],
  bar_08: [0.40, 0.80], bar_10: [0.57, 0.97], bar_11: [0.73, 1.13],
  bar_04: [0.80, 1.07], bar_05: [0.93, 1.20], bar_06: [1.07, 1.33],
  bar_07: [1.20, 1.47], bar_09: [1.33, 1.60],
};

// Hero: quiet continuous idle Y-spin + a heavily-damped, subtle scroll drift,
// plus a gentle vertical "hover" bob so the cube floats (antigravity / spatial UI).
const IDLE_SPIN = 0.1;     // rad/s — slow, low-key
const SCROLL_DRIFT = 0.2;  // rad per viewport scrolled — barely there
const BOB_AMP = 0.12;      // world units — ~8px of float at the hero zoom
const BOB_SPEED = 1.35;    // rad/s — ~4.6s hover cycle

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// Shared page-scroll signal in "viewports scrolled", rAF-throttled.
function useScrollViewports() {
  const ref = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let ticking = false;
    const update = () => {
      ref.current = window.scrollY / Math.max(1, window.innerHeight);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; raf = requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

interface BarState {
  mat: THREE.MeshStandardMaterial;
  finalE: number;
  s: number;
  e: number;
  name: string;
  ord: number; // sequential light-on/off order (sorted by mesh name)
}

type ThemeHandle = { current: { isDark: boolean } };

interface Props {
  mode: "intro" | "hero";
  reduced?: boolean;
  /** hero: gate the render loop (e.g. paused when off-screen). */
  active?: boolean;
  /** imperative theme source — tints the logo white (dark) / charcoal (light). */
  themeRef?: ThemeHandle;
  /** hero only: override bar emissive to this neon hex (e.g. cobalt #1B4FFF). */
  accent?: string;
}

export function CubixsoCube({ mode, reduced = false, active = true, themeRef, accent }: Props) {
  const root = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL, "/draco/");
  const scrollVp = useScrollViewports();
  const lastDark = useRef<boolean | null>(null);

  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const isReduced = reduced || prefersReduced;

  // Clone scene + materials so this instance is independent of the cache.
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = (m.material as THREE.Material).clone();
    });
    return c;
  }, [scene]);

  const { actions } = useAnimations(animations, root);

  const bars = useMemo<BarState[]>(() => {
    const list: BarState[] = [];
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const w = FADE[o.name] ?? [0, 0.5];
      list.push({ mat, finalE: mat.emissiveIntensity ?? 1, s: w[0], e: w[1], name: o.name, ord: 0 });
    });
    // sequential light order = sorted by mesh name (bar_00 … bar_11, Y …)
    [...list].sort((a, b) => a.name.localeCompare(b.name)).forEach((b, i) => { b.ord = i; });
    return list;
  }, [model]);

  const t0 = useRef<number | null>(null);
  const played = useRef(false);
  const fadeDone = useRef(false);
  const curRot = useRef(0);     // damped scroll-drift offset
  const spinAngle = useRef(0);  // accumulated idle spin

  useEffect(() => {
    if (mode === "hero" || isReduced) {
      // settled, fully visible, parked at the logo pose
      const neon = accent ? new THREE.Color(accent) : null;
      bars.forEach((b) => {
        b.mat.transparent = false; b.mat.opacity = 1; b.mat.depthWrite = true;
        if (neon) {
          // neon override — dark body, glowing cobalt edges (bloom turns these
          // into the reference's blue glow).
          b.mat.color.setRGB(0.02, 0.035, 0.09);
          b.mat.emissive.copy(neon);
          b.mat.emissiveIntensity = 1.9;
        } else {
          b.mat.emissiveIntensity = b.finalE;
        }
      });
    } else {
      bars.forEach((b) => {
        b.mat.transparent = true; b.mat.opacity = 0;
        b.mat.emissiveIntensity = 0; b.mat.depthWrite = false;
      });
      t0.current = null; played.current = false; fadeDone.current = false;
    }
  }, [mode, bars, isReduced, accent]);

  useFrame((state, delta) => {
    // Theme tint (imperative — never re-renders). White on dark, charcoal on
    // light, so the logo stays legible on either background.
    if (themeRef) {
      const dark = themeRef.current.isDark;
      if (dark !== lastDark.current) {
        lastDark.current = dark;
        for (const b of bars) {
          if (dark) { b.mat.color.setRGB(1, 1, 1); b.mat.emissive.setRGB(0.45, 0.45, 0.45); }
          else { b.mat.color.setRGB(0.04, 0.04, 0.05); b.mat.emissive.setRGB(0.02, 0.02, 0.03); }
        }
      }
    }

    // INTRO — assembly fade + clips, hold the logo pose (no spin)
    if (mode === "intro") {
      if (isReduced) return;
      if (t0.current == null) t0.current = state.clock.elapsedTime;
      const tc = state.clock.elapsedTime - t0.current;
      if (!played.current) {
        played.current = true;
        Object.values(actions).forEach((a) => {
          a?.reset(); a?.setLoop(THREE.LoopOnce, 1);
          if (a) a.clampWhenFinished = true; a?.play();
        });
      }
      if (!fadeDone.current) {
        let all = true;
        for (const b of bars) {
          const k = easeOut((tc - b.s) / Math.max(1e-4, b.e - b.s));
          b.mat.opacity = k;
          b.mat.emissiveIntensity = k * b.finalE;
          if (k >= 1) {
            if (b.mat.transparent) {
              b.mat.transparent = false; b.mat.depthWrite = true; b.mat.needsUpdate = true;
            }
          } else all = false;
        }
        if (all) fadeDone.current = true;
      }
      return;
    }

    // HERO — quiet continuous idle Y-spin + heavily-damped subtle scroll drift.
    if (!active) return;

    // Scroll-linked edge illumination (neon mode): every edge lit at the hero
    // (scroll 0); each turns OFF one-by-one as you scroll DOWN, and back ON when
    // you scroll UP. Reversible because it's a pure function of scroll position.
    if (accent && !isReduced) {
      const n = bars.length;
      const p = clamp01(scrollVp.current); // 0 at hero, ~1 after one viewport down
      const W = 0.05;
      for (const b of bars) {
        const th = 0.12 + (b.ord / Math.max(1, n - 1)) * 0.78;
        const s = clamp01((p - (th - W)) / (2 * W));
        b.mat.emissiveIntensity = (1 - s * s * (3 - 2 * s)) * 1.9;
      }
    }

    if (!isReduced) {
      spinAngle.current += delta * IDLE_SPIN;
      const driftTarget = scrollVp.current * SCROLL_DRIFT;
      curRot.current += (driftTarget - curRot.current) * Math.min(1, delta * 2);
    }
    if (root.current) {
      root.current.rotation.y = spinAngle.current + curRot.current;
      // gentle hover so it floats rather than rotating in place
      root.current.position.y = isReduced ? 0 : Math.sin(state.clock.elapsedTime * BOB_SPEED) * BOB_AMP;
    }
  });

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_URL, "/draco/");
