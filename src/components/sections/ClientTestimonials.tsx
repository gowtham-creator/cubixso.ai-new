// ClientTestimonials — scrolling marquee of named client testimonials.
//
// ON CONTENT: every entry here must be a real, approved quote from a real
// client. The 21st.dev block this is adapted from ships with three invented
// people ("Emma Thompson", "David Park", "Sofia Rodriguez") and stock avatar
// URLs. Those are demo filler; publishing them on cubixso.com would be
// fabricated social proof on a live company site, so they are deliberately not
// here. Add a card only when there is a real quote behind it.
//
// The PenFed / USAA distinction from sections/Testimonial.tsx carries over:
// they are clients OF THE SAVANTS ENGAGEMENT that Logic Gen was delivered into,
// not Cubixso's own clients. Keep that wording if this copy is ever reworked.

import { TestimonialCard, type TestimonialCardProps } from "@/components/ui/testimonial-card";

export const CLIENT_TESTIMONIALS: TestimonialCardProps[] = [
  {
    author: {
      name: "Rajashekar Reddy",
      handle: "Founder · Savants Group USA LLC",
    },
    text:
      "Cubixso turned a fifteen-year-old underwriting ruleset into a deployable DMN system in six weeks. 40 percent of decisions run on it now.",
    note: "Logic Gen · Engagement clients: PenFed · USAA",
  },
];

interface ClientTestimonialsProps {
  title?: string;
  description?: string;
  testimonials?: TestimonialCardProps[];
  className?: string;
}

export function ClientTestimonials({
  title = "What our clients say",
  description = "Named engagements, measured outcomes — in our clients' own words.",
  testimonials = CLIENT_TESTIMONIALS,
  className,
}: ClientTestimonialsProps) {
  if (testimonials.length === 0) return null;

  // A marquee only reads as a marquee with enough cards to overflow the
  // viewport. Below that, render a static centred row instead of looping one
  // card past itself, which looks broken rather than abundant.
  const marquee = testimonials.length >= 3;

  return (
    <section
      id="client-testimonials"
      className={`relative z-10 py-[clamp(72px,10vh,136px)] ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full max-w-[var(--col-w)] flex-col items-center gap-4 px-[var(--pad-x)] text-center sm:gap-6">
        <h2 className="font-display max-w-[720px] text-[length:var(--text-display-sm)] leading-[1.1] tracking-[-0.025em] text-balance text-(--color-fg)">
          {title}
        </h2>
        <p className="max-w-[600px] text-(--color-muted) sm:text-lg">
          {description}
        </p>
      </div>

      <div className="relative mt-[clamp(32px,5vh,64px)] flex w-full flex-col items-center overflow-hidden">
        {marquee ? (
          // One track holding the set TWICE, translated by exactly half its
          // width (plus half a gap) so the loop is seamless. The source block
          // rendered four copies in a single track and translated a full -100%,
          // which scrolls the whole track off screen and snaps — visible as a
          // blank stutter once per cycle.
          <div className="marquee-viewport group flex w-full overflow-hidden p-2">
            <div className="marquee-track flex shrink-0 group-hover:[animation-play-state:paused]">
              {[0, 1].map((copy) =>
                testimonials.map((t, i) => (
                  <TestimonialCard
                    key={`${copy}-${i}`}
                    {...t}
                    // The second pass is a visual duplicate; hide it from AT so
                    // the quotes are not announced twice.
                    className={copy === 1 ? "[&]:select-none" : undefined}
                  />
                )),
              )}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap justify-center gap-4 px-[var(--pad-x)]">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        )}

        {marquee ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-(--color-bg) to-transparent sm:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-(--color-bg) to-transparent sm:block" />
          </>
        ) : null}
      </div>
    </section>
  );
}
