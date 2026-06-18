"use client";

// TiltCard — 3D tilt showcase cards for the Case Studies proof grid
// (Aurora Glass v3 §5, 3d-showcase.learnframer.site reference).
//
// useTilt() drives pointer-tracked rotateX/rotateY (≤8°) on framer springs
// that relax back to flat on leave. Fine pointers only — touch gets no tilt,
// just the press scale (tap-safe), and prefers-reduced-motion disables the
// tilt entirely (the card simply sits flat).
//
// The glare is NOT reimplemented: the card body is a Tier-2 LiquidGlass
// panel, so the existing --sweep specular pass replays on hover and the
// pointer rim-light (--mx/--my) supplies the moving glare — one glass family,
// no second highlight system. Press scale likewise comes from the LiquidGlass
// :active law (scale .95), so no competing transform is added here.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { easeOutExpo } from "@/components/scroll/Reveal";

const TILT_MAX_DEG = 8;
// Soft return spring — slower than the PhotoStack fling; this is a lean, not a flick.
const TILT_SPRING = { stiffness: 260, damping: 20 };

/**
 * useTilt — pointer-driven 3D tilt for showcase cards.
 * Returns spring MotionValues for rotateX/rotateY plus the handlers/ref to
 * spread onto a motion element. `enabled` is false on coarse pointers and
 * under reduced motion (handlers become no-ops; the values hold 0).
 */
export function useTilt(maxDeg: number = TILT_MAX_DEG) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [fine, setFine] = useState(false);

  // Tilt is a fine-pointer luxury — touch keeps only the press scale.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enabled = fine && !reduced;

  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Pointer offset from center, −0.5…0.5, mapped to ±maxDeg.
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rotateX.set(-py * 2 * maxDeg);
      rotateY.set(px * 2 * maxDeg);
    },
    [enabled, maxDeg, rotateX, rotateY],
  );

  // Spring return to flat.
  const onPointerLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, rotateX, rotateY, onPointerMove, onPointerLeave, enabled };
}

interface TiltCaseStudyCardProps {
  code: string;
  name: string;
  sector: string;
  summary: string;
  result: string;
  index?: number;
}

export function TiltCaseStudyCard({
  code,
  name,
  sector,
  summary,
  result,
  index = 0,
}: TiltCaseStudyCardProps) {
  const tilt = useTilt();
  const reduced = useReducedMotion();

  return (
    // Entrance reveal (kept from the flat card) + the perspective stage the
    // tilt rotates inside. Reduced motion: a plain 200ms opacity fade.
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
      whileInView={
        reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduced
          ? { duration: 0.2, ease: "linear" }
          : { duration: 0.8, delay: 0.1 + index * 0.06, ease: easeOutExpo }
      }
      className="h-full"
      style={{ perspective: 900 }}
    >
      <motion.article
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        className="h-full"
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <LiquidGlass tier="panel" className="group flex h-full flex-col p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="mono text-[12px] tracking-[0.16em] text-(--color-muted-2)">
              {code}
            </span>
            <span className="mono text-[11px] tracking-[0.18em] text-(--color-muted)">
              {sector}
            </span>
          </div>

          <h3 className="mt-5 font-display text-[clamp(20px,1.6vw,26px)] font-medium tracking-tight text-(--color-fg)">
            {name}
          </h3>

          <p className="mt-3 text-[14.5px] leading-relaxed text-(--color-fg-2) group-hover:text-(--color-fg-elev) transition-colors">
            {summary}
          </p>

          <div className="mt-auto pt-6">
            <div className="h-px w-full bg-(--color-line) group-hover:bg-(--color-line-2) transition-colors" />
            <p className="mt-4 font-display text-[clamp(17px,1.3vw,21px)] font-medium tracking-tight text-(--color-accent-2)">
              {result}
            </p>
          </div>
        </LiquidGlass>
      </motion.article>
    </motion.div>
  );
}

export default TiltCaseStudyCard;
