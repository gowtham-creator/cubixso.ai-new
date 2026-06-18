"use client";

// VideoVoid — the cinematic film layer (user: "build it immersive using
// blender"). A Blender-EEVEE-rendered seamless 10s loop — the brand cube
// glowing cobalt over a midnight mirror-ocean — plays full-bleed behind the
// HERO, then crossfades out over the first ~1.2 viewports as the live WebGL
// cube (VoidCube) fades in and takes over the scroll-morph story. Film for
// the first impression, realtime for the journey.
//
// 108KB webm / 308KB mp4 (dark scenes compress absurdly well) + jpg poster.
// Reduced-motion renders the poster only. The <video> pauses while faded out
// so it costs nothing past the hero.

import { useEffect, useRef, useState } from "react";
import { cdn } from "@/lib/cdn";

export function VideoVoid() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Scroll crossfade: film owns the hero, hands off to the live scene.
  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap) return;
    let raf = 0;
    let ticking = false;
    let playing = true;
    const update = () => {
      ticking = false;
      const fade = Math.max(
        0,
        1 - window.scrollY / (window.innerHeight * 1.25),
      );
      wrap.style.opacity = fade.toFixed(3);
      // free the decoder when invisible
      if (video) {
        if (fade <= 0.01 && playing) {
          video.pause();
          playing = false;
        } else if (fade > 0.01 && !playing) {
          void video.play().catch(() => {});
          playing = true;
        }
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      // reduced-motion: a static poster ABSOLUTE over the hero only — it
      // scrolls away naturally instead of crossfading.
      className={
        reduced
          ? "pointer-events-none absolute inset-x-0 top-0 z-0 h-svh"
          : "pointer-events-none fixed inset-0 z-0"
      }
    >
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed backdrop
        <img
          src={cdn("/void-poster.jpg")}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={cdn("/void-poster.jpg")}
          className="h-full w-full object-cover"
        >
          <source src={cdn("/void-loop.webm")} type="video/webm" />
          <source src={cdn("/void-loop.mp4")} type="video/mp4" />
        </video>
      )}
      {/* gentle darkening veil so hero type always clears AAA contrast */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
