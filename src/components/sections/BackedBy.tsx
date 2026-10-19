"use client";

// BackedBy — accreditation row reborn as a GLASS SLAB over the living void.
// Sits between Testimonial (PROOF) and Global (REACH) in the master scroll.
// The section no longer paints an opaque bg — the cobalt cube/void shows through
// a 12–24px gutter ringing a single Tier-2 panel. Each accreditation becomes its
// own Tier-4 chip glass pill (greyscale text that lifts to full contrast on
// hover). Desktop = a static wrapped row of pills inside the focal panel; mobile
// = a gentle marquee of the same glass pills. Entrance is the signature 3-beat
// <Reveal>; the headline cluster and the pill strip ride two depth planes.
// Aurora Glass v3: a trophy Icon3D (trophy = awards/accreditation) floats
// top-right of the panel — the section's single meaning-matched 3D accent.

import Image from "next/image";
import { motion } from "framer-motion";
import { ChapterLabel } from "@/components/shared/ChapterLabel";
import { Icon3D } from "@/components/icons/Icon3D";
import { LiquidGlass } from "@/components/glass/LiquidGlass";
import { Reveal } from "@/components/scroll/Reveal";
import { useDepthParallax } from "@/components/scroll/useDepthParallax";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

// Real partner / programme marks (from public/partners/, sourced from the old
// site repo). Shown as an animated logo marquee on the homepage. Each mark sits
// in a near-white chip so the (mostly dark-ink) logos read on BOTH black and
// white themes.
const LOGOS = [
  { src: "/partners/msft.png", name: "Microsoft for Startups" },
  { src: "/partners/google-devs.png", name: "Google for Startups" },
  { src: "/partners/aws.png", name: "Amazon Web Services" },
  { src: "/partners/mongo.png", name: "MongoDB" },
  { src: "/partners/neo4j.png", name: "Neo4j" },
  { src: "/partners/perplexity.png", name: "Perplexity" },
  { src: "/partners/atlassian.png", name: "Atlassian" },
  { src: "/partners/zoho.jpg", name: "Zoho" },
  { src: "/partners/digital-ocean.png", name: "DigitalOcean" },
  { src: "/partners/dpiit.png", name: "DPIIT · Startup India" },
  { src: "/partners/wadhwani.png", name: "Wadhwani Foundation" },
];

// Served through the image optimizer (resized to the 32px-tall chip). These
// went out `unoptimized`: several source PNGs are print-size (dpiit.png is
// 7876x2620, msft.png 4032x1701), so every first load pulled ~2.9 MB of logos
// at high priority — fighting the intro video and the hydration JS for
// bandwidth — and decoded >100 MB of bitmaps, a real problem on iPhones.
function LogoChip({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex h-[58px] w-[150px] shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/90 px-6 [html[data-theme=dark]_&]:border-white/10">
      <Image
        src={src}
        alt={name}
        width={120}
        height={36}
        loading="eager"
        className="h-8 w-auto max-w-full object-contain"
      />
    </div>
  );
}

export function BackedBy() {
  // Two layered elements drift on their own depth planes for antigravity feel:
  // the headline cluster slightly overtakes scroll (foreground, plane 3); the
  // pill strip rides the content baseline-plus (plane 2).
  const headTransform = useDepthParallax(3);
  const stripTransform = useDepthParallax(2);

  return (
    <section
      id="backed-by"
      className="relative z-10 px-[var(--pad-x)] py-[clamp(56px,8vh,112px)]"
    >
      {/* Void GUTTER: the panel never paints edge-to-edge — the cobalt light
          lives behind its rim. */}
      <div className="mx-auto w-full max-w-[var(--col-w)] px-[clamp(12px,1.6vw,24px)]">
        <Reveal direction="up">
          <LiquidGlass
            tier="panel"
            focal
            className="px-[clamp(20px,4vw,56px)] py-[clamp(40px,6vh,72px)]"
          >
            {/* Meaning-matched 3D accent (trophy = awards) — decorative only,
                hidden on small screens so the headline keeps its air. */}
            <Icon3D
              name="trophy"
              size={56}
              float
              glow
              className="absolute right-[clamp(20px,4vw,56px)] top-[clamp(40px,6vh,72px)] hidden md:inline-block"
            />

            <motion.div style={{ transform: headTransform }}>
              <ChapterLabel num="02b" word="TRUSTED INFRASTRUCTURE" />

              {/* Real semantic heading; spread copy preserved verbatim. */}
              <h2 className="font-display text-[length:var(--text-display-lg)] leading-[0.95] tracking-[-0.04em] text-balance text-(--color-fg) max-w-4xl">
                Built on the{" "}
                <em
                  className="font-serif not-italic italic"
                  style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
                >
                  shoulders
                </em>
                <br />
                of giants.
              </h2>

              <p className="mt-8 max-w-prose text-[clamp(15px,1.15vw,17px)] leading-relaxed text-(--color-fg-2)">
                The programmes, partners and stacks we ship on &mdash; earned, not bought.
              </p>
            </motion.div>

            {/* ── Logo marquee — real partner marks, scrolls on ALL screens
                 (so mobile/tablet show logos too, not just text). ─────────── */}
            <motion.div
              style={{ transform: stripTransform }}
              className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
            >
              <InfiniteSlider gap={18} duration={42} durationOnHover={120}>
                {LOGOS.map((logo) => (
                  <LogoChip key={logo.src} src={logo.src} name={logo.name} />
                ))}
              </InfiniteSlider>
            </motion.div>
          </LiquidGlass>
        </Reveal>
      </div>
    </section>
  );
}
