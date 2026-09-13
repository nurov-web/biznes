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
    <div className="card-raised flex min-h-[280px] flex-col items-center justify-center p-6 text-center">
      <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
        <PackageSearch className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="text-base font-semibold text-foreground">{t("noProductsTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("noProductsDescription")}</p>
      <Link href="/inventory" className="btn btn-primary mt-6 w-full max-w-xs">
        {t("addProductsCta")}
      </Link>
    </div>
  );
}
