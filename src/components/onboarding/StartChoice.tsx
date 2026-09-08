"use client";

import { useTranslations } from "next-intl";
import { Rocket, Store } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function StartChoice({ onPick }: { onPick: (path: "running" | "idea") => void }) {
  const t = useTranslations("start");
  const cards = [
    { id: "running" as const, icon: Store, title: t("hasYes"), text: t("hasYesD") },
    { id: "idea" as const, icon: Rocket, title: t("hasNo"), text: t("hasNoD") },
  ];
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t("q")}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("qLead")}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onPick(card.id)}
            className="card hover-lift p-6 text-left transition-colors duration-200 hover:border-primary"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-800">
              <Icon icon={card.icon} className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
