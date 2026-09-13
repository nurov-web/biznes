"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import { reducedMotion } from "@/lib/gsap";
import ink from "@/constants/ink-lottie.json";

/** Хати дафтар бо Lottie — 20px, як бор, бе ҷаҳиш. */
export function InkMark() {
  const [reduce, setReduce] = useState(true);

  useEffect(() => {
    setReduce(reducedMotion());
  }, []);

  if (reduce) {
    return (
      <svg width="20" height="20" viewBox="0 0 64 64" className="shrink-0" aria-hidden>
        <path
          d="M14 42 24 30 32 38 50 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <span className="inline-block h-5 w-5 shrink-0 overflow-hidden" aria-hidden>
      <Lottie src={ink} autoplay loop={false} style={{ width: 20, height: 20 }} />
    </span>
  );
}
