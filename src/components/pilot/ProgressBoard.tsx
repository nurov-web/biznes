"use client";

import { FormEvent, useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ProgressStat } from "@/components/pilot/ProgressStat";
import { WeekSoldChart } from "@/components/pilot/WeekSoldChart";
import { ProgressFunnel } from "@/components/pilot/ProgressFunnel";
import { lastDays, localDateKey } from "@/lib/local-date";
import { monthlyRevenue } from "@/lib/pilot-volume";
import { PILOT_MODULE_COUNT } from "@/constants/pilot";
import type { PilotProfileRow } from "@/lib/store";
import { ShopPulsePanel, type ShopLinkForm } from "@/components/pilot/ShopPulsePanel";
import type { ShopPulse } from "@/types/shop-pulse";

export type DaySold = { date: string; sold: number };
export type CourseMark = { moduleId: number; score: number | null; completedAt: string | null };

type Props = {
  profile: PilotProfileRow;
  progress: number[];
  hasPlan: boolean;
  chosen: boolean;
  logs: DaySold[];
  weekDone: string[];
  course: CourseMark[];
  onLogged: (logs: DaySold[]) => void;
  pulse: ShopPulse | null;
  onPulse: (pulse: ShopPulse | null) => void;
};

/** Панел: чӣ гап, чӣ тағйир ёфт, пешравӣ аз рақами воқеӣ. */
export function ProgressBoard({
  profile,
  progress,
  hasPlan,
  chosen,
  logs,
  weekDone,
  course,
  onLogged,
  pulse,
  onPulse,
}: Props) {
  const t = useTranslations("pilot");
  const format = useFormatter();
  const [sold, setSold] = useState("");
  const [shop, setShop] = useState<ShopLinkForm>({
    url: pulse?.url || profile.shopUrl || "",
    sold: "",
    refused: "",
    complaints: "",
  });
  const [busy, setBusy] = useState(false);
  const today = localDateKey();
  const days = lastDays(7);
  const byDate = useMemo(() => new Map(logs.map((row) => [row.date, row.sold])), [logs]);
  const weekSold = days.reduce((sum, day) => sum + (byDate.get(day) ?? 0), 0);
  const estimate = monthlyRevenue(profile.volume, profile.price);
  const coursePct = Math.round((progress.length / PILOT_MODULE_COUNT) * 100);
  const todaySold = byDate.get(today) ?? 0;
  const prevDays = lastDays(14).slice(0, 7);
  const prevSold = prevDays.reduce((sum, day) => sum + (byDate.get(day) ?? 0), 0);
  const delta = weekSold - prevSold;

  const points = days.map((key) => ({
    key,
    label: format.dateTime(new Date(`${key}T12:00:00`), { weekday: "short" }),
    value: byDate.get(key) ?? 0,
  }));

  const events = [
    ...course
      .filter((row) => row.completedAt)
      .map((row) => ({
        id: `c${row.moduleId}`,
        at: row.completedAt as string,
        text: t("evtCourse", { n: row.moduleId }),
      })),
    ...logs.map((row) => ({
      id: `s${row.date}`,
      at: row.date,
        text: t("evtSold", { n: row.sold }),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  async function save(event: FormEvent) {
    event.preventDefault();
    const n = Number(sold.replace(/\s/g, ""));
    if (!Number.isInteger(n) || n < 0) return;
    setBusy(true);
    try {
      const response = await fetch("/api/pilot/log", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold: n }),
      });
      const json = (await response.json()) as { logs?: DaySold[] };
      if (json.logs) onLogged(json.logs);
      setSold("");
    } finally {
      setBusy(false);
    }
  }

  const saleDays = days.filter((day) => (byDate.get(day) ?? 0) > 0).length;
  const weekNow = weekDone.filter((day) => days.includes(day)).length;
  const weekUnits = Math.min(7, Math.max(weekNow, saleDays));
  const changeHint =
    logs.length === 0
      ? t("kpiWeekEmpty")
      : delta > 0
        ? t("kpiWeekUp", { n: delta })
        : delta < 0
          ? t("kpiWeekDown", { n: Math.abs(delta) })
          : t("kpiWeekSame");

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressStat
          label={t("kpiNow")}
          value={format.number(estimate)}
          hint={t("kpiNowHint")}
        />
        <ProgressStat label={t("kpiWeek")} value={format.number(weekSold)} hint={changeHint} />
        <ProgressStat
          label={t("kpiCourse")}
          value={`${coursePct}%`}
          hint={t("ofModules", { done: progress.length, total: PILOT_MODULE_COUNT })}
        />
        <ProgressStat
          label={t("kpiTasks")}
          value={`${weekUnits}/7`}
          hint={t("kpiTasksHint")}
        />
      </div>

      <ShopPulsePanel
        value={shop}
        onChange={setShop}
        persist
        pulse={pulse}
        onPulse={onPulse}
      />

      <form onSubmit={(e) => void save(e)} className="card-raised flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
        <label className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium">
          {t("soldToday", { n: todaySold })}
          <input
            className="input-field min-h-12"
            inputMode="numeric"
            value={sold}
            onChange={(e) => setSold(e.target.value)}
            placeholder={t("soldPh")}
          />
        </label>
        <button type="submit" className="btn btn-primary min-h-12" disabled={busy || sold.trim() === ""}>
          {busy ? t("saving") : t("soldSave")}
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <WeekSoldChart title={t("chartTitle")} empty={t("chartEmpty")} points={points} />
        <ProgressFunnel
          title={t("funnelTitle")}
          hint={t("funnelHint")}
          steps={[
            { id: "form", label: t("funnelForm"), done: 1, total: 1 },
            { id: "path", label: t("funnelPath"), done: chosen ? 1 : 0, total: 1 },
            {
              id: "course",
              label: t("funnelCourse"),
              done: progress.length,
              total: PILOT_MODULE_COUNT,
            },
            { id: "plan", label: t("funnelPlan"), done: hasPlan ? 1 : 0, total: 1 },
            { id: "week", label: t("funnelWeek"), done: weekUnits, total: 7 },
          ]}
        />
      </div>

      <article className="card-raised p-5 sm:p-6">
        <h2 className="display-3">{t("changeTitle")}</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("changeEmpty")}</p>
        ) : (
          <ol className="mt-4 grid list-none gap-3 p-0">
            {events.map((row) => (
              <li key={row.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="num w-28 shrink-0 text-xs text-muted-foreground">
                  {row.at.slice(0, 10)}
                </span>
                <p className="text-sm leading-relaxed">{row.text}</p>
              </li>
            ))}
          </ol>
        )}
      </article>
    </div>
  );
}
