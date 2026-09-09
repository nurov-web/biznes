import type { ReactNode } from "react";
import type { Viewport } from "next";

/** Viewport дар root — вагарна телефон саҳифаро ҳамчун desktop мекушояд. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
