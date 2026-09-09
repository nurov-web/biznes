"use client";

import { useCallback, useEffect, useState } from "react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { AppSidebar, MobileNav } from "@/components/AppSidebar";
import { ProfileMenu } from "@/components/shell/ProfileMenu";
import { EntryVeil } from "@/components/motion/EntryVeil";
import { WelcomeSplash } from "@/components/motion/WelcomeSplash";
import { useRouter } from "@/i18n/navigation";
import {
  clearEntrySplash,
  hasPlayedEntrySplash,
  markEntrySplashPlayed,
} from "@/lib/splash";

type Me = {
  user: { firstName: string; lastName: string; phoneVerified: boolean };
  business: { onboardingDone: boolean; name: string; city: string } | null;
};

type Gate = "boot" | "splash" | "app";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [gate, setGate] = useState<Gate>("boot");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json() as Promise<Me>;
      })
      .then((data) => {
        if (cancelled || !data) return;
        if (!data.business?.onboardingDone) {
          router.replace("/onboarding");
          return;
        }
        setMe(data);
        setGate(hasPlayedEntrySplash() ? "app" : "splash");
      })
      .catch(() => router.replace("/login"));
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSplashDone = useCallback(() => {
    markEntrySplashPlayed();
    setGate("app");
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
    <>
      <div
        className={`flex min-h-screen w-full min-w-0 overflow-x-clip bg-surface ${
          gate === "splash" ? "pointer-events-none" : ""
        }`}
        aria-hidden={gate === "splash"}
        inert={gate === "splash" ? true : undefined}
      >
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex w-full min-w-0 items-center justify-between gap-2 overflow-x-clip border-b border-border bg-background/85 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl gutter-x">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{me.business?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{me.business?.city}</p>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
              <LanguageSwitch />
              <ProfileMenu
                firstName={me.user.firstName}
                lastName={me.user.lastName}
                businessName={me.business?.name ?? ""}
                onLogout={() => void logout()}
              />
            </div>
          </header>
          <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
        </div>
        <MobileNav />
      </div>
      {gate === "splash" ? <WelcomeSplash onDone={onSplashDone} /> : null}
    </>
  );
}
