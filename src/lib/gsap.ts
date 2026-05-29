"use client";

// GSAP + ScrollTrigger client-only registration. Called once per module
// import in browser; safe to invoke multiple times (gsap dedupes plugins).
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
