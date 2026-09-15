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
const HOLD_AFTER_READY = 2200; // beat to admire the cube once it is truly on screen
const MAX_WAIT = 5000;         // hard cap — a stalled asset must never trap anyone

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
    v.play().catch(() => setReady(true));
  }, [show]);

  // On compact screens the keywords cycle one-at-a-time (see render) — advance
  // the index on a gentle interval.
  useEffect(() => {
    if (!show || !compact || reduced) return;
    const id = window.setInterval(() => setWordIdx((i) => (i + 1) % WORDS.length), 1150);
    return () => clearInterval(id);
  }, [show, compact, reduced]);

  // DESKTOP: the keywords ORBIT the cube — they ride a slow elliptical path
  // around the centre, evenly spaced, staying upright (pure translation, no
  // tumble). Direct ref writes per frame (no React re-render). ~36s/rev.
  useEffect(() => {
    if (!show || compact || reduced) return;
    let raf = 0;
    let start = 0;
    const N = WORDS.length;
    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = ts - start;
      // Ry was 0.34/360, which swung the lowest word straight through the
      // "cubixso.ai" wordmark sitting at bottom-[10vh] — they visibly collided.
      // Tightened so the orbit always clears the wordmark band.
      const Rx = Math.min(window.innerWidth * 0.4, 600);
      const Ry = Math.min(window.innerHeight * 0.28, 300);
      const base = t * 0.000175; // rad/ms → ~36s per revolution
      for (let i = 0; i < N; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const a = base + (i / N) * Math.PI * 2 - Math.PI / 2; // start at top
        const x = Math.cos(a) * Rx;
        const y = Math.sin(a) * Ry;
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
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
          style={{ background: dark ? "#060708" : "#ffffff" }}
          aria-hidden
        >
          {/* The cube, pre-rendered. One asset, both themes — see the blend-mode
              note at the top of this file. onError/onStalled still mark ready so
              a codec the browser dislikes can never hold the curtain down; the
              poster (and worst case the wordmark) carries the moment instead. */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
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
              className="h-auto w-[min(62vw,62vh,520px)] select-none"
              style={{
                mixBlendMode: dark ? "screen" : "multiply",
                filter: dark ? undefined : "invert(1)",
              }}
            >
              <source src="/video/intro-cube.webm" type="video/webm" />
              <source src="/video/intro-cube.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Capability keywords. DESKTOP: they ORBIT the cube on a slow ellipse
              (transform set per-frame by the orbit effect; fade-in via CSS so it
              never fights the JS transform). MOBILE/TABLET: no room beside the
              cube, so cycle ONE keyword at a time in a band below it. */}
          {!reduced && !compact && WORDS.map((w, i) => (
            <div
              key={w}
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{ transform: "translate(-50%, -50%)", animationDelay: `${0.4 + i * 0.12}s` }}
              className={`cbx-orbit-word pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap font-display text-[15px] font-medium tracking-[0.005em] ${dark ? "text-white/90" : "text-black/85"}`}
            >
              {w}
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
                  transition={{ duration: 0.5, ease: SIG }}
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
