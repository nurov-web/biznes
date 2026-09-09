"use client";

import { useEffect, useRef } from "react";
import { EASE, gsap, reducedMotion, shouldSkipIntro } from "@/lib/gsap";

type Props = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

function format(value: number, decimals: number): string {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Рақам ҳангоми ба экран омадан то қимати ниҳоӣ мешуморад. */
export function Counter({ to, prefix = "", suffix = "", decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const finalText = `${prefix}${format(to, decimals)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.textContent = finalText;
    if (reducedMotion() || shouldSkipIntro()) return;

    const rect = node.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (alreadyVisible) return;

    const state = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: to,
        duration: 1.3,
        ease: EASE,
        scrollTrigger: {
          trigger: node,
          start: "top 92%",
          once: true,
        },
        onUpdate: () => {
          node.textContent = `${prefix}${format(state.value, decimals)}${suffix}`;
        },
        onComplete: () => {
          node.textContent = finalText;
        },
      });
    }, node);
    const fallback = window.setTimeout(() => {
      node.textContent = finalText;
    }, 2200);
    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
      node.textContent = finalText;
    };
  }, [to, prefix, suffix, decimals, finalText]);

  return (
    <span ref={ref} className={className}>
      {finalText}
    </span>
  );
}
