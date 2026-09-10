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
    <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-border bg-card p-6 text-center">
      <PackageSearch className="mb-4 h-6 w-6 text-muted-foreground" strokeWidth={1.75} aria-hidden />
      <h2 className="text-base font-semibold text-foreground">{t("noProductsTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("noProductsDescription")}</p>
      <Link href="/inventory" className="btn btn-primary mt-6 w-full max-w-xs">
        {t("addProductsCta")}
      </Link>
    </div>
  );
}
