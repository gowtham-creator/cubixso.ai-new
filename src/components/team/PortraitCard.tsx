"use client";

// PortraitCard — one tile of the /leadership grid. Apple-leadership DNA
// (portrait, name-as-link, quiet role line) translated to the Cobalt Aperture
// material system: the portrait sits in a LiquidGlass tile; real photos rest
// in a duotone-cobalt treatment and bloom to full colour on hover; open roles
// render an initials-avatar over a deep-blue→cobalt radial wash so the slot
// reads as intentional, not empty.

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { tick } from "@/lib/feedback";
import type { TeamMember } from "@/lib/team";

const hoverTick = (e: React.PointerEvent) => {
  if (e.pointerType === "mouse") tick();
};

export function PortraitCard({
  member,
  onOpen,
}: {
  member: TeamMember;
  onOpen: (m: TeamMember) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(member)}
      onPointerEnter={hoverTick}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-powder) rounded-2xl"
      aria-label={`${member.name} — ${member.role}. Read bio.`}
    >
      <LiquidGlass tier="panel" radius={20} className="overflow-hidden p-0">
        {/* Portrait area — 4:5, Apple's proportion */}
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {member.photo ? (
            <>
              <Image
                src={member.photo}
                alt=""
                fill
                sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw"
                className="object-cover transition-[filter,transform] duration-500 ease-out grayscale group-hover:grayscale-0 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:grayscale-0"
              />
              {/* duotone-cobalt rest state, lifts on hover */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(165deg,rgba(24,35,80,0.55),rgba(27,79,255,0.22))] mix-blend-color transition-opacity duration-500 group-hover:opacity-0 motion-reduce:opacity-0"
              />
            </>
          ) : (
            /* Initials avatar — open-role slots */
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgba(27,79,255,0.34),rgba(24,35,80,0.85)_62%,rgba(5,5,7,0.95))]">
              <span
                aria-hidden
                className="font-serif italic text-[clamp(48px,5vw,76px)] leading-none text-(--color-powder)/85 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              >
                {member.initials}
              </span>
              {member.open && (
                <span className="absolute bottom-3 right-3 mono text-[9px] uppercase tracking-[0.18em] text-white/45">
                  Open role
                </span>
              )}
            </div>
          )}
        </div>
      </LiquidGlass>

      {/* Name as link-styled line + quiet serif role — Apple's text stack */}
      <p className="mt-4 text-[15px] font-medium leading-tight text-(--color-powder) transition-colors group-hover:text-white">
        {member.name}
      </p>
      <p className="mt-1 font-serif italic text-[13.5px] leading-snug text-(--color-fg-2)">
        {member.role}
      </p>
    </motion.button>
  );
}
