"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Printer, Send } from "lucide-react";
import { monthlyRevenue, splitVolume } from "@/lib/pilot-volume";
import { localDateKey } from "@/lib/local-date";
import type { PilotProfileRow } from "@/lib/store";

const DAY_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"] as const;

type Props = {
  plan: string;
  planDate: string;
  profile: PilotProfileRow;
  weekDone: string[];
  onWeekDone: (dates: string[]) => void;
};

/** Нақшаи фурӯш: матни AI + ҳафтаи аввал бо сана + фиристодан ва чоп. */
export function SalesPlanBoard({ plan, planDate, profile, weekDone, onWeekDone }: Props) {
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
      iso: localDateKey(date),
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

  async function toggle(iso: string, done: boolean): Promise<void> {
    const response = await fetch("/api/pilot/week", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso, done }),
    });
    const json = (await response.json()) as { weekDone?: string[] };
    if (json.weekDone) onWeekDone(json.weekDone);
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
          {days.map((day) => {
            const done = weekDone.includes(day.iso);
            return (
              <li key={day.key} className="flex min-h-12 items-start gap-3 rounded-xl border border-border px-4 py-3">
                <label className="flex min-h-12 min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-[color:var(--primary)]"
                    checked={done}
                    onChange={(e) => void toggle(day.iso, e.target.checked)}
                  />
                  <time
                    dateTime={day.iso}
                    className="num w-20 shrink-0 text-sm font-semibold text-primary"
                  >
                    {day.label}
                  </time>
                  <p className="text-sm leading-relaxed">{day.text}</p>
                </label>
              </li>
            );
          })}
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
