"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plug } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { recommendIntegrations } from "@/lib/integration-advice";
import type { PilotProfileRow } from "@/lib/store";
import { nicheLabel } from "@/lib/niche";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/locale-query";

export function IntegrationAdviceCard() {
  const t = useTranslations("toolsForYou");
  const locale = useLocale() as Locale;
  const [profile, setProfile] = useState<PilotProfileRow | null>(null);

  useEffect(() => {
    fetch("/api/pilot/state", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { profile?: PilotProfileRow } | null) => setProfile(d?.profile ?? null))
      .catch(() => undefined);
  }, []);

  const advice = recommendIntegrations(profile);
  const nicheName = nicheLabel(advice.niche, locale);

  return (
    <section className="card-raised p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Plug className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{t("kicker")}</p>
          <h2 className="display-3 mt-1">{t("title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("lead", { niche: nicheName })}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3 text-sm">
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
          <span>{t("crmBuiltIn")}</span>
        </li>
        <li className="flex gap-2">
          {advice.suggestBitrix ? (
            <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          ) : (
            <span className="w-4 shrink-0 text-muted-foreground">—</span>
          )}
          <span>{advice.suggestBitrix ? t("bitrixYes") : t("bitrixNo")}</span>
        </li>
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
          <span>{t("mcpAi")}</span>
        </li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(`reason_${advice.reasonKey}`)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/crm/clients" className="btn btn-primary min-h-12">
          {t("openCrm")}
        </Link>
        <Link href="/agents" className="btn btn-ghost min-h-12">
          {t("openAi")}
        </Link>
      </div>
    </section>
  );
}
