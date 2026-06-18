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
let enabled = false; // mirrors AudioToggle — OFF by default per locked decision
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
  // Seed the gate from this session's entry choice ("ENTER WITH SOUND" persists
  // across reloads within the session — the ambient itself still waits for a
  // gesture, so autoplay policy is never violated).
  try {
    enabled = sessionStorage.getItem(SOUND_KEY) === "1";
  } catch {
    /* private mode */
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
// AMBIENT — layered cinematic pad (hubtown's music loop, synthesized)
// ---------------------------------------------------------------------------
// Two detuned low oscillators (55Hz sine + 110Hz triangle, a few cents apart so
// they slowly beat) under a bandpass-filtered noise bed whose center frequency
// an LFO sweeps once every ~70s (within the 45–90s spec window). Master pad
// gain ≈0.05, 2s fade-in, 0.8s fade-out. Starts/stops ONLY with the audio gate.

const AMBIENT_LEVEL = 0.05;
const AMBIENT_FADE_IN_S = 2;
const AMBIENT_FADE_OUT_S = 0.8;
const AMBIENT_LFO_PERIOD_S = 70; // one full filter sweep — spec: 45–90s

interface AmbientNodes {
  sources: (OscillatorNode | AudioBufferSourceNode)[];
  gain: GainNode;
  /** teardown timer while fading out — cleared if the pad is restarted */
  stopping: number | null;
}

let ambient: AmbientNodes | null = null; // module singleton — StrictMode-safe

/**
 * Start (or resume) the ambient pad. Idempotent: a second call while running
 * (React StrictMode double-effects, rapid toggling) only re-ramps the gain —
 * it never stacks a second oscillator bank.
 */
export function startAmbient() {
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

  // Pad master — the only handle start/stop ever ramps
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(AMBIENT_LEVEL, t0 + AMBIENT_FADE_IN_S);
  gain.connect(master);

  // Layer 1 — deep sine root, pulled 4 cents flat
  const oscA = ac.createOscillator();
  oscA.type = "sine";
  oscA.frequency.value = 55;
  oscA.detune.value = -4;
  oscA.connect(gain);

  // Layer 2 — octave triangle, 6 cents sharp (slow beating against the root)
  const oscB = ac.createOscillator();
  oscB.type = "triangle";
  oscB.frequency.value = 110;
  oscB.detune.value = 6;
  const oscBLevel = ac.createGain();
  oscBLevel.gain.value = 0.45; // triangle harmonics sit under the root
  oscB.connect(oscBLevel);
  oscBLevel.connect(gain);

  // Layer 3 — noise bed through a slowly swept bandpass: distant air
  const noise = ac.createBufferSource();
  noise.buffer = getNoise(ac);
  noise.loop = true;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 320;
  bp.Q.value = 1.6;
  const noiseLevel = ac.createGain();
  noiseLevel.gain.value = 0.22;
  noise.connect(bp);
  bp.connect(noiseLevel);
  noiseLevel.connect(gain);

  // LFO — one sweep per ~70s, ±220Hz around the bandpass center
  const lfo = ac.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 1 / AMBIENT_LFO_PERIOD_S;
  const lfoDepth = ac.createGain();
  lfoDepth.gain.value = 220;
  lfo.connect(lfoDepth);
  lfoDepth.connect(bp.frequency);

  const sources: AmbientNodes["sources"] = [oscA, oscB, noise, lfo];
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
