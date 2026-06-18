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
    document.documentElement.setAttribute("data-theme", next);
    // Listen to system changes if user is in "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (readStored() === "system") {
        const r: Resolved = mq.matches ? "light" : "dark";
        setResolved(r);
        document.documentElement.setAttribute("data-theme", r);
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
    document.documentElement.setAttribute("data-theme", r);
  }, []);

  const cycle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
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
