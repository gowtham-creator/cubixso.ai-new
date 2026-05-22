# Coding Conventions

**Analysis Date:** 2026-05-23

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `Hero.tsx`, `WordReveal.tsx`, `Services.tsx`)
- Utilities/helpers: camelCase (e.g., `cn.ts`, `gsap.ts`)
- Shaders: camelCase with domain prefix (e.g., `hero.ts` for hero gradient mesh)
- Data files: camelCase (e.g., `data.ts`)
- API routes: lowercase with hyphens in `app/api/` (e.g., `route.ts`)

**Functions:**
- PascalCase for React components (exported as named exports, no default exports except in sections)
- camelCase for utility functions and helpers
- Variants/motion objects: camelCase (e.g., `fadeUp`, `reveal`, `parent`, `child`)

**Variables:**
- camelCase for all variables and constants
- SCREAMING_SNAKE_CASE for immutable config arrays with `as const` suffix (e.g., `export const SERVICES = [...] as const`)

**Types:**
- PascalCase for interfaces and types (e.g., `WordRevealProps`)
- Props interfaces suffix with `Props` (e.g., `WordRevealProps`)

## Code Style

**Formatting:**
- No `.prettierrc` or `.prettierrc.json` file detected — relying on ESLint default behavior
- Semicolons: Present in some files, absent in others (mixed style observed in `src/components/ui/button.tsx`)
- Indentation: 2 spaces (observed consistently)
- Line endings: LF

**Linting:**
- ESLint 9.x via `eslint.config.mjs` (flat config format)
- Config extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run: `npm run lint`
- No custom rule overrides detected; relying on Next.js defaults

## Import Organization

**Order:**
1. React/Next.js framework imports
2. Third-party libraries (framer-motion, three.js, gsap, etc.)
3. Local component imports (`@/components/...`)
4. Local utility imports (`@/lib/...`)
5. Type imports (`import type { ... }`)

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)
- All internal imports use `@/` prefix (mandatory pattern observed across codebase)

**Example from `src/components/sections/Hero.tsx`:**
```typescript
import { motion } from "framer-motion";
import { HeroCanvas } from "@/components/canvas/HeroCanvas";
import { WordReveal } from "@/components/motion/WordReveal";
import { Magnetic } from "@/components/motion/Magnetic";
```

## "use client" Directive

**Pattern:** All interactive components and components using React hooks/Framer Motion bear the `"use client"` pragma at the top of the file (before any imports).

**Examples:**
- `src/components/sections/Hero.tsx` — Line 1
- `src/components/motion/WordReveal.tsx` — Line 1
- `src/components/sections/Services.tsx` — Line 1

**When to use:**
- Any component using Framer Motion (`motion.*`)
- Any component with React hooks (useState, useEffect, etc.)
- Any client-side interactivity (mouse tracking, scroll listeners, etc.)

## TypeScript Strict Mode

**Configuration:** `tsconfig.json` has `"strict": true` enabled.

**Observed patterns:**
- Type annotations on function parameters and return types (not always explicit, relies on inference where safe)
- Interface definitions for component props (e.g., `WordRevealProps`, `ServiceIconProps`)
- `type` keyword for union types and complex types
- `interface` keyword for component prop contracts

## Tailwind v4 CSS-Variable Syntax

**Pattern:** Arbitrary value syntax using CSS custom properties:
- `text-(--color-fg)` for foreground text
- `bg-(--color-bg)` for background
- `border-(--color-line-2)` for borders
- `text-(--color-muted)` for muted text
- `text-(--color-accent-2)` for accent text

**Why:** Enables dynamic theming via CSS variables without utility class generation.

**Examples from `src/components/sections/Hero.tsx`:**
```tsx
<span className="mono text-(--color-fg)">CUBIXSO.AI</span>
<div className="hidden md:flex items-center gap-3 mono text-(--color-muted)">
<a className="mono inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--color-line-2) bg-black/40">
```

**Font family handling:**
- Font files imported from Next/font: `Inter`, `Instrument_Serif`, `JetBrains_Mono`
- Fonts registered as CSS variables: `--font-inter`, `--font-instrument`, `--font-jetbrains`
- Applied to `:root` via `variable` property in `src/app/layout.tsx`
- Used in global CSS with `font-[family:var(--font-name)]` or via Tailwind font-family classes

## Motion Variants Pattern

**Framer Motion block structure:**

```typescript
const variantName = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: (custom?: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: custom, ease: [0.16, 1, 0.3, 1] as const },
  }),
};
```

**Applied to motion components:**
```typescript
<motion.header
  variants={fadeUp}
  custom={0.1}
  initial="hidden"
  animate="show"
>
```

**Scroll-triggered variant pattern:**
```typescript
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});
```

**Easing:** Consistently uses custom cubic-bezier `[0.16, 1, 0.3, 1]` as const for smooth kinetic feel.

**Durations:** Typically 0.8–1.0s for entrance animations; 5.5s for infinite loop animations (e.g., background shimmer).

## GLSL Shaders as Tagged Template Strings

**Pattern:** Shaders are authored as ES6 tagged template strings with `/* glsl */` comment prefix.

**Example from `src/shaders/hero.ts`:**
```typescript
export const heroVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const heroFrag = /* glsl */ `
  precision highp float;
  // ... shader code
`;
```

**Why:** Enables IDE syntax highlighting and static analysis without a build-time compiler.

## Section Component Pattern

**Structure:** Named export, default props, motion variants inline.

**Example from `src/components/sections/Hero.tsx`:**
```typescript
export function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* Content with motion variants */}
    </section>
  );
}
```

**Characteristics:**
- Function component with PascalCase name
- No default export
- Motion variants defined above the component (scoped to that component)
- Single responsibility: render one section of the page
- Use `<section id="...">` for anchor navigation (e.g., `id="services"`, `id="contact"`)

**Motion variant placement:**
- Define variant objects at module level (before component)
- Pass variant objects via props spread (e.g., `{...reveal(0.1)}`)
- Custom delays passed as `custom` prop

## Data Export Pattern

**Location:** `src/lib/data.ts`

**Pattern:** All static content exported as `const` with `as const` suffix for strict typing.

```typescript
export const SERVICES = [
  { name: "...", body: "..." },
  // ...
] as const;

export const PRODUCTS = [
  { code: "...", name: "...", tag: "...", body: "..." },
  // ...
] as const;

export const INDUSTRIES = [
  { name: "...", body: "..." },
  // ...
] as const;

export const STATS = [
  { num: "...", label: "..." },
  // ...
] as const;

export const CONTACT = {
  email: "...",
  phone1: "...",
  phone2: "...",
  location: "...",
} as const;
```

**Why:** Enables TypeScript to infer union types for each property, preventing string mistakes when consuming data.

## Utility Functions

**`cn()` helper (dual implementations):**
- Location: `src/lib/cn.ts` and `src/lib/utils.ts` (both exist and are functionally equivalent)
- Purpose: Merge and resolve Tailwind class conflicts
- Implementation: `clsx` + `tailwindMerge`

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:** Applied to className props to safely combine base classes with variant classes.

## Editorial Design Language Conventions

**Typography:**
- Serif italic accents for emphasis (e.g., `<em className="font-serif not-italic italic">for the</em>`)
- Mono class for system/telemetry labels (e.g., `className="mono text-(--color-muted)"`)
- Display font for headings (e.g., `className="font-display text-[length:var(--text-display-2xl)]"`)

**Color Palette:**
- CSS variables: `--color-fg` (foreground), `--color-bg` (background), `--color-muted`, `--color-accent-2`, `--color-signal`, `--color-line-2`
- Apple-clean: High contrast, minimal saturation, dark-themed
- Accent colors used sparingly for CTAs and interactive elements

**Motion Language:**
- Soft ease: `[0.16, 1, 0.3, 1]` cubic-bezier for human feel
- Stagger: 0.06s per child for word reveals
- Blur entrance: `filter: "blur(6px)"` → `blur(0px)` for soft focus effect
- Lift entrance: `y: 16` (px) or `y: 0.7em` (relative) for upward motion

## Comments

**Documentation:**
- JSDoc/TSDoc: Minimal usage observed; comments are inline and descriptive rather than formal
- Section headers: Use ASCII dividers for visual separation (e.g., `// ── Hero section ───────────`)
- Component intent: Always include a brief comment at the top explaining the component's purpose and any special patterns

**Example from `src/components/sections/Hero.tsx`:**
```typescript
// Hero — editorial composition for the landing screen.
// Backdrop: custom GLSL gradient-mesh shader (HeroCanvas) with bloom +
// chromatic aberration + film grain + vignette.
// Foreground: editorial grid with kinetic word-reveal typography and a
// magnetic CTA. Designed for Awwwards-tier first-impression.
```

## Module Design

**Exports:**
- Named exports for all components (no default exports)
- Utilities typically have single default export or named export
- Types exported alongside implementations

**Barrel Files:**
- Not observed in current structure; each component file is self-contained
- Import paths use full paths from `@/` (e.g., `@/components/sections/Hero.tsx`)

---

*Convention analysis: 2026-05-23*
