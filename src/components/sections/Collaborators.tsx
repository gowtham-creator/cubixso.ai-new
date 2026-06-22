"use client";

// Collaborators — premium animated logo scrollers. Real partner marks from
// public/partners/ ride smooth infinite marquee rows (Platform Partners run as
// two opposing rows; Accelerators + Recognition each get a single row). Every
// logo sits in a near-white rounded chip so dark marks read on BOTH black and
// white themes. ProgressiveBlur softens the row edges. Mono category labels +
// a Reveal stagger keep the existing editorial tone.

import Image from "next/image";
import { motion } from "framer-motion";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

type Logo = { src: string; name: string };

// Real assets in public/partners/, grouped to mirror the company deck's
// "Our Collaborators and Supporters" slides exactly.

// Our Collaborators — companies we build alongside (deck p11).
const COLLABORATORS: Logo[] = [
  { src: "/partners/cloudgap.png", name: "Cloudgap" },
  { src: "/partners/elit-celer.png", name: "ElitCeler Technologies" },
  { src: "/partners/tetra-digital.png", name: "The Tetra Digital" },
  { src: "/partners/pursuit-soln.png", name: "Pursuit Solutions" },
  { src: "/partners/tech-savant.png", name: "Tech Savants" },
  { src: "/partners/winningedge.png", name: "WinningEdge Solutions" },
  { src: "/partners/nextbridge.png", name: "NextBridge Solutions" },
  { src: "/partners/ect-logo.png", name: "ElevateCode Technologies" },
  { src: "/partners/bolt-abacus-black.png", name: "Bolt Abacus" },
  { src: "/partners/krower.png", name: "Krower" },
];

// Our Supporters — the programmes, clouds, AI/CRM stacks and incubation we
// run on (deck p10, "15+ Supporters").
const SUPPORTERS: Logo[] = [
  { src: "/partners/wadhwani.png", name: "Wadhwani Foundation" },
  { src: "/partners/notion-startups.png", name: "Notion for Startups" },
  { src: "/partners/mongo.png", name: "MongoDB Startup Accelerator" },
  { src: "/partners/msft.png", name: "Microsoft for Startups" },
  { src: "/partners/atlassian.png", name: "Atlassian" },
  { src: "/partners/aws.png", name: "AWS Startups" },
  { src: "/partners/digital-ocean.png", name: "DigitalOcean" },
  { src: "/partners/zoho.jpg", name: "Zoho for Startups" },
  { src: "/partners/google-devs.png", name: "Google for Startups" },
  { src: "/partners/neo4j.png", name: "Neo4j" },
  { src: "/partners/perplexity.png", name: "Perplexity" },
  { src: "/partners/PayU-ogo.png", name: "PayU" },
];

const RECOGNITION: Logo[] = [
  { src: "/partners/dpiit.png", name: "DPIIT · Startup India" },
];

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

// Near-white chip so every mark (most are dark) reads on black AND white.
// Fixed height + object-contain = consistent box, never stretched.
function LogoChip({ logo }: { logo: Logo }) {
  return (
    <div className="flex h-[68px] w-[168px] shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/90 px-7 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:-translate-y-0.5">
      <Image
        src={logo.src}
        alt={logo.name}
        width={120}
        height={40}
        loading="eager"
        unoptimized
        className="h-9 w-auto max-w-full object-contain"
      />
    </div>
  );
}

// One marquee row + symmetric progressive-blur edges that fade into the bg.
function LogoRow({
  logos,
  reverse = false,
  duration = 36,
}: {
  logos: Logo[];
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div className="relative">
      <InfiniteSlider gap={20} duration={duration} reverse={reverse}>
        {logos.map((logo) => (
          <LogoChip key={logo.src} logo={logo} />
        ))}
      </InfiniteSlider>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[14%]">
        <ProgressiveBlur
          className="h-full w-full"
          direction="left"
          blurIntensity={1.2}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-bg),transparent)]" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[14%]">
        <ProgressiveBlur
          className="h-full w-full"
          direction="right"
          blurIntensity={1.2}
        />
        <div className="absolute inset-0 bg-[linear-gradient(270deg,var(--color-bg),transparent)]" />
      </div>
    </div>
  );
}

function CategoryLabel({ index, label }: { index: number; label: string }) {
  return (
    <motion.div {...reveal(index * 0.05)} className="mb-9">
      {/* small mono index + hairline — the editorial marker */}
      <span className="mono mb-3 flex items-center gap-2.5 text-[11px] tracking-[0.24em] text-(--color-muted)">
        <span className="text-(--color-cobalt-glow)">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span aria-hidden className="h-px w-8 bg-(--color-line)" />
      </span>
      {/* the real subheading — large, legible, on-brand display type */}
      <h2 className="font-display text-[clamp(30px,4.4vw,56px)] font-normal leading-[0.95] tracking-[-0.035em] text-(--color-fg)">
        {label}
      </h2>
    </motion.div>
  );
}

export function Collaborators() {
  return (
    <section
      id="collaborators"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(40px,7vh,90px)] pb-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto flex w-full max-w-[var(--col-w)] flex-col gap-16">
        {/* Our Collaborators — a single marquee row (no doubled track). */}
        <div>
          <CategoryLabel index={0} label="Collaborators" />
          <motion.div {...reveal(0.1)}>
            <LogoRow logos={COLLABORATORS} duration={46} />
          </motion.div>
        </div>

        {/* Our Supporters — a single marquee row (no doubled track). */}
        <div>
          <CategoryLabel index={1} label="Supporters" />
          <motion.div {...reveal(0.1)}>
            <LogoRow logos={SUPPORTERS} duration={52} reverse />
          </motion.div>
        </div>

        {/* Recognition — single mark, presented in its own chip (no marquee
            needed for one item, but kept on-brand with the same chip styling). */}
        <div>
          <CategoryLabel index={2} label="Recognition" />
          <motion.div {...reveal(0.1)} className="flex flex-wrap gap-5">
            {RECOGNITION.map((logo) => (
              <LogoChip key={logo.src} logo={logo} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
