import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";

import { PLATES } from "@/content/plates.generated";
import "./globals.css";

/** High-contrast didone for display: the fashion-magazine voice. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

/** Geometric grotesque for everything functional. */
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Vespera — Maison de Parfum",
  description:
    "An atelier of scent and space. Eleven compositions in light, stone and glass.",
  openGraph: {
    title: "Vespera — Maison de Parfum",
    description: "An atelier of scent and space.",
    images: ["/plates/flacon.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
  ],
};

/**
 * Runs before first paint. Two jobs, both of which have to happen this early.
 *
 * The theme is applied so a reload in light mode never flashes the dark
 * palette.
 *
 * Scroll restoration is turned off because the browser restores position in one
 * instant jump, and an instant jump is the one thing this page cannot absorb:
 * ScrollTrigger never crosses the `once: true` starts it skipped over, so every
 * masked line between the top and the restored position stays parked below its
 * mask — the reader lands on a section with its body copy missing. It also puts
 * the entry curtain over the middle of the page. Both go away if a reload
 * simply begins at the cover, which is what the curtain assumes anyway.
 *
 * Kept deliberately tiny and dependency-free.
 */
const BOOT = `(function(){try{
  var s=localStorage.getItem('vespera-theme');
  var t=s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  document.documentElement.dataset.theme=t;
}catch(e){document.documentElement.dataset.theme='dark';}
try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // BOOT rewrites data-theme before React hydrates, so the server's
    // value and the client's disagree by design on any reader whose system is
    // set to light. suppressHydrationWarning scopes that mismatch to this one
    // attribute; without it React logs a hydration error on every load.
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${bodoni.variable} ${jost.variable}`}
    >
      <head>
        {/*
         * The cover plate is the largest thing on the first screen and so almost
         * certainly the LCP element, but it is discovered late: it arrives
         * inside a <picture> in a client component, behind hydration. Preloading
         * it puts the request in flight with the document instead.
         *
         * AVIF only, and typed: a browser without AVIF support skips a preload
         * whose type it cannot decode and picks the WebP up from <picture> as
         * usual, so this never costs a wasted download. Path comes from the
         * manifest rather than being written out, or a rebuild that renames the
         * file would leave a preload pointing at nothing.
         */}
        <link
          rel="preload"
          as="image"
          href={PLATES.flacon.avif}
          type="image/avif"
          fetchPriority="high"
        />
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
