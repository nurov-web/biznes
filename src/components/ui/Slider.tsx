"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

type Props = {
  items: ReactNode[];
  label: string;
  prevLabel: string;
  nextLabel: string;
  autoPlayMs?: number;
  className?: string;
};

/** Слайдери дастрас: свайп, нуқтаҳо, автопахш бо истодан ҳангоми муш. */
export function Slider({
  items,
  label,
  prevLabel,
  nextLabel,
  autoPlayMs = 0,
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = items.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (!autoPlayMs || paused || count < 2 || reducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, count]);

  useEffect(() => {
    const node = stage.current;
    if (!node || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, x: 22 },
        { opacity: 1, x: 0, duration: 0.42, ease: EASE },
      );
    }, node);
    return () => ctx.revert();
  }, [index]);

  if (count === 0) return null;

  return (
    <div
      className={className}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) > 42) go(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div ref={stage} aria-live="polite">
        {items[index]}
      </div>
      {count > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${label} ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-primary" : "w-2 bg-border-strong hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => go(index - 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => go(index + 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
