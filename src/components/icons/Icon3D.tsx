"use client";

// Icon3D — floating 3D icon accents for the "Aurora Glass v3" icon system.
// Renders the pre-rendered 3dicons PNGs from /public/icons/3d as purely
// decorative imagery (alt="" + aria-hidden) — meaning-matched accents only:
// rocket=launch/CTA, chart=metrics, trophy=awards, computer=LLMOps,
// mobile=products, chat-bubble=contact, clock=delivery speed, cube=brand,
// rupee=pricing, call-in/call-only=contact. Max 1–2 per section, NEVER
// bullet-decoration spam.
//
// float — the DRIFT/FLOAT motion verb: a gentle ±6px y-drift on a 4s
// ease-in-out loop, transform-only. The keyframe is injected once (deduped by
// a module guard, same pattern as LiquidGlass) and disabled entirely under
// prefers-reduced-motion.
// glow — a single cobalt drop-shadow so the icon reads lit by the void.

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

/** The 11 available 3dicons assets in /public/icons/3d (kebab-case names). */
export type Icon3DName =
  | "cube"
  | "rocket"
  | "chart"
  | "trophy"
  | "clock"
  | "computer"
  | "mobile"
  | "rupee"
  | "chat-bubble"
  | "call-in"
  | "call-only";

export interface Icon3DProps {
  name: Icon3DName;
  /** Square render size in px. Default 64. */
  size?: number;
  /** Gentle ±6px y-float, 4s ease-in-out infinite (off under reduced motion). */
  float?: boolean;
  /** Cobalt drop-shadow glow: 0 8px 24px rgba(27,79,255,.35). */
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Icon3D({
  name,
  size = 64,
  float = false,
  glow = false,
  className = "",
  style,
}: Icon3DProps) {
  const classes = [
    "i3d",
    float ? "i3d-float" : "",
    glow ? "i3d-glow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // Decorative: hidden from AT entirely; the float transform lives on the
    // wrapper so consumer positioning (className) never fights the animation.
    <span className={classes} style={style} aria-hidden="true">
      <Image
        src={`/icons/3d/${name}.png`}
        alt=""
        width={size}
        height={size}
        draggable={false}
      />
      <Icon3DStyles />
    </span>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
// Injected once (deduped by a module guard, like LiquidGlass) so the component
// is self-contained without touching globals.css.

let injected = false;
function Icon3DStyles() {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (injected) return;
    injected = true;
    setMount(true);
  }, []);
  if (!mount) return null;
  return <style data-icon-3d="">{ICON3D_CSS}</style>;
}

const ICON3D_CSS = `
.i3d{
  display:inline-block;
  line-height:0;
  user-select:none;
}
.i3d > img{ display:block; }

/* DRIFT/FLOAT — gentle ±6px y-drift, transform-only, GPU-clean. */
.i3d-float{
  animation:i3d-float 4s ease-in-out infinite;
  will-change:transform;
}
@keyframes i3d-float{
  0%, 100%{ transform:translateY(0); }
  25%{ transform:translateY(-6px); }
  75%{ transform:translateY(6px); }
}

/* Cobalt glow — the one permitted drop-shadow for these decorative accents. */
.i3d-glow{
  filter:drop-shadow(0 8px 24px rgba(27,79,255,.35));
}

/* REDUCED MOTION — icon holds still, glow stays. */
@media (prefers-reduced-motion: reduce){
  .i3d-float{ animation:none; will-change:auto; }
}
`;

export default Icon3D;
