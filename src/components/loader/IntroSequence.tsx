"use client";

// IntroSequence — the preloader is the glowing Cubixso CUBE, PRE-RENDERED TO
// VIDEO. It rotates, then the whole curtain lifts UP to reveal the hero.
// Theme-adaptive, plays once per session, honours prefers-reduced-motion, fires
// "cubixso:revealed".
//
// WHY VIDEO AND NOT WebGL: this used to boot a live three.js scene (GLB +
// Draco + an env cubemap + a full-screen bloom pass) purely to spin one cube.
// On the critical path that is the worst possible trade — it had to download
// the model, compile shaders and light a scene before the very first frame, so
// the cube routinely showed up a second or more late, or never arrived before
// the curtain lifted, leaving visitors staring at the keywords floating on an
// empty black field. A 112 KB clip decodes on the GPU's video path, starts in
// a couple of frames, costs no main-thread JS, and looks identical.
//
// ONE asset serves BOTH themes (white cube on black):
//   dark  -> mix-blend-mode: screen   — the black field drops out, cube glows
//   light -> invert(1) + multiply     — cube becomes near-black ink, white drops out
// which is exactly the two looks the WebGL version hand-built per theme.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whoosh } from "@/lib/feedback";
import { useTheme } from "@/components/providers/ThemeProvider";

const SIG = [0.16, 1, 0.3, 1] as const;
const HOLD_AFTER_READY = 3250; // the clip gets a full 3.25s on screen once playing
const MAX_WAIT = 6800;         // hard cap — a stalled asset must never trap anyone.
                               // Sits above HOLD + a realistic start delay so the
                               // ceiling never truncates a healthy playthrough.

// Capability keywords. DESKTOP: they ORBIT the cube on a slow ellipse (positions
// computed per-frame). MOBILE/TABLET: cycled one-at-a-time in a band below it.
const WORDS = [
  "Agentic Orchestration",
  "Agent Teams",
  "Agentic AI",
  "LLMOps",
  "RAG · MCP",
];

export function IntroSequence() {
  const { resolved } = useTheme();
  const dark = resolved !== "light";
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false); // phone / tablet-portrait
  const [wordIdx, setWordIdx] = useState(0); // cycling keyword on compact screens
  const [ready, setReady] = useState(false); // video is genuinely playing
  // Autoplay was refused — swap the <video> for an animated WebP, which no
  // autoplay policy applies to. See the play() effect below.
  const [fallback, setFallback] = useState(false);
  const done = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]); // orbiting keywords (desktop)

  const finish = () => {
    if (done.current) return;
    done.current = true;
    try { sessionStorage.setItem("cubixso.seen", "1"); } catch { /* private */ }
    try { window.dispatchEvent(new Event("cubixso:revealed")); } catch { /* ssr */ }
    whoosh();
    setExiting(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { if (sessionStorage.getItem("cubixso.seen") === "1") return; } catch { /* private */ }
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // 1023.98px = Tailwind's lg boundary, matching the nav's own switch. At the
    // old 900px cutoff, 901–1023px tablets got the DESKTOP intro: orbiting
    // keywords on an ellipse too wide for the viewport (they clipped at the
    // edges) plus the full bloom pass, on exactly the GPUs least able to afford
    // it. Tablets now take the compact path with the rest of the chrome.
    setCompact(window.matchMedia("(max-width: 1023.98px)").matches);
    setShow(true);
  }, []);

  // Hard ceiling. Whatever happens — a stalled download, a codec the browser
  // refuses, autoplay being blocked — the curtain lifts. A preloader that can
  // trap the visitor is worse than no preloader.
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(finish, reduced ? 700 : MAX_WAIT);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced]);

  // The normal path: hold only AFTER the cube is genuinely on screen. The old
  // code lifted on a fixed 3.6s wall-clock timer that started at mount, so on a
  // slow device the curtain rose over a blank canvas — the cube was never seen.
  // Now a fast (cached) load reveals sooner and a slow one still shows the cube.
  useEffect(() => {
    if (!show || reduced || !ready) return;
    const t = window.setTimeout(finish, HOLD_AFTER_READY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, reduced, ready]);

  // Autoplay can be refused (Low Power Mode on iOS, data-saver, strict policies).
  // The clip is muted + playsInline so it is normally allowed, but if play()
  // rejects we must not sit waiting on a "playing" event that will never fire —
  // mark ready and let the poster frame stand in.
  useEffect(() => {
    if (!show) return;
    const v = videoRef.current;
    if (!v) { setReady(true); return; }

    // Set muted/playsInline on the ELEMENT, not just via JSX. React sets the
    // `muted` DOM property but does not reliably emit the `muted` ATTRIBUTE,
    // and iOS Safari checks the attribute when deciding whether inline
    // autoplay is allowed — so the clip was refused and the poster (a still
    // frame) stood in, which is why the cube looked frozen on phones.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    let cleanup = () => {};
    const attempt = () => v.play().then(() => true).catch(() => false);

    attempt().then((ok) => {
      if (ok) return;
      // Still refused. iOS blocks inline autoplay OUTRIGHT in Low Power Mode and
      // Low Data Mode, and no amount of muted/playsInline/gesture-priming beats
      // that — play() simply rejects. The poster then stands in, which is the
      // "cube is frozen on the loading screen" report: the still frame is doing
      // exactly what it was asked to.
      //
      // So stop depending on video at all in this branch. An animated WebP is an
      // IMAGE: no autoplay policy applies, it animates in Low Power Mode, and it
      // needs no gesture. It is only fetched here, so the 95% path still gets
      // the smaller 30fps clip and pays nothing for this.
      setFallback(true);
      setReady(true);
      const onGesture = () => { void v.play().catch(() => {}); cleanup(); };
      window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
      window.addEventListener("touchstart", onGesture, { once: true, passive: true });
      cleanup = () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("touchstart", onGesture);
      };
    });

    return () => cleanup();
  }, [show]);

  // On compact screens the keywords cycle one-at-a-time (see render) — advance
  // the index on a gentle interval.
  useEffect(() => {
    if (!show || !compact || reduced) return;
    // The interval MUST exceed the enter+exit transition. At 620ms against a
    // 0.5s-each crossfade under AnimatePresence mode="wait", every word was
    // interrupted mid-fade and none ever reached full opacity — the flicker
    // reported on mobile. 1150ms against a 0.32s fade leaves ~0.5s of steady
    // hold per word.
    const id = window.setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 1150);
    return () => clearInterval(id);
  }, [show, compact, reduced]);

  // DESKTOP: the keywords ORBIT the cube — a tilted ring in 3D, evenly spaced,
  // staying upright (no tumble). Direct ref writes per frame, no re-render.
  //
  // The radius is derived from the CUBE'S MEASURED SIZE, not from viewport
  // fractions. The old code used min(40vw,600) x min(28vh,300): on a typical
  // laptop that made Ry ~224px while the cube's own radius is up to 260px, so
  // the orbit ran straight THROUGH the cube. Measuring the video element means
  // clearance is guaranteed at every viewport, and the ring stays circular
  // rather than collapsing into a flat sliver on short screens.
  //
  // Depth sells the dimension: the near side of the ring (bottom) renders
  // bigger, brighter and sharp; the far side (top) smaller, dimmer and slightly
  // blurred. Those cues live on an INNER span because the outer element's
  // entrance opacity is owned by the cbx-orbit-word CSS animation, and a
  // running animation beats an inline style.
  useEffect(() => {
    if (!show || compact || reduced) return;
    let raf = 0;
    let start = 0;
    const N = WORDS.length;
    const GAP = 76; // clear of the cube's glow + the word's own height

    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = ts - start;

      const vid = videoRef.current;
      const cubeR = (vid?.clientWidth || 320) / 2;
      const need = cubeR + GAP; // never orbit closer than this
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;

      // Clamp outward so words stay on screen and clear the wordmark band at
      // the bottom, but never inward past `need`.
      const Rx = Math.max(need, Math.min(halfW - 130, Math.max(need, halfW * 0.62)));
      const Ry = Math.max(need, Math.min(halfH - 130, Math.max(need, halfH * 0.58)));

      const base = t * 0.000393; // rad/ms → ~16s per revolution (visible flow)

      for (let i = 0; i < N; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const a = base + (i / N) * Math.PI * 2 - Math.PI / 2; // start at top
        el.style.transform =
          `translate(-50%, -50%) translate(${Math.cos(a) * Rx}px, ${Math.sin(a) * Ry}px)`;

        // depth 0 = far side (top), 1 = near side (bottom)
        const d = (Math.sin(a) + 1) / 2;
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) {
          inner.style.transform = `scale(${(0.78 + 0.22 * d).toFixed(3)})`;
          inner.style.opacity = (0.38 + 0.62 * d).toFixed(3);
          inner.style.filter = d > 0.92 ? "none" : `blur(${((1 - d) * 1.5).toFixed(2)}px)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show, compact, reduced]);

  if (!show) return null;

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduced ? 0.4 : 0.9, ease: SIG }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          // PURE black (not #060708) so it matches the clip's own black
          // background exactly — that match is what replaces the blend mode.
          // Light stays pure white, which the inverted clip's background
          // becomes. Any drift here reintroduces a visible box around the cube.
          style={{ background: dark ? "#000000" : "#ffffff" }}
          aria-hidden
        >
          {/* The cube, pre-rendered. One asset, both themes — see the blend-mode
              note at the top of this file. onError/onStalled still mark ready so
              a codec the browser dislikes can never hold the curtain down; the
              poster (and worst case the wordmark) carries the moment instead. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            {fallback ? (
              /* Animated WebP — same cube, same framing, same invert-for-light
                 treatment. Used only when play() was refused. */
              <img
                src="/video/intro-cube-anim.webp"
                alt=""
                className="h-auto w-[min(50vw,40vh,400px)] select-none"
                style={{ filter: dark ? undefined : "invert(1)" }}
              />
            ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/video/intro-cube-poster.jpg"
              onPlaying={() => setReady(true)}
              onCanPlay={() => setReady(true)}
              onError={() => setReady(true)}
              onStalled={() => setReady(true)}
              className="h-auto w-[min(50vw,40vh,400px)] select-none"
              // NO mix-blend-mode. iOS Safari composites <video> in its own
              // layer and silently ignores blend modes, so the previous
              // screen/multiply blend produced a blank cube on phones while
              // working fine on desktop — the reported mobile failure.
              //
              // Instead the CURTAIN's background is matched to the clip's own
              // background (pure black behind the untouched clip, pure white
              // behind the inverted one), so the two composite seamlessly with
              // plain alpha-less painting on every engine.
              style={{ filter: dark ? undefined : "invert(1)" }}
            >
              {/* mp4 first: every mobile engine decodes h264, and putting the
                  webm first made some Safari builds stall on a VP9 probe. */}
              <source src="/video/intro-cube.mp4" type="video/mp4" />
              <source src="/video/intro-cube.webm" type="video/webm" />
            </video>
            )}
          </div>

          {/* Capability keywords. DESKTOP: they ORBIT the cube on a tilted 3D
              ring (position per-frame from the orbit effect; entrance fade via
              CSS on the OUTER element so it never fights the JS transform,
              depth cues on the INNER span so they never fight that animation).
              MOBILE/TABLET: no room beside the cube, so cycle ONE at a time. */}
          {!reduced && !compact && WORDS.map((w, i) => (
            <div
              key={w}
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{
                transform: "translate(-50%, -50%)",
                animationDelay: `${0.25 + i * 0.1}s`,
                willChange: "transform",
              }}
              className="cbx-orbit-word pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap"
            >
              <span
                className={`block font-display text-[15px] font-medium tracking-[0.005em] ${dark ? "text-white" : "text-black"}`}
                style={{ willChange: "transform, opacity, filter" }}
              >
                {w}
              </span>
            </div>
          ))}

          {!reduced && compact && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[24%] flex justify-center px-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.32, ease: SIG }}
                  className={`text-center font-display text-[15px] font-medium tracking-[0.04em] ${dark ? "text-white/85" : "text-black/80"}`}
                >
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          {/* bold brand wordmark — ".ai" is a SOFT, FLOWING gradient (the colour
              gently drifts left→right forever). Palindrome stops + 200% size make
              the loop seamless. */}
          <style>{`
            @keyframes cbx-ai-flow { to { background-position: 200% center; } }
            @keyframes cbx-orbit-fade { from { opacity: 0; } to { opacity: 1; } }
            .cbx-orbit-word { opacity: 0; animation: cbx-orbit-fade 0.9s ease forwards; }
          `}</style>
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.45, ease: SIG }}
            className="pointer-events-none absolute bottom-[10vh] left-1/2 -translate-x-1/2 font-display text-[clamp(24px,3.6vw,42px)] font-semibold tracking-[-0.02em]"
            style={{ color: dark ? "#ffffff" : "#0a0a0c" }}
          >
            cubixso
            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#6EA8FF,#9C8CFF,#5FD7FF,#9C8CFF,#6EA8FF)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: reduced ? undefined : "cbx-ai-flow 4s linear infinite",
              }}
            >
              .ai
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
