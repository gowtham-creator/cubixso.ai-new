# Codebase Concerns

**Analysis Date:** 2026-05-23

## Tech Debt

### Duplicate `cn()` Utility Function

**Severity:** Medium

**Issue:** Two identical `cn()` functions exported from separate modules create confusion and inconsistent import paths across the codebase.
- `src/lib/cn.ts` — Custom implementation
- `src/lib/utils.ts` — Duplicate implementation
- **Current state:** Sections use `@/lib/cn`, shadcn components use `@/lib/utils`

**Files:** 
- `src/lib/cn.ts`
- `src/lib/utils.ts`

**Impact:** 
- Maintenance burden when either function needs updating (risk of divergence)
- Inconsistent import patterns make onboarding harder
- Tooling ambiguity (which one is "canonical"?)

**Fix approach:** 
1. Delete `src/lib/utils.ts`
2. Update all imports to use `@/lib/cn` exclusively
3. Verify shadcn components still resolve correctly (they use `@/lib/utils` by default, so create a re-export or update generated component paths)

**Time estimate:** 30 minutes

---

### Shadcn Token Pollution & Light-Mode Default Rendering

**Severity:** High

**Issue:** `src/app/globals.css` contains three overlapping token systems that can cause decorative components to render with wrong colors:

1. **Custom @theme block** (lines 8–38) — dark-first palette (`--color-bg: #000000`, etc.)
2. **Shadcn @theme inline** (lines 111–152) — shadcn system tokens mapped to CSS variables
3. **shadcn :root + .dark** (lines 154–221) — light oklch palette in `:root`, dark overrides in `.dark`

**Current behavior:**
- `bg-background text-foreground` in body uses custom dark palette (lines 54–55)
- Mitigation: `@apply` lines removed from `body` and `*` selectors
- **Risk:** Adding any new shadcn component (e.g., `<Button>`) that uses `bg-background` will render light-mode colors by default

**Files:** `src/app/globals.css` (lines 1–221)

**Impact:** 
- Visual bugs when new shadcn components introduced
- Fragile CSS cascade — easy to accidentally activate light palette
- Confusing for team members unfamiliar with the workaround

**Fix approach:**
1. Remove shadcn's `:root { --background: oklch(1 0 0) }` block entirely (lines 154–187)
2. OR: Modify `.dark` class to apply globally at runtime (e.g., `html.dark { --background: ... }`)
3. Test all shadcn components after change
4. Document the decision: custom dark palette wins, shadcn tokens are "bridge only"

**Time estimate:** 1–2 hours (includes testing all components)

---

### Unused Dependency: `@react-three/rapier`

**Severity:** Low

**Issue:** `@react-three/rapier` v2.2.0 installed in `package.json` but never imported or used anywhere in the codebase.

**Files:** 
- `package.json` (line 18)
- Zero usage in `src/`

**Impact:** 
- Increases bundle size (~150 KB minified)
- Dead code in vendor bundle
- Creates false impression that physics simulations are available

**Fix approach:**
1. Remove from `package.json`: `npm uninstall @react-three/rapier`
2. Re-verify build works
3. Re-add only when a physics scene is actually implemented

**Time estimate:** 5 minutes

---

## Known Limitations

### Email Integration Stubbed (Resend Not Wired)

**Severity:** Medium

**Issue:** The contact form API endpoint exists but does not send emails. It only logs to server console.

**Files:** `src/app/api/notify/route.ts` (lines 14–26)

**Current behavior:**
```typescript
async function sendEmail(_payload: NotifyPayload) {
  // TODO: wire Resend
  return { ok: true };  // ← Always succeeds without sending
}
```

**Impact:**
- Contact form submissions are silently lost (client sees success, no email arrives)
- Users and team cannot receive inquiries through the site
- Blocks deployment to production without manual email forwarding setup

**Fix approach:**
1. Install `resend` package: `npm install resend`
2. Uncomment and implement the `resend.emails.send()` call (template provided in comments)
3. Add `RESEND_API_KEY` to Vercel environment variables
4. Test with a real email address
5. Consider adding error handling for failed sends (currently returns `{ ok: true }` regardless)

**Time estimate:** 30 minutes (implementation) + testing

---

### No Test Coverage (Zero Tests)

**Severity:** High

**Issue:** The codebase contains zero unit, integration, or E2E tests.

**Files:** 
- `src/` (28 `.ts` / `.tsx` files, none with `.test.` or `.spec.` in name)
- No test framework installed (`jest`, `vitest`, etc.)
- No test runner configured

**Impact:**
- Regressions undetected until production (e.g., refactoring the `cn()` utility could break styling silently)
- Difficult to onboard contributors (no executable specification of behavior)
- Refactoring 3D components (`HeroCanvas`, `WorkPreview`) is risky without test coverage
- API endpoint (`/api/notify`) not validated

**Fix approach:**
1. Install test framework: `npm install -D vitest @testing-library/react jsdom`
2. Create test directory structure: `src/**/__tests__/`
3. Start with highest-risk areas:
   - `src/lib/cn.ts` (utility function)
   - `src/app/api/notify/route.ts` (API validation)
   - `src/components/providers/SmoothScroll.tsx` (side effects)
4. Aim for 70%+ coverage of core logic; UI snapshot tests for components

**Time estimate:** 4–6 hours (framework setup + initial suite)

---

## Performance Bottlenecks

### Heavy 3D Bundle (No Code-Splitting)

**Severity:** Medium

**Issue:** Three.js + React Three Fiber + supporting ecosystem loads eagerly on every page, even non-3D routes.

**Bundle contents:**
- `three` v0.184.0
- `@react-three/fiber` v9.6.1
- `@react-three/drei` v10.7.7
- `@react-three/postprocessing` v3.0.4
- `@react-spring/three` v10.1.0
- `postprocessing` (indirect)

**Files:**
- `src/components/canvas/HeroCanvas.tsx` (Hero section background)
- `src/components/canvas/WorkPreview.tsx` (Work section interactive 3D)

**Current behavior:**
- Both components imported in layout → loaded on initial request
- No dynamic imports or lazy loading
- Canvas rendering runs at 60 FPS continuously (see next concern)

**Impact:**
- First Contentful Paint (FCP) / Largest Contentful Paint (LCP) delayed
- Mobile users with slower connections see blank page longer
- ~500 KB+ of JavaScript before app is interactive

**Fix approach:**
1. Wrap `HeroCanvas` and `WorkPreview` in `React.lazy()` + `<Suspense>`
2. Use `next/dynamic` for cleaner Next.js integration
3. Consider `frameloop='demand'` (see next concern) to reduce runtime overhead even if loaded
4. Measure impact: `npm run build` and check bundle analysis

**Time estimate:** 1–2 hours

---

### Continuous Canvas Animation (Battery Drain on Mobile)

**Severity:** Medium

**Issue:** `HeroCanvas` animates at 60 FPS continuously via Three.js render loop, regardless of user interaction.

**Files:** `src/components/canvas/HeroCanvas.tsx` (Canvas props, line 41)

**Current behavior:**
```typescript
<Canvas
  gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
  dpr={[1, 2]}
  // Missing: frameloop='demand'
>
```

**Impact:**
- Continuous GPU/CPU load on mobile devices
- Battery drain even when user is not scrolling
- "High-performance" power preference forces discrete GPU on laptops
- Especially bad on lower-end mobile devices and tablets

**Fix approach:**
1. Add `frameloop='demand'` to Canvas: `<Canvas frameloop='demand' ... >`
2. Call `useThree().invalidate()` when scroll updates (HeroPlane shader animates with scroll position)
3. This renders only when something changes, not on every frame
4. Test on mobile device to verify smooth scroll + responsive updates

**Time estimate:** 30 minutes

---

### Lenis + GSAP ScrollTrigger Not Bridged

**Severity:** Low-Medium

**Issue:** Lenis (smooth scroll) and ScrollTrigger (animation on scroll) operate via separate `requestAnimationFrame` loops without explicit integration.

**Files:**
- `src/components/providers/SmoothScroll.tsx` (Lenis RAF loop, line 28–31)
- `src/lib/gsap.ts` (ScrollTrigger registration, line 6)
- `src/components/sections/About.tsx` (ScrollTrigger usage)
- `src/components/canvas/HeroCanvas.tsx` (Native scroll listener, line 30)

**Current behavior:**
- Lenis runs its own RAF loop: `lenis.raf(time)` → updates scroll position
- ScrollTrigger reads from native `window.scrollY` (no integration)
- HeroCanvas reads native `window.scrollY` separately
- **Works, but inelegant:** Three separate scroll event listeners

**Impact:**
- Minor performance overhead (three RAF loops instead of one)
- Potential for timing skew (Lenis smooth position vs. native scroll position)
- Harder to debug scroll-linked animations

**Fix approach:**
1. Register Lenis with ScrollTrigger: `ScrollTrigger.clearScrollMemory()` on Lenis init
2. Hook Lenis scroll event: `lenis.on('scroll', ScrollTrigger.update)`
3. Consolidate HeroCanvas scroll listener into the same chain
4. Simplify to single RAF loop + shared event system

**Time estimate:** 1 hour

---

## Accessibility Gaps

**Severity:** Medium

**Issue:** Multiple accessibility improvements missing from the current implementation.

### Specific gaps:

**1. Decorative SVGs Not Marked as Hidden**
- Files with unmarked inline SVGs: `src/components/sections/Services.tsx`, `src/components/sections/Work.tsx`, `src/components/sections/Industries.tsx`
- Some marked with `aria-hidden` (good), others missing
- Screen readers may announce decorative elements

**2. Focus Ring Disabled by Default**
- Tailwind default: focus rings are suppressed
- File: `src/app/globals.css` (no explicit focus ring styles)
- Keyboard users cannot see which element has focus

**3. No Skip-to-Content Link**
- No way for keyboard users to jump past nav/hero directly to main content
- Requires tabbing through all interactive elements in nav

**4. Limited Semantic Structure**
- `<main>` and `<section>` present, but no `<header>`, `<footer>`, `<nav>` landmarks (likely in layout, but should verify)

**Files:**
- `src/app/globals.css` (add focus styles)
- `src/components/layout/Nav.tsx` (add skip link)
- `src/components/sections/` (audit SVG `aria-hidden`)
- `src/app/layout.tsx` (verify semantic HTML)

**Fix approach:**
1. Add visible focus rings to `globals.css`: `:focus-visible { outline: 2px solid var(--color-accent) }`
2. Add skip-to-content link in Nav.tsx (hidden by default, shows on focus)
3. Audit all SVG elements — add `aria-hidden="true"` and `role="presentation"` to decorative ones
4. Run axe DevTools or similar accessibility audit tool
5. Add `aria-label` to interactive icon-only elements (buttons without text)

**Time estimate:** 2–3 hours

---

## Scaling Limits

### Lenis Smooth Scroll on Large Pages

**Severity:** Low

**Issue:** Lenis performance can degrade on pages with very large scrollable heights (1000vh+) due to RAF-based scroll sync.

**Files:** `src/components/providers/SmoothScroll.tsx`

**Current state:** Site is currently ~400vh, no issues observed.

**Mitigation:** Monitor as site grows. If performance degrades:
1. Consider throttling Lenis on mobile (`smartDeceleration: true`)
2. Implement virtual scrolling for long lists if needed
3. Profile with DevTools Performance tab

---

## Missing Critical Features

### Missing Form Validation & Error Feedback

**Severity:** Medium

**Issue:** Contact form (`/api/notify`) has minimal validation. No client-side validation library (Zod, yup, etc.) integrated.

**Files:** `src/app/api/notify/route.ts` (lines 31–33, only checks email presence)

**Impact:**
- Invalid emails accepted
- No field-level error messages to user
- Server logs spam or malformed requests

**Fix approach:**
1. Add Zod schema for contact form
2. Validate on client (real-time feedback)
3. Validate on server (security, cannot trust client)
4. Return detailed error messages

**Time estimate:** 1–2 hours

---

## Fragile Areas

### HeroCanvas Shader Continuous Animation

**Severity:** Medium (High if refactoring)

**Issue:** Custom GLSL shader in `HeroPlane` animates based on scroll position. No test coverage for shader logic.

**Files:**
- `src/components/canvas/HeroPlane.tsx` (shader uniforms)
- `src/shaders/` (GLSL files)

**Why fragile:**
- Shader code not validated at build time (runtime compilation)
- Browser GLSL errors only visible in DevTools console
- No unit tests for uniform updates

**Safe modification:**
1. Check DevTools console for GLSL compile errors before shipping
2. Test on multiple GPU vendors if possible
3. Add fallback if shader fails to compile

---

### About Section ScrollTrigger Count-Up Animation

**Severity:** Low-Medium

**Issue:** Count-up animation in About section uses ScrollTrigger without defensive cleanup.

**Files:** `src/components/sections/About.tsx`

**Risk:** If component unmounts during scroll, trigger may not clean up properly.

**Safe modification:**
1. Verify `useEffect` cleanup function properly calls `trigger.kill()`
2. Test rapid route navigation to ensure no memory leaks

---

## Dependencies at Risk

### GSAP ScrollTrigger (Paid License)

**Severity:** Low-Medium

**Issue:** GSAP v3.15.0 is free for public, non-commercial projects. Commercial use requires a paid license.

**Files:** `package.json` (line 22), `src/lib/gsap.ts`

**If Cubixso is commercial:**
- Current usage of ScrollTrigger may require a license
- Check GSAP license agreement for deployment context

**Mitigation:** 
- Review GSAP terms for your use case
- Purchase license if needed
- Consider open-source alternatives (Scroll Trigger by Mozilla, ScrollMagic) if cost is concern

---

End of document

---

*Concerns audit: 2026-05-23*
