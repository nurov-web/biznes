"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormErrorSummary } from "@/components/FormErrorSummary";

export default function VerifyPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDevCode(sessionStorage.getItem("bp:devCode") || "");
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (!response.ok) {
      setError(t("badCode"));
      return;
    }
    sessionStorage.removeItem("bp:devCode");
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">{t("verifyTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("verifyHint")}</p>
      {devCode ? (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-sm">
          {t("devCode")}: {devCode}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <FormErrorSummary
          title={t("errorSummary")}
          items={error ? [{ id: "code", message: error }] : []}
        />
        <label className="grid gap-1 text-sm font-medium" htmlFor="code">
          {t("code")}
          <input
            id="code"
            className="input-field font-mono"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary w-full" type="submit" disabled={busy}>
          {t("verify")}
        </button>
      </form>
    </div>
  );
}
