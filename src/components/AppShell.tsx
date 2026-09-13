"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { AppSidebar, MobileNav } from "@/components/AppSidebar";
import { ProfileMenu } from "@/components/shell/ProfileMenu";
import { EntryVeil } from "@/components/motion/EntryVeil";
import { EphemeralStoreBanner } from "@/components/dashboard/EphemeralStoreBanner";
import { usePathname, useRouter } from "@/i18n/navigation";
import { clearEntrySplash, markLoggedOut } from "@/lib/splash";
import { saveRememberedLogin } from "@/lib/remember-login";
import { LOGOUT_FLAG } from "@/constants";

type Me = {
  user: { firstName: string; lastName: string; email: string; phoneVerified: boolean };
  business: { onboardingDone: boolean; name: string; city: string } | null;
  hasPilotProfile?: boolean;
  ephemeralStore?: boolean;
  pilot?: { product: string; region: string } | null;
};

const ME_KEY = "bp_me_cache";

function isPilotPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/course");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [me, setMe] = useState<Me | null>(null);
  const pilot = isPilotPath(pathname);

  useEffect(() => {
    let cancelled = false;
    try {
      if (sessionStorage.getItem(LOGOUT_FLAG) === "1") {
        sessionStorage.removeItem(ME_KEY);
      } else {
        const raw = sessionStorage.getItem(ME_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as Me;
          if (cached?.user) {
            if (pilot && !cached.hasPilotProfile) {
              routerRef.current.replace("/has-business");
            } else if (!pilot && !cached.business?.onboardingDone && !cached.hasPilotProfile) {
              routerRef.current.replace("/has-business");
            } else {
              setMe(cached);
            }
          }
        }
      }
    } catch {
      /* холӣ */
    }

    async function loadMe(): Promise<void> {
      const pull = () => fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      let response = await pull();
      if (response.status === 401) {
        await new Promise((r) => setTimeout(r, 350));
        response = await pull();
      }
      if (cancelled) return;
      if (response.status === 401) {
        sessionStorage.removeItem(ME_KEY);
        routerRef.current.replace("/login");
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as Me;
      if (cancelled || !data?.user) return;
      if (pilot && !data.hasPilotProfile) {
        sessionStorage.removeItem(ME_KEY);
        routerRef.current.replace("/has-business");
        return;
      }
      sessionStorage.setItem(ME_KEY, JSON.stringify(data));
      setMe(data);
      saveRememberedLogin(data.user.email || "");
      void fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    }

    void loadMe().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pilot]);

  async function logout() {
    clearEntrySplash();
    markLoggedOut();
    sessionStorage.removeItem(ME_KEY);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include", cache: "no-store" });
    window.location.assign(`/${locale}/login`);
  }

  if (!me) {
    return <EntryVeil />;
  }

  if (pilot) {
    return (
      <div data-app className="flex min-h-screen w-full min-w-0 flex-col bg-surface">
        <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-[color:var(--dark-bg)]/90 pt-[max(0.625rem,env(safe-area-inset-top))] text-white backdrop-blur-xl">
          <div className="gutter-x flex w-full items-center justify-between gap-2 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-white">
                {me.pilot?.product || me.business?.name}
              </p>
              <p className="truncate text-xs text-dark-muted">
                {me.pilot?.region || me.business?.city}
              </p>
            </div>
            <div className="account-cluster">
              <LanguageSwitch className="seg-on-dark seg-bare" />
              <span className="account-cluster-rule" aria-hidden />
              <ProfileMenu
                firstName={me.user.firstName}
                lastName={me.user.lastName}
                businessName={me.pilot?.product ?? me.business?.name ?? ""}
                email={me.user.email}
                onDark
                onLogout={() => void logout()}
              />
            </div>
          </div>
        </header>
        <div className="min-w-0 flex-1 pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {me.ephemeralStore ? (
            <div className="gutter-x pt-4">
              <EphemeralStoreBanner show />
            </div>
          ) : null}
          {children}
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div data-app className="flex min-h-screen w-full min-w-0 bg-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 w-full min-w-0 border-b border-white/10 bg-[color:var(--dark-bg)]/90 pt-[max(0.625rem,env(safe-area-inset-top))] text-white backdrop-blur-xl">
          <div className="gutter-x flex w-full min-w-0 flex-wrap items-center justify-between gap-2 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-white">{me.business?.name}</p>
              <p className="truncate text-xs text-dark-muted">{me.business?.city}</p>
            </div>
            <div className="account-cluster">
              <LanguageSwitch className="seg-on-dark seg-bare" />
              <span className="account-cluster-rule" aria-hidden />
              <ProfileMenu
                firstName={me.user.firstName}
                lastName={me.user.lastName}
                businessName={me.business?.name ?? ""}
                email={me.user.email}
                onDark
                onLogout={() => void logout()}
              />
            </div>
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-x-clip pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {me.ephemeralStore ? (
            <div className="gutter-x pt-4">
              <EphemeralStoreBanner show />
            </div>
          ) : null}
          {children}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
