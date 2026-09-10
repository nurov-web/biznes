"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/BrandMark";
import { APP_NAME } from "@/constants";
import { EASE, EASE_PREMIUM, gsap, reducedMotion } from "@/lib/gsap";

const SPLASH_SECONDS = 5;

type Props = {
  onDone: () => void;
};

/**
 * Интрои вуруд: як маротиба дар ҷаласа, ~5 сония, 3 матн.
 * Linear/Stripe: opacity + y, progress бо scaleX, бе bounce.
 */
export function WelcomeSplash({ onDone }: Props) {
  const t = useTranslations("splash");
  const overlay = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const brand = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const doneOnce = useRef(false);

  const finish = useCallback(
    (mode: "fade" | "instant") => {
      if (doneOnce.current) return;
      doneOnce.current = true;
      timeline.current?.kill();
      timeline.current = null;
      const node = overlay.current;
      const release = () => {
        document.body.style.overflow = "";
        onDone();
      };
      if (mode === "instant" || !node || reducedMotion()) {
        release();
        return;
      }
      gsap.to(node, {
        opacity: 0,
        duration: 0.42,
        ease: "power3.inOut",
        onComplete: release,
      });
    },
    [onDone],
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("fade");
    };
    window.addEventListener("keydown", onKey);

    if (reducedMotion()) {
      const id = window.setTimeout(() => finish("instant"), 400);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
      };
    }

    const root = overlay.current;
    if (!root) {
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prevOverflow;
      };
    }

    const beats = root.querySelectorAll<HTMLElement>("[data-splash-beat]");
    const ctx = gsap.context(() => {
      gsap.set(mark.current, { opacity: 0, y: 16, scale: 0.96 });
      gsap.set(brand.current, { opacity: 0, y: 12 });
      gsap.set(beats, { opacity: 0, y: 10 });
      gsap.set(bar.current, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        onComplete: () => finish("instant"),
      });
      timeline.current = tl;

      tl.to(bar.current, { scaleX: 1, duration: SPLASH_SECONDS, ease: "none" }, 0);
      tl.to(mark.current, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: EASE_PREMIUM }, 0.08);
      tl.to(brand.current, { opacity: 1, y: 0, duration: 0.48 }, 0.22);
      if (beats[0]) {
        tl.to(beats[0], { opacity: 1, y: 0, duration: 0.42 }, 0.38);
        tl.to(beats[0], { opacity: 0, y: -8, duration: 0.28 }, 1.68);
      }
      if (beats[1]) {
        tl.to(beats[1], { opacity: 1, y: 0, duration: 0.4 }, 1.78);
        tl.to(beats[1], { opacity: 0, y: -8, duration: 0.28 }, 3.18);
      }
      if (beats[2]) {
        tl.to(beats[2], { opacity: 1, y: 0, duration: 0.4 }, 3.28);
      }
      tl.to(root, { opacity: 0, duration: 0.45, ease: "power3.inOut" }, 4.55);
    }, root);

    return () => {
      timeline.current = null;
      ctx.revert();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [finish]);

  const beats = [t("beat1"), t("beat2"), t("beat3")];

  const frame = (
    <div
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
      className="section-dark relative fixed inset-0 z-[200] flex flex-col"
    >
      <div className="pointer-events-none absolute inset-0 glow-primary" />
      <div className="relative flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))]">
        <button
          ref={skipRef}
          type="button"
          className="min-h-11 min-w-11 rounded-lg px-3 text-sm text-dark-muted transition-colors duration-200 hover:text-dark-text"
          onClick={() => finish("fade")}
        >
          {t("skip")}
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-16">
        <div ref={mark}>
          <BrandMark size={48} />
        </div>
        <p
          id="splash-title"
          ref={brand}
          className="mt-5 text-lg font-medium tracking-tight text-dark-text"
        >
          {APP_NAME}
        </p>
        <div className="relative mt-8 h-12 w-full max-w-sm">
          {beats.map((line) => (
            <p
              key={line}
              data-splash-beat
              className="absolute inset-x-0 top-0 text-center text-[0.9375rem] leading-relaxed text-dark-muted"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="relative h-px w-full bg-white/10" aria-hidden>
        <div ref={bar} className="h-full origin-left bg-primary will-change-transform" />
      </div>
    </div>
  );

  if (typeof document === "undefined") return frame;
  return createPortal(frame, document.body);
}
