# Architecture

**Analysis Date:** 2026-05-23

## Pattern Overview

**Overall:** Next.js 15 App Router + Section Composition with Fixed 3D Canvas Layer

**Key Characteristics:**
- Server Components (RSC) as default for content pages; Client Components (`"use client"`) only where interactivity or browser APIs needed
- Single fixed Three.js canvas backdrop (HeroCanvas) behind all content
- Modular section components (Hero, Services, Products, Industries, About, Contact) composed into page routes
- Lifted state pattern: `Work.tsx` uses `useState` to manage hover state shared with `WorkPreview` 3D component
- Three motion layers coexist: Framer Motion (page enter/exit, scroll reveal), GSAP + ScrollTrigger (registered but available for advanced scroll pinning), Lenis (smooth scrolling with easing)
- Props-down data flow: `SERVICES`, `PRODUCTS`, `INDUSTRIES` consumed from `src/lib/data.ts`
- No global state management; local component state or URL-based routing for navigation

## Layers

**Providers (Root Layout):**
- Purpose: Wrap entire app with Lenis smooth scroll and global context
- Location: `src/components/providers/SmoothScroll.tsx`
- Contains: Lenis initialization, RAF ticker, context export (`useLenis`)
- Depends on: `lenis` npm package
- Used by: `src/app/layout.tsx` (root wrapper)

**Layout (Navigation & Structure):**
- Purpose: Global navigation, visual chrome, per-route wrappers
- Location: `src/components/layout/Nav.tsx`, `src/app/layout.tsx`
- Contains: Nav component (rendered once in root), font setup, metadata
- Depends on: Next.js metadata API, Google Fonts
- Used by: All pages via root layout

**Pages (Routes):**
- Purpose: Entry points for each URL segment; set metadata, wrap section components
- Location: `src/app/page.tsx`, `src/app/services/page.tsx`, `src/app/products/page.tsx`, `src/app/industries/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`
- Contains: Metadata export, one section component per route, minimal wrapper markup
- Depends on: Section components
- Used by: Next.js App Router

**Sections (Content Components):**
- Purpose: Render full-screen or viewport-height editorial content with motion
- Location: `src/components/sections/` (Hero, Services, Work, Industries, About, Contact)
- Contains: Framer Motion animations, grid layouts, typography, CTAs, card lists
- Depends on: Motion primitives (WordReveal, Magnetic), canvas components (WorkPreview), data layer (PRODUCTS, SERVICES, etc.)
- Used by: Pages

**Motion Primitives:**
- Purpose: Reusable animation utilities (word-by-word reveal, magnetic cursor follow)
- Location: `src/components/motion/WordReveal.tsx`, `src/components/motion/Magnetic.tsx`
- Contains: Framer Motion composition with custom variants and easing
- Depends on: `framer-motion`
- Used by: Section components (Hero, Work, Services, etc.)

**Canvas Layer (3D):**
- Purpose: Render Three.js backgrounds and 3D previews
- Location: `src/components/canvas/HeroCanvas.tsx`, `src/components/canvas/HeroPlane.tsx`, `src/components/canvas/WorkPreview.tsx`
- Contains: React Three Fiber (R3F) Canvas, GLSL shaders, postprocessing, scroll tracking
- Depends on: `react-three/fiber`, `react-three/postprocessing`, `three`
- Used by: Hero section (fixed backdrop), Work section (sticky preview)

**UI Components:**
- Purpose: Reusable primitive buttons, inputs, accessible components
- Location: `src/components/ui/` (button.tsx, skiper40.tsx)
- Contains: shadcn/ui presets, custom variants
- Depends on: `tailwindcss`
- Used by: Section components

**Data Layer:**
- Purpose: Single source of truth for content (services, products, industries, contact info)
- Location: `src/lib/data.ts`
- Contains: Exported const arrays (SERVICES, PRODUCTS, INDUSTRIES, WHY, STATS, CONTACT)
- Depends on: Nothing; no external calls
- Used by: Section components via import

**Utilities & Configuration:**
- Purpose: Shared helpers, GSAP setup, CSS classname merging
- Location: `src/lib/cn.ts` (clsx+tailwind merge), `src/lib/gsap.ts` (GSAP + ScrollTrigger registration), `src/lib/utils.ts`
- Contains: Small utility functions
- Depends on: `gsap`, `clsx`, `tailwind-merge`
- Used by: Components

**Shaders:**
- Purpose: GLSL shader code for custom 3D effects
- Location: `src/shaders/hero.ts`
- Contains: Vertex/fragment shader strings, uniform definitions
- Depends on: Nothing; plain string exports
- Used by: HeroPlane component

**API Routes:**
- Purpose: Server-side endpoints for external integrations
- Location: `src/app/api/notify/route.ts`
- Contains: POST handler for contact form submissions; currently stubs Resend email sending
- Depends on: Next.js routing, future Resend integration
- Used by: Contact form components (client-side fetch)

## Data Flow

**Page Load:**

1. Next.js renders root layout → mounts SmoothScroll provider → Lenis initializes, begins RAF ticker
2. Nav component renders globally (once)
3. Route page renders → imports section component → section component renders with data from `src/lib/data.ts`
4. HeroCanvas mounts once in background (fixed positioning, z-0)
5. All content renders above (z-10)
6. Scroll events fire → Lenis updates → HeroCanvas scroll prop updates → shader uniforms animate

**Hover Interaction (e.g., Work section):**

1. User hovers over product card in Work.tsx
2. Card's `onMouseEnter` calls `setHovered(index)` (local useState)
3. Work.tsx re-renders with new `hovered` state
4. Both the card styling AND WorkPreview component receive updated `index` prop
5. WorkPreview switches 3D preview to match the hovered product
6. Motion changes are spring-smoothed by Framer Motion or Three.js frame loop

**State Management:**

- No Redux, Zustand, or Context for app state
- Local component state (useState) for interactive elements (hovered items, form inputs)
- URL-based navigation for routing
- Server-side rendering preferred; client rendering only where necessary (Canvas, animations)

## Key Abstractions

**Section:**
- Purpose: Represents a chapter of content (Hero, Services, Products, Industries, About, Contact)
- Examples: `src/components/sections/Hero.tsx`, `src/components/sections/Work.tsx`, `src/components/sections/Services.tsx`
- Pattern: Named export function, `"use client"` pragma, Framer Motion `motion` elements, responsive grid layout, internal state for interactions

**Motion Variant:**
- Purpose: Reusable Framer Motion animation config (enter/exit, stagger, easing)
- Examples: `fadeUp` object in Hero.tsx, child/parent variants in WordReveal.tsx
- Pattern: Object with `hidden`, `show` keys; custom easing array `[0.16, 1, 0.3, 1]` applied consistently

**Canvas Component:**
- Purpose: Wraps R3F Canvas with scene setup, materials, postprocessing
- Examples: HeroCanvas (fixed bg), WorkPreview (sticky 3D preview)
- Pattern: `"use client"`, useEffect for scroll/interaction tracking, Canvas element with orthographic camera, EffectComposer for postprocessing

**3D Primitive:**
- Purpose: Single mesh/geometry rendered inside Canvas (e.g., HeroPlane with gradient shader)
- Examples: `src/components/canvas/HeroPlane.tsx`, `src/components/canvas/WorkPreview.tsx`
- Pattern: Takes props from parent (scroll, index), uses them as Three.js uniform values, updates via useFrame or on prop change

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: App startup (every request)
- Responsibilities: HTML shell, font imports, global CSS, provider wrapping, metadata, Nav component

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Render Hero section, teaser cards (navigating to /services, /products, /industries, /about), final CTA to /contact

**Route Pages:**
- Location: `src/app/{services,products,industries,about,contact}/page.tsx`
- Triggers: GET `/{route}`
- Responsibilities: Set page-specific metadata, render the corresponding section component (Services, Work/Products, Industries, About, Contact)

**API Endpoint:**
- Location: `src/app/api/notify/route.ts`
- Triggers: POST `/api/notify` (from Contact form)
- Responsibilities: Parse JSON payload, validate email, log to console, stub Resend integration

## Error Handling

**Strategy:** Minimal explicit error handling currently; relies on React error boundaries and Next.js error.tsx fallback pages (not yet created)

**Patterns:**
- API route: `try/catch` wrapping JSON parse and Resend call; returns 400 with error message if validation fails or exception occurs
- Components: No explicit error states; Framer Motion gracefully degrades if animation library unavailable
- Canvas: R3F gracefully falls back if WebGL unavailable (shows blank canvas, no runtime error)

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.log` and `console.error` only; outputs visible in server logs (Vercel CLI or dashboard)
- Used in: `src/app/api/notify/route.ts` to log contact submissions

**Validation:**
- Approach: Client-side (form HTML5 required, pattern), server-side (email presence check in /api/notify)
- No schema validation library; minimal checks to unblock MVP

**Authentication:**
- Approach: None; public site
- Future: Can be added to admin routes if needed (e.g., `/admin`, `/api/admin/*`)

**CSS Architecture:**
- Approach: Tailwind v4 with CSS variables (@theme), Lenis-specific utility classes
- Global tokens in `src/app/globals.css`: colors (--color-bg, --color-fg, etc.), typography (--font-sans, --font-display, --font-serif, --font-mono), spacing (--pad-x, --col-w), easing (--ease-out-expo, --ease-spring)
- Component styles: inline Tailwind classes, no separate CSS files except globals.css

---

*Architecture analysis: 2026-05-23*
