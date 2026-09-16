"use client";

import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useOwnerSnapshot } from "@/hooks/useOwnerSnapshot";
import { modulePackFor } from "@/constants/workspace";
import { Link } from "@/i18n/navigation";

/** Бизнеси ҳақиқии соҳиб — на дӯкони намуна. */
export default function BusinessPage() {
  const t = useTranslations("workspace");
  const { profile, ready } = useOwnerSnapshot();
  if (!ready) return <p className="p-8 text-sm text-muted-foreground">{t("loading")}</p>;
  if (!profile) {
    return (
      <PageShell title={t("pages.business")} lead={t("noData")}>
        <Link href="/has-business" className="btn btn-primary min-h-12 w-fit">
          {t("startForm")}
        </Link>
      </PageShell>
    );
  }
  const pack = modulePackFor(profile.category);
  return (
    <PageShell title={profile.product} lead={`${profile.region} · ${t(`nav.products`)}`} eyebrow={t("pages.business")}>
      <dl className="card-raised grid gap-3 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("fieldType")}</dt>
          <dd className="mt-1 font-medium">{profile.category}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("fieldPrice")}</dt>
          <dd className="mt-1 font-medium">{profile.price || t("noData")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("fieldVolume")}</dt>
          <dd className="mt-1 font-medium">{profile.volume || t("noData")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("fieldGoal")}</dt>
          <dd className="mt-1 font-medium">{profile.problem || t("noData")}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">{t(pack.titleKey)}</p>
    </PageShell>
  );
}
