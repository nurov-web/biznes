"use client";

import { PackagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon, IconWell } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";
import { GsapStep } from "@/components/motion/GsapStep";

/** Ҳолати холӣ: пайваст ҳаст, аммо фурӯши воқеӣ нест. */
export function StoreGapBanner({ salesCount }: { salesCount: number }) {
  const t = useTranslations("intel");
  if (salesCount > 0) return null;

  return (
    <GsapStep step={0}>
      <article className="card-raised flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <IconWell icon={PackagePlus} />
        <div className="min-w-0 flex-1">
          <h2 className="display-3">{t("gapZero")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("gapZeroLead")}</p>
        </div>
        <Link href="/store" className="btn btn-primary min-h-12 shrink-0">
          <Icon icon={PackagePlus} className="h-4 w-4" />
          {t("gapZeroCta")}
        </Link>
      </article>
    </GsapStep>
  );
}
