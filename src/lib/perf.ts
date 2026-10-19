// perf — device-tier + WebGL capability helpers used by the graceful-degradation
// phase. These NEVER change desktop behavior: detectTier() only returns "low"
// for genuinely constrained clients (few cores, little RAM, coarse-pointer
// mobile, or reduced-motion), letting heavy 3D scenes opt into a lighter path.
//
// Everything here is SSR-safe so server markup matches the client's first paint
// (avoids hydration mismatches): we assume the high tier / WebGL-present on the
// server and let the client re-detect after mount.

import { useEffect, useState } from "react";

export type DeviceTier = "low" | "high";

type NavExt = Navigator & {
  deviceMemory?: number;
};

/**
 * Synchronous, SSR-safe device-tier probe. Returns "high" on the server (no
 * window) so SSR + first client render agree. On the client, "low" when ANY of:
 *  - hardwareConcurrency <= 4 (few logical cores)
 *  - deviceMemory <= 4 (GB, when the browser exposes it)
 *  - a coarse pointer / mobile UA (phones, most tablets)
 *  - prefers-reduced-motion is set
 */
export function detectTier(): DeviceTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "high";
  }
  const n = navigator as NavExt;

  if (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency <= 4) {
    return "low";
  }
  if (typeof n.deviceMemory === "number" && n.deviceMemory <= 4) {
    return "low";
  }

  const mm = typeof window.matchMedia === "function" ? window.matchMedia : null;
  if (mm) {
    if (mm("(pointer: coarse)").matches) return "low";
    if (mm("(prefers-reduced-motion: reduce)").matches) return "low";
  }

  // UA fallback for environments without matchMedia pointer support.
  const ua = n.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua)) return "low";

  return "high";
}

/**
 * React hook form of detectTier(). Defaults to "high" on the first render
 * (server + initial client paint match) and re-detects in an effect after
 * mount, so components never trigger a hydration mismatch.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");
  useEffect(() => {
    setTier(detectTier());
  }, []);
  return tier;
}

/**
 * Probe for a usable WebGL context on a throwaway canvas. SSR-safe: returns
 * true on the server so server markup matches (the client re-checks after
 * mount). Returns false only when context creation genuinely fails.
 *
 * Probed ONCE per page and the probe context is released at once. Each call
 * used to create a real WebGL context that was never freed — three per
 * homepage load, mid-intro — and iOS Safari counts live contexts toward its
 * cap until GC, evicting the oldest (a real canvas) when it runs out.
 */
let webglProbe: boolean | undefined;
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return true;
  if (webglProbe !== undefined) return webglProbe;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    webglProbe = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}
