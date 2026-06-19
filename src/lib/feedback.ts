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

/** Sound is allowed only when the toggle is on AND a gesture unlocked audio.
 *  Used by the AMBIENT flourishes (whoosh / chime) + background music. */
function liveContext(): AudioContext | null {
  if (!enabled || !ctx || !master) return null;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Interaction SFX context — clicks/ticks are a baseline UI affordance that
 *  plays by DEFAULT once audio is unlocked, INDEPENDENT of the Sound toggle.
 *  (The toggle governs the background music + ambient, not the basic clicks.)
 *  The context is still only created by a real gesture, so autoplay is respected. */
function sfxContext(): AudioContext | null {
  if (!ctx || !master) return null;
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

/** Hover blip — 1.2kHz gliding to 600Hz sine, ~30ms, very quiet. No haptic.
 *  Interaction SFX → plays by default, not gated by the Sound toggle. */
export function tick() {
  const ac = sfxContext();
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

/** Press — filtered noise burst + low 180Hz thump, ~60ms. Haptic: 8ms tap.
 *  Interaction SFX → plays by default, not gated by the Sound toggle. */
export function click() {
  vibrate(8); // touch answer fires even when sound is off

  const ac = sfxContext();
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
// AMBIENT — real background-music track, PROCESSED to suit the site
// ---------------------------------------------------------------------------
// A looping .mp3 played through the WebAudio graph so we control its tone, not
// just play it raw: MediaElementSource → low-pass (warmth) → gain (level + fades)
// → master. Tuned to sit UNDER the UI sounds as a calm atmosphere:
//   • AMBIENT_LEVEL  — background volume (low; it's atmosphere, not foreground).
//   • AMBIENT_LOWPASS_HZ — rolls off the harsh highs so it's soft, not fatiguing.
//   • AMBIENT_PITCH  — playbackRate; <1 lowers the pitch/tempo for a deeper, calmer feel.
//   • fades in/out so it never pops. Starts/stops ONLY with the audio gate, and
//     only after a real gesture unlocks the context (autoplay-safe).
// Same-origin file (kept off the CDN so MediaElementSource never taints on CORS).

const AMBIENT_SRC = "/audio/ambient.mp3";
const AMBIENT_LEVEL = 0.1;        // 0..1 — subtle background level (lowered: was too loud)
const AMBIENT_LOWPASS_HZ = 7200;  // soften the highs for warmth
const AMBIENT_PITCH = 0.92;       // playbackRate — slightly deeper/calmer than original
const AMBIENT_FADE_IN_S = 3;
const AMBIENT_FADE_OUT_S = 1.5;
const AMBIENT_ENABLED = true;     // a real track is wired — set false to silence music

// Built once, reused (a MediaElementSource can only be created once per element).
let musicEl: HTMLAudioElement | null = null;
let musicGain: GainNode | null = null;
let musicStopping: number | null = null;

/** Lazily build the element + WebAudio chain. Returns false if unavailable. */
function ensureMusicGraph(ac: AudioContext, out: GainNode): boolean {
  if (musicGain) return true;
  try {
    if (!musicEl) {
      musicEl = new Audio(AMBIENT_SRC);
      musicEl.loop = true;
      musicEl.preload = "auto";
      musicEl.playbackRate = AMBIENT_PITCH;
    }
    const src = ac.createMediaElementSource(musicEl);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = AMBIENT_LOWPASS_HZ;
    lp.Q.value = 0.6;
    const g = ac.createGain();
    g.gain.value = 0.0001;
    src.connect(lp);
    lp.connect(g);
    g.connect(out);
    musicGain = g;
    return true;
  } catch {
    return false; // no MediaElementSource support / already created
  }
}

/**
 * Start (or resume) the background music. Idempotent: a second call while
 * playing just re-ramps the gain back up — it never stacks a second source.
 */
export function startAmbient() {
  if (!AMBIENT_ENABLED || !enabled) return;
  const ac = ensureContext(); // inside the opt-in gesture — autoplay-legal
  if (!ac || !master) return;
  if (!ensureMusicGraph(ac, master) || !musicGain || !musicEl) return;

  if (musicStopping !== null) {
    clearTimeout(musicStopping);
    musicStopping = null;
  }
  const t0 = ac.currentTime;
  musicGain.gain.cancelScheduledValues(t0);
  musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), t0);
  musicGain.gain.exponentialRampToValueAtTime(AMBIENT_LEVEL, t0 + AMBIENT_FADE_IN_S);
  void musicEl.play().catch(() => {/* gesture not ready yet — next call retries */});
}

/** Fade the music out, then pause (the graph is kept for instant resume). */
export function stopAmbient() {
  if (!musicGain || !musicEl || !ctx) return;
  if (musicStopping !== null) return;
  const t0 = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(t0);
  musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), t0);
  musicGain.gain.exponentialRampToValueAtTime(0.0001, t0 + AMBIENT_FADE_OUT_S);
  musicStopping = window.setTimeout(() => {
    try { musicEl?.pause(); } catch {/* ignore */}
    musicStopping = null;
  }, AMBIENT_FADE_OUT_S * 1000 + 80);
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
