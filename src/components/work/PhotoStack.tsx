"use client";

// PhotoStack — TACTILE GALLERY (Aurora Glass v3 §4, ja.mt photo physics).
//
// A pile of 2–4 polaroid-style cards (rounded-lg, 1px white/10 border, deep
// white matte at the bottom edge) holding gradient "photo" placeholders. The
// stack answers the pointer like a held hand of photographs:
//
//   REST    — overlapping, casually rotated (−6°…6°), reading as one pile.
//   FAN     — hover (fine pointers) fans the cards along an arc on the locked
//             ja.mt spring (stiffness 380 / damping 22) + tick().
//   SHUFFLE — click scatters the pile, then tucks the top card to the bottom
//             of the z-order + click().
//   TOUCH   — first tap fans, second tap fires the optional onOpen() (or
//             shuffles when none is wired). click() haptics answer every tap.
//
// `fanned` may be CONTROLLED (Work keys it to the tile's --lit focus) —
// internal hover still merges in so the stack stays tactile on its own.
//
// Motion is strictly transform/opacity (GPU); centering uses negative margins
// so framer owns the transform channel outright. Reduced-motion collapses
// every pose to a simple opacity/scale change over the static rest layout.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useFeedback } from "@/lib/feedback";

type StackCSS = CSSProperties & Record<`--${string}`, string | number>;

export interface PhotoStackCard {
  /** Tiny mono caption typeset on the polaroid matte. */
  label?: string;
  /** CSS color the photo gradient leans toward — pass tokens, never raw hex. */
  tint?: string;
  /** Optional custom visual replacing the gradient placeholder. */
  visual?: ReactNode;
}

export interface PhotoStackProps {
  /** 2–4 cards, bottom of the pile first (the LAST card rests on top). */
  cards: readonly PhotoStackCard[];
  /** Controlled fan state (e.g. Work keys it to the tile's --lit). */
  fanned?: boolean;
  /** Touch second-tap / keyboard Enter target — fires instead of a shuffle. */
  onOpen?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the stack's interactive surface. */
  ariaLabel?: string;
}

// The locked ja.mt spring — every pose change rides this.
const SPRING = { type: "spring", stiffness: 380, damping: 22 } as const;

// Rest rotations per depth slot (bottom → top), all within the −6°…6° brief.
const REST_ROT = [-6, 5, -3, 4];

// Deterministic 0–1 "random" so scatter poses replay identically per seed —
// no Math.random in render (SSR-safe, StrictMode-safe).
function rand(i: number, seed: number, salt: number): number {
  const v = Math.sin((i + 1) * 127.1 + seed * 311.7 + salt * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

export function PhotoStack({
  cards,
  fanned,
  onOpen,
  className = "",
  style,
  ariaLabel = "Photo stack",
}: PhotoStackProps) {
  const { tick, click } = useFeedback();
  const reduced = useReducedMotion();
  const n = cards.length;

  // z-order of the pile — order[d] is the card index at depth d (last = top).
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: n }, (_, i) => i),
  );
  const [hovered, setHovered] = useState(false);
  const [scattering, setScattering] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const seedRef = useRef(0); // bumps per shuffle so each scatter flies anew
  const timerRef = useRef<number | null>(null);

  // Re-seat the z-order if the consumer swaps the card count.
  useEffect(() => {
    setOrder((o) =>
      o.length === n ? o : Array.from({ length: n }, (_, i) => i),
    );
  }, [n]);

  // Coarse-pointer detection — touch gets the tap choreography, not hover.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const isFanned = Boolean(fanned) || hovered;

  // SHUFFLE — scatter the pile, then tuck the top card to the bottom.
  const shuffle = useCallback(() => {
    click();
    if (reduced) {
      // Reduced motion: no scatter flight — the z-order swap alone reads.
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
      return;
    }
    seedRef.current += 1;
    setScattering(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
      setScattering(false);
      timerRef.current = null;
    }, 240);
  }, [click, reduced]);

  const open = useCallback(() => {
    click();
    onOpen?.();
  }, [click, onOpen]);

  const handleClick = () => {
    if (coarse && !isFanned) {
      // Touch beat 1 — fan the hand of photos (haptic answers the tap).
      setHovered(true);
      click();
      return;
    }
    if (coarse && onOpen) {
      open(); // touch beat 2 — navigate
      return;
    }
    shuffle(); // desktop click (and fanned touch without a target)
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (onOpen) open();
    else shuffle();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`ps-stack ${className}`}
      style={style}
      onMouseEnter={() => {
        if (coarse) return;
        if (!isFanned) tick(); // blip only when this hover actually fans
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      {cards.map((card, i) => {
        const depth = order.indexOf(i);
        const t = n > 1 ? depth / (n - 1) - 0.5 : 0; // −0.5…0.5 across the pile

        // REST — casual overlap. FAN — arc spread (rotate follows x, edges
        // dip like a held fan). SCATTER — seeded fling, replayable per seed.
        const rest = {
          x: `${t * 10}%`,
          y: `${depth * -3}%`,
          rotate: REST_ROT[depth % REST_ROT.length],
          scale: 1,
        };
        const fan = {
          x: `${t * 150}%`,
          y: `${Math.abs(t) * 26 - 6}%`,
          rotate: t * 44,
          scale: 1.02,
        };
        const scatter = {
          x: `${(rand(i, seedRef.current, 0) - 0.5) * 130}%`,
          y: `${(rand(i, seedRef.current, 1) - 0.5) * 80}%`,
          rotate: (rand(i, seedRef.current, 2) - 0.5) * 36,
          scale: 0.96,
        };

        // Reduced motion: opacity/scale only, over the static rest layout.
        const pose = reduced
          ? { ...rest, scale: isFanned ? 1.04 : 1 }
          : scattering
            ? scatter
            : isFanned
              ? fan
              : rest;

        const cardStyle = {
          zIndex: depth + 1,
          ...(card.tint ? { "--ps-tint": card.tint } : null),
        } as StackCSS;

        return (
          <motion.figure
            key={i}
            aria-hidden
            className="ps-card"
            style={cardStyle}
            initial={false}
            animate={pose}
            transition={reduced ? { duration: 0.2, ease: "linear" } : SPRING}
          >
            <span className="ps-photo">{card.visual}</span>
            {card.label && (
              <figcaption className="ps-label mono">{card.label}</figcaption>
            )}
          </motion.figure>
        );
      })}
      <PhotoStackStyles />
    </div>
  );
}

// ── Scoped styles ────────────────────────────────────────────────────────────
// Injected once (deduped, LiquidGlass pattern) so the polaroid material lives
// alongside this component without touching globals.css. The "photo" is a
// token-only gradient placeholder keyed by --ps-tint — never raw hex.

let injected = false;
function PhotoStackStyles() {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (injected) return;
    injected = true;
    setMount(true);
  }, []);
  if (!mount) return null;
  return <style data-photo-stack="">{STACK_CSS}</style>;
}

const STACK_CSS = `
.ps-stack{
  position:relative;
  display:block;
  aspect-ratio:1/1;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
}
.ps-stack:focus-visible{
  outline:2px solid var(--color-accent-2);
  outline-offset:4px;
  border-radius:8px;
}

/* Polaroid card — rounded-lg, 1px white/10 border, white-frosted matte with a
   deep bottom lip. Centered via negative margins (NOT transform) so framer
   owns the transform channel for fan/scatter poses. */
.ps-card{
  position:absolute;
  left:50%;
  top:50%;
  width:84%;
  aspect-ratio:4/5;
  margin:-52.5% 0 0 -42%;
  padding:5% 5% 19%;
  border-radius:8px;
  border:1px solid rgba(255,255,255,.10);
  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.06));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 -1px 0 rgba(0,0,0,.35);
  will-change:transform;
}

/* The "photo" — a cobalt-family gradient placeholder over the void base, with
   a faint top-left highlight so it reads as glossy print, not glass fill. */
.ps-photo{
  display:block;
  height:100%;
  border-radius:5px;
  overflow:hidden;
  background:
    radial-gradient(120% 90% at 22% 10%, rgba(255,255,255,.16), transparent 55%),
    linear-gradient(155deg,
      color-mix(in oklab, var(--ps-tint, var(--color-accent)) 58%, var(--color-bg)),
      color-mix(in oklab, var(--ps-tint, var(--color-accent)) 16%, var(--color-bg)) 62%,
      var(--color-bg));
}

/* Matte caption — tiny mono, single line, lives on the bottom lip. */
.ps-label{
  position:absolute;
  left:7%;
  right:7%;
  bottom:5.5%;
  margin:0;
  font-size:9px;
  letter-spacing:.14em;
  color:var(--color-muted);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

@media (prefers-reduced-motion: reduce){
  .ps-card{ will-change:auto; }
}
`;

export default PhotoStack;
