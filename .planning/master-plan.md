# Cubixso.ai — Master Implementation Plan

> Synthesis of `cubixso_3d_website_prompt.md` (content/structure) + `cubixso_reference_extraction.md` (aesthetic patterns + execution order). Extraction doc supersedes the original Phase numbering.

---

## 1. State of the Build (today)

### ✅ Done
| # | Item | Where |
|---|---|---|
| 1 | Foundation: 11-section scroll, chapter labels, brand-with-period, line-broken poetic copy | `src/app/page.tsx`, `src/components/sections/*` |
| 2 | Preloader: counter `00→100`, status cycle, glyph stroke-draw, blur-dissolve exit | `src/components/loader/Preloader.tsx` |
| — | Next.js 15 + TS + Tailwind v4 + Lenis + Framer Motion + R3F + GSAP + Rapier + Spline installed | `package.json` |
| — | Codebase map (1827 lines, 7 docs) | `.planning/codebase/` |

### ⚪ Remaining (12 items, ~22h)
See section 4 below.

---

## 2. Final architecture

```
/Users/gowthamreddy/cubixso/                ← THIS PROJECT (Next.js 15, real site)
  src/
    app/                                    ← App Router, all routes + /api/notify
    components/
      canvas/        ← R3F scene root + cube + lights + postFX
      loader/        ← Preloader
      layout/        ← Nav, Footer, Cursor (item 7)
      motion/        ← Magnetic, WordReveal, Scramble (item 8)
      sections/      ← 11 chapters
      shared/        ← ChapterLabel
      scene/         ← cubeStates.ts (item 4), CubeController.tsx
    shaders/         ← GLSL for cube + post-fx
    lib/             ← data, cn, gsap, audio (item 9)
  public/
    models/          ← .glb (item 6, deferred to v2)
    fallback/        ← cube-loop.mp4 (item 11)
    audio/           ← ambient.mp3 (item 9)
  .planning/
    codebase/        ← /gsd:map-codebase output
    build-plan.md    ← 14-item live tracker
    master-plan.md   ← this file

/Users/gowthamreddy/cubixso-loading/        ← DEPLOYED holding page (Vite, untouched)
```

---

## 3. Phase view (mirrors the prompt doc, refined per extraction doc)

| Phase | Goal | Maps to items | Realistic time |
|---|---|---|---|
| **P1 Foundation** ✅ done | Site scrolls end-to-end with real copy. No 3D. | 1 | 3h ✓ |
| **P2 Cinematic intro** ✅ done | First impression: preloader + brand reveal | 2 | 1h ✓ |
| **P3 Hero 3D** ⚪ next | Cube is on screen, lit, idle. No scroll choreography yet. | 3 | 1.5h |
| **P4 Choreography** | THE BIG ONE — cube state machine across 9 sections + cinematic post-fx | 4, 6, 8 (sequence-blocking) | 6h |
| **P5 Motion polish** | Kinetic stack, magnetic cursor, scramble headlines, page micro-interactions | 5, 7, 8 | 3.5h |
| **P6 Sensory** | Audio toggle + ambient drone + Spline footer mascot | 9, 10 | 2h |
| **P7 Production** | Mobile fallback, perf pass, a11y pass, deploy | 11, 12, 13, 14 | 4.5h |
| **TOTAL** | | | **~22h** focused work |

The original prompt estimated 10–12h. Extraction doc bumped to ~21h. Realistic: 22–26h once a11y + iteration loops are included. The cube state machine alone is 4–6h done well.

---

## 4. Item-by-item execution table (the 14)

| # | Item | Status | Skill(s) | MCP(s) | Time | Blocker |
|---|---|---|---|---|---|---|
| 1 | Foundation: 11-section scaffold | ✅ done | nextjs-best-practices, tailwind-patterns | — | 3h ✓ | — |
| 2 | Preloader | ✅ done | magic-animator, animate-text | context7 (Drei Mask deferred until item 3) | 1h ✓ | — |
| 3 | Hero cube (R3F + Y core + parallax) | ⚪ **next** | threejs-geometry, threejs-materials, threejs-lighting | context7 | 1.5h | — |
| 4 | Cube state machine (9 morph states + GSAP ScrollTrigger) | ⚪ | threejs-animation, scroll-experience | context7 (GSAP), threejs-skills | 4h | needs #3 |
| 5 | Kinetic type stack (vertical word reveal) | ⚪ | animate-text | — | 1h | — |
| 6 | Postprocessing (Bloom + Noise + ChromaticAberration + DoF) | ⚪ | threejs-postprocessing, threejs-shaders | context7 (postprocessing) | 1h | needs #3 |
| 7 | Magnetic cursor (lerp dot + ibeam + CTA scale) | ⚪ | magic-animator | — | 1h | — |
| 8 | Scramble-reveal headlines (per-character) | ⚪ | animate-text | — | 1h | — |
| 9 | Audio toggle + ambient drone + audio-reactive emissive | ⚪ | threejs-interaction | — | 1h | needs audio asset |
| 10 | Spline mascot in footer (lazy after Why Us) | ⚪ | spline-3d-integration | — | 1h | needs Spline scene URL |
| 11 | Mobile fallback (`<video>` < 768px) | ⚪ | web-performance-optimization | — | 1h | needs #4 (to record) |
| 12 | Perf pass (Lighthouse ≥80 desktop, frameloop=demand, lazy below fold) | ⚪ | performance-optimizer, fixing-motion-performance | — | 2h | needs #3–6 |
| 13 | A11y pass (prefers-reduced-motion, focus, kbd nav, alt text) | ⚪ | accessibility-compliance-accessibility-audit, ui-a11y | — | 1h | — |
| 14 | Deploy (Vercel, OG image, sitemap, robots.txt) | ⚪ | vercel-deployment, vercel-automation | — | 30m | — |
| — | **Total remaining** | | | | **~19.5h** | |

---

## 5. Skills & MCPs inventory

**Skills I will invoke** (by domain):

- **R3F / Three.js**: `threejs-fundamentals`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-animation`, `threejs-postprocessing`, `threejs-interaction`, `threejs-shaders`, `threejs-skills`, `3d-web-experience`, `shader-programming-glsl`
- **Motion / kinetic type**: `magic-animator`, `animate-text`, `scroll-experience`, `fixing-motion-performance`
- **Frontend craft**: `frontend-design`, `design-spells`, `design-taste-frontend`, `ui-ux-pro-max`, `high-end-visual-design`, `frontend-ui-engineering`, `web-design-guidelines`, `tailwind-patterns`, `tailwind-design-system`
- **Next.js / React**: `nextjs-best-practices`, `nextjs-app-router-patterns`, `react-nextjs-development`, `react-best-practices`, `react-component-performance`
- **Spline**: `spline-3d-integration`
- **Audio**: `threejs-interaction` (covers Drei `<PositionalAudio>`)
- **Perf / a11y**: `web-performance-optimization`, `performance-optimizer`, `accessibility-compliance-accessibility-audit`, `ui-a11y`, `wcag-audit-patterns`, `fixing-accessibility`
- **Deploy**: `vercel-deployment`, `vercel-automation`

**MCP servers I will use** (already connected):

- **context7** — pull current docs for R3F 9.x, drei 10.x, postprocessing 3.x, GSAP 3.x, Lenis 1.x, Framer Motion 12.x (item 3, 4, 6 mainly)
- **mcp-three** — `gltfjsx` to convert any .glb you supply into typed JSX (deferred to v2 per item 6)
- **magic** — 21st.dev generator if we need a bespoke component variant (logo search, etc.)
- **TalkToFigma** — if you push designs into Figma, I can pull frames directly
- **plugin:context-mode** — sandbox executor (already in active use for >20-line outputs)
- **plugin:claude-mem** — memory across sessions

---

## 6. What I need from you

### Required before specific items
| Asset | For item | Format | Where to drop |
|---|---|---|---|
| **Cubixso brand logo SVG** (clean vector) | already inlined as 9 paths in `Nav.tsx` + `Preloader.tsx` | — | already have it |
| **Spline scene URL** (the footer mascot) | 10 | URL `https://prod.spline.design/.../scene.splinecode` from spline.design | reply with URL when ready |
| **Ambient audio file** (60s seamless drone, -24dB) | 9 | `.mp3` or `.ogg`, ≤500 KB | `public/audio/ambient.mp3` |
| **`RESEND_API_KEY`** (when you want real signups) | optional | env var | Vercel project → Settings → Environment Variables |
| **glB product models** (deferred) | 6 (v2) | `.glb`, Draco + KTX2 if heavy | `public/models/` |

### Required for deploy (item 14)
| Asset | For | Notes |
|---|---|---|
| **Vercel access** | host the site | I can push the repo; you connect Vercel and grant access OR you do it yourself with the GitHub repo I create |
| **Custom domain** | `cubixso.ai` | DNS at the registrar — A/CNAME records once Vercel project exists |

### Optional / nice-to-have
- **Brand audio identity** (UI clicks, section-change sweep) — defaults to silence
- **Real testimonial quote** — I have the placeholder layout; swap copy when client approves
- **Hi-res client/accelerator logos** for Backed By strip — currently we just render the names in mono

### Decisions I need a yes/no on (one-line replies are fine)
1. **Sound on by default?** My answer: no (per the prompt) — toggle off, user opts in.
2. **Cube color exact?** Currently `#3361ff` (existing palette). Prompt says `#1B4FFF` (electric cobalt). Should I swap?
3. **Headline copy:** keep "We *decompose* / intelligence / and *synthesize* / the future." in Manifesto? Or use the prompt's "We build intelligent systems that shape the future of your business." (less poetic, more conventional)
4. **Mobile fallback (item 11):** ship pre-rendered MP4 below 768px, OR ship a simplified live R3F scene that just rotates the cube (no morph)?
5. **Real routes (`/services/llmops`, `/products/logic-gen`):** in scope for v1 or defer to v2? Affects whether Layer 4 (page transitions) is needed.

---

## 7. Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| **Cube state machine takes 6h+ to feel right** (item 4) | high | timebox + ship at 3 working states (hero / services / cta) if needed; iterate the other 6 in a v1.1 |
| **Bundle size > 800 KB initial** | medium | code-split R3F via `next/dynamic` ssr:false, lazy load below-fold canvases, drop Rapier if unused |
| **Mobile WebGL janky** | medium | ship video fallback (item 11), kill postFX on mobile, lower DPR cap to 1.5 |
| **Lighthouse < 80 desktop** | medium | budget: total JS ≤ 250 KB gzipped above fold, all R3F deferred until DOM ready |
| **Spline scene drift** (you redesign it later) | low | scene URL is configurable prop on `<SplineMascot />` — swap any time |
| **shadcn token pollution** (already mitigated) | low | watch when adding shadcn components — they reference `--background` not `--color-bg` |

---

## 8. Recommended execution cadence

```
This week    → items 3, 4, 6           (hero cube + state machine + post-fx)
Mid week     → items 5, 7, 8           (kinetic stack, cursor, scramble)
End week     → items 9, 10             (audio + Spline mascot)
Polish week  → items 11, 12, 13, 14    (mobile, perf, a11y, ship)
```

Each item ends with a verification gate. I'll boot `npm run dev` after each so you can confirm visually before moving on.

---

## 9. First action you should take

Reply with answers to the 5 yes/no decisions in Section 6 plus the green light, e.g.:

> `1=no, 2=yes-swap, 3=keep-poetic, 4=mp4, 5=defer-v2 — go 3`

That unblocks me to start item 3 (Hero cube) without coming back to ask.
