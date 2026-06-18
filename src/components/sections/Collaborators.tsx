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

// Real assets in public/partners/, grouped for the partner wall.
const PLATFORM_PARTNERS: Logo[] = [
  { src: "/partners/aws.png", name: "Amazon Web Services" },
  { src: "/partners/msft.png", name: "Microsoft" },
  { src: "/partners/google-devs.png", name: "Google Developers" },
  { src: "/partners/atlassian.png", name: "Atlassian" },
  { src: "/partners/mongo.png", name: "MongoDB" },
  { src: "/partners/neo4j.png", name: "Neo4j" },
  { src: "/partners/perplexity.png", name: "Perplexity" },
  { src: "/partners/digital-ocean.png", name: "DigitalOcean" },
  { src: "/partners/zoho.jpg", name: "Zoho" },
  { src: "/partners/PayU-ogo.png", name: "PayU" },
];

const ACCELERATORS: Logo[] = [
  { src: "/partners/wadhwani.png", name: "Wadhwani Foundation" },
  { src: "/partners/bolt-abacus-black.png", name: "Bolt Abacus" },
  { src: "/partners/pursuit-soln.png", name: "Pursuit Solutions" },
  { src: "/partners/tech-savant.png", name: "Tech Savant" },
  { src: "/partners/elit-celer.png", name: "Elit Celer" },
  { src: "/partners/krower.png", name: "Krower" },
  { src: "/partners/ect-logo.png", name: "ECT" },
  { src: "/partners/winningedge.png", name: "Winning Edge" },
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
    <motion.p
      {...reveal(index * 0.05)}
      className="mono mb-6 inline-flex items-center gap-3 text-[12px] tracking-[0.2em] text-(--color-muted)"
    >
      <span className="text-(--color-muted-2)">
        {String(index + 1).padStart(2, "0")}
      </span>
      [ {label.toUpperCase()} ]
    </motion.p>
  );
}

export function Collaborators() {
  return (
    <section
      id="collaborators"
      className="relative z-10 bg-(--color-bg) px-[var(--pad-x)] py-[clamp(40px,7vh,90px)] pb-[clamp(80px,12vh,160px)]"
    >
      <div className="mx-auto flex w-full max-w-[var(--col-w)] flex-col gap-16">
        {/* Platform Partners — two rows scrolling opposite directions. */}
        <div>
          <CategoryLabel index={0} label="Platform Partners" />
          <motion.div {...reveal(0.1)} className="flex flex-col gap-5">
            <LogoRow logos={PLATFORM_PARTNERS} duration={40} />
            <LogoRow logos={PLATFORM_PARTNERS} duration={48} reverse />
          </motion.div>
        </div>

        {/* Accelerators & Programs — single row. */}
        <div>
          <CategoryLabel index={1} label="Accelerators & Programs" />
          <motion.div {...reveal(0.1)}>
            <LogoRow logos={ACCELERATORS} duration={44} reverse />
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
