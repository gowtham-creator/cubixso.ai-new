# Cubixso — Google Flow (Whisk) + Veo / Nano Banana Pro animation prompt pack

Workflow: generate a **START frame** (cube assembled) and an **END frame** (cube
exploded), then let Veo animate between them — same intact → exploded idea as the
headphones example, but the subject is the Cubixso brand glass cube. The shared
"look" block is identical in both frames so the two images match and interpolate
cleanly. Works in Google Flow/Whisk and Nano Banana Pro.

Subject = the Cubixso cube (translucent smoked-glass faces, luminous cobalt-blue
edge frame, glowing geometric core, brushed-aluminum corner joints). Abstract,
no literal wordmark — so the model renders it reliably.

---

## SHARED LOOK (already baked into both frame prompts below — for reference)
deep matte-black void background with a subtle cobalt-blue gradient, soft volumetric studio lighting from top-left, cinematic rim light, hyper-realistic 3D render, glass and brushed-aluminum materials, faint prism light dispersion, shallow depth of field, 4k cinematic quality, no text, no wordmarks, no logos, luxury tech aesthetic, sharp focus on the cube, modern minimalist composition, centered hero shot

---

## ① START FRAME  (intact / assembled — paste into Flow/Whisk/NBP)

Ultra-premium product render of a single floating cube, translucent smoked-glass faces with a luminous cobalt-blue glowing edge frame and a softly glowing geometric core suspended inside, brushed-aluminum corner joints, the cube fully intact and perfectly assembled, hovering dead-center, deep matte-black void background with a subtle cobalt-blue gradient, soft volumetric studio lighting from top-left, cinematic rim light, hyper-realistic 3D render, faint prism light dispersion, shallow depth of field, 4k cinematic quality, no text, no logos, luxury tech aesthetic, sharp focus, modern minimalist composition, centered hero shot

---

## ② END FRAME  (exploded view — paste into Flow/Whisk/NBP)

Ultra-premium product render of the SAME floating cube in an exploded view: its six translucent smoked-glass faces and aluminum edge struts separated and drifting apart in mid-air in a clean radial explosion, revealing a bright cobalt-blue glowing geometric core at the center radiating prism light rays between the suspended pieces, identical camera angle, framing and lighting as the intact shot, deep matte-black void background with a subtle cobalt-blue gradient, soft volumetric studio lighting from top-left, cinematic rim light, hyper-realistic 3D render, shallow depth of field, 4k cinematic quality, no text, no logos, luxury tech aesthetic, sharp focus, modern minimalist composition, centered hero shot

> Tip for matching frames: generate ① first, then in Flow/NBP feed ① back in as
> the image reference for ② ("same cube, same lighting, now exploded") — keeps
> the materials/colours consistent so Veo doesn't morph the look mid-animation.

---

## ③ VEO / FLOW MOTION PROMPT  (the animation between the two frames)

Cinematic slow camera orbit around the cube: it gently explodes outward into its floating glass faces, edge struts and glowing core, holds in the suspended exploded state, then the pieces drift back and reassemble into the solid cube; smooth weightless premium motion, slow dolly-in, soft parallax, volumetric cobalt light shifting across the glass, subtle rack-focus depth of field, elegant and unhurried, hubtown-style luxury product film, 24fps cinematic, no text
- Duration: 5–8s · loop-friendly (start state = end state)
- Set START image = frame ① and END image = frame ② in Flow's frame inputs.

---

## ④ FRAME-TO-VIDEO PROMPT  (Veo "Frames to Video" — start ① → end ②)

Set **Start frame = ① (intact cube)** and **End frame = ② (exploded cube)**, then use:

> The solid glass cube hangs weightless, then slowly comes apart: its six translucent smoked-glass faces, aluminum edge struts and inner core detach and drift outward in a smooth, controlled radial explosion, each piece floating apart in zero gravity to reveal the bright cobalt-blue glowing core at the center, prism light rays fanning between the suspended fragments. The camera does a slow cinematic dolly-in with a gentle orbit, soft parallax across the glass, volumetric cobalt light shifting and refracting as the pieces separate, shallow depth of field with a subtle rack focus from the core to the outer shards. Premium, unhurried, weightless motion; hubtown-style luxury product film; consistent lighting and materials throughout; 4k, 24fps cinematic.
>
> Negative: no text, no logos, no morphing or warping of the cube, no fast cuts, no camera shake, no extra objects, keep the cube's materials and colours consistent.

- **Length:** 5–8s · ease-in / ease-out so the explosion feels controlled, not snappy.
- **For a seamless loop:** generate a second clip with the frames **reversed** (start = ②, end = ①) so the cube re-assembles, then play forward + reverse back-to-back in your editor — gives an infinite explode/implode loop for the hero.
- **No end frame? (single-image → video):** if you only feed frame ①, use: *"slow cinematic orbit around the intact glass cube, a single beam of light passes through it and splits into a prism spectrum, the glowing core pulses gently, weightless premium motion, hubtown-style, 4k 24fps, no text"*.

---

## Variations to try
- **Palette:** swap "cobalt-blue" → "crimson + cream" or "violet/indigo prism" if you want a different brand mood.
- **Motion:** instead of explode→reassemble, try "the cube slowly rotates as a single beam of light passes through it, splitting into a prism spectrum" (calmer, more hubtown-architectural).
- **Format:** add "9:16 vertical" (mobile hero) or "16:9 cinematic" at the end depending on where it runs.
