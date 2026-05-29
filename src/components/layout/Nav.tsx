"use client";

// Nav — editorial top-fixed navigation. Brand mark left, route links right,
// magnetic micro-interactions, fades up on mount, hides on scroll-down to
// give the canvas + content full breathing room.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Magnetic } from "@/components/motion/Magnetic";
import { useTheme } from "@/components/providers/ThemeProvider";

const ROUTES = [
  { href: "/services",   label: "Services" },
  { href: "/products",   label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/about",      label: "About" },
  { href: "/contact",    label: "Contact" },
];

// Theme toggle — sun / moon / system, cycles on click. Visible on all viewports.
function ThemeToggle() {
  const { theme, resolved, cycle } = useTheme();
  const label = theme === "system" ? `Auto · ${resolved}` : theme;
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to cycle.`}
      title={`Theme: ${label}`}
      className="grid place-items-center w-9 h-9 rounded-full border border-(--color-line-2) text-(--color-fg) hover:border-(--color-fg) hover:bg-(--color-surface) transition-all"
    >
      {resolved === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}

// Hamburger button — mobile only
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="md:hidden grid place-items-center w-9 h-9 rounded-full border border-(--color-line-2) text-(--color-fg) hover:border-(--color-fg) transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        {open ? (
          <>
            <path d="M6 6 L18 18" />
            <path d="M6 18 L18 6" />
          </>
        ) : (
          <>
            <path d="M4 7 H20" />
            <path d="M4 17 H20" />
          </>
        )}
      </svg>
    </button>
  );
}

// Brand mark — actual Cubixso logo PNG, swaps light/dark for contrast
function BrandGlyph() {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? "/logo-on-dark.png" : "/logo.png";
  return (
    <Image
      src={src}
      alt="Cubixso"
      width={28}
      height={28}
      priority
      className="object-contain"
    />
  );
}

export function Nav() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => setMounted(true), []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Hide nav when scrolling down past 100px, show when scrolling up
  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (current > 120 && current > prev) setHidden(true);
    else setHidden(false);
  });

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{
        y: hidden ? -80 : 0,
        opacity: mounted ? 1 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      {/* Subtle frosted backdrop — theme-aware via bg-soft, only visible when scrolled past hero */}
      <div className="absolute inset-0 bg-(--color-bg)/55 backdrop-blur-xl border-b border-(--color-line)/60 pointer-events-none" aria-hidden />
      <div className="relative mx-auto flex max-w-[var(--col-w)] items-center justify-between gap-6 px-[var(--pad-x)] py-4 pointer-events-auto">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Cubixso home"
          className="inline-flex items-center gap-2.5 text-(--color-fg) hover:text-(--color-accent-2) transition-colors"
        >
          <BrandGlyph />
          <span className="font-display text-[15px] font-semibold tracking-[-0.012em] leading-none">
            Cubixso<span className="text-(--color-accent-2)">.</span>
          </span>
        </Link>

        {/* Route links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {ROUTES.map((r) => (
            <Magnetic key={r.href} strength={0.18}>
              <Link
                href={r.href}
                className="mono px-4 py-2 text-(--color-fg-2) hover:text-(--color-fg) transition-colors"
              >
                {r.label}
              </Link>
            </Magnetic>
          ))}
        </nav>

        {/* Right cluster — theme + CTA (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Magnetic strength={0.2}>
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-2 mono text-[11px] text-(--color-bg) bg-(--color-fg) px-4 py-2 rounded-full hover:scale-[1.03] transition-transform"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--color-signal) animate-pulse" />
              START
            </Link>
          </Magnetic>

          <MenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </div>

      {/* Mobile sheet — full overlay with all routes + CTA */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 top-[64px] z-40 bg-(--color-bg)/96 backdrop-blur-2xl pointer-events-auto"
          >
            <nav className="flex flex-col gap-2 px-[var(--pad-x)] pt-10 pb-12">
              {ROUTES.map((r, i) => (
                <motion.div
                  key={r.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={r.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 font-display text-[clamp(32px,8vw,52px)] font-medium tracking-[-0.025em] text-(--color-fg) border-b border-(--color-line)"
                  >
                    {r.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10"
              >
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-3 bg-(--color-fg) text-(--color-bg) rounded-full pl-6 pr-2 py-2 font-medium tracking-tight"
                >
                  <span>Start the conversation</span>
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-(--color-bg) text-(--color-fg)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17 L17 7 M9 7 L17 7 L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
