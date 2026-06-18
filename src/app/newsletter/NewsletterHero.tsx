"use client";

// NewsletterHero — the /newsletter page, ported faithfully from the asme
// HeroSection the client supplied (design-system/asme-ref/src/components/
// HeroSection.tsx): full-screen fading video, "Built for the curious" in
// Instrument Serif, the liquid-glass email pill with the circular arrow submit,
// a Manifesto button, and the social row. Changes from the asme original, all
// intentional: (1) no Navbar — /newsletter is a standalone, chrome-free route
// per the brief; (2) the social icons are wired to Cubixso's real LinkedIn +
// Instagram + website; (3) Manifesto links to /about. The liquid-glass styles
// are inlined so the component is self-contained.

import { type FormEvent, type SVGProps, useState } from "react";
import Link from "next/link";
import FadingVideo from "@/components/newsletter/FadingVideo";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";
const INSTRUMENT_SERIF = "var(--font-instrument), 'Instrument Serif', serif";

// Inline SVG icons (no external icon dependency).
const I = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
    strokeLinecap="round" strokeLinejoin="round" {...props} />
);
const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <I {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></I>
);
const Instagram = (p: SVGProps<SVGSVGElement>) => (
  <I {...p}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></I>
);
const Linkedin = (p: SVGProps<SVGSVGElement>) => (
  <I {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></I>
);
const Globe = (p: SVGProps<SVGSVGElement>) => (
  <I {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></I>
);

const SOCIALS = [
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/cubixso.ai/" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/cubixso/" },
  { Icon: Globe, label: "Website", href: "https://cubixso.com" },
];

export function NewsletterHero() {
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="hero" className="nl-asme relative flex min-h-[100svh] flex-col overflow-hidden bg-black">
      {/* liquid-glass + fallback styles, scoped to this page (from the asme css) */}
      <style>{`
        .nl-asme .liquid-glass {
          background: #ffffff03;
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px #ffffff1a;
          position: relative;
          overflow: hidden;
        }
        .nl-asme .liquid-glass::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,#ffffff73,#ffffff26,#fff0,#fff0,#ffffff26,#ffffff73);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .nl-asme .video-fallback {
          background: radial-gradient(ellipse 80% 60% at 50% 30%, rgba(60,70,90,.45), transparent 55%),
            linear-gradient(180deg,#1a1a22,#000);
        }
      `}</style>

      <div className="absolute inset-0">
        <FadingVideo src={HERO_VIDEO} shiftY className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center -translate-y-[12%]">
          <h1
            className="mb-8 text-5xl tracking-tight text-white md:text-6xl lg:text-7xl"
            style={{ fontFamily: INSTRUMENT_SERIF }}
          >
            Built for the curious
          </h1>

          <div className="w-full max-w-xl space-y-4">
            {submitted ? (
              <p
                className="liquid-glass rounded-full px-6 py-4 text-sm font-medium text-white"
                role="status"
              >
                You&apos;re on the list, we&apos;ll be in touch soon.
              </p>
            ) : (
              <form
                className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2"
                onSubmit={handleEmailSubmit}
              >
                <label htmlFor="nl-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="nl-email"
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="min-w-0 flex-1 border-none bg-transparent text-base text-white placeholder:text-white/40 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white p-3 text-black transition-transform hover:translate-x-0.5"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            )}

            <p className="px-4 text-sm leading-relaxed text-white">
              Stay updated with the latest news and insights. Subscribe to our newsletter today
              and never miss out on exciting updates.
            </p>

            <Link
              href="/about"
              className="liquid-glass inline-block rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Manifesto
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex justify-center gap-4 pb-12">
          {SOCIALS.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
