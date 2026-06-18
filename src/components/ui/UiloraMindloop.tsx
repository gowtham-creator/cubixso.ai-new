'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hls from 'hls.js';

// Inline social icons — installed lucide-react (1.18) doesn't export these
// names, so we keep the component self-contained with simple SVGs.
type IconProps = { size?: number; strokeWidth?: number };
const Instagram = ({ size = 18, strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
);
const Linkedin = ({ size = 18, strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const Twitter = ({ size = 18, strokeWidth = 1.5 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
);

// --- Animation Helpers ---
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" } as any,
});

// --- Embedded Styles ---
const MindloopStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .ml-liquid-glass {
      background: rgba(255, 255, 255, 0.01);
      background-blend-mode: luminosity;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: none;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .ml-liquid-glass::before {
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
  ` }} />
);

// --- Components ---

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-28 py-4 bg-transparent font-sans">
      <div className="flex items-center gap-3">
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-white/60 rounded-full" />
          <div className="w-3 h-3 border border-white/60 rounded-full" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Uilora</span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {["Home", "How It Works", "Philosophy", "Use Cases"].map((link, i, arr) => (
          <React.Fragment key={link}>
            <a href="#" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
              {link}
            </a>
            {i < arr.length - 1 && <span className="text-white/30 text-[8px]">●</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {[Instagram, Linkedin, Twitter].map((Icon, i) => (
          <button key={i} className="ml-liquid-glass w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform text-white">
            <Icon size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4 font-sans">
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale brightness-[0.4]">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 pt-28 md:pt-32 max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-3 mb-8">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-zinc-800">
                <img src={`https://i.pravatar.cc/100?u=mindloop-${i}`} alt="subscriber" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-zinc-400 text-sm font-medium">7,000+ people already subscribed</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.2)} className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] mb-6 leading-[1.1] text-white">
          Get <span className="font-serif italic font-normal">Inspired</span> with Us
        </motion.h1>

        <motion.p {...fadeUp(0.4)} className="text-lg md:text-xl text-zinc-100 max-w-2xl mx-auto mb-12 font-light">
          Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction.
        </motion.p>

        <motion.div {...fadeUp(0.6)} className="ml-liquid-glass rounded-full p-2 max-w-lg mx-auto flex items-center gap-2">
          <input type="email" placeholder="Enter your email" className="bg-transparent border-none outline-none flex-1 px-6 text-white placeholder:text-zinc-500" />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="bg-white text-black font-bold rounded-full px-8 py-3 text-sm tracking-wider">
            SUBSCRIBE
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

const SearchChanged = () => {
  const platforms = [
    { name: "ChatGPT", icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", desc: "Intelligent conversations that flow naturally." },
    { name: "Perplexity", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Perplexity_Logo.svg/2560px-Perplexity_Logo.svg.png", desc: "Real-time answers with source attribution." },
    { name: "Google AI", icon: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", desc: "Organizing information through neural lenses." }
  ];

  return (
    <section className="pt-52 md:pt-64 pb-20 px-8 md:px-28 bg-black font-sans">
      <motion.div {...fadeUp(0)} className="text-center mb-32">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-1px] mb-8 text-white">
          Search has <span className="font-serif italic font-normal">changed.</span> Have you?
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          The way we consume information is evolving. It's no longer just about the answer, but the depth of the inquiry and the quality of the thread.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-24 max-w-6xl mx-auto">
        {platforms.map((platform, i) => (
          <motion.div key={i} {...fadeUp(0.1 * i)} className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-10 opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center grayscale invert">
              <img src={platform.icon} alt={platform.name} className="w-full h-full object-contain" />
            </div>
            <h3 className="font-semibold text-base mb-3 text-white">{platform.name}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[200px] mx-auto">{platform.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.p {...fadeUp(0.4)} className="text-zinc-500 text-sm text-center uppercase tracking-[2px]">
        If you don't answer the questions, someone else will.
      </motion.p>
    </section>
  );
};

const Word = ({ word, range, scrollYProgress, isHighlighted }: { word: string, range: [number, number], scrollYProgress: any, isHighlighted?: boolean }) => {
  const opacity = useTransform(scrollYProgress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className={isHighlighted ? "text-white" : "text-zinc-500"}>
      {word}{" "}
    </motion.span>
  );
};

const Mission = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const words1 = "We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having.".split(" ");
  const words2 = "A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved.".split(" ");
  const highlightWords = ["curiosity", "meets", "clarity"];

  return (
    <section ref={targetRef} className="pt-0 pb-32 md:pb-44 px-8 md:px-28 bg-black font-sans">
      <div className="flex justify-center mb-32">
        <video autoPlay muted loop playsInline className="w-[800px] h-auto rounded-3xl grayscale brightness-75">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-tight">
          {words1.map((word, i) => (
            <Word key={i} word={word} range={[i / (words1.length + words2.length), (i + 1) / (words1.length + words2.length)]} scrollYProgress={scrollYProgress} isHighlighted={highlightWords.includes(word.toLowerCase().replace(/[—,.]/g, ''))} />
          ))}
        </div>
        <div className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed">
          {words2.map((word, i) => (
            <Word key={i} word={word} range={[(words1.length + i) / (words1.length + words2.length), (words1.length + i + 1) / (words1.length + words2.length)]} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Solution = () => {
  const features = [
    { title: "Curated Feed", desc: "A noise-free stream of content that actually matters to you." },
    { title: "Writer Tools", desc: "Everything you need to grow your reach and deepen connections." },
    { title: "Community", desc: "Meaningful interactions with a community of shared interests." },
    { title: "Distribution", desc: "Multi-channel presence without the headache of fragmentation." }
  ];

  return (
    <section className="py-32 md:py-44 border-t border-zinc-800 px-8 md:px-28 bg-black font-sans">
      <div className="max-w-6xl mx-auto">
        <motion.span {...fadeUp(0)} className="text-xs tracking-[3px] uppercase text-zinc-500 block mb-6">SOLUTION</motion.span>
        <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-6xl font-medium mb-20 leading-tight text-white">
          The platform for <span className="font-serif italic font-normal">meaningful</span> content
        </motion.h2>

        <motion.div {...fadeUp(0.2)} className="mb-24">
          <video autoPlay muted loop playsInline className="w-full aspect-[3/1] object-cover rounded-2xl grayscale brightness-50">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4" type="video/mp4" />
          </video>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-12">
          {features.map((feature, i) => (
            <motion.div key={i} {...fadeUp(0.3 + i * 0.1)}>
              <h3 className="font-semibold text-base mb-3 text-white">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const hlsUrl = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }
  }, []);

  return (
    <section className="relative py-32 md:py-44 border-t border-zinc-800 overflow-hidden min-h-[600px] flex items-center justify-center text-center font-sans">
      <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 grayscale brightness-[0.2]" />
      <div className="absolute inset-0 bg-black/45 z-[1]" />
      <div className="relative z-10 px-8 flex flex-col items-center">
        <motion.div {...fadeUp(0)} className="relative w-10 h-10 flex items-center justify-center mb-10">
          <div className="absolute inset-0 border-2 border-white/60 rounded-full" />
          <div className="w-5 h-5 border border-white/60 rounded-full" />
        </motion.div>
        <motion.h2 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-medium mb-6 text-white">
          Start Your <span className="font-serif italic font-normal">Journey</span>
        </motion.h2>
        <motion.p {...fadeUp(0.2)} className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
          Join thousands of readers and writers who have found their home for depth and direction.
        </motion.p>
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-black font-bold rounded-lg px-10 py-4 text-sm tracking-wider hover:opacity-90 transition-opacity">SUBSCRIBE NOW</button>
          <button className="ml-liquid-glass border border-white/10 text-white font-bold rounded-lg px-10 py-4 text-sm tracking-wider hover:bg-white/5 transition-colors">START WRITING</button>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-8 md:px-28 border-t border-zinc-900 bg-black font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-zinc-500 text-sm font-light">© 2026 Uilora. All rights reserved.</p>
        <div className="flex items-center gap-8">
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a key={link} href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">{link}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export const UiloraMindloop = ({ className }: { className?: string }) => {
  return (
    <div className={`min-h-screen bg-black text-white selection:bg-white selection:text-black ${className}`}>
      <MindloopStyles />
      <Navbar />
      <Hero />
      <SearchChanged />
      <Mission />
      <Solution />
      <CTA />
      <Footer />
    </div>
  );
}

export default UiloraMindloop;
