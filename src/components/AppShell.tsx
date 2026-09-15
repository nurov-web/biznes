"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ProfileMenu } from "@/components/shell/ProfileMenu";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { EntryVeil } from "@/components/motion/EntryVeil";
import { EphemeralStoreBanner } from "@/components/dashboard/EphemeralStoreBanner";
import { useRouter } from "@/i18n/navigation";
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

/** Як маҳсул: курс ва нақшаи фурӯш. Бе рейли панелҳои кӯҳна. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [me, setMe] = useState<Me | null>(null);

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
            if (!cached.hasPilotProfile) {
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
      if (!data.hasPilotProfile) {
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
  }, []);

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

  return (
    <div data-app className="flex min-h-screen w-full min-w-0 flex-col bg-background">
      <header className="hero-ink no-print sticky top-0 z-20 w-full border-b border-white/10 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="gutter-x flex w-full items-center justify-between gap-2 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLockup size={28} dark />
            {me.pilot?.product ? (
              <p className="hidden min-w-0 truncate text-sm text-dark-muted sm:block">
                {me.pilot.product}
                {me.pilot.region ? ` · ${me.pilot.region}` : ""}
              </p>
            ) : null}
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
      <div className="min-w-0 flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {me.ephemeralStore ? (
          <div className="gutter-x pt-4">
            <EphemeralStoreBanner show />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
