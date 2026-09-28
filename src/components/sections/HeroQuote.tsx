// A single pull quote directly under the hero: the forward-looking line that
// sets up the rest of the page. Server component; Reveal handles the entrance.

import { Reveal } from "@/components/scroll/Reveal";
import { Testimonial2 } from "@/components/ui/testimonial-2";

// Apple mark in currentColor, so it reads as ink on the light canvas and white
// on the dark one; in dark mode it picks up a soft glow (.apple-glow). The word
// stays in the accessibility tree.
function AppleLogo() {
  return (
    <span className="inline-flex items-center align-[-0.18em]">
      <svg viewBox="0 0 24 24" aria-hidden className="apple-glow h-[1.15em] w-[1.15em] fill-current text-(--color-fg)">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
      <span className="sr-only">Apple</span>
    </span>
  );
}

export function HeroQuote() {
  return (
    <section aria-label="Quote" className="relative z-10 px-[var(--pad-x)] pt-[clamp(48px,7vw,104px)] pb-[clamp(8px,2vw,32px)]">
      <div className="mx-auto flex w-full max-w-[var(--col-w)] justify-center">
        <Reveal direction="up" className="w-full max-w-[860px]">
          <Testimonial2
            quote="Let’s go invent tomorrow rather than worrying about what happened yesterday."
            authorName="Steve Jobs"
            authorTagline={
              <>
                Co-founder,{" "}
                <AppleLogo />
              </>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}
