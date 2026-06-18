"use client";
import { cn } from "@/lib/utils";

type NavItem = { name: string; href: string };
interface NavProps { items: NavItem[]; className?: string }

// ============================================================================
// 4. THE "SWIPE MASK" NAV
// Physics: Diagonal color fill mask.
// ============================================================================
export const SwipeMaskNav = ({ items, className }: NavProps) => {
    return (
        <nav className={cn("flex gap-0 border border-zinc-200 rounded-full overflow-hidden p-1 bg-white", className)}>
            {items.map((item) => (
                <a key={item.name} href="#" className="relative px-6 py-2 group overflow-hidden rounded-full">
                    <span className="relative z-10 text-zinc-800 transition-colors duration-500 group-hover:text-white font-medium">
                        {item.name}
                    </span>
                    <span className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                </a>
            ))}
        </nav>
    );
};