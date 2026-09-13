"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell } from "@/components/pilot/PilotFormShell";
import type { PilotDifficulty, PilotSuggestionItem } from "@/lib/store";

export default function SuggestionsPage() {
  const t = useTranslations("pilot");
  const router = useRouter();
  const [items, setItems] = useState<PilotSuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pilot/state", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login");
          return;
        }
        const data = (await r.json()) as { suggestions?: PilotSuggestionItem[] };
        if (!cancelled) setItems(data.suggestions ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

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

  const tone: Record<PilotDifficulty, string> = {
    easy: "text-muted-foreground",
    medium: "text-muted-foreground",
    hard: "text-foreground",
  };

  if (loading) {
    return (
      <PilotFormShell>
        <div className="flex min-h-[50vh] flex-col justify-center gap-2">
          <p className="text-sm font-medium">{t("sugLoad")}</p>
          <p className="text-xs text-muted-foreground">{t("sugWait")}</p>
        </div>
      </PilotFormShell>
    );
  }

  return (
    <PilotFormShell>
      <h1 className="display-2">{t("sugTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("sugLead")}</p>
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
                  {t("sugMonth", { n: item.potentialSomoni.toLocaleString("ru-RU") })}
                </p>
                <button
                  type="button"
                  className="btn btn-primary min-h-12"
                  disabled={busy !== null}
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
