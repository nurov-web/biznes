"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Suggestion } from "@/services/intelligence/advice";

/** Нишони хурд дар сатр/корти тавсияшуда. */
export function RecommendedBadge() {
  const t = useTranslations("advice");
  return (
    <span className="inline-flex items-center border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {t("badge")}
    </span>
  );
}

/** Блоки шарҳ: чаро маҳз ҳамин ва кай беҳтар аст. */
export function RecommendedNote({ suggestion }: { suggestion: Suggestion | null }) {
  const t = useTranslations("advice");
  if (!suggestion) return null;
  return (
    <aside className="border border-border bg-card p-4">
      <p className="text-sm font-semibold">{t("title")}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{suggestion.reason}</p>
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
