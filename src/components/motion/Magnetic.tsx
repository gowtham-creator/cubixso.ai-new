"use client";

// Magnetic — wraps a child and pulls it gently toward the cursor while
// hovered. Smoothed via Framer Motion springs so the motion feels weighty
// rather than jittery.

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // 0..1, default 0.35
  damping?: number;
  stiffness?: number;
}

export function Magnetic({
  children,
  className = "",
  strength = 0.35,
  damping = 18,
  stiffness = 220,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { damping, stiffness });
  const ySpring = useSpring(y, { damping, stiffness });

  // Mouse only. On touch, a tap fires one synthetic move and no leave, which
  // left the button pulled off-centre until the next tap elsewhere.
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
      style={{ x: xSpring, y: ySpring, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
