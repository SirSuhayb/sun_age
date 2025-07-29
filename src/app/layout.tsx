/* eslint-disable @typescript-eslint/no-unused-vars */
import "~/app/globals.css";
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import ThemeProviderClient from "~/components/providers/theme-provider-client";
import { CosmicBackground } from "~/components/ui/cosmic-background";
import { ScreenshotDetector } from "~/components/ScreenshotDetector";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "../lib/constants";
import { Providers } from "./providers";
import { Info } from "lucide-react";
// import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "~/components/ui/tooltip";
import HeaderClient from "../components/SunCycleAge/HeaderClient";
import { SocialTagToastProvider } from "../components/SocialTagToastProvider";
// import { Inter } from "next/font/google";
// import { PostHogIdentify } from "~/components/posthog-identify";

// const inter = Inter({ subsets: ["latin"] });

const appUrl =
  process.env.NEXT_PUBLIC_URL ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const metadata: Metadata = {
  title: PROJECT_TITLE,
  description: PROJECT_DESCRIPTION,
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#ffd700",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: PROJECT_TITLE,
    description: PROJECT_DESCRIPTION,
    url: appUrl,
    siteName: PROJECT_TITLE,
    images: [
      {
        url: `${appUrl}/suncycles_og.png`,
        width: 1200,
        height: 630,
        alt: PROJECT_TITLE,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PROJECT_TITLE,
    description: PROJECT_DESCRIPTION,
    images: [`${appUrl}/suncycles_og.png`],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffd700" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get today's date formatted as MM.DD.YYYY
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, ".");
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SocialTagToastProvider>
          <Providers>
            {/* <PostHogIdentify /> */}
            {/* Screenshot detection for @solaracosmos tagging - DISABLED due to false triggers */}
            {/* <ScreenshotDetector /> */}
            {/* Skip to content link */}
            <a href="#main-content" className="skip-link absolute left-2 top-2 z-50 bg-white text-gray-800 px-4 py-2 rounded focus:block focus:outline-none focus:ring-2 focus:ring-blue-400 sr-only focus:not-sr-only">Skip to content</a>
            <ThemeProviderClient>
              {/* Light mode: solid background. Dark mode: gradient. */}
              <div className="pointer-events-none fixed inset-0 z-0" style={{ background: '#ffffff' }} />
              {/* Light mode: noise texture overlay */}
              <div className="pointer-events-none fixed inset-0 z-10 opacity-20 mix-blend-soft-light" aria-hidden="true" style={{ backgroundImage: "url('/noise.png')" }} />
              <CosmicBackground />
              {/* App header - now global, with About and $SOLAR icons handled in Header */}
              <HeaderClient formattedDate={formattedDate} />
              {/* Main content and footer, flex column, sticky footer */}
              <div className="min-h-screen flex flex-col bg-white">
                <main id="main-content" className="flex-1 flex flex-col justify-between min-h-screen">{children}</main>
              </div>
              {/* Footer is handled in SunCycleAge.tsx */}
            </ThemeProviderClient>
          </Providers>
        </SocialTagToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
