"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PilotFormShell } from "@/components/pilot/PilotFormShell";
import { PILOT_INTERESTS, PILOT_TIME } from "@/constants/pilot";

export default function StartBusinessPage() {
  const t = useTranslations("pilot");
  const locale = useLocale();
  const router = useRouter();
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState(5000);
  const [time, setTime] = useState("");
  const [skills, setSkills] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggle(item: string) {
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, interests, budget, time, skills, region }),
      });
      if (response.status === 401) {
        router.push("/register");
        return;
      }
      if (!response.ok) {
        setError(t("saveError"));
        return;
      }
      router.push("/suggestions");
    } catch {
      setError(t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PilotFormShell>
      <h1 className="display-2">{t("stepOf", { current: 1, total: 2 })} — {t("aboutYou")}</h1>
      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <fieldset className="mt-6 grid gap-2">
        <legend className="text-sm font-medium">{t("interests")}</legend>
        {PILOT_INTERESTS.map((item) => (
          <label key={item} className="flex min-h-12 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[color:var(--primary)]"
              checked={interests.includes(item)}
              onChange={() => toggle(item)}
            />
            {t(`cats.${item}`)}
          </label>
        ))}
      </fieldset>
      <label className="mt-6 grid gap-2 text-sm font-medium">
        {t("budget", { n: budget.toLocaleString("ru-RU") })}
        <input
          type="range"
          min={500}
          max={50000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <span className="flex justify-between text-xs font-normal text-muted-foreground">
          <span>{t("budgetMin")}</span>
          <span>{t("budgetMax")}</span>
        </span>
      </label>
      <fieldset className="mt-6 grid gap-2">
        <legend className="text-sm font-medium">{t("time")}</legend>
        {PILOT_TIME.map((item) => (
          <label key={item} className="flex min-h-12 items-center gap-2 text-sm">
            <input
              type="radio"
              name="time"
              className="h-4 w-4 accent-[color:var(--primary)]"
              checked={time === item}
              onChange={() => setTime(item)}
            />
            {t(`times.${item}`)}
          </label>
        ))}
      </fieldset>
      <label className="mt-6 grid gap-1.5 text-sm font-medium">
        {t("skills")}
        <input
          className="input-field min-h-12"
          value={skills}
          placeholder={t("skillsPh")}
          onChange={(e) => setSkills(e.target.value)}
        />
      </label>
      <label className="mt-4 grid gap-1.5 text-sm font-medium">
        {t("region")}
        <input
          className="input-field min-h-12"
          value={region}
          placeholder={t("regionPh")}
          onChange={(e) => setRegion(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn btn-primary mt-6 min-h-12 w-full"
        disabled={busy || interests.length === 0 || !time || !region.trim()}
        onClick={() => void submit()}
      >
        {busy ? t("saving") : t("ideas")}
      </button>
    </PilotFormShell>
  );
}
