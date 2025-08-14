'use client';

import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import ThemeProviderClient from "~/components/providers/theme-provider-client";

const inter = Inter({ subsets: ["latin"] });

export default function MobileMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <title>Solara - Cosmic Age Calculator</title>
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProviderClient>
            <div className="min-h-screen bg-white">
              {children}
            </div>
          </ThemeProviderClient>
        </Providers>
      </body>
    </html>
  );
}