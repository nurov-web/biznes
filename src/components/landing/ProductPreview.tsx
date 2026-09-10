"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Banknote, LayoutDashboard, Package } from "lucide-react";
import { IconWell } from "@/components/ui/Icon";

/** Намунаи дафтар — на рақами дурӯғи дӯкони кас. */
export function ProductPreview() {
  const t = useTranslations("preview");
  const steps = [
    { icon: Package, title: t("p1t"), text: t("p1d") },
    { icon: Banknote, title: t("p2t"), text: t("p2d") },
    { icon: LayoutDashboard, title: t("p3t"), text: t("p3d") },
  ];

  return (
    <div className="app-frame w-full max-w-full overflow-hidden select-none" aria-hidden>
      <div className="flex min-w-0 items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-muted-foreground">
          {t("window")}
        </p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">{t("sample")}</p>
      </div>
      <div className="space-y-2.5 p-4">
        <ul className="space-y-2.5">
          {steps.map((step) => (
            <li key={step.title} className="flex items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3">
              <IconWell icon={step.icon} />
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 px-1 pt-1 text-[12px] font-medium text-primary">
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {t("flow")}
        </p>
      </div>
    </div>
  );
}
