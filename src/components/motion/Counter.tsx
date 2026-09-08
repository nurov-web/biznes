"use client";

import { useEffect, useRef } from "react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reducedMotion()) {
      node.textContent = `${prefix}${format(to, decimals)}${suffix}`;
      return;
    }
    const state = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(state, {
        value: to,
        duration: 1.3,
        ease: EASE,
        scrollTrigger: { trigger: node, start: "top 92%", once: true },
        onUpdate: () => {
          node.textContent = `${prefix}${format(state.value, decimals)}${suffix}`;
        },
      });
    }, node);
    return () => ctx.revert();
  }, [to, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(0, decimals)}
      {suffix}
    </span>
  );
}
