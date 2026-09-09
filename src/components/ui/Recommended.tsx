"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Suggestion } from "@/services/intelligence/advice";

/** Нишони хурд дар сатр/корти тавсияшуда. */
export function RecommendedBadge() {
  const t = useTranslations("advice");
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
      <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
      {t("badge")}
    </span>
  );
}

/** Блоки шарҳ: чаро маҳз ҳамин ва кай беҳтар аст. */
export function RecommendedNote({ suggestion }: { suggestion: Suggestion | null }) {
  const t = useTranslations("advice");
  if (!suggestion) return null;
  return (
    <aside className="rounded-2xl border border-primary/25 bg-primary-soft/60 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {t("title")}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">{suggestion.reason}</p>
      {suggestion.timing ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          {suggestion.timing}
        </p>
      ) : null}
      {suggestion.href ? (
        <Link href={suggestion.href} className="btn btn-sm btn-primary mt-3 max-w-full">
          {t("startWith")}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      ) : null}
    </aside>
  );
}
