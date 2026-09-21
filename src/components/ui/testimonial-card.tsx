// TestimonialCard — adapted from the 21st.dev card to this codebase.
//
// Three deliberate departures from the source, all because the source targets a
// stock shadcn project and this one is not:
//
//   1. No @radix-ui/react-avatar. There is no Radix anywhere in this repo, and
//      the Avatar primitive exists to coordinate image/fallback loading state.
//      A single decorative <img> in a circle does not need a dependency, and a
//      bare <img> lets the initials fallback render without a client boundary.
//   2. Project tokens, not shadcn tokens. The source uses bg-muted/from-muted,
//      which resolve to stock neutral greys. This site's language is cobalt on
//      a void, so the card is built from LiquidGlass + --color-* like every
//      other surface. Dropping in shadcn greys would read as a foreign section.
//   3. Real attribution only. See ClientTestimonials for why.

import Image from "next/image";
import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/glass/LiquidGlass";

export interface TestimonialAuthor {
  name: string;
  /** Role + company, e.g. "Founder · Savants Group USA LLC". */
  handle: string;
  /** Optional headshot. Falls back to initials when absent. */
  avatar?: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  /** Optional context line, e.g. the engagement the quote refers to. */
  note?: string;
  href?: string;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function TestimonialCard({
  author,
  text,
  note,
  href,
  className,
}: TestimonialCardProps) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="mono grid h-12 w-12 shrink-0 place-items-center rounded-full border border-(--color-line-2) bg-(--color-surface) text-xs text-(--color-fg-2)"
          >
            {initials(author.name)}
          </span>
        )}
        <div className="flex min-w-0 flex-col items-start">
          <h3 className="truncate text-[15px] font-semibold leading-none text-(--color-fg)">
            {author.name}
          </h3>
          <p className="mono mt-1.5 truncate text-[11px] uppercase tracking-wide text-(--color-muted)">
            {author.handle}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-(--color-fg-2) sm:text-[15px]">
        {text}
      </p>

      {note ? (
        <p className="mono mt-4 text-[10px] uppercase tracking-wide text-(--color-muted-2)">
          {note}
        </p>
      ) : null}
    </>
  );

  return (
    <LiquidGlass
      as={href ? "a" : "div"}
      tier="panel"
      radius={16}
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex w-[300px] shrink-0 flex-col p-5 text-start sm:w-[340px] sm:p-6",
        // The marquee track is aria-hidden and pointer-driven; only real links
        // get a hover affordance.
        href && "transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      {body}
    </LiquidGlass>
  );
}
