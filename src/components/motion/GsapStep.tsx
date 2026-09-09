"use client";

import { useEffect, useRef } from "react";
import { gsap, restoreVisible, shouldSkipIntro } from "@/lib/gsap";

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
    if (shouldSkipIntro()) {
      restoreVisible(node);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(node, {
        y: 10,
        duration: 0.32,
        ease: "power1.out",
        clearProps: "transform",
      });
    }, node);
    return () => {
      ctx.revert();
      restoreVisible(node);
    };
  }, [step]);

  return <div ref={ref}>{children}</div>;
}
