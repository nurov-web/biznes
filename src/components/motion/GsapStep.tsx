"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  step: number;
  children: React.ReactNode;
};

/** Гузариши қадамҳои онбординг — кӯтоҳ ва калонсолон. */
export function GsapStep({ step, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(node, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power1.out" },
      );
    }, node);
    return () => ctx.revert();
  }, [step]);

  return <div ref={ref}>{children}</div>;
}
