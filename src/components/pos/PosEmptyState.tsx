"use client";

/**
 * Компоненти ҳолати холӣ (холӣ будани каталоги анбор).
 */
import { useTranslations } from "next-intl";
import { PackageSearch } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function PosEmptyState() {
  const t = useTranslations("pos");

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <PackageSearch className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-base font-semibold text-foreground">{t("noProductsTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("noProductsDescription")}</p>
      <Link href="/inventory" className="btn btn-primary mt-6 w-full max-w-xs">
        {t("addProductsCta")}
      </Link>
    </div>
  );
}
