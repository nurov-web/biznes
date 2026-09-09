"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLocaleSwap } from "@/lib/locale-swap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Ҳаракат бояд маъно дошта бошад — ва хомӯш шавад, агар корбар нахоҳад. */
export function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Телефон, reduced-motion ё ивази забон — интрои пинҳонкунанда нест. */
export function shouldSkipIntro(): boolean {
  if (typeof window === "undefined") return true;
  return (
    reducedMotion() ||
    isLocaleSwap() ||
    window.matchMedia("(max-width: 767.98px)").matches
  );
}

/** Пас аз kill/revert мундариҷа ҳамеша намоён мемонад. */
export function restoreVisible(targets: gsap.TweenTarget): void {
  gsap.set(targets, { opacity: 1, x: 0, y: 0, clearProps: "transform" });
}

export const EASE = "power2.out";

/** Overlay ва splash: ором, бе bounce. */
export const EASE_PREMIUM = "power3.out";

export { gsap, ScrollTrigger };
