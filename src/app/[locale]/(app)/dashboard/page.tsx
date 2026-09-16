"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Check, ChartColumn, Sun, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageBody } from "@/components/PageShell";
import { PilotHero } from "@/components/pilot/PilotHero";
import { SalesPlanBoard } from "@/components/pilot/SalesPlanBoard";
import { ProgressBoard, type CourseMark, type DaySold } from "@/components/pilot/ProgressBoard";
import { PILOT_MODULES } from "@/constants/pilot-course";
import { isModuleOpen, PILOT_MODULE_COUNT } from "@/constants/pilot";
import type { PilotProfileRow, PilotSuggestionItem } from "@/lib/store";
import type { ShopPulse } from "@/types/shop-pulse";
import { TodayBoard } from "@/components/journey/TodayBoard";
import type { RunGuide } from "@/components/dashboard/RunBusinessGuide";
import { readWorkspaceMode, WORKSPACE_MODE_EVENT, type WorkspaceMode } from "@/lib/workspace-mode";

type Tab = "today" | "overview" | "course" | "sales";

export default function DashboardPage() {
  const t = useTranslations("pilot");
  const tc = useTranslations("pilotCourse");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("today");
  const [guide, setGuide] = useState<RunGuide | null>(null);
  const [todaySales, setTodaySales] = useState(0);
  const [profile, setProfile] = useState<PilotProfileRow | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [plan, setPlan] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [chosenItem, setChosenItem] = useState<PilotSuggestionItem | null>(null);
  const [logs, setLogs] = useState<DaySold[]>([]);
  const [weekDone, setWeekDone] = useState<string[]>([]);
  const [course, setCourse] = useState<CourseMark[]>([]);
  const [pulse, setPulse] = useState<ShopPulse | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<WorkspaceMode>("simple");

  useEffect(() => {
    const sync = () => setMode(readWorkspaceMode());
    sync();
    window.addEventListener(WORKSPACE_MODE_EVENT, sync);
    return () => window.removeEventListener(WORKSPACE_MODE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (mode === "simple") setTab("today");
  }, [mode]);

  useEffect(() => {
    fetch("/api/pilot/state", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          d: {
            profile?: PilotProfileRow;
            progress?: number[];
            plan?: string;
            planDate?: string;
            suggestions?: PilotSuggestionItem[];
            chosenIndex?: number | null;
            logs?: DaySold[];
            weekDone?: string[];
            course?: CourseMark[];
            pulse?: ShopPulse | null;
          } | null,
        ) => {
          setProfile(d?.profile ?? null);
          setProgress(d?.progress ?? []);
          setPlan(d?.plan ?? "");
          setPlanDate(d?.planDate ?? "");
          const index = d?.chosenIndex;
          const list = d?.suggestions ?? [];
          setChosen(typeof index === "number");
          setChosenItem(typeof index === "number" ? (list[index] ?? null) : null);
          setLogs(d?.logs ?? []);
          setWeekDone(d?.weekDone ?? []);
          setCourse(d?.course ?? []);
          setPulse(d?.pulse ?? null);
        },
      )
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/dashboard", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          d: {
            guide?: RunGuide;
            stats?: { todaySales?: number };
          } | null,
        ) => {
          if (d?.guide) setGuide(d.guide);
          if (d?.stats?.todaySales != null) setTodaySales(d.stats.todaySales);
        },
      )
      .catch(() => undefined);
  }, [ready]);

  async function makePlan() {
    setPlanLoading(true);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const json = (await response.json()) as { plan?: string };
      if (json.plan) {
        setPlan(json.plan);
        setPlanDate(new Date().toISOString());
      }
    } finally {
      setPlanLoading(false);
    }
  }

  if (!ready) {
    return <p className="p-8 text-sm text-muted-foreground">{t("saving")}</p>;
  }

  const pct = Math.round((progress.length / PILOT_MODULE_COUNT) * 100);
  const product = profile?.product || "—";
  const region = profile?.region || "—";

  const insightTabs: { id: Tab; label: string; icon: typeof ChartColumn }[] = [
    { id: "today", label: t("tabToday"), icon: Sun },
    { id: "overview", label: t("tabOverview"), icon: ChartColumn },
    { id: "course", label: t("tabCourse"), icon: BookOpen },
    { id: "sales", label: t("tabSales"), icon: Wallet },
  ];
  const tabs = mode === "simple" ? insightTabs.filter((row) => row.id === "today") : insightTabs;

  return (
    <>
      <PilotHero
        eyebrow={t("welcome")}
        title={product}
        lead={t("bizLine", { product, region })}
        progressLabel={t("progress")}
        progressMeta={t("ofModules", { done: progress.length, total: PILOT_MODULE_COUNT })}
        pct={pct}
      />

      <PageBody>
        <div className="flex overflow-x-auto border-b border-border" role="tablist" aria-label={t("welcome")}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`flex min-h-12 min-w-fit flex-1 items-center justify-center gap-2 border-b-2 px-3 text-sm font-medium sm:flex-none sm:px-5 ${
                tab === item.id
                  ? "border-ink text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab(item.id)}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>

        {tab === "today" && profile ? (
          <TodayBoard
            profile={profile}
            guide={guide}
            chosen={chosen}
            chosenItem={chosenItem}
            todaySales={todaySales}
            simple={mode === "simple"}
          />
        ) : null}

        {tab === "overview" && profile ? (
          <div className="grid gap-4">
            <ProgressBoard
              profile={profile}
              progress={progress}
              hasPlan={Boolean(plan)}
              chosen={chosen}
              logs={logs}
              weekDone={weekDone}
              course={course}
              onLogged={setLogs}
              pulse={pulse}
              onPulse={setPulse}
            />
          </div>
        ) : null}

        {tab === "course" ? (
          <ol className="card-raised divide-y divide-border overflow-hidden">
            {PILOT_MODULES.map((m) => {
              const done = progress.includes(m.id);
              const open = isModuleOpen(m.id, progress);
              const nextId = PILOT_MODULES.find((row) => !progress.includes(row.id))?.id;
              const isNext = open && !done && m.id === nextId;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
                  <span className={`mark ${done ? "mark-on" : ""}`}>
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden /> : m.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{tc(m.titleKey)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tc(m.descKey)}</p>
                  </div>
                  {done ? (
                    <span className="text-sm text-muted-foreground">{t("done")}</span>
                  ) : open ? (
                    <Link
                      href={`/dashboard/course/${m.id}`}
                      className={`btn min-h-12 shrink-0 ${isNext ? "btn-primary" : "btn-ghost"}`}
                    >
                      {t("startModule")}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t("moduleLocked")}</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : null}

        {tab === "sales" ? (
          <div className="grid gap-4">
            {!plan && !planLoading ? (
              <article className="card-raised p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("planEmpty", { product })}
                </p>
                <button type="button" className="btn btn-primary mt-5 min-h-12" onClick={() => void makePlan()}>
                  {t("planCta")}
                </button>
              </article>
            ) : null}
            {planLoading ? (
              <p className="text-sm text-muted-foreground">{t("planWait")}</p>
            ) : null}
            {plan && !planLoading && profile ? (
              <>
                <SalesPlanBoard
                  plan={plan}
                  planDate={planDate}
                  profile={profile}
                  weekDone={weekDone}
                  onWeekDone={setWeekDone}
                />
                <button
                  type="button"
                  className="no-print btn btn-ghost min-h-12 w-fit"
                  onClick={() => void makePlan()}
                >
                  {t("planAgain")}
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </PageBody>
    </>
  );
}
