import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { About } from "@/components/sections/About";
import { Metrics } from "@/components/sections/Metrics";
import { Global } from "@/components/sections/Global";
import { BackedBy } from "@/components/sections/BackedBy";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

export const metadata: Metadata = {
  title: "About — Cubixso.ai",
  description:
    "An AI-first company building intelligent systems, agentic products, and enterprise platforms end-to-end — architecture through deployment, observability, and support.",
};

// Two ecosystem logo groups. Each logo rides a theme-aware neutral chip so
// every mark stays clearly visible in BOTH themes: in dark we paint a white
// chip behind it (so a black logo like bolt-abacus never vanishes); in light
// the chip is a faint surface tint. We do NOT use `dark:*` variants — this site
// themes via html[data-theme], not Tailwind's .dark class.
type Logo = { src: string; alt: string };

const PARTNER_LOGOS: Logo[] = [
  { src: "/partners/aws.png", alt: "AWS" },
  { src: "/partners/msft.png", alt: "Microsoft" },
  { src: "/partners/atlassian.png", alt: "Atlassian" },
  { src: "/partners/digital-ocean.png", alt: "DigitalOcean" },
  { src: "/partners/mongo.png", alt: "MongoDB" },
  { src: "/partners/neo4j.png", alt: "Neo4j" },
  { src: "/partners/perplexity.png", alt: "Perplexity" },
  { src: "/partners/zoho.jpg", alt: "Zoho" },
  { src: "/partners/google-devs.png", alt: "Google Developers" },
  { src: "/partners/PayU-ogo.png", alt: "PayU" },
];

const COLLABORATOR_LOGOS: Logo[] = [
  { src: "/partners/dpiit.png", alt: "DPIIT" },
  { src: "/partners/wadhwani.png", alt: "Wadhwani Foundation" },
  { src: "/partners/pursuit-soln.png", alt: "Pursuit Solutions" },
  { src: "/partners/ect-logo.png", alt: "ECT" },
  { src: "/partners/bolt-abacus-black.png", alt: "Bolt Abacus" },
  { src: "/partners/tech-savant.png", alt: "Tech Savant" },
  { src: "/partners/krower.png", alt: "Krower" },
  { src: "/partners/winningedge.png", alt: "Winning Edge" },
  { src: "/partners/elit-celer.png", alt: "Elit Celer" },
];

function LogoChip({ logo }: { logo: Logo }) {
  return (
    <span
      className={[
        "pointer-events-none flex h-16 w-[clamp(120px,12vw,170px)] shrink-0 items-center justify-center",
        "rounded-2xl border border-(--color-line) px-6",
        // Light: faint surface tint. Dark: solid white chip so every mark
        // (including black-ink logos) reads with full contrast.
        "[html[data-theme=light]_&]:bg-(--color-bg-soft)/40",
        "[html[data-theme=dark]_&]:bg-white/90 [html[data-theme=dark]_&]:border-white/10",
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={logo.alt}
        src={logo.src}
        loading="eager"
        decoding="async"
        className="max-h-7 w-auto max-w-full select-none object-contain"
      />
    </span>
  );
}

function LogoWall({
  num,
  eyebrow,
  title,
  logos,
  reverse,
}: {
  num: string;
  eyebrow: string;
  title: string;
  logos: Logo[];
  reverse?: boolean;
}) {
  return (
    <section className="relative z-10 px-[var(--pad-x)] py-[clamp(40px,7vh,90px)]">
      <div className="mx-auto w-full max-w-[var(--col-w)]">
        <p className="mono mb-6 inline-flex items-center gap-3 text-[12px] tracking-[0.2em] text-(--color-muted)">
          <span className="text-(--color-muted-2)">{num}</span>[ {eyebrow} ]
        </p>
        <h2 className="font-display max-w-3xl text-balance text-[length:var(--text-display-md)] leading-[1.02] tracking-[-0.03em] text-(--color-fg)">
          {title}
        </h2>
        <div className="mt-12 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <InfiniteSlider gap={28} reverse={reverse} duration={34} durationOnHover={90}>
            {logos.map((logo) => (
              <LogoChip key={logo.alt} logo={logo} />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        num="01"
        eyebrow="ABOUT"
        title={
          <>
            An AI-first{" "}
            {/* The ONE aurora-gradient word in this headline. */}
            <em
              className="font-serif not-italic italic text-aurora [html[data-theme=light]_&]:[background:none] [html[data-theme=light]_&]:text-(--color-fg)"
              style={{ letterSpacing: "-0.02em", fontWeight: 400 }}
            >
              company
            </em>
            .
          </>
        }
        intro="Cubixso.ai builds intelligent systems, agentic products, and enterprise platforms. One team, one accountability line, end-to-end."
      />
      <About bare />
      <Metrics />
      <LogoWall
        num="02"
        eyebrow="PARTNERS"
        title="Our partners — the stacks we build and ship on."
        logos={PARTNER_LOGOS}
      />
      <LogoWall
        num="03"
        eyebrow="COLLABORATORS"
        title="Companies we collaborate with."
        logos={COLLABORATOR_LOGOS}
        reverse
      />
      <Global />
      <BackedBy />
      <FinalCTA />
    </main>
  );
}
