import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { ConstructionNotice } from "@/components/layout/ConstructionNotice";
import { Preloader } from "@/components/loader/Preloader";
import { CubeScene } from "@/components/scene/CubeScene";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { AudioToggle } from "@/components/audio/AudioToggle";
import { SplineMascot } from "@/components/scene/SplineMascot";

// Clean Apple-inspired stack: Inter (display + UI body, very SF-Pro adjacent)
// + Instrument Serif for editorial italic counterpoint
// + JetBrains Mono for telemetry / labels.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Full weight ramp so we can express the SF-style hierarchy
  // (300 micro-labels through 600 display)
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cubixso.ai — Generative AI for the autonomous enterprise.",
  description:
    "Cubixso.ai builds intelligent AI systems, agentic products, and enterprise platforms — engineered for scale and impact.",
  metadataBase: new URL("https://cubixso.ai"),
  openGraph: {
    title: "Cubixso.ai — Generative AI for the autonomous enterprise.",
    description:
      "Intelligent AI systems, MCPs, agentic products, and enterprise platforms.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cubixso.ai",
    description: "Generative AI for the autonomous enterprise.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a href="#main" className="skip-link">Skip to main content</a>
        <ThemeProvider>
          <Preloader />
          <CubeScene />
          <CursorFollower />
          <SmoothScroll>
            <div className="hairline-grid" aria-hidden />
            <div className="grain" aria-hidden />
            <ConstructionNotice />
            <Nav />
            <div id="main" tabIndex={-1}>{children}</div>
            <SplineMascot />
            <AudioToggle />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
