"use client";

// Wraps a service visual and marks it live only while it is near the screen.
// /services carries a dozen animated diagrams (drifting light, pulses, SMIL
// dots); running all of them for the whole page made the GPU composite every
// one of them on every scroll frame. Off-screen frames pause (see globals.css,
// [data-live="false"]), so only the one or two in view ever animate.

import { useEffect, useRef, useState } from "react";

export function LiveFrame({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "150px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-live={live} className={className}>
      {children}
    </div>
  );
}
