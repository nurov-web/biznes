"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Check, Package, ShoppingBag, Users, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type RunGuide = {
  products: number;
  clients: number;
  sales: number;
  remainingUnits: number;
};

type Step = {
  key: "stock" | "clients" | "sale" | "cash";
  done: boolean;
  href: string;
  icon: typeof Package;
  meta: string;
};

/** Қадами рӯз мисли Shopify/Bitrix: мол → мизоҷ → фурӯш → ҳисоб. */
export function RunBusinessGuide({ guide }: { guide: RunGuide }) {
  const t = useTranslations("run");
  const steps: Step[] = [
    {
      key: "stock",
      done: guide.products > 0,
      href: "/inventory",
      icon: Package,
      meta: t("stockMeta", { count: guide.products, units: guide.remainingUnits }),
    },
    {
      key: "clients",
      done: guide.clients > 0,
      href: "/crm/clients",
      icon: Users,
      meta: t("clientsMeta", { count: guide.clients }),
    },
    {
      key: "sale",
      done: guide.sales > 0,
      href: "/pos",
      icon: ShoppingBag,
      meta: t("saleMeta", { count: guide.sales }),
    },
    {
      key: "cash",
      done: guide.sales > 0,
      href: "/finance",
      icon: Wallet,
      meta: t("cashMeta"),
    },
  ];
  const next = steps.find((s) => !s.done) ?? steps[2];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <section className="card-raised overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="eyebrow">{t("kicker")}</p>
          <h2 className="display-3 mt-1">{t("title")}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("lead")}</p>
        </div>
        <span className="num shrink-0 text-sm text-muted-foreground">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => (
          <li key={step.key} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
            <span className={`mark ${step.done ? "mark-on" : ""}`}>
              {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden /> : i + 1}
            </span>
            <step.icon className="h-4 w-4 shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${step.done ? "text-muted-foreground" : ""}`}>
                {t(`${step.key}Title`)}
              </p>
              <p className="text-xs text-muted-foreground">{step.meta}</p>
            </div>
            <Link
              href={step.href}
              className={`btn btn-sm min-h-12 ${next.key === step.key && !step.done ? "btn-primary" : "btn-ghost"}`}
            >
              {step.done ? t("open") : t("doNow")}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
