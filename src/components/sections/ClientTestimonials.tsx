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
  {
    author: {
      name: "Smarendra Modukuri",
      handle: "Founder · AumicFlow AI",
    },
    text:
      "We needed a script engine that understood not just Hindi and Tamil but the dialects our writers actually work in. Cubixso built Aumic Flow across eleven Indian languages, and what came back read as culturally grounded, not translated.",
    note: "Aumic Flow AI · 8× content throughput",
  },
  {
    author: {
      name: "Pranav Jain",
      handle: "Founder, Luxrio Designs · Product Owner, Nox AI",
    },
    text:
      "We wanted an agent that could hold a real phone conversation, not read a script. Cubixso built Nox AI's calling layer so it listens, handles being interrupted, and recovers the way a person does.",
    note: "Nox AI · Agentic voice platform",
  },
  {
    author: {
      name: "Navata Transport",
      handle: "Logistics · India",
    },
    text:
      "Our operations ran on a Java system built over a decade ago. It worked, but nobody could change it safely. Cubixso moved us onto a modern web application without pausing a single day of dispatch.",
    note: "Legacy modernisation · Java → web platform",
  },
  {
    author: {
      name: "Ramakrishna Katakam",
      handle: "Founder · Nutri Greenz Farm",
    },
    text:
      "Traceability is the entire promise of Nutrigreenz — if a customer can't see which farm their oil came from, we're just another label. Cubixso built the platform so every product carries its origin all the way through to checkout.",
    note: "Nutrigreenz · Farm-to-table commerce",
  },
  {
    author: {
      name: "Mohan Subramanian",
      handle: "Founder · Resumize",
    },
    text:
      "Students don't need another resume template, they need to get past the ATS. Cubixso built Resumize to generate resumes that parse cleanly and still read like a person wrote them.",
    note: "Resumize · ATS-optimised generation",
  },
  {
    author: {
      name: "Harminder Singh",
      // "Senior Advocate" is a formal designation conferred under the Advocates
      // Act, not a seniority adjective. Until that designation is confirmed,
      // "Advocate" is the accurate title — overstating it on a practising
      // lawyer's public testimonial is the kind of error that gets noticed.
      // Court name corrected too: the court at Chandigarh is the Punjab &
      // Haryana High Court; there is no separate "Punjab High Court".
      handle: "Advocate · Punjab & Haryana High Court",
    },
    text:
      "Research that used to mean days in the archive now takes an afternoon. Law Suit GPT searches across forty thousand judgments and returns the passage, not just the case.",
    note: "Law Suit GPT · Sub-2s retrieval at scale",
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
      className={`relative z-10 py-[clamp(44px,6vh,88px)] ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full max-w-[var(--col-w)] flex-col items-center gap-3 px-[var(--pad-x)] text-center sm:gap-4">
        {/* --text-display-sm does NOT exist (the scale is 2xl/xl/lg/md), so the
            font-size declaration was invalid and the heading fell back to the
            inherited 16px — rendering SMALLER than its own 18px description.
            md matches Testimonial.tsx's pull-quote and stays proportionate to
            the cards; lg (92px here) would tower over them. */}
        <h2 className="font-display max-w-[720px] text-[length:var(--text-display-md)] leading-[1.05] tracking-[-0.03em] text-balance text-(--color-fg)">
          {title}
        </h2>
        <p className="max-w-[560px] text-(--color-muted) sm:text-lg">
          {description}
        </p>
      </div>

      <div className="relative mt-[clamp(24px,3.5vh,44px)] flex w-full flex-col items-center overflow-hidden">
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
