"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Ҳар фарзандро алоҳида мекушояд. */
  stagger?: boolean;
  delay?: number;
  as?: ElementType;
};

/** Кушода шудани ором ҳангоми скролл: танҳо opacity + transform. */
export function Reveal({ children, className, stagger = false, delay = 0, as }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const targets = stagger ? Array.from(node.children) : [node];
    const mobile = window.matchMedia("(max-width: 767.98px)").matches;
    if (reducedMotion() || mobile) {
      gsap.set(targets, { clearProps: "all", opacity: 1, y: 0 });
      node.classList.remove("reveal-init");
      return;
    }
    const ctx = gsap.context(() => {
      node.classList.remove("reveal-init");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          ease: EASE,
          stagger: stagger ? 0.07 : 0,
          scrollTrigger: {
            trigger: node,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, node);
    return () => ctx.revert();
  }, [stagger, delay]);

  return (
    <Tag ref={ref} className={`reveal-init ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
