import type { ReactNode } from "react";
import type { Viewport } from "next";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";
import "./globals.css";

/** Inter Variable (SIL OFL) — маҳаллӣ, бе next/font/google (Turbopack). */
const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "100 900",
  adjustFontFallback: "Arial",
  preload: true,
});

/** Viewport дар root — вагарна телефон саҳифаро ҳамчун desktop мекушояд. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1565c0",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} h-full w-full max-w-full antialiased`}
    >
      <body className="min-h-full w-full max-w-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
