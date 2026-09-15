"use client";

import { useEffect, useState } from "react";
import { WelcomeSplash } from "@/components/motion/WelcomeSplash";
import { hasPlayedEntrySplash, markEntrySplashPlayed } from "@/lib/splash";

/** Ҳангоми ҷустуҷӯи номи сайт ва кушодан — аввал анимация, баъд саҳифа. */
export function SiteIntro() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasPlayedEntrySplash()) setOpen(true);
  }, []);

  if (!open) return null;
  return (
    <WelcomeSplash
      onDone={() => {
        markEntrySplashPlayed();
        setOpen(false);
      }}
    />
  );
}
