"use client";

// feedback — the FEEDBACK BUS: one singleton WebAudio engine + haptics for the
// whole site (Aurora Glass v3 §2). NO audio asset files — every sound is
// synthesized: tiny sine blips, filtered noise, two-note glass strikes.
//
// Rules baked in:
//   - The AudioContext is created lazily on the FIRST user gesture only
//     (a once pointerdown/keydown listener) — never violating autoplay policy.
//     It is resumed if the browser suspends it.
//   - SOUND GATE: sounds fire ONLY while the AudioToggle is ON. The toggle owns
//     no external store, so this module is the shared source of truth —
//     AudioToggle publishes via setAudioEnabled(), and a `cubixso:audio`
//     CustomEvent mirrors the state for any other listener.
//   - HAPTICS are touch feedback, not audio: click()/chime() vibrate even when
//     sound is off, but only ever run inside user-gesture handlers (the only
//     place navigator.vibrate is honoured). iOS has no vibrate API — the
//     optional call degrades silently.
//
// Vocabulary (mirrors the four motion verbs — four sounds, nothing else):
//   tick()   — 1.2kHz→600Hz sine blip, ~30ms, −24dB: link/tile hovers
//   click()  — filtered noise burst + 180Hz thump, ~60ms: buttons/CTAs
//   whoosh() — band-passed noise sweep, ~240ms, throttled ≥2s: section enters
//   chime()  — soft E5+B5 glass strike, ~600ms decay: success / loader reveal

// ---------------------------------------------------------------------------
// Engine state (module singletons)
// ---------------------------------------------------------------------------

/** Broadcast channel for gate changes — AudioToggle + intro prompt listen here. */
export const AUDIO_EVENT = "cubixso:audio";
/** sessionStorage key for the entry choice — repeat visits this session skip the prompt. */
export const SOUND_KEY = "cubixso.sound";
const WHOOSH_MIN_GAP_MS = 2000;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null; // 1s of white noise, shared by click/whoosh/ambient
let enabled = false; // SSR-safe initial; the window block below seeds it ON by default
let lastWhoosh = 0;

/** Create the context inside a user gesture; reuse forever after. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    } catch {
      return null; // no WebAudio — degrade to silence
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

// Arm the lazy unlock: the first gesture anywhere creates the context so it is
// warm by the time any sound fires (the AudioToggle click itself is a gesture).
if (typeof window !== "undefined") {
  // UI sounds (click / tick / whoosh / chime) are ON BY DEFAULT — the gate is
  // enabled unless the visitor explicitly turned it OFF this session ("0").
  // Autoplay policy is still respected: the AudioContext only unlocks on the
  // first real gesture, so the first click is what makes sound, never page load.
  // (The background-music PAD stays disabled via AMBIENT_ENABLED — only the
  // interaction sounds play until a real music track is wired in.)
  try {
    enabled = sessionStorage.getItem(SOUND_KEY) !== "0";
  } catch {
    enabled = true; // private mode — default ON
  }

  const unlock = () => {
    ensureContext();
    if (enabled) startAmbient(); // resume the pad chosen earlier this session
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);

  // Stay in sync if anyone else dispatches the audio event directly.
  window.addEventListener(AUDIO_EVENT, (e) => {
    enabled = Boolean((e as CustomEvent<{ on: boolean }>).detail?.on);
  });
}

// ---------------------------------------------------------------------------
// Master gate — AudioToggle publishes here (single source of truth)
// ---------------------------------------------------------------------------

/**
 * Called by AudioToggle and the intro entry choice on every change. Persists
 * the choice for the session, starts/stops the ambient pad (legal when called
 * inside the user gesture that flipped the gate) and broadcasts `cubixso:audio`.
 */
export function setAudioEnabled(on: boolean) {
  enabled = on;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
  if (on) startAmbient();
  else stopAmbient();
  try {
    window.dispatchEvent(new CustomEvent(AUDIO_EVENT, { detail: { on } }));
  } catch {
    /* ssr / ancient browser */
  }
}

export function isAudioEnabled(): boolean {
  return enabled;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Sound is allowed only when the toggle is on AND a gesture unlocked audio. */
function liveContext(): AudioContext | null {
  if (!enabled || !ctx || !master) return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Shared 1s white-noise buffer (click burst, whoosh sweep). */
function getNoise(ac: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** Gain node with a fast attack and an exponential decay to silence. */
function envelope(ac: AudioContext, peak: number, t0: number, dur: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(master!);
  return g;
}

/** navigator.vibrate is Android-Chrome only; iOS Safari lacks it — no error. */
function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* permission / unsupported */
  }
}

// ---------------------------------------------------------------------------
// The four sounds
// ---------------------------------------------------------------------------

/** Hover blip — 1.2kHz gliding to 600Hz sine, ~30ms, very quiet. No haptic. */
export function tick() {
  const ac = liveContext();
  if (!ac) return;
  const t0 = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, t0);
  osc.frequency.exponentialRampToValueAtTime(600, t0 + 0.03);
  osc.connect(envelope(ac, 0.06, t0, 0.035));
  osc.start(t0);
  osc.stop(t0 + 0.06);
}

/** Press — filtered noise burst + low 180Hz thump, ~60ms. Haptic: 8ms tap. */
export function click() {
  vibrate(8); // touch answer fires even when sound is off

  const ac = liveContext();
  if (!ac) return;
  const t0 = ac.currentTime;

  // Noise burst through a bandpass — the glassy "tap" texture
  const noise = ac.createBufferSource();
  noise.buffer = getNoise(ac);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 1.2;
  noise.connect(bp);
  bp.connect(envelope(ac, 0.1, t0, 0.05));
  noise.start(t0);
  noise.stop(t0 + 0.08);

  // Low sine thump — the weight under the tap
  const thump = ac.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(180, t0);
  thump.frequency.exponentialRampToValueAtTime(70, t0 + 0.06);
  thump.connect(envelope(ac, 0.1, t0, 0.06));
  thump.start(t0);
  thump.stop(t0 + 0.09);
}

/** Section-enter air — band-passed noise sweep, ~240ms, ≥2s apart. */
export function whoosh() {
  const ac = liveContext();
  if (!ac) return;
  const now = performance.now();
  if (now - lastWhoosh < WHOOSH_MIN_GAP_MS) return; // internal throttle
  lastWhoosh = now;
  const t0 = ac.currentTime;

  const noise = ac.createBufferSource();
  noise.buffer = getNoise(ac);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(280, t0); // low rush…
  bp.frequency.exponentialRampToValueAtTime(1600, t0 + 0.14); // …rises…
  bp.frequency.exponentialRampToValueAtTime(450, t0 + 0.24); // …and falls away
  noise.connect(bp);
  bp.connect(envelope(ac, 0.04, t0, 0.24));
  noise.start(t0);
  noise.stop(t0 + 0.28);
}

/** Glass strike — E5 + B5 sines with exponential decay, ~600ms. Haptic: 10-30-10. */
export function chime() {
  vibrate([10, 30, 10]); // touch answer fires even when sound is off

  const ac = liveContext();
  if (!ac) return;
  const t0 = ac.currentTime;

  // Two soft notes, the fifth landing a breath later — a struck glass edge
  ([
    [659.25, 0], // E5
    [987.77, 0.06], // B5
  ] as const).forEach(([freq, delay]) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(envelope(ac, 0.08, t0 + delay, 0.6));
    osc.start(t0 + delay);
    osc.stop(t0 + delay + 0.7);
  });
}

// ---------------------------------------------------------------------------
// AMBIENT — a soothing, breathing pad (calm/premium, synthesized, no assets)
// ---------------------------------------------------------------------------
// Warm OPEN-FIFTH voicing (A2–E3–A3 + a faint E4 shimmer) — neutral and serene,
// neither happy nor sad. Everything runs through a warm low-pass so there is no
// harshness, then through a "swell" gain whose level an LFO gently raises and
// lowers (~13s) so the whole pad BREATHES — the main thing that makes it relaxing.
// A second slow LFO drifts the low-pass cutoff (~26s) so the brightness subtly
// shifts. A soft, high air wash sits underneath. Quiet by design, 3s fade-in,
// 1.2s fade-out, and it starts/stops ONLY with the audio gate (off by default).

const AMBIENT_LEVEL = 0.05;
const AMBIENT_FADE_IN_S = 3;
const AMBIENT_FADE_OUT_S = 1.2;
const AMBIENT_SWELL_PERIOD_S = 13; // breathing amplitude swell
const AMBIENT_BRIGHT_PERIOD_S = 26; // slow low-pass cutoff drift

interface AmbientNodes {
  sources: (OscillatorNode | AudioBufferSourceNode)[];
  gain: GainNode;
  /** teardown timer while fading out — cleared if the pad is restarted */
  stopping: number | null;
}

let ambient: AmbientNodes | null = null; // module singleton — StrictMode-safe

// Background ambient is DISABLED per the client's request — no synthesized pad
// plays. To re-enable a REAL audio track later, drop an .mp3/.ogg in public/
// (see sourcing notes) and wire an <audio loop> element gated by the toggle,
// or flip this flag back to true to restore the synthesized pad below.
const AMBIENT_ENABLED = false;

/**
 * Start (or resume) the ambient pad. Idempotent: a second call while running
 * (React StrictMode double-effects, rapid toggling) only re-ramps the gain —
 * it never stacks a second oscillator bank.
 */
export function startAmbient() {
  if (!AMBIENT_ENABLED) return; // background sound removed per request
  if (!enabled) return;
  const ac = ensureContext(); // inside the opt-in gesture — autoplay-legal
  if (!ac || !master) return;
  const t0 = ac.currentTime;

  if (ambient) {
    // Already alive (possibly mid fade-out) — cancel teardown, ramp back up.
    if (ambient.stopping !== null) {
      clearTimeout(ambient.stopping);
      ambient.stopping = null;
    }
    ambient.gain.gain.cancelScheduledValues(t0);
    ambient.gain.gain.setValueAtTime(Math.max(ambient.gain.gain.value, 0.0001), t0);
    ambient.gain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, t0 + AMBIENT_FADE_IN_S);
    return;
  }

  // Pad master — the only handle start/stop ever ramps (the fade in/out).
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, t0 + AMBIENT_FADE_IN_S);
  gain.connect(master);

  // Swell — the BREATHING stage. Base level + a slow LFO that raises/lowers it,
  // so the pad gently inhales and exhales (the soothing motion).
  const swell = ac.createGain();
  swell.gain.value = 0.8;
  swell.connect(gain);

  const swellLfo = ac.createOscillator();
  swellLfo.type = "sine";
  swellLfo.frequency.value = 1 / AMBIENT_SWELL_PERIOD_S;
  const swellDepth = ac.createGain();
  swellDepth.gain.value = 0.2; // swell rides 0.6 … 1.0
  swellLfo.connect(swellDepth);
  swellDepth.connect(swell.gain);

  // Warm low-pass — rounds off all harshness; a slow LFO drifts the cutoff so
  // the brightness subtly shifts over time. The tonal layers feed THIS.
  const warm = ac.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 900;
  warm.Q.value = 0.5;
  warm.connect(swell);

  const brightLfo = ac.createOscillator();
  brightLfo.type = "sine";
  brightLfo.frequency.value = 1 / AMBIENT_BRIGHT_PERIOD_S;
  const brightDepth = ac.createGain();
  brightDepth.gain.value = 320; // cutoff drifts ~580 … 1220 Hz
  brightLfo.connect(brightDepth);
  brightDepth.connect(warm.frequency);

  // Open-fifth voicing — serene, neither major nor minor. Each tone is a sine
  // (triangle on the A3 for a little warmth), softly detuned so they shimmer.
  const TONES: { type: OscillatorType; freq: number; detune: number; level: number }[] = [
    { type: "sine", freq: 110.0, detune: -3, level: 1.0 }, // A2 root
    { type: "sine", freq: 164.81, detune: 2, level: 0.7 }, // E3 fifth
    { type: "triangle", freq: 220.0, detune: -2, level: 0.38 }, // A3 octave (warmth)
    { type: "sine", freq: 329.63, detune: 4, level: 0.13 }, // E4 distant shimmer
  ];
  const tones = TONES.map(({ type, freq, detune, level }) => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const lvl = ac.createGain();
    lvl.gain.value = level;
    osc.connect(lvl);
    lvl.connect(warm);
    return osc;
  });

  // Soft high air wash — a gentle band of noise under the tones (breathes too).
  const noise = ac.createBufferSource();
  noise.buffer = getNoise(ac);
  noise.loop = true;
  const air = ac.createBiquadFilter();
  air.type = "bandpass";
  air.frequency.value = 700;
  air.Q.value = 0.9;
  const airLevel = ac.createGain();
  airLevel.gain.value = 0.05;
  noise.connect(air);
  air.connect(airLevel);
  airLevel.connect(swell);

  const sources: AmbientNodes["sources"] = [...tones, noise, swellLfo, brightLfo];
  sources.forEach((s) => s.start(t0));
  ambient = { sources, gain, stopping: null };
}

/** Fade the pad out over 0.8s, then stop + release every node. Idempotent. */
export function stopAmbient() {
  if (!ambient || !ctx) return;
  const pad = ambient;
  if (pad.stopping !== null) return; // already fading out
  const t0 = ctx.currentTime;
  pad.gain.gain.cancelScheduledValues(t0);
  pad.gain.gain.setValueAtTime(Math.max(pad.gain.gain.value, 0.0001), t0);
  pad.gain.gain.linearRampToValueAtTime(0.0001, t0 + AMBIENT_FADE_OUT_S);
  pad.stopping = window.setTimeout(() => {
    pad.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
      s.disconnect();
    });
    pad.gain.disconnect();
    if (ambient === pad) ambient = null;
  }, AMBIENT_FADE_OUT_S * 1000 + 60);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface Feedback {
  tick: typeof tick;
  click: typeof click;
  whoosh: typeof whoosh;
  chime: typeof chime;
}

const FEEDBACK: Feedback = { tick, click, whoosh, chime };

/**
 * useFeedback — ergonomic accessor for components. The functions are
 * module-level singletons, so the returned object is referentially stable and
 * safe to use in effect deps.
 */
export function useFeedback(): Feedback {
  return FEEDBACK;
}
