"use client";

// Nav — Tier-1 Liquid-Glass chrome for the "Cobalt Aperture over a Living Void"
// system. The bar is a single floating <LiquidGlass tier="nav"> pill: NO opaque
// fill, so the cobalt cube + editorial headline behind it bend and brighten
// THROUGH the glass — refraction is the page's first impression.
//
// WOW-MOMENT (hero first-impression refraction):
//   • On scroll-DOWN the pill COMPRESSES height (py 18→8px) and RAISES its blur
//     (20→28px) + saturation, so whatever scrolls under it visibly bends and
//     brightens — driven by a useScroll listener writing --nav-py/--nav-blur.
//   • A single 120° specular sweep crosses it ONCE on load (LiquidGlass lg-sweep
//     entrance), "light catching the lens".
//   • Logo, all route links, theme toggle preserved; START is now a cobalt
//     GlassButton (Tier-4 CTA) — the only cobalt-filled chrome.
//
// GPU-only (transform/opacity/filter), reduced-motion safe via LiquidGlass +
// matchMedia. The bar still slips up out of view on deep scroll-down for air.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Magnetic } from "@/components/motion/Magnetic";
import { useTheme } from "@/components/providers/ThemeProvider";
import { LiquidGlass, GlassButton } from "@/components/glass/LiquidGlass";
import { useLenis } from "@/components/providers/SmoothScroll";
import { AudioToggle } from "@/components/audio/AudioToggle";
import { Ph } from "@/components/icons/Ph";
import { tick, click } from "@/lib/feedback";

// Feedback bus — tick() only on a true mouse hover, so a touch tap never
// stacks tick + click on the same gesture. Never wired to scroll.
const hoverTick = (e: React.PointerEvent) => {
  if (e.pointerType === "mouse") tick();
};

const ROUTES = [
  { href: "/services",     label: "Services" },
  { href: "/products",     label: "Products" },
  { href: "/industries",   label: "Industries" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about",        label: "About" },
  { href: "/contact",      label: "Contact" },
  { href: "/newsletter",   label: "Newsletter" },
];

// Theme icons — stroke glyphs on currentColor, so they read on either theme.
const ThemeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p} />
);
const SunGlyph = () => (
  <ThemeIcon>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </ThemeIcon>
);
const MoonGlyph = () => (
  <ThemeIcon><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" /></ThemeIcon>
);
// "System" = follow the device. A display, the universal affordance for it.
const SystemGlyph = () => (
  <ThemeIcon>
    <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
    <path d="M9 20h6M12 16.5V20" />
  </ThemeIcon>
);

// Theme toggle — THREE states, cycling LIGHT -> DARK -> SYSTEM.
//
// "System" has to be reachable from the UI. ThemeProvider has always supported
// following the device theme (and live-updates when the OS flips), but this
// button only ever wrote "light" or "dark" — so the moment a visitor tapped it
// they were locked out of device sync until they cleared site data. Now the
// cycle includes it, and the label always states the mode plus what the next
// press does, rather than leaving the user to guess from an icon.
function ThemeToggle() {
  const { theme, resolved, cycle } = useTheme();

  const label =
    theme === "system" ? `System (currently ${resolved})`
    : theme === "light" ? "Light"
    : "Dark";
  const next = theme === "light" ? "Dark" : theme === "dark" ? "System" : "Light";

  return (
    <button
      type="button"
      onClick={() => { click(); cycle(); }}
      aria-label={`Theme: ${label}. Activate for ${next}.`}
      title={`Theme: ${label} — next: ${next}`}
      className="grid place-items-center w-9 h-9 rounded-full border border-(--color-line-2) text-(--color-fg) hover:border-(--color-fg) hover:bg-(--color-surface)/40 transition-all active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid place-items-center"
        >
          {theme === "light" ? <SunGlyph /> : theme === "dark" ? <MoonGlyph /> : <SystemGlyph />}
        </motion.span>
      </AnimatePresence>
      {/* Announce the change to assistive tech without stealing focus. */}
      <span className="sr-only" aria-live="polite">{label} theme</span>
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
      className="lg:hidden grid place-items-center w-9 h-9 rounded-full border border-(--color-line-2) text-(--color-fg) hover:border-(--color-fg) transition-colors"
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
      width={44}
      height={44}
      priority
      className="object-contain w-9 h-9 md:w-11 md:h-11"
    />
  );
}

export function Nav() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const reducedRef = useRef(false);
  // Active-route indicator — a cobalt dot that GLIDES between links via
  // framer layoutId (no glide under reduced motion: layout anim is spring'd
  // by framer, which respects the OS setting through MotionConfig defaults).
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Track reduced-motion once so the scroll listener can keep the pill at rest.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => { reducedRef.current = mq.matches; };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Lock page scroll when the mobile menu is open. `overflow:hidden` alone is
  // not enough here — Lenis drives its own inertial scroll and keeps running —
  // so stop the instance too and restart it on close.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) lenis?.stop();
    else lenis?.start();
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, lenis]);

  // A route change closes the sheet. Without this a link to the CURRENT route
  // leaves the overlay stuck open over the page (the onClick close never fires
  // for the active link on some browsers' tap handling).
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // WOW: on scroll-DOWN the pill compresses + raises blur so content bends
  // brighter behind it; on scroll-UP it relaxes. Deep scroll-down slips it away.
  useMotionValueEvent(scrollY, "change", (current) => {
    const prev = scrollY.getPrevious() ?? 0;
    const goingDown = current > prev;
    // Compact (refraction-up) state engages the moment we leave the very top.
    setCompact(current > 24);
    if (reducedRef.current) { setHidden(false); return; }
    if (current > 120 && goingDown) setHidden(true);
    else setHidden(false);
  });

  return (
    <>
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{
        // Never slip the bar away while the mobile sheet is open — the close (X)
        // button lives in it and has to stay reachable.
        y: hidden && !menuOpen ? -96 : 0,
        opacity: mounted ? 1 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ top: "var(--notice-h, 0px)" }}
      className="fixed left-0 right-0 z-50 pointer-events-none transition-[top] duration-300"
    >
      {/* 12–24px void gutter rings the pill so the cobalt light always lives
          behind the glass — never an edge-to-edge opaque bar. */}
      <div className="mx-auto w-full max-w-[var(--col-w)] px-[var(--pad-x)] pt-3 md:pt-4">
        {/* Tier-1 NAV glass pill. Compresses height + raises blur on scroll-down;
            120° specular sweep crosses once on load (lg-sweep entrance). The
            --nav-pad / --nav-backdrop vars animate via the parent style below. */}
        <LiquidGlass
          tier="nav"
          radius={22}
          className="lg-nav-bar pointer-events-auto"
          style={{
            // Drive height + blur from the compact state. CSS transitions these.
            ["--nav-py" as string]: compact ? "8px" : "16px",
            ["--nav-backdrop" as string]: compact
              ? "blur(28px) saturate(180%) brightness(1.1)"
              : "blur(20px) saturate(160%) brightness(1.06)",
          }}
        >
          <div className="relative flex items-center justify-between gap-6 px-4 md:px-5 lg-nav-row">
            {/* Brand */}
            <Link
              href="/"
              aria-label="Cubixso home"
              onPointerEnter={hoverTick}
              onClick={() => click()}
              className="inline-flex shrink-0 items-center gap-2.5 text-(--color-fg) hover:text-(--color-accent-2) transition-colors"
            >
              <BrandGlyph />
              <span className="font-display text-[19px] md:text-[22px] font-semibold tracking-[-0.015em] leading-none">
                Cubixso<span className="text-(--color-accent-2)">.</span>
              </span>
            </Link>

            {/* Route links — desktop. flex-1 + justify-center keeps the row
                centered between the fixed-width brand and right cluster, so
                it can never collide with either. */}
            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-0.5 px-2 xl:px-6">
              {ROUTES.map((r) => {
                const active =
                  pathname === r.href || pathname?.startsWith(r.href + "/");
                return (
                  <Magnetic key={r.href} strength={0.18}>
                    <Link
                      href={r.href}
                      onPointerEnter={hoverTick}
                      onClick={() => click()}
                      aria-current={active ? "page" : undefined}
                      className="group relative inline-flex items-center overflow-hidden whitespace-nowrap rounded-full px-2.5 xl:px-4 py-1.5 text-[12px] xl:text-[13px] font-medium tracking-[-0.01em]"
                    >
                      {/* swipe-mask fill — slides UP on hover (translate-y-full →
                          0), theme-adaptive (white pill on dark, black pill on
                          light); stays up for the active route like the apple
                          active pill. NB: must be classes, not inline transform —
                          an inline style would beat the group-hover utility. */}
                      <span
                        aria-hidden
                        className={`absolute inset-0 rounded-full bg-(--color-fg) transition-transform duration-300 ease-out ${
                          active ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors duration-300 ${
                          active
                            ? "text-(--color-bg)"
                            : "text-(--color-fg-2) group-hover:text-(--color-bg)"
                        }`}
                      >
                        {r.label}
                      </span>
                    </Link>
                  </Magnetic>
                );
              })}
            </nav>

            {/* Right cluster — sound (hubtown placement) + theme + cobalt
                START CTA (desktop) + hamburger */}
            <div className="flex shrink-0 items-center gap-3">
              <AudioToggle />
              <ThemeToggle />

              <Magnetic strength={0.2}>
                <Link href="/contact" aria-label="Start — get in touch" className="hidden xl:inline-flex">
                  <GlassButton
                    as="span"
                    className="lg-nav-cta items-center gap-2 mono whitespace-nowrap text-[11px] px-4 py-2 bg-(--color-cobalt)! text-white!"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    START
                  </GlassButton>
                </Link>
              </Magnetic>

              <MenuButton
                open={menuOpen}
                onClick={() => {
                  click();
                  setMenuOpen((v) => !v);
                }}
              />
            </div>
          </div>
        </LiquidGlass>
      </div>

      {/* Self-contained chrome styles — animate the compress (height/blur) on the
          Tier-1 pill without touching globals.css. Transform/filter only. */}
      <style>{`
        .lg-nav-bar{
          -webkit-backdrop-filter:var(--nav-backdrop, blur(20px) saturate(160%) brightness(1.06));
          backdrop-filter:var(--nav-backdrop, blur(20px) saturate(160%) brightness(1.06));
          transition:-webkit-backdrop-filter .5s var(--ease-smooth), backdrop-filter .5s var(--ease-smooth);
        }
        .lg-nav-row{
          padding-top:var(--nav-py, 16px);
          padding-bottom:var(--nav-py, 16px);
          transition:padding .5s var(--ease-smooth);
        }
        /* START CTA renders as a span (lives inside a Link) — keep it flex so the
           pulse dot + label align like the original pill. */
        .lg-nav-cta{ display:inline-flex; }
        @media (prefers-reduced-motion: reduce){
          .lg-nav-bar, .lg-nav-row{ transition:none; }
        }
      `}</style>
    </motion.header>

    {/* Mobile sheet — full-viewport overlay with all routes + CTA.
        MUST be a SIBLING of <motion.header>, never a child: framer animates the
        header with a transform, and a transformed ancestor becomes the
        containing block for position:fixed descendants. Nested, this sheet
        resolved its inset against the ~76px nav box instead of the viewport, so
        the panel collapsed to a sliver and its links spilled unpainted over the
        footer. As a sibling, `fixed` means the viewport again. */}
    <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ paddingTop: "calc(var(--notice-h, 0px) + 76px)" }}
            className="lg:hidden fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-(--color-bg)/95 backdrop-blur-2xl pointer-events-auto"
          >
            <nav className="flex min-h-full flex-col gap-2 px-[var(--pad-x)] pt-6 pb-[max(3rem,env(safe-area-inset-bottom))]">
              {ROUTES.map((r, i) => (
                <motion.div
                  key={r.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={r.href}
                    onClick={() => {
                      click();
                      setMenuOpen(false);
                    }}
                    className="block py-3 font-display text-[clamp(26px,6.4vw,44px)] font-medium tracking-[-0.025em] text-(--color-fg) border-b border-(--color-line)"
                  >
                    {r.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-auto pt-10"
              >
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Start the conversation"
                >
                  <GlassButton as="span" className="lg-nav-cta-mobile group inline-flex items-center gap-3 pl-6 pr-2 py-2 font-medium tracking-tight">
                    <span>Start the conversation</span>
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-(--color-bg)/30 text-(--color-fg) transition-transform group-hover:rotate-45">
                      <Ph name="arrow-up-right" weight="light" size={16} />
                    </span>
                  </GlassButton>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
