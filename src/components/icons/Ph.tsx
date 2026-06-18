"use client";

// Ph — thin typed wrapper over @iconify/react for Phosphor line icons (the
// "Aurora Glass v3" UI-chrome icon layer: arrows, markers, list glyphs).
//
// OFFLINE ONLY: the full Phosphor collection is registered once at module
// scope from @iconify-json/ph bundled data, so rendering NEVER hits the
// Iconify network API (Next 16 Turbopack can't run the unplugin-icons webpack
// path, so this is the reliable route). `ssr` renders the SVG on the server
// pass too — the data is local, so there is no hydration flash.

import { Icon, addCollection } from "@iconify/react";
import { icons as phIcons } from "@iconify-json/ph";

// Register the offline collection once per bundle; every <Ph/> resolves its
// "ph:*" name from this in-memory data.
addCollection(phIcons);

/** Phosphor weights — encoded as a name suffix in the ph collection. */
export type PhWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export interface PhProps {
  /** Phosphor icon name WITHOUT the "ph:" prefix, e.g. "arrow-up-right". */
  name: string;
  /** Square size in px. Default 18. */
  size?: number;
  /** Stroke weight variant (suffix on the icon name). Default "regular". */
  weight?: PhWeight;
  className?: string;
}

export function Ph({
  name,
  size = 18,
  weight = "regular",
  className,
}: PhProps) {
  // "regular" is the unsuffixed base name; other weights append "-<weight>".
  const icon = weight === "regular" ? `ph:${name}` : `ph:${name}-${weight}`;
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      ssr
    />
  );
}

export default Ph;
