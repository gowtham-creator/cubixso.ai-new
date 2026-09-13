import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LayoutChrome } from "@/components/layout/LayoutChrome";
import { IntroSequence } from "@/components/loader/IntroSequence";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { DotField } from "@/components/scene/DotField";
import { ScrollProvider } from "@/components/scroll/ScrollProvider";
import { ScrollRail } from "@/components/scroll/ScrollRail";
import { GlassCounter } from "@/components/scroll/GlassCounter";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SEO_KEYWORDS,
} from "@/lib/seo";

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
// Signature script for the intro loader's hand-drawn words ("AI-native." /
// "by design."). Used only there — the body still resolves to font-display.
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Canonical for the homepage; inner routes set their own in metadata.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // og:image is provided by app/opengraph-image.tsx (cascades site-wide).
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // The inline script below writes data-theme before React hydrates, so the
      // server HTML and the first client render legitimately differ on <html>.
      suppressHydrationWarning
      className={`${inter.variable} ${instrument.variable} ${jetbrains.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        {/*
          THEME BOOT — must run BEFORE first paint, so it is a blocking inline
          script in <head> rather than an effect. ThemeProvider only set
          data-theme inside useEffect, which runs after hydration: every
          light-mode visitor got a full dark flash on every page load and every
          navigation. Resolving the theme here removes that flash entirely.

          Keep LS_KEY ("cubixso.theme") and the "dark" brand default in sync
          with src/components/providers/ThemeProvider.tsx. colorScheme is set
          too so native scrollbars, form controls and the URL bar match.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("cubixso.theme");var t=(s==="light"||s==="dark"||s==="system")?s:"dark";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):t;var d=document.documentElement;d.setAttribute("data-theme",r);d.style.colorScheme=r;}catch(e){var d2=document.documentElement;d2.setAttribute("data-theme","dark");d2.style.colorScheme="dark";}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <a href="#main" className="skip-link">Skip to main content</a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ThemeProvider>
          <IntroSequence />
          <CursorFollower />
          <ScrollProvider>
            {/* Site-wide floating-dust background (real footage): white dots on
                black in dark theme, black dots on white in light theme. The
                cube hero floats over this field. */}
            <DotField />
            <SmoothScroll>
              <LayoutChrome>{children}</LayoutChrome>
            </SmoothScroll>
            <ScrollRail />
            <GlassCounter />
          </ScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
