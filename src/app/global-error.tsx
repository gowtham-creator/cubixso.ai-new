"use client";

// global-error — the last-resort safety net. Catches errors thrown in the ROOT
// layout itself (providers, Nav, the 3D preloader, the dust field). Renders its
// own <html>/<body> with ZERO dependencies on the theme system or any 3D code,
// so it shows even when those are exactly what failed. Self-contained inline
// styles only. This is what turns a white screen on a weak Windows/tablet GPU
// into a recoverable "reload" prompt.

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#060708",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: "clamp(34px, 6vw, 56px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Something went wrong
          </div>
          <p style={{ color: "#b4b4ba", marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                border: "none",
                background: "#1B4FFF",
                color: "#fff",
                fontSize: 12,
                letterSpacing: "0.14em",
                cursor: "pointer",
              }}
            >
              RELOAD
            </button>
            <a
              href="/"
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                border: "1px solid #2a2a30",
                background: "transparent",
                color: "#b4b4ba",
                fontSize: 12,
                letterSpacing: "0.14em",
                textDecoration: "none",
              }}
            >
              HOME
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
