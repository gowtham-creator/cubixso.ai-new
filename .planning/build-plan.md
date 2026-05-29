# Cubixso.ai — Build Plan (14-item roadmap)

Source: combined `cubixso_3d_website_prompt.md` + reference-extraction doc (Tenbin / Epiminds / Hubtown / Ascend).

| # | Deliverable | Status | Skill / MCP | Est |
|---|---|---|---|---|
| 1 | **Foundation:** 11-section single-page scroll, chapter labels, brand-with-period, /Scroll indicator | **🟡 in progress** | nextjs-best-practices, tailwind-patterns | 3h |
| 2 | Preloader: counter + glyph draw-in + Drei Mask reveal | ⚪ pending | magic-animator, animate-text | 1h |
| 3 | Hero cube: R3F wireframe cube + Y core + parallax | ⚪ pending | threejs-geometry/materials/lighting | 1.5h |
| 4 | Cube state machine (9 morph states, GSAP ScrollTrigger) | ⚪ pending | threejs-animation, scroll-experience | 4h |
| 5 | Kinetic-type stack reveal (Epiminds-style vertical word stack) | ⚪ pending | animate-text | 1h |
| 6 | Postprocessing (Bloom + Noise + ChromaticAberration + DOF) | ⚪ pending | threejs-postprocessing | 1h |
| 7 | Magnetic cursor (lerp dot + ibeam + CTA scale + mix-blend) | ⚪ pending | magic-animator | 1h |
| 8 | Scramble-reveal headlines (per-character on enter view) | ⚪ pending | animate-text | 1h |
| 9 | Audio toggle + ambient drone, audio-reactive emissive | ⚪ pending | threejs-interaction | 1h |
| 10 | Spline mascot in footer (lazy-loaded after Why Us) | ⚪ pending | spline-3d-integration | 1h |
| 11 | Mobile fallback: pre-rendered cube video below 768px | ⚪ pending | web-performance-optimization | 1h |
| 12 | Performance pass: Lighthouse ≥80, frameloop=demand, lazy below fold | ⚪ pending | performance-optimizer, fixing-motion-performance | 2h |
| 13 | A11y pass: reduced-motion, keyboard nav, focus states, alt text | ⚪ pending | accessibility-compliance, ui-a11y | 1h |
| 14 | Deploy: Vercel, OG image, sitemap, robots.txt | ⚪ pending | vercel-deployment | 30m |

**Total budget: ~21h focused work.**

## Section structure (item 1)

1. Hero — **FUTURE**
2. Manifesto — **INTELLIGENCE**
3. Kinetic stack — **KINETIC** (new)
4. Services — **CAPABILITIES**
5. Products — **PRODUCTS**
6. Industries — **INDUSTRIES**
7. Why Us — **EDGE**
8. Metrics — **PROOF**
9. Testimonial — *(no chapter word; bold quote between Metrics + Global)*
10. Global — **REACH**
11. CTA — **LEGACY**

## Cube state machine (item 4, future)

```ts
hero       → cube,        fragmentation 0
manifesto  → cube,        fragmentation 0.2
services   → fragments,   2×3 grid
products   → liquid,      pour
industries → modules,     orbital
whyus      → collapsed,   single dense node
metrics    → particles,   2000 specks
global     → globe,       low-poly Earth
cta        → cube,        reformed, Y glows
```

## Brand
- **Wordmark:** `Cubixso.` (period is part of the brand — Ascend treatment)
- **Routes still exist** (`/services`, `/products`, …) for SEO but home is the canonical narrative
- **Sound + cursor + preloader off by default** — layer in via items 2 / 7 / 9

## References (DO NOT copy)
- Tenbin Labs — 4D morphing reference (state machine)
- Epiminds — kinetic type stack (item 5)
- Hubtown — chapter narrative + preloader
- Ascend Marketing — brand-with-period + /Scroll
