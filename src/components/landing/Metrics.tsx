"use client";

import { useTranslations } from "next-intl";
import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";

const ITEMS = [
  { key: "m1", to: 7, suffix: "" },
  { key: "m2", to: 7, suffix: "" },
  { key: "m3", to: 5, suffix: "" },
  { key: "m4", to: 3, suffix: "" },
] as const;

export function Metrics() {
  const t = useTranslations("landing");
  return (
    <section className="border-b border-border bg-surface">
      <Reveal stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-10 sm:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.key} className="px-2 py-3 text-center sm:px-4">
            <p className="num text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              <Counter to={item.to} suffix={item.suffix} />
            </p>
            <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{t(item.key)}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
