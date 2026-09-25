// A single pull quote directly under the hero: the forward-looking line that
// sets up the rest of the page. Server component; Reveal handles the entrance.

import { Reveal } from "@/components/scroll/Reveal";
import { Testimonial2 } from "@/components/ui/testimonial-2";

export function HeroQuote() {
  return (
    <section aria-label="Quote" className="relative z-10 px-[var(--pad-x)] py-[clamp(72px,12vw,160px)]">
      <div className="mx-auto flex w-full max-w-[var(--col-w)] justify-center">
        <Reveal direction="up" className="w-full max-w-[860px]">
          <Testimonial2
            quote="Let’s go invent tomorrow rather than worrying about what happened yesterday."
            authorName="Steve Jobs"
            authorTagline="Co-founder, Apple"
          />
        </Reveal>
      </div>
    </section>
  );
}
