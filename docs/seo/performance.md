# Cubixso.ai — Core Web Vitals / Performance Risk Assessment

Method: static code-heuristic analysis. Live URL fetch (PageSpeed Insights / CrUX)
was **not reachable** in this environment (network calls blocked by sandbox
policy) — no field or lab data available. Treat scores below as a **risk
estimate**, not a measured score. Re-run `scripts/pagespeed_check.py` and
`scripts/crux_history.py` against `https://cubixso.com` (canonical) once
credentials/network are available, and replace this estimate with real CrUX
28-day field data.

Stack confirmed from code: Next.js 16 App Router, all interactive chrome is
`"use client"`, `three@0.184`, `@react-three/fiber` + `@react-three/drei@10.7`,
`@react-three/postprocessing@3.0`, `framer-motion@12.40`, `gsap@3.15`,
`maplibre-gl@5.24`. Draco GLB (`cubixso-cube.glb`, 43KB) reused across 4+ scene
components.

## Estimated score: 35–50 / 100 (mobile), 55–70 (desktop) — needs field data to confirm

Likely **fail** on mobile INP and marginal on mobile LCP; CLS is well-controlled.

## Top 5 risks (prioritized)

1. **P0 — Hero LCP/INP: `HeroGlassCube` is statically imported (no `dynamic(ssr:false)`)** into `Hero.tsx`, the first homepage section. A full R3F `<Canvas>` + `EffectComposer` (Bloom + ChromaticAberration) + `Environment`/`Float` ships in the main bundle and hydrates immediately, directly competing with hero text/LCP paint and blocking the main thread during hydration — worst on mobile CPUs.
2. **P0 — `IntroSequence` preloader is in root `layout.tsx`, statically imported** (not code-split). Every first-time route load ships a full three.js Canvas + Bloom + GLB (Draco decode) before content is interactive. `sessionStorage` only skips the *animation*, not the JS payload.
3. **P1 — Duplicate/dead 3D code shipping risk**: `Preloader.tsx` (6000-particle engine) is unused (confirmed dead — `IntroSequence` is the live loader) but still lives in the tree; verify it's tree-shaken, not imported anywhere transitively. Also verify `VoidCube.tsx`/`Aurora.tsx` (also confirmed unreferenced/orphaned) are excluded from build output.
4. **P1 — INP on repeat interaction**: `SplineMascot`, `CubeScroller`, GSAP ScrollTrigger stacks, and `PresenceMap`/`OfficeMap` (maplibre) all run heavy per-frame work; `OfficeMap` and `PresenceMap` are correctly `dynamic(ssr:false)` — good — but confirm no long tasks >50ms during scroll-linked GSAP/R3F updates (multiple `useFrame` loops run concurrently once several sections mount).
5. **P2 — CLS/font**: `next/font/google` used correctly (Inter/Instrument Serif/JetBrains/Caveat, `display:"swap"`) — low FOIT/CLS risk. `next/image` used in only 7 components; confirm all above-the-fold images (Nav logo, Work cards) set explicit width/height and `priority` (already present in `Work.tsx`, `Nav.tsx` — good).

## Positive findings (already correct)
- `next.config.ts` sets 1-year immutable cache on `/models`, `/draco`, `/video`, fonts.
- `OfficeMap` / `PresenceMap` (maplibre) already lazy-loaded via `next/dynamic({ ssr:false })` with skeleton fallback.
- `hasWebGL()` / `CanvasBoundary` gate 3D so weak GPUs fall back gracefully (protects INP/crash risk, not LCP).
- `prefers-reduced-motion` honored across intro, hero cube, DotField.

## Fix priority
1. Wrap `HeroGlassCube` in `next/dynamic(() => import(...), { ssr:false, loading: <static hero fallback> })` so LCP text paints before WebGL initializes; render a static SVG/CSS placeholder cube as the LCP element instead.
2. Same treatment for `IntroSequence`'s Canvas — split the R3F/Bloom/GLTF chunk out of root layout so it lazy-loads after first paint (keep the DOM curtain/wordmark eager, defer only the 3D).
3. Delete confirmed-dead `Preloader.tsx`, `VoidCube.tsx`, `Aurora.tsx` if truly unused, or verify via bundle analyzer (`next build` + `@next/bundle-analyzer`) that they're excluded.
4. Add `<link rel="preconnect">`/`dns-prefetch` for any CDN (`cdn()` helper) origin serving GLB/Draco/fonts.
5. Run Lighthouse 13 + real CrUX once live to confirm mobile INP (long-task budget) given concurrent `useFrame` loops.
