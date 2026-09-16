"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AiRecommendationCard } from "@/components/ai/AiRecommendationCard";
import { PilotFormShell } from "@/components/pilot/PilotFormShell";
import { looksLikeCannedSuggestions, needsBetterSteps, needsCleanText } from "@/lib/pilot-suggestions";
import { suggestionToRecommendation } from "@/lib/pilot-recommendation";
import type { PilotSuggestionItem } from "@/lib/store";

type StatePayload = {
  suggestions?: PilotSuggestionItem[];
  profile?: { product?: string; region?: string } | null;
};

export default function SuggestionsPage() {
  const t = useTranslations("pilot");
  const ta = useTranslations("aiRec");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<PilotSuggestionItem[]>([]);
  const [product, setProduct] = useState("");
  const [region, setRegion] = useState("");
  const [usedAi, setUsedAi] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [chooseError, setChooseError] = useState("");
  const autoTried = useRef(false);

  const refreshFromAi = useCallback(async () => {
    const response = await fetch("/api/pilot/refresh-suggestions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    if (response.status === 401) {
      router.replace("/login");
      return false;
    }
    if (!response.ok) return false;
    const data = (await response.json()) as {
      suggestions?: PilotSuggestionItem[];
      usedAi?: boolean;
      product?: string;
      region?: string;
    };
    setItems(data.suggestions ?? []);
    setUsedAi(data.usedAi ?? false);
    if (data.product) setProduct(data.product);
    if (data.region) setRegion(data.region);
    return true;
  }, [locale, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/pilot/state", { credentials: "include", cache: "no-store" });
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        const data = (await response.json()) as StatePayload;
        if (cancelled) return;
        const next = data.suggestions ?? [];
        const ownProduct = data.profile?.product ?? "";
        const ownRegion = data.profile?.region ?? "";
        setProduct(ownProduct);
        setRegion(ownRegion);
        const stale =
          looksLikeCannedSuggestions(next) ||
          needsBetterSteps(next) ||
          needsCleanText(next, [ownProduct, ownRegion]);
        if (stale && !autoTried.current) {
          autoTried.current = true;
          const ok = await refreshFromAi();
          if (cancelled) return;
          if (!ok) setItems(next);
          return;
        }
        setItems(next);
      } catch {
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, refreshFromAi]);

  async function choose(index: number) {
    setChooseError("");
    setBusy(index);
    try {
      const response = await fetch("/api/pilot/choose", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (response.ok) {
        router.push("/dashboard");
        return;
      }
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      setChooseError(t("sugChooseFailed"));
    } catch {
      setChooseError(t("sugChooseFailed"));
    } finally {
      setBusy(null);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    setChooseError("");
    try {
      await refreshFromAi();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <PilotFormShell wide>
        <div className="flex min-h-[50vh] flex-col justify-center gap-2" role="status">
          <p className="text-sm font-medium">{t("sugLoad")}</p>
          <p className="text-xs text-muted-foreground">{t("sugWait")}</p>
        </div>
      </PilotFormShell>
    );
  }

  return (
    <PilotFormShell wide>
      <h1 className="display-2">{t("sugTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("sugLead", { product: product || "—", region: region || "—" })}
      </p>
      {usedAi === false ? <p className="mt-1 text-xs text-muted-foreground">{t("sugAiOff")}</p> : null}
      <ol className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {[t("sugFlow1"), t("sugFlow2"), t("sugFlow3")].map((label, index) => (
          <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary"
              aria-hidden
            >
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      {chooseError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {chooseError}
        </p>
      ) : null}
      <div className="mt-3">
        <button
          type="button"
          className="btn btn-ghost min-h-12"
          disabled={refreshing || busy !== null}
          onClick={() => void onRefresh()}
        >
          {refreshing ? t("sugRefreshing") : t("sugRefresh")}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("sugEmpty")}</p>
      ) : (
        <ol className="mt-6 grid gap-4">
          {items.map((item, i) => {
            const model = suggestionToRecommendation(item);
            return (
              <li key={`${item.title}-${i}`}>
                <AiRecommendationCard
                  model={model}
                  pathLabel={t("sugPathN", { n: i + 1, total: items.length })}
                  difficulty={item.difficulty}
                  difficultyLabel={t(`diff.${item.difficulty}`)}
                  sectionWhat={ta("what")}
                  sectionWhy={ta("why")}
                  sectionData={ta("data")}
                  sectionRisk={ta("risk")}
                  sectionNext={ta("next")}
                  sectionResult={ta("result")}
                  metricKnown={t("sugMonth", {
                    n: (model.forecastSomoni ?? 0).toLocaleString("ru-RU"),
                  })}
                  metricUnknown={t("sugMonthUnknown")}
                  doLabel={busy === i ? t("saving") : ta("do")}
                  seeWhyLabel={ta("seeWhy")}
                  changeLabel={ta("change")}
                  dismissLabel={ta("dismiss")}
                  busy={busy === i}
                  disabled={busy !== null || refreshing}
                  onDo={() => void choose(i)}
                  onChange={() => void onRefresh()}
                  onDismiss={() => setItems((rows) => rows.filter((_, index) => index !== i))}
                />
              </li>
            );
          })}
        </ol>
      )}
    </PilotFormShell>
  );
}
