"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/PageShell";
import { useOwnerSnapshot } from "@/hooks/useOwnerSnapshot";
import { modulePackFor } from "@/constants/workspace";
import { Link } from "@/i18n/navigation";

const NODES = ["customers", "products", "sales", "money"] as const;

/** Бизнес → мизоҷ → мол → фурӯш → пул. Ҳар гиреҳ: маъно, чаро, кор, нишондиҳанда. */
export default function ArchitecturePage() {
  const t = useTranslations("workspace");
  const snap = useOwnerSnapshot();
  const [open, setOpen] = useState<(typeof NODES)[number] | null>("customers");
  if (!snap.ready) return <p className="p-8 text-sm text-muted-foreground">{t("loading")}</p>;
  const product = snap.profile?.product || t("noData");
  const pack = modulePackFor(snap.profile?.category ?? "trade");

  return (
    <PageShell title={t("pages.architecture")} lead={t("archLead", { product })} eyebrow={t("group.think")}>
      <p className="text-sm text-muted-foreground">{t(pack.titleKey)}</p>
      <ol className="mt-4 grid gap-3">
        {NODES.map((id) => (
          <li key={id} className="card-raised overflow-hidden">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-between px-5 text-left text-sm font-medium"
              aria-expanded={open === id}
              onClick={() => setOpen(open === id ? null : id)}
            >
              {t(`nav.${id}`)}
              <span className="text-xs text-muted-foreground">{t("whatMean")}</span>
            </button>
            {open === id ? (
              <div className="space-y-2 border-t border-border px-5 py-4 text-sm text-muted-foreground">
                <p>{t(`node_${id}_what`)}</p>
                <p>{t(`node_${id}_why`)}</p>
                <p>{t(`node_${id}_do`)}</p>
                <p>{t(`node_${id}_kpi`)}</p>
                <Link href={id === "sales" ? "/pos" : id === "products" ? "/inventory" : id === "customers" ? "/crm" : "/finance"} className="btn btn-primary mt-2 min-h-12 w-fit">
                  {t(`nav.${id}`)}
                </Link>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
