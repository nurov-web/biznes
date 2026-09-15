"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell } from "@/components/pilot/PilotFormShell";
import { looksLikeCannedSuggestions } from "@/lib/pilot-suggestions";
import type { PilotDifficulty, PilotSuggestionItem } from "@/lib/store";

type StatePayload = {
  suggestions?: PilotSuggestionItem[];
  profile?: { product?: string; region?: string } | null;
};

export default function SuggestionsPage() {
  const t = useTranslations("pilot");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<PilotSuggestionItem[]>([]);
  const [product, setProduct] = useState("");
  const [region, setRegion] = useState("");
  const [usedAi, setUsedAi] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
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
        setProduct(data.profile?.product ?? "");
        setRegion(data.profile?.region ?? "");
        const stale = looksLikeCannedSuggestions(next);
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
    setBusy(index);
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
    setBusy(null);
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshFromAi();
    } finally {
      setRefreshing(false);
    }
  }

  const tone: Record<PilotDifficulty, string> = {
    easy: "text-muted-foreground",
    medium: "text-muted-foreground",
    hard: "text-foreground",
  };

  if (loading) {
    return (
      <PilotFormShell>
        <div className="flex min-h-[50vh] flex-col justify-center gap-2" role="status">
          <p className="text-sm font-medium">{t("sugLoad")}</p>
          <p className="text-xs text-muted-foreground">{t("sugWait")}</p>
        </div>
      </PilotFormShell>
    );
  }

  return (
    <PilotFormShell>
      <h1 className="display-2">{t("sugTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("sugLead", { product: product || "—", region: region || "—" })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("sugHonesty")}</p>
      {usedAi === false ? <p className="mt-2 text-xs text-muted-foreground">{t("sugAiOff")}</p> : null}
      <div className="mt-4">
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
        <ul className="mt-6 grid gap-3">
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`} className="card-raised p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold">{item.title}</h2>
                <span className={`chip shrink-0 text-xs ${tone[item.difficulty]}`}>
                  {t(`diff.${item.difficulty}`)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="num text-sm font-medium text-primary">
                  {item.potentialSomoni > 0
                    ? t("sugMonth", { n: item.potentialSomoni.toLocaleString("ru-RU") })
                    : t("sugMonthUnknown")}
                </p>
                <button
                  type="button"
                  className="btn btn-primary min-h-12"
                  disabled={busy !== null || refreshing}
                  onClick={() => void choose(i)}
                >
                  {busy === i ? t("saving") : t("sugPick")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PilotFormShell>
  );
}
