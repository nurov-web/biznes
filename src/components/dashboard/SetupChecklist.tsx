"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Step = { done: boolean; label: string; href: string; cta: string };

/** Агар маълумот кам бошад — ба ҷои сифрҳо роҳнамои кӯтоҳ. */
export function SetupChecklist({
  hasProducts,
  hasSales,
  hasCompetitors,
}: {
  hasProducts: boolean;
  hasSales: boolean;
  hasCompetitors: boolean;
}) {
  const t = useTranslations("intel");
  const steps: Step[] = [
    { done: hasProducts, label: t("setup1"), href: "/inventory", cta: t("setup1cta") },
    { done: hasSales, label: t("setup2"), href: "/data", cta: t("setup2cta") },
    { done: hasCompetitors, label: t("setup3"), href: "/competitors", cta: t("setup3cta") },
  ];
  const left = steps.filter((s) => !s.done).length;
  if (left === 0) return null;

  return (
    <section className="card-raised overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h2 className="display-3">{t("setupTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("setupLead")}</p>
        </div>
        <span className="chip num">{steps.length - left}/{steps.length}</span>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => (
          <li key={step.href} className="flex flex-wrap items-center gap-3 px-6 py-4">
            <span
              className={`num grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                step.done
                  ? "bg-[#e7f6ee] text-success"
                  : "border border-border-strong text-muted-foreground"
              }`}
            >
              {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : i + 1}
            </span>
            <p className={`flex-1 text-sm ${step.done ? "text-muted-foreground line-through" : ""}`}>
              {step.label}
            </p>
            {step.done ? null : (
              <Link href={step.href} className="btn btn-sm btn-ghost">
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
