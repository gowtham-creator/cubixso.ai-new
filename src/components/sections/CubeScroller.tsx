"use client";

// CubeScroller — a continuously spinning Cubixso cube you can grab and throw,
// modelled on the contact-page globe. A live GLB, so it stays razor-sharp at any
// size with no pre-rendered PNG pipeline. Theme-adaptive; the render loop stops
// when the section is off-screen.
//
// It began as a scroll-SCRUB across a 320vh sticky track, with rotation
// quantized to 94 discrete steps to imitate a baked image sequence. Three
// separate complaints all traced back to that design:
//   • it snapped ~4° at a time, which is what "not smooth" meant;
//   • it only rendered on demand (frameloop="never" between scroll events), so
//     the cube could sit blank until a click forced a frame;
//   • one full turn needed 2.2 viewports of scrolling, and with the cube centred
//     in a sticky panel the lower half of every one of those screens was empty —
//     the "gap" below this section.
// Auto-spin plus pointer control removes all three: no track, no dead space, and
// the cube is always moving.

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cdn } from "@/lib/cdn";
import { useDeviceTier, hasWebGL } from "@/lib/perf";

const MODEL = cdn("/models/cubixso-cube.glb");
const DRACO = cdn("/draco/");
// Idle spin rate in radians/sec — one full turn every ~28s, the same unhurried
// pace as the contact-page globe.
const AUTO_SPIN = (Math.PI * 2) / 28;
const BASE_TILT = 0.34;

type Drag = { x: number; y: number; vx: number; dragging: boolean };

function ScrubCube({
  dragRef,
  dark,
  active,
}: {
  dragRef: React.MutableRefObject<Drag>;
  dark: boolean;
  active: boolean;
}) {
  const { scene } = useGLTF(MODEL, DRACO);
  const root = useRef<THREE.Group>(null);

  // Clone + recolor: dark glowing body, theme-tinted emissive edges (bloom turns
  // these into the brand glow). Cloned so we never mutate the shared GLB cache.
  const model = useMemo(() => {
    const neon = new THREE.Color(dark ? "#cfe0ff" : "#1B4FFF");
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.color.setRGB(0.02, 0.035, 0.09);
      mat.emissive.copy(neon);
      mat.emissiveIntensity = dark ? 1.7 : 1.1;
      m.material = mat;
    });
    return c;
  }, [scene, dark]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const d = Math.min(delta, 0.1); // clamp after a tab-switch stall

    // Continuous auto-spin, exactly like the contact-page globe: the cube turns
    // on its own and the visitor can grab it. It used to be scroll-scrubbed and
    // quantized to 94 steps, which meant it only moved while you scrolled, it
    // snapped ~4° at a time, and it needed a 320vh track to turn once — that
    // track is where the dead space below this section came from.
    if (!dragRef.current.dragging) {
      // Momentum: a flick keeps spinning and decays back to the idle rate,
      // rather than stopping dead the instant you let go.
      dragRef.current.vx += (AUTO_SPIN - dragRef.current.vx) * (1 - Math.exp(-1.6 * d));
      dragRef.current.x += dragRef.current.vx * d;
      // Tilt eases back to rest so the cube always recomposes itself.
      dragRef.current.y += (0 - dragRef.current.y) * (1 - Math.exp(-1.2 * d));
    }

    const targetY = dragRef.current.x;
    const targetX = BASE_TILT + dragRef.current.y;

    // Frame-rate independent smoothing: same easing at 60fps and 120fps.
    const k = 1 - Math.exp(-14 * d);
    root.current.rotation.y += (targetY - root.current.rotation.y) * k;
    root.current.rotation.x += (targetX - root.current.rotation.x) * k;
  });

  return (
    <group ref={root} rotation={[0.34, 0, 0]} visible={active}>
      <primitive object={model} />
    </group>
  );
}

// Fires once, on the first frame actually rendered after the model and
// environment have resolved — the moment there is a real cube on screen.
function OnFirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

export function CubeScroller() {
  const ref = useRef<HTMLElement>(null);
  const { resolved } = useTheme();
  const dark = resolved === "dark";
  const [active, setActive] = useState(true);
  // iOS Safari caps simultaneous WebGL contexts and evicts the OLDEST when the
  // cap is hit, leaving that canvas frozen on its last frame. This section sits
  // far below the fold but used to create its context at page load, competing
  // with the hero's. `near` defers creation until the section is within a
  // viewport of the fold — mounted in time to be ready, not at first paint.
  const [near, setNear] = useState(false);
  // Manual rotation offset, added on top of the scroll-driven rotation so the
  // two compose instead of fighting. Kept in a ref: it changes every pointermove
  // and must not re-render React on each one.
  const dragRef = useRef<Drag>({ x: 0, y: 0, vx: AUTO_SPIN, dragging: false });
  const stageRef = useRef<HTMLDivElement>(null);


  // Device-adaptive quality. Both default to high / WebGL-present on the server
  // and first client paint (see @/lib/perf), so desktop renders pixel-identical
  // and there is no hydration mismatch — degradation kicks in only after mount.
  const tier = useDeviceTier();
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);

  // High tier keeps the approved adaptive DPR; low tier clamps to 1.
  const dpr: 1 | [number, number] = tier === "low" ? 1 : [1, 2];

  // Pause the render loop when the section is off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    // 250% (was 100%): the GLB + Draco decode + material compile is not instant,
    // and mounting only one viewport ahead meant the canvas was still warming up
    // when the section arrived — the "cube takes time to show up" report. Two
    // and a half viewports of lead time covers the download at typical scroll
    // speeds while still keeping the WebGL context released for most of the page.
    const ioNear = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "250% 0px" });
    ioNear.observe(el);
    return () => { io.disconnect(); ioNear.disconnect(); };
  }, []);

  // WHEN THE CANVAS EXISTS — the actual cause of "takes time to show up".
  //
  // It used to be gated purely on `near`, so it unmounted whenever you scrolled
  // 2.5 viewports away and rebuilt from nothing on the way back: a new WebGL
  // context, the Draco-decoded model re-uploaded, standard-material and
  // environment-map shaders recompiled, the environment cubemap re-rendered, and
  // every Bloom pass compiled again. Half a second to well over a second, paid on
  // every return — the cube visibly arriving late.
  //
  // High tier (desktop): build it ONCE, early, and keep it. It warms up in idle
  // time as soon as the page is revealed, so it is compiled long before anyone
  // scrolls to it, and afterwards it only ever pauses its frameloop. Desktop has
  // no live-context cap, so holding it costs nothing that matters.
  //
  // Low tier (phones): keep the near-gated mount. iOS evicts the oldest WebGL
  // context when it runs out, so a phone genuinely cannot afford to hold this one
  // for the whole session.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (tier === "low") return;
    let idle: number | undefined;
    let timer: number | undefined;
    const schedule = () => {
      const ric = (window as Window & {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }).requestIdleCallback;
      if (ric) idle = ric(() => setWarm(true), { timeout: 2500 });
      else timer = window.setTimeout(() => setWarm(true), 1200);
    };
    // Don't compete with the intro curtain for the main thread: wait for it to
    // lift. It only plays once per session, so on later visits start at once.
    let seen = false;
    try { seen = sessionStorage.getItem("cubixso.seen") === "1"; } catch { /* private mode */ }
    if (seen) schedule();
    else window.addEventListener("cubixso:revealed", schedule, { once: true });
    return () => {
      window.removeEventListener("cubixso:revealed", schedule);
      if (idle !== undefined) (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [tier]);

  // Once mounted on a high-tier device it stays mounted.
  const [latched, setLatched] = useState(false);
  useEffect(() => { if (near || warm) setLatched(true); }, [near, warm]);
  const showCanvas = webgl && (tier === "low" ? near : latched);

  // Fade the stage in on its first real frame rather than letting the cube pop.
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!showCanvas) setReady(false); }, [showCanvas]);

  // Drag to rotate, matching the contact-page globe. Pointer (not mouse) events
  // so it works on touch, and setPointerCapture so the gesture survives the
  // cursor leaving the canvas.
  //
  // touch-action is pan-y, NOT none: the page still has to scroll past this
  // section on a phone, so removing vertical panning would trap touch users
  // inside it. The browser keeps vertical scroll; we claim horizontal drag, and
  // only once the gesture is clearly horizontal.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const touch = e.pointerType === "touch";
      let lastX = e.clientX, lastY = e.clientY;
      let lastT = performance.now();
      let claimed = !touch; // a mouse press is ours immediately
      const sx = e.clientX, sy = e.clientY;
      try { el.setPointerCapture(e.pointerId); } catch { /* not captureable */ }

      const move = (m: PointerEvent) => {
        if (!claimed) {
          // Wait until the gesture is clearly horizontal before stealing it
          // from the page's vertical scroll.
          if (Math.abs(m.clientX - sx) < Math.abs(m.clientY - sy)) return;
          claimed = true;
        }
        dragRef.current.dragging = true;
        el.style.cursor = "grabbing";

        const now = performance.now();
        const dt = Math.max(16, now - lastT) / 1000;
        const dx = m.clientX - lastX;
        const dy = m.clientY - lastY;

        dragRef.current.x += dx * 0.008;
        // Track throw speed so releasing hands off real momentum.
        dragRef.current.vx = (dx * 0.008) / dt;
        if (!touch) {
          dragRef.current.y = Math.max(-0.8, Math.min(0.8, dragRef.current.y - dy * 0.006));
        }
        lastX = m.clientX; lastY = m.clientY; lastT = now;
      };
      const up = () => {
        dragRef.current.dragging = false;
        // Cap the throw so a violent flick cannot spin it into a blur.
        const max = AUTO_SPIN * 14;
        dragRef.current.vx = Math.max(-max, Math.min(max, dragRef.current.vx));
        el.style.cursor = "grab";
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    };

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [showCanvas]);

  return (
    // One screen, no scroll track. This was 320vh of sticky scrub (then 220, then
    // 180): the cube only turned while you scrolled, and because it sat centred
    // in a full-viewport sticky panel, the lower half of every screen in that
    // track was empty. That dead run — not the section spacing, which measured
    // flush at 0px — is the gap. Now the cube spins on its own and responds to
    // the mouse, so the section needs exactly the height it occupies.
    <section ref={ref} id="forge" aria-label="Built dimensional" className="relative z-10 h-svh">
      <div className="flex h-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute left-[var(--pad-x)] top-[clamp(80px,14vh,140px)] mono text-[11px] tracking-[0.3em] text-(--color-muted)">
          [ DIMENSIONAL ]
        </div>

        {showCanvas && (
        <div
          ref={stageRef}
          // Was pointer-events-none. The cube is now grabbable, so the stage has
          // to receive pointers — see the drag effect above for why touch-action
          // is pan-y rather than none.
          className="absolute inset-0 cursor-grab transition-opacity duration-700 ease-out"
          style={{ touchAction: "pan-y", opacity: ready ? 1 : 0 }}
        >
          <Canvas
            orthographic
            camera={{ position: [3.4, 3.4, 3.4], zoom: 105, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: true }}
            dpr={dpr}
            frameloop={active ? "always" : "never"}
            onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
          >
            <ambientLight intensity={dark ? 0.3 : 0.6} />
            <directionalLight position={[4, 6, 3]} intensity={0.8} color="#cdd9ff" />
            <pointLight position={[-3, 2, -2]} intensity={dark ? 14 : 5} color="#5f8bff" distance={18} />
            <Suspense fallback={null}>
              <ScrubCube dragRef={dragRef} dark={dark} active={active} />
              <Environment resolution={128} frames={1} environmentIntensity={dark ? 0.45 : 0.85}>
                <Lightformer intensity={1.8} color="#9fc0ff" position={[0, 3, 3]} scale={[7, 3, 1]} />
                <Lightformer intensity={1.1} color="#cfe0ff" position={[4, -1, -3]} scale={[5, 3, 1]} />
              </Environment>
              {/* Pre-compile materials + env map while the intro curtain still
                  covers the page, so the first scrolled frame never stutters. */}
              <Preload all />
              <OnFirstFrame onReady={() => setReady(true)} />
            </Suspense>
            <EffectComposer>
              <Bloom intensity={dark ? 1.1 : 0.4} luminanceThreshold={dark ? 0.12 : 0.5} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Canvas>
        </div>
        )}

        {/* The frame counter went with the scrub — there are no frames now, and
            "SCROLL TO ROTATE" would be a lie. */}
        <div className="pointer-events-none absolute bottom-[clamp(48px,9vh,110px)] left-1/2 z-10 -translate-x-1/2 text-center">
          <h2 className="font-display text-[clamp(26px,4.4vw,56px)] font-medium leading-[0.95] tracking-[-0.03em] text-(--color-fg)">
            Built dimensional.
          </h2>
          <p className="mono mt-4 text-[11px] tracking-[0.3em] text-(--color-muted)">
            DRAG TO ROTATE
          </p>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload(MODEL, DRACO);
