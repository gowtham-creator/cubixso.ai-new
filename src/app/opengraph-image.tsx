// Dynamic OpenGraph/Twitter card — replaces the broken static `/og.png` that
// was referenced but never existed (blank LinkedIn/X unfurls). As a root
// app/opengraph-image it cascades to every route. Branded cobalt-on-void.

import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/seo";

export const alt = "Cubixso.ai — Generative AI for the autonomous enterprise.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px",
          background:
            "radial-gradient(1100px 620px at 78% 18%, rgba(27,79,255,0.42), transparent 60%), linear-gradient(135deg, #060713 0%, #04040a 60%, #02030a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9fb4ff",
            marginBottom: 28,
          }}
        >
          Cubixso.ai
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          <span>Generative AI for the&nbsp;</span>
          <span style={{ color: "#4A7BFF" }}>autonomous enterprise.</span>
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#b4b4ba",
            marginTop: 40,
            maxWidth: 860,
          }}
        >
          Intelligent systems, agentic products &amp; enterprise platforms — built end-to-end.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 88,
            fontSize: 26,
            letterSpacing: 3,
            color: "#8b93a7",
          }}
        >
          cubixso.com
        </div>
      </div>
    ),
    size,
  );
}
