# HERO REWORK PLAN — "First Eight Seconds"
*Comprehensive plan for the full hero/landing experience rework. Built from the
2026-06-12 screenshot review. Content slots below are what the user will supply.*

---

## 1 · DIAGNOSIS (what's wrong in the current hero)

| # | Problem | Evidence |
|---|---------|----------|
| D1 | **Film composition fights the page.** The Blender loop was composed as a centered hero object, but `object-cover` at 1440×900 crops it into a huge tilted close-up — bars read as random diagonal planks BEHIND/THROUGH the type, not as an iconic object. | Screenshot: bars slice through "GENERATIVE AI" |
| D2 | **Headline layout collides with footage.** The samana spread (upper-left + lower-right) assumes a calm center; the film fills exactly that center. Two compositions, one frame. | "AUTONOMOUS" crowds right edge; "AI" overlaps a bar |
| D3 | **The hero says nothing actionable.** Headline only — no subheadline (what Cubixso does, for whom), no CTA, no proof. hubtown/apple heroes carry: headline → one-liner → pill CTA (+ a stat or client strip). | No CTA above the fold |
| D4 | **No focal hierarchy.** Eye bounces: headline ↔ planks ↔ nav. Nothing tells you where to look first. | — |
| D5 | Nav/banner stack eats ~190px and the headline starts hard against it. | — |

## 2 · THE NEW HERO — "One object, one message" (recommended direction)

A split-stage hero — calm editorial LEFT, iconic object RIGHT. No more
center-collision, every element has its own air.

```
┌──────────────────────────────────────────────────────────────┐
│  banner / nav                                                │
│                                                              │
│  EYEBROW · [mono, small]              ┌────────────────────┐ │
│  HEADLINE — 2–3 lines,                │                    │ │
│  left-aligned, one aurora             │   THE CUBE         │ │
│  gradient word                        │   (film or live    │ │
│                                       │    3D, CONTAINED,  │ │
│  Subheadline — one sentence,          │    never cropped,  │ │
│  max 2 lines, fg-2                    │    floats w/ slow  │ │
│                                       │    rotation, glow  │ │
│  [● START PILL]  [Secondary link →]   │    pooling below)  │ │
│                                       └────────────────────┘ │
│  proof strip: client/sector chips or 3 mono stats            │
│  coords · · · · · · · · · · · · · · · ·  SCROLL TO EXPLORE ↓ │
└──────────────────────────────────────────────────────────────┘
```

Mobile: stack — eyebrow/headline/sub/CTA, then a SHORTER contained cube
stage (~46svh), proof chips horizontal-scroll.

### Why this wins
- The cube becomes an ICON again (contained stage = jewel-case, like a
  product shot) instead of scenery the text fights.
- Left column is a real message: who/what/act — the "no information"
  complaint solved at second zero.
- Film stays usable: re-rendered for the right-stage composition (§4) — or
  the live R3F cube takes the stage if we drop video entirely (decision D-1).

## 3 · CONTENT SLOTS — what the user supplies
*(plan locks layout; copy drops in without layout changes)*

| Slot | Spec | Placeholder until supplied |
|------|------|---------------------------|
| C1 Eyebrow | ≤4 words, mono uppercase | `CUBIXSO · APPLIED AI STUDIO` |
| C2 Headline | 4–8 words, ONE emphasis word (gets aurora gradient) | `Generative AI for the autonomous enterprise` |
| C3 Subheadline | 1 sentence ≤120 chars: what you build + for whom | `Agentic systems, RAG platforms and LLMOps — designed, shipped and operated end-to-end.` |
| C4 Primary CTA | 1–3 words + route | `Start the conversation → /contact` |
| C5 Secondary link | optional, 2–4 words + route | `See the work → /case-studies` |
| C6 Proof strip | EITHER 3 stats (num+label) OR 4–6 client/sector names | `6 sectors · 92% on-time · T-HUB Hyderabad` |
| C7 Fonts | display + body files/names (long-promised) | SF Pro stack stays |

## 4 · THE CUBE STAGE — two execution options (decision D-1)

**A · Re-rendered film (cinematic, recommended if film stays):**
Re-render the Blender loop COMPOSED FOR THE STAGE: cube small-in-frame
(~38% height), centered in the right half, camera locked, ocean reflection
in the lower third, generous black padding all around so `object-contain`
(not cover!) NEVER crops it at any viewport. 1200×1500 portrait render for
the stage's 4:5 box. Same EEVEE pipeline (~30–40 min bake).

**B · Live R3F cube on the stage (interactive, simpler pipeline):**
The existing glb cube renders inside the stage at fixed scale with the
bokeh dust + a radial glow pool. Pointer-tilt ±6°. The film is retired (or
kept ONLY as a dimmed full-bleed atmosphere at 20% opacity with NO cube —
re-render without the cube object, 15 min).

Either way: the stage is a LiquidGlass tier="panel" frame? NO — frameless,
just the object + glow (jewel on velvet). The scroll handoff (stage cube →
spine cube morph story) is preserved: stage cube fades out over p 0→1 as
the spine cube fades in (existing mechanism).

## 5 · MOTION CHOREOGRAPHY (entrance, 0 → 2.4s after reveal)
1. 0.00s — loader zoom-through lands; stage cube already present (film
   playing / R3F idle) but at 0.92 scale, dim
2. 0.15s — eyebrow fades up (0.4s)
3. 0.30s — headline lines mask-wipe up, stagger 90ms/line; aurora word
   ignites last (existing kinetic-build language)
4. 0.70s — subheadline fades (0.5s)
5. 0.90s — CTA pill springs in (scale 0.9→1, the sweep plays once)
6. 1.10s — cube stage IGNITES: scale 0.92→1 spring + emissive ramp +
   one particle burst (existing ignition bus)
7. 1.40s — proof strip + coords + scroll hint fade
Reduced motion: all states final, no animation.

## 6 · SUPPORTING CHANGES
- **Nav**: unchanged (recently fixed). Banner: consider auto-collapse to a
  thin strip after 6s (decision D-2, default: keep as is).
- **Bokeh dust** continues behind the whole hero (it's the approved layer).
- **Aurora** stays but hero-region blobs bias toward the LEFT column so the
  right stage keeps clean blacks behind the cube.
- **Type scale**: headline `clamp(44px, 5.2vw, 96px)` (smaller than the old
  spread — it shares the stage now), tracking −0.04em, leading 0.96.
- **A11y**: real `<h1>` is the visible headline now (kill the sr-only dupe),
  CTA is a true link, stage is `aria-hidden` decorative.
- **Perf**: stage film `object-contain` poster-first; LCP target = headline
  text node, not the video.

## 7 · BUILD ORDER + ESTIMATES
| Step | What | Est |
|------|------|-----|
| 1 | Hero.tsx restructure to split-stage grid + content slots (placeholders) | 45m |
| 2 | Decision D-1 → film re-render (40m bake, parallel) OR R3F stage (30m) | 30–40m |
| 3 | Entrance choreography (§5) | 30m |
| 4 | Mobile stack + proof strip | 25m |
| 5 | Headed-browser verify at 1440/2000/390 + build | 25m |
| | **Total** | **~2.5h** |

## 8 · OPEN DECISIONS (need user's word)
- **D-1**: Cube stage = A (re-rendered film) or B (live 3D)? *Recommend A
  for cinema, B if you want the hero cube interactive.*
- **D-2**: Construction banner — keep full height or auto-collapse?
- **D-3**: Proof strip — stats or client/sector names?
- Content slots C1–C7 (placeholders go in immediately; your copy swaps in).
