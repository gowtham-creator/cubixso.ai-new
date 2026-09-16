"use client";

// LeadershipGrid — the client half of /leadership: grouped portrait grid
// (Executive / Engineering / Advisors) + the BioPanel dialog state. Apple's
// leadership-grid restraint, our glass materials and reveal choreography.

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/scroll/Reveal";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { PortraitCard } from "@/components/team/PortraitCard";
import { BioPanel } from "@/components/team/BioPanel";
import { click } from "@/lib/feedback";
import { TEAM, TEAM_GROUPS, type TeamMember } from "@/lib/team";

// "Our people come from companies like…" — the studio's pedigree strip. Marks
// are wrapped in a near-white chip in BOTH themes so dark logos read on black
// AND white. (Inline twin of the proven About-page LogoChip; we don't import a
// private helper across pages.)
const PEDIGREE_LOGOS = [
  { src: "/partners/google-devs.png", alt: "Google Developers" },
  { src: "/partners/msft.png", alt: "Microsoft" },
  { src: "/partners/aws.png", alt: "AWS" },
  { src: "/partners/atlassian.png", alt: "Atlassian" },
  { src: "/partners/mongo.png", alt: "MongoDB" },
  { src: "/partners/perplexity.png", alt: "Perplexity" },
  { src: "/partners/zoho.jpg", alt: "Zoho" },
  { src: "/partners/wadhwani.png", alt: "Wadhwani Foundation" },
  { src: "/partners/dpiit.png", alt: "DPIIT" },
];

function LogoChip({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      className={[
        "pointer-events-none flex h-14 w-[clamp(112px,11vw,160px)] shrink-0 items-center justify-center",
        "rounded-2xl border border-(--color-line) px-6",
        // Near-white chip in BOTH themes so black-ink marks stay visible.
        "bg-white/90 [html[data-theme=dark]_&]:border-white/10",
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        src={src}
        loading="eager"
        decoding="async"
        className="max-h-6 w-auto max-w-full select-none object-contain"
      />
    </span>
  );
}

// Live member counter — a rAF count-up to TEAM.length on first view. Silent-House
// device: "07 — people building Cubixso", number derived from the team array.
function MemberCounter() {
  const total = TEAM.length;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const [n, setN] = useState(reduced ? total : 0);

  // Own a raw IntersectionObserver — framer's useInView is documented in this
  // codebase to never fire (see Reveal.tsx), which would freeze the counter at
  // 0. Count up ONCE as the element enters, via a rAF ease-out to TEAM.length.
  useEffect(() => {
    if (reduced) {
      setN(total);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const run = () => {
      const start = performance.now();
      const dur = 900;
      const tick = (t: number) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setN(Math.round(eased * total));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px 22% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, total]);

  return (
    <motion.p
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      // items-center, not items-baseline: baseline alignment dropped the small
      // copy onto the 76px numeral's baseline, so it hung off the bottom-right
      // of the digits instead of sitting beside them.
      className="flex items-center gap-4 text-(--color-fg)"
    >
      <span
        className="font-display tabular-nums text-[clamp(40px,6vw,76px)] leading-none tracking-[-0.04em] text-(--color-cobalt-glow)"
        aria-hidden
      >
        {String(n).padStart(2, "0")}
      </span>
      <span className="max-w-[26ch] text-[clamp(13px,1.1vw,16px)] leading-snug text-(--color-fg-2)">
        The Board and Leadership behind the massive team building Cubixso.
      </span>
      <span className="sr-only">
        {total} people on the board and leadership team building Cubixso.
      </span>
    </motion.p>
  );
}

export function LeadershipGrid() {
  const [openMember, setOpenMember] = useState<TeamMember | null>(null);

  const open = (m: TeamMember) => {
    click();
    setOpenMember(m);
  };

  return (
    <div className="relative z-10 px-[var(--pad-x)] pb-[clamp(80px,12vh,160px)]">
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        {/* Live member counter — Silent-House count-up, number from TEAM.length */}
        <Reveal>
          <MemberCounter />
        </Reveal>

        {TEAM_GROUPS.map((group, gi) => {
          const members = TEAM.filter((m) => m.group === group);
          if (members.length === 0) return null;
          return (
            <section key={group} aria-label={group} className="mt-[clamp(48px,7vh,96px)] first:mt-0">
              {/* group label in the homepage's [ NN ] mono convention */}
              <Reveal>
                <p className="mono text-[11px] uppercase tracking-[0.22em] text-(--color-fg-2)">
                  {String(gi + 1).padStart(2, "0")}{" "}
                  <span className="text-(--color-cobalt-glow)">[ {group} ]</span>
                </p>
                <div className="mt-4 h-px w-full bg-(--color-line)" aria-hidden />
              </Reveal>

              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 md:gap-x-7 xl:grid-cols-4">
                {members.map((m, i) => (
                  <Reveal key={m.slug} delay={Math.min(i * 0.07, 0.35)}>
                    <PortraitCard member={m} onOpen={open} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}

        {/* "from companies like…" — the studio's pedigree, as a logo marquee */}
        <section
          aria-label="Companies our people come from"
          className="mt-[clamp(56px,9vh,120px)]"
        >
          <Reveal>
            <p className="mono text-[11px] uppercase tracking-[0.22em] text-(--color-fg-2)">
              Our people come from companies like
            </p>
            <div className="mt-4 h-px w-full bg-(--color-line)" aria-hidden />
          </Reveal>
          <Reveal>
            <div className="mt-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <InfiniteSlider gap={28} duration={36} durationOnHover={90}>
                {PEDIGREE_LOGOS.map((logo) => (
                  <LogoChip key={logo.alt} src={logo.src} alt={logo.alt} />
                ))}
              </InfiniteSlider>
            </div>
          </Reveal>
        </section>
      </div>

      <BioPanel member={openMember} onClose={() => setOpenMember(null)} />
    </div>
  );
}
