"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormErrorSummary } from "@/components/FormErrorSummary";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tn = useTranslations("nav");
  const tl = useTranslations("landing");
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+992",
    email: "",
    password: "",
    offerAccepted: false,
  });
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [field, setField] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const items: { id: string; message: string }[] = [];
    if (!form.firstName.trim()) {
      next.firstName = t("required");
      items.push({ id: "firstName", message: t("required") });
    }
    if (!form.lastName.trim()) {
      next.lastName = t("required");
      items.push({ id: "lastName", message: t("required") });
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = t("emailInvalid");
      items.push({ id: "email", message: t("emailInvalid") });
    }
    if (form.password.length < 8) {
      next.password = t("passwordShort");
      items.push({ id: "password", message: t("passwordShort") });
    }
    if (form.phone.replace(/\D/g, "").length < 9) {
      next.phone = t("phoneInvalid");
      items.push({ id: "phone", message: t("phoneInvalid") });
    }
    if (!form.offerAccepted) {
      next.offer = t("offerRequired");
      items.push({ id: "offer", message: t("offerRequired") });
    }
    setField(next);
    setErrors(items);
    return items.length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) {
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    setBusy(true);
    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, offerAccepted: true }),
      });
    } catch {
      setBusy(false);
      const message = t("server");
      setErrors([{ id: "register-form", message }]);
      setField({});
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    let data: { error?: string; fields?: Record<string, string> } = {};
    try {
      data = (await response.json()) as { error?: string; fields?: Record<string, string> };
    } catch {
      data = { error: "server" };
    }
    setBusy(false);
    if (!response.ok) {
      if (data.error === "user_exists") {
        const message = t("userExists");
        setErrors([{ id: "email", message }]);
        setField({ email: message, phone: message });
      } else if (data.error === "config" || data.error === "storage") {
        const message = t("serverSetup");
        setErrors([{ id: "register-form", message }]);
        setField({});
      } else if (data.error === "validation") {
        const next: Record<string, string> = {};
        const items: { id: string; message: string }[] = [];
        const fields = data.fields ?? {};
        for (const key of Object.keys(fields)) {
          const message = key === "email" ? t("emailInvalid") : key === "phone" ? t("phoneInvalid") : t("required");
          next[key] = message;
          items.push({ id: key, message });
        }
        if (items.length === 0) {
          items.push({ id: "register-form", message: t("errorSummary") });
        }
        setField(next);
        setErrors(items);
      } else {
        const message = t("server");
        setErrors([{ id: "register-form", message }]);
        setField({});
      }
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    router.push("/onboarding");
  }

  return (
    <AuthShell
      title={t("registerTitle")}
      lead={t("registerLead")}
      points={[tl("q1a"), tl("is2"), tl("not3")]}
      footer={
        <p className="mt-6 text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {tn("login")}
          </Link>
        </p>
      }
    >
      <form id="register-form" onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <FormErrorSummary title={t("errorSummary")} items={errors} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium" htmlFor="firstName">
            {t("firstName")}
            <input
              id="firstName"
              className={`input-field ${field.firstName ? "input-error" : ""}`}
              autoComplete="given-name"
              value={form.firstName}
              aria-invalid={Boolean(field.firstName)}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("lastName")}
            <input
              className={`input-field ${field.lastName ? "input-error" : ""}`}
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="phone">
          {t("phone")}
          <input
            id="phone"
            className={`input-field ${field.phone ? "input-error" : ""}`}
            autoComplete="tel"
            value={form.phone}
            aria-invalid={Boolean(field.phone)}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {field.phone ? <span className="font-normal text-destructive">{field.phone}</span> : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="email">
          {t("email")}
          <input
            id="email"
            className={`input-field ${field.email ? "input-error" : ""}`}
            type="email"
            autoComplete="email"
            value={form.email}
            aria-invalid={Boolean(field.email)}
            aria-describedby={field.email ? "email-error" : undefined}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {field.email ? (
            <span id="email-error" className="font-normal text-destructive">
              {field.email}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="reg-password">
          {t("password")}
          <input
            id="reg-password"
            className={`input-field ${field.password ? "input-error" : ""}`}
            type="password"
            autoComplete="new-password"
            value={form.password}
            aria-invalid={Boolean(field.password)}
            aria-describedby={field.password ? "reg-password-error" : undefined}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {field.password ? (
            <span id="reg-password-error" className="font-normal text-destructive">
              {field.password}
            </span>
          ) : null}
        </label>
        <label id="offer" className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[color:var(--primary)]"
            checked={form.offerAccepted}
            onChange={(e) => setForm({ ...form, offerAccepted: e.target.checked })}
          />
          <span className="leading-relaxed">{t("offer")}</span>
        </label>
        {field.offer ? <p className="text-sm text-destructive">{field.offer}</p> : null}
        <button className="btn btn-primary w-full" type="submit" disabled={busy}>
          {busy ? t("pleaseWait") : t("submit")}
        </button>
      </form>
    </AuthShell>
  );
}
