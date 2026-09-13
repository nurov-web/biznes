"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE, gsap, reducedMotion } from "@/lib/gsap";

export type WorkSlide = {
  id: string;
  node: ReactNode;
};

type Props = {
  label: string;
  prevLabel: string;
  nextLabel: string;
  formatStatus: (current: number, total: number) => string;
  slides: WorkSlide[];
  tone?: "light" | "dark";
  compact?: boolean;
  autoplay?: boolean;
};

/** Яке Embla — сабуктар аз Swiper/Splide, бе CSS-и тайёр. */
export function WorkSlider({
  label,
  prevLabel,
  nextLabel,
  formatStatus,
  slides,
  tone = "light",
  compact = false,
  autoplay = true,
}: Props) {
  const [reduce, setReduce] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setReduce(reducedMotion());
    setMounted(true);
  }, []);

  if (slides.length === 0) return null;
  if (!mounted || slides.length === 1) {
    return <div className="min-w-0">{slides[0].node}</div>;
  }

  return (
    <WorkSliderTrack
      label={label}
      prevLabel={prevLabel}
      nextLabel={nextLabel}
      formatStatus={formatStatus}
      slides={slides}
      tone={tone}
      compact={compact}
      autoplay={autoplay && !reduce}
      reduce={reduce}
    />
  );
}

function WorkSliderTrack({
  label,
  prevLabel,
  nextLabel,
  formatStatus,
  slides,
  tone,
  compact,
  autoplay,
  reduce,
}: Props & { reduce: boolean }) {
  const plugins = useMemo(
    () =>
      autoplay
        ? [Autoplay({ delay: 5500, stopOnMouseEnter: true, stopOnInteraction: false })]
        : [],
    [autoplay],
  );
  const [viewportRef, api] = useEmblaCarousel(
    { loop: true, align: "center", duration: reduce ? 0 : 22, watchDrag: !reduce },
    plugins,
  );
  const [index, setIndex] = useState(0);
  const skipFirst = useRef(true);
  const dark = tone === "dark";

  const onSelect = useCallback(() => {
    if (!api) return;
    const next = api.selectedScrollSnap();
    setIndex(next);
    if (reduce) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const slide = api.slideNodes()[next];
    if (!slide) return;
    const body = slide.querySelector<HTMLElement>("[data-slide-body]") ?? slide;
    gsap.fromTo(
      body,
      { y: 12 },
      { y: 0, duration: 0.42, ease: EASE, overwrite: true, clearProps: "transform" },
    );
  }, [api, reduce]);

  useEffect(() => {
    if (!api) return;
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api) return;
    const root = api.rootNode();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        api.scrollPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        api.scrollNext();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [api]);

  const btn =
    "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-colors duration-200";
  const btnTone = dark
    ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
    : "border-border-strong bg-card text-ink hover:bg-muted";
  const dotOn = dark ? "bg-dark-accent" : "bg-primary";
  const dotOff = dark ? "bg-white/25" : "bg-[#c4bfb6]";

  return (
    <div
      className="min-w-0 outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
    >
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full">
              {slide.node}
            </div>
          ))}
        </div>
      </div>
      <div className={`flex items-center justify-center gap-2 ${compact ? "mt-3" : "mt-5"}`}>
        <button
          type="button"
          className={`${btn} ${btnTone}`}
          aria-label={prevLabel}
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
        <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label={label}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={formatStatus(i + 1, slides.length)}
              className="grid h-10 w-10 place-items-center"
              onClick={() => api?.scrollTo(i)}
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-200 ${
                  i === index ? `w-5 ${dotOn}` : `w-1.5 ${dotOff}`
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${btn} ${btnTone}`}
          aria-label={nextLabel}
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {formatStatus(index + 1, slides.length)}
      </p>
    </div>
  );
}
