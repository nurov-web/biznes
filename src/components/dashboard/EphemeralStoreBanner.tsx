"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

export function EphemeralStoreBanner({ show }: { show: boolean }) {
  const t = useTranslations("intel");
  if (!show) return null;
  return (
    <article className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3" role="status">
      <Icon icon={AlertTriangle} className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <p className="text-sm leading-relaxed">{t("ephemeral")}</p>
    </article>
  );
}
