"use client";

// LiquidGlass — the single refractive Liquid-Glass primitive family for the
// "Cobalt Aperture — Liquid Glass over a Living Void" system. This ONE component
// REPLACES all drop-shadows as the sole elevation language. Every tier shares
// the two signatures so 12 sections read as one family:
//   1) a 1px inner TOP specular rim + 1px inner BOTTOM lens-edge
//   2) the cobalt edge-frame CORNER-MARK (two L-shaped 1px cobalt strokes in
//      opposite corners)
//
// REFRACTION LAW: glass is NEVER given an opaque fill or a colour of its own.
// Its visible tint is borrowed 100% from the cobalt cube + editorial type
// behind it via backdrop-filter over a translucent color-mix — so a card looks
// faintly blue near the cube and neutral far from it. Cobalt enters ONLY via the
// rim-light and the corner-mark accent.
//
// Tiers:
//   nav   — Tier 1 chrome: floating glass pill / rail (radius 18, pill optional)
//   panel — Tier 2 card:   pointer-tracked cobalt rim-light, light-fall-off,
//                          opt-in to THE ONE allowed focal shadow
//   lens  — Tier 3 wow:    pair with <GlassLensFilter/> for true refraction;
//                          exposes onViewChange so the consumer can IO-pause it
//   chip  — Tier 4 pill:   blur(12) pill, cobalt text/stroke
//
// Motion verb SWEEP: a single 120° specular highlight crosses the surface once
// on entrance and on hover, driven by an animated --sweep custom property on
// ::before — transform-only, GPU-clean. Reduced-motion keeps the glass and drops
// the sweep. The @supports not (backdrop-filter) fallback flattens to a flat
// color-mix + 1px hairline.

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { tick, click } from "@/lib/feedback";
import { detectTier } from "@/lib/perf";

export type GlassTier = "nav" | "panel" | "lens" | "chip";

type GlassCSS = CSSProperties & Record<`--${string}`, string | number>;

export interface LiquidGlassProps {
  tier?: GlassTier;
  /** Render as a different element (e.g. "nav", "button", "section"). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;

  /** Force pill geometry (chip is always pill). */
  pill?: boolean;
  /** Override the base radius (px). Ignored when pill. Default 18. */
  radius?: number;

  /**
   * PANEL only — opt this single focal panel into THE ONE real shadow allowed in
   * the whole system: 0 1px 40px rgba(0,0,40,.5). Never use on >1 panel/section.
   */
  focal?: boolean;
  /** PANEL only — disable the pointer-tracked cobalt rim-light spotlight. */
  rimLight?: boolean;

  /**
   * LENS only — the filter id from <GlassLensFilter/>. When present the glass
   * applies filter:url(#id) so the backdrop is truly refracted/chromatic.
   */
  lensFilterId?: string;
  /**
   * LENS only — fires with the on-screen state from an internal
   * IntersectionObserver so the consumer can pause the costly displacement map.
   */
  onViewChange?: (inView: boolean) => void;

  /** Disable the entrance + hover specular sweep (also auto-off for reduced motion). */
  sweep?: boolean;

  /** Forwarded to the host element (GlassButton composes the feedback bus here). */
  onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  onPointerEnter?: (e: ReactPointerEvent<HTMLElement>) => void;
}

const RADIUS_DEFAULT = 18;

// Per-tier backdrop-filter recipes. Base is always blur + saturate + brightness
// over a translucent color-mix — never an opaque fill.
const TIER_BACKDROP: Record<GlassTier, string> = {
  nav: "blur(20px) saturate(160%) brightness(1.06)",
  panel: "blur(28px) saturate(160%) brightness(1.06)",
  lens: "blur(20px) saturate(170%) brightness(1.08)",
  chip: "blur(12px) saturate(150%) brightness(1.05)",
};

export const LiquidGlass = forwardRef<HTMLElement, LiquidGlassProps>(
  function LiquidGlass(
    {
      tier = "panel",
      as,
      className = "",
      style,
      children,
      pill = false,
      radius = RADIUS_DEFAULT,
      focal = false,
      rimLight = true,
      lensFilterId,
      onViewChange,
      sweep = true,
      onClick,
      onPointerEnter,
    },
    forwardedRef
  ) {
    // Polymorphic host element. Cast through `any` so the dynamic tag accepts
    // our generic prop set without colliding with R3F's intrinsic JSX unions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Tag = (as ?? "div") as any;
    const innerRef = useRef<HTMLElement | null>(null);
    const [reduced, setReduced] = useState(false);

    // Respect prefers-reduced-motion — glass stays, sweep + spotlight tracking go.
    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = () => setReduced(mq.matches);
      update();
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }, []);

    // LENS — IntersectionObserver so the consumer can pause the displacement map.
    useEffect(() => {
      if (tier !== "lens" || !onViewChange) return;
      const el = innerRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => onViewChange(entry.isIntersecting),
        { rootMargin: "120px", threshold: 0.01 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, [tier, onViewChange]);

    // PANEL — pointer-tracked cobalt rim-light. Writes --mx/--my (0–100%) custom
    // props the CSS spotlight reads; transform/paint only, no layout.
    const isPanel = tier === "panel";
    const trackPointer = useCallback(
      (e: ReactPointerEvent<HTMLElement>) => {
        if (!isPanel || !rimLight || reduced) return;
        const el = innerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
        el.style.setProperty("--rim", "1");
      },
      [isPanel, rimLight, reduced]
    );
    const clearPointer = useCallback(() => {
      const el = innerRef.current;
      if (el) el.style.setProperty("--rim", "0");
    }, []);

    const effRadius = pill || tier === "chip" ? 999 : radius;

    const cssVars: GlassCSS = {
      "--glass-radius": `${effRadius}px`,
      "--glass-backdrop": TIER_BACKDROP[tier],
      "--mx": "50%",
      "--my": "50%",
      "--rim": "0",
      "--sweep": "-30%",
      ...(style as GlassCSS),
    };

    if (lensFilterId) {
      // Refract the backdrop through the displacement filter (Tier-3 only).
      cssVars["--glass-backdrop"] =
        `${TIER_BACKDROP.lens} url(#${lensFilterId})`;
    }

    const classes = [
      "lg-glass",
      `lg-${tier}`,
      focal && isPanel ? "lg-focal" : "",
      sweep && !reduced ? "lg-sweep" : "",
      reduced ? "lg-reduced" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const setRefs = (node: HTMLElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <Tag
        ref={setRefs}
        className={classes}
        style={cssVars}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerMove={isPanel ? trackPointer : undefined}
        onPointerLeave={isPanel ? clearPointer : undefined}
      >
        {/* Content sits ABOVE the glass treatment at full token contrast. */}
        <span className="lg-content">{children}</span>
        <GlassStyles />
      </Tag>
    );
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** A cobalt liquid-glass CTA pill (chip tier) with specular top sheen + press. */
export function GlassButton({
  children,
  className = "",
  onClick,
  onPointerEnter,
  ...props
}: Omit<LiquidGlassProps, "tier" | "pill"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Feedback bus — tick() on true mouse hover-in only (a touch tap must never
  // stack tick + click on one gesture), click() + haptic on press. Consumer
  // handlers are composed in, never replaced.
  const handleEnter = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") tick();
    onPointerEnter?.(e as ReactPointerEvent<HTMLButtonElement>);
  };
  const handleClick = (e: ReactMouseEvent<HTMLElement>) => {
    click();
    onClick?.(e as ReactMouseEvent<HTMLButtonElement>);
  };
  return (
    <LiquidGlass
      tier="chip"
      pill
      as="button"
      className={`lg-cta ${className}`}
      onClick={handleClick}
      onPointerEnter={handleEnter}
      {...(props as LiquidGlassProps)}
    >
      {children}
    </LiquidGlass>
  );
}

/** A mono tag / status pill (chip tier). */
export function GlassChip({
  children,
  className = "",
  ...props
}: Omit<LiquidGlassProps, "tier">) {
  return (
    <LiquidGlass tier="chip" pill className={`lg-chip-pill ${className}`} {...props}>
      {children}
    </LiquidGlass>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
// Injected once (deduped by a data-attr guard) so the family is self-contained
// without touching globals.css. All depth = blur + specular rim + corner-mark;
// the only shadow is the opt-in .lg-focal box.

let injected = false;
function GlassStyles() {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (injected) return;
    injected = true;
    // Flags low-tier devices for the GLASS-LITE recipe in GLASS_CSS.
    if (detectTier() === "low") document.documentElement.dataset.glass = "lite";
    setMount(true);
  }, []);
  if (!mount) return null;
  return <style data-liquid-glass="">{GLASS_CSS}</style>;
}

const GLASS_CSS = `
.lg-glass{
  position:relative;
  isolation:isolate;
  border-radius:var(--glass-radius);
  /* Tint is BORROWED from content behind — never an opaque fill. */
  background:color-mix(in oklab, var(--color-bg-soft) 58%, transparent);
  -webkit-backdrop-filter:var(--glass-backdrop);
  backdrop-filter:var(--glass-backdrop);
  /* The two family signatures live in this single inset box-shadow:
     1px inner TOP specular rim + 1px inner BOTTOM lens-edge + the hairline. */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 -1px 0 rgba(0,0,0,.4),
    inset 0 0 0 1px var(--color-line);
  color:var(--color-fg);
}
.lg-content{ position:relative; z-index:2; display:contents; }

/* ── Cobalt edge-frame CORNER-MARK ────────────────────────────────────────
   Two L-shaped 1px cobalt strokes in opposite corners, drawn with two layered
   conic/linear gradient masks. Present on EVERY instance. */
.lg-glass::after{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:3;
  --cm-len:18px;
  --cm-col:color-mix(in oklab, var(--color-accent) 80%, transparent);
  background:
    /* top-left: horizontal + vertical arm */
    linear-gradient(90deg, var(--cm-col) 0 var(--cm-len), transparent var(--cm-len)) top left / 100% 1px no-repeat,
    linear-gradient(180deg, var(--cm-col) 0 var(--cm-len), transparent var(--cm-len)) top left / 1px 100% no-repeat,
    /* bottom-right: horizontal + vertical arm */
    linear-gradient(270deg, var(--cm-col) 0 var(--cm-len), transparent var(--cm-len)) bottom right / 100% 1px no-repeat,
    linear-gradient(0deg, var(--cm-col) 0 var(--cm-len), transparent var(--cm-len)) bottom right / 1px 100% no-repeat;
  opacity:.85;
  transition:opacity .4s var(--ease-smooth);
}

/* ── SWEEP — one 120deg specular highlight, transform-only via --sweep ──── */
.lg-glass::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:1;
  overflow:hidden;
  background:linear-gradient(
    120deg,
    transparent 38%,
    rgba(255,255,255,.10) 48%,
    rgba(255,255,255,.18) 50%,
    rgba(255,255,255,.10) 52%,
    transparent 62%
  );
  background-size:300% 100%;
  background-position:var(--sweep) 0;
  opacity:0;
  will-change:background-position,opacity;
}
.lg-sweep::before{ animation:lg-sweep-in .9s var(--ease-out-expo) .05s 1 both; }
.lg-sweep:hover::before{ animation:lg-sweep-in .9s var(--ease-out-expo) 1 both; }
@keyframes lg-sweep-in{
  0%{ background-position:-30% 0; opacity:0; }
  12%{ opacity:1; }
  100%{ background-position:130% 0; opacity:0; }
}

/* ── TIER 2 PANEL — light-fall-off + pointer-tracked cobalt rim-light ──── */
.lg-panel{
  /* top→bottom white .06→.02 light fall-off, layered over the borrowed tint. */
  background:
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)),
    color-mix(in oklab, var(--color-bg-soft) 58%, transparent);
}
.lg-panel .lg-spot{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:0;
}
.lg-panel::before{ z-index:1; }
/* cobalt spotlight intensifying toward the cursor (--mx/--my, gated by --rim) */
.lg-panel{
  --rim:0;
}
.lg-panel > .lg-content{ z-index:2; }
.lg-panel{
  background-image:none;
}
.lg-panel{
  /* spotlight painted as an extra radial layer on the element background */
  background:
    radial-gradient(160px 160px at var(--mx) var(--my),
      color-mix(in oklab, var(--color-accent-2) calc(16% * var(--rim)), transparent),
      transparent 70%),
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)),
    color-mix(in oklab, var(--color-bg-soft) 58%, transparent);
  transition:box-shadow .4s var(--ease-smooth);
}
/* rim brightens toward cursor via an extra inset cobalt ring */
.lg-panel:hover{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -1px 0 rgba(0,0,0,.4),
    inset 0 0 0 1px color-mix(in oklab, var(--color-accent) 18%, var(--color-line));
}
.lg-panel:hover::after{ opacity:1; }

/* THE ONE allowed real shadow — single focal panel per section. */
.lg-focal{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -1px 0 rgba(0,0,0,.4),
    inset 0 0 0 1px var(--color-line),
    0 1px 40px rgba(0,0,40,.5);
}

/* ── TIER 4 CHIP / CTA ─────────────────────────────────────────────────── */
.lg-chip{
  color:var(--color-accent-2);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 -1px 0 rgba(0,0,0,.35),
    inset 0 0 0 1px color-mix(in oklab, var(--color-accent) 24%, var(--color-line));
}
.lg-cta{
  cursor:pointer;
  color:#fff;
  border:0;
  background:
    linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 42%),
    color-mix(in oklab, var(--color-accent) 88%, transparent);
  transition:transform .12s var(--ease-spring), backdrop-filter .12s linear, box-shadow .2s var(--ease-smooth);
}
.lg-cta:active{
  transform:scale(.95);
  -webkit-backdrop-filter:blur(16px) saturate(150%);
  backdrop-filter:blur(16px) saturate(150%);
}
.lg-glass:active{ transform:scale(.95); }

/* ── TIER 3 LENS ───────────────────────────────────────────────────────── */
.lg-lens{
  background:color-mix(in oklab, var(--color-bg-soft) 52%, transparent);
}

/* ── REDUCED MOTION — keep the glass, kill the sweep + spotlight motion ── */
.lg-reduced::before{ animation:none !important; opacity:0 !important; }
@media (prefers-reduced-motion: reduce){
  .lg-glass::before{ animation:none !important; opacity:0 !important; }
  .lg-glass,.lg-cta{ transition:none; }
}

/* ── GLASS-LITE — low tier (phones, tablets, few-core laptops) ──────────────
   ~50 glass surfaces on the homepage each re-blur their backdrop on every
   scroll frame, many over the animated dot canvas — GPU work weak GPUs pay
   for in dropped frames. One small blur, no saturate/brightness passes, and no
   SVG displacement on the lens. Beats every per-tier/per-instance recipe. */
:root[data-glass="lite"] .lg-glass{
  -webkit-backdrop-filter:blur(12px);
  backdrop-filter:blur(12px);
}

/* ── FALLBACK — no backdrop-filter / low-DPR: flat color-mix + 1px hairline ── */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){
  .lg-glass{
    background:color-mix(in oklab, var(--color-bg-soft) 92%, transparent) !important;
    -webkit-backdrop-filter:none !important;
    backdrop-filter:none !important;
    box-shadow:inset 0 0 0 1px var(--color-line) !important;
  }
  .lg-glass::before{ display:none; }
  .lg-cta{ background:var(--color-accent) !important; }
}
`;

export default LiquidGlass;
