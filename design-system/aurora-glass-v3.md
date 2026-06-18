# Aurora Glass v3 — "Cobalt Aperture, Now Alive"
**The sensory evolution: gradients that breathe, glass that sings, touch that answers.**

This brief EXTENDS `design-system/astonish-direction.md` (Cobalt Aperture). Everything there
still stands — the VoidCube spine, LiquidGlass tiers, Reveal choreography, dark-immersive default.
v3 adds five sensory systems distilled from the new references. Build ON TOP, never tear down.

---

## Reference DNA (verified via screenshots, /tmp/ref_*.png)

| Ref | What we take |
|---|---|
| hubtown.co.in | Glowing glass cube hero over cinematic dark scenery. Ambient music loop + UI click sounds. Their hero IS a cube — we lean into the kinship: our VoidCube gets cinematic aurora lighting. |
| draftly web3-eos | Cosmic vortex depth, lavender gradient accent INSIDE display type (`background-clip: text`). |
| altitude101.com | Full-bleed indigo→violet ambient gradient field, slowly breathing, scroll-driven. |
| cognitra | Light silver editorial counterpoint — giant left type, wireframe 3D blob. Informs Metrics light moment. |
| aperios-design.co.uk | Warm cream luxury, generous whitespace, cinematic photo strips, serif pull-quotes. |
| oscartao.com | Black-block bold typographic minimalism. Confidence through restraint. |
| ja.mt | Polaroid photo-stacks beside list items that fan/scatter with springy physics on hover/click. Feel > look. |
| noomo /kk | 404 as art: giant shattered iridescent-crystal numerals on black. |
| text-distort.learnframer.site | Cursor-proximity distortion on display type. |
| 3d-showcase.learnframer.site | 3D tilt showcase cards (articles/case studies). |
| samanastudio.es | (already shipped: word-loader, editorial reveals) |
| mobbin.com | Section organization discipline: consistent card borders, radii, paddings, clear hierarchy. |

## Luxury palettes (user-supplied). PRIMARY = Palette 03 — it IS the cobalt brand matured:
- Deep Blue `#182350` · Powder Blue `#AFD2FA` · Floral White `#FEFAEF` · Pale Brown `#B9915E`
- Sparing cameos allowed: Cosmos Blue `#002F49` (depth), Crimson Blaze `#C1121F` (LIVE dot only).
- RULE — "colorful but minimal": gradients live in the VOID (background) and inside TYPE.
  Glass stays neutral-translucent. One accent family per section. Never gradient-fill a card.

---

## The five new systems

### 1. AURORA — breathing gradient void (altitude101 + eos)
`src/components/scene/Aurora.tsx` — fixed full-viewport layer BEHIND VoidCube canvas, in front of
pure black. 3–4 huge radial-gradient blobs (Deep Blue #182350 → cobalt #1B4FFF → violet #4338ca →
Powder Blue #AFD2FA at 4–8% alpha), `filter: blur(120px)`, slow CSS keyframe drift (60–90s loops,
transform-only). Scroll-linked hue progression via a `--aurora-shift` custom property set from
ScrollProvider progress (hue-rotate 0deg hero → ~40deg FinalCTA). `prefers-reduced-motion`: static.
Light sections (Metrics) get a Floral White #FEFAEF aurora variant scoped by `data-theme="light"`.
Display headlines may take gradient text (Powder Blue→cobalt→white, `background-clip:text`) — max
one gradient-text element per section.

### 2. FEEDBACK BUS — sound + haptics, one tap (hubtown)
`src/lib/feedback.ts` — singleton WebAudio engine. NO audio assets: synthesize.
- `tick()` — 1.2kHz→600Hz sine blip, 30ms, −24dB: link hovers
- `click()` — filtered noise burst + 180Hz thump, 60ms: buttons/CTAs/tiles
- `whoosh()` — band-passed noise sweep 240ms, −30dB: section enters (throttled ≥2s apart)
- `chime()` — soft 2-note (E5+B5) glass strike: form success / loader reveal
- Haptics piggyback: every `click()` → `navigator.vibrate?.(8)`, `chime()` → `vibrate([10,30,10])`
  (Android Chrome; iOS Safari has no vibrate API — degrade silently, never error).
- Master gate: existing `AudioToggle` state. OFF by default; sounds only after explicit opt-in
  AND first user gesture (autoplay policy). Haptics fire even when sound is off (they're touch,
  not audio). Hook: `useFeedback()` returning {tick, click, whoosh, chime}.
- Wire into: Nav links (tick), GlassButton (click), Work tiles (tick hover/click select),
  AudioToggle itself (click), Contact submit (chime), IntroSequence reveal (whoosh+chime).

### 3. ICON SYSTEM — 3dicons + Phosphor (mobbin-grade information design)
- 11 user 3dicons PNGs → `public/icons/3d/` (kebab names: `cube.png`, `rocket.png`, `chart.png`,
  `trophy.png`, `clock.png`, `computer.png`, `mobile.png`, `rupee.png`, `chat-bubble.png`,
  `call-in.png`, `call-only.png`). Use as floating 3D accents — `<Icon3D name size>` component,
  drop-shadow glow, gentle y-float (4s ease loop), used ONLY where meaning matches:
  rocket=launch/CTA, chart=metrics, trophy=BackedBy/awards, computer=LLMOps service,
  mobile=products, chat-bubble=contact/testimonial, clock=delivery speed, cube=brand moments,
  rupee=pricing/value (India market), call-in/call-only=contact. Max 1–2 per section. NEVER as
  bullet decoration spam.
- Phosphor (line icons, UI chrome): deps `unplugin-icons` + `@iconify/json` are installed as the
  user requested, BUT Next 16 Turbopack can't run webpack plugins — so actual rendering goes
  through `@iconify/react` + `@iconify-json/ph` offline data (installed): a thin
  `src/components/icons/Ph.tsx` wrapper `<Ph name="arrow-up-right" weight="light"/>`.
  Local mirror also exists at `~/Downloads/phosphor-icons` (SVGs, 6 weights) if raw SVG needed.
  Replace ad-hoc inline svg arrows/markers across sections with Ph icons (thin/light weights).

### 4. TACTILE GALLERY — ja.mt photo physics
`src/components/work/PhotoStack.tsx` — stack of 2–4 "polaroid" cards (case-study visuals),
slightly rotated (−6°..6°), overlapping. Hover: fan out with spring (framer-motion,
stiffness 380 damping 22) + tick(). Click: scatter→reshuffle cycle + click(). Use in Work
section tiles (homepage) + case-studies index cards. Mobile: tap = fan, second tap = navigate.

### 5. CRYSTAL 404 + showcase cards (noomo + 3d-showcase)
- `src/app/not-found.tsx`: black void + Aurora + giant "404" in shattered-glass style —
  SVG text with turbulence displacement + iridescent gradient stroke (cobalt/powder/violet),
  fragments drift slowly via framer-motion; "Don't feel lost — let's go home." + GlassButton →
  `/`. whoosh() on mount (if audio on). Reuses LiquidGlass + VoidCube aesthetics, no new 3D scene.
- Case-studies index: cards become 3D tilt showcases (rotateX/Y from pointer, ≤8°, glare sweep
  via existing --sweep), powered by a tiny `useTilt()` hook. (3d-showcase reference.)
- text-distort: ONE headline only — FinalCTA "Ready to operationalize" gets cursor-proximity
  per-character weight/skew warp (variable font settings + transform, springy decay). Subtle:
  max skew 4°, radius 160px.

---

## Hard rules (unchanged + new)
1. tsc must stay clean; build must pass.
2. Never gradient-fill glass panels; gradients = void + type only.
3. Sounds OFF by default, gated on AudioToggle + first gesture. No autoplay violations.
4. All new motion respects `prefers-reduced-motion` (freeze/disable).
5. Frozen cube glb: reuse, never rebuild geometry.
6. Per-section accent discipline: hero/global=cobalt-violet, services=powder blue, metrics=floral
   white light moment, finalCTA=full aurora sweep. Crimson #C1121F ONLY the LIVE dot.
7. Icons: meaning-matched, 1–2 per section max, no decoration spam.
8. Mobile: haptics on tap interactions; layouts already responsive — keep them.
