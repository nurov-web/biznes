"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormErrorSummary } from "@/components/FormErrorSummary";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const tl = useTranslations("landing");
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ login?: string; password?: string }>({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    setBusy(false);
    if (!response.ok) {
      const message = t("badCreds");
      setSummary(message);
      setFieldErrors({ login: message, password: message });
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell
      title={t("loginTitle")}
      lead={t("loginLead")}
      points={[tl("p1d"), tl("p3d"), tl("p4d")]}
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
            autoComplete="username"
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
  );
}
