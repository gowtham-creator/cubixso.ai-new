'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- Embedded Styles ---
const UiloraVelorahStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');

    :root {
      --uv-navy: 201 100% 13%;
      --uv-white: 0 0% 100%;
      --uv-muted: 240 4% 66%;
      --uv-border: 0 0% 18%;
    }

    .uv-liquid-glass {
      background: rgba(255, 255, 255, 0.01);
      background-blend-mode: luminosity;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: none;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .uv-liquid-glass::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1.4px;
      background: linear-gradient(180deg,
        rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
        rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
        rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    @keyframes fade-rise {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .uv-animate-fade-rise { animation: fade-rise 0.8s ease-out both; }
    .uv-animate-fade-rise-delay { animation: fade-rise 0.8s ease-out 0.2s both; }
    .uv-animate-fade-rise-delay-2 { animation: fade-rise 0.8s ease-out 0.4s both; }

    .uv-font-display { font-family: 'Instrument Serif', serif; }
    .uv-font-body { font-family: 'Inter', sans-serif; }
  ` }} />
);

const Navbar = () => {
  return (
    <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Logo */}
      <h1 className="uv-font-display text-3xl tracking-tight text-white flex items-start">
        Uilora<sup className="text-xs ml-0.5 mt-1">®</sup>
      </h1>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-10">
        {["Home", "Studio", "About", "Journal", "Reach Us"].map((link, i) => (
          <a
            key={link}
            href="#"
            className={`text-sm transition-colors duration-300 ${i === 0 ? "text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {link}
          </a>
        ))}
      </div>

      {/* CTA */}
      <button className="uv-liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform duration-300 uv-font-body font-medium">
        Begin Journey
      </button>
    </nav>
  );
};

export const UiloraVelorah = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#001D33] overflow-hidden flex flex-col uv-font-body selection:bg-white selection:text-[#001D33]">
      <UiloraVelorahStyles />

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[0.2] brightness-75"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>

      {/* Content Overlay */}
      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 flex-grow py-[90px]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Main Heading */}
          <h2 className="uv-font-display text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] text-white uv-animate-fade-rise font-normal max-w-6xl">
            Where <em className="not-italic text-zinc-400">dreams</em> rise <br className="hidden md:block" />
            <em className="not-italic text-zinc-400">through the silence.</em>
          </h2>

          {/* Subtext */}
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mt-12 leading-relaxed uv-animate-fade-rise-delay font-light">
            We're designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          {/* Large CTA */}
          <button className="uv-liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer uv-animate-fade-rise-delay-2 font-medium tracking-wide">
            Begin Journey
          </button>
        </div>
      </main>

      {/* Subtle Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/30 z-[1]" />
    </div>
  );
};

export default UiloraVelorah;
