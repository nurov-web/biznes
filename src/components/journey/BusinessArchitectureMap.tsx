"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Megaphone, Package, Users, Wallet } from "lucide-react";

type Props = {
  product: string;
  region: string;
  channels: string[];
};

/** Схемаи 4 қуттӣ: канал → мол → мизоҷ → пул. */
export function BusinessArchitectureMap({ product, region, channels }: Props) {
  const t = useTranslations("journey");
  const channelText = channels.length > 0 ? channels.join(" · ") : t("channelDefault");

  return (
    <section className="card-raised p-5 sm:p-6">
      <p className="eyebrow">{t("archKicker")}</p>
      <h2 className="display-3 mt-1">{t("archTitle")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {t("archLead", { product, region })}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border p-4">
          <Megaphone className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-sm font-medium">{t("archChannel")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{channelText}</p>
        </div>
        <div className="flex items-center justify-center text-muted-foreground lg:hidden" aria-hidden>
          <ArrowRight className="h-4 w-4" />
        </div>
        <div className="border border-border p-4">
          <Package className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-sm font-medium">{t("archStock")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{product}</p>
        </div>
        <div className="border border-border p-4">
          <Users className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-sm font-medium">{t("archClients")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("archClientsD")}</p>
        </div>
        <div className="border border-border p-4">
          <Wallet className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
          <p className="mt-2 text-sm font-medium">{t("archMoney")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("archMoneyD")}</p>
        </div>
      </div>
    </section>
  );
}
