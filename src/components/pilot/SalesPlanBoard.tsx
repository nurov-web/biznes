"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Printer, Send } from "lucide-react";
import { monthlyRevenue, splitVolume } from "@/lib/pilot-volume";
import type { PilotProfileRow } from "@/lib/store";

const DAY_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"] as const;

type Props = {
  plan: string;
  planDate: string;
  profile: PilotProfileRow;
};

/** Нақшаи фурӯш: матни AI + ҳафтаи аввал бо сана + фиристодан ва чоп. */
export function SalesPlanBoard({ plan, planDate, profile }: Props) {
  const t = useTranslations("pilot");
  const format = useFormatter();
  const volume = splitVolume(profile.volume);
  const volumeText = `${volume.amount} ${t(`units.${volume.unit}`)}`;

  const parsed = new Date(planDate);
  const start = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const days = DAY_KEYS.map((key, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      key,
      date,
      label: format.dateTime(date, { day: "numeric", month: "long" }),
      text: t(key, { product: profile.product, region: profile.region, price: profile.price }),
    };
  });

  function share(): void {
    const text = [
      `${t("tabSales")}: ${profile.product} · ${profile.region}`,
      "",
      plan,
      "",
      t("weekTitle"),
      ...days.map((day) => `${day.label} — ${day.text}`),
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return (
    <div className="grid gap-4">
      <article className="card-raised whitespace-pre-wrap p-5 text-sm leading-relaxed sm:p-6">
        {plan}
      </article>

      <article className="card-raised p-5 sm:p-6">
        <h2 className="display-3">{t("weekTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("weekLead")}</p>
        <ol className="mt-5 grid list-none gap-2 p-0">
          {days.map((day) => (
            <li key={day.key} className="flex min-h-12 gap-3 rounded-xl border border-border px-4 py-3">
              <time
                dateTime={day.date.toISOString().slice(0, 10)}
                className="num w-20 shrink-0 text-sm font-semibold text-primary"
              >
                {day.label}
              </time>
              <p className="text-sm leading-relaxed">{day.text}</p>
            </li>
          ))}
        </ol>
      </article>

      {volume.amount > 0 && profile.price ? (
        <article className="card-raised p-5 sm:p-6">
          <h2 className="display-3">{t("calcTitle")}</h2>
          <p className="mt-2 text-sm">
            {t("calcNow", { volume: volumeText, price: profile.price })} ={" "}
            <span className="num font-semibold">
              {format.number(monthlyRevenue(profile.volume, profile.price))}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t("calcAfter")}</p>
        </article>
      ) : null}

      <div className="no-print flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn btn-primary min-h-12" onClick={share}>
          <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {t("shareWa")}
        </button>
        <button type="button" className="btn btn-ghost min-h-12" onClick={() => window.print()}>
          <Printer className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {t("printPlan")}
        </button>
      </div>
    </div>
  );
}
