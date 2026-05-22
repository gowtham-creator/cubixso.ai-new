# Technology Stack

**Analysis Date:** 2026-05-23

## Languages

**Primary:**
- TypeScript 5 - Full application codebase, strict mode enabled
- JavaScript (ESM) - Configuration files (next.config.ts, postcss.config.mjs, eslint.config.mjs)

**Secondary:**
- JSX/TSX - React components throughout `src/components/` and `src/app/`
- CSS (Tailwind v4 directives with @theme/@layer) - `src/app/globals.css`

## Runtime

**Environment:**
- Node.js 20+ (required for Next.js 16.2.6 and ES2017 target compilation)

**Package Manager:**
- npm 10+ (using npm lockfile at `package-lock.json` - present and committed)

## Frameworks

**Core:**
- **Next.js** 16.2.6 - Full-stack React framework with App Router
  - Config: `next.config.ts`
  - Build tool: Turbopack (default bundler for Next.js 16)
  - Deployment target: Vercel (not yet wired)

**UI & Rendering:**
- **React** 19.2.4 - Component library
- **React DOM** 19.2.4 - DOM rendering
- **Three.js** 0.184.0 - 3D graphics library

**3D & Motion Stack:**
- **@react-three/fiber** 9.6.1 - React renderer for Three.js
- **@react-three/drei** 10.7.7 - Useful Three.js helpers (cameras, lights, meshes)
- **@react-three/postprocessing** 3.0.4 - Post-processing effects for Three.js
- **@react-three/rapier** 2.2.0 - Physics engine integration (rigid bodies, constraints)
- **@react-spring/three** 10.1.0 - React Spring physics-based animation for 3D
- **Framer Motion** 12.40.0 - DOM animation and scroll-triggered effects
- **GSAP** 3.15.0 - Professional animation library
- **@gsap/react** 2.1.2 - React wrapper for GSAP with useGSAP hook
- **Lenis** 1.3.23 - Smooth scroll library with momentum physics

**Component Library:**
- **shadcn/ui** 4.8.0 - Headless UI component system (base-nova style)
  - Icon library: Lucide React 1.16.0
  - Config: `components.json` with aliases for `@/components`, `@/lib`, `@/hooks`, `@/ui`

**Styling & Design System:**
- **Tailwind CSS** 4 - Utility-first CSS framework
  - PostCSS plugin: @tailwindcss/postcss 4
  - Extended with Tailwind v4 @theme directive and custom design tokens in `globals.css`
  - Dark mode support via `@custom-variant`
- **tw-animate-css** 1.4.0 - Tailwind animation utilities
- **tailwind-merge** 3.6.0 - Utility class conflict resolver
- **class-variance-authority** 0.7.1 - Type-safe component variant system (used in shadcn/ui)
- **clsx** 2.1.1 - Conditional classname utility

**Base UI:**
- **@base-ui/react** 1.5.0 - Unstyled component primitives (headless UI foundation)

## Typography (Server-Side via Next/font)

**Google Fonts (zero-layout-shift strategy):**
- **Inter** - Display and body text (SF Pro adjacent stack)
  - CSS variable: `--font-inter`
  - Subsets: latin
  - Display: swap
  - Weight ramp: 300–600 (full SF-style hierarchy)
  
- **Instrument Serif** - Editorial italic accents
  - CSS variable: `--font-instrument`
  - Weight: 400
  - Styles: normal, italic
  - Display: swap

- **JetBrains Mono** - Telemetry/labels/monospace
  - CSS variable: `--font-jetbrains`
  - Display: swap

**Imported in:** `src/app/layout.tsx` with Next/font Google integration

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Strict mode enabled, ES2017 target, path aliases (@/* → ./src/*)

**Build & Dev:**
- `next.config.ts` - Next.js 16 config (currently minimal)
- `postcss.config.mjs` - PostCSS v4 @tailwindcss/postcss plugin

**Linting & Format:**
- `eslint.config.mjs` - ESLint 9 flat config extending Next.js core-web-vitals and TypeScript rules
  - Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**Component Registry:**
- `components.json` - shadcn/ui CLI config
  - Style: base-nova
  - CSS location: `src/app/globals.css`
  - Aliases: `components`, `utils`, `ui`, `lib`, `hooks`

**Assets & Public:**
- `public/` - Static assets (images, fonts if not Next/font)
- Font delivery: Next/font (no local @font-face needed)

## Dev Dependencies

- **@types/node** 20 - Node.js type definitions
- **@types/react** 19 - React type definitions
- **@types/react-dom** 19 - React DOM type definitions
- **@types/three** 0.184.1 - Three.js type definitions
- **TypeScript** 5 - TypeScript compiler
- **ESLint** 9 - Linting (flat config)
- **eslint-config-next** 16.2.6 - Next.js ESLint preset

## Build Output

**Build Command:** `next build`

**Output Location:** `.next/` directory (not committed)

**Production Start:** `next start` (requires built `.next` artifacts)

**Dev Server:** `next dev` (Turbopack-powered, hot reload)

## Asset Pipeline

**Images & Static:**
- Next.js Image optimization for `<Image>` components
- SVG support (inline via components or static files)

**Fonts:**
- Google Fonts injected at build time via Next/font (zero-layout-shift)
- CSS variables set in `src/app/layout.tsx` and referenced in `globals.css`

**3D Assets:**
- Three.js shaders in `src/shaders/` (e.g., `hero.ts`)
- GLTF/GLB models (if used) would be in `public/`

## Deployment

**Target Platform:** Vercel (Next.js native, not yet configured)

**Environment Variables:** Via Vercel dashboard (planned: RESEND_API_KEY when email integration is wired)

**Build Output:** Standalone Next.js application

---

*Stack analysis: 2026-05-23*
