"use client";

// AudioToggle — bottom-right toggle pill that controls a single ambient drone
// loop. Off by default per locked decision. Uses native HTMLAudioElement (not
// PositionalAudio) because there's no scene-distance cue we want to reflect;
// the drone is pure atmosphere.
//
// Wiring:
//   - User clicks → first interaction unlocks audio (some browsers block
//     autoplay until a gesture). We load the loop lazily on first toggle-on
//     and keep it warm thereafter.
//   - The loop file is /audio/ambient-drone.mp3. If the file is missing
//     (which it is during this scaffold), the toggle still renders + cycles
//     state; the play() call simply rejects and we silently fall back.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const LOOP_URL = "/audio/ambient-drone.mp3";
const TARGET_VOLUME = 0.18; // ≈ -15 dB equivalent

export function AudioToggle() {
  const [on, setOn] = useState(false);
  const [available, setAvailable] = useState(false); // becomes true after first successful play
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hide entirely on touch devices — sound on mobile is intrusive
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: fine)").matches) setShow(true);
  }, []);

  // Lazily create the audio element + handle play/pause
  useEffect(() => {
    if (!on) {
      audioRef.current?.pause();
      return;
    }
    if (!audioRef.current) {
      const a = new Audio(LOOP_URL);
      a.loop = true;
      a.volume = 0;
      audioRef.current = a;
    }
    const a = audioRef.current;
    a.play()
      .then(() => {
        setAvailable(true);
        // Fade in to target
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 800);
          a.volume = t * TARGET_VOLUME;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      })
      .catch(() => {
        // 404 or autoplay block — keep UI state but silently fail
        setAvailable(false);
      });

    return () => {
      // Fade-out before pause to avoid click pop
      if (!audioRef.current) return;
      const a2 = audioRef.current;
      const startV = a2.volume;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 400);
        a2.volume = startV * (1 - t);
        if (t < 1) requestAnimationFrame(tick);
        else a2.pause();
      };
      requestAnimationFrame(tick);
    };
  }, [on]);

  if (!show) return null;

  return (
    <motion.button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-label={on ? "Mute ambient drone" : "Play ambient drone"}
      aria-pressed={on}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      data-cursor="cta"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 rounded-full border border-(--color-line-2) bg-(--color-bg)/60 backdrop-blur-md px-3.5 py-2 mono text-[10.5px] text-(--color-fg-2) hover:text-(--color-fg) hover:border-(--color-fg) transition-colors"
    >
      {/* Animated bars — three rectangles that pulse when sound is on */}
      <span className="inline-flex items-end gap-[2px] w-[14px] h-[12px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-[3px] rounded-sm bg-current"
            animate={on
              ? { scaleY: [0.35, 1, 0.55, 0.85, 0.4], originY: 1 }
              : { scaleY: 0.35 }
            }
            transition={on
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
              : { duration: 0.3 }
            }
            style={{ height: "100%" }}
          />
        ))}
      </span>
      <span>{on ? "SOUND ON" : "SOUND OFF"}</span>
      {on && !available && (
        <span className="text-(--color-muted-2)">· LOADING</span>
      )}
    </motion.button>
  );
}
