import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Pill link with a round arrow that slides across and turns on hover/focus
// (adapted from 21st.dev "button-with-icon"). It navigates, so it renders a
// Next Link rather than a <button>: the site's shadcn Button is base-ui and
// has no asChild, and a link nested in a button is invalid HTML. Colours use
// the site tokens so it reads correctly in both themes. The padding swaps
// sides on hover, so the pill keeps its width while the arrow travels.
export function ButtonWithIcon({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-12 w-fit items-center overflow-hidden rounded-full bg-(--color-accent) p-1 ps-6 pe-14 text-sm font-medium text-[oklch(0.99_0.005_265)] outline-none transition-all duration-500 hover:ps-14 hover:pe-6 active:ps-14 active:pe-6 focus-visible:ps-14 focus-visible:pe-6 focus-visible:ring-2 focus-visible:ring-(--color-accent-2) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)",
        className,
      )}
    >
      <span className="relative z-10 transition-all duration-500">{children}</span>
      <span
        aria-hidden
        className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-(--color-bg) text-(--color-fg) transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 group-active:right-[calc(100%-44px)] group-active:rotate-45 group-focus-visible:right-[calc(100%-44px)] group-focus-visible:rotate-45"
      >
        <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}
