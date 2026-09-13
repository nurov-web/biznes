"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FormErrorSummary } from "@/components/FormErrorSummary";
import { AuthShell } from "@/components/auth/AuthShell";
import { EntryVeil } from "@/components/motion/EntryVeil";
import { readRememberedLogin, saveRememberedLogin } from "@/lib/remember-login";
import { consumeLoggedOut } from "@/lib/splash";
import { safeNextPath } from "@/lib/safe-next";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const tl = useTranslations("landing");
  const locale = useLocale();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ login?: string; password?: string }>({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const saved = readRememberedLogin();
    if (saved) setLogin(saved);
    if (consumeLoggedOut()) return;
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (!cancelled && r.ok) {
          setLeaving(true);
          const data = (await r.json()) as { hasPilotProfile?: boolean };
          const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
          window.location.assign(
            `/${locale}/${data.hasPilotProfile ? "dashboard" : next || "has-business"}`,
          );
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  function validate(): boolean {
    const next: { login?: string; password?: string } = {};
    if (!login.trim()) next.login = t("emailRequired");
    if (!password) next.password = t("passwordRequired");
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSummary("");
    if (!validate()) {
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    setBusy(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
      setBusy(false);
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      const message = payload.error === "rate" ? t("rateLimit") : t("badCreds");
      setSummary(message);
      setFieldErrors({ login: message, password: message });
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    setLeaving(true);
    saveRememberedLogin(login);
    const data = (await response.json().catch(() => ({}))) as { hasPilotProfile?: boolean };
    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    window.location.assign(`/${locale}/${data.hasPilotProfile ? "dashboard" : next || "has-business"}`);
  }

  return (
    <>
      {leaving ? <EntryVeil /> : null}
      <AuthShell
        title={t("loginTitle")}
        lead={t("loginLead")}
        points={[tl("what1"), tl("what2"), tl("what3")]}
        footer={
          <p className="mt-6 text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {tn("register")}
            </Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <FormErrorSummary
            title={t("errorSummary")}
            items={summary ? [{ id: "login", message: summary }] : []}
          />
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="login">
            {t("loginHint")}
            <input
              id="login"
              className={`input-field ${fieldErrors.login ? "input-error" : ""}`}
              autoComplete="email"
              value={login}
              aria-invalid={Boolean(fieldErrors.login)}
              aria-describedby={fieldErrors.login ? "login-error" : undefined}
              onChange={(e) => {
                setLogin(e.target.value);
                setFieldErrors((f) => ({ ...f, login: undefined }));
              }}
            />
            {fieldErrors.login ? (
              <span id="login-error" className="font-normal text-destructive">
                {fieldErrors.login}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="password">
            {t("password")}
            <input
              id="password"
              className={`input-field ${fieldErrors.password ? "input-error" : ""}`}
              type="password"
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
            />
            {fieldErrors.password ? (
              <span id="password-error" className="font-normal text-destructive">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>
          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            {busy ? t("pleaseWait") : t("loginSubmit")}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
