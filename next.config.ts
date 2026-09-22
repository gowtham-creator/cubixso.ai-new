import type { NextConfig } from "next";

// Long-lived, immutable caching for the heavy static assets the 3D scenes pull
// (GLB model, Draco decoder, loop videos, posters). By default Next/Vercel serve
// files in public/ with `cache-control: max-age=0, must-revalidate`, so the
// browser re-validates the multi-MB dust video + Draco WASM on EVERY page load —
// the single biggest cause of the site feeling slow / "not rendering smoothly".
// These assets rarely change (rev the filename when they do), so a 1-year
// immutable cache is safe and makes repeat loads instant.
const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/draco/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/video/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/geo/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/audio/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        // Globe textures. Self-hosted on purpose: the Aceternity component
        // fetched them from unpkg.com at mount time — 1.8 MB from a third-party
        // CDN, on the critical path of the globe appearing.
        source: "/textures/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        // top-level media: intro.mp4/.webm, void-loop.*, posters, og.png, fonts
        source: "/:file(.*\\.(?:mp4|webm|glb|hdr|jpg|jpeg|png|avif|woff2))",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
    ];
  },
};

export default nextConfig;
