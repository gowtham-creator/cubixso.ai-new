"use client";

// ThemeProvider — light / dark / system with localStorage persistence.
// Reads system preference on first paint, then user choice from localStorage
// if set. Sets data-theme attribute on <html> so CSS tokens swap.

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeCtxValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue | null>(null);
const LS_KEY = "cubixso.theme";

function readStored(): Theme {
  // Brand default is DARK — the Cobalt Aperture is a dark, immersive system.
  // The toggle still lets users pick light/system, which then persists.
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(LS_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "dark";
}

function systemPref(): Resolved {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Single place that touches the DOM, so data-theme (our CSS tokens) and
// color-scheme (native scrollbars, form controls, browser UI) can never drift
// apart. Mirrors what the boot script in app/layout.tsx does pre-hydration.
function apply(r: Resolved) {
  const d = document.documentElement;
  d.setAttribute("data-theme", r);
  d.style.colorScheme = r;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark"); // SSR default
  const [resolved, setResolved] = useState<Resolved>("dark");

  // Hydrate from localStorage + system on mount
  useEffect(() => {
    const stored = readStored();
    setThemeState(stored);
    const sys = systemPref();
    const next = stored === "system" ? sys : stored;
    setResolved(next);
    apply(next); // normally a no-op — the boot script already set this
    // DEVICE SYNC: while the user is on "system", follow the OS as it flips
    // (macOS/iOS auto light-dark at sunset, Android battery saver, etc.) with
    // no reload. Registered unconditionally and gated inside the handler, so
    // switching INTO "system" later is picked up by this same listener.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (readStored() === "system") {
        const r: Resolved = mq.matches ? "light" : "dark";
        setResolved(r);
        apply(r);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(LS_KEY, t); } catch { /* private mode */ }
    const r: Resolved = t === "system" ? systemPref() : t;
    setResolved(r);
    apply(r);
  }, []);

  // Cycle order is LIGHT -> DARK -> SYSTEM, matching the order the toggle's
  // tooltip advertises. "system" has to stay in the rotation: it is the only
  // way back to following the device theme once a user has picked a side.
  const cycle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme, cycle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
