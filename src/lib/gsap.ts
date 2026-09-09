"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Ҳаракат бояд маъно дошта бошад — ва хомӯш шавад, агар корбар нахоҳад. */
export function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const EASE = "power2.out";

/** Overlay ва splash: ором, бе bounce. */
export const EASE_PREMIUM = "power3.out";

export { gsap, ScrollTrigger };
