"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import type { ProductDraft } from "@/types";

type Props = {
  type: string;
  city: string;
  name: string;
  products: ProductDraft[];
  step: number;
  typeNote?: string;
};

/** Маслиҳати AI ҳангоми пур кардани анкета. Бе калид — маслиҳати маҳаллӣ. */
export function AiHints({ type, city, name, products, step, typeNote }: Props) {
  const t = useTranslations("start");
  const locale = useLocale();
  const [hints, setHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetch("/api/onboarding/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          type,
          city,
          name,
          typeNote,
          products: products.slice(0, 10).map((p) => ({
            category: p.category,
            brand: p.brand,
            model: p.model,
            buyPriceMin: p.buyPriceMin,
            sellPriceMin: p.sellPriceMin,
          })),
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { hints?: string[]; usedAi?: boolean } | null) => {
          if (cancelled || !data) return;
          setHints(data.hints ?? []);
          setLive(Boolean(data.usedAi));
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, type, city, locale, typeNote]);

  if (!hints.length && !loading) return null;

  return (
    <Reveal>
    <aside className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/40 p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon icon={Lightbulb} className="h-4 w-4 text-primary" />
        {t("hintsTitle")}
        <span className="text-xs font-normal text-muted-foreground">
          {loading ? t("hintsLoading") : live ? t("aiOn") : t("aiOff")}
        </span>
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        {hints.map((hint) => (
          <li key={hint}>— {hint}</li>
        ))}
      </ul>
    </aside>
    </Reveal>
  );
}
