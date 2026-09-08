"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { AppSidebar, MobileNav } from "@/components/AppSidebar";
import { useRouter } from "@/i18n/navigation";

type Me = {
  user: { firstName: string; lastName: string; phoneVerified: boolean };
  business: { onboardingDone: boolean; name: string; city: string } | null;
};

function initials(first: string, last: string): string {
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json() as Promise<Me>;
      })
      .then((data) => {
        if (!data) return;
        if (!data.business?.onboardingDone) {
          router.replace("/onboarding");
          return;
        }
        setMe(data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!me) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          {t("dashboard")}…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{me.business?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{me.business?.city}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
              title={`${me.user.firstName} ${me.user.lastName}`}
            >
              {initials(me.user.firstName, me.user.lastName)}
            </span>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              onClick={logout}
              aria-label={t("logout")}
              title={t("logout")}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </header>
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
