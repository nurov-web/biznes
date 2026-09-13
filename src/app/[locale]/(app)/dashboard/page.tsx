"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Check, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageBody } from "@/components/PageShell";
import { PilotHero } from "@/components/pilot/PilotHero";
import { SalesPlanBoard } from "@/components/pilot/SalesPlanBoard";
import { PILOT_MODULES } from "@/constants/pilot-course";
import { isModuleOpen, PILOT_MODULE_COUNT } from "@/constants/pilot";
import type { PilotProfileRow } from "@/lib/store";

type Tab = "course" | "sales";

export default function DashboardPage() {
  const t = useTranslations("pilot");
  const tc = useTranslations("pilotCourse");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("course");
  const [profile, setProfile] = useState<PilotProfileRow | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [plan, setPlan] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [ready, setReady] = useState(false);

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
          } | null,
        ) => {
          setProfile(d?.profile ?? null);
          setProgress(d?.progress ?? []);
          setPlan(d?.plan ?? "");
          setPlanDate(d?.planDate ?? "");
        },
      )
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

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
        <div className="flex border-b border-border" role="tablist" aria-label={t("welcome")}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "course"}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 border-b-2 px-3 text-sm font-medium sm:flex-none sm:px-5 ${
              tab === "course"
                ? "border-ink text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("course")}
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("tabCourse")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "sales"}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 border-b-2 px-3 text-sm font-medium sm:flex-none sm:px-5 ${
              tab === "sales"
                ? "border-ink text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("sales")}
          >
            <Wallet className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {t("tabSales")}
          </button>
        </div>

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
        ) : (
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
                <SalesPlanBoard plan={plan} planDate={planDate} profile={profile} />
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
        )}
      </PageBody>
    </>
  );
}
