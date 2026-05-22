# Codebase Structure

**Analysis Date:** 2026-05-23

## Directory Layout

```
/Users/gowthamreddy/cubixso/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, fonts, providers
│   │   ├── page.tsx                      # Home (teaser navigator)
│   │   ├── globals.css                   # Tailwind v4, design tokens, base layer
│   │   ├── services/
│   │   │   └── page.tsx                  # Services route
│   │   ├── products/
│   │   │   └── page.tsx                  # Products route
│   │   ├── industries/
│   │   │   └── page.tsx                  # Industries route
│   │   ├── about/
│   │   │   └── page.tsx                  # About route
│   │   ├── contact/
│   │   │   └── page.tsx                  # Contact route
│   │   └── api/
│   │       └── notify/
│   │           └── route.ts              # POST /api/notify (contact form endpoint)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Nav.tsx                   # Global navigation
│   │   ├── sections/
│   │   │   ├── Hero.tsx                  # Hero section with shader backdrop
│   │   │   ├── Services.tsx              # Services/Chapter 001
│   │   │   ├── Work.tsx                  # Products/Chapter 002 with 3D preview
│   │   │   ├── Industries.tsx            # Industries/Chapter 003
│   │   │   ├── About.tsx                 # About section
│   │   │   └── Contact.tsx               # Contact form section
│   │   ├── motion/
│   │   │   ├── WordReveal.tsx            # Word-by-word reveal animation
│   │   │   └── Magnetic.tsx              # Cursor-following magnetic effect
│   │   ├── canvas/
│   │   │   ├── HeroCanvas.tsx            # Fixed Three.js canvas backdrop
│   │   │   ├── HeroPlane.tsx             # Hero gradient mesh shader
│   │   │   └── WorkPreview.tsx           # Sticky 3D product preview
│   │   ├── providers/
│   │   │   └── SmoothScroll.tsx          # Lenis provider & useLenis hook
│   │   └── ui/
│   │       ├── button.tsx                # shadcn button
│   │       └── skiper-ui/
│   │           └── skiper40.tsx          # Custom skiper UI component
│   ├── lib/
│   │   ├── data.ts                       # Content data: SERVICES, PRODUCTS, INDUSTRIES, STATS, CONTACT
│   │   ├── gsap.ts                       # GSAP + ScrollTrigger registration (client-only)
│   │   ├── cn.ts                         # clsx + tailwind-merge utility
│   │   └── utils.ts                      # General utilities
│   └── shaders/
│       └── hero.ts                       # GLSL shader code for gradient mesh
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .planning/
│   └── codebase/
│       ├── ARCHITECTURE.md               # Architecture patterns & layers
│       └── STRUCTURE.md                  # This file
├── components.json                       # shadcn config (aliases, registries)
├── tsconfig.json                         # TypeScript config with path aliases
├── tailwind.config.ts                    # Tailwind v4 config (auto-imported)
├── postcss.config.mjs                    # PostCSS (tailwind)
├── eslint.config.mjs                     # ESLint config
├── next.config.ts                        # Next.js config
├── package.json                          # Dependencies & scripts
└── CLAUDE.md                             # Project instructions (context-mode)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router routes and layout hierarchy
- Contains: Route page components, API endpoints, root layout, global CSS
- Key files: `layout.tsx` (fonts, providers, metadata), `page.tsx` (home), `globals.css` (design tokens)

**`src/app/{services,products,industries,about,contact}/`:**
- Purpose: Dedicated pages for each chapter; each has a single page.tsx
- Contains: Metadata export, one section component import
- Pattern: Each is a server component that renders its corresponding section

**`src/app/api/notify/`:**
- Purpose: Server-side POST endpoint for contact form
- Contains: Form validation, Resend stub
- Future: Wire Resend API key to enable email sending

**`src/components/`:**
- Purpose: Reusable React components (sections, layout, motion, canvas, UI)
- Contains: All component tree below src
- Naming: PascalCase filenames, export as named or default

**`src/components/layout/`:**
- Purpose: Global chrome, navigation
- Contains: Nav.tsx (header/navigation bar)
- Used by: Root layout

**`src/components/sections/`:**
- Purpose: Full-viewport editorial sections composed into pages
- Contains: Hero, Services, Work, Industries, About, Contact
- Pattern: Each is `"use client"`, uses Framer Motion, imports data from `src/lib/data.ts`
- Naming: PascalCase, matches chapter name (e.g., Services, Work for Products chapter)

**`src/components/motion/`:**
- Purpose: Reusable motion primitives and animation utilities
- Contains: WordReveal (staggered word animation), Magnetic (cursor-following)
- Pattern: Small, composable, wrapped with Framer Motion
- Used by: Section components

**`src/components/canvas/`:**
- Purpose: Three.js/R3F components for 3D rendering
- Contains: HeroCanvas (fixed backdrop), HeroPlane (gradient mesh), WorkPreview (sticky preview)
- Pattern: All `"use client"`, use React Three Fiber, subscribe to scroll/hover props
- Used by: Hero and Work sections

**`src/components/providers/`:**
- Purpose: Context providers wrapping app at root
- Contains: SmoothScroll (Lenis provider)
- Exported: `useLenis` hook for descendants to access Lenis instance
- Used by: Root layout as wrapper

**`src/components/ui/`:**
- Purpose: Primitive UI components (buttons, inputs, etc.), mostly from shadcn
- Contains: button.tsx, skiper-ui/ subdirectory for custom component registry
- Used by: Sections and other high-level components

**`src/lib/`:**
- Purpose: Utilities, data, and configuration
- Contains:
  - `data.ts` — content arrays (SERVICES, PRODUCTS, INDUSTRIES, WHY, STATS, CONTACT)
  - `gsap.ts` — GSAP plugin registration
  - `cn.ts` — classname merging utility
  - `utils.ts` — general helpers

**`src/shaders/`:**
- Purpose: GLSL shader code
- Contains: `hero.ts` (vertex/fragment strings for gradient mesh)
- Pattern: String exports, imported by canvas components

**`public/`:**
- Purpose: Static assets served as-is
- Contains: SVG icons (from Next.js template), ready for replacement with Cubixso assets
- Committed: Yes
- Generated: No

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, global CSS import, provider wrapping, Font setup, metadata, Nav component
- `src/app/page.tsx`: Home route, teaser cards, final CTA
- `src/app/{route}/page.tsx`: Dedicated chapter pages (services, products, industries, about, contact)
- `src/app/api/notify/route.ts`: POST endpoint for contact submissions

**Configuration:**
- `tsconfig.json`: TypeScript paths and compiler options
- `tailwind.config.ts`: Tailwind setup (auto-imported by PostCSS)
- `components.json`: shadcn config, path aliases, icon library (lucide)
- `next.config.ts`: Next.js settings
- `postcss.config.mjs`: PostCSS (runs Tailwind)
- `eslint.config.mjs`: Linting rules

**Core Logic:**
- `src/lib/data.ts`: Content source of truth for sections
- `src/components/sections/*.tsx`: Editorial sections (Hero, Services, Work, Industries, About, Contact)
- `src/components/canvas/HeroCanvas.tsx`: Fixed 3D backdrop initialization
- `src/components/providers/SmoothScroll.tsx`: Lenis smooth scroll setup

**Styling:**
- `src/app/globals.css`: Tailwind v4 with @theme tokens, base layer, Lenis hooks, typography utilities

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Hero.tsx`, `WordReveal.tsx`, `HeroCanvas.tsx`)
- Routes: kebab-case directories (e.g., `/services`, `/api/notify`)
- Utilities: camelCase (e.g., `cn.ts`, `gsap.ts`, `utils.ts`)
- Data: UPPERCASE_SNAKE_CASE for const arrays (e.g., `SERVICES`, `PRODUCTS`, `INDUSTRIES`)
- Shaders: kebab-case or camelCase (e.g., `hero.ts`)

**Directories:**
- Components: PascalCase top-level category (e.g., `sections`, `canvas`, `motion`, `layout`, `ui`, `providers`)
- Sub-organization: Flat (no deep nesting); group by function, not by app structure

**Functions & Variables:**
- Components: PascalCase (React convention)
- Hooks: camelCase, prefix with `use` (e.g., `useLenis`)
- Utility functions: camelCase (e.g., `cn()`, `gsap`, `ScrollTrigger`)
- Constants: UPPERCASE_SNAKE_CASE (e.g., `PRODUCTS`, `SERVICES`) or camelCase if not exported at module level

**Types:**
- Interfaces: PascalCase, prefixed with `I` if needed (e.g., `NotifyPayload`)
- Props: `${ComponentName}Props` (e.g., `WordRevealProps`, `MagneticProps`)

**CSS Classes:**
- Utility-first Tailwind (no custom classes except .mono, .hairline-grid, .grain)
- Custom utilities: lowercase, hyphenated (e.g., `.mono`, `.hairline-grid`)
- Design tokens: CSS variables with `--color-`, `--font-`, `--text-`, `--ease-` prefixes

## Where to Add New Code

**New Page/Route:**
- Create directory: `src/app/{route-name}/`
- Create file: `src/app/{route-name}/page.tsx`
- Export: Metadata and default component (RSC by default)
- Import section: `import { SectionName } from "@/components/sections/SectionName"`
- Add section if needed: `src/components/sections/SectionName.tsx`

**New Section Component:**
- Location: `src/components/sections/NewSection.tsx`
- Pattern: Export default or named, add `"use client"` pragma if using hooks/events
- Import data: `import { DATA_ARRAY } from "@/lib/data"`
- Import motion: `import { WordReveal, Magnetic } from "@/components/motion"`
- Wrap with Framer Motion variants, responsive grid layout

**New Motion Primitive:**
- Location: `src/components/motion/NewPrimitive.tsx`
- Pattern: Export as named function, add `"use client"` pragma
- Use Framer Motion (motion.div, Variants, useMotionValue, useSpring)
- Accept className, children, and animation config props

**New Canvas Component:**
- Location: `src/components/canvas/NewCanvas.tsx`
- Pattern: Export as named function, add `"use client"` pragma
- Wrap content in `<Canvas>` from `@react-three/fiber`
- Add EffectComposer for postprocessing if needed
- Use orthographic camera by default (matches hero setup)

**New 3D Primitive (Mesh/Geometry):**
- Location: `src/components/canvas/NewPrimitive.tsx`
- Pattern: Export as named function (no "use client" needed; called inside Canvas)
- Accept props for uniforms/state (e.g., scroll, index)
- Use useFrame hook to update on every frame
- Define GLSL shaders in `src/shaders/` and import

**New Shader:**
- Location: `src/shaders/newshader.ts`
- Pattern: Export vertex and fragment strings as constants
- Include comments explaining uniforms and varyings
- Import in canvas component and pass to ShaderMaterial

**New Data Entry:**
- Location: `src/lib/data.ts`
- Pattern: Add new const array following existing structure
- Export for use in sections
- No async/API calls; static data only

**New Utility:**
- Location: `src/lib/newutil.ts` (if general) or inline in component
- Pattern: Export as named function, keep focused
- Examples: Formatters, validators, math helpers

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase documentation (ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, etc.)
- Generated: Yes (by GSD map-codebase agent)
- Committed: Yes (part of .gitignore exclusion for .planning/* is NOT present; these ARE committed)

**`node_modules/`:**
- Purpose: Installed dependencies (npm packages)
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**`.next/`:**
- Purpose: Next.js build cache and output
- Generated: Yes (by `npm run build` or dev server)
- Committed: No (in .gitignore)

**`public/`:**
- Purpose: Static assets served as-is by Next.js
- Generated: No (manually added)
- Committed: Yes
- Strategy: Keep minimal; SVGs for icons, images for OG/sharing

## Import Path Aliases

Defined in `tsconfig.json` and `components.json`:

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks` (not yet used; ready for custom hooks)
- `@/ui` → `src/components/ui`

Use these in all imports for consistency and ease of refactoring.

---

*Structure analysis: 2026-05-23*
