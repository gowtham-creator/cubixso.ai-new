# Omma.build — Cubixso cinematic 3D site (hubtown-style hero)

Omma (Spline's AI 3D canvas) takes a natural-language prompt + uploaded assets
(GLTF/OBJ models, images, video) and generates a Three.js + Tailwind interactive
site. So we UPLOAD the real brand cube instead of describing one.

## WHAT TO UPLOAD (in this order of importance)
1. **`public/models/cubixso-cube.glb`** — your real brand cube model. This becomes
   the hero object (so it's on-brand, not a generic cube). [also bring `public/draco/` if it asks for the decoder]
2. **Cubixso logo PNG** — `public/logo-on-dark.png` (for the nav).
3. **Reference screenshot of hubtown.co.in hero** — drag it in as a STYLE reference
   ("match this mood/lighting/composition").
4. **`public/void-poster.jpg`** — your Blender cube-over-ocean still, as a second
   mood/lighting reference.
5. Optional: a note "brand accent = electric cobalt #1B4FFF on near-black; fonts Inter / SF Pro".

## THE SUPER PROMPT (paste into Omma)

Build an immersive, cinematic 3D landing page for **Cubixso** — an AI-native
global technology company. The signature is a single glowing cube hero floating
in a dark atmospheric environment, in the spirit of the attached hubtown.co.in
reference. **Use the uploaded `cubixso-cube.glb` as the hero object** and the
uploaded Cubixso logo in the nav.

HERO SCENE (the centerpiece):
- The uploaded Cubixso cube floats centered, rendered as a refractive glass /
  glowing cobalt edge-frame material with soft inner emission. It slowly rotates
  and gently bobs (idle float), igniting brighter on load.
- Environment: a near-black midnight gradient sky over a calm reflective
  dark-water plane with a misty horizon; volumetric light shafts (god rays) rake
  through from behind the cube; fine luminous dust/bokeh particles drift in depth.
- Camera: slow cinematic drift with mouse-parallax (scene tilts gently toward the
  cursor) and scroll-driven dolly (camera pushes in as you scroll; the cube
  reacts).
- Lighting: one cool key + cobalt rim glow; bloom on the cube's emissive edges;
  soft reflections on the water.
- Post-processing: subtle bloom, light chromatic aberration, film grain, vignette
  — a cinematic color grade.

LAYOUT & UI (dark, liquid-glass, minimal):
- A translucent glass nav pill: logo left, links center (Services, Products,
  Industries, About, Contact), a glowing cobalt "Start" button right.
- Hero headline over the scene: "AI-native technology for the autonomous
  enterprise" + a one-line subhead + a glowing CTA.
- Below the hero, scroll sections that reveal smoothly on scroll: Capabilities,
  Products, Proof stats, Locations, Contact — glass cards, generous spacing.
- Ambient cinematic drone loop + soft UI click sounds, OFF by default behind a
  sound toggle (like hubtown).

INTERACTIONS: mouse-parallax camera, scroll-driven camera dolly, hover glows on
buttons, smooth (Lenis-style) inertial scrolling, reveal-on-scroll for sections.

STYLE: premium, Apple-keynote-meets-deep-tech. Electric cobalt (#1B4FFF) accent
on near-black, liquid-glass surfaces, modern sans-serif (Inter / SF Pro).
Fully mobile-responsive. Output as a Three.js + Tailwind interactive site.

## TIPS
- Generate the HERO SCENE first (just the cube + environment + camera), get it
  right, THEN add the nav/sections — Omma's canvas is iterative; build in layers.
- If the cube material looks flat, prompt: "make the cube glass refractive with
  cobalt emissive edges and bloom, like the reference."
- If god-rays/water are missing: "add volumetric light shafts behind the cube and
  a reflective dark-water floor."
- For the sound: "add an ambient drone loop and click sounds with an off-by-default
  toggle."
