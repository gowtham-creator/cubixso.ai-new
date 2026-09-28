import { cn } from "@/lib/utils";

// Pull quote with a rule-led attribution (adapted from 21st.dev "testimonial-2").
// Site tokens instead of shadcn's foreground/muted (those mappings have caused
// white-on-white here before), and the author link is optional: a quotation
// from a public figure has no profile to link to.

export type Testimonial2Props = {
  /** Full display name of the person quoted. */
  authorName: string;
  /** Short tagline, title, or description of the person (text or a logo). */
  authorTagline: React.ReactNode;
  /** Optional link to the person's profile or the quote's source. */
  url?: string;
  /** The quotation. */
  quote: string;
  /** Additional CSS classes for the container. */
  className?: string;
};

export function Testimonial2({ className, authorName, authorTagline, url, quote }: Testimonial2Props) {
  return (
    <figure className={cn("relative flex flex-col gap-6 pl-3", className)}>
      <blockquote className="relative block w-full font-serif text-[clamp(26px,3.4vw,44px)] leading-[1.18] tracking-[-0.01em] text-(--color-fg) md:max-w-[22ch]">
        <span className="absolute -left-4 text-(--color-accent-2) select-none" aria-hidden="true">
          “
        </span>
        <p className="inline text-pretty">{quote}</p>
        <span className="absolute translate-x-0.5 text-(--color-accent-2) select-none" aria-hidden="true">
          ”
        </span>
      </blockquote>

      <figcaption className="ml-auto flex w-full items-center gap-3 md:w-1/2">
        <div className="hidden h-px grow translate-y-px bg-(--color-line-2) md:block" />
        <div className="flex flex-col md:ml-auto md:text-right">
          <span className="text-[15px] leading-none font-medium text-(--color-fg)">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span className="absolute inset-0" aria-hidden />
                {authorName}
              </a>
            ) : (
              authorName
            )}
            <span className="mt-1.5 block text-(--color-fg-2) md:mt-0 md:inline">
              <span className="hidden text-(--color-fg) md:inline">, </span>
              {authorTagline}
            </span>
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default Testimonial2;
