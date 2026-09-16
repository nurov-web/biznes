"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useOwnerSnapshot } from "@/hooks/useOwnerSnapshot";
import { SuggestionPath } from "@/components/pilot/SuggestionPath";
import { shortLine, suggestionSteps } from "@/lib/pilot-suggestions";
import { Link } from "@/i18n/navigation";

/** Ҳадаф → соҳиб → мӯҳлат → нишондиҳанда → кор. */
export default function StrategyPage() {
  const t = useTranslations("workspace");
  const snap = useOwnerSnapshot();
  if (!snap.ready) return <p className="p-8 text-sm text-muted-foreground">{t("loading")}</p>;
  const item = snap.chosenItem;
  if (!item) {
    return (
      <PageShell title={t("pages.strategy")} lead={t("strategyEmpty")}>
        <Link href="/suggestions" className="btn btn-primary min-h-12 w-fit">
          {t("pickPath")}
        </Link>
      </PageShell>
    );
  }
  return (
    <PageShell title={item.title} lead={t("strategyLead")} eyebrow={t("pages.strategy")}>
      <dl className="card-raised grid gap-4 p-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{t("eosGoal")}</dt>
          <dd className="mt-1">{item.title}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{t("eosOwner")}</dt>
          <dd className="mt-1">{snap.profile?.product ?? t("eosYou")}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{t("eosDeadline")}</dt>
          <dd className="mt-1">{t("eosWeek")}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{t("eosKpi")}</dt>
          <dd className="mt-1">
            {item.potentialSomoni > 0
              ? t("eosKpiValue", { n: item.potentialSomoni.toLocaleString("ru-RU") })
              : t("noData")}
          </dd>
        </div>
      </dl>
      <div className="mt-4 card-raised p-5">
        <SuggestionPath steps={suggestionSteps(item).map((row) => shortLine(row, 100))} heading={t("eosTasks")} />
      </div>
    </PageShell>
  );
}
