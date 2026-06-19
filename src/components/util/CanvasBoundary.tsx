"use client";

// CanvasBoundary — a tiny React error boundary for WebGL/R3F <Canvas> trees.
// On a weak or driver-blocklisted GPU (common on Windows laptops + some tablets)
// a Canvas can throw at context creation or first render. Without a boundary
// that throw unwinds React and white-screens the whole site. This catches it and
// renders an optional fallback (or nothing) so the rest of the page survives.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class CanvasBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Swallow — a failed decorative 3D scene must never take the page down.
    if (typeof console !== "undefined") console.warn("[CanvasBoundary] 3D scene failed, using fallback", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
