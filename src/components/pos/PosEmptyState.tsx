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
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-sm">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <PackageSearch className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{t("noProductsTitle")}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("noProductsDescription")}</p>
      <div className="mt-6 w-full max-w-xs">
        <Link
          href="/inventory"
          className="btn flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {t("addProductsCta")}
        </Link>
      </div>
    </div>
  );
}
