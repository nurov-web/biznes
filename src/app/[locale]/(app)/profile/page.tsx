"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Boxes, GraduationCap, LayoutDashboard, Percent, Plug, Settings, Wallet } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { MarketScanCard } from "@/components/market/MarketScanCard";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";

type Me = {
  user: { firstName: string; lastName: string; email: string; phone: string; role: string };
  business: { name: string; city: string; type?: string; typeNote?: string; goal?: string } | null;
};

export default function ProfilePage() {
  const t = useTranslations("profilePage");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Me | null) => setMe(data))
      .catch(() => undefined);
  }, [locale]);

  const shortcuts = [
    { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
    { href: "/learn", key: "learn" as const, icon: GraduationCap },
    { href: "/market", key: "market" as const, icon: Boxes },
    { href: "/pricing", key: "pricing" as const, icon: Percent },
    { href: "/finance", key: "finance" as const, icon: Wallet },
    { href: "/integrations", key: "integrations" as const, icon: Plug },
    { href: "/settings", key: "settings" as const, icon: Settings },
  ];

  return (
    <PageShell title={t("title")} lead={t("lead")}>
      <Reveal stagger className="grid gap-4 md:grid-cols-2">
        <article className="card-raised p-5">
          <p className="eyebrow text-primary">{t("account")}</p>
          <p className="mt-3 text-lg font-semibold">
            {me ? `${me.user.firstName} ${me.user.lastName}` : "…"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{me?.user.email}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{me?.user.phone}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{me?.user.role}</p>
        </article>
        <article className="card-raised p-5">
          <p className="eyebrow text-primary">{t("business")}</p>
          <p className="mt-3 text-lg font-semibold">{me?.business?.name ?? "—"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{me?.business?.city}</p>
        </article>
      </Reveal>

      <Reveal className="mt-2">
        <p className="eyebrow text-primary">{t("shortcuts")}</p>
        <nav className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card flex min-h-14 items-center gap-2.5 px-3 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <item.icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
              {tn(item.key)}
            </Link>
          ))}
        </nav>
      </Reveal>

      {me?.business ? (
        <MarketScanCard
          city={me.business.city}
          type={me.business.type ?? "trade"}
          goal={me.business.goal || me.business.typeNote}
        />
      ) : null}
    </PageShell>
  );
}
