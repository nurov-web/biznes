"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { AppSidebar, MobileNav } from "@/components/AppSidebar";
import { ProfileMenu } from "@/components/shell/ProfileMenu";
import { EntryVeil } from "@/components/motion/EntryVeil";
import { useRouter } from "@/i18n/navigation";
import { clearEntrySplash } from "@/lib/splash";

type Me = {
  user: { firstName: string; lastName: string; phoneVerified: boolean };
  business: { onboardingDone: boolean; name: string; city: string } | null;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          routerRef.current.replace("/login");
          return null;
        }
        if (!r.ok) return null;
        return r.json() as Promise<Me>;
      })
      .then((data) => {
        if (cancelled || !data) return;
        if (!data.business?.onboardingDone) {
          routerRef.current.replace("/onboarding");
          return;
        }
        setMe(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    clearEntrySplash();
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (!me) {
    return <EntryVeil />;
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 w-full min-w-0 border-b border-border bg-background/85 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="gutter-x flex w-full min-w-0 flex-wrap items-center justify-between gap-2 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{me.business?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{me.business?.city}</p>
            </div>
            <div className="flex w-max max-w-full flex-none items-center justify-end gap-1.5 sm:gap-2">
              <LanguageSwitch />
              <ProfileMenu
                firstName={me.user.firstName}
                lastName={me.user.lastName}
                businessName={me.business?.name ?? ""}
                onLogout={() => void logout()}
              />
            </div>
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-x-clip pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
