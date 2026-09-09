"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, restoreVisible, shouldSkipIntro } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Ҳар фарзандро алоҳида мекушояд. */
  stagger?: boolean;
  delay?: number;
  as?: ElementType;
};

/** Кушода шудани ором ҳангоми скролл: танҳо transform, бе пинҳон кардани матн. */
export function Reveal({ children, className, stagger = false, delay = 0, as }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const targets = stagger ? Array.from(node.children) : [node];
    if (shouldSkipIntro()) {
      restoreVisible(targets);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 16,
        duration: 0.6,
        delay,
        ease: EASE,
        stagger: stagger ? 0.07 : 0,
        immediateRender: false,
        clearProps: "transform",
        scrollTrigger: {
          trigger: node,
          start: "top 88%",
          once: true,
        },
      });
    }, node);
    return () => {
      ctx.revert();
      restoreVisible(targets);
    };
  }, [stagger, delay]);

  return <Tag ref={ref} className={className}>{children}</Tag>;
}
