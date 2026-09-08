"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Log = { id: string; action: string; createdAt: string };
type AiStatus = { state: "live" | "failed" | "missing"; model: string; detail: string };

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [profile, setProfile] = useState("");
  const [role, setRole] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkAi() {
    setChecking(true);
    try {
      const response = await fetch("/api/ai/status");
      setAi(response.ok ? ((await response.json()) as AiStatus) : null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: { firstName: string; lastName: string; email: string; phone: string; role?: string } }) => {
        if (d.user) {
          setProfile(`${d.user.firstName} ${d.user.lastName} · ${d.user.email} · ${d.user.phone}`);
          setRole(d.user.role || "");
        }
      })
      .catch(() => undefined);
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d: { logs?: Log[]; role?: string }) => {
        setLogs(d.logs ?? []);
        if (d.role) setRole(d.role);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <article className="card p-4">
        <h2 className="font-medium">{t("profile")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{profile}</p>
      </article>
      <article className="card p-4">
        <h2 className="font-medium">{t("plan")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("note")}</p>
      </article>
      <article className="card p-4">
        <h2 className="font-medium">{t("aiTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("aiLead")}</p>
        {ai ? (
          <p className="mt-2 text-sm">
            <span
              className={
                ai.state === "live"
                  ? "font-medium text-success"
                  : "font-medium text-destructive"
              }
            >
              {ai.state === "live" ? t("aiLive") : ai.state === "missing" ? t("aiMissing") : t("aiFailed")}
            </span>
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {ai.model}
              {ai.detail ? ` · ${ai.detail}` : ""}
            </span>
          </p>
        ) : null}
        <button type="button" className="btn btn-ghost mt-3 text-sm" onClick={() => void checkAi()} disabled={checking}>
          {checking ? t("aiChecking") : t("aiCheck")}
        </button>
      </article>
      <article className="card p-4">
        <h2 className="font-medium">{t("global")}</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>{t("currency")}</li>
          <li>{t("vat")}</li>
          <li>{t("tz")}</li>
        </ul>
      </article>
      <article className="card p-4">
        <h2 className="font-medium">{t("security")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("secRole")} {role ? `· ${role}` : ""}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t("secEnc")}</p>
      </article>
      <article className="card p-4">
        <h2 className="font-medium">{t("audit")}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {logs.length === 0 ? (
            <li className="text-muted-foreground">—</li>
          ) : (
            logs.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span className="font-mono">{l.action}</span>
                <span className="text-muted-foreground">{l.createdAt.slice(0, 16).replace("T", " ")}</span>
              </li>
            ))
          )}
        </ul>
      </article>
    </div>
  );
}
