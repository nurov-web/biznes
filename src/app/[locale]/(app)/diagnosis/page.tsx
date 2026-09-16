"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useOwnerSnapshot } from "@/hooks/useOwnerSnapshot";
import { buildBusinessStory } from "@/lib/business-story";
import { Link } from "@/i18n/navigation";

/** Ташхис аз рақами воқеӣ: чӣ шуд, чаро, чӣ кунед. */
export default function DiagnosisPage() {
  const t = useTranslations("today");
  const tw = useTranslations("workspace");
  const snap = useOwnerSnapshot();
  if (!snap.ready) return <p className="p-8 text-sm text-muted-foreground">{tw("loading")}</p>;
  const story = buildBusinessStory({
    profile: snap.profile,
    chosen: snap.chosen,
    chosenItem: snap.chosenItem,
    guide: snap.guide,
    todaySales: snap.todaySales,
  });
  return (
    <PageShell title={tw("pages.diagnosis")} lead={tw("diagnosisLead")} eyebrow={tw("group.think")}>
      <ol className="grid gap-3">
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qWhere")}</p>
          <p className="mt-1 text-sm">{t(`where_${story.caseId}`)}</p>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">{t("qWrong")}</p>
          <p className="mt-1 text-sm">{t(`wrong_${story.caseId}`)}</p>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qWhy")}</p>
          <p className="mt-1 text-sm">{t(`why_${story.caseId}`)}</p>
        </li>
        <li className="card-raised p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("qDo")}</p>
          <p className="mt-1 text-sm">{t(`do_${story.caseId}`)}</p>
          <Link href={story.doHref} className="btn btn-primary mt-4 min-h-12 w-fit">
            {t(story.doKey)}
          </Link>
        </li>
      </ol>
      {story.notEnough ? <p className="mt-4 text-sm text-muted-foreground">{tw("noData")}</p> : null}
    </PageShell>
  );
}
