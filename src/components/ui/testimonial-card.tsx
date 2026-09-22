// TestimonialCard — the 21st.dev card, kept structurally faithful.
//
// An earlier version rebuilt this on LiquidGlass with a fixed w-[300px] and
// `truncate` on the name/handle. Both were mistakes: `truncate` needs min-w-0
// on every flex ancestor to work, so instead of ellipsing, long handles blew
// the card open — "Founder, Luxrio Designs · Product Owner, Nox AI" rendered
// 487px of content inside a 340px card. The original's approach is correct:
// max-w (not w), no truncation, let text wrap.
//
// Kept from the original: structure, spacing, type scale, the border-t +
// vertical gradient treatment, max-w-[320px].
// Changed: colour tokens resolve to this site's palette rather than shadcn's
// neutral greys, and the avatar is a plain <img> with an initials fallback —
// there is no Radix in this repo, and a circular image does not justify adding
// @radix-ui/react-avatar just to coordinate load state.

import { cn } from "@/lib/utils";

export interface TestimonialAuthor {
  name: string;
  /** Role + company, e.g. "Founder · Savants Group USA LLC". */
  handle: string;
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
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-lg border-t border-(--color-line)",
        "bg-gradient-to-b from-(--color-surface)/70 to-(--color-surface)/15",
        "p-4 text-start sm:p-6",
        "hover:from-(--color-surface)/90 hover:to-(--color-surface)/25",
        "w-[320px] max-w-[320px] shrink-0",
        "transition-colors duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {author.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.avatar}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-(--color-line-2) bg-(--color-surface) text-sm font-medium text-(--color-fg-2)"
          >
            {initials(author.name)}
          </span>
        )}
        {/* min-w-0 lets the column shrink inside the flex row so long roles wrap
            instead of forcing the card wider than its max-w. */}
        <div className="flex min-w-0 flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-(--color-fg)">
            {author.name}
          </h3>
          <p className="mt-1.5 text-sm leading-snug text-(--color-muted)">
            {author.handle}
          </p>
        </div>
      </div>

      <p className="sm:text-md mt-4 text-sm leading-relaxed text-(--color-fg-2)">
        {text}
      </p>

      {note ? (
        <p className="mt-3 text-xs leading-snug text-(--color-muted-2)">
          {note}
        </p>
      ) : null}
    </Card>
  );
}
